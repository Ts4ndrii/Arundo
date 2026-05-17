import type { Metadata } from "next";
import { Suspense } from "react";
import { WikiExplorer } from "@/components/wiki/WikiExplorer";
import { buildRouteMetadata } from "@/lib/site-metadata";

export async function generateMetadata(): Promise<Metadata> {
  return buildRouteMetadata("wiki");
}

function WikiPageContent({ waterId, fishId }: { waterId?: string; fishId?: string }) {
  return <WikiExplorer initialWaterId={waterId ?? null} initialFishId={fishId ?? null} />;
}

export default function WikiPage({ searchParams }: { searchParams?: { water?: string; fish?: string } }) {
  return (
    <Suspense fallback={<div className="flex h-96 items-center justify-center">Завантаження...</div>}>
      <WikiPageContent waterId={searchParams?.water} fishId={searchParams?.fish} />
    </Suspense>
  );
}