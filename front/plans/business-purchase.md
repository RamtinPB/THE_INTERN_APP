# Business Purchase Page Specification

## Overview

- **Route:** `/business`
- **File:** `front/pages/business.tsx`
- **Purpose:** Allow users to simulate a purchase from a business merchant
- **Pattern:** Product card with purchase modal

---

## Layout Structure

```
┌────────────────────────────────────────────────────────────────┐
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    خرید از فروشگاه                       │  │
│  │                 Purchase from Store                      │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │
│  │  Product 1  │  │  Product 2  │  │  Product 3  │          │
│  │  [Image]    │  │  [Image]    │  │  [Image]    │          │
│  │             │  │             │  │             │          │
│  │  Name       │  │  Name       │  │  Name       │          │
│  │  Price      │  │  Price      │  │  Price      │          │
│  │             │  │             │  │             │          │
│  │  [خرید]     │  │  [خرید]     │  │  [خرید]     │          │
│  │  [Purchase] │  │  [Purchase] │  │  [Purchase] │          │
│  └─────────────┘  └─────────────┘  └─────────────┘          │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

---

## Product Card Component

### Props / Data

```typescript
interface Product {
	id: string;
	name: string;
	nameFa: string;
	description: string;
	descriptionFa: string;
	price: number;
	image: string;
	category: string;
}
```

### Placeholder Products

| ID  | Name (EN)            | Name (FA)         | Price (Toman) | Category     |
| --- | -------------------- | ----------------- | ------------- | ------------ |
| 1   | Premium Subscription | اشتراک پرمیوم     | 500,000       | Subscription |
| 2   | Digital Gift Card    | کارت هدیه دیجیتال | 200,000       | Gift Card    |
| 3   | Online Course        | دوره آنلاین       | 1,000,000     | Education    |
| 4   | Software License     | لاینسس نرم‌افزار  | 350,000       | Software     |
| 5   | Game Credits         | اعتبار بازی       | 100,000       | Gaming       |

### Card Layout

```
┌────────────────────────────────┐
│                                │
│         [Product Image]        │
│                                │
│     Premium Subscription       │
│     اشتراک پرمیوم              │
│                                │
│     ─────────────────────      │
│                                │
│        ۵۰۰,۰۰۰ تومان          │
│                                │
│     [خرید / Purchase]         │
│                                │
└────────────────────────────────┘
```

---

## Purchase Modal Component

### File Location

`front/src/modals/PurchaseModal.tsx`

### Modal Layout

```
┌────────────────────────────────────────────────────────────────┐
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  تایید خرید                                       [X]   │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  ┌────────────────────────────────────────────────────┐  │  │
│  │  │                                                    │  │  │
│  │  │                 [Product Image]                   │  │  │
│  │  │                                                    │  │  │
│  │  │     اشتراک پرمیوم - Premium Subscription          │  │  │
│  │  │                                                    │  │  │
│  │  │     ──────────────────────────────────────────    │  │  │
│  │  │                                                    │  │  │
│  │  │     قیمت: ۵۰۰,۰۰۰ تومان                          │  │  │
│  │  │     کارمزد (۱٪): ۵,۰۰۰ تومان                      │  │  │
│  │  │     ──────────────────────────────────────────    │  │  │
│  │  │     مجموع: ۵۰۵,۰۰۰ تومان                          │  │  │
│  │  │                                                    │  │  │
│  │  │     فروشنده: نام فروشگاه                          │  │  │
│  │  │                                                    │  │  │
│  │  └────────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  شماره موبایل:                                           │  │
│  │  [________________________]                              │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  کد تایید:                          ┌─────────────────┐ │  │
│  │  [________________________]          │ ارسال کد       │ │  │
│  │                                      └─────────────────┘ │  │
│  │                                                        │  │
│  │     کد تایید برای شما ارسال شد                         │  │
│  │     ارسال مجدد: ۵۹ ثانیه                               │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  [انصراف]                               [تایید و پرداخت] │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────┘
```

### RTL/Persian Alignment

The modal uses proper RTL alignment similar to TransferModal:

```tsx
<DirectionProvider dir="rtl">
	<Dialog open={isOpen} onOpenChange={handleOpenChange}>
		<DialogContent
			dir="rtl"
			className="sm:max-w-md [&>button]:left-4 [&>button]:right-auto"
		>
			{/* Form content */}
		</DialogContent>
	</Dialog>
