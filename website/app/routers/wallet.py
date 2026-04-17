"""
SwisTrade — Wallet Router
Deposits (crypto + bank wire), withdrawals, internal transfers.
All operations create transaction records for audit.
"""

from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status, Query
import hashlib
import secrets

from app.middleware.auth import get_current_user
from app.models.user import User
from app.models.wallet import Wallet
from app.models.account import TradingAccount
from app.models.transaction import Transaction, TransactionType, TransactionMethod, TransactionStatus
from app.schemas.account import (
    WalletResponse, DepositRequest, WithdrawRequest,
    InternalTransferRequest, TransactionResponse, TransactionListResponse,
)

router = APIRouter(prefix="/wallet", tags=["Wallet & Transactions"])


def _generate_memo_tag(user_id: str) -> str:
    """Generate unique memo tag for crypto deposits."""
    return hashlib.sha256(f"ST-{user_id}-{secrets.token_hex(4)}".encode()).hexdigest()[:12].upper()


def _txn_to_response(txn: Transaction) -> TransactionResponse:
    return TransactionResponse(
        id=str(txn.id),
        type=txn.type.value,
        method=txn.method.value,
        status=txn.status.value,
        amount=txn.amount,
        currency=txn.currency,
        crypto_txn_hash=txn.crypto_txn_hash,
        memo_tag=txn.memo_tag,
        from_account_id=str(txn.from_account_id) if txn.from_account_id else None,
        to_account_id=str(txn.to_account_id) if txn.to_account_id else None,
        admin_notes=txn.admin_notes,
        created_at=txn.created_at.isoformat(),
    )


async def _get_or_create_wallet(user: User) -> Wallet:
    """Get user's wallet or create one."""
    wallet = await Wallet.find_one(Wallet.user_id == user.id)
    if not wallet:
        wallet = Wallet(user_id=user.id)
        await wallet.insert()
    return wallet


@router.get("/", response_model=WalletResponse)
async def get_wallet(user: User = Depends(get_current_user)):
    """Get the user's wallet balance and totals."""
    wallet = await _get_or_create_wallet(user)
    return WalletResponse(
        id=str(wallet.id),
        balance=round(wallet.balance, 2),
        currency=wallet.currency,
        total_deposited=round(wallet.total_deposited, 2),
        total_withdrawn=round(wallet.total_withdrawn, 2),
        total_transferred=round(wallet.total_transferred, 2),
    )


@router.get("/memo-tag")
async def get_memo_tag(user: User = Depends(get_current_user)):
    """
    Get the user's unique memo tag for crypto deposits.
    User sends crypto to platform address with this memo tag.
    """
    memo = _generate_memo_tag(str(user.id))
    from app.config import settings
    return {
        "memo_tag": memo,
        "btc_address": settings.platform_btc_address,
        "eth_address": settings.platform_eth_address,
        "usdt_address": settings.platform_usdt_address,
        "instructions": "Send crypto to the address above and include your memo tag. Admin will verify and credit your wallet.",
    }


@router.post("/deposit", response_model=TransactionResponse, status_code=status.HTTP_201_CREATED)
async def request_deposit(
    data: DepositRequest,
    user: User = Depends(get_current_user),
):
    """
    Request a deposit. Creates a PENDING transaction.
    For crypto: user provides txn hash + memo. Admin verifies and approves.
    For bank wire: admin manually verifies and approves.
    """
    wallet = await _get_or_create_wallet(user)

    method_map = {
        "crypto_btc": TransactionMethod.CRYPTO_BTC,
        "crypto_eth": TransactionMethod.CRYPTO_ETH,
        "crypto_usdt": TransactionMethod.CRYPTO_USDT,
        "bank_wire": TransactionMethod.BANK_WIRE,
    }

    txn = Transaction(
        user_id=user.id,
        type=TransactionType.DEPOSIT,
        method=method_map[data.method],
        status=TransactionStatus.PENDING,
        amount=data.amount,
        crypto_txn_hash=data.crypto_txn_hash,
        memo_tag=data.memo_tag or _generate_memo_tag(str(user.id)),
        from_address=data.from_address,
    )
    await txn.insert()

    # Notify admin
    from app.services.notification_service import notify_deposit_request
    await notify_deposit_request(user.id, data.amount, data.method, txn.id)

    return _txn_to_response(txn)


