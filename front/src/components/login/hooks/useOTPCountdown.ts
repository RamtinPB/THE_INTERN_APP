"use client";
import { useState, useEffect } from "react";

export function useOTPCountdown(active: boolean, defaultTime = 120) {
	const [timeLeft, setTimeLeft] = useState(defaultTime);

	useEffect(() => {
		if (!active || timeLeft === 0) return;

		const timer = setTimeout(() => setTimeLeft((s) => s - 1), 1000);
		return () => clearTimeout(timer);
	}, [active, timeLeft]);

	const reset = () => setTimeLeft(defaultTime);

	return { timeLeft, reset, resendDisabled: timeLeft > 0 };
}