</DirectionProvider>
```

### Form Fields

| Field        | Type  | Validation                          | Required |
| ------------ | ----- | ----------------------------------- | -------- |
| Phone Number | Input | Iranian mobile format (09xxxxxxxxx) | Yes      |
| OTP Code     | Input | 6 digits                            | Yes      |

### Validation Rules

1. **Phone Number:**
   - Must be valid Iranian mobile format (starts with 09, 11 digits)
   - Must not be empty
   - Error: "شماره موبایل نامعتبر است"

2. **OTP Code:**
   - Must be exactly 6 digits
   - Must not be empty
   - Must match the OTP sent to the phone
   - Error: "کد تایید نامعتبر است"

### Button States

| State         | Button Text    | Disabled                         |
| ------------- | -------------- | -------------------------------- |
| Initial       | تایید و پرداخت | true (both fields empty/invalid) |
| Phone Entered | تایید و پرداخت | true (OTP not verified)          |
| OTP Sent      | تایید و پرداخت | false (if both valid)            |
| Loading       | ... (spinner)  | true                             |
| Success       | -              | modal closes                     |

---

## API Integration

### Backend Requirements

1. **Find Business User:**

   ```typescript
   // GET /users?role=BUSINESS&limit=1
   // Returns the first BUSINESS type user as the receiver
   ```

2. **Send OTP:**

   ```typescript
   // POST /auth/send-otp
   // Input: { phoneNumber: string }
   // Output: { success: boolean, message: string }
   ```

3. **Verify OTP:**

   ```typescript
   // POST /auth/verify-otp
   // Input: { phoneNumber: string, code: string }
   // Output: { success: boolean, token?: string }
   ```

4. **Process Purchase (Atomic Transaction):**

   ```typescript
   // POST /transaction/purchase
   // Input: {
   //   fromWalletId: number,
   //   toUserId: number,
   //   amount: number,
   //   fee: number,
   //   productId: string,
   //   otpCode: string
   // }
   // Output: { transaction: Transaction, success: boolean }

   // Must be wrapped in a Prisma transaction:
   // 1. Validate OTP
   // 2. Check sender wallet balance (sufficient funds)
   // 3. Deduct from sender wallet
   // 4. Add to receiver wallet (business user)
   // 5. Deduct fee (optional - goes to platform)
   // 6. Create transaction records
   // 7. If ANY step fails, rollback all changes
   ```

### Transaction Atomicity

The purchase must be atomic (all-or-nothing):

```typescript
// Prisma Transaction Example
await prisma.$transaction(async (tx) => {
	// 1. Verify OTP
	const otpValid = await verifyOTP(phoneNumber, otpCode);
	if (!otpValid) throw new Error("کد تایید نامعتبر است");

	// 2. Get sender wallet with lock
	const senderWallet = await tx.wallet.findUnique({
		where: { id: fromWalletId },
		lock: { mode: "update" },
	});

	// 3. Check balance
	const totalAmount = amount + fee;
	if (parseFloat(senderWallet.balance) < totalAmount) {
		throw new Error("موجودی کافی نیست");
	}

	// 4. Get business receiver
	const business = await tx.user.findFirst({
		where: { role: "BUSINESS" },
	});

	// 5. Get business wallet
	const businessWallet = await tx.wallet.findFirst({
		where: { userId: business.id },
	});

	// 6. Deduct from sender
	await tx.wallet.update({
		where: { id: fromWalletId },
		data: {
			balance: {
				decrement: totalAmount,
			},
		},
	});

	// 7. Add to business wallet
	await tx.wallet.update({
		where: { id: businessWallet.id },
		data: {
			balance: {
				increment: amount,
			},
		},
	});

	// 8. Create transaction record
	const transaction = await tx.transaction.create({
		data: {
			fromWalletId,
			toWalletId: businessWallet.id,
			amount,
			fee,
			type: "PURCHASE",
			status: "COMPLETED",
			description: `خرید ${productName}`,
		},
	});

	return transaction;
});
```

---

## Component Structure

```
front/
├── pages/
│   └── business.tsx              # Main page
├── src/
│   ├── modals/
│   │   └── PurchaseModal.tsx    # Purchase confirmation modal
│   ├── components/
│   │   └── business/
│   │       ├── ProductCard.tsx  # Individual product card
│   │       ├── ProductGrid.tsx   # Grid of products
│   │       └── PurchaseForm.tsx  # React Hook Form for purchase
│   ├── hooks/
│   │   ├── usePurchase.ts       # Purchase logic hook
│   │   └── useOTPSonner.tsx    # OTP display via sonner (simulation)
```

---

## State Management

### Purchase Modal State

```typescript
interface PurchaseState {
	isOpen: boolean;
	selectedProduct: Product | null;
	phoneNumber: string;
	otpCode: string;
	otpSent: boolean;
	otpVerified: boolean;
	isSendingOtp: boolean;
	otpCountdown: number;
	isLoading: boolean;
	error: string | null;
}
```

### User Interactions Flow

```
1. User views product cards
      ↓
2. Clicks "خرید / Purchase" on a product
      ↓
3. Modal opens with product summary
      ↓
4. User enters phone number
      ↓
5. Clicks "ارسال کد / Send Code"
      ↓
6. OTP sent to phone (display success message)
      ↓
7. User enters 6-digit OTP
      ↓
8. OTP automatically verified OR user clicks verify
      ↓
9. "تایید و پرداخت / Confirm" button becomes enabled
      ↓
10. User clicks confirm
      ↓
11. Loading state while processing
      ↓
12. Success: Modal closes, show success message
    OR
    Error: Show error message, allow retry
