const { BaseElectivasScraper } = require("./base_electivas_scraper");

class ScraperElectivasBioingenieria extends BaseElectivasScraper {
	constructor({ url, username, password, outputPath, headless, debug }) {
		super({
			url,
			username,
			password,
			outputPath,
			headless,
			debug,
			careerRowPattern: /Bioingenier[ií]a/i,
			detailsClicks: 1,
			defaultOutputFilename: "data/electivas_bioingenieria_contenidos_minimos.json",
		});
	}
}

module.exports = {
	ScraperElectivasBioingenieria,
};
