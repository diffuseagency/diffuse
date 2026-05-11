# Issue 02: Navigation Guard para Rotas Dinâmicas
**Data/Hora (Brasília):** 11/05/2026 13:41

## Descrição
Garantir que as rotas de Blog e Journal respeitem o estado `isActive` definido no CMS.

## Requisitos
- **App.tsx:** Envolver as rotas `/blog` e `/blog/:slug` com o componente `PublicRouteGuard`.
- **Validação:** Verificar se o `PublicRouteGuard` está buscando corretamente a configuração de rota na coleção `navigation` do Firestore.

## Comportamento Esperado
Se o administrador desativar o link "Journal" no CMS, qualquer acesso direto à URL `/blog` deve redirecionar para a `Home`.
