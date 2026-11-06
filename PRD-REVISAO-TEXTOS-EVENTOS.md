# PRD: revisão dos textos dos eventos

## Objetivo

Revisar a redação de todos os eventos do jogo, da seleção de herdeiros e do tutorial com a skill `anti-ai-slop-writing` definida em `SKILL.md`. A revisão deve dar mais voz própria às cenas e à interface, sem alterar regras, efeitos ou a identidade narrativa já estabelecida.

Este PRD prepara a revisão. Não autoriza mudanças nos textos do jogo ainda; o inventário gerado ao lado fica disponível para leitura e ajustes antes da execução.

## Escopo

O catálogo atual reúne **276 eventos** registrados pela aplicação, distribuídos pelos arquivos `js/events*.js`. Na etapa de revisão, considerar todos os textos visíveis ao jogador: título, narração (`texto`), informação contextual (`informacoes`), rótulos das opções, resultados e mensagens de consequências presentes nos dados do evento.

O escopo também inclui os nomes, descrições, dicas de desbloqueio e instruções acessíveis da seleção de herdeiros em `js/ui.js`, além dos títulos, textos e controles das etapas do tutorial no mesmo arquivo. A revisão deve conferir se as descrições dos herdeiros explicam corretamente suas características e se o tutorial corresponde ao fluxo atual da interface.

O arquivo `INVENTARIO-TEXTOS-EVENTOS.md` lista o ID, o nome e o texto narrativo atual dos eventos, e agora inclui seções para seleção de herdeiros e tutorial. Ele serve como base para análise e anotação; não substitui a revisão dos textos de opções e consequências nos arquivos-fonte.

## Regras editoriais

- Ler `SKILL.md` por inteiro antes de redigir ou revisar. Consultar `references/banned-words.md` se esse arquivo estiver disponível.
- Preservar fatos, personagens, contexto histórico-fantástico e o tom sombrio do jogo. Não inventar acontecimentos, falas, números ou detalhes apresentados como fatos.
- Manter intactos IDs, requisitos, efeitos, flags, estruturas de dados, placeholders dinâmicos e qualquer lógica executável.
- Escrever em português natural e concreto. Variar ritmo e estrutura conforme a cena; evitar frases genéricas, repetições e cadências artificiais.
- Fazer as escolhas distinguíveis entre si, com intenção e consequência legíveis. Não prometer um efeito diferente daquele que o jogo realmente aplica.
- Tratar `imagemAlt` como texto acessível, não como prosa narrativa. Alterá-lo apenas se a imagem ou sua descrição estiver incorreta.
- Não forçar gírias, contrações ou detalhes específicos quando destoarem do mundo ficcional.

## Fluxo de trabalho proposto

1. Usar o catálogo carregado pela aplicação para conferir a lista completa e mapear cada evento ao arquivo-fonte. Trabalhar em lotes pequenos, sem deixar eventos únicos ou condicionais de fora; em seguida, mapear a seleção e todas as etapas do tutorial em `js/ui.js`.
2. Para cada evento, comparar narração, informação, opções e resultados; conferir requisitos e efeitos antes de propor mudanças, para que a prosa descreva o comportamento real.
3. Revisar o texto com a skill, preservando placeholders e mantendo a extensão adequada à interface e à cena.
4. Atualizar o inventário com a redação proposta somente depois da revisão. Manter IDs dos eventos e identificadores estáveis para os textos de seleção e tutorial, para que a pessoa responsável possa localizar, aprovar ou editar cada trecho.
5. Depois da aprovação editorial, aplicar os textos aos arquivos-fonte sem alterar a lógica. Rodar os testes do catálogo e a suíte completa; inspecionar o diff em busca de mudanças acidentais em IDs, requisitos, efeitos e flags.

## Critérios de aceite

- Todos os **276 eventos** do catálogo têm correspondência no inventário por ID, sem duplicatas ou ausências.
- A seleção cobre os seis herdeiros cadastrados e suas descrições, dicas de desbloqueio, cabeçalho e instruções de escolha.
- O tutorial cobre todas as etapas e seus controles, sem instruções obsoletas em relação à interface atual.
- Cada texto revisado continua coerente com as opções, resultados e consequências mecânicas do evento.
- Nenhum ID, placeholder, requisito, efeito, flag ou regra de sorteio muda como parte da revisão editorial.
- O inventário final contém ID, nome e descrição narrativa, e permite localizar o evento no código.
- Os testes existentes passam após a aplicação das mudanças aprovadas.

## Entregáveis e estado

- `PRD-REVISAO-TEXTOS-EVENTOS.md`: escopo e procedimento da revisão.
- `INVENTARIO-TEXTOS-EVENTOS.md`: extração do ID, título e texto narrativo atual para análise manual.
- O inventário também inclui os textos da seleção de herdeiros e do tutorial.
- Revisão e aplicação dos novos textos: **pendentes**, aguardando a análise do inventário.

## Checklist e validações

- [x] Ler a skill de escrita e mapear os arquivos que registram eventos.
- [x] Gerar inventário a partir do catálogo runtime, incluindo os 276 eventos.
- [x] Ampliar escopo e inventário para seleção de herdeiros e tutorial.
- [x] Definir escopo, salvaguardas editoriais e critérios de aceite.
- [ ] Análise e ajustes manuais do inventário pela pessoa responsável.
- [ ] Revisão dos textos dos eventos e aprovação antes de editar os arquivos-fonte.
- [ ] Testes funcionais e revisão do diff após aplicar os textos aprovados.

Resultado: o PRD e o inventário de eventos, seleção e tutorial estão prontos para análise. Nenhum texto do jogo foi alterado; a revisão editorial e sua validação permanecem pendentes.
