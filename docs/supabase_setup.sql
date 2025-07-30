-- Scripts para configurar o banco de dados Supabase para o projeto ConectaBio.
-- Execute no Editor SQL do seu projeto Supabase.

-- 1. ADICIONAR CAMPO 'role' E OUTROS À TABELA 'profiles'
-- Esta tabela é criada automaticamente pelo Supabase Auth.
-- Adicionamos as colunas personalizadas que nossa aplicação precisa.

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS name TEXT,
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS layout_config JSONB,
ADD COLUMN IF NOT EXISTS show_analytics BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS fb_pixel_id TEXT,
ADD COLUMN IF NOT EXISTS ga_tracking_id TEXT,
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'free';

-- 2. CRIAR TABELA 'cards'
-- Esta tabela armazenará todos os cards criados pelos usuários.

CREATE TABLE IF NOT EXISTS public.cards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL,
    title TEXT,
    content TEXT,
    link TEXT,
    background_image TEXT,
    background_color TEXT,
    text_color TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. CRIAR TABELA 'page_views'
-- Para rastrear visualizações de página para a funcionalidade de análise.

CREATE TABLE IF NOT EXISTS public.page_views (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. CRIAR TABELA 'link_clicks'
-- Para rastrear cliques nos links dos cards.

CREATE TABLE IF NOT EXISTS public.link_clicks (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    card_id UUID REFERENCES public.cards(id) ON DELETE CASCADE,
    source TEXT,
    destination_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);


-- 5. HABILITAR ROW LEVEL SECURITY (RLS)
-- Esta é uma etapa de segurança CRUCIAL.

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.link_clicks ENABLE ROW LEVEL SECURITY;

-- 6. CRIAR POLÍTICAS DE ACESSO (RULES)

-- Tabela 'profiles'
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles
FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert their own profile." ON public.profiles;
CREATE POLICY "Users can insert their own profile." ON public.profiles
FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile." ON public.profiles;
CREATE POLICY "Users can update own profile." ON public.profiles
FOR UPDATE USING (auth.uid() = id);

-- Tabela 'cards'
DROP POLICY IF EXISTS "Cards are viewable by everyone." ON public.cards;
CREATE POLICY "Cards are viewable by everyone." ON public.cards
FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert their own cards." ON public.cards;
CREATE POLICY "Users can insert their own cards." ON public.cards
FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own cards." ON public.cards;
CREATE POLICY "Users can update their own cards." ON public.cards
FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own cards." ON public.cards;
CREATE POLICY "Users can delete their own cards." ON public.cards
FOR DELETE USING (auth.uid() = user_id);

-- Tabela 'page_views' e 'link_clicks'
-- Qualquer pessoa pode inserir, pois são eventos anônimos.
DROP POLICY IF EXISTS "Anyone can insert page views." ON public.page_views;
CREATE POLICY "Anyone can insert page views." ON public.page_views
FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can insert link clicks." ON public.link_clicks;
CREATE POLICY "Anyone can insert link clicks." ON public.link_clicks
FOR INSERT WITH CHECK (true);

-- As leituras dessas tabelas de analytics devem ser restritas apenas ao dono do perfil.
DROP POLICY IF EXISTS "Users can view their own analytics." ON public.page_views;
CREATE POLICY "Users can view their own analytics." ON public.page_views
FOR SELECT USING (auth.uid() = profile_id);

DROP POLICY IF EXISTS "Users can view their own link clicks." ON public.link_clicks;
CREATE POLICY "Users can view their own link clicks." ON public.link_clicks
FOR SELECT USING (auth.uid() = profile_id);


-- 7. CONFIGURAR STORAGE E POLÍTICAS DE ACESSO
-- Crie um bucket chamado 'avatars' e defina-o como público.
-- As políticas abaixo garantem que os usuários só possam gerenciar seus próprios avatares.

-- (Execute isso apenas se o bucket 'avatars' ainda não existir)
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('avatars', 'avatars', true)
-- ON CONFLICT (id) DO NOTHING;

-- Política de acesso para Avatares
DROP POLICY IF EXISTS "Avatar images are publicly accessible." ON storage.objects;
CREATE POLICY "Avatar images are publicly accessible." ON storage.objects
FOR SELECT USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Anyone can upload an avatar." ON storage.objects;
CREATE POLICY "Anyone can upload an avatar." ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Users can update their own avatar." ON storage.objects;
CREATE POLICY "Users can update their own avatar." ON storage.objects
FOR UPDATE USING (auth.uid() = owner) WITH CHECK (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Users can delete their own avatar." ON storage.objects;
CREATE POLICY "Users can delete their own avatar." ON storage.objects
FOR DELETE USING (auth.uid() = owner) ;
