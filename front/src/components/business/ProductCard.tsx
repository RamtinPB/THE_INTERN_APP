"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/format";
import { ShoppingCart } from "lucide-react";

export interface Product {
	id: string;
	name: string;
	nameFa: string;
	description: string;
	descriptionFa: string;
	price: number;
	image: string;
}

interface ProductCardProps {
	product: Product;
	onPurchase: (product: Product) => void;
}

export function ProductCard({ product, onPurchase }: ProductCardProps) {
	return (
		<div className="bg-card rounded-lg border overflow-hidden hover:shadow-lg transition-shadow max-w-sm mx-auto">
			<div className="aspect-video bg-muted relative">
				{product.image ? (
					<Image
						src={product.image}
						alt={product.name}
						fill
						className="object-cover"
						unoptimized
					/>
				) : (
					<div className="flex items-center justify-center h-full">
						<ShoppingCart className="h-16 w-16 text-muted-foreground/30" />
					</div>
				)}
			</div>
			<div className="p-4 space-y-3">
				<div className="text-center space-y-1">
					<h3 className="font-semibold text-lg">{product.name}</h3>
					<p className="text-sm text-muted-foreground">{product.nameFa}</p>
				</div>
				<div className="border-t pt-3">
					<p className="text-center font-bold text-xl text-primary">
						{formatCurrency(product.price)}
					</p>
				</div>
				<Button
					size="sm"
					className="w-full"
					onClick={() => onPurchase(product)}
				>
					<ShoppingCart className="h-4 w-4 ml-2" />
					خرید
				</Button>
			</div>
		</div>
	);
}
