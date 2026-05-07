# Issue 04: Refatoração do CMS Manager
Data de geração (Brasília): 06/05/2026 17:57:00

## Descrição
Melhorar a experiência de usuário no painel de gerenciamento de conteúdo (CMS), eliminando diálogos `prompt()` e unificando o fluxo com Firestore.

## Requisitos Técnicos
- **Arquivo**: `src/pages/CMSManager.tsx`

## Comportamento Esperado
- [x] Substituir `prompt()` por modais de edição.
- [x] Implementar aba de configurações globais (`settings`).
- [x] Garantir sincronização de estado após operações de escrita.
