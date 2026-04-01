const fs = require("node:fs/promises");
const path = require("node:path");

const CAREERS = {
	bioingenieria: {
		slug: "bioingenieria",
		name: "Bioingeniería",
		file: path.resolve(process.cwd(), "data/electivas_bioingenieria_contenidos_minimos.json"),
	},
	informatica: {
		slug: "informatica",
		name: "Ingeniería Informática",
		file: path.resolve(process.cwd(), "data/electivas_informatica_contenidos_minimos.json"),
	},
};

async function readCareerData(slug) {
	const career = CAREERS[slug];
	if (!career) {
		return null;
	}

	const raw = await fs.readFile(career.file, "utf8");
	const stats = await fs.stat(career.file);
	const data = JSON.parse(raw);

	return {
		...career,
		updatedAt: stats.mtime.toISOString(),
		total: Array.isArray(data) ? data.length : 0,
		data,
	};
}

function listCareers() {
	return Object.values(CAREERS).map((career) => ({
		slug: career.slug,
		name: career.name,
		endpoint: `/api/carreras/${career.slug}/electivas`,
	}));
}

module.exports = {
	CAREERS,
	listCareers,
	readCareerData,
};
