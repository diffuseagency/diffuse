# Especificação Técnica (Pendências) - Diffuse Agency
**Data e Hora de Geração:** 07/05/2026 11:00 (Horário de Brasília)

## 1. Novas Páginas (Pages)

### 1.1. Portfolio Case Study (`/portfolio/:slug`)
- **Objetivo:** Página pública detalhada para cada item do portfólio.
- **Comportamento:** Slug dinâmico carregando dados da coleção `portfolio_details` ou campos estendidos na coleção `portfolio`.
- **Componentes:**
    - Hero com imagem de capa (parallax).
    - Descrição do problema e solução técnica.
    - Galeria de screenshots com zoom.
    - Depoimento do cliente específico do projeto.

### 1.2. Audio Engineering Lab (`/lab/audio`)
- **Objetivo:** Showcase da especialidade técnica (Persona).
- **Comportamento:** Interface interativa captando microfone (Web Audio API), aplicando filtros (BiquadFilterNode) e exibindo Analysers em tempo real.
- **Integração:** Totalmente client-side para processamento real-time.

## 2. Novos Comportamentos (Behavior)

### 2.1. Gestão de Entregáveis (Admin -> Clientes)
- **Fluxo:** No painel de Projetos (`/admin/projetos`), o admin deve poder anexar arquivos (PDF, ZIP, Imagens) a um projeto específico.
- **Persistência:** Firebase Storage vinculado ao `projectId`.

### 2.2. Atualização de Timeline do Projeto
- **Fluxo:** No modal `ProjectForm`, adicionar um slider ou select para definir a "Etapa Atual" do projeto (0-4).
- **Impacto:** Refletir diretamente na barra de progresso visual do `ProjectDetails.tsx` (Área do Cliente).

### 2.3. Sistema de Logo Dinâmica
- **Fluxo:** No CMS (`settings`), adicionar campo de upload `agency_logo`.
- **Impacto:** Substituir o ícone "D" estático no `Navbar` e `Footer` pela imagem selecionada no CMS.

## 3. Novos Componentes (Components)

### 3.1. `AudioProcessor.tsx`
- Componente especializado em processamento de áudio com baixa latência.
- Visualização de frequência (Oscilloscope) com `motion/react`.

### 3.2. `ProjectFileVault.tsx`
- Componente de listagem e download de arquivos com estados de loading e verificação de permissão.

### 3.3. `LeadNotifier.tsx`
- Sistema de sinalização sonora ou visual no Admin quando uma nova mensagem chegar em real-time.

## 4. Ajustes de Dados (Data Models)
- **`messages`:** Adicionar esquema formal ao `firebase-blueprint.json`.
- **`portfolio`:** Adicionar campos `slug`, `full_description`, `challenge_text`, `solution_text`.
- **`projects`:** Adicionar campo `current_step` (number) e `assets` (array of objects).

---
*Fim da Especificação.*
