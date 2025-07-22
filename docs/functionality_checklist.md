# Checklist de Funcionalidades Detalhado - ConectaBio

Este checklist serve para rastrear o desenvolvimento e garantir que todas as funcionalidades e configurações estejam corretas.

## Autenticação e Navegação
- [ ] **Fluxo de Usuário Não Logado**:
  - [ ] Acessar `/`, `/login` ou `/signup` mostra a página correspondente.
  - [ ] Acessar `/[username]` mostra a página pública daquele usuário.
- [ ] **Fluxo de Usuário Logado**:
  - [ ] Acessar `/`, `/login` ou `/signup` redireciona automaticamente para `/[username]`.
  - [ ] Após fazer login ou signup, é redirecionado para `/[username]`.
- [ ] **Logout**: Encerra a sessão e redireciona para a página inicial (`/`).

## Página de Perfil Unificada (`/[username]`)

### Visão Pública (para visitantes)
- [ ] **Layout**: Renderiza um layout centralizado de coluna única.
- [ ] **Header do Perfil**: Exibe o avatar, nome de usuário e biografia.
- [ ] **Corpo**: Exibe a lista de cards públicos do usuário.

### Visão de Edição (para o dono do perfil)
- [ ] **Layout Geral**:
  - [ ] Um header fixo no topo com botões de ação.
  - [ ] Um corpo principal com um container centralizado para edição.
  - [ ] Um rodapé flutuante com botões para adicionar novos cards.
- [ ] **Header de Ações**:
  - [ ] **Menu de Configurações (Esquerda)**: Menu flutuante com opções "Sair", "Alterar Senha" (WIP), "Alterar Usuário" (WIP).
  - [ ] **Botão Compartilhar (Centro)**: Copia a URL do perfil e mostra notificação.
  - [ ] **Botão Salvar (Direita)**: Salva as alterações do perfil (nome/bio).
- [ ] **Corpo Principal de Edição**:
  - [ ] **Seção de Perfil**:
    - [ ] Avatar com botão de upload.
    - [ ] Campo de input para o nome.
    - [ ] Campo de textarea para a biografia.
  - [ ] **Seção de Grid de Cards**:
    - [ ] Renderiza o `GridLayout` com os cards do usuário.
    - [ ] Permite arrastar, soltar e redimensionar cards.
    - [ ] Cada card tem seus próprios controles de edição e exclusão.
- [ ] **Rodapé de Adição de Cards**:
  - [ ] Botões para adicionar diferentes tipos de cards (Imagem, Título, Nota, Link, etc.).

## Configuração de Backend (Supabase)

### Banco de Dados (RLS)
- [ ] **Tabela `profiles`**: RLS habilitada, com coluna `layout_config` (jsonb), leitura pública, escrita restrita ao dono.
- [ ] **Tabela `cards`**: RLS habilitada, leitura pública, escrita restrita ao dono.

### Storage (Políticas de Acesso)
- [ ] **Bucket `avatars`**: Leitura pública, escrita restrita ao dono.
