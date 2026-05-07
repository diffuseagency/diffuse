# Arquitetura do Sistema - Projeto DIFFUSE

## 1. Visão Geral
O DIFFUSE é um ecossistema digital de alta performance que combina um **CMS (Content Management System)** para agência de tecnologia.

## 2. Pilares Tecnológicos

### Frontend
- **Framework**: React 19 (Functional Components, Hooks).
- **Estilização**: Tailwind CSS 4 (Design System utilitário).
- **Animações**: Motion 12 (Animações de interface e transições de rota).
- **Gerenciamento de Estado**: React Hooks nativos (useState, useEffect) e Context API para autenticação.
- **Roteamento**: React Router 7.
- **Formulários**: React Hook Form + Zod (Validação).

### Infraestrutura & Dados
- **Plataforma**: Firebase (Firestore, Auth).
- **Segurança**: Firestore Security Rules (ABAC) e Firebase Admin SDK.
- **Runtime**: Node.js com TypeScript (Server-side para operações sensíveis).

## 3. Estrutura de Diretórios

```text
/
├── analytics/           # Documentação de issues e relatórios de planejamento
├── references/          # PRD e Documentação de Arquitetura
├── src/
│   ├── components/      # Componentes UI reutilizáveis (AdminGuard, Footer, etc)
│   ├── pages/           # Visualizações principais (Home, Portfolio, Admin, etc)
│   ├── lib/             # Utilitários e configurações (como cn helper)
│   ├── App.tsx          # Configuração de rotas e layout global
│   └── main.tsx         # Ponto de entrada do React
├── server.ts            # Servidor Express, API e integração Vite
├── .env.example         # Template de variáveis de ambiente
└── vite.config.ts       # Configurações de build e PWA
```

## 4. Fluxo de Dados e Segurança

### 4.1 Autenticação e Autorização
1. O usuário faz login em `/login`.
2. O servidor valida via `bcrypt` e retorna um JWT.
3. O frontend armazena o token e o utiliza no header `Authorization: Bearer <token>` para todas as chamadas `/api/admin/*`.
4. O middleware `authenticateToken` no servidor protege rotas de escrita (POST, PUT, DELETE).
5. No frontend, o componente `AdminGuard.tsx` protege o acesso visual às páginas administrativas.

### 4.2 Camada de Dados (SQLite)
A base de dados é relacional e normalizada:
- `site_settings`: Armazenamento chave-valor para textos dinâmicos do site.
- `portfolio`, `services`, `testimonials`: Tabelas para o CMS.
- `clients`, `projects`, `billing`: Gestão interna exibida no Dashboard Admin.

## 5. Integração Firebase
O sistema utiliza Firebase como espinha dorsal de dados e segurança:
1. **Firestore**: Banco de dados NoSQL para conteúdo dinâmico e leads.
2. **Auth**: Gestão de identidades (Admin e Clientes).
3. **Security Rules**: Proteção zero-trust para todas as coleções.

## 6. Escalabilidade e Manutenção
- **Componentização**: Interface baseada em átomos de Tailwind para fácil manutenção visual.
- **Type Safety**: TypeScript de ponta a ponta.
- **Firebase First**: Redução de complexidade de backend através de integração direta com SDKs client-side e regras de segurança robustas.

---
*Atualizado em: 06/05/2026 - 18:03*