```

---

## Acceptance Criteria

1. ✅ Page displays product cards with placeholder data
2. ✅ Clicking "Purchase" opens modal with product summary
3. ✅ Modal shows price breakdown (amount, fee, total)
4. ✅ Phone number input with validation
5. ✅ OTP code input in same row as "Send Code" button
6. ✅ Form validation before enabling confirm button
7. ✅ Uses react-hook-form for form handling
8. ✅ Purchase is processed atomically (all-or-nothing)
9. ✅ Receiver is the first BUSINESS user type
10. ✅ Success/error states handled properly

---

## Tailwind CSS Classes Reference

### Product Card

```tsx
<div className="bg-card rounded-lg border overflow-hidden hover:shadow-lg transition-shadow">
	<div className="aspect-video bg-muted">
		<img
			src={product.image}
			alt={product.name}
			className="w-full h-full object-cover"
		/>
	</div>
	<div className="p-4 space-y-2">
		<h3 className="font-semibold">{product.name}</h3>
		<p className="text-sm text-muted-foreground">{product.nameFa}</p>
		<div className="flex items-center justify-between pt-2">
			<span className="font-bold text-lg">{formatCurrency(product.price)}</span>
			<Button size="sm">خرید</Button>
		</div>
	</div>
</div>
```

### Purchase Modal Form

```tsx
import { ShoppingCart, Loader2 } from "lucide-react";
import { DirectionProvider } from "@/components/ui/direction";
import { toast } from "sonner";

// Inside component:
const { displayOTP } = useOTPSonner({ phoneNumber });

const handleSendOTP = async () => {
	try {
		setIsSendingOtp(true);
		// Simulate OTP API call - in real app, this would call the backend
		const mockOTP = Math.floor(100000 + Math.random() * 900000).toString();

		// Display OTP via sonner (simulation)
		displayOTP(mockOTP);

		setOtpSent(true);
		// Start countdown timer
	} catch (error) {
		toast.error("خطا در ارسال کد تایید");
	} finally {
		setIsSendingOtp(false);
	}
};

// JSX:
<DirectionProvider dir="rtl">
	<Dialog open={isOpen} onOpenChange={handleOpenChange}>
		<DialogContent
			dir="rtl"
			className="sm:max-w-md [&>button]:left-4 [&>button]:right-auto"
		>
			<DialogHeader>
				<DialogTitle className="flex items-center gap-2">
					<ShoppingCart className="h-5 w-5 text-blue-600" />
					تایید خرید
				</DialogTitle>
			</DialogHeader>

			<form onSubmit={handleSubmit} className="space-y-4">
				{/* Phone Input */}
				<div className="space-y-2">
					<Label>شماره موبایل</Label>
					<Input
						type="tel"
						placeholder="09123456789"
						value={phoneNumber}
						onChange={(e) => setPhoneNumber(e.target.value)}
						dir="ltr"
					/>
				</div>

				{/* OTP Input with Send Button */}
				<div className="space-y-2">
					<Label>کد تایید</Label>
					<div className="flex gap-2">
						<Input
							type="text"
							placeholder="xxxxxx"
							value={otpCode}
							onChange={(e) => setOtpCode(e.target.value)}
							maxLength={6}
							className="font-mono tracking-widest"
							dir="ltr"
						/>
						<Button
							type="button"
							onClick={handleSendOTP}
							disabled={!isValidPhone || isSendingOtp}
						>
							{isSendingOtp ? (
								<Loader2 className="h-4 w-4 animate-spin" />
							) : otpSent ? (
								"ارسال مجدد کد"
							) : (
								"ارسال کد"
							)}
						</Button>
					</div>
				</div>

				{/* OTP Countdown */}
				{otpSent && otpCountdown > 0 && (
					<p className="text-sm text-muted-foreground text-center">
						ارسال مجدد: {otpCountdown} ثانیه
					</p>
				)}

				{/* Submit Button */}
				<Button
					type="submit"
					disabled={!isFormValid || isLoading}
					className="w-full"
				>
					{isLoading ? (
						<Loader2 className="h-4 w-4 animate-spin" />
					) : (
						"تایید و پرداخت"
					)}
				</Button>
			</form>
		</DialogContent>
	</Dialog>
</DirectionProvider>;
```

---

## Error Handling

| Error Type           | Message (FA)             | Action                      |
| -------------------- | ------------------------ | --------------------------- |
| Invalid Phone        | شماره موبایل نامعتبر است | Show inline error           |
| OTP Send Failed      | خطا در ارسال کد تایید    | Show error, retry button    |
| Invalid OTP          | کد تایید نامعتبر است     | Clear OTP, allow retry      |
| Insufficient Balance | موجودی کافی نیست         | Show error, suggest deposit |
| Transaction Failed   | خطا در پرداخت            | Show error, allow retry     |
| Network Error        | خطای شبکه                | Show error, retry button    |

---

## Implementation Notes

1. **OTP Flow:** Reuse existing auth OTP infrastructure
2. **Business User:** Query first user with role=BUSINESS from database
3. **Wallet Selection:** User selects which wallet to pay from (if multiple)
4. **Fee Calculation:** 1% fee on transaction amount (configurable)
5. **Form Library:** Use react-hook-form with zod validation
6. **Atomic Transactions:** Use Prisma transaction with rollback on failure
