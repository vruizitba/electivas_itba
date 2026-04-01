import { CareerDetailPage } from "../../../components/career-detail-page";

export default async function CareerRoutePage({ params }) {
	const resolvedParams = await params;
	const slug = Array.isArray(resolvedParams?.slug) ? resolvedParams.slug[0] : resolvedParams?.slug;

	return <CareerDetailPage slug={slug || ""} />;
}
