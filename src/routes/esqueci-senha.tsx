import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
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

function translateError(msg: string): string {
    const map: Record<string, string> = {
          "Invalid email": "E-mail inválido.",
          "User not found": "Nenhuma conta encontrada com este e-mail.",
          "Email rate limit": "Muitas tentativas. Aguarde alguns minutos.",
          "Failed to fetch": "Sem ligação. Verifique a internet.",
          "Network error": "Erro de ligação. Verifique a internet.",
        };

    for (const [key, value] of Object.entries(map)) {
          if (msg.toLowerCase().includes(key.toLowerCase())) return value;
        }

    return "Erro ao enviar link de recuperação. Tente novamente.";
  }

function ForgotPasswordPage() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
          e.preventDefault();

          if (!email.trim()) {
                  toast.error("Digite o seu e-mail.");
                  return;
                }

          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(email)) {
                  toast.error("E-mail inválido.");
                  return;
                }

          setLoading(true);

          try {
                  const { error } = await supabase.auth.resetPasswordForEmail(
                            email.trim().toLowerCase(),
                            {
                                        redirectTo: `${window.location.origin}/nova-senha`,
                                      }
                          );

                  if (error) {
                            toast.error(translateError(error.message));
                            return;
                          }

                  setSent(true);
                  toast.success("Link de recuperação enviado! 📧");
                } catch (err: any) {
                  toast.error(translateError(err?.message || "Erro inesperado."));
                } finally {
                  setLoading(false);
                }
        };

    if (sent) {
          return (
                  <div className="min-h-screen grid place-items-center px-5 bg-background">
                    <div className="w-full max-w-sm text-center">
                      <div style={{ fontSize: 56, marginBottom: 16 }}>📧</div>

                      <h1 className="text-3xl font-bold mb-2">Verificar e-mail</h1>

                      <p className="text-sm text-muted-foreground mb-6">
                        Enviámos um link para recuperar a sua senha para <strong>{email}</strong>.
                      </p>

                      <div
                        style={{
                                        background: "#F0FDF9",
                                        border: "1px solid #00C89630",
                                        borderRadius: 10,
                                        padding: "14px",
                                        marginBottom: 20,
                                        fontSize: 12,
                                        color: "#00C896",
                                      }}
                      >
                        💡 Se não receber o e-mail, procure na pasta de spam.
                      </div>

                      <button
                        onClick={() => {
                                        setSent(false);
                                        setEmail("");
                                      }}
                        style={{
                                        width: "100%",
                                        padding: "12px",
                                        background: "var(--color-accent)",
                                        color: "#fff",
                                        border: "none",
                                        borderRadius: 10,
                                        fontWeight: 700,
                                        cursor: "pointer",
                                        marginBottom: 10,
                                      }}
                      >
                        ← Voltar
                      </button>

                      <p className="text-xs text-muted-foreground">
                        Não funcionou?{" "}
                        <button
                          onClick={() => setSent(false)}
                          style={{
                                            background: "none",
                                            border: "none",
                                            color: "var(--color-accent)",
                                            fontWeight: 700,
                                            cursor: "pointer",
                                            textDecoration: "underline",
                                          }}
                        >
                          Tente outra conta
                        </button>
                      </p>
                    </div>
                  </div>
                );
        }

    return (
          <div className="min-h-screen grid place-items-center px-5 bg-background">
            <div className="w-full max-w-sm">
              <Link to="/" className="block mb-1">
                <h1 className="text-3xl font-bold">
                  Host<span style={{ color: "var(--color-accent)" }}>lyb</span>
                </h1>
              </Link>

              <p className="text-sm text-muted-foreground mb-6">
                Recuperar a minha senha
              </p>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div>
                  <label
                    style={{
                                      fontSize: 12,
                                      fontWeight: 700,
                                      display: "block",
                                      marginBottom: 5,
                                      color: "#212121",
                                    }}
                  >
                    E-MAIL DA SUA CONTA *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    className="w-full px-4 py-3 rounded-xl bg-card border border-card-border"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary justify-center"
                  style={{ padding: "12px", fontWeight: 700 }}
                >
                  {loading ? "A enviar…" : "Enviar link de recuperação"}
                </button>
              </form>

              <div
                style={{
                              marginTop: 16,
                              padding: "12px 14px",
                              background: "#FFF8E6",
                              border: "1px solid #FFB34740",
                              borderRadius: 10,
                              fontSize: 12,
                              color: "#92600A",
                            }}
              >
                <strong>🔗 Como funciona?</strong> Enviaremos um link para o seu e-mail. Clique
                nele para criar uma nova senha.
              </div>

              <div style={{ marginTop: 20, textAlign: "center", fontSize: 14 }}>
                <p className="text-muted-foreground">
                  Lembrou-se da senha?{" "}
                  <Link
                    to="/login"
                    style={{
                                      color: "var(--color-accent)",
                                      fontWeight: 700,
                                      textDecoration: "none",
                                    }}
                  >
                    Entrar
                  </Link>
                </p>
                <p className="text-muted-foreground mt-2">
                  Não tem conta?{" "}
                  <Link
                    to="/inscrever-se"
                    style={{
                                      color: "var(--color-accent)",
                                      fontWeight: 700,
                                      textDecoration: "none",
                                    }}
                  >
                    Criar conta
                  </Link>
                </p>
              </div>
            </div>
          </div>
        );
  }
