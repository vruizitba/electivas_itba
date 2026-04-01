const http = require("node:http");
const { listCareers, readCareerData } = require("./utils/career-data");
const { loadEnv } = require("./load-env");

loadEnv();

const port = Number(process.env.PORT || 3001);
const corsOrigin = process.env.CORS_ORIGIN || "*";

function sendJson(res, statusCode, payload) {
	res.writeHead(statusCode, {
		"Access-Control-Allow-Origin": corsOrigin,
		"Access-Control-Allow-Methods": "GET,OPTIONS",
		"Access-Control-Allow-Headers": "Content-Type",
		"Content-Type": "application/json; charset=utf-8",
	});
	res.end(`${JSON.stringify(payload, null, 2)}\n`);
}

const server = http.createServer(async (req, res) => {
	const url = new URL(req.url, `http://${req.headers.host}`);

	if (req.method === "OPTIONS") {
		res.writeHead(204, {
			"Access-Control-Allow-Origin": corsOrigin,
			"Access-Control-Allow-Methods": "GET,OPTIONS",
			"Access-Control-Allow-Headers": "Content-Type",
		});
		res.end();
		return;
	}

	if (req.method !== "GET") {
		sendJson(res, 405, { error: "Method not allowed" });
		return;
	}

	if (url.pathname === "/health") {
		sendJson(res, 200, { ok: true, service: "electivas-back" });
		return;
	}

	if (url.pathname === "/api/carreras" || url.pathname === "/api/careers") {
		sendJson(res, 200, { data: listCareers() });
		return;
	}

	const match = url.pathname.match(/^\/api\/(?:carreras|careers)\/([^/]+)\/electivas$/);
	if (match) {
		try {
			const career = await readCareerData(match[1]);
			if (!career) {
				sendJson(res, 404, { error: "Career not found" });
				return;
			}

			sendJson(res, 200, {
				career: {
					slug: career.slug,
					name: career.name,
				},
				total: career.total,
				updatedAt: career.updatedAt,
				data: career.data,
			});
			return;
		} catch (error) {
			sendJson(res, 500, { error: "Failed to read career data", message: error.message });
			return;
		}
	}

	sendJson(res, 404, { error: "Not found" });
});

server.listen(port, () => {
	console.log(`API listening on http://localhost:${port}`);
});
