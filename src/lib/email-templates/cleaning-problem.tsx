import * as React from "react";
import { Html, Head, Body, Container, Heading, Text, Img, Hr, Section } from "@react-email/components";
import type { TemplateEntry } from "./registry";

interface Props {
  propertyName?: string;
  cleanerName?: string;
  urgency?: "low" | "medium" | "high";
  description?: string;
  photoUrl?: string;
  sentAt?: string;
}

const URGENCY_COLOR: Record<string, string> = {
  low: "#15803d",
  medium: "#d97706",
  high: "#991b1b",
};

function CleaningProblemEmail({
  propertyName = "Property",
  cleanerName = "Cleaner",
  urgency = "medium",
  description = "",
  photoUrl = "",
  sentAt = "",
}: Props) {
  const color = URGENCY_COLOR[urgency] ?? "#d97706";
  return (
    <Html>
      <Head />
      <Body style={{ background: "#f6f7f9", fontFamily: "Inter, Arial, sans-serif", margin: 0 }}>
        <Container style={{ background: "#fff", maxWidth: 560, margin: "32px auto", padding: 32, borderRadius: 12, borderTop: `4px solid ${color}` }}>
          <Heading style={{ fontSize: 20, margin: "0 0 4px", color }}>🚨 Problem reported · {propertyName}</Heading>
          <Text style={{ color: "#666", fontSize: 13, margin: 0 }}>
            From {cleanerName} · Urgency: <strong style={{ color }}>{urgency.toUpperCase()}</strong>{sentAt ? ` · ${sentAt}` : ""}
          </Text>
          {description && (
            <Text style={{ color: "#222", fontSize: 15, marginTop: 16, lineHeight: 1.5 }}>{description}</Text>
          )}
          {photoUrl && (
            <Section style={{ marginTop: 20 }}>
              <Img src={photoUrl} alt="Problem photo" style={{ width: "100%", borderRadius: 8, maxHeight: 600, objectFit: "cover" }} />
            </Section>
          )}
          <Hr style={{ borderColor: "#eee", margin: "24px 0" }} />
          <Text style={{ color: "#aaa", fontSize: 12 }}>Sent via Hostlyb. The photo is delivered only — not stored on our servers.</Text>
        </Container>
      </Body>
    </Html>
  );
}

export const template = {
  component: CleaningProblemEmail,
  displayName: "Cleaning Problem",
  subject: (d: Record<string, any>) =>
    `🚨 [${(d.urgency ?? "medium").toUpperCase()}] Problem at ${d.propertyName ?? "your property"}`,
  previewData: {
    propertyName: "Lisbon Loft #2",
    cleanerName: "Ana",
    urgency: "high" as const,
    description: "Broken window in the living room, needs immediate attention.",
    photoUrl: "https://placehold.co/600x400",
    sentAt: "May 18, 2026 14:32",
  },
} satisfies TemplateEntry;
