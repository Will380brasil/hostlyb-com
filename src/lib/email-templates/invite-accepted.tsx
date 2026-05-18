import * as React from "react";
import { Html, Head, Body, Container, Heading, Text, Hr } from "@react-email/components";
import type { TemplateEntry } from "./registry";

interface Props {
  inviteeName?: string;
  inviteeEmail?: string;
  organizationName?: string;
}

function InviteAcceptedEmail({
  inviteeName = "Your teammate",
  inviteeEmail = "",
  organizationName = "your workspace",
}: Props) {
  return (
    <Html>
      <Head />
      <Body style={{ background: "#ffffff", fontFamily: "Inter, Arial, sans-serif", margin: 0 }}>
        <Container style={{ background: "#fff", maxWidth: 560, margin: "32px auto", padding: 32, borderRadius: 12, border: "1px solid #eee" }}>
          <Heading style={{ fontSize: 20, margin: "0 0 8px" }}>
            ✅ {inviteeName} aceitou o seu convite
          </Heading>
          <Text style={{ color: "#555", fontSize: 14 }}>
            <strong>{inviteeName}</strong>{inviteeEmail ? ` (${inviteeEmail})` : ""} já é membro de <strong>{organizationName}</strong> no Hostlyb.
          </Text>
          <Hr style={{ borderColor: "#eee", margin: "24px 0" }} />
          <Text style={{ color: "#888", fontSize: 12 }}>
            Pode gerir a sua equipa em hostlyb.com/equipe.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export const template = {
  component: InviteAcceptedEmail,
  displayName: "Invite Accepted Notification",
  subject: (d: Record<string, any>) => `${d.inviteeName ?? "A teammate"} aceitou o seu convite`,
  previewData: {
    inviteeName: "Maria",
    inviteeEmail: "maria@example.com",
    organizationName: "Acme Hosts",
  },
} satisfies TemplateEntry;
