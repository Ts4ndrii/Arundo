import dynamic from "next/dynamic";
import type { Metadata } from "next";
import { buildRouteMetadata } from "@/lib/site-metadata";

export async function generateMetadata(): Promise<Metadata> {
  return buildRouteMetadata("map");
}

const MapExplorer = dynamic(() => import("@/components/MapExplorer"), {
  ssr: false,
  loading: () => (
    <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="h-[42rem] rounded-[2rem] border border-slate-200 bg-white shadow-sm" />
    </main>
  ),
});

export default function MapPage() {
  return <MapExplorer />;
}