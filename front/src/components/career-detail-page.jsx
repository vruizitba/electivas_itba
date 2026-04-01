"use client";

import { useDeferredValue, useEffect, useMemo, useState } from "react";

import { fetchCareerElectivas } from "../lib/client-api";
import { DownloadJsonButton } from "./download-json-button";
import { PageChrome } from "./page-chrome";
import { SubjectCard } from "./subject-card";

function normalizeText(value) {
	return String(value || "")
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.toLowerCase()
		.replace(/\s+/g, " ")
		.trim();
}

function formatUpdatedAt(value) {
	if (!value) {
		return "Sin fecha";
	}

	const date = new Date(value);
	if (Number.isNaN(date.getTime())) {
		return "Sin fecha";
	}

	return new Intl.DateTimeFormat("es-AR", {
		dateStyle: "medium",
		timeStyle: "short",
	}).format(date);
}

export function CareerDetailPage({ slug }) {
	const [status, setStatus] = useState("loading");
	const [payload, setPayload] = useState(null);
	const [error, setError] = useState("");
	const [query, setQuery] = useState("");
	const [expandedId, setExpandedId] = useState("");
	const deferredQuery = useDeferredValue(query);

	useEffect(() => {
		let cancelled = false;

		async function loadCareer() {
			setStatus("loading");
			setPayload(null);
			setError("");

			try {
				const nextPayload = await fetchCareerElectivas(slug);
				if (cancelled) {
					return;
				}

				setPayload(nextPayload);
				setStatus("ready");
			} catch (loadError) {
				if (!cancelled) {
					setError(loadError.message || "No se pudo cargar la carrera.");
					setStatus("error");
				}
			}
		}

		loadCareer();
		return () => {
			cancelled = true;
		};
	}, [slug]);

	const filteredItems = useMemo(() => {
		const items = payload?.data || [];
		const normalizedQuery = normalizeText(deferredQuery);

		if (!normalizedQuery) {
			return items;
		}

		return items.filter((item) => {
			const codigo = normalizeText(item?.materia?.codigo);
			const nombre = normalizeText(item?.materia?.nombre);
			const contenido = normalizeText(item?.contenidos_minimos);

			return codigo.includes(normalizedQuery) || nombre.includes(normalizedQuery) || contenido.includes(normalizedQuery);
		});
	}, [payload, deferredQuery]);

	const title = payload?.career?.name || "Carrera";

	return (
		<PageChrome
			eyebrow="Materias y contenidos"
			title={title}
			subtitle="Abri una materia para leer sus contenidos minimos o usa el buscador para encontrarla mas rapido."
			backHref="/"
			backLabel="Volver al inicio"
		>
			<section className="hero-band">
				<div className="hero-band__copy">
					<p className="hero-band__label">Informacion de la carrera</p>
					<p className="hero-band__text">Consulta las materias disponibles y despliega solo la que quieras revisar.</p>
				</div>
				<div className="hero-band__meta">
					<p>{payload?.total ?? 0} materias</p>
					<p>Actualizado {formatUpdatedAt(payload?.updatedAt)}</p>
				</div>
			</section>

			<section className="career-detail">
				<div className="career-detail__toolbar">
					<label className="search-field">
						<span className="search-field__label">Buscar materia</span>
						<input
							type="search"
							value={query}
							onChange={(event) => setQuery(event.target.value)}
							placeholder="Ej. Creatividad o 10.07"
						/>
					</label>

					{payload ? <DownloadJsonButton slug={slug} payload={payload} /> : null}
				</div>

				{status === "loading" ? (
					<section className="loading-state">
						<p>Cargando materias de la carrera...</p>
					</section>
				) : null}

				{status === "error" ? (
					<section className="error-state">
						<p className="error-state__title">No se pudo cargar la carrera</p>
						<p className="error-state__message">{error}</p>
					</section>
				) : null}

				{status === "ready" ? (
					<>
						<div className="career-detail__meta">
							<span className="meta-pill">
								<strong>{filteredItems.length}</strong> resultados visibles
							</span>
							{query ? <span className="meta-pill">Filtro activo: {query}</span> : null}
						</div>

						<div className="subject-card-grid">
							{filteredItems.map((item, index) => {
								const key = `${item?.materia?.codigo || "materia"}-${index}`;
								return (
									<SubjectCard
										key={key}
										item={item}
										isExpanded={expandedId === key}
										onToggle={() => setExpandedId((current) => (current === key ? "" : key))}
									/>
								);
							})}
						</div>

						{filteredItems.length === 0 ? (
							<section className="loading-state">
								<p>No hay materias que coincidan con tu busqueda.</p>
							</section>
						) : null}
					</>
				) : null}
			</section>
		</PageChrome>
	);
}
