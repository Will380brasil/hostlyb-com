import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/nova-senha")({
      head: () => ({
              meta: [{ title: "Nova senha — Hostlyb" }],
      }),
      component: ResetPasswordPage,
});

function getStrength(p: string): { level: number; label: string; color: string } {
      if (!p) return { level: 0, label: "", color: "#EFEFEF" };
      if (p.length < 6) return { level: 1, label: "Muito fraca", color: "#FF6B6B" };
      if (p.length < 8) return { level: 2, label: "Fraca", color: "#FFB347" };
      const score = [/[A-Z]/.test(p), /[0-9]/.test(p), /[^A-Za-z0-9]/.test(p)].filter(Boolean).length;
      if (score <= 0) return { level: 2, label: "Fraca", color: "#FFB347" };
      if (score === 1) return { level: 3, label: "Média", color: "#4A9EFF" };
      if (score === 2) return { level: 4, label: "Forte", color: "#00C896" };
      return { level: 5, label: "Muito forte", color: "#00C896" };
}

function ResetPasswordPage() {
      const navigate = useNavigate();
      const [password, setPassword] = useState("");
      const [confirm, setConfirm] = useState("");
      const [showPassword, setShowPassword] = useState(false);
      const [loading, setLoading] = useState(false);
      const [success, setSuccess] = useState(false);
      const [validToken, setValidToken] = useState<boolean | null>(null);
                const strength = getStrength(password);

  useEffect(() => {
          const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
                    if (event === "PASSWORD_RECOVERY") {
                                setValidToken(true);
                    }
          });
          const hash = window.location.hash;
          if (hash.includes("type=recovery")) {
                    setValidToken(true);
          } else {
                    setTimeout(() => {
                                setValidToken((prev) => prev === null ? false : prev);
                    }, 3000);
          }
          return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
          e.preventDefault();
          if (password.length < 6) { toast.error("Mínimo 6 caracteres."); return; }
          if (password !== confirm) { toast.error("As senhas não coincidem."); return; }
          setLoading(true);
          try {
                    const { error } = await supabase.auth.updateUser({ password });
                    if (error) {
                                toast.error("Erro ao atualizar. O link pode ter expirado. Peça um novo.");
                    } else {
                                setSuccess(true);
                                toast.success("Senha atualizada com sucesso!");
                                setTimeout(() => navigate({ to: "/app" as any }), 2000);
                    }
          } catch {
                    toast.error("Erro inesperado. Tente novamente.");
          } finally {
                    setLoading(false);
          }
  };

  if (validToken === null) {
          return (
                    <div className="min-h-screen grid place-items-center bg-background">
            <div className="text-center">
                      <div style={{ fontSize: 40, marginBottom: 12 }}>🔐</div>
                      <p className="text-sm text-muted-foreground">A verificar link…</p>
            </div>
                    </div>
                  );
  }
    
      if (validToken === false) {
              return (
                        <div className="min-h-screen grid place-items-center px-5 bg-background">
                                <div className="w-full max-w-sm text-center">
                                          <div style={{ fontSize: 56, marginBottom: 16 }}>⚠️</div>
                                          <h2 className="text-xl font-black mb-2">Link inválido ou expirado</h2>
                                          <p className="text-sm text-muted-foreground mb-6" style={{ lineHeight: 1.7 }}>
                                                      Este link de recuperação não é válido ou já expirou.<br />
                                                      Peça um novo link de recuperação.
                                          </p>
                                          <a
                                                          href="/esqueci-senha"
                                                          style={{
                                                                            display: "inline-block", padding: "12px 32px",
                                                                            background: "var(--color-accent)", color: "#fff",
                                                                            borderRadius: 10, fontWeight: 700, fontSize: 14,
                                                                            textDecoration: "none",
                                                          }}
                                                        >
                                                      Pedir novo link
                                          </a>
                                </div>
                        </div>
                      );
      }
    
      if (success) {
              return (
                        <div className="min-h-screen grid place-items-center bg-background">
                                <div className="text-center">
                                          <div style={{ fontSize: 56, marginBottom: 12 }}>✅</div>
                                          <h2 className="text-xl font-black">Senha atualizada!</h2>
                                          <p className="text-sm text-muted-foreground mt-2">A redirecionar…</p>
                                </div>
                        </div>
                      );
      }
    
      return (
              <div className="min-h-screen grid place-items-center px-5 bg-background">
                    <div className="w-full max-w-sm">
                            <h1 className="text-3xl font-black mb-1">
                                      Host<span style={{ color: "var(--color-accent)" }}>lyb</span>
                            </h1>
                            <p className="text-sm text-muted-foreground mb-6">
                                      Definir nova palavra-passe
                            </p>
                            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                                      <div>
                                                  <label style={{ fontSize: 12, fontWeight: 700, display: "block", marginBottom: 5, color: "#212121" }}>
                                                                NOVA SENHA
                                                  </label>
                                                  <div style={{ position: "relative" }}>
                                                                <input
                                                                                    type={showPassword ? "text" : "password"}
                                                                                    placeholder="•••••••• (mín. 6 caracteres)"
                                                                                    value={password}
                                                                                    onChange={(e) => setPassword(e.target.value)}
                                                                                    autoFocus
                                                                                    className="w-full px-4 py-3 rounded-xl bg-card border border-card-border"
                                                                                    style={{ paddingRight: 44 }}
                                                                                  />
                                                                <button
                                                                                    type="button"
                                                                                    onClick={() => setShowPassword(!showPassword)}
                                                                                    style={{
                                                                                                          position: "absolute", right: 12,
                                                                                                          top: "50%", transform: "translateY(-50%)",
                                                                                                          background: "none", border: "none",
                                                                                                          cursor: "pointer", color: "#9E9E9E",
                                                                                                          display: "flex", alignItems: "center",
                                                                                        }}
                                                                                  >
                                                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                                                </button>
                                                  </div>
                                          {password && (
                                <div style={{ marginTop: 6 }}>
                                                <div style={{ display: "flex", gap: 4 }}>
                                                    {[1, 2, 3, 4, 5].map((i) => (
                                                        <div key={i} style={{
                                                                                  flex: 1, height: 3, borderRadius: 2,
                                                                                  background: i <= strength.level ? strength.color : "#EFEFEF",
                                                                                  transition: "background 0.3s",
                                                        }} />
                                                      ))}
                                                </div>
                                                <div style={{ fontSize: 11, color: strength.color, fontWeight: 600, marginTop: 3 }}>
                                                    {strength.label}
                                                </div>
                                </div>
                                                  )}
                                      </div>
                                      <div>
                                                  <label style={{ fontSize: 12, fontWeight: 700, display: "block", marginBottom: 5, color: "#212121" }}>
                                                                CONFIRMAR SENHA
                                                  </label>
                                                  <input
                                                                    type={showPassword ? "text" : "password"}
                                                                    placeholder="Repita a palavra-passe"
                                                                    value={confirm}
                                                                    onChange={(e) => setConfirm(e.target.value)}
                                                                    className="w-full px-4 py-3 rounded-xl bg-card border border-card-border"
                                                                    style={{
                                                                                        borderColor: confirm && confirm !== password ? "#FF6B6B" : undefined
                                                                        }}
                                                                  />
                                          {confirm && confirm !== password && (
                                <p style={{ fontSize: 12, color: "#FF6B6B", marginTop: 4 }}>
                                                ⚠ As senhas não coincidem
                                </p>
                                                  )}
                                          {confirm && confirm === password && password.length >= 6 && (
                                <p style={{ fontSize: 12, color: "#00C896", marginTop: 4 }}>
                                                ✓ Senhas coincidem
                                </p>
                                                  )}
                                      </div>
                                      <button
                                                      type="submit"
                                                      disabled={loading || password.length < 6 || password !== confirm}
                                                      className="btn-primary justify-center"
                                                      style={{
                                                                        opacity: (loading || password.length < 6 || password !== confirm) ? 0.7 : 1
                                                      }}
                                                    >
                                          {loading ? "A guardar…" : "✅ Definir nova senha"}
                                      </button>
                                      <a
                                                      href="/login"
                                                      className="text-center text-sm text-muted-foreground"
                                                      style={{ textDecoration: "none" }}
                                                    >
                                                  ← Voltar ao login
                                      </a>
                            </form>
                    </div>
              </div>
            );
}
