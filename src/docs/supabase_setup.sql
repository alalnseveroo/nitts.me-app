-- Adiciona a coluna 'role' para diferenciar tipos de usuário, se ela não existir.
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS role text DEFAULT 'free';

-- Adiciona a coluna 'subscription_status' para gerenciar pagamentos, se ela não existir.
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS subscription_status text;

-- Adiciona a coluna 'subscription_ends_at' para controlar a validade da assinatura, se ela não existir.
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS subscription_ends_at timestamptz;
