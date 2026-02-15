# Conclusion Plan: Receipt & Transactions System Implementation

This document summarizes the current state analysis and required changes for implementing:

1. Real purchase flow (replacing mock with backend API)
2. Receipt display in frontend (via enhanced Transaction model)
3. Transactions history page with receipt modal

---

## 1. Current Backend Capabilities and Gaps

### Current Capabilities

#### Prisma Schema ([`back/prisma/schema.prisma`](back/prisma/schema.prisma:1))

- **User Model**: Supports CUSTOMER, BUSINESS, ADMIN user types
- **Wallet Model**: Supports multi-wallet per user, primary wallet flag, Decimal balance
- **Transaction Model**: Supports TRANSFER, DEPOSIT, WITHDRAW, PURCHASE, REFUND, ADMIN_ADJUSTMENT transaction types with OWN_WALLET and P2P transfer types
- **LedgerEntry Model**: Tracks balance changes with WITHDRAW, DEPOSIT, P2P, PURCHASE, REFUND ledger types
- **Invoice Model**: Defined for future billing/requesting payment use cases
- **PaymentIntent Model**: Defined for future card/top-up payments

#### Transaction Service ([`back/src/modules/transaction/transaction.service.ts`](back/src/modules/transaction/transaction.service.ts:1))

- [`transferFunds()`](back/src/modules/transaction/transaction.service.ts:22) - P2P and OWN_WALLET transfers with atomic transactions
- [`withdrawFunds()`](back/src/modules/transaction/transaction.service.ts:120) - External withdrawals
- [`depositFunds()`](back/src/modules/transaction/transaction.service.ts:185) - External deposits
- [`getTransactionByPublicId()`](back/src/modules/transaction/transaction.service.ts:253) - Fetch by public ID
- [`getWalletTransactions()`](back/src/modules/transaction/transaction.service.ts:265) - Transaction history
- [`getWalletLedger()`](back/src/modules/transaction/transaction.service.ts:276) - Ledger entries

#### Transaction Routes ([`back/src/modules/transaction/transaction.route.ts`](back/src/modules/transaction/transaction.route.ts:1))

- `POST /transaction/transfer` - Transfer funds
- `POST /wallet/:id/withdraw` - Withdraw funds
- `POST /wallet/:id/deposit` - Deposit funds
- `GET /transaction/:id` - Get by ID
- `GET /transaction/public/:publicId` - Get by public ID
- `GET /transactions/wallet/:id` - Wallet transaction history
- `GET /ledger/wallet/:id` - Wallet ledger

### Identified Gaps

| Gap                      | Description                                                                                                      | Priority |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------- | -------- |
| **No Purchase Endpoint** | No backend endpoint for business purchases                                                                       | High     |
| **No Receipt System**    | No way to generate/view transaction receipts                                                                     | High     |
| **Mock OTP in Frontend** | [`PurchaseModal.tsx`](front/src/modals/PurchaseModal.tsx:127) uses mock OTP instead of real backend verification | High     |
| **No Transaction Page**  | Frontend has no dedicated transactions listing page                                                              | Medium   |
| **No Receipt Modal**     | No UI component to display transaction receipts                                                                  | Medium   |
| **No Product API**       | Products are hardcoded, no backend product management                                                            | Medium   |

---

## 2. Required Backend Changes

### 2.1 Prisma Schema Changes - ENHANCE Transaction Model (Not Separate Receipt)

> **Decision**: Instead of a separate Receipt model, we will enhance the existing Transaction model with optional fields. The "receipt" is a **presentation layer concept** - the backend stores it as transaction metadata.

Add optional fields to Transaction model:

```prisma
model Transaction {
  id               Int               @id @default(autoincrement())
  publicId         String            @unique @default(cuid())
  status           TransactionStatus
  transactionType  TransactionType
  transferType     TransferType?
  amount           Decimal           @db.Decimal(18, 2)
  payerWalletId    Int
  receiverWalletId Int?
  createdAt        DateTime          @default(now())

  // NEW: Enhanced fields for purchase/receipt functionality
  description      String?           // Product name, merchant info, etc.
  metadata         Json?             // Flexible storage for receipt-specific data

  payerWallet      Wallet            @relation("PayerWallet", fields: [payerWalletId], references: [id])
  receiverWallet   Wallet?           @relation("ReceiverWallet", fields: [receiverWalletId], references: [id])
  ledgerEntries    LedgerEntry[]
}
```

