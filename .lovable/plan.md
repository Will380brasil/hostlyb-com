## Objetivo
Facilitar acesso ao app a partir da landing page, adicionando um link direto para `/app` (a demo do dashboard).

## Mudanças
1. **Navbar da landing (`src/routes/index.tsx`)**
   - Adicionar link "Ver demo" no menu desktop ao lado dos links existentes.
   - No mobile, incluir o mesmo link no menu/CTA secundário.
   - Estilo: link discreto (texto cinza com hover coral), para não competir com o CTA principal "Começar grátis".

2. **Hero secundário**
   - Abaixo do CTA principal "Começar grátis", adicionar um link menor "Ou explore a demo →" apontando para `/app`.

3. **Comportamento**
   - Usar `<Link to="/app">` do `@tanstack/react-router` (navegação SPA, sem reload).
   - Abrir na mesma aba.

## Fora do escopo
- Sem mudanças no app interno (`/app` e demais rotas) nem no design system.
- Sem autenticação ainda — a demo continua aberta.