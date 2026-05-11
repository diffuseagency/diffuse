# Issue 04: Skeleton Loaders (UI Feedback)
**Data/Hora (Brasília):** 11/05/2026 13:43

## Descrição
Melhorar a percepção de performance substituindo spinners por Skeleton Screens durante o carregamento de dados.

## Requisitos
- **Componente:** Criar `src/components/ui/Skeleton.tsx`.
- **Implementação:**
  - Aplicar no Grid do `Blog.tsx`.
  - Aplicar na lista de Clientes e Projetos no `Admin.tsx`.

## Comportamento Esperado
Ao trocar de tela ou carregar a página, o usuário deve ver formas cinzas pulsantes que mimetizam o layout final, em vez de uma tela vazia ou apenas um ícone de "loading".
