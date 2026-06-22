import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/esqueci-senha")({
        head: () => ({
                  meta: [
                        { title: "Recuperar senha — Hostlyb" },
                        { name: "description", content: "Recupere o acesso à sua conta Hostlyb." },
                            ],
        }),
        component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
        const [email, setEmail] = useState("");
        const [sent, setSent] = useState(false);
        const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
            e.preventDefault();
            if (!email) { toast.error("Digite o seu e-mail."); return; }
            setLoading(true);
            try {
                        const { error } = await supabase.auth.resetPasswordForEmail(
                                      email.trim().toLowerCase(),
                              { redirectTo: `${window.location.origin}/nova-senha` }
                                    );
                        if (error) {
                                      toast.error("Erro ao enviar. Verifique o e-mail e tente novamente.");
                        } else {
                                      setSent(true);
                        }
            } catch {
                        toast.error("Erro inesperado. Tente novamente.");
            } finally {
                        setLoading(false);
            }
  };

  if (sent) {
            return (
                        <div className="min-h-screen grid place-items-center px-5 bg-background">
                                <div className="w-full max-w-sm text-center">
                                          <div style={{ fontSize: 56, marginBottom: 16 }}>📧</div>div>
                                          <h1 className="text-xl font-black mb-2">Verifique o seu e-mail</h1>h1>
                                          <p className="text-sm text-muted-foreground" style={{ lineHeight: 1.7 }}>
                                                      Enviámos um link para{" "}
                                                      <strong style={{ color: "#212121" }}>{email}</strong>strong>.<br />
                                                      Verifique também a pasta de spam.
                                          </p>p>
                                          <Link
                                                            to="/login"
                                                            style={{
                                                                                display: "inline-block", marginTop: 24,
                                                                                padding: "12px 32px",
                                                                                background: "var(--color-accent)", color: "#fff",
                                                                                borderRadius: 10, fontWeight: 700, fontSize: 14,
                                                                                textDecoration: "none",
                                                            }}
                                                          >
                                                      ← Voltar ao login
                                          </Link>Link>
                                </div>div>
                        </div>div>
                      );
  }
      
        return (
                  <div className="min-h-screen grid place-items-center px-5 bg-background">
                        <div className="w-full max-w-sm">
                <Link to="/" className="block mb-1">
                          <h1 className="text-3xl font-black">
                                      Host<span style={{ color: "var(--color-accent)" }}>lyb</span>span>
                          </h1>h1>
                </Link>Link>
                                <p className="text-sm text-muted-foreground mb-6">
                                          Recuperar palavra-passe
                                </p>p>
                                <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                                          <p className="text-sm text-muted-foreground">
                                                      Digite o seu e-mail e enviaremos um link para redefinir a senha.
                                          </p>p>
                                          <div>
                                                      <label style={{ fontSize: 12, fontWeight: 700, display: "block", marginBottom: 5, color: "#212121" }}>
                                                                    E-MAIL
                                                      </label>label>
                                                      <input
                                                                          type="email"
                                                                          placeholder="seu@email.com"
                                                                          value={email}
                                                                          onChange={(e) => setEmail(e.target.value)}
                                                                          autoFocus
                                                                          className="w-full px-4 py-3 rounded-xl bg-card border border-card-border"
                                                                        />
                                          </div>div>
                                          <button
                                                            type="submit"
                                                            disabled={loading}
                                                            className="btn-primary justify-center"
                                                            style={{ opacity: loading ? 0.7 : 1 }}
                                                          >
                                                {loading ? "A enviar…" : "📧 Enviar link de recuperação"}
                                          </button>button>
                                          <Link
                                                            to="/login"
                                                            className="text-center text-sm text-muted-foreground"
                                                            style={{ textDecoration: "none" }}
                                                          >
                                                      ← Voltar ao login
                                          </Link>Link>
                                </form>form>
                        </div>div>
                  </div>div>
                );
}</div>
