# Issue 12: Dynamic Logo & Brand Identity System
**Data e Hora de Geração:** 07/05/2026 11:00 (Horário de Brasília)

## Descrição
Substituição da identidade estática por um sistema gerenciável via CMS.

## Requisitos
- **CMS:** Adicionar campo `agency_logo` na aba de Configurações Gerais.
- Integrar com o Media Picker existente.
- **Frontend:** Atualizar `Navbar.tsx` (ou `App.tsx`) e `Footer.tsx` para carregar a URL da logo do `useSiteSettings`.
- Manter fallback para o ícone estático "D" caso nenhuma logo seja carregada.
- Ajustar CSS para garantir que logos de diferentes proporções não quebrem o layout do header.
