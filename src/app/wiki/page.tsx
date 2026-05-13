import type { Metadata } from "next";
import { WikiExplorer } from "@/components/wiki/WikiExplorer";
import { buildRouteMetadata } from "@/lib/site-metadata";

export async function generateMetadata(): Promise<Metadata> {
  return buildRouteMetadata("wiki");
}

export default function WikiPage({ searchParams }: { searchParams?: { water?: string } }) {
  return <WikiExplorer initialWaterId={searchParams?.water ?? null} />;
}