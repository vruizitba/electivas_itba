const { chromium } = require("playwright");

const DEFAULT_LOGIN_URL =
	"https://sga.itba.edu.ar/app2/L7ExSNbPC4sb6TPJDblCApV28_TV0rSO9auoWx8mJndaDLR_xeZ86GesasHvBscoR9vGe_BaY2MCCaaesCtju4B1xo5_QW1t/L7E59/TPJfd/_QW24";

function resolveHeadlessValue(value) {
	return !["0", "false", "no"].includes(String(value || "true").toLowerCase());
}

function resolveDebugValue(value) {
	return ["1", "true", "yes"].includes(String(value || "false").toLowerCase());
}

class SgaScraper {
	constructor({
		url = DEFAULT_LOGIN_URL,
		username,
		password,
		headless = resolveHeadlessValue(process.env.HEADLESS),
		debug = resolveDebugValue(process.env.SGA_DEBUG),
		careerRowPattern,
		careerPlanLinkSelector,
		detailsLinkName = "Ver detalles",
		detailsClicks = 1,
	}) {
		this.url = url;
		this.username = username;
		this.password = password;
		this.headless = headless;
		this.debug = debug;
		this.careerRowPattern = careerRowPattern;
		this.careerPlanLinkSelector = careerPlanLinkSelector;
		this.detailsLinkName = detailsLinkName;
		this.detailsClicks = detailsClicks;

		this.browser = null;
		this.context = null;
		this.page = null;
		this.materiaPage = null;
	}

	logDebug(message, payload) {
		if (!this.debug) {
			return;
		}

		if (payload === undefined) {
			console.log(`[debug:${this.constructor.name}] ${message}`);
			return;
		}

		console.log(`[debug:${this.constructor.name}] ${message}`, payload);
	}

	async launch() {
		this.browser = await chromium.launch({
			headless: this.headless,
			args: ["--disable-breakpad"],
		});
		this.context = await this.browser.newContext();
		this.page = await this.context.newPage();
		this.materiaPage = await this.context.newPage();
	}

	async ensureMateriaPageOpen() {
		if (this.materiaPage && !this.materiaPage.isClosed()) {
			return;
		}

		if (!this.browser || !this.browser.isConnected()) {
			throw new Error("El navegador se cerro durante el scraping.");
		}

		if (!this.context) {
			throw new Error("No hay un contexto de navegador activo para recrear la pagina de materia.");
		}

		this.materiaPage = await this.context.newPage();
	}

	async close() {
		if (this.materiaPage) {
			await this.materiaPage.close().catch(() => {});
		}

		if (this.context) {
			await this.context.close().catch(() => {});
		}

		if (this.browser) {
			await this.browser.close().catch(() => {});
		}
	}

	async wait(milliseconds) {
		await new Promise((resolve) => setTimeout(resolve, milliseconds));
	}

	async waitInMateriaPage(milliseconds) {
		await new Promise((resolve) => setTimeout(resolve, milliseconds));
	}

	async login() {
		this.logDebug("Abriendo login", { url: this.url });
		await this.page.goto(this.url, { waitUntil: "domcontentloaded", timeout: 60000 });

		await this.page.waitForSelector('input[name="user"]', { timeout: 15000 });
		await this.page.fill('input[name="user"]', this.username);
		await this.page.fill('input[name="password"]', this.password);

		await Promise.all([
			this.page.waitForLoadState("networkidle", { timeout: 60000 }),
			this.page.getByRole("button", { name: "Ingresar" }).click(),
		]);

		const sigueEnLogin = await this.page.locator('input[name="user"]').isVisible().catch(() => false);
		if (sigueEnLogin) {
			throw new Error(
				"Login no exitoso. Revisa SGA_USER/SGA_PASSWORD en .env y verifica que no haya captcha o bloqueo."
			);
		}
	}

	async openCarrerasPage() {
		this.logDebug("Entrando a Académica > Carreras");
		await this.page.getByRole("link", { name: "Académica" }).click();
		await this.page.getByRole("link", { name: "Carreras" }).click();
	}

	async openCareerDetails() {
		await this.openCarrerasPage();

		if (this.careerRowPattern) {
			const careerRow = this.page.locator("tr").filter({ hasText: this.careerRowPattern }).first();
			const rowText = await careerRow.textContent().catch(() => "");
			this.logDebug("Fila de carrera detectada", {
				pattern: String(this.careerRowPattern),
				rowText: rowText ? rowText.replace(/\s+/g, " ").trim() : "",
			});
			const planLink = careerRow.locator(this.careerPlanLinkSelector || "td:nth-child(6) a").first();
			const planLinkText = await planLink.textContent().catch(() => "");
			this.logDebug("Abriendo link de plan", {
				selector: this.careerPlanLinkSelector || "td:nth-child(6) a",
				linkText: planLinkText ? planLinkText.replace(/\s+/g, " ").trim() : "",
			});
			await planLink.click();
		} else if (this.careerPlanLinkSelector) {
			this.logDebug("Abriendo link de plan por selector directo", {
				selector: this.careerPlanLinkSelector,
			});
			await this.page.locator(this.careerPlanLinkSelector).click();
		} else {
			throw new Error("Falta definir careerRowPattern o careerPlanLinkSelector para abrir el detalle de la carrera.");
		}

		for (let i = 0; i < this.detailsClicks; i += 1) {
			this.logDebug("Click en Ver detalles", { click: i + 1, total: this.detailsClicks });
			await this.page.getByRole("link", { name: this.detailsLinkName }).first().click();
		}

		this.logDebug("Detalle de carrera abierto", { currentUrl: this.page.url() });
	}
}

module.exports = {
	DEFAULT_LOGIN_URL,
	SgaScraper,
	resolveDebugValue,
	resolveHeadlessValue,
};
