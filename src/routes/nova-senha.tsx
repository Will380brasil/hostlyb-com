import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/nova-senha")({
    head: () => ({
          meta: [
            { title: "Criar nova senha — Hostlyb" },
            { name: "description", content: "Crie uma nova senha para a sua conta." },
                ],
    }),
    component: ResetPasswordPage,
});

function getPasswordStrength(p: string): { level: number; label: string; color: string } {
    if (!p) return { level: 0, label: "", color: "#EFEFEF" };
    if (p.length < 6) return { level: 1, label: "Muito fraca", color: "#FF6B6B" };
    if (p.length < 8) return { level: 2, label: "Fraca", color: "#FFB347" };
    const score = [/[A-Z]/.test(p), /[0-9]/.test(p), /[^A-Za-z0-9]/.test(p)].filter(Boolean).length;
    if (score === 0) return { level: 2, label: "Fraca", color: "#FFB347" };
    if (score === 1) return { level: 3, label: "Média", color: "#4A9EFF" };
    if (score === 2) return { level: 4, label: "Forte", color: "#00C896" };
    return { level: 5, label: "Muito forte", color: "#00C896" };
}

function translateError(msg: string): string {
    const map: Record<string, string> = {
          "Invalid token": "Link expirado ou inválido. Solicite um novo.",
          "Token expired": "Link expirado. Solicite uma nova recuperação.",
          "Password too weak": "Senha muito fraca. Use maiúsculas, números e símbolos.",
          "Password is known to be weak": "Senha muito comum. Escolha outra.",
          "Password should be at least": "A senha deve ter pelo menos 6 caracteres.",
          "Failed to fetch": "Sem ligação. Verifique a internet.",
          "Network error": "Erro de ligação. Verifique a internet.",
    };
    for (const [key, value] of Object.entries(map)) {
          if (msg.toLowerCase().includes(key.toLowerCase())) return value;
    }
    return "Erro ao atualizar a senha. Tente novamente.";
}

