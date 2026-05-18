import { createFileRoute } from "@tanstack/react-router";
import { buildLandingHead } from "@/lib/landing-head";
import { LandingLocale } from "@/components/LandingLocale";

export const Route = createFileRoute("/it")({
  head: () => buildLandingHead("it"),
  component: () => <LandingLocale lang="it" />,
});
