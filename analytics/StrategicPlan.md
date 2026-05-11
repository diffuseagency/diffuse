# Plano Estratégico de Implementação
**Data/Hora (Brasília):** 08/05/2026 15:08

Este documento detalha a estratégia técnica, dependências e plano de execução para as issues pendentes identificadas no relatório de análise.

## 1. Roadmap de Execução (Prioridade Técnica)

### Fase 1: Fundação e Robustez (Issues 07, 04, 05)
*Objetivo: Estabilizar o tratamento de erros e unificar o branding/SEO.*
1. **Issue 07 (Error Handling):** Implementar `handleFirestoreError` globalmente. Isso facilitará o debug das issues subsequentes.
2. **Issue 04 (SEO Contextual):** Refatorar o componente `<SEO />` e aplicá-lo em todas as rotas públicas.
3. **Issue 05 (Dynamic Favicon):** Desenvolver o hook `useFavicon` integrado ao `useSiteSettings`.

### Fase 2: Segurança e Consistência (Issue 06)
*Objetivo: Controlar o acesso e visibilidade das rotas dinâmicas.*
1. **Issue 06 (Navigation Guards):** Criar o `DynamicRouteGuard` no `App.tsx` que consulta o estado `isActive` de cada rota na coleção `navigation`.

### Fase 3: Expansão de Conteúdo (Issues 01, 02)
*Objetivo: Entregar o sistema de Blog completo.*
1. **Infraestrutura (Issue 02):** Configurar a coleção `posts` no Firestore e criar a interface administrativa com editor Markdown.
2. **Exibição (Issue 01):** Desenvolver o front-end do blog com design Bento Grid e páginas individuais.

### Fase 4: Inteligência de Negócio (Issue 03)
*Objetivo: Dashboards administrativos avançados.*
1. **Financeiro:** Implementar agregação real de dados de faturamento e exportação.

---

## 2. Detalhes Técnicos por Issue

### Issue 07: Global Error Handling
- **Técnica:** Criar um logger central em `src/lib/error-handler.ts`.
- **Impacto:** Redução de crashes silenciosos no CMS.

### Issue 04 & 05: Branding & SEO
- **Técnica:** Usar `react-helmet-async` (se disponível) ou manipulação direta do `document.title` e `document.querySelector('link[rel="icon"]')`.
- **Local:** `src/components/SEO.tsx` e um novo `src/hooks/useBranding.ts`.

### Issue 01 & 02: Blog System
- **Tecnologia:** `react-markdown` para renderização e `easy-mde` ou similar para edição (ou apenas um `textarea` com preview).
- **Dados:** Coleção `posts` { title, slug, content, author, date, status, featuredImage, tags }.

### Issue 03: Finance Dashboard
- **Tecnologia:** `recharts` para o gráfico de pizza e `jspdf`/`json-to-csv` para exportação.
- **Lógica:** Agrupar `billing` por `status === 'paid'` e somar `amount`.

---

## 3. Próximos Passos Imediatos
1. Iniciar pela **Issue 07** para garantir que qualquer erro de permissão no CRUD do CMS seja reportado com clareza.
2. Seguir para a **Issue 04** para padronizar o SEO antes da criação das novas páginas de Blog.

---
*Plano estratégico gerado pela Engenharia de Sistemas (DIFFUSE).*