function ResetPasswordPage() {
    const navigate = useNavigate();
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [sessionValid, setSessionValid] = useState<boolean | null>(null);
    const strength = getPasswordStrength(password);

  useEffect(() => {
        const checkSession = async () => {
                const { data: { session } } = await supabase.auth.getSession();
                if (session) {
                          setSessionValid(true);
                } else {
                          setSessionValid(false);
                          setError("Link expirado ou inválido. Solicite uma nova recuperação.");
                }
        };
        const timer = setTimeout(checkSession, 500);
        return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!password.trim()) { toast.error("Digite a nova senha."); return; }
        if (password.length < 6) { toast.error("A senha deve ter pelo menos 6 caracteres."); return; }
        if (password !== confirmPassword) { toast.error("As senhas não coincidem."); return; }
        setLoading(true);
        try {
                const { error } = await supabase.auth.updateUser({ password: password });
                if (error) { toast.error(translateError(error.message)); setLoading(false); return; }
                setSuccess(true);
                toast.success("Senha atualizada com sucesso! ✅");
                setTimeout(() => { navigate({ to: "/login", replace: true }); }, 2000);
        } catch (err: any) {
                toast.error(translateError(err?.message || "Erro inesperado."));
                setLoading(false);
        }
  };

  if (sessionValid === null) {
        return (
                <div className="min-h-screen grid place-items-center px-5 bg-background">
                        <div className="w-full max-w-sm text-center">
                                  <div style={{ fontSize: 32, marginBottom: 16 }}>⏳</div>
                                  <p className="text-muted-foreground">A processar…</p>
                        </div>
                </div>
              );
  }
  
    if (!sessionValid || error) {
          return (
                  <div className="min-h-screen grid place-items-center px-5 bg-background">
                          <div className="w-full max-w-sm text-center">
                                    <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
                                    <h1 className="text-2xl font-bold mb-2">Link inválido ou expirado</h1>
                                    <p className="text-sm text-muted-foreground mb-6">{error}</p>
                                    <div style={{ background: "#FEE7E7", border: "1px solid #FF6B6B30", borderRadius: 10, padding: "14px", marginBottom: 20, fontSize: 12, color: "#C92A2A" }}>
                                                💡 Solicite uma nova recuperação de senha e não perca o tempo.
                                    </div>
                                    <Link to="/esqueci-senha" style={{ display: "inline-block", padding: "12px 24px", background: "var(--color-accent)", color: "#fff", borderRadius: 10, fontWeight: 700, textDecoration: "none", marginBottom: 10 }}>
                                                Solicitar novo link
                                    </Link>
                                    <p className="text-xs text-muted-foreground mt-4">
                                                Voltar para <Link to="/login" style={{ color: "var(--color-accent)", fontWeight: 700, textDecoration: "none" }}>Login</Link>
                                    </p>
                          </div>
                  </div>
                );
    }
  
    if (success) {
          return (
                  <div className="min-h-screen grid place-items-center px-5 bg-background">
                          <div className="w-full max-w-sm text-center">
                                    <div style={{ fontSize: 56, marginBottom: 16 }}>✅</div>
                                    <h1 className="text-3xl font-bold mb-2">Senha atualizada!</h1>
                                    <p className="text-sm text-muted-foreground mb-6">
                                                A sua senha foi alterada com sucesso. Pode agora entrar com a nova senha.
                                    </p>
                                    <div style={{ background: "#F0FDF9", border: "1px solid #00C89630", borderRadius: 10, padding: "14px", marginBottom: 20, fontSize: 12, color: "#00C896" }}>
                                                🔒 A sua conta está segura.
                                    </div>
                                    <Link to="/login" style={{ display: "inline-block", padding: "12px 24px", background: "var(--color-accent)", color: "#fff", borderRadius: 10, fontWeight: 700, textDecoration: "none" }}>
                                                Ir para login
                                    </Link>
                                    <p className="text-xs text-muted-foreground mt-4">
                                                A redirecionar automaticamente em 2 segundos…
                                    </p>
                          </div>
                  </div>
                );
    }</div>

        return (
          <div className="min-h-screen grid place-items-center px-5 bg-background">
                <div className="w-full max-w-sm">
                        <Link to="/" className="block mb-1">
                                  <h1 className="text-3xl font-bold">
                                              Host<span style={{ color: "var(--color-accent)" }}>lyb</span>
                                  </h1>
                        </Link>
                        <p className="text-sm text-muted-foreground mb-6">Criar nova senha</p>
                        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                                  <div>
                                              <label style={{ fontSize: 12, fontWeight: 700, display: "block", marginBottom: 5, color: "#212121" }}>
                                                            NOVA SENHA *
                                              </label>
                                              <div style={{ position: "relative" }}>
                                                            <input
                                                                              type={showPassword ? "text" : "password"}
                                                                              required
                                                                              placeholder="Mínimo 6 caracteres"
                                                                              value={password}
                                                                              onChange={(e) => setPassword(e.target.value)}
                                                                              autoComplete="new-password"
                                                                              className="w-full px-4 py-3 rounded-xl bg-card border border-card-border"
                                                                              style={{ paddingRight: 44 }}
                                                                            />
                                                            <button
                                                                              type="button"
                                                                              onClick={() => setShowPassword(!showPassword)}
                                                                              style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#9E9E9E", display: "flex", alignItems: "center" }}
                                                                            >
                                                              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                                            </button>
                                              </div>
                                    {password && (
                    <div style={{ marginTop: 6 }}>
                                    <div style={{ display: "flex", gap: 4 }}>
                                      {[1, 2, 3, 4, 5].m  
                                        ap((i) => (
                                          <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= strength.level ? strength.color : "#EFEFEF", transition: "background 0.3s" }} />
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
                                                            CONFIRMAR SENHA *
                                              </label>
                                              <div style={{ position: "relative" }}>
                                                            <input
                                                                              type={showConfirmPassword ? "text" : "password"}
                                                                              required
                                                                              placeholder="Repita a senha"
                                                                              value={confirmPassword}
                                                                              onChange={(e) => setConfirmPassword(e.target.value)}
                                                                              autoComplete="new-password"
                                                                              className="w-full px-4 py-3 rounded-xl bg-card border border-card-border"
                                                                              style={{ paddingRight: 44 }}
                                                                            />
                                                            <button
                                                                              type="button"
                                                                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                                              style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#9E9E9E", display: "flex", alignItems: "center" }}
                                                                            >
                                                              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                                            </button>
                                              </div>
                                    {confirmPassword && password !== confirmPassword && (
                    <div style={{ fontSize: 11, color: "#FF6B6B", fontWeight: 600, marginTop: 3 }}>
                                    ⚠️ As senhas não coincidem
                    </div>
                                              )}
                                    {confirmPassword && password === confirmPassword && (
                    <div style={{ fontSize: 11, color: "#00C896", fontWeight: 600, marginTop: 3 }}>
                                    ✅ As senhas coincidem
                    </div>
                                              )}
                                  </div>
                                  <button
                                                type="submit"
                                                disabled={loading || !password || password.length < 6 || password !== confirmPassword}
                                                className="btn-primary justify-center"
                                                style={{ padding: "12px", fontWeight: 700, opacity: !password || password.length < 6 || password !== confirmPassword ? 0.5 : 1, cursor: !password || password.length < 6 || password !== confirmPassword ? "not-allowed" : "pointer" }}
                                              >
                                    {loading ? "A atualizar…" : "Atualizar senha"}
                                  </button>
                        </form>
                        <div style={{ marginTop: 16, padding: "12px 14px", background: "#FFF8E6", border: "1px solid #FFB34740", borderRadius: 10, fontSize: 12, color: "#92600A" }}>
                                  <strong>🔒 Segurança</strong> Use uma senha forte com maiúsculas, números e símbolos.
                        </div>
                        <div style={{ marginTop: 20, textAlign: "center", fontSize: 14 }}>
                                  <p className="text-muted-foreground">
                                              Link expirou? <Link to="/esqueci-senha" style={{ color: "var(--color-accent)", fontWeight: 700, textDecoration: "none" }}>Solicitar novo</Link>
                                  </p>
                        </div>
                </div>
          </div>
      );
      }
      }</div>
