const baseUrl = (process.env.FRONTEND_BASE_URL || "http://localhost:3000").replace(/\/$/, "");

async function main() {
	const response = await fetch(baseUrl);
	if (!response.ok) {
		throw new Error(`/ -> status ${response.status}`);
	}

	const html = await response.text();
	if (!html.includes("Electivas ITBA")) {
		throw new Error("El home no contiene el texto esperado");
	}

	console.log("Smoke test frontend OK");
}

main().catch((error) => {
	console.error("Smoke test frontend FAILED:", error.message);
	process.exit(1);
});
