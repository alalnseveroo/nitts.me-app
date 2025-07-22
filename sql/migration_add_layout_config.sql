-- Adiciona uma nova coluna chamada 'layout_config' à tabela 'profiles'.
-- O tipo 'jsonb' é otimizado para armazenar e consultar dados em formato JSON.
-- 'NOT NULL' garante que a coluna não pode ser vazia.
-- 'DEFAULT '[]'::jsonb' define que, por padrão, o valor da coluna será um array JSON vazio,
-- o que previne erros em perfis que ainda não tiveram seu layout salvo.

ALTER TABLE public.profiles
ADD COLUMN layout_config jsonb NOT NULL DEFAULT '[]'::jsonb;

-- Opcional, mas recomendado: Excluir a tabela 'layouts' se ela existir e não for mais necessária.
-- Descomente a linha abaixo se você tem certeza de que a tabela 'layouts' foi apenas para este
-- propósito e não contém dados importantes.
-- DROP TABLE IF EXISTS public.layouts;
