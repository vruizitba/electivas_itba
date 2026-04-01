import Link from "next/link";

export function CareerCardLink({ career, accentClassName }) {
	return (
		<Link href={`/carreras/${career.slug}`} className={`career-card-link ${accentClassName || ""}`}>
			<div className="career-card-link__badge">Ingenieria</div>
			<h2 className="career-card-link__title">{career.name}</h2>
			<span className="career-card-link__cta">Ver carrera</span>
		</Link>
	);
}
