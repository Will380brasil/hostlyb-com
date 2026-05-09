## Fase 1 — Bugs críticos (uso travado)

1. **Cadastro de faxineira fecha ao digitar e-mail**
   - Causa provável: o sheet/modal está dentro de um `<form>` pai ou o input dispara submit. Vou isolar o form e usar `onSubmit` com `preventDefault` correto.
2. **Inputs numéricos com "0" fixo que não apaga** (valor por limpeza, agendar limpeza, novo hóspede, valor total)
   - Trocar `value={form.x}` (number=0) por string controlada (`""` quando vazio) e `parse` só no submit. Aplicar em `equipe.tsx`, `limpezas.tsx`, `hospedes.tsx`, `imoveis.$id.tsx`.
3. **Upload de objeto esquecido dá erro**
   - Verificar bucket `forgotten-items` (existe) + RLS de `storage.objects` para INSERT do faxineiro via token. Provável falta de policy pública de upload nesse bucket. Corrigir policy e tratamento de erro no client.
4. **Botões de mapa (Google/Waze/Apple) dão erro**
   - Bug está em `AddressActions.tsx`: o componente recebe só `address` (string) sem cidade/estado. Várias chamadas passam objeto. Vou tipar corretamente e usar `fullAddress(p)` no encode.

## Fase 2 — Internacionalização de pagamento + checklist

5. **Pagamento por país** (substituir "PIX" fixo)
   - Adicionar coluna `payment_method` (`pix|iban|mbway|sepa|zelle|venmo|paypal|other`) e `payment_details` (text) em `cleaners`.
   - UI: select de método baseado no país do usuário (default por `useLocale`), com opção "Outro" livre.
6. **Checklist com cômodos por país + customizáveis**
   - Lista base ampliada (sala/salão/living room, suíte/master bedroom, lavabo/casa de banho/restroom, quintal/jardim/patio/garden, varanda/balcony/terrasse, copa/dispensa/pantry, área de serviço/laundry/lavanderia, escritório/home office, garagem etc).
   - Botão "+ Adicionar item" para o usuário criar próprios; persistir por usuário em uma tabela `checklist_templates` (user_id, label).
7. **Plataforma de hospedagem extensível**
   - Lista ampliada (Airbnb, Booking, Vrbo, Expedia, Agoda, Hotels.com, Direto, Trivago, TripAdvisor) + opção "Adicionar plataforma" com armazenamento em `platforms` por usuário.

## Fase 3 — Calendário estilo Google + Exportação

8. **Vista do dia ao clicar numa data** (lista cronológica de eventos do dia, igual Google Calendar) com modal de detalhes do evento + botão "Editar" (se for limpeza/hóspede, abre o registro real).
9. **Seletor rápido de mês/ano** clicando no título (popover com ano e meses).
10. **Próximos eventos clicáveis** + menu de compartilhamento (WhatsApp, Email, Telegram, SMS via `navigator.share` quando disponível, fallback links).
11. **Exportar como Excel (.xlsx) com logo Hostly** usando SheetJS no client; manter `.ics` opcional como secundário.

## Fase 4 — Alertas, CRM e busca

12. **Alertas com modal de detalhe** (foto, descrição, contexto), botões "Marcar lido", "Dispensar", "Arquivar". Adicionar coluna `archived_at` em `alerts`.
13. **Cards clicáveis em Hóspedes e Imóveis** + barra de busca (filtro client-side por nome/imóvel/cidade).
14. **Histórico tipo CRM**:
    - Imóvel: aba/seção "Histórico" listando hóspedes (qual quarto, datas, valor, plataforma) e limpezas (data, faxineira, status, valor).
    - Hóspede: detalhe com histórico de estadias.

## Fase 5 — Admin e Segurança

15. **Admin simplificado**: apenas
    - quantos usuários adquiriram (total cadastros)
    - quantos pagantes ativos (subscriptions live)
    - tabela com email, telefone (de `profiles` + auth metadata)
    - Remover métricas live/online complexas pedidas anteriormente.
16. **Tornar `brasgold1@gmail.com` admin geral**
    - Atualizar secret `HOSTLY_ADMIN_EMAIL=brasgold1@gmail.com` e adicionar tabela `admin_users` (com `user_id`) para suportar múltiplos admins no futuro. Bloquear acesso normal de usuário se for admin (redirect para /admin).
17. **Auditoria RLS / vazamento de dados**
    - Rodar `supabase--linter` e revisar todas policies. Garantir que nenhum SELECT cruze `user_id`. Confirmar que `properties`, `guests`, `cleaning_jobs`, `cleaners`, `forgotten_items`, `alerts` filtram só pelo `auth.uid()`.

---

## Detalhes técnicos

- `cleaners` migration: `ALTER TABLE cleaners ADD COLUMN payment_method TEXT DEFAULT 'pix', ADD COLUMN payment_details TEXT;` (mantém `pix_key` por compatibilidade).
- `alerts`: `ALTER TABLE alerts ADD COLUMN archived_at TIMESTAMPTZ;`.
- Novas tabelas: `checklist_templates(user_id, label)`, `user_platforms(user_id, key, label)`, `admin_users(user_id, email)`.
- Storage: revisar policies do bucket `forgotten-items` para permitir INSERT autenticado pelo dono OU pelo token de faxineira via RPC (`cleaner_upload_forgotten_photo`).
- Excel: `bun add xlsx` + função `exportCalendarToXlsx(events, logoUrl)`.
- Calendário "vista do dia": componente `<DayEventsSheet date={...} events={...} />`.

---

## Confirmação antes de executar

Esse pacote é **grande** (5 fases, ~15 arquivos modificados, 3 migrations). Posso:

**(A)** Fazer tudo de uma vez (várias mensagens longas, demora bem mais).  
**(B)** Ir por fase, parando para você validar cada uma (recomendado).  
**(C)** Você escolhe quais fases entrar agora.

Me diga **A, B ou C** (e se C, quais fases) que eu começo imediatamente.
