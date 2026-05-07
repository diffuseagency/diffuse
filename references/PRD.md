# PRD - Projeto DIFFUSE (Plataforma CMS para Agência Digital)

## 1. Visão Geral
O projeto DIFFUSE é uma aplicação web de alta performance voltada para agências digitais. O sistema combina uma landing page sofisticada com um painel administrativo robusto (CMS), permitindo a gestão centralizada de serviços, portfólio, depoimentos e leads de clientes, utilizando Firebase como infraestrutura mestre.

## 2. Objetivos Principais
- Fornecer uma interface de CMS intuitiva para gestão de conteúdo.
- Centralizar o recebimento e gestão de leads (mensagens de contato).
- Oferecer uma experiência de usuário premium com animações fluidas e design minimalista.
- Garantir escalabilidade e segurança através do ecossistema Firebase.

## 3. Requisitos Funcionais

### 3.1 Painel Administrativo (CMS)
- [x] Autenticação administrativa via Firebase Auth (Google e Email/Senha).
- [x] Gestão completa de serviços (CRUD).
- [x] Gestão completa de portfólio (CRUD).
- [x] Gestão completa de depoimentos (CRUD).
- [x] Edição de configurações dinâmicas do site (Textos, contatos).
- [x] Módulo de visualização e exclusão de mensagens de leads.

### 3.2 Comunicação e Leads
- [x] Formulário de contato integrado ao Firestore.
- [x] Notificações e dashboard de gestão de mensagens no admin.

## 4. Requisitos Não Funcionais
- **Performance**: Carregamento ultra rápido e otimização de assets.
- **Segurança**: Regras granulares de acesso no Firestore (ABAC).
- **Escalabilidade**: Arquitetura serverless baseada em Firebase.

## 5. Especificações Técnicas
- **Frontend**: React 19, Vite, TypeScript, Tailwind CSS, Motion.
- **Banco de Dados**: Firebase Firestore.
- **Autenticação**: Firebase Authentication.
- **Infraestrutura**: Cloud Run / Firebase.

## 6. Roadmap (Próximos Passos)
1. **Métricas Reais**: Implementar agregação de dados reais para os gráficos da dashboard.
2. **SEO Otimizado**: Configuração de meta tags dinâmicas e SSR se necessário.
3. **Storage**: Integração com Firebase Storage para upload direto de arquivos no CMS.

---
*Atualizado em: 06/05/2026 - 18:02 (Brasília)*
