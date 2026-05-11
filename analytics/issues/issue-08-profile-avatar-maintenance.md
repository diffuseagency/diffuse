# Issue 08: Profile Avatar & Modo Manutenção
**Data e Hora de Geração:** 11/05/2026 às 11:54 (Horário de Brasília)

## Descrição
Implementar recursos finais de personalização e controle do site.

## Requisitos
- **Avatar**: No `/profile`, permitir upload de foto vinculado ao Auth User.
- **Manutenção**:
    - Botão "Toggle" no CMS Settings para ativar/desativar o `isMaintenanceMode`.
    - Middleware em `App.tsx` que verifica a flag no Firestore e redireciona rotas públicas para a página de manutenção caso ativado.

## Comportamento Esperado
Dar controle total ao administrador sobre a disponibilidade do site e personalização do perfil.
