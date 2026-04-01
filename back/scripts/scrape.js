const path = require("node:path");

const { DEFAULT_LOGIN_URL, resolveDebugValue, resolveHeadlessValue } = require("../scrapers/sga_scraper");
const { ScraperElectivasBioingenieria } = require("../scrapers/scraper_electivas_bioingenieria");
const { ScraperElectivasInformatica } = require("../scrapers/scraper_electivas_informatica");
const { loadEnv } = require("../src/load-env");

loadEnv();

const DEFAULT_SCRAPER_KEY = "electivas_informatica";
const SCRAPERS = {
	electivas_bioingenieria: ScraperElectivasBioingenieria,
	electivas_informatica: ScraperElectivasInformatica,
};

const targetUrl = process.argv[2] || process.env.SGA_URL || DEFAULT_LOGIN_URL;
const username = process.env.SGA_USER || process.argv[3];
const password = process.env.SGA_PASSWORD || process.argv[4];
const outputPath = process.argv[5] ? path.resolve(process.argv[5]) : undefined;
const headless = resolveHeadlessValue(process.env.HEADLESS);
const debug = resolveDebugValue(process.env.SGA_DEBUG);
const scraperKey = String(process.env.SGA_SCRAPER || DEFAULT_SCRAPER_KEY).trim();
const ScraperClass = SCRAPERS[scraperKey];

const invalidPlaceholders = new Set([
	"tu_usuario",
	"tu_password",
	"tu_contraseña",
	"your_user",
	"your_password",
]);

if (!username || !password) {
	console.error(
		"Faltan credenciales. Define SGA_USER y SGA_PASSWORD en .env (o pasalas por argumento)."
	);
	process.exit(1);
}

if (invalidPlaceholders.has(String(username).trim()) || invalidPlaceholders.has(String(password).trim())) {
	console.error("Credenciales invalidas: detecte placeholders (ej. tu_usuario/tu_password). Revisa el archivo .env.");
	process.exit(1);
}

if (!ScraperClass) {
	console.error(
		`SGA_SCRAPER invalido: "${scraperKey}". Opciones disponibles: ${Object.keys(SCRAPERS).join(", ")}`
	);
	process.exit(1);
}

const scraper = new ScraperClass({
	url: targetUrl,
	username,
	password,
	outputPath,
	headless,
	debug,
});

scraper.scrape().catch((error) => {
	console.error("Error durante el scraping:", error.message);
	process.exit(1);
});
