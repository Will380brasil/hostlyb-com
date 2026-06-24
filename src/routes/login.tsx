import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";

import { useEffect, useState } from "react";

import { supabase } from "@/integrations/supabase/client";

import { useAuth } from "@/hooks/useAuth";

import { toast } from "sonner";

import { Eye, EyeOff } from "lucide-react";

type LoginSearch = { redirect?: string };

export const Route = createFileRoute("/login")({

                                                 validateSearch: (s: Record<string, unknown>): LoginSearch => ({

                                                                                                                   redirect: typeof s.redirect === "string" ? s.redirect : undefined,

                                                 }),

      head: () => ({

                       meta: [

                           { title: "Entrar — Hostlyb" },

                           { name: "description", content: "Aceda à sua conta Hostlyb." },

                               ],

      }),

      component: LoginPage,

});

async function resolveDestination(userId: string, fallback?: string) {

  if (fallback) return fallback;

  const { data } = await supabase

    .from("profiles")

    .select("role")

    .eq("id", userId)

    .maybeSingle();

  return data?.role === "cleaner" ? "/minha-agenda" : "/app";

}

function translateError(msg: string): string {

  const map: Record<string, string> = {

          "Invalid login credentials": "E-mail ou senha incorretos.",

          "Invalid email or password": "E-mail ou senha incorretos.",

          "Email not confirmed": "Confirme o seu e-mail antes de entrar.",

          "User not found": "Conta não encontrada.",

          "Too many requests": "Muitas tentativas. Aguarde alguns minutos.",

          "Email rate limit exceeded": "Muitas tentativas. Aguarde alguns minutos.",

          "Failed to fetch": "Sem ligação. Verifique a internet.",

          "Network error": "Erro de ligação. Verifique a internet.",

          "Password is known to be weak": "Senha muito comum. Escolha outra.",

          "undefined": "Erro de ligação. Verifique a internet.",

  };

  for (const [key, value] of Object.entries(map)) {

        if (msg?.toLowerCase().includes(key.toLowerCase())) return value;

  }

  return "Erro ao entrar. Tente novamente.";

}

function LoginPage() {

  const navigate = useNavigate();

  const { redirect } = Route.useSearch();

  const { session, loading: authLoading } = useAuth();

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);

  useEffect(() => {

                (async () => {

                       if (authLoading || !session) return;

                       const dest = await resolveDestination(session.user.id, redirect);

                       navigate({ to: dest as any, replace: true });

                })();

  }, [session, authLoading, redirect, navigate]);

  const submit = async (e: React.FormEvent) => {

          e.preventDefault();

          if (!email) { toast.error("Digite o seu e-mail."); return; }

          if (!password) { toast.error("Digite a sua senha."); return; }

          setLoading(true);

          try {

            const { data, error } = await supabase.auth.signInWithPassword({

                                                                                   email: email.trim().toLowerCase(),

                        password,

            });

            if (error) {

                      toast.error(translateError(error.message));

                      return;

            }

            if (!data?.user) {

                      toast.error("Erro ao entrar. Tente novamente.");

                      return;

            }

            const dest = await resolveDestination(data.user.id, redirect);

            navigate({ to: dest as any, replace: true });

          } catch (err: any) {

            toast.error(translateError(err?.message || "Erro de ligação."));

          } finally {

            setLoading(false);

          }

  };

  return (

          <div className="min-h-screen grid place-items-center px-5 bg-background">
          
                <div className="w-full max-w-sm">
                
                        <Link to="/" className="block mb-1">
                        
                                  <h1 className="text-3xl font-black">
                                  
                                              Host<span style={{ color: "var(--color-accent)" }}>lyb</span>
                                  
                                  </h1>
                        
                        </Link>
                
                        <p className="text-sm text-muted-foreground mb-6">Entrar na sua conta</p>
                
                        <div style={{
              
                        background: "#FFF8E6", border: "1px solid #FFB34740",
              
                        borderRadius: 10, padding: "10px 14px", marginBottom: 16,
              
                        fontSize: 12, color: "#92600A", display: "flex", gap: 8, lineHeight: 1.5,
              
          }}>
                        
                                  <span>🔗</span>
                        
                                  <span><strong>Link mágico temporariamente indisponível.</strong> Use e-mail e senha.</span>
                        
                        </div>
                
                        <form onSubmit={submit} className="flex flex-col gap-3">
                        
                                  <div>
                                  
                                              <label style={{ fontSize: 12, fontWeight: 700, display: "block", marginBottom: 5, color: "#212121" }}>
                                              
                                                            E-MAIL
                                              
                                              </label>
                                  
                                              <input
                                                  
                                                                type="email" required placeholder="seu@email.com"
                                                  
                                                value={email} onChange={(e) => setEmail(e.target.value)}
                                                  
                                                autoComplete="email"
                                                  
                                                className="w-full px-4 py-3 rounded-xl bg-card border border-card-border"
                                                  
                                              />
                                  
                                  </div>
                        
                                  <div>
                                  
                                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
                                              
                                                            <label style={{ fontSize: 12, fontWeight: 700, color: "#212121" }}>SENHA</label>
                                              
                                                            <Link to="/esqueci-senha" style={{ fontSize: 12, color: "var(--color-accent)", textDecoration: "none", fontWeight: 600 }}>
                                                            
                                                                            Esqueci a senha
                                                            
                                                            </Link>
                                              
                                              </div>
                                  
                                              <div style={{ position: "relative" }}>
                                              
                                                            <input
                                                                
                                                                                type={showPassword ? "text" : "password"} required
                                                                
                                                                                placeholder="••••••••" value={password}
                                                                
                                                              onChange={(e) => setPassword(e.target.value)}
                                                                
                                                              autoComplete="current-password"
                                                                
                                                              className="w-full px-4 py-3 rounded-xl bg-card border border-card-border"
                                                                
                                                              style={{ paddingRight: 44 }}
                                                                
                                                            />
                                              
                                                            <button type="button" onClick={() => setShowPassword(!showPassword)}
                                                                
                                                              style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#9E9E9E", display: "flex", alignItems: "center" }}>
                                                            
                                                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                                            
                                                            </button>
                                              
                                              </div>
                                  
                                  </div>
                        
                                  <button type="submit" disabled={loading || authLoading}
                                      
                                    className="btn-primary justify-center"
                                      
                                    style={{ opacity: loading ? 0.7 : 1 }}>
                                  
                                      {loading ? "A entrar…" : "Entrar"}
                                  
                                  </button>
                        
                        </form>
                
                        <p className="text-sm text-muted-foreground mt-5 text-center">
                        
                                  Não tem conta?{" "}
                        
                                  <Link to={"/inscrever-se" as any} style={{ color: "var(--color-accent)", fontWeight: 700, textDecoration: "none" }}>
                                  
                                              Criar conta
                                  
                                  </Link>
                        
                        </p>
                
                </div>
          
          </div>
      
        );
    
}
