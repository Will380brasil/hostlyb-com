import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/esqueci-senha")({
      head: () => ({
              meta: [
                  { title: "Esqueci a Senha — Hostlyb" },
                  { name: "description", content: "Recupere o acesso à sua conta Hostlyb." },
                      ],
      }),
      component: EsqueciSenhaPage,
});

function EsqueciSenhaPage() {
      const [email, setEmail] = useState("");
      const [loading, setLoading] = useState(false);
      const [sent, setSent] = useState(false);

  const submit = async (e: React.FormEvent) => {
          e.preventDefault();
          if (!email) {
                    toast.error("Adicione um e-mail");
                    return;
          }

          setLoading(true);
          const { error } = await supabase.auth.resetPasswordForEmail(email, {
                    redirectTo: `${window.location.origin}/nova-senha`,
          });
          setLoading(false);

          if (error) {
                    toast.error("Erro ao enviar link. Verifique o e-mail.");
          } else {
                    setSent(true);
          }
  };

  if (sent) {
          return (
                    <div className="min-h-screen grid place-items-center px-5">
                            <div className="w-full max-w-sm text-center">
                                      <h1 className="text-5xl mb-3">✓ Hostlyb</h1>h1>
                                      <h1 className="text-xl font-bold mb-6">Verifique o seu e-mail</h1>h1>
                                      <p className="text-gray-600 mb-6">
                                                  Enviamos um link para recuperar a sua senha. Clique nele para continuar.
                                                  Verifique a pasta de spam se não o vir.
                                      </p>p>
                                      <Link
                                                      to="/login"
                                                      className="text-blue-600 hover:underline font-semibold"
                                                    >
                                                  Voltar ao login
                                      </Link>Link>
                            </div>div>
                    </div>div>
                  );
  }
    
      return (
              <div className="min-h-screen grid place-items-center px-5">
                    <div className="w-full max-w-sm">
                            <h1 className="text-5xl mb-8 text-center">✓ Hostlyb</h1>h1>
                            <h2 className="text-2xl font-bold mb-2">Esqueci a senha</h2>h2>
                            <p className="text-gray-600 mb-6">
                                      Digite o e-mail da sua conta para recuperar o acesso.
                            </p>p>
                    
                            <form onSubmit={submit} className="space-y-4">
                                      <div>
                                                  <label className="block text-sm font-bold mb-2">E-MAIL</label>label>
                                                  <input
                                                                    type="email"
                                                                    value={email}
                                                                    onChange={(e) => setEmail(e.target.value)}
                                                                    placeholder="seu@email.com"
                                                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
                                                                    required
                                                                  />
                                      </div>div>
                            
                                      <button
                                                      type="submit"
                                                      disabled={loading}
                                                      className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
                                                    >
                                          {loading ? "Enviando..." : "Enviar link"}
                                      </button>button>
                            </form>form>
                    
                            <div className="mt-6 text-center">
                                      <Link to="/login" className="text-blue-600 hover:underline">
                                                  Voltar ao login
                                      </Link>Link>
                            </div>div>
                    </div>div>
              </div>div>
            );
}</div>
