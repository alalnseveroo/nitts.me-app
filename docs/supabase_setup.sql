-- Adiciona a coluna 'role' à tabela 'profiles' se ela não existir.
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'free';

-- Adiciona as colunas de status e data de fim da assinatura à tabela 'profiles' se elas não existirem.
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS subscription_status TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS subscription_ends_at TIMESTAMPTZ;

-- Adiciona a coluna 'tag' à tabela 'cards' se ela não existir.
ALTER TABLE public.cards ADD COLUMN IF NOT EXISTS tag TEXT;
