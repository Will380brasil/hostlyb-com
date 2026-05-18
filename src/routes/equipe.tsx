import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Copy, Mail, Trash2, UserPlus, Crown, Shield, User as UserIcon } from "lucide-react";
import { publicUrl } from "@/lib/public-url";
import { sendTransactionalEmail } from "@/lib/email/send";
import { toast } from "sonner";

export const Route = createFileRoute("/equipe")({
  head: () => ({ meta: [{ title: "Equipe — Hostlyb" }] }),
  component: EquipePage,
});

function EquipePage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"staff" | "admin">("staff");
  const [error, setError] = useState<string | null>(null);

  const { data: org } = useQuery({
    queryKey: ["my-org", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data: m } = await supabase
        .from("organization_members")
        .select("role, organization_id, organizations(id, name, max_members, owner_id)")
        .eq("user_id", user!.id)
        .maybeSingle();
      return m;
    },
  });

  const orgId = (org as any)?.organization_id as string | undefined;
  const myRole = (org as any)?.role as string | undefined;
  const orgInfo = (org as any)?.organizations;
  const canManage = myRole === "owner" || myRole === "admin";

  const { data: members = [] } = useQuery({
    queryKey: ["org-members", orgId],
    enabled: !!orgId,
    queryFn: async () => {
      const { data } = await supabase
        .from("organization_members")
        .select("id, role, user_id, created_at, profiles:user_id(display_name, email, avatar_url)")
        .eq("organization_id", orgId!)
        .order("created_at");
      return data ?? [];
    },
  });

  const { data: invites = [] } = useQuery({
    queryKey: ["org-invites", orgId],
    enabled: !!orgId,
    queryFn: async () => {
      const { data } = await supabase
        .from("organization_invites")
        .select("*")
        .eq("organization_id", orgId!)
        .is("accepted_at", null)
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const invite = useMutation({
    mutationFn: async () => {
      setError(null);
      if (!orgId || !user) throw new Error("no-org");
      if (members.length + invites.length >= (orgInfo?.max_members ?? 5)) {
        throw new Error("Limite de 5 usuários atingido neste plano.");
      }
      const { data: inserted, error } = await supabase
        .from("organization_invites")
        .insert({
          organization_id: orgId,
          email: email.trim().toLowerCase(),
          role,
          invited_by: user.id,
        })
        .select("id, token, email, role")
        .single();
      if (error) throw error;

      // Send invite email (best-effort — failure should not roll back the invite).
      try {
        const { data: inviterProfile } = await supabase
          .from("profiles")
          .select("display_name, email")
          .eq("id", user.id)
          .maybeSingle();
        await sendTransactionalEmail({
          templateName: "invite-employee",
          recipientEmail: inserted.email,
          idempotencyKey: `invite-${inserted.id}`,
          templateData: {
            organizationName: orgInfo?.name ?? "your team",
            inviterName: inviterProfile?.display_name ?? inviterProfile?.email ?? "A teammate",
            acceptUrl: publicUrl(`/convite/${inserted.token}`),
            role: inserted.role,
          },
        });
      } catch (e) {
        console.warn("Failed to send invite email", e);
        toast.warning("Convite criado, mas e-mail não enviado. Compartilhe o link manualmente.");
      }
    },
    onSuccess: () => {
      setEmail("");
      qc.invalidateQueries({ queryKey: ["org-invites", orgId] });
      toast.success("Convite enviado");
    },
    onError: (e: any) => setError(e.message ?? "Erro ao convidar"),
  });

  const removeMember = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("organization_members").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["org-members", orgId] }),
  });

  const removeInvite = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("organization_invites").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["org-invites", orgId] }),
  });

  const inviteLink = (token: string) => publicUrl(`/convite/${token}`);
  const copy = (text: string) => navigator.clipboard.writeText(text);

  const used = members.length + invites.length;
  const max = orgInfo?.max_members ?? 5;

  const roleIcon = (r: string) =>
    r === "owner" ? <Crown size={12} /> : r === "admin" ? <Shield size={12} /> : <UserIcon size={12} />;

  return (
    <AppShell>
      <section className="mb-4">
        <p className="text-sm text-muted-foreground">Workspace</p>
        <h2 className="text-2xl font-bold">{orgInfo?.name ?? "Sua equipe"}</h2>
        <p className="text-xs text-muted-foreground mt-1">{used} de {max} usuários</p>
      </section>

      {canManage && (
        <section className="hostly-card !p-4 mb-5">
          <h3 className="font-bold mb-3 flex items-center gap-2"><UserPlus size={16}/> Convidar funcionário</h3>
          <div className="flex flex-col gap-2">
            <input
              type="email" placeholder="email@exemplo.com" value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="px-3 py-2 rounded-lg bg-background border border-card-border text-sm"
            />
            <select value={role} onChange={(e) => setRole(e.target.value as any)}
              className="px-3 py-2 rounded-lg bg-background border border-card-border text-sm">
              <option value="staff">Funcionário</option>
              <option value="admin">Administrador</option>
            </select>
            <button
              disabled={!email || invite.isPending || used >= max}
              onClick={() => invite.mutate()}
              className="px-4 py-2.5 rounded-lg font-semibold text-sm text-white disabled:opacity-50"
              style={{ background: "var(--color-accent)" }}
            >
              {invite.isPending ? "Enviando..." : "Enviar convite"}
            </button>
            {error && <p className="text-xs text-destructive">{error}</p>}
          </div>
        </section>
      )}

      <section className="mb-5">
        <h3 className="font-bold mb-3">Membros ({members.length})</h3>
        <ul className="flex flex-col gap-2">
          {members.map((m: any) => (
            <li key={m.id} className="hostly-card !p-3 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-muted grid place-items-center text-xs font-bold">
                {(m.profiles?.display_name ?? m.profiles?.email ?? "?").charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">{m.profiles?.display_name ?? m.profiles?.email}</p>
                <p className="text-xs text-muted-foreground truncate">{m.profiles?.email}</p>
              </div>
              <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wide px-2 py-1 rounded-full bg-muted">
                {roleIcon(m.role)} {m.role}
              </span>
              {canManage && m.role !== "owner" && m.user_id !== user?.id && (
                <button onClick={() => removeMember.mutate(m.id)} className="text-muted-foreground hover:text-destructive">
                  <Trash2 size={14} />
                </button>
              )}
            </li>
          ))}
        </ul>
      </section>

      {invites.length > 0 && (
        <section>
          <h3 className="font-bold mb-3">Convites pendentes ({invites.length})</h3>
          <ul className="flex flex-col gap-2">
            {invites.map((i: any) => (
              <li key={i.id} className="hostly-card !p-3 flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Mail size={14} className="text-muted-foreground" />
                  <span className="text-sm font-medium flex-1 truncate">{i.email}</span>
                  <span className="text-[10px] uppercase px-2 py-0.5 rounded-full bg-muted">{i.role}</span>
                  {canManage && (
                    <button onClick={() => removeInvite.mutate(i.id)} className="text-muted-foreground hover:text-destructive">
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-[10px] truncate px-2 py-1 rounded bg-background border border-card-border">
                    {inviteLink(i.token)}
                  </code>
                  <button onClick={() => copy(inviteLink(i.token))} className="px-2 py-1 rounded bg-muted text-xs flex items-center gap-1">
                    <Copy size={12} /> Copiar
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </AppShell>
  );
}
