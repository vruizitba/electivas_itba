import "./globals.css";

export const metadata = {
	title: "Electivas ITBA",
	description: "Frontend Next.js para consumir la API de electivas",
};

export default function RootLayout({ children }) {
	return (
		<html lang="es">
			<body>{children}</body>
		</html>
	);
}
