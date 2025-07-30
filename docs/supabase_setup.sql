-- Adiciona a coluna 'role' à tabela de perfis, se ela não existir.
-- Define 'free' como o papel padrão para novos usuários.
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'free';

-- Adiciona a coluna 'subscription_status' para rastrear o status do pagamento.
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS subscription_status TEXT;

-- Adiciona a coluna 'subscription_ends_at' para saber quando a assinatura expira.
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS subscription_ends_at TIMESTAMPTZ;

-- Adiciona a coluna 'tag' à tabela de cards, se ela não existir.
-- Esta coluna armazenará o texto da tag de marketing.
ALTER TABLE public.cards ADD COLUMN IF NOT EXISTS tag TEXT;


-- Habilitar Row Level Security (RLS) para as tabelas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cards ENABLE ROW LEVEL SECURITY;

-- Apagar políticas antigas para garantir que as novas sejam aplicadas corretamente
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile." ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile." ON public.profiles;
DROP POLICY IF EXISTS "Public cards are viewable by everyone." ON public.cards;
DROP POLICY IF EXISTS "Users can insert their own cards." ON public.cards;
DROP POLICY IF EXISTS "Users can update their own cards." ON public.cards;
DROP POLICY IF EXISTS "Users can delete their own cards." ON public.cards;

-- Políticas para a tabela 'profiles'
CREATE POLICY "Public profiles are viewable by everyone."
  ON public.profiles FOR SELECT
  USING ( true );

CREATE POLICY "Users can insert their own profile."
  ON public.profiles FOR INSERT
  WITH CHECK ( auth.uid() = id );

CREATE POLICY "Users can update own profile."
  ON public.profiles FOR UPDATE
  USING ( auth.uid() = id );

-- Políticas para a tabela 'cards'
CREATE POLICY "Public cards are viewable by everyone."
  ON public.cards FOR SELECT
  USING ( true );

CREATE POLICY "Users can insert their own cards."
  ON public.cards FOR INSERT
  WITH CHECK ( auth.uid() = user_id );

CREATE POLICY "Users can update their own cards."
  ON public.cards FOR UPDATE
  USING ( auth.uid() = user_id );

CREATE POLICY "Users can delete their own cards."
  ON public.cards FOR DELETE
  USING ( auth.uid() = user_id );

-- Políticas para o Storage (Avatares)
-- Apagar políticas antigas para o bucket 'avatars'
DROP POLICY IF EXISTS "Avatar images are publicly accessible." ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload an avatar." ON storage.objects;
DROP POLICY IF EXISTS "Anyone can update their own avatar." ON storage.objects;

-- Criar novas políticas para o bucket 'avatars'
CREATE POLICY "Avatar images are publicly accessible."
  ON storage.objects FOR SELECT
  USING ( bucket_id = 'avatars' );

CREATE POLICY "Anyone can upload an avatar."
  ON storage.objects FOR INSERT
  WITH CHECK ( bucket_id = 'avatars' AND auth.role() = 'authenticated' );

CREATE POLICY "Anyone can update their own avatar."
  ON storage.objects FOR UPDATE
  USING ( auth.uid() = owner )
  WITH CHECK ( bucket_id = 'avatars' );
