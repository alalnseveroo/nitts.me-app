-- Adiciona o campo `role` para diferenciar os tipos de usuário (ex: free, guest, premium).
-- O valor padrão para novos usuários será 'free'.

ALTER TABLE profiles
ADD COLUMN role TEXT CHECK (role IN ('free', 'weekly', 'monthly', 'annual', 'lifetime', 'guest', 'ambassador')) DEFAULT 'free';

-- Se você já tem usuários e quer definir o 'role' deles para 'free' inicialmente, execute:
-- UPDATE profiles SET role = 'free' WHERE role IS NULL;
