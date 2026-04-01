"use client";

import { useParams } from "next/navigation";

import { CareerDetailPage } from "../../../components/career-detail-page";

export default function CareerRoutePage() {
	const params = useParams();
	const slug = Array.isArray(params?.slug) ? params.slug[0] : params?.slug;

	return <CareerDetailPage slug={slug || ""} />;
}
