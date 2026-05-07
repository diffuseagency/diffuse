# Issue 11: Project Timeline & Evolution Tracking
**Data e Hora de Geração:** 07/05/2026 10:59 (Horário de Brasília)

## Descrição
Sincronização manual e visual da evolução dos projetos entre Admin e Cliente.

## Requisitos
- **Admin:** Adicionar controle (Slider ou Select) no modal de edição de projetos para definir a "Etapa Atual" (0 a 4).
- Etapas sugeridas: Discovery, Estruturação, Desenvolvimento, QA, Entrega.
- **Cliente:** Atualizar barra de progresso no `ProjectDetails.tsx` para refletir o valor dinâmico do campo `current_step`.
- Adicionar logs ou datas previstas para cada etapa se possível.
