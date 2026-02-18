import { useState, useEffect, useCallback } from "react";
import { getUserTransactions } from "@/lib/api/transaction";
import type {
	TransactionsFilters,
	TransactionsResponse,
	TransactionWithDetails,
} from "@/types/transaction";

interface UseTransactionsOptions {
	initialPage?: number;
	initialLimit?: number;
}

interface UseTransactionsReturn {
	transactions: TransactionWithDetails[];
	pagination: {
		page: number;
		limit: number;
		total: number;
		totalPages: number;
	} | null;
	isLoading: boolean;
	error: string | null;
	filters: TransactionsFilters;
	setFilters: (filters: TransactionsFilters) => void;
	setPage: (page: number) => void;
	setLimit: (limit: number) => void;
	refetch: () => void;
}

export function useTransactions(
	options: UseTransactionsOptions = {},
): UseTransactionsReturn {
	const { initialPage = 1, initialLimit = 20 } = options;

	const [transactions, setTransactions] = useState<TransactionWithDetails[]>(
		[],
	);
	const [pagination, setPagination] = useState<{
		page: number;
		limit: number;
		total: number;
		totalPages: number;
	} | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [filters, setFilters] = useState<TransactionsFilters>({
		page: initialPage,
		limit: initialLimit,
	});

	const fetchTransactions = useCallback(async () => {
		setIsLoading(true);
		setError(null);

		try {
			// Clean filters before sending to API - remove "all" values
			const cleanedFilters = { ...filters };
			if (cleanedFilters.type === "all") cleanedFilters.type = undefined;
			if (cleanedFilters.status === "all") cleanedFilters.status = undefined;
			if (cleanedFilters.walletId === "all")
				cleanedFilters.walletId = undefined;

			const response: TransactionsResponse =
				await getUserTransactions(cleanedFilters);
			setTransactions(response.transactions);
			setPagination(response.pagination);
		} catch (err: any) {
			setError(err.message || "خطا در دریافت تراکنش‌ها");
			setTransactions([]);
			setPagination(null);
		} finally {
			setIsLoading(false);
		}
	}, [filters]);

	useEffect(() => {
		fetchTransactions();
	}, [fetchTransactions]);

	const updateFilters = useCallback((newFilters: TransactionsFilters) => {
		setFilters((prev) => ({
			...prev,
			...newFilters,
			// Reset to page 1 when filters change (except when just changing page)
			page: newFilters.page !== undefined ? newFilters.page : 1,
		}));
	}, []);

	const setPage = useCallback((page: number) => {
		setFilters((prev) => ({ ...prev, page }));
	}, []);

	const setLimit = useCallback((limit: number) => {
		setFilters((prev) => ({ ...prev, limit, page: 1 }));
	}, []);

	const refetch = useCallback(() => {
		fetchTransactions();
	}, [fetchTransactions]);

	return {
		transactions,
		pagination,
		isLoading,
		error,
		filters,
		setFilters: updateFilters,
		setPage,
		setLimit,
		refetch,
	};
}
