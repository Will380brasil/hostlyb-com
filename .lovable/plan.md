# Plano — Cadastro obrigatório da faxineira

## Decisões assumidas (a partir das respostas)
- **Obrigar conta**: link `/faxineira/$token` deixa de ser público; só funciona com sessão válida.
- **DB**: reaproveitar o que já existe (`profiles`, `cleaners`, `organization_members`) em vez de criar `cleaner_invites` paralela. Adicionar apenas o mínimo: `profiles.role` e `profiles.cleaner_id`.
- **Magic link**: ativar, com toggle senha ↔ magic link no `/login`.

## 1. Migração de banco (mínima)

```sql
-- role na profile (cleaner | owner)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'owner'
  CHECK (role IN ('owner','cleaner'));

-- vínculo profile ↔ cleaners (cadastro do dono)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS cleaner_id uuid
  REFERENCES public.cleaners(id) ON DELETE SET NULL;

-- coluna auth_user_id em cleaners (espelho)
ALTER TABLE public.cleaners
  ADD COLUMN IF NOT EXISTS auth_user_id uuid
  REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_cleaners_auth_user ON public.cleaners(auth_user_id);

-- RPC pública para validar token e devolver o email do cleaner
-- (precisa ser SECURITY DEFINER porque a rota agora é anônima até o cadastro)
CREATE OR REPLACE FUNCTION public.cleaner_token_lookup(p_token uuid)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path = public AS $$
DECLARE r jsonb;
BEGIN
  SELECT jsonb_build_object(
    'cleaner_id', c.id,
    'cleaner_email', c.email,
    'cleaner_name', c.name,
    'cleaner_auth_user_id', c.auth_user_id,
    'property_name', p.name
  ) INTO r
  FROM public.cleaning_jobs j
  JOIN public.properties p ON p.id = j.property_id
  LEFT JOIN public.cleaners c ON c.id = j.cleaner_id
  WHERE j.access_token = p_token;
  RETURN r;
END $$;

GRANT EXECUTE ON FUNCTION public.cleaner_token_lookup(uuid) TO anon, authenticated;

-- RPC para vincular auth_user ao cleaner durante o signup (idempotente)
CREATE OR REPLACE FUNCTION public.cleaner_claim_token(p_token uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public AS $$
DECLARE v_cleaner_id uuid; v_email text;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'auth_required'; END IF;
  SELECT c.id, lower(coalesce(c.email,''))
    INTO v_cleaner_id, v_email
  FROM public.cleaning_jobs j
  JOIN public.cleaners c ON c.id = j.cleaner_id
  WHERE j.access_token = p_token;
  IF v_cleaner_id IS NULL THEN RAISE EXCEPTION 'invalid_token'; END IF;

  UPDATE public.cleaners SET auth_user_id = auth.uid()
    WHERE id = v_cleaner_id AND auth_user_id IS NULL;
  UPDATE public.profiles SET cleaner_id = v_cleaner_id, role = 'cleaner'
    WHERE id = auth.uid();
  RETURN jsonb_build_object('ok', true, 'cleaner_id', v_cleaner_id);
END $$;

GRANT EXECUTE ON FUNCTION public.cleaner_claim_token(uuid) TO authenticated;
```

Não cria tabela nova: o "convite" é o próprio token da limpeza + a coluna `cleaners.email` que o dono já preenche.

## 2. Rotas (TanStack Start, não React Router)

- `src/routes/faxineira.$token.tsx` (existente, **público**) → vira página de verificação:
  - chama `cleaner_token_lookup` para resolver o email do cleaner
  - se não há sessão e o email existe em `auth.users` (via tentativa de magic link) → tela "fazer login"
  - se não há sessão e email não existe → tela "criar conta" inline (nome + email pré-preenchido + telefone + senha)
  - se há sessão → `cleaner_claim_token(token)` e redireciona para `/_authenticated/faxineira/$token` (área protegida com checklist).
- Criar `src/routes/_authenticated/faxineira.$token.tsx` com o conteúdo do checklist atual (mover lógica de `faxineira.$token.tsx` para cá).
- Criar `src/routes/_authenticated/minha-agenda.tsx`: lista limpezas atribuídas à faxineira logada (`cleaning_jobs` onde `cleaner_id = profile.cleaner_id`).

## 3. Login (`src/routes/login.tsx`)

- Adicionar toggle "Senha / Link por e-mail".
- Magic link via `supabase.auth.signInWithOtp({ email, options: { emailRedirectTo } })`.
- Após login, redirect respeita `?redirect=` ou usa role: `cleaner` → `/minha-agenda`, `owner` → `/app`.

## 4. Trigger `handle_new_user`

Atualizar para respeitar `raw_user_meta_data.role`: se `role = 'cleaner'`, não cria organização nova (faxineira não é dono de workspace).

## 5. Fluxo do dono

- Ao cadastrar faxineira (em `/equipe`), email + telefone passam a ser obrigatórios.
- Mensagem do WhatsApp atualizada para avisar "na primeira vez você cria sua conta".

## 6. Migração de dados existentes
- Faxineiras já cadastradas sem `auth_user_id`: na próxima vez que abrirem o link, são levadas pelo fluxo de cadastro. Email já está em `cleaners.email`, então o form vem pré-preenchido.
- Tokens antigos continuam válidos (mesmo `access_token`), só passam pela tela de auth.

## Detalhes técnicos
- Email auth templates já scaffoldados; magic link usa template existente.
- `notify.hostlyb.com` ainda não verificado → magic link **só funciona depois que o DNS validar**. Comunicar ao usuário.
- Tudo em pt-PT (idioma padrão do app).

## Arquivos tocados
- `supabase/migrations/<novo>.sql` (migration)
- `src/routes/faxineira.$token.tsx` (rescrever como gate de auth)
- `src/routes/_authenticated/faxineira.$token.tsx` (novo — checklist)
- `src/routes/_authenticated/minha-agenda.tsx` (novo)
- `src/routes/login.tsx` (toggle magic link + redirect por role)
- `src/routes/equipe.tsx` (email/telefone obrigatórios + mensagem WhatsApp atualizada)
- `src/hooks/useAuth.tsx` (expor `role` e `cleaner_id` da profile)

## Fora de escopo
- Tabela `cleaner_invites` separada (usamos o token da limpeza).
- Página `/cadastro-profissional` standalone (cadastro é inline na própria rota do token, evita redirect extra).
- Mudar React Router DOM → o projeto já é TanStack Start.

Confirma para eu executar?
