-- 1. Criação da tabela para armazenar os códigos de convite
CREATE TABLE IF NOT EXISTS public.invites (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  code text NOT NULL,
  email text NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  used_by_user_id uuid,
  CONSTRAINT invites_pkey PRIMARY KEY (id),
  CONSTRAINT invites_code_key UNIQUE (code),
  CONSTRAINT invites_used_by_user_id_fkey FOREIGN KEY (used_by_user_id) REFERENCES profiles(id) ON DELETE SET NULL
);

-- Adicionar comentários para clareza
COMMENT ON TABLE public.invites IS 'Armazena códigos de convite únicos para usuários específicos.';
COMMENT ON COLUMN public.invites.code IS 'O código de convite único (ex: ABCD-EFGH).';
COMMENT ON COLUMN public.invites.email IS 'O e-mail do destinatário do convite.';
COMMENT ON COLUMN public.invites.used_by_user_id IS 'O ID do usuário que resgatou o convite. Nulo se não foi usado.';


-- 2. Habilitar RLS (Row Level Security) na nova tabela
ALTER TABLE public.invites ENABLE ROW LEVEL SECURITY;

-- 3. Políticas de Segurança para a tabela `invites`
-- Ninguém pode ver os convites, exceto através da função RPC.
-- Isso previne que usuários listem ou adivinhem códigos.
DROP POLICY IF EXISTS "Deny all access" ON public.invites;
CREATE POLICY "Deny all access" ON public.invites
  FOR ALL
  USING (false)
  WITH CHECK (false);


-- 4. Criação da Função RPC para resgatar um convite
-- Esta função será chamada pelo cliente de forma segura.
CREATE OR REPLACE FUNCTION public.claim_invite(invite_code text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER -- Executa a função com os privilégios do criador (para poder modificar tabelas)
AS $$
DECLARE
  current_user_id uuid;
  current_user_email text;
  invite_record record;
BEGIN
  -- Obter o ID e o e-mail do usuário autenticado que está fazendo a chamada
  SELECT auth.uid(), auth.jwt()->>'email' INTO current_user_id, current_user_email;

  -- Verificar se o usuário está autenticado
  IF current_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'message', 'Usuário não autenticado.');
  END IF;

  -- Encontrar o convite
  SELECT * INTO invite_record FROM public.invites WHERE code = invite_code;

  -- Verificar se o código existe
  IF invite_record IS NULL THEN
    RETURN json_build_object('success', false, 'message', 'Código de convite inválido.');
  END IF;

  -- Verificar se o e-mail do convite corresponde ao e-mail do usuário autenticado
  IF invite_record.email <> current_user_email THEN
    RETURN json_build_object('success', false, 'message', 'Este convite é para outro e-mail.');
  END IF;

  -- Verificar se o código já foi usado
  IF invite_record.used_by_user_id IS NOT NULL THEN
    RETURN json_build_object('success', false, 'message', 'Este código de convite já foi utilizado.');
  END IF;

  -- Se todas as verificações passaram, o código é válido.
  -- 1. Atualizar o perfil do usuário para 'guest'
  UPDATE public.profiles
  SET role = 'guest'
  WHERE id = current_user_id;

  -- 2. Marcar o convite como usado
  UPDATE public.invites
  SET used_by_user_id = current_user_id
  WHERE id = invite_record.id;

  -- Retornar sucesso
  RETURN json_build_object('success', true, 'message', 'Convite resgatado com sucesso!');
END;
$$;

-- Garantir que a função pode ser chamada por usuários autenticados
GRANT EXECUTE ON FUNCTION public.claim_invite(text) TO authenticated;
