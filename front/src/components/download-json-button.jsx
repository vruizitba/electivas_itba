function buildFilename(slug) {
	const stamp = new Date().toISOString().slice(0, 10);
	return `${slug}_electivas_${stamp}.json`;
}

export function DownloadJsonButton({ slug, payload }) {
	function handleDownload() {
		const blob = new Blob([`${JSON.stringify(payload, null, 2)}\n`], { type: "application/json;charset=utf-8" });
		const url = URL.createObjectURL(blob);
		const anchor = document.createElement("a");
		anchor.href = url;
		anchor.download = buildFilename(slug);
		anchor.click();
		URL.revokeObjectURL(url);
	}

	return (
		<button type="button" className="md-button md-button--tonal" onClick={handleDownload}>
			Descargar JSON
		</button>
	);
}
