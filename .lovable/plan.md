## Fase 1 — Internacionalização das páginas internas (PT/EN/ES)

Páginas alvo (≈3 000 linhas de UI):
- `src/routes/limpezas.tsx` (724)
- `src/routes/financeiro.tsx` (353)
- `src/routes/calendario.tsx` (299)
- `src/routes/hospedes.tsx` (308)
- `src/routes/imoveis.index.tsx` (246)
- `src/routes/imoveis.$id.tsx` (202)
- `src/routes/faxineira.$token.tsx` (687)

Para cada página:
1. Extrair todas as strings visíveis (títulos, botões, labels, placeholders, vazios, toasts).
2. Adicionar chaves agrupadas em `src/lib/i18n.tsx` com namespace por página (`limpezas.*`, `financeiro.*`, `calendario.*`, etc.) nos 3 idiomas.
3. Substituir hard-codes por `t("…")` via `useT()`.
4. Datas e moeda passam por `Intl.*` com o `lang`/`currency` do contexto.
5. Statuses (`agendado`, `em_andamento`, `concluido`, etc.) traduzidos via mapa central `statusLabel(status, t)`.

Não mexer em: chaves de DB, valores de enum, rotas, lógica de negócio.

## Fase 2 — Página `/relatorios` consolidada

Nova rota `src/routes/_authenticated/relatorios.tsx` (ou `src/routes/relatorios.tsx` com guard `useAuth`):

- **Filtro de período**: hoje, 7 d, 30 d, mês atual, ano, custom.
- **Filtro de imóvel**: todos / um específico.
- **Cartões resumo**:
  - Receita total (entradas) e despesas (saídas) do período (`transactions`).
  - Resultado líquido + margem %.
  - Noites ocupadas, taxa de ocupação, ADR (`guests.checkin/checkout`).
  - Limpezas concluídas, duração média, problemas (`cleaning_jobs`).
  - Objetos esquecidos abertos/resolvidos (`forgotten_items`).
  - Manutenções pendentes/resolvidas + custo (`maintenance_issues`).
- **Gráficos** (recharts já no projeto): receita vs despesa por mês, ocupação por imóvel, top imóveis por receita.
- **Tabela detalhada por imóvel**: receita, despesas, líquido, ocupação, limpezas, custo médio limpeza.
- **Export**:
  - CSV (download direto no browser).
  - PDF via `src/lib/performance-pdf.ts` estendido (resumo + tabela + gráfico render via canvas → image).
- Toda a UI já localizada (PT/EN/ES) e moeda automática.

## Detalhes técnicos

- Queries via `supabase` no browser (RLS já filtra por `user_id`).
- `useQuery` agrupado num único hook `useReportData({ from, to, propertyId })`.
- Formatadores reutilizam `formatPrice`/`Intl.NumberFormat` com `currency` do `useLocale()`.
- Adicionar link "Relatórios" no `AppShell` (entre Financeiro e Equipa) — traduzido.

## Entrega

Faço Fase 1 primeiro, valido o build, depois Fase 2. Cada fase resulta num commit lógico independente. Sem alterações em RLS, schema ou lógica de auth.