@router.post("/withdraw", response_model=TransactionResponse, status_code=status.HTTP_201_CREATED)
async def request_withdrawal(
    data: WithdrawRequest,
    user: User = Depends(get_current_user),
):
    """
    Request a withdrawal from wallet. Admin approves.
    Checks sufficient balance before creating request.
    """
    wallet = await _get_or_create_wallet(user)

    if wallet.balance < data.amount:
        raise HTTPException(status_code=400, detail="Insufficient wallet balance")

    # Check no pending withdrawal for same amount (prevent double-submit)
    pending = await Transaction.find(
        Transaction.user_id == user.id,
        Transaction.type == TransactionType.WITHDRAWAL,
        Transaction.status == TransactionStatus.PENDING,
    ).count()
    if pending > 0:
        raise HTTPException(
            status_code=400,
            detail="You already have a pending withdrawal request",
        )

    method_map = {
        "crypto_btc": TransactionMethod.CRYPTO_BTC,
        "crypto_eth": TransactionMethod.CRYPTO_ETH,
        "crypto_usdt": TransactionMethod.CRYPTO_USDT,
        "bank_wire": TransactionMethod.BANK_WIRE,
    }

    # Hold the amount (deduct from wallet immediately, refund if rejected)
    wallet.balance -= data.amount
    wallet.updated_at = datetime.now(timezone.utc)
    await wallet.save()

    txn = Transaction(
        user_id=user.id,
        type=TransactionType.WITHDRAWAL,
        method=method_map[data.method],
        status=TransactionStatus.PENDING,
        amount=data.amount,
    )
    await txn.insert()

    # Notify admin
    from app.services.notification_service import notify_withdrawal_request
    await notify_withdrawal_request(user.id, data.amount, data.method, txn.id)

    return _txn_to_response(txn)


@router.post("/transfer", response_model=TransactionResponse, status_code=status.HTTP_201_CREATED)
async def internal_transfer(
    data: InternalTransferRequest,
    user: User = Depends(get_current_user),
):
    """
    Transfer funds between wallet and trading account.
    wallet_to_account: Wallet → Account (funds the account)
    account_to_wallet: Account → Wallet (withdraw from account)
    """
    wallet = await _get_or_create_wallet(user)

    # Verify account belongs to user
    account = await TradingAccount.get(data.account_id)
    if not account or account.user_id != user.id:
        raise HTTPException(status_code=404, detail="Account not found")

    if account.status != "active":
        raise HTTPException(status_code=400, detail="Account is not active")

    if data.direction == "wallet_to_account":
        # Check wallet balance
        if wallet.balance < data.amount:
            raise HTTPException(status_code=400, detail="Insufficient wallet balance")

        # Check no open trades if transferring out might affect margin
        # (Allow funding, it's safe)

        # Execute transfer
        wallet.balance -= data.amount
        wallet.total_transferred += data.amount
        account.balance += data.amount
        account.equity += data.amount
        account.free_margin += data.amount

        # Mark account as funded on first deposit
        if not account.is_funded:
            account.is_funded = True
            account.initial_deposit = data.amount

    elif data.direction == "account_to_wallet":
        # Check account free margin (can't withdraw margin locked in trades)
        available = account.balance - account.margin_used
        if available < data.amount:
            raise HTTPException(
                status_code=400,
                detail=f"Insufficient free margin. Available: ${available:.2f}",
            )

        # Execute transfer
        account.balance -= data.amount
        account.equity -= data.amount
        account.free_margin -= data.amount
        wallet.balance += data.amount
        wallet.total_transferred += data.amount
    else:
        raise HTTPException(status_code=400, detail="Invalid transfer direction")

    # Save both
    wallet.updated_at = datetime.now(timezone.utc)
    account.updated_at = datetime.now(timezone.utc)
    await wallet.save()
    await account.save()

    # Record transaction
    txn = Transaction(
        user_id=user.id,
        type=TransactionType.INTERNAL_TRANSFER,
        method=TransactionMethod.INTERNAL,
        status=TransactionStatus.COMPLETED,
        amount=data.amount,
        from_account_id=wallet.id if data.direction == "wallet_to_account" else account.id,
        to_account_id=account.id if data.direction == "wallet_to_account" else wallet.id,
    )
    await txn.insert()

    return _txn_to_response(txn)


@router.get("/transactions", response_model=TransactionListResponse)
async def list_transactions(
    user: User = Depends(get_current_user),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    type_filter: str = Query(None, alias="type"),
    status_filter: str = Query(None, alias="status"),
):
    """List all transactions for the user with pagination."""
    query = Transaction.find(Transaction.user_id == user.id)

    if type_filter:
        query = query.find(Transaction.type == type_filter)
    if status_filter:
        query = query.find(Transaction.status == status_filter)

    total = await query.count()
    skip = (page - 1) * per_page
    transactions = await query.sort("-created_at").skip(skip).limit(per_page).to_list()

    return TransactionListResponse(
        transactions=[_txn_to_response(t) for t in transactions],
        total=total,
        page=page,
        per_page=per_page,
    )
