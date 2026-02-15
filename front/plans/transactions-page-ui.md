# Transactions Page UI Specification

## Overview

This document details the UI design for the Transactions History page. The approach is **UI-first**: we design the user experience first, then implement the backend to provide the necessary data.

---

## 1. Page Overview

### Route

- **Path**: `/transactions`
- **File**: `front/pages/transactions.tsx`

### Purpose

Allow users to view all their transactions (as payer or receiver) across all wallets in a clean, filterable table format with the ability to view detailed receipts.

---

## 2. Layout Structure

```
┌─────────────────────────────────────────────────────────────────┐
│  [← بازگشت به داشبورد]                               [-sidebar] │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  تاریخچه تراکنش‌ها                                       │  │
│  │  Transaction History                                       │  │
│  │                                                            │  │
│  │  [Search: شماره تراکنش یا مبلغ...]        [فیلترها ▼]   │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Filters Panel (Collapsible)                              │  │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐         │  │
│  │  │ نوع: همه   │ │ وضعیت: همه │ │ کیف پول: همه│         │  │
│  │  └─────────────┘ └─────────────┘ └─────────────┘         │  │
│  │  ┌─────────────────────┐  ┌─────────────────────┐         │  │
│  │  │ از تاریخ: [انتخاب] │  │ تا تاریخ: [انتخاب] │         │  │
│  │  └─────────────────────┘  └─────────────────────┘         │  │
│  │                                                            │  │
│  │  [اعمال فیلتر]  [پاک کردن]                               │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Active Filters Tags:                                     │  │
│  │  [× نوع: خرید] [× وضعیت: تکمیل شده]  [پاک کردن همه]    │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    Transaction Table                      │  │
│  │  ┌────┬──────────┬────────┬────────┬────────┬────────┐  │  │
│  │  │ #   │ تاریخ    │ نوع    │ مبلغ   │ وضعیت │ عملیات │  │  │
│  │  ├────┼──────────┼────────┼────────┼────────┼────────┤  │  │
│  │  │ 1  │ ۱۴۰۴/۱۱/۲۵ │ خرید   │ -۵۰۰K │ ✅     │ [...] │  │  │
│  │  │ 2  │ ۱۴۰۴/۱۱/۲۴ │ انتقال │ -۲۰۰K │ ✅     │ [...] │  │  │
│  │  │ 3  │ ۱۴۰۴/۱۱/۲۳ │ واریز  │ +۱M   │ ✅     │ [...] │  │  │
│  │  └────┴──────────┴────────┴────────┴────────┴────────┘  │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Pagination: [1] [2] [3] ... [10]  |  Showing 1-20 of 150 │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. Component Breakdown

### 3.1 Header Section

- **Title**: "تاریخچه تراکنش‌ها" (Transaction History)
- **Search Input**: Search by transaction publicId or amount
- **Filter Toggle**: Button to show/hide filters panel

### 3.2 Filters Panel

| Filter           | Type       | Options                           |
| ---------------- | ---------- | --------------------------------- |
| Transaction Type | Select     | همه, خرید, انتقال, واریز, برداشت  |
| Status           | Select     | همه, تکمیل شده, در انتظار, ناموفق |
| Wallet           | Select     | همه + list of user's wallets      |
| Date From        | DatePicker | -                                 |
| Date To          | DatePicker | -                                 |

### 3.3 Active Filters Tags

- Display active filters as removable tags
- "پاک کردن همه" (Clear All) button

### 3.4 Transaction Table

**Columns**:

| Column      | Width | Content                               |
| ----------- | ----- | ------------------------------------- |
| #           | 50px  | Row number                            |
| Date        | 120px | Persian date (۱۴۰۴/۱۱/۲۵)             |
| Type        | 100px | Icon + Type name (خرید, انتقال, etc.) |
| Amount      | 120px | +Green/-Red formatted amount          |
| Status      | 80px  | Badge (✅, ⏳, ❌)                    |
| Description | flex  | Brief description (recipient/sender)  |
| Actions     | 80px  | "مشاهده فاکتور" button                |

**Row Hover**: Show subtle background change
**Click Action**: Opens Receipt Modal

### 3.5 Pagination

- Page numbers with ellipsis for large sets
- Items per page selector: 20, 50, 100
- "Showing X-Y of Z" text

### 3.6 Receipt Modal

Triggered by clicking a row or "مشاهده فاکتور" button.

```
┌─────────────────────────────────────────────────┐
│  ×                                              │
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │         🧾 فاکتور خرید                  │   │
│  │           Purchase Receipt               │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  شماره فاکتور: TXN-abc123def456              │
│                                                 │
│  ─────────────────────────────────────────    │
│                                                 │
│  نوع تراکنش:    خرید                           │
│  مبلغ:          ۵۰۰,۰۰۰ تومان              │
│  کارمزد:        ۰ تومان                       │
│  ─────────────────────────────────────────    │
│  مبلغ کل:       ۵۰۰,۰۰۰ تومان              │
│                                                 │
│  ─────────────────────────────────────────    │
│                                                 │
│  کیف پول پرداخت: **** ۱۲۳۴                   │
│  فروشنده:        فروشگاه پرمیوم               │
│                                                 │
│  تاریخ:         ۱۴۰۴/۱۱/۲۵ - ساعت ۱۴:۳۰    │
│  وضعیت:         ✅ تکمیل شده                  │
│                                                 │
│  ─────────────────────────────────────────    │
│                                                 │
│  محصول:        اشتراک پرمیوم                   │
│                                                 │
│  ┌─────────────────────────────────────────┐  │
│  │  [بستن]              [اشتراک‌گذاری]     │  │
│  └─────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
```

---

## 4. User Interactions

### 4.1 Search Flow

1. User types in search box
2. Debounce input (300ms)
3. Filter transactions by publicId OR amount contains search term
4. Update table with results

### 4.2 Filter Flow

1. User selects filter values
2. Clicks "اعمال فیلتر" (Apply Filter)
3. Table updates with filtered results
4. Active filters shown as removable tags

### 4.3 View Receipt Flow

1. User clicks row or "مشاهده فاکتور" button
2. Receipt Modal opens with transaction details
3. User can close or share the receipt

### 4.4 Pagination Flow

1. User clicks page number or next/prev
2. Loading state shown
3. New page of transactions loads
4. Scroll to top of table

---

## 5. Data Requirements (Backend)

Based on this UI design, the backend needs to provide:

### 5.1 Get All User Transactions

**Endpoint**: `GET /transactions`

**Query Parameters**:

```
?page=1&limit=20
&type=PURCHASE|TRANSFER|DEPOSIT|WITHDRAW
&status=COMPLETED|PENDING|FAILED
&walletId=1
&fromDate=1404-01-01
&toDate=1404-12-29
&search=abc123
```

**Response**:

```typescript
{
  transactions: TransactionWithDetails[],
  pagination: {
    page: number,
    limit: number,
    total: number,
    totalPages: number
  }
}
```

### 5.2 TransactionWithDetails Type

```typescript
interface TransactionWithDetails {
	id: number;
	publicId: string;
	transactionType: "PURCHASE" | "TRANSFER" | "DEPOSIT" | "WITHDRAW";
	status: "COMPLETED" | "PENDING" | "FAILED";
	amount: number;
	description?: string;
	createdAt: string; // ISO date