**Rationale**: The Transaction already has all the data needed for a receipt (publicId, amount, type, date, payer/receiver wallet info). We just need `description` and `metadata` to store product/merchant details.

### 2.2 Business User Lookup - TEMPORARY IMPLEMENTATION

> **Note**: This is a temporary/hardcoded solution. Mark clearly in code for future replacement.

Find the BUSINESS user for purchase transactions:

```typescript
// TEMPORARY: Find first BUSINESS user
// TODO: Replace with proper business merchant lookup (config, cached, or dedicated endpoint)
const findBusinessUser = async () => {
	const businessUser = await prisma.user.findFirst({
		where: { userType: "BUSINESS" },
		include: { wallets: true },
	});

	if (!businessUser) {
		throw new Error("No business user configured");
	}

	// Find primary wallet, fallback to first wallet
	const primaryWallet = businessUser.wallets.find((w) => w.primary);
	const targetWallet = primaryWallet || businessUser.wallets[0];

	if (!targetWallet) {
		throw new Error("Business user has no wallet");
	}

	return {
		user: businessUser,
		wallet: targetWallet,
	};
};
```

#### Purchase Endpoint

**Route**: `POST /transaction/purchase`

**Request Body**:

```typescript
{
  fromWalletId: number;
  toUserId: number;        // Business user ID
  amount: number;
  productId?: string;
  productName?: string;
  otpCode: string;
}
```

**Response**:

```typescript
{
	transaction: Transaction;
	receipt: Receipt;
	message: string;
}
```

#### Get Receipt Endpoint

**Route**: `GET /transaction/:id/receipt`

**Response**:

```typescript
{
  receipt: Receipt;
  transaction: Transaction;
  payerWallet: Wallet;
  receiverWallet?: Wallet;
}
```

#### Verify OTP for Transaction

**Route**: `POST /transaction/verify-otp`

**Request Body**:

```typescript
{
	phoneNumber: string;
	otpCode: string;
	purpose: "VERIFY_TRANSACTION";
}
```

### 2.3 New Service Methods

In [`transaction.service.ts`](back/src/modules/transaction/transaction.service.ts):

1. **purchaseFromBusiness()** - Handle purchase with OTP verification (includes business user lookup)
2. **findBusinessUser()** - TEMPORARY: Find first BUSINESS user and their wallet
3. No separate receipt service needed - data stored on Transaction

---

## 3. Required Frontend Changes

### 3.1 Toast Notifications

The project already uses Sonner for toasts ([`front/src/components/ui/sonner.tsx`](front/src/components/ui/sonner.tsx:1)). Update [`PurchaseModal.tsx`](front/src/modals/PurchaseModal.tsx:169) to:

- Use proper toast.success() on purchase completion
- Use toast.error() on purchase failure
- Replace mock OTP with real API call

**Changes needed in** [`front/pages/business.tsx`](front/pages/business.tsx:59):

```typescript
const handlePurchaseSuccess = (receipt: Receipt) => {
	toast.success("خرید با موفقیت انجام شد", {
		description: `شماره پیگیری: ${receipt.publicId}`,
	});
};
```

### 3.2 Transactions Page

Create new page at [`front/pages/transactions.tsx`](front/pages/transactions.tsx):

**Features**:

- List all user transactions with filtering (by type, date range)
- Pagination support
- Click on transaction to view receipt
- Search by transaction publicId or amount

**Components needed**:

- `TransactionList` - Table/list of transactions
- `TransactionFilter` - Filter controls
- `TransactionRow` - Individual transaction display

**API Integration**:

- Use existing [`getWalletTransactions()`](front/src/lib/api/wallet.ts:71) from wallet API
- Add new API function: `getAllUserTransactions()` to aggregate across wallets

### 3.3 Receipt Modal

Create new modal at [`front/src/modals/ReceiptModal.tsx`](front/src/modals/ReceiptModal.tsx):

**Features**:

- Display transaction details (amount, type, date)
- Show payer and receiver information
- Display transaction publicId for reference
- Option to share/download receipt
- Persian/RTL formatting

**Design**:

```typescript
interface ReceiptModalProps {
	isOpen: boolean;
	onClose: () => void;
	transactionId: number;
	receipt: Receipt;
}
```

**Receipt Information Display**:

- Transaction ID/Public ID
- Transaction Type (with icon)
- Amount (formatted in Toman/Rial)
- Date and Time
- Payer wallet info
- Receiver (business) info
- Product details (if applicable)

---

## 4. Architectural Approach

