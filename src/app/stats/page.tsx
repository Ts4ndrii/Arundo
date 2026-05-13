import type { Metadata } from "next";
import StatsDashboard from "@/components/StatsDashboard";
import { buildRouteMetadata } from "@/lib/site-metadata";

export async function generateMetadata(): Promise<Metadata> {
  return buildRouteMetadata("stats");
}

export default function StatsPage() {
  return <StatsDashboard />;
}