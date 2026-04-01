const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001").replace(/\/$/, "");

async function fetchGet(pathname) {
	const response = await fetch(`${API_BASE_URL}${pathname}`, {
		method: "GET",
	});

	let payload = null;
	try {
		payload = await response.json();
	} catch {
		payload = null;
	}

	if (!response.ok) {
		const message = payload?.message || payload?.error || `status ${response.status}`;
		throw new Error(message);
	}

	return payload;
}

export async function fetchCareers() {
	const payload = await fetchGet("/api/carreras");
	return Array.isArray(payload?.data) ? payload.data : [];
}

export async function fetchCareerElectivas(slug) {
	return fetchGet(`/api/carreras/${encodeURIComponent(slug)}/electivas`);
}

export { API_BASE_URL };
