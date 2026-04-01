"use client";

import Link from "next/link";

import { useTheme } from "../hooks/use-theme";
import { ThemeToggle } from "./theme-toggle";

export function PageChrome({ eyebrow, title, subtitle, backHref, backLabel, children }) {
	const { theme, isReady, toggleTheme } = useTheme();

	return (
		<main className="app-shell">
			<div className="background-orb background-orb--one" />
			<div className="background-orb background-orb--two" />
			<section className="page-frame">
				<header className="topbar">
					<div className="topbar__copy">
						{backHref ? (
							<Link href={backHref} className="back-link">
								{backLabel || "Volver"}
							</Link>
						) : null}
						<p className="kicker">{eyebrow}</p>
						<h1>{title}</h1>
						<p className="subtitle">{subtitle}</p>
					</div>
					{isReady ? <ThemeToggle theme={theme} onToggle={toggleTheme} /> : null}
				</header>

				{children}
			</section>
		</main>
	);
}
