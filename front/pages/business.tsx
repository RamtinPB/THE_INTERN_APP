"use client";

import { useState, useEffect } from "react";
import { MainLayout } from "@/components/MainLayout";
import { ProductCard, type Product } from "@/components/business";
import { PurchaseModal } from "@/modals/PurchaseModal";
import { getUserWallets } from "@/lib/api/wallet";
import type { Wallet } from "@/types/wallet";
import { toast } from "sonner";
import { ShoppingCart } from "lucide-react";

// Mock product data - in real app, this would come from backend
const MOCK_PRODUCT: Product = {
	id: "1",
	name: "Premium Subscription",
	nameFa: "اشتراک پرمیوم",
	description: "Premium subscription for exclusive features",
	descriptionFa: "اشتراک پرمیوم برای ویژگی‌های انحصاری",
	price: 500000,
	image: "", // Empty for placeholder
};

export default function BusinessPage() {
	const [wallets, setWallets] = useState<Wallet[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
	const [isModalOpen, setIsModalOpen] = useState(false);

	// Fetch user wallets on mount
	useEffect(() => {
		const fetchWallets = async () => {
			try {
				const { wallets: userWallets } = await getUserWallets();
				setWallets(userWallets);
			} catch (error) {
				console.error("Failed to fetch wallets:", error);
				toast.error("خطا در دریافت کیف پول‌ها");
			} finally {
				setIsLoading(false);
			}
		};

		fetchWallets();
	}, []);

	// Handle product purchase click
	const handlePurchase = (product: Product) => {
		setSelectedProduct(product);
		setIsModalOpen(true);
	};

	// Handle modal close
	const handleCloseModal = () => {
		setIsModalOpen(false);
		setSelectedProduct(null);
	};

	// Handle purchase success
	const handlePurchaseSuccess = () => {
		toast.success("خرید با موفقیت انجام شد");
	};

	return (
		<MainLayout>
			<div
				dir="rtl"
				className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center p-4"
			>
				{/* Page Header */}
				<div className="text-center mb-8">
					<h1 className="text-2xl font-semibold text-gray-800 flex items-center justify-center gap-2">
						<ShoppingCart className="h-6 w-6 text-blue-600" />
						خرید از فروشگاه
					</h1>
					<p className="text-gray-500 mt-2">Purchase from Store</p>
				</div>

				{/* Product Card */}
				<div className="w-full max-w-md">
					{isLoading ? (
						<div className="flex items-center justify-center p-8">
							<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
						</div>
					) : wallets.length === 0 ? (
						<div className="text-center p-8 bg-muted rounded-lg">
							<p className="text-muted-foreground">
								برای خرید نیاز به کیف پول دارید
							</p>
						</div>
					) : (
						<ProductCard product={MOCK_PRODUCT} onPurchase={handlePurchase} />
					)}
				</div>
			</div>

			{/* Purchase Modal */}
			<PurchaseModal
				isOpen={isModalOpen}
				onClose={handleCloseModal}
				product={selectedProduct}
				wallets={wallets}
				onSuccess={handlePurchaseSuccess}
			/>
		</MainLayout>
	);
}
