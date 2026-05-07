# Issue 05: Hook Global de Configurações (useSiteSettings)
**Data e Hora de Geração:** 07/05/2026 10:10 (Horário de Brasília)

## Descrição
Refatorar a forma como o sistema consome as configurações globais para otimizar performance e custos de leitura.

## Requisitos
- **Implementação:** Hook customizado `useSiteSettings`.
- **Lógica:** Carregar os dados da coleção `settings` uma única vez no bootstrap da aplicação.
- **Disponibilidade:** Prover os dados via Context API para toda a árvore de componentes.

## Referência
`src/lib/useSiteSettings.ts`
