# Issue 03: Auditoria Global de Error Handling
**Data/Hora (Brasília):** 11/05/2026 13:42

## Descrição
Revisar todos os componentes administrativos para garantir que erros do Firestore sejam capturados e reportados corretamente.

## Requisitos
- **Arquivos alvo:** `CMSManager.tsx`, `Admin.tsx`, `OperationalModals.tsx`.
- **Ação:** Substituir blocos `console.error` genéricos por chamadas ao `handleFirestoreError(error, OperationType.WRITE/LIST, 'path')`.

## Comportamento Esperado
Erros de permissão (Permission Denied) devem gerar um erro estruturado no console que facilite o diagnóstico de regras de segurança (Firestore Rules).
