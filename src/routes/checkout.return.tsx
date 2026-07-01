import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/checkout/return")({
  validateSearch: (search: Record<string, unknown>): { session_id?: string } => ({
    session_id: typeof search.session_id === "string" ? search.session_id : undefined,
  }),
  component: CheckoutReturn,
});

function CheckoutReturn() {
  const { session_id } = Route.useSearch();
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-md text-center space-y-4">
        <h1 className="text-2xl font-bold">Pagamento concluído 🎉</h1>
        <p className="text-muted-foreground">
          Pagamento efetuado com sucesso. O seu acesso está ativo agora.
        </p>
        {session_id && <p className="text-xs text-muted-foreground break-all">Sessão: {session_id}</p>}
        <a href="/app" className="inline-block bg-primary text-primary-foreground rounded-md px-4 py-2">
          Ir para o painel
        </a>
      </div>
    </div>
  );
}
