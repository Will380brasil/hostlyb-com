import * as React from "react";
import { Html, Head, Body, Container, Section, Heading, Text, Button, Hr } from "@react-email/components";
import type { TemplateEntry } from "./registry";

interface Props {
  organizationName?: string;
  inviterName?: string;
  acceptUrl?: string;
  role?: string;
}

function InviteEmployeeEmail({
  organizationName = "Your team",
  inviterName = "A teammate",
  acceptUrl = "https://hostlyb.com",
  role = "staff",
}: Props) {
  return (
    <Html>
      <Head />
      <Body style={{ background: "#f6f7f9", fontFamily: "Inter, Arial, sans-serif", margin: 0 }}>
        <Container style={{ background: "#fff", maxWidth: 560, margin: "32px auto", padding: 32, borderRadius: 12 }}>
          <Heading style={{ fontSize: 22, margin: "0 0 8px" }}>You've been invited to {organizationName}</Heading>
          <Text style={{ color: "#555", fontSize: 15 }}>
            {inviterName} invited you to join <strong>{organizationName}</strong> on Hostlyb as <strong>{role}</strong>.
          </Text>
          <Section style={{ textAlign: "center", margin: "28px 0" }}>
            <Button href={acceptUrl} style={{ background: "#0f0f0f", color: "#fff", padding: "12px 28px", borderRadius: 8, fontWeight: 600, textDecoration: "none" }}>
              Accept invitation
            </Button>
          </Section>
          <Text style={{ color: "#888", fontSize: 13 }}>
            Or copy this link into your browser:<br />
            <a href={acceptUrl} style={{ color: "#0f0f0f", wordBreak: "break-all" }}>{acceptUrl}</a>
          </Text>
          <Hr style={{ borderColor: "#eee", margin: "24px 0" }} />
          <Text style={{ color: "#aaa", fontSize: 12 }}>This invite expires in 7 days. If you weren't expecting this email you can ignore it.</Text>
        </Container>
      </Body>
    </Html>
  );
}

export const template = {
  component: InviteEmployeeEmail,
  displayName: "Invite Employee",
  subject: (d: Record<string, any>) => `You've been invited to ${d.organizationName ?? "a team"} on Hostlyb`,
  previewData: {
    organizationName: "Acme Hosts",
    inviterName: "Maria",
    acceptUrl: "https://hostlyb.com/convite/abc-123",
    role: "staff",
  },
} satisfies TemplateEntry;