	// Payer info
	payerWallet: {
		id: number;
		publicId: string;
	};

	// Receiver info
	receiverWallet?: {
		id: number;
		publicId: string;
		user: {
			phoneNumber: string;
		};
	};

	// For receipt display
	metadata?: {
		productName?: string;
		productId?: string;
		sellerName?: string;
	};
}
```

---

## 6. Component Structure

```
front/pages/
└── transactions.tsx              # Main page
    ├── components/
    │   ├── transactions/
    │   │   ├── TransactionSearch.tsx      # Search input
    │   │   ├── TransactionFilters.tsx     # Filter panel
    │   │   ├── ActiveFilters.tsx          # Filter tags
    │   │   ├── TransactionTable.tsx       # Main table
    │   │   ├── TransactionRow.tsx         # Table row
    │   │   ├── TransactionPagination.tsx # Pagination
    │   │   └── index.ts
    │   └── modals/
    │       └── ReceiptModal.tsx           # Receipt display
    └── hooks/
        └── useTransactions.ts             # Data fetching
```

---

## 7. Acceptance Criteria

### Must Have

- [ ] Page displays all user transactions (as payer OR receiver)
- [ ] Search by transaction publicId works
- [ ] Filter by transaction type works
- [ ] Filter by status works
- [ ] Filter by wallet works
- [ ] Filter by date range works
- [ ] Pagination works correctly
- [ ] Clicking row opens Receipt Modal
- [ ] Receipt Modal shows all transaction details
- [ ] Responsive design (mobile-friendly table or card view)

### Should Have

- [ ] Active filters shown as removable tags
- [ ] "Clear all filters" button works
- [ ] Loading states during data fetch
- [ ] Empty state when no transactions match filters
- [ ] Share/download receipt option

### Nice to Have

- [ ] Export to CSV/PDF
- [ ] Real-time updates (polling or websocket)

---

## 8. Implementation Notes

### UI Component Suggestions

- Use shadcn's Table component as **suggestion**, adapt as needed
- Use shadcn's Select, Input, DatePicker for filters
- Use shadcn's Dialog for Receipt Modal
- Custom badge components for transaction type and status

### Persian/RTL Formatting

- Use `toLocaleDateString('fa-IR')` for Persian dates
- Use proper RTL alignment throughout
- Format amounts with thousand separators (۱,۰۰۰,۰۰۰)

### Performance Considerations

- Implement client-side debounce for search (300ms)
- Consider virtualization for large transaction lists (>1000)
- Cache transaction data on initial load
