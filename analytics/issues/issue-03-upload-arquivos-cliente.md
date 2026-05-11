# Issue 03: Upload de Arquivos pelo Cliente
**Data e Hora de Geração:** 11/05/2026 às 11:54 (Horário de Brasília)

## Descrição
Permitir que os clientes enviem briefings, logos e materiais diretamente pelo Dashboard do Cliente.

## Requisitos
- **Target**: `ClientDashboard` e `ProjectDetails`.
- **Funcionalidades**:
    - Componente `Dropzone` na aba de arquivos do projeto.
    - Upload para o Firebase Storage e salvamento da URL/metadados no array `assets` do documento do projeto no Firestore.
    - Log de atividade automático informando que o cliente enviou um novo arquivo.

## Comportamento Esperado
O cliente acessa seu projeto, arrasta um arquivo e o admin visualiza esse arquivo imediatamente na área administrativa do projeto.
