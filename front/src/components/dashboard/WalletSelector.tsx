import { SharedWalletSelector } from "@/components/shared/WalletSelector";
import { Wallet } from "@/lib/api/wallet";

interface WalletSelectorProps {
	wallets: Wallet[];
	selectedWalletId: string | null;
	onSelect: (walletId: string) => void;
	isLoading?: boolean;
}

/**
 * Dashboard wallet selector that uses publicId as value.
 * Wraps the shared WalletSelector component.
 */
export function WalletSelector({
	wallets,
	selectedWalletId,
	onSelect,
	isLoading,
}: WalletSelectorProps) {
	return (
		<SharedWalletSelector
			wallets={wallets}
			selectedWalletId={selectedWalletId}
			onSelect={onSelect}
			usePublicId={true}
			isLoading={isLoading}
		/>
	);
}
