# Auditoria de copy — humanizar o front-end do Hostlyb

A copy do projeto está centralizada em dois ficheiros grandes (`src/lib/landing-copy.ts` 608 linhas, `src/lib/i18n.tsx` 1623 linhas) e replicada nos route files `index.tsx`, `en/fr/de/es/it.tsx`. Antes de mexer em tudo, precisamos alinhar o âmbito — caso contrário corro o risco de reescrever 2 000+ linhas, partir traduções de 5 línguas e introduzir regressões.

## O que proponho fazer (PT-PT, foco no público português)

### 1. Landing pages (PT prioritário)
- `src/lib/landing-copy.ts` e `src/routes/index.tsx`: substituir hero / sub-hero / CTAs por copy com personalidade da lista fornecida ("A faxineira foi? Você nem perguntou.", "Menos WhatsApp. Mais dinheiro.", etc.).
- CTAs: "Começar grátis — sem cartão", "Ver como funciona", "Quero testar 14 dias grátis".
- Secção sobre/missão: usar exatamente o parágrafo "O Hostlyb nasceu porque…".
- Footer: "© 2025 Hostlyb. Feito para anfitriões a sério. 🇵🇹".

### 2. Formulários (login, signup, esqueci-senha, nova-senha, demo)
- Placeholders: `seu@email.com`, `••••••••`, `João Silva`, `+351 912 345 678`.
- Mensagens de erro genéricas → frases humanas em PT-PT (lista do prompt).
- Loading states: substituir spinners "mudos" por "A guardar…", "A enviar…", "A verificar…".

### 3. Empty states no app
- Imóveis, limpezas, hóspedes, alertas, transações — usar exatamente as frases com emoji da lista.

### 4. 404
- `__root.tsx` `notFoundComponent`: "404 — Este imóvel não existe (ainda). Mas os seus outros imóveis estão todos bem." + botão "Voltar ao dashboard".

### 5. Aria-labels em botões só com ícone
- Varrer componentes do dashboard/calendário/imóveis e adicionar `aria-label` em PT onde falta.

## O que NÃO proponho fazer (a confirmar)

- **Não vou traduzir a nova copy "humana" para EN/FR/DE/ES/IT**. As frases ("WhatsApp às 23h", "🇵🇹") são culturalmente PT. Para as outras línguas mantenho o copy atual e só corrijo termos claramente "IA" (revolucionário, poderoso, inovador) se aparecerem. Confirma se queres adaptações locais por idioma — isso multiplica o trabalho por 5.
- **Não vou reescrever toda a `i18n.tsx`** (1 623 linhas, suporta o app inteiro em 6 línguas). Só toco nas chaves dos problemas 2–6 (CTAs, placeholders, erros, empty states, loading) em PT, e replico literais para as outras línguas se forem trivialmente traduzíveis.
- **Sem commits manuais**: o Lovable gere o git internamente — cada turno já fica versionado. Não posso correr `git commit` à mão. A mensagem "design: humanizar copy…" fica como descrição deste turno.

## Pergunta antes de avançar

1. Confirmas que o foco é **PT-PT** e que EN/FR/DE/ES/IT ficam praticamente como estão (só limpeza de termos "IA")?
2. As frases com emoji 🇵🇹 e "WhatsApp" devem aparecer **só na versão PT** ou também em todas as outras?
3. Posso ir direto à implementação ou queres rever copy proposto antes (mostrar antes/depois das hero/CTAs principais)?

Responde só "avança PT, ignora outras línguas" se for esse o caso — sigo logo.
