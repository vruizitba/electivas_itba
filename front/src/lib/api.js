const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001").replace(/\/$/, "");

async function fetchJson(pathname, options = {}) {
	const response = await fetch(`${API_BASE_URL}${pathname}`, {
		method: "GET",
		...options,
	});

	if (!response.ok) {
		throw new Error(`Request failed with status ${response.status}`);
	}

	return response.json();
}

async function getCareers() {
	return fetchJson("/api/carreras", { next: { revalidate: 60 } });
}

async function getCareerElectivas(slug) {
	return fetchJson(`/api/carreras/${slug}/electivas`, { next: { revalidate: 60 } });
}

module.exports = {
	API_BASE_URL,
	getCareerElectivas,
	getCareers,
};
