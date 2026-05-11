# Issue 04: Notificações e Aprovações de Etapas
**Data e Hora de Geração:** 11/05/2026 às 11:54 (Horário de Brasília)

## Descrição
Implementar um fluxo de aprovação formal para as etapas da timeline do projeto pelo cliente.

## Requisitos
- **Target**: `ProjectDetails` (Visão Cliente).
- **Lógica**:
    - Botão "Aprovar Etapa" deve aparecer apenas quando o progresso da etapa atingir 100%.
    - Salvar o estado `approvedByClient: true` no objeto da timeline.
    - Bloqueio visual: Uma vez aprovada, a etapa deve exibir um selo de "Aprovado" e impedir alterações que retrocedam o status (regra de negócio).

## Comportamento Esperado
Garantir que o projeto avance apenas com o consentimento formal do cliente registrado no banco de dados.
