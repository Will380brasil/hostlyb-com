import * as React from "react";
import { Html, Head, Body, Container, Heading, Text, Img, Hr, Section } from "@react-email/components";
import type { TemplateEntry } from "./registry";

interface Props {
  propertyName?: string;
  cleanerName?: string;
  roomName?: string;
  description?: string;
  photoUrl?: string;
  sentAt?: string;
}

function CleaningPhotoEmail({
  propertyName = "Property",
  cleanerName = "Cleaner",
  roomName = "",
  description = "",
  photoUrl = "",
  sentAt = "",
}: Props) {
  return (
    <Html>
      <Head />
      <Body style={{ background: "#f6f7f9", fontFamily: "Inter, Arial, sans-serif", margin: 0 }}>
        <Container style={{ background: "#fff", maxWidth: 560, margin: "32px auto", padding: 32, borderRadius: 12 }}>
          <Heading style={{ fontSize: 20, margin: "0 0 4px" }}>📷 Cleaning photo · {propertyName}</Heading>
          <Text style={{ color: "#666", fontSize: 13, margin: 0 }}>
            From {cleanerName}{roomName ? ` · ${roomName}` : ""}{sentAt ? ` · ${sentAt}` : ""}
          </Text>
          {description && (
            <Text style={{ color: "#333", fontSize: 15, marginTop: 16 }}>{description}</Text>
          )}
          {photoUrl && (
            <Section style={{ marginTop: 20 }}>
              <Img src={photoUrl} alt="Cleaning photo" style={{ width: "100%", borderRadius: 8, maxHeight: 600, objectFit: "cover" }} />
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
  component: CleaningPhotoEmail,
  displayName: "Cleaning Photo",
  subject: (d: Record<string, any>) => `📷 ${d.propertyName ?? "Property"} — ${d.roomName ?? "cleaning photo"}`,
  previewData: {
    propertyName: "Lisbon Loft #2",
    cleanerName: "Ana",
    roomName: "Kitchen",
    description: "Finished cleaning the kitchen.",
    photoUrl: "https://placehold.co/600x400",
    sentAt: "May 18, 2026 14:32",
  },
} satisfies TemplateEntry;