### 4.1 Architecture Overview

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Frontend  │────▶│  Backend API │────▶│  Database   │
│  (Next.js)  │◀────│   (Elysia)   │◀────│  (Prisma)   │
└─────────────┘     └──────────────┘     └─────────────┘
       │                   │
       │                   ▼
       │            ┌──────────────┐
       │            │ Purchase     │
       │            │ Transaction  │
       │            └──────────────┘
       │
       ▼
┌──────────────────────────────────────────────┐
│  UI Components                               │
│  ┌────────────┐  ┌────────────┐  ┌────────┐ │
│  │ Purchase   │  │ Receipt    │  │Transac │ │
│  │ Modal      │  │ Modal      │  │-tions  │ │
│  └────────────┘  └────────────┘  │ Page   │ │
│                                   └────────┘ │
└──────────────────────────────────────────────┘
```

### 4.2 Data Flow: "Receipt" is Presentation Layer

```
Backend (Database):
  Transaction {
    id, publicId, amount, type, description, metadata,
    payerWallet, receiverWallet, createdAt
  }
       │
       │ (Frontend receives Transaction)
       ▼
Frontend (Presentation):
  ReceiptModal displays Transaction as "receipt"
  - publicId → "Receipt Number"
  - description → "Product/Details"
  - metadata → Additional receipt fields
```

**Key Insight**: We don't need a separate Receipt model. The Transaction _is_ the receipt data. The frontend simply presents it in receipt format.

### 4.3 Implementation Priority

| Priority | Item                          | Notes                                   |
| -------- | ----------------------------- | --------------------------------------- |
| 1        | Replace mock with real API    | In PurchaseModal - core user flow       |
| 2        | Backend Purchase Endpoint     | Includes OTP verification               |
| 3        | Business user lookup          | TEMPORARY implementation (mark clearly) |
| 4        | Enhance Transaction model     | Add description/metadata fields         |
| 5        | Toast with receipt link       | In business.tsx                         |
| 6        | Transactions page UI plan     | See transactions-page-ui.md             |
| 7        | Backend for transactions page | New endpoint for all user transactions  |
| 8        | Receipt modal                 | Present Transaction as receipt          |

```
Purchase Flow:
1. User clicks "خرید" → PurchaseModal opens
2. User selects wallet → Balance check
3. User enters phone + OTP → Send OTP request
4. User submits → POST /transaction/purchase
5. Backend processes → Returns { transaction, receipt }
6. Frontend shows success toast
7. Option to view receipt → Opens ReceiptModal
```

### 4.5 Security Considerations

1. **OTP Validation**: All purchases require OTP verification (purpose: VERIFY_TRANSACTION)
2. **Wallet Ownership**: Verify payer wallet belongs to requesting user
3. **Balance Check**: Ensure sufficient balance before transaction
4. **Atomic Transactions**: Use Prisma transactions for balance updates
5. **Receipt Access**: Only transaction participants can view receipt

### 4.6 Implementation Priority

| Priority | Item                            | Effort |
| -------- | ------------------------------- | ------ |
| 1        | Backend Purchase Endpoint + OTP | Medium |
| 2        | Prisma Receipt Model            | Low    |
| 3        | Receipt API Endpoints           | Low    |
| 4        | Frontend Receipt Modal          | Medium |
| 5        | Frontend Toast Integration      | Low    |
| 6        | Transactions Page               | Medium |

---

## 5. Summary

The Madar Digital Wallet currently has a solid foundation for wallet management and basic transactions. Based on our discussion, here's the revised approach:

### Key Architectural Decisions:

1. **No separate Receipt model** - Enhance Transaction with `description` and `metadata` fields. The "receipt" is a frontend presentation concept.

2. **Business user lookup** - TEMPORARY implementation (find first BUSINESS user + primary wallet). Mark clearly in code for future replacement.

3. **UI-first approach for Transactions page** - Plan the UI in detail (see [`transactions-page-ui.md`](front/plans/transactions-page-ui.md)), then implement backend to match.

4. **Real API implementation** - Replace mock in PurchaseModal with actual backend call.

### Implementation Order:

1. Replace mock with real API in PurchaseModal
2. Implement backend purchase endpoint with OTP verification
3. Add temporary business user lookup
4. Enhance Transaction model with description/metadata
5. Plan Transactions page UI (see transactions-page-ui.md)
6. Implement Transactions page backend
7. Create Receipt modal

This approach simplifies the data model while providing the same user experience.
