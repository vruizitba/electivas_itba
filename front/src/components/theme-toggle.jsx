export function ThemeToggle({ theme, onToggle }) {
	const nextLabel = theme === "dark" ? "Cambiar a claro" : "Cambiar a oscuro";

	return (
		<button
			type="button"
			className="md-switch"
			onClick={onToggle}
			aria-label={nextLabel}
			title={nextLabel}
		>
			<span className="md-switch__track" aria-hidden="true">
				<span className="md-switch__thumb" />
			</span>
			<span className="md-switch__text">Tema {theme === "dark" ? "oscuro" : "claro"}</span>
		</button>
	);
}
