const { ScraperElectivasBioingenieria } = require("../../scrapers/scraper_electivas_bioingenieria");
const { ScraperElectivasInformatica } = require("../../scrapers/scraper_electivas_informatica");
const { DEFAULT_LOGIN_URL, resolveDebugValue, resolveHeadlessValue } = require("../../scrapers/sga_scraper");

const SCRAPER_BY_CAREER = {
	bioingenieria: ScraperElectivasBioingenieria,
	informatica: ScraperElectivasInformatica,
};

const invalidPlaceholders = new Set([
	"tu_usuario",
	"tu_password",
	"tu_contraseña",
	"your_user",
	"your_password",
]);

function resolveCredentials() {
	const username = process.env.SGA_USER;
	const password = process.env.SGA_PASSWORD;

	if (!username || !password) {
		throw new Error("Faltan credenciales. Define SGA_USER y SGA_PASSWORD en back/.env.");
	}

	if (invalidPlaceholders.has(String(username).trim()) || invalidPlaceholders.has(String(password).trim())) {
		throw new Error("Credenciales invalidas: detecte placeholders en back/.env.");
	}

	return { username, password };
}

async function runScraperForCareer(slug) {
	const ScraperClass = SCRAPER_BY_CAREER[slug];
	if (!ScraperClass) {
		return false;
	}

	const { username, password } = resolveCredentials();
	const scraper = new ScraperClass({
		url: process.env.SGA_URL || DEFAULT_LOGIN_URL,
		username,
		password,
		headless: resolveHeadlessValue(process.env.HEADLESS),
		debug: resolveDebugValue(process.env.SGA_DEBUG),
	});

	await scraper.scrape();
	return true;
}

module.exports = {
	runScraperForCareer,
};
