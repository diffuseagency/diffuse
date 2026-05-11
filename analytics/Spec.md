# Especificação Técnica de Implementações Pendentes
**Data/Hora (Brasília):** 11/05/2026 13:35

Este documento detalha 'somente o que falta implementar' com base no `analytics/report.md`.

---

## 1. Modificações em Páginas (Page)

### 1.1. Blog.tsx (Busca e Filtro)
- **Comportamento:** Adicionar estado local para `searchTerm` e `activeCategory`.
- **Lógica:** Refatorar o `useEffect` para incluir clausulas `where` dinâmicas ou filtragem em memória (client-side) para volumes pequenos/médios de posts.
- **UI:** Conectar o `input` de busca ao estado e aplicar animações de entrada/saída nos cards filtrados usando `motion/layout`.

### 1.2. BlogPost.tsx (Social Share)
- **Comportamento:** Implementar `navigator.share()` API para mobile e links de fallback (WhatsApp, LinkedIn, Twitter) para desktop.
- **Componentes:** Abstrair para um componente `<ShareActions />`.

### 1.3. NotFound.tsx (Página 404)
- **Nova Página:** Criar `src/pages/NotFound.tsx`.
- **UI:** Design brutalista/minimalista com botão de retorno à `Home`.
- **Rota:** Adicionar `{ path: '*', element: <NotFound /> }` no `App.tsx`.

---

## 2. Comportamentos e Lógica (Behavior)

### 2.1. Dynamic Favicon (useFavicon)
- **Hook:** Criar `src/hooks/useFavicon.ts`.
- **Lógica:** Escutar mudanças no `settings.site_favicon` (vindo do `useSiteSettings`) e atualizar o `href` do elemento `link[rel="icon"]` no `document.head`.

### 2.2. Navigation Guard Avançado
- **Guia:** Refatorar `src/App.tsx` para envolver rotas sensíveis em um wrapper que verifica `navigation.isActive` (Firestore) antes de renderizar, redirecionando para a `Home` se a rota estiver desativada pelo Admin.

### 2.3. Email Triggers (Arquitetura)
- **Estratégia:** Criar uma coleção `mail_queue` para que o frontend possa postar solicitações de envio, permitindo integração futura com Cloud Functions/Resend/SendGrid sem travar a UI.

---

## 3. Componentes e Refatoração (Component)

### 3.1. Skeleton Loaders
- **Componentes:** Criar `src/components/ui/Skeleton.tsx`.
- **Uso:** Substituir `Loader2` por Skeletons no `Blog.tsx` e `ProjectList.tsx` para evitar saltos de layout durante o carregamento inicial de dados.

### 3.2. Breadcrumbs Global
- **Refatoração:** Garantir que o componente em `src/components/Breadcrumbs.tsx` aceite caminhos dinâmicos e seja aplicado consistentemente em:
  - `DetailedFinance.tsx`
  - `ProjectDetails.tsx` (Admin e Cliente)
  - `CMSManager.tsx` (Sub-abas)

---

## 4. Validação e Telemetria
- **Error Handlers:** Revisão em massa em `CMSManager.tsx` e `Admin.tsx` para garantir que TODOS os blocos `catch` chamem `handleFirestoreError`.

---
*Especificação gerada para o ciclo final de desenvolvimento.*
