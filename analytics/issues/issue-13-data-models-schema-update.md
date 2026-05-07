# Issue 13: Data Models & Schema Formalization
**Data e Hora de Geração:** 07/05/2026 11:00 (Horário de Brasília)

## Descrição
Atualização do `firebase-blueprint.json` e regras de segurança para suportar novas funcionalidades.

## Requisitos
- Adicionar esquema para a coleção `messages` (contatos).
- Expandir esquema de `portfolio`: `slug`, `full_description`, `challenge_text`, `solution_text`.
- Expandir esquema de `projects`: `current_step` (number), `assets` (array de objetos com metadata de arquivos).
- Revisar `firestore.rules` para garantir que apenas o autor/admin acesse os `assets` do projeto.
- Formalizar subcoleções se necessário para logs de atividades.
