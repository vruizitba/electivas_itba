const baseUrl = (process.env.API_BASE_URL || "http://localhost:3001").replace(/\/$/, "");

async function expectJson(pathname) {
	const response = await fetch(`${baseUrl}${pathname}`);
	if (!response.ok) {
		throw new Error(`${pathname} -> status ${response.status}`);
	}

	return response.json();
}

async function main() {
	const health = await expectJson("/health");
	if (!health.ok) {
		throw new Error("/health -> payload invalido");
	}

	const careers = await expectJson("/api/carreras");
	if (!Array.isArray(careers.data) || careers.data.length === 0) {
		throw new Error("/api/carreras -> no devolvio carreras");
	}

	const informatica = await expectJson("/api/carreras/informatica/electivas");
	if (!Array.isArray(informatica.data)) {
		throw new Error("/api/carreras/informatica/electivas -> data invalida");
	}

	const bioingenieria = await expectJson("/api/carreras/bioingenieria/electivas");
	if (!Array.isArray(bioingenieria.data)) {
		throw new Error("/api/carreras/bioingenieria/electivas -> data invalida");
	}

	console.log("Smoke test backend OK");
	console.log({
		careers: careers.data.map((career) => career.slug),
		informatica: informatica.total,
		bioingenieria: bioingenieria.total,
	});
}

main().catch((error) => {
	console.error("Smoke test backend FAILED:", error.message);
	process.exit(1);
});
