"use client";

export function SubjectCard({ item, isExpanded, onToggle }) {
	const codigo = item?.materia?.codigo || "Sin codigo";
	const nombre = item?.materia?.nombre || "Materia sin nombre";
	const contenido = item?.contenidos_minimos || "Sin contenidos minimos cargados.";
	const error = item?.error || "";

	return (
		<article className={`subject-card ${isExpanded ? "subject-card--expanded" : ""}`}>
			<button
				type="button"
				className="subject-card__summary"
				onClick={onToggle}
				aria-expanded={isExpanded}
				aria-label={`${isExpanded ? "Ocultar" : "Mostrar"} contenidos de ${nombre}`}
			>
				<div className="subject-card__summary-copy">
					<p className="subject-card__code">{codigo}</p>
					<h3 className="subject-card__title">{nombre}</h3>
				</div>
				<span className="subject-card__icon" aria-hidden="true">
					{isExpanded ? "−" : "+"}
				</span>
			</button>

			{isExpanded ? (
				<div className="subject-card__details">
					<p className="subject-card__label">Contenidos minimos</p>
					<p className="subject-card__content">{contenido}</p>
					{error ? <p className="subject-card__error">Error en scraping: {error}</p> : null}
				</div>
			) : null}
		</article>
	);
}
