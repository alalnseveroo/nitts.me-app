-- Adiciona a coluna 'role' para gerenciamento de tipos de usuário, se não existir.
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS role text DEFAULT 'free';

-- Adiciona colunas para status e data de expiração da assinatura, se não existirem.
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS subscription_status text,
ADD COLUMN IF NOT EXISTS subscription_ends_at timestamp with time zone;

-- Adiciona coluna para a tag do card, se não existir.
ALTER TABLE public.cards 
ADD COLUMN IF NOT EXISTS tag text;

-- Adiciona colunas para personalização de cor das tags, se não existirem.
ALTER TABLE public.cards
ADD COLUMN IF NOT EXISTS tag_bg_color text,
ADD COLUMN IF NOT EXISTS tag_text_color text;
