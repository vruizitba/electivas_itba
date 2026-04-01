"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "electivas-ui-theme";

function resolveInitialTheme() {
	if (typeof window === "undefined") {
		return "light";
	}

	const stored = window.localStorage.getItem(STORAGE_KEY);
	if (stored === "light" || stored === "dark") {
		return stored;
	}

	return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function useTheme() {
	const [theme, setTheme] = useState("light");
	const [isReady, setIsReady] = useState(false);

	useEffect(() => {
		const initialTheme = resolveInitialTheme();
		setTheme(initialTheme);
		setIsReady(true);
	}, []);

	useEffect(() => {
		if (!isReady || typeof window === "undefined") {
			return;
		}

		document.documentElement.dataset.theme = theme;
		window.localStorage.setItem(STORAGE_KEY, theme);
	}, [theme, isReady]);

	function toggleTheme() {
		setTheme((current) => (current === "dark" ? "light" : "dark"));
	}

	return { theme, isReady, toggleTheme };
}
