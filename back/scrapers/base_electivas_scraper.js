const fs = require("node:fs/promises");
const path = require("node:path");

const { SgaScraper } = require("./sga_scraper");

const FIRST_ELECTIVA_CODE = "10.07";
const PER_MATERIA_COOLDOWN_MS = 2500;

function cleanText(text) {
	return (text || "").replace(/\s+/g, " ").trim();
}

function parseMateria(rawText) {
	const text = cleanText(rawText);
	const match = text.match(/^(\d+\.\d+)\s*-\s*(.+)$/);

	if (match) {
		const codigo = match[1];
		const nombre = cleanText(match[2]);

		return {
			codigo,
			nombre,
			materia: `${codigo} - ${nombre}`,
		};
	}

	const dashOnlyMatch = text.match(/^-\s*(.+)$/);
	if (dashOnlyMatch) {
		const nombre = cleanText(dashOnlyMatch[1]);

		return {
			codigo: "",
			nombre,
			materia: `- ${nombre}`,
		};
	}

	return {
		codigo: "",
		nombre: text,
		materia: text,
	};
}

class BaseElectivasScraper extends SgaScraper {
	constructor({
		url,
		username,
		password,
		outputPath,
		headless,
		debug,
		careerRowPattern,
		careerPlanLinkSelector = "td:nth-child(6) a",
		detailsClicks = 1,
		defaultOutputFilename = "electivas_contenidos_minimos.json",
		firstElectivaCode = FIRST_ELECTIVA_CODE,
	}) {
		super({
			url,
			username,
			password,
			headless,
			debug,
			careerRowPattern,
			careerPlanLinkSelector,
			detailsClicks,
		});

		this.outputPath = outputPath
			? path.resolve(outputPath)
			: path.resolve(process.cwd(), defaultOutputFilename);
		this.firstElectivaCode = firstElectivaCode;
	}

	async getElectivas() {
		const rawItems = await this.page.$$eval("table tbody tr td:first-child a", (anchors) =>
			anchors
				.map((a) => {
					const text = (a.textContent || "").trim();
					const href = a.getAttribute("href") || "";
					return { text, href };
				})
				.filter((item) => /^\d+\.\d+\s*-\s+/.test(item.text) && item.href)
		);
		this.logDebug("Links crudos detectados en tabla", {
			count: rawItems.length,
			sample: rawItems.slice(0, 5),
		});

		const seen = new Set();
		const electivas = [];

		for (const item of rawItems) {
			const absoluteHref = new URL(item.href, this.page.url()).toString();
			if (seen.has(absoluteHref)) {
				continue;
			}
			seen.add(absoluteHref);
			electivas.push({
				...parseMateria(item.text),
				linkText: cleanText(item.text),
				href: absoluteHref,
			});
		}

		const firstElectivaIndex = electivas.findIndex((item) => item.codigo === this.firstElectivaCode);
		if (firstElectivaIndex === -1) {
			throw new Error(
				`No se encontro la primera electiva (${this.firstElectivaCode} - Creatividad). No se puede delimitar el bloque de electivas.`
			);
		}

		const slicedElectivas = electivas.slice(firstElectivaIndex);
		this.logDebug("Electivas filtradas desde la primera electiva", {
			count: slicedElectivas.length,
			first: slicedElectivas[0],
			second: slicedElectivas[1],
		});

		return slicedElectivas;
	}

	async gotoMateriaWithRetry(href, maxRetries = 2) {
		let lastError;

		for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
			try {
				this.logDebug("Abriendo materia por href", {
					attempt: attempt + 1,
					totalAttempts: maxRetries + 1,
					href,
				});
				await this.ensureMateriaPageOpen();
				await this.materiaPage.goto(href, {
					waitUntil: "domcontentloaded",
					timeout: 60000,
				});
				this.logDebug("Materia abierta", {
					currentUrl: this.materiaPage.url(),
					title: await this.materiaPage.title().catch(() => ""),
				});
				return;
			} catch (error) {
				lastError = error;
				this.logDebug("Error abriendo materia", {
					attempt: attempt + 1,
					message: error.message,
				});
				if (attempt < maxRetries) {
					await this.waitInMateriaPage(PER_MATERIA_COOLDOWN_MS);
				}
			}
		}

		throw lastError;
	}

	async openMateria(electiva, maxRetries = 2) {
		this.logDebug("Procesando electiva", {
			materia: electiva.materia,
			href: electiva.href,
		});
		await this.gotoMateriaWithRetry(electiva.href, maxRetries);
	}

	async resolveMateriaData(electiva) {
		return {
			codigo: electiva.codigo,
			nombre: electiva.nombre,
		};
	}

	async extractContenidosMinimos() {
		const tabLink = this.materiaPage.getByRole("link", { name: /Contenidos m[ií]nimos/i }).first();
		if (await tabLink.count()) {
			await tabLink.click().catch(() => {});
		}

		await this.waitInMateriaPage(400);

		const contenido = await this.materiaPage.evaluate(() => {
			const normalize = (text) => (text || "").replace(/\s+/g, " ").trim();
			const panels = Array.from(document.querySelectorAll(".tab-panel"));

			for (const panel of panels) {
				const spans = Array.from(panel.querySelectorAll("span.bold"));
				for (const span of spans) {
					const label = normalize(span.textContent || "").toLowerCase();
					if (label.includes("contenidos mínimos") || label.includes("contenidos minimos")) {
						const next = span.nextElementSibling;
						const nextText = normalize(next ? next.textContent || "" : "");
						if (nextText) {
							return nextText;
						}

						const panelText = normalize(panel.textContent || "");
						const match = panelText.match(/contenidos m[ií]nimos:\s*(.+)$/i);
						if (match && match[1]) {
							return normalize(match[1]);
						}
					}
				}
			}

			return "";
		});

		return cleanText(contenido);
	}

	async scrape() {
		await this.launch();

		try {
			await this.login();
			await this.openCareerDetails();

			const electivas = await this.getElectivas();
			if (electivas.length === 0) {
				throw new Error("No se encontraron electivas en la tabla de detalles.");
			}

			console.log(`Electivas detectadas: ${electivas.length}`);

			const resultados = [];
			for (let i = 0; i < electivas.length; i += 1) {
				if (i > 0) {
					await this.wait(PER_MATERIA_COOLDOWN_MS);
				}

				const electiva = electivas[i];

				try {
					await this.openMateria(electiva);

					const contenidosMinimos = await this.extractContenidosMinimos();
					const materiaData = await this.resolveMateriaData(electiva);
					resultados.push({
						materia: {
							codigo: materiaData.codigo,
							nombre: materiaData.nombre,
						},
						contenidos_minimos: contenidosMinimos,
					});

					console.log(
						`[${i + 1}/${electivas.length}] ${electiva.materia} -> ${
							contenidosMinimos ? "ok" : "sin contenido"
						}`
					);
				} catch (error) {
					console.error(`[${i + 1}/${electivas.length}] ${electiva.materia} -> error: ${error.message}`);
					resultados.push({
						materia: {
							codigo: electiva.codigo,
							nombre: electiva.nombre,
						},
						contenidos_minimos: "",
						error: error.message,
					});
				}
			}

			await fs.writeFile(this.outputPath, `${JSON.stringify(resultados, null, 2)}\n`, "utf8");
			console.log(`\nArchivo generado: ${this.outputPath}`);
		} finally {
			await this.close();
		}
	}
}

module.exports = {
	BaseElectivasScraper,
	cleanText,
	parseMateria,
};
