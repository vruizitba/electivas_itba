const { BaseElectivasScraper } = require("./base_electivas_scraper");

class ScraperElectivasInformatica extends BaseElectivasScraper {
	constructor({ url, username, password, outputPath, headless, debug }) {
		super({
			url,
			username,
			password,
			outputPath,
			headless,
			debug,
			careerRowPattern: /Inform[aá]tica/i,
			detailsClicks: 1,
			defaultOutputFilename: "data/electivas_informatica_contenidos_minimos.json",
		});
	}
}

module.exports = {
	ScraperElectivasInformatica,
};
