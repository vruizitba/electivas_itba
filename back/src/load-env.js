const path = require("node:path");
const dotenv = require("dotenv");

function loadEnv() {
	const envPath = path.resolve(__dirname, "../.env");
	dotenv.config({ path: envPath, override: true });
}

module.exports = { loadEnv }; 

//Testin deploy
