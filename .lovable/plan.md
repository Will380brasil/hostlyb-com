
Esta entrega é grande. Proponho dividir em **7 frentes** e executar em sequência. Confirme antes que eu siga.

## 1. Landing — Seção "Comece em 4 passos"
- Nova seção destacada na landing (`src/routes/index.tsx`) com 4 cards numerados:
  1. Cadastrar imóvel → `/imoveis`
  2. Agendar limpeza → `/limpezas`
  3. Registrar hóspede → `/hospedes`
  4. Sincronizar calendário → `/calendario`
- Cada card é um `<Link>` direto.
- Substituir o atual "Ver demo" por essa seção + manter um link discreto para a demo de dashboard.

## 2. Provas sociais dinâmicas
- Carrossel de depoimentos (8–10 itens fictícios realistas) que troca a cada **2s** com transição suave.
- Mantém badges de números (X imóveis gerenciados, etc.).

## 3. PWA na tela principal
- Banner/CTA "Instalar app" no topo da landing usando `beforeinstallprompt`.
- Botão "Adicionar à tela inicial" que dispara o prompt nativo (Chrome/Android) e mostra instruções iOS quando não disponível.

## 4. Convite — página de status
- Refatorar `src/routes/convite/$token.tsx` para mostrar 3 estados claros:
  - **Aceito** ✓ → CTA "Ir ao painel"
  - **Expirado** → CTA "Pedir novo convite ao admin" (envia alerta in-app ao admin) + mostra e-mail de quem convidou
  - **Erro** → CTA "Reenviar diagnóstico ao suporte"
- Adicionar RPC `request_new_invite(p_token)` que cria um registro em `alerts` para o admin da org.

## 5. Diagnóstico → enviar ao suporte
- Em `/diagnostico` e `/auth/callback` (estado de erro), botão **"Enviar diagnóstico ao suporte"**.
- Cria server function `submitDiagnostic` que grava em nova tabela `support_tickets` (subject, body, user_id, email, logs jsonb, url, user_agent).
- Admin vê em `/admin` em uma nova aba "Suporte".

## 6. Links públicos canônicos
- Auditar e trocar TODOS os `window.location.origin` em geração de links públicos por `publicUrl()` de `src/lib/public-url.ts`. Já parcialmente feito; cobrir resíduos em:
  - convites (`equipe.tsx`)
  - links da faxineira (`limpezas.tsx`, `imoveis.$id.tsx`)
  - emails (edge function `send-forgotten-items-email`)
  - meta tags `og:url` no `__root.tsx`

## 7. **Modo Demo com dados fictícios** (grande)
Substituir o "Ver demo" por um **modo demo navegável** usando dados em memória, sem tocar no banco:
- Novo helper `src/lib/demo-data.ts` com seeds ricos: 6 imóveis, 30 hóspedes (passados/atuais/futuros), 40 limpezas, eventos de calendário, alertas, transações financeiras.
- Rotas `/demo`, `/demo/imoveis`, `/demo/limpezas`, `/demo/hospedes`, `/demo/calendario`, `/demo/financeiro` que renderizam as mesmas telas mas lendo de um `DemoProvider` (context) em vez do Supabase.
- Banner persistente "Você está no modo demo — criar conta".

## 8. **Módulo Financeiro** (grande, requer banco)
Nova área `/financeiro` apenas para **owners/admins** da organização, com:
- Tabela `financial_transactions` (id, organization_id, user_id, type [receita|despesa], category, amount, currency, date, description, source [reserva|limpeza|manual], source_id, created_by). RLS: select/insert/update/delete por membros owner+admin via `has_org_role`.
- **Geração automática**: triggers que criam transação ao inserir `guests` (receita = `total_value`) e `cleaning_jobs` quando `payment_status='pago'` (despesa = `payment_amount`). Permite edição/exclusão depois.
- Tela `/financeiro` com:
  - Filtros (período, imóvel, categoria, tipo)
  - Tabela editável (modal de edição)
  - Resumo (receitas, despesas, lucro, por imóvel)
  - **Relatório**: exportação **CSV e PDF** (mês, ano, custom). Usar `jsPDF` (já leve) ou tabela HTML imprimível.
- **Permissões**: novo enum `org_permission` (`view_finance`, `edit_finance`, `view_reports`). Tabela `member_permissions(member_id, permission)`. UI em `/equipe` para o owner liberar acessos por usuário. Owner sempre tem tudo.

---

## Sequenciamento sugerido (3 fases para não estourar)

**Fase A (esta resposta):** 1, 2, 3, 6 — landing, provas sociais, PWA, links canônicos. Mudanças puramente frontend, baixo risco.

**Fase B:** 4, 5 — convite + diagnóstico ao suporte. Inclui migração (1 tabela `support_tickets` + 1 RPC).

**Fase C:** 7 — modo demo (frontend pesado, sem banco).

**Fase D:** 8 — módulo financeiro + permissões. Inclui migração grande (tabela, triggers, enum, RLS).

## Perguntas rápidas

1. **Modo demo**: navegação separada em `/demo/*` (recomendado) ou um toggle dentro da app que substitui dados? Recomendo `/demo/*` para não confundir usuários reais.
2. **Relatório financeiro**: CSV + PDF é suficiente, ou também Excel (.xlsx)?
3. **Triggers automáticos no financeiro**: criar transação ao registrar hóspede (receita) e limpeza paga (despesa)? Ou apenas manual?
4. **Permissões**: criar sistema de permissões granulares agora (Fase D), ou simplificar para "owner/admin veem financeiro, staff não vê"?

Confirme as respostas (ou diga "segue tudo, decida você") e eu começo pela **Fase A** já nesta sessão.
