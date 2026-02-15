"use client";

import { useState } from "react";

export function useLoginStages() {
	const [stage, setStage] = useState(0);
	const [phone, setPhone] = useState("");
	const [password, setPassword] = useState("");
	const [code, setCode] = useState(["", "", "", "", "", ""]);

	const isValidPhone = /^09\d{9}$/.test(phone);
	const isValidPassword = password.length >= 3 && /[A-Za-z]/.test(password);
	// const isValidPassword =
	// password.length >= 8 &&
	// /[A-Za-z]/.test(password) &&
	// /\d/.test(password) &&
	// /[!@#$%^&*]/.test(password);

	const isValidCode = code.every((d) => d.length === 1);

	return {
		stage,
		setStage,
		password,
		setPassword,
		phone,
		setPhone,
		code,
		setCode,
		isValidPhone,
		isValidPassword,
		isValidCode,
	};
}
