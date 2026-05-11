# Issue 01: Blog Search and Category Filter
**Data/Hora (Brasília):** 11/05/2026 13:40

## Descrição
Implementar a funcionalidade de busca textual e filtragem por categorias na página `Blog.tsx`.

## Requisitos
- **State:** Criar estados `searchTerm` e `activeCategory`.
- **Lógica:** 
  - Filtrar a lista de `postsMerged` com base no `searchTerm` (case insensitive).
  - Filtrar por `activeCategory` se não for "Todos".
- **UI:** 
  - Vincular o input de busca ao estado.
  - Adicionar chips de categoria clicáveis.
  - Usar `AnimatePresence` do `motion` para suavizar a entrada/saída de cards.

## Comportamento Esperado
O usuário deve digitar no campo de busca e ver os resultados em tempo real. Ao clicar em uma categoria (ex: "Estratégia"), apenas os posts dessa categoria devem aparecer.
