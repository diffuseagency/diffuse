# Issue 02: Migração da Página de Contato
Data de geração (Brasília): 06/05/2026 17:57:00

## Descrição
Migrar a lógica de carregamento de configurações e envio de formulário de contato para o Firebase Firestore, removendo dependências de APIs legadas.

## Requisitos Técnicos
- **Arquivo**: `src/pages/Contact.tsx`

## Comportamento Esperado
- [x] Substituir `useEffect` atual pela consulta à coleção `settings`.
- [x] No `onSubmit`, persistir dados na coleção `messages` via `addFirestoreDoc`.
- [x] Garantir feedback de sucesso/erro para o usuário.
