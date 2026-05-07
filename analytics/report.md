# Relatório de Pendências do CMS - Diffuse Agency
**Data e Hora de Geração:** 07/05/2026 10:05 (Horário de Brasília)

## 1. Gestão de Conteúdo Estático (Hardcoded)
- [ ] **Página "Sobre":** Manifesto, Visão, Missão e DNA ainda estão fixos no código (`About.tsx`). Necessário migrar para a aba "Configurações" ou uma nova aba "Institucional".
- [ ] **Página "Cases/Portfolio":** As categorias e filtros não são dinâmicos; se o usuário adicionar um projeto com uma categoria nova, o filtro não se adapta automaticamente.

## 2. Gerenciamento de Mídia
- [ ] **Sistema de Upload:** O CMS utiliza campos de texto simples para URLs de imagem. Falta integração com Firebase Storage para upload direto.
- [ ] **Favicon e Logo:** Não há gestão dinâmica do logo da agência ou do favicon do site via CMS.

## 3. SEO e Marketing
- [ ] **Metadados (SEO):** Falta gerenciamento de `meta title`, `meta description` e `og:image` por página ou global.
- [ ] **Scripts Externos:** Não há campo para inserção de scripts de terceiros (Google Analytics, Facebook Pixel, Tags de Verificação).

## 4. Navegação e UI Global
- [ ] **Editores de Menu:** Os links do Navbar e Footer são hardcoded no `App.tsx` e `Footer.tsx`. Mudanças estruturais exigem alteração no código.
- [ ] **Avisos Globais:** Ausência de gerenciamento de "Banner de Aviso" (Topbar) para comunicados ou promoções temporárias.

## 5. Blog e Notícias (Arquitetura)
- [ ] **Módulo de Blog:** O sistema não possui estrutura para publicação de artigos ou comunicados de imprensa, limitando o marketing de conteúdo.

---
*Gerado pela auditoria de CMS da Diffuse.*

