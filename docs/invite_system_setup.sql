-- 1. Cria a tabela para armazenar os códigos de convite
CREATE TABLE IF NOT EXISTS public.invites (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    code text NOT NULL,
    email text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    used_at timestamp with time zone,
    used_by_user_id uuid,
    CONSTRAINT invites_pkey PRIMARY KEY (id),
    CONSTRAINT invites_code_key UNIQUE (code),
    CONSTRAINT invites_email_key UNIQUE (email),
    CONSTRAINT invites_used_by_user_id_fkey FOREIGN KEY (used_by_user_id) REFERENCES auth.users(id)
);

-- 2. Habilita a RLS na tabela
ALTER TABLE public.invites ENABLE ROW LEVEL SECURITY;

-- 3. Cria a função RPC para resgatar um convite
CREATE OR REPLACE FUNCTION public.claim_invite(invite_code text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  invite_record RECORD;
  current_user_id uuid := auth.uid();
  current_user_email text;
BEGIN
  -- Verificar se o usuário está autenticado
  IF current_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'message', 'Usuário não autenticado.');
  END IF;

  -- Obter o e-mail do usuário autenticado
  SELECT email INTO current_user_email FROM auth.users WHERE id = current_user_id;

  -- Encontrar o convite
  SELECT * INTO invite_record FROM public.invites WHERE code = invite_code;

  -- Verificar se o convite existe
  IF invite_record IS NULL THEN
    RETURN json_build_object('success', false, 'message', 'Código de convite inválido.');
  END IF;

  -- Verificar se o e-mail corresponde
  IF invite_record.email <> current_user_email THEN
    RETURN json_build_object('success', false, 'message', 'Este convite é para um e-mail diferente.');
  END IF;

  -- Verificar se o convite já foi usado
  IF invite_record.used_at IS NOT NULL OR invite_record.used_by_user_id IS NOT NULL THEN
    RETURN json_build_object('success', false, 'message', 'Este código de convite já foi utilizado.');
  END IF;

  -- Se tudo estiver correto, resgatar o convite
  UPDATE public.invites
  SET
    used_at = now(),
    used_by_user_id = current_user_id
  WHERE id = invite_record.id;

  -- Atualizar o perfil do usuário para 'guest'
  UPDATE public.profiles
  SET role = 'guest'
  WHERE id = current_user_id;

  -- Retornar sucesso
  RETURN json_build_object('success', true, 'message', 'Convite resgatado com sucesso!');
END;
$$;
