# Issue 01: Expansão de Esquema (Data Models)
**Data e Hora de Geração:** 07/05/2026 10:10 (Horário de Brasília)

## Descrição
Implementar a expansão do esquema de dados no Firestore para suportar as novas funcionalidades do CMS.

## Requisitos
- **Coleção `settings`:** Adicionar novos campos para conteúdo institucional e SEO:
    - `about_manifesto`, `about_vision`, `about_mission`, `about_dna`.
    - `seo_title`, `seo_description`, `analytics_id`.
- **Coleção `navigation`:** Criar nova coleção para gerenciar menus dinâmicos:
    - Campos: `label`, `path`, `order`, `isActive`.

## Referência
`firebase-blueprint.json` e Console Firebase.
