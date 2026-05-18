import { createFileRoute } from "@tanstack/react-router";
import { buildLandingHead } from "@/lib/landing-head";
import { LandingLocale } from "@/components/LandingLocale";

export const Route = createFileRoute("/fr")({
  head: () => buildLandingHead("fr"),
  component: () => <LandingLocale lang="fr" />,
});
