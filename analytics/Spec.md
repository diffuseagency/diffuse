# Especificação Técnica: Finalização do Sistema DIFFUSE
**Data de Geração:** 11/05/2026 - 08:48:57 (Horário de Brasília)

Este documento detalha as especificações técnicas para a implementação dos itens identificados no `analytics/report.md`.

## 1. Analytics & Inteligência (Dashboard)

### Página: `AdminOverview.tsx`
- **Comportamento:** Refatorar a prop `metrics.chartData` no `Admin.tsx` para realizar um reduce dinâmico na coleção `billing`.
- **Lógica:** Filtrar faturas por `status === 'paid'`, agrupar por mês/ano e somar o total.
- **Componente:** `Recharts` deve exibir o nome do mês abreviado no eixo X.

## 2. Experiência do Cliente (CRM Central)

### Página: `ClientDashboard.tsx` (Nova)
- **Acesso:** Rota `/meu-projeto` deve evoluir para `/dashboard-cliente`.
- **Conteúdo:** 
  - Listagem de todos os projetos vinculados ao e-mail do cliente logado.
  - Seção de "Faturas Pendentes" e "Histórico de Pagamentos".
  - Acesso centralizado à `MediaLibrary` do cliente.

## 3. Auditoria e Segurança (Admin)

### Coleção Firestore: `activity_logs`
- **Schema:** `{ userId: string, action: string, targetId: string, timestamp: Timestamp, details: string }`.
- **Behavior:** Adicionar um middleware ou hook global nas funções de escrita do `CMSManager` e `Admin` para registrar automaticamente cada `create`, `update` e `delete`.

## 4. Marketing & Conversão

### Componente: `NewsletterForm.tsx` (Novo)
- **Localização:** Footer da aplicação pública.
- **Behavior:** Registro na coleção `leads_newsletter` com validação de formato de e-mail e feedback de sucesso via animação.
- **Admin:** Aba dedicada no `CMSManager` ou `crm` para exportação de lista CSV.

## 5. Rich Content (Portfólio)

### Componente: `TechStackPills.tsx` (Novo)
- **Uso:** Em `ProjectDetailPublic.tsx`.
- **Estética:** Tags minimalistas, monocromáticas, usando `font-mono`.

### Comportamento: SEO Avançado
- **CMS:** Adicionar campos `og_image` e `og_description` em `posts` e `projects`.
- **SEO.tsx:** Atualizar o componente para consumir esses campos prioritariamente se disponíveis.

## 6. Configurações de Sistema

### Funcionalidade: Maintenance Mode
- **Persistence:** Campo `is_maintenance_mode` na coleção `settings`.
- **Behavior:** Se ativo, redirecionar todas as rotas públicas (exceto `/admin`) para `pages/Maintenance.tsx`.
