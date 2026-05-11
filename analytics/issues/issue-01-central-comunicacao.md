# Issue 01: Central de Comunicação (Admin)
**Data e Hora de Geração:** 11/05/2026 às 11:54 (Horário de Brasília)

## Descrição
Implementar uma nova página para envio de comunicados e newsletters para a lista de leads capturados.

## Requisitos
- **URL**: `/admin/comunicacao`
- **Componentes**:
    - `EmailComposer`: Integrar um editor de texto (ex: React Quill ou similar) para compor o corpo do e-mail.
    - `RecipientSelector`: Lista de contatos com filtros e seleção múltipla.
    - `SendButton`: Implementar lógica de disparo (integração com serviço de e-mail).

## Comportamento Esperado
O administrador deve ser capaz de selecionar destinatários da coleção `messages`/`newsletter` e enviar uma mensagem personalizada.
