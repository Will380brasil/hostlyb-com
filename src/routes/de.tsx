import { createFileRoute } from "@tanstack/react-router";
import { buildLandingHead } from "@/lib/landing-head";
import { LandingLocale } from "@/components/LandingLocale";

export const Route = createFileRoute("/de")({
  head: () => buildLandingHead("de"),
  component: () => <LandingLocale lang="de" />,
});
