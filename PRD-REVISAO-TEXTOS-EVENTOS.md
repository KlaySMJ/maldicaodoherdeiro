# PRD: revisão dos textos do jogo

## Objetivo

Dar mais variedade e clareza aos textos de eventos, opções, resultados, seleção de herdeiros e tutorial, preservando o tom sombrio do jogo e todas as suas regras.

## Escopo

O catálogo contém **276 eventos** em `js/events*.js`. A revisão abrange títulos, narrações (`texto`), informações contextuais (`informacoes`), rótulos das opções e resultados, inclusive os desfechos de batalha.

A seleção cobre os seis herdeiros cadastrados em `js/ui.js`, suas características, as dicas de desbloqueio e as instruções de uso dos retratos. O tutorial cobre as seis etapas e os controles exibidos em jogo.

O inventário final, em `INVENTARIO-TEXTOS-EVENTOS.md`, registra título, narração e informação contextual de cada evento. Também lista as ações de seguir os 30 conselhos que receberam texto próprio, além dos textos atuais da seleção e do tutorial.

## Regras editoriais

- Seguir a skill `anti-ai-slop-writing` de `SKILL.md`. A lista `references/banned-words.md` não está disponível neste repositório.
- Preservar fatos, personagens, contexto histórico-fantástico e tom sombrio. Não inventar acontecimentos ou efeitos apresentados como fatos.
- Manter intactos IDs, requisitos, efeitos, flags, estruturas de dados executáveis e placeholders dinâmicos.
- Escrever em português natural e concreto. Remover repetições quando não forem um padrão intencional da interface.
- Fazer cada opção corresponder ao que o jogo realmente aplica.
- Tratar `imagemAlt` como texto acessível e alterá-lo apenas se a imagem ou sua descrição estiver incorreta.

## Execução

### Eventos

Os 276 eventos foram conferidos pelo catálogo carregado pela aplicação. Títulos, narrações e informações contextuais foram revisados; as opções, resultados e ramificações foram comparados com o conteúdo mecânico dos eventos.

As 30 cartas do conselheiro repetiam o mesmo prefixo de título, a mesma informação contextual e o mesmo rótulo para seguir o conselho. Cada uma agora tem um título, uma informação e uma ação de escolha ligados à situação descrita. Os rótulos e resultados de recusa permaneceram compartilhados, pois descrevem a mesma decisão.

A revisão também corrigiu dois resultados interrompidos no meio da frase, a descrição da refeição em `a_noite_dos_lampioes` e o rótulo correspondente. Placeholders como `{{rodada}}` e `{{motivo}}` foram preservados.

### Seleção de herdeiros

O cabeçalho agora explica como revelar as informações no retrato. As descrições de herdeiros informam os atributos iniciais relevantes, as passivas da linhagem e as condições de desbloqueio sem depender de texto permanente sobre os quadrados.

### Tutorial

As seis etapas foram alinhadas ao painel de batalha, ao fluxo de escolha e resultado, aos atributos, à Honra, aos recursos da vila e ao inventário atuais.

## Critérios de aceite

- [x] Os 276 IDs permanecem no catálogo e aparecem no inventário, sem duplicatas.
- [x] Narração e informação contextual estão registradas para os 276 eventos.
- [x] Opções, resultados e consequências revisados correspondem aos efeitos e desfechos existentes.
- [x] A seleção cobre os seis herdeiros, seus traços e as dicas de desbloqueio.
- [x] O tutorial cobre as seis etapas e descreve o fluxo atual.
- [x] IDs, requisitos, efeitos, flags, sorteio e placeholders dinâmicos permanecem intactos.
- [x] A suíte existente e o lint passam; os arquivos alterados passam na checagem de formatação individual.

## Entrega

Arquivos de referência e revisão: `INVENTARIO-TEXTOS-EVENTOS.md` e este PRD. Os textos executados estão em `js/events-conselheiro.js`, `js/events.js`, `js/events-vila.js`, `js/events-heroi.js` e `js/ui.js`.

### Checklist final

- [x] Ler `SKILL.md` e verificar a disponibilidade da lista de termos proibidos; o arquivo referenciado não foi encontrado.
- [x] Revisar os 276 títulos, narrações e informações contextuais.
- [x] Revisar as opções e os desfechos, incluindo as 17 batalhas e suas ramificações.
- [x] Dar textos próprios às 30 ações de conselho e corrigir frases incompletas.
- [x] Atualizar o inventário da seleção, do tutorial e dos eventos.
- [x] Confirmar que dados mecânicos, IDs e placeholders não mudaram.
- [x] Rodar testes, lint e formatação dos arquivos alterados.
- [x] Preparar e registrar o commit final das mudanças.

**Resumo:** revisão textual aplicada ao catálogo de eventos, à seleção de herdeiros e ao tutorial. Nenhuma regra do jogo foi alterada.

**Validações:** 115 testes passam; o lint passa; os arquivos alterados passam no Prettier. A checagem geral de formatação ainda aponta `js/conquistas.js`, `js/events-progresso.js`, `js/save.js` e `tests/heroi-do-povo.test.cjs`, que já estavam fora do padrão e não fazem parte desta revisão. Decisões editoriais pendentes: nenhuma.
