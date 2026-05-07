# Especificação Técnica - Evolução do CMS
**Data e Hora de Geração:** 07/05/2026 10:07 (Horário de Brasília)

## 1. Expansão de Esquema (Data Models)

### 1.1 Coleção `settings` (Chaves Adicionais)
- `about_manifesto` (string): Texto de abertura da página Sobre.
- `about_vision` (string): Nossa Visão.
- `about_mission` (string): Nossa Missão.
- `about_dna` (string): Nosso DNA.
- `seo_title` (string): Título global da aba.
- `seo_description` (string): Descrição para motores de busca.
- `analytics_id` (string): ID do Google Analytics.

### 1.2 Coleção `navigation` (Nova)
- `label` (string): Nome do link (ex: "Home").
- `path` (string): Rota (ex: "/").
- `order` (number): Ordem de exibição.
- `isActive` (boolean).

## 2. Novos Componentes de Interface

### 2.1 `CMSInstitutional.tsx` (Sub-ABA)
- **Objetivo:** Interface para edição dos campos da página Sobre.
- **Componentes:** Rich Text Editors simples para os parágrafos do Manifesto e DNA.

### 2.2 `CMSNavigation.tsx` (Sub-ABA)
- **Objetivo:** Drag-and-drop ou Reorder list para gerenciar links do menu superior e rodapé.

### 2.3 `MediaLibrary.tsx` (Componente de Apoio)
- **Objetivo:** Gerenciar uploads para Firebase Storage.
- **Comportamento:** Ao clicar em um campo de imagem no CMS, abre um pop-over para upload ou seleção de mídia já enviada.

## 3. Refatorações de Comportamento (Behavior)

### 3.1 Hook `useSiteSettings`
- **Comportamento:** Singleton que carrega as configurações globais uma única vez no `App.tsx` e injeta via Context API ou Prop Drilling para evitar múltiplas leituras ao Firestore.

### 3.2 Dynamic Helmet (SEO)
- **Integração:** Uso de `react-helmet-async` para injetar os metadados dinâmicos vindos do CMS em cada rota navegada.

### 3.3 Dynamic Filters (Portfolio)
- **Lógica:** O componente `Portfolio.tsx` deve gerar a lista de "Filtros/Categorias" baseando-se no `Set` de categorias único presente nos documentos da coleção `portfolio` retornados do banco.

---
*Fim da Especificação Técnica Focal em CMS.*
