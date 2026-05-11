# Issue 02: Gerenciador de Autores (CMS)
**Data e Hora de Geração:** 11/05/2026 às 11:54 (Horário de Brasília)

## Descrição
Criar um sistema de gestão de autores para os posts do Blog (Journal), permitindo perfis detalhados em vez de simples campos de texto.

## Requisitos
- **URL**: Integrar como uma aba "Autores" dentro de `/admin/cms`.
- **Componentes**:
    - `AuthorCard`: Listagem visual dos autores cadastrados.
    - `AuthorModal`: Formulário para criar/editar autor (Nome, Bio, Foto/Avatar).
- **Integração**: Atualizar o formulário de Post do Blog para permitir a seleção de um autor da lista cadastrada.

## Comportamento Esperado
O usuário poderá cadastrar autores uma única vez e selecioná-los ao criar novos conteúdos no blog.
