-- #############################################################################
-- ### POLÍTICAS DE SEGURANÇA PARA AS TABELAS DO BANCO DE DADOS (RLS) ###
-- #############################################################################

-- ### Tabela `profiles` ###
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access to all profiles" ON profiles;
CREATE POLICY "Allow public read access to all profiles" ON profiles
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow authenticated user to update their own profile" ON profiles;
CREATE POLICY "Allow authenticated user to update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- ### Tabela `cards` ###
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access to all cards" ON cards;
CREATE POLICY "Allow public read access to all cards" ON cards
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow authenticated user to create their own cards" ON cards;
CREATE POLICY "Allow authenticated user to create their own cards" ON cards
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Allow authenticated user to update their own cards" ON cards;
CREATE POLICY "Allow authenticated user to update their own cards" ON cards
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Allow authenticated user to delete their own cards" ON cards;
CREATE POLICY "Allow authenticated user to delete their own cards" ON cards
  FOR DELETE USING (auth.uid() = user_id);


-- #############################################################################
-- ### POLÍTICAS DE SEGURANÇA PARA O STORAGE (ARQUIVOS E IMAGENS)      ###
-- #############################################################################

-- ### Bucket `avatars` ###

-- 1. Política de Leitura Pública para Avatares
--    Permite que qualquer pessoa (mesmo não logada) veja as imagens.
DROP POLICY IF EXISTS "Allow public read access to avatars" ON storage.objects;
CREATE POLICY "Allow public read access to avatars" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

-- 2. Política de Upload de Avatares
--    Permite que um usuário logado faça upload de um avatar. A pasta do upload
--    deve ser o ID do próprio usuário para garantir que ele só salve em seu diretório.
DROP POLICY IF EXISTS "Allow authenticated user to upload avatar" ON storage.objects;
CREATE POLICY "Allow authenticated user to upload avatar" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid() = (storage.foldername(name))[1]::uuid);

-- 3. Política de Atualização de Avatares
--    Permite que o dono do avatar o atualize.
DROP POLICY IF EXISTS "Allow authenticated user to update their own avatar" ON storage.objects;
CREATE POLICY "Allow authenticated user to update their own avatar" ON storage.objects
  FOR UPDATE USING (bucket_id = 'avatars' AND auth.uid() = (storage.foldername(name))[1]::uuid);

-- 4. Política de Deleção de Avatares
--    Permite que o dono do avatar o delete.
DROP POLICY IF EXISTS "Allow authenticated user to delete their own avatar" ON storage.objects;
CREATE POLICY "Allow authenticated user to delete their own avatar" ON storage.objects
  FOR DELETE USING (bucket_id = 'avatars' AND auth.uid() = (storage.foldername(name))[1]::uuid);
