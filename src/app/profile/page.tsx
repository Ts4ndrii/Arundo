import type { Metadata } from "next";
import ProfilePageContent from "@/components/ProfilePageContent";
import { buildRouteMetadata } from "@/lib/site-metadata";

export async function generateMetadata(): Promise<Metadata> {
  return buildRouteMetadata("profile");
}

export default function ProfilePage() {
  return <ProfilePageContent />;
}