"use client";

import { useEffect, useState } from "react";

import { fetchCareers } from "../lib/client-api";
import { CareerCardLink } from "./career-card-link";
import { PageChrome } from "./page-chrome";

const CARD_ACCENTS = ["career-card-link--blue", "career-card-link--green", "career-card-link--orange"];

export function CareersHome() {
	const [careers, setCareers] = useState([]);
	const [status, setStatus] = useState("loading");
	const [error, setError] = useState("");

	useEffect(() => {
		let cancelled = false;

		async function loadCareers() {
			setStatus("loading");
			setError("");

			try {
				const nextCareers = await fetchCareers();
				if (cancelled) {
					return;
				}

				setCareers(nextCareers);
				setStatus("ready");
			} catch (loadError) {
				if (!cancelled) {
					setError(loadError.message || "No se pudieron cargar las carreras.");
					setStatus("error");
				}
			}
		}

		loadCareers();
		return () => {
			cancelled = true;
		};
	}, []);

	return (
		<PageChrome
			eyebrow="Consulta de electivas"
			title="Electivas ITBA"
			subtitle=""
		>
			<section className="hero-band">
				<div className="hero-band__copy">
					<p className="hero-band__label">Como usar la pagina</p>
					<p className="hero-band__text">
						Selecciona una carrera para ver sus materias, consultar los contenidos minimos y descargar el archivo JSON de la carrera.
					</p>
				</div>
			</section>

			<section className="notice-banner" aria-label="Proximas carreras">
				<p>Mas ingenierias proximamente.</p>
			</section>

			<section className="directory">
				<div className="directory__header">
					<div>
						<p className="block-label">Carreras</p>
						<h2>Selecciona una carrera</h2>
					</div>
				</div>

				{status === "loading" ? (
					<section className="loading-state">
						<p>Cargando carreras disponibles...</p>
					</section>
				) : null}

				{status === "error" ? (
					<section className="error-state">
						<p className="error-state__title">No se pudieron cargar las carreras</p>
						<p className="error-state__message">{error}</p>
					</section>
				) : null}

				{status === "ready" ? (
					<div className="career-card-grid">
						{careers.map((career, index) => (
							<CareerCardLink
								key={career.slug}
								career={career}
								accentClassName={CARD_ACCENTS[index % CARD_ACCENTS.length]}
							/>
						))}
					</div>
				) : null}
			</section>
		</PageChrome>
	);
}
