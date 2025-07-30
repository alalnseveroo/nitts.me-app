-- Adiciona o tipo ENUM para os papéis de usuário, para garantir a consistência dos dados.
CREATE TYPE user_role AS ENUM (
  'free',
  'weekly',
  'monthly',
  'annual',
  'lifetime',
  'guest',
  'ambassador'
);

-- Adiciona o tipo ENUM para os status de assinatura.
CREATE TYPE subscription_status AS ENUM (
  'active',
  'inactive',
  'past_due',
  'canceled'
);


-- Habilita a extensão pgcrypto se ainda não estiver habilitada (necessária para gen_random_uuid())
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Tabela para armazenar perfis de usuário
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  name TEXT,
  bio TEXT,
  avatar_url TEXT,
  layout_config JSONB,
  show_analytics BOOLEAN DEFAULT false,
  fb_pixel_id TEXT,
  ga_tracking_id TEXT,
  
  -- Coluna para o tipo de usuário
  role user_role DEFAULT 'free',
  
  -- Colunas para gerenciar o status de pagamento
  subscription_status subscription_status DEFAULT 'inactive',
  subscription_ends_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela para armazenar os cards do usuário
CREATE TABLE cards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    title TEXT,
    content TEXT,
    link TEXT,
    background_image TEXT,
    background_color TEXT,
    text_color TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela para registrar visualizações de página
CREATE TABLE page_views (
  id BIGSERIAL PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela para registrar cliques nos links
CREATE TABLE link_clicks (
  id BIGSERIAL PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  card_id UUID NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
  destination_url TEXT,
  source TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);


-- Habilitar Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS para a tabela de perfis
-- Permite leitura pública de perfis
CREATE POLICY "Public profiles are viewable by everyone."
  ON profiles FOR SELECT
  USING ( true );
-- Permite que usuários atualizem seu próprio perfil
CREATE POLICY "Users can update their own profile."
  ON profiles FOR UPDATE
  USING ( auth.uid() = id );

-- Políticas de RLS para a tabela de cards
-- Permite leitura pública de cards
CREATE POLICY "Cards are viewable by everyone."
  ON cards FOR SELECT
  USING ( true );
-- Permite que usuários insiram seus próprios cards
CREATE POLICY "Users can insert their own cards."
  ON cards FOR INSERT
  WITH CHECK ( auth.uid() = user_id );
-- Permite que usuários atualizem seus próprios cards
CREATE POLICY "Users can update their own cards."
  ON cards FOR UPDATE
  USING ( auth.uid() = user_id );
-- Permite que usuários deletem seus próprios cards
CREATE POLICY "Users can delete their own cards."
  ON cards FOR DELETE
  USING ( auth.uid() = user_id );

-- Políticas para o Storage (avatares)
-- Permite leitura pública de avatares
CREATE POLICY "Avatar images are publicly accessible."
  ON storage.objects FOR SELECT
  USING ( bucket_id = 'avatars' );
-- Permite que usuários autenticados insiram/atualizem seus próprios avatares
CREATE POLICY "Anyone can upload an avatar."
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK ( bucket_id = 'avatars' );

CREATE POLICY "Anyone can update their own avatar."
  ON storage.objects FOR UPDATE
  TO authenticated
  USING ( auth.uid() = owner )
  WITH CHECK ( bucket_id = 'avatars' );
