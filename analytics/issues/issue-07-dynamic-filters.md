# Issue 07: Filtros Dinâmicos de Portfólio
**Data e Hora de Geração:** 07/05/2026 10:10 (Horário de Brasília)

## Descrição
Eliminar as categorias estáticas do portfólio, tornando os filtros dependentes do conteúdo real do banco.

## Requisitos
- **Lógica:** Extrair todas as categorias únicas dos documentos da coleção `portfolio`.
- **Componente:** Atualizar `Portfolio.tsx` para renderizar os botões de filtro baseando-se no `Set` de categorias extraídos.
- **Comportamento:** Se um novo projeto for adicionado com uma categoria inédita, o filtro deve aparecer automaticamente.

## Referência
`src/pages/Portfolio.tsx`
