# Especificação Técnica de Implementação - Projeto DIFFUSE
Data de geração (Brasília): 06/05/2026 18:04:00

Este documento especifica os requisitos técnicos para a plataforma CMS da DIFFUSE.

## 1. Migração da Página de Contato
- **Arquivo**: `src/pages/Contact.tsx`
- **Behavior**:
    - Substituir `useEffect` atual pela consulta à coleção `settings` (usando `getDocs` ou `useFirestoreCollection`).
    - No `onSubmit`, invocar `addFirestoreDoc('messages', data)` em vez do `fetch` para `/api/contact`.
    - Garantir exibição de feedback de sucesso baseado na resposta da Promise do Firestore.

## 3. Painel de Controle de Mensagens (Admin)
- **Arquivo**: `src/pages/Admin.tsx`
- **Behavior**:
    - Implementar nova rota/aba: `/admin/mensagens`.
    - Listar documentos da coleção `messages` ordenados por `createdAt` descendente.
    - Exibir card com: Nome, E-mail, Assunto e Mensagem.
    - Opção de marcar como lida ou excluir.

## 4. Refatoração do CMS Manager
- **Arquivo**: `src/pages/CMSManager.tsx`
- **Behavior**:
    - Substituir os `prompt()` por modais de edição ou inputs inline.
    - Implementar a aba "Configurações" (`settings`) para edição de chaves como `contact_email`, `hero_title`, etc.
    - Garantir que cada operação de escrita atualize o estado local ou force um re-fetch consciente via `useFirestoreCollection`.
