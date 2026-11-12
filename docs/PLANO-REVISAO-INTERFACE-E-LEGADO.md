# Plano: revisão da interface e do encerramento

Atualização de 11 de novembro de 2026: a [auditoria da interface e das construções](AUDITORIA-INTERFACE-E-CONSTRUCOES.md) confere a base `2f39e3c` e registra as pendências atuais. Os bloqueios de captura do Opera e os prints citados abaixo pertencem à revisão de 6 de novembro; o Edge atual já gerou capturas. Isso não conclui automaticamente os critérios ainda abertos deste documento nem aprova o desenho do mapa, que o autor rejeitou como entrega do plano.

## Objetivo

Verificar se as decisões durante a partida são fáceis de acompanhar, se o fim da crônica explica o desfecho e se a linguagem visual permanece clara e coerente.

## Escopo

- **Hierarquia visual durante a partida:** observar a ordem de leitura entre evento, atributos, escolhas e resultado. Conferir também se as mudanças de atributos ficam fáceis de notar sem depender apenas de cores.
- **Telas de fim e legado:** verificar se a causa do encerramento, o registro da crônica e as ações disponíveis depois do fim ficam claros.
- **Movimento do fundo:** avaliar se as animações contínuas combinam com a atmosfera sem disputar atenção com cartas e textos.
- **Cores e sinalização:** conferir se honra e raridade continuam distinguíveis sem depender exclusivamente da cor.
- **Unidade visual:** comparar menus, cartas, inventário, conquistas e telas de fim para identificar diferenças de linguagem visual que pareçam acidentais.
- **Passagem do tempo:** verificar se estações e anos ficam perceptíveis durante a crônica sem depender apenas do texto do cabeçalho.
- **Tipo de evento:** avaliar uma mudança sutil na borda da carta para diferenciar categorias, como batalha, mercador, pacto e evento sazonal, sem competir com o conteúdo.
- **Composição das cartas:** conferir a proporção e o espaçamento entre ilustração, título e texto em cartas curtas e longas.
- **Resumo visual da crônica:** avaliar se uma linha do tempo ou painel de marcos ajuda a recordar acontecimentos importantes na tela final.
- **Conteúdo bloqueado:** verificar se o jogador distingue o que está disponível, o que exige desbloqueio e onde entender os requisitos.
- **Orientação entre telas:** conferir se fica claro se o jogador está na partida, no menu ou em um painel, e como retornar.
- **Legibilidade com zoom:** testar ampliação da página para identificar cortes, sobreposições ou controles difíceis de alcançar.

## Etapas

- [x] Revisar as capturas de partida antes e depois da escolha em PC e celular; a execução interativa completa ainda está pendente.
- [x] Mapear no código os quatro tipos de encerramento e conferir visualmente a derrota; as três telas de vitória ainda não foram enviadas.
- [ ] Observar o movimento do fundo durante leitura e interação, inclusive com redução de movimento ativada.
- [x] Conferir sinais além de cor para Honra e raridade no código e nas telas de jogo; não há uma captura com itens de raridade.
- [x] Comparar partida, resultado, fim e legado em PC e celular; a barra de progresso do legado foi alinhada à paleta.
- [x] Confirmar que estação e ano aparecem legíveis no cabeçalho e implementar marcas visuais para o ciclo.
- [x] Mapear os tipos com metadados existentes e implementar etiqueta e borda por categoria.
- [ ] Comparar a composição de cartas com textos e ilustrações de comprimentos diferentes.
- [x] Reutilizar o histórico da run na tela final, com ordem cronológica e painel recolhível.
- [x] Conferir no código os requisitos e o estado acessível das opções bloqueadas; a confirmação visual segue pendente.
- [x] Conferir nomes de tela e caminhos de retorno nas capturas; não foi enviada a seleção de herdeiro bloqueado.
- [x] Confirmar com o usuário que zoom 150% no celular não impede o uso; o zoom no PC segue pendente.
- [x] Implementar os cinco ajustes aprovados.
- [x] Validar sintaxe de `js/ui.js` e rodar ESLint nesse arquivo.
- [ ] Conferir as mudanças em capturas novas de desktop e celular; Opera GX falhou ao iniciar o processo gráfico.

## Diagnóstico do código (06/11/2026)

### O que já está previsto

- A tela de fim trata derrota, vitória comum, vitória do Culto e vitória por Honra. Mostra o motivo, o último resultado, as mudanças de atributos, rodada alcançada e habitantes restantes; vitórias também mostram recordes. Há ações distintas quando o legado salva ou quando o salvamento falha (`js/ui.js:1434-1467`).
- O combate apresenta Ataque, Defesa e dano previsto antes da escolha; depois, identifica vitória ou falha e informa o dano após o Escudo (`js/ui.js:1250-1265`, `js/ui.js:1371-1372`).
- A raridade aparece por nome junto ao item. Honra usa valor assinado, retratos próprios por faixa e contorno duplo nos extremos, então esses estados têm sinais além da cor (`js/ui.js:736-742`, `css/style.css:321-335`, `css/style.css:437-442`).
- O código do fundo anima duas camadas em ciclos de 20 e 18 segundos. `prefers-reduced-motion: reduce` remove as animações contínuas e oculta a camada de pontos (`css/style.css:23-57`, `css/style.css:773-781`).
- Abaixo de 900 px, a página libera rolagem vertical; os controles de ação da partida têm 44 px e os painéis do legado passam a uma coluna em celular (`css/style.css:553-563`, `css/style.css:727-759`). Opções bloqueadas também incluem requisito legível e `aria-disabled` (`js/ui.js:684-708`).

### Ajustes aprovados e implementados

1. **Fundo:** reduzi o brilho máximo dos pontos animados para eles ficarem menos fortes atrás do texto. A regra de movimento reduzido continua ativa (`css/style.css`).
2. **Progresso do legado:** personalizei trilho e preenchimento da barra em CSS com os tons de grafite e dourado da interface (`css/style.css`).
3. **Leitura e tipo do evento:** movi a coluna da carta para antes das escolhas no HTML, mantendo o posicionamento visual do grid. A carta agora mostra o tipo e usa borda dupla para batalha, tracejada para mercador, pontilhada para pacto e linha interna para evento sazonal. A prioridade é batalha, mercador, pacto e sazonal; outras categorias conhecidas recebem etiqueta textual (`js/ui.js`, `css/style.css`).
4. **Passagem do tempo:** acrescentei quatro marcas com formas diferentes e destaque da estação atual ao lado do nome escrito no cabeçalho (`js/ui.js`, `css/style.css`).
5. **Fim da crônica:** quando o salvamento dá certo, a tela confirma que a crônica entrou no legado. Um painel recolhível exibe os registros existentes da primeira à última escolha (`js/ui.js`, `css/style.css`).

### Verificações visuais ainda necessárias

- O inspetor automatizado falhou com `CDP timeout: Page.enable` no Edge e no Opera GX. Após as mudanças, uma captura headless no Opera GX também terminou com `GPU process isn't usable`; os prints enviados pelo usuário são anteriores à implementação e não servem como validação visual final.
- Na revisão visual de base, a hierarquia de evento, escolhas e resultado estava clara; os deltas após a decisão eram legíveis. As telas de fim mostravam motivo, relato, mudanças de atributos, resumo e ações.
- O usuário confirmou que zoom 150% no celular não atrapalhava as telas de base. O novo indicador de estação ainda precisa ser conferido nesse zoom, assim como a tela atualizada no PC.
- As imagens existentes em `.taste-skill/inspect-atual/` são de 03/11/2026 e não foram usadas. A avaliação visual desta etapa usa os prints atuais enviados pelo usuário.
- Ainda falta ver as alterações implementadas em captura, animação em movimento e com redução de movimento ativada, uma carta de texto longo e a seleção com herdeiros bloqueados.

Os cinco ajustes foram aprovados pelo usuário e implementados. Nenhuma regra de jogo foi alterada. A confirmação visual final depende de novas capturas, pois o Opera GX não gerou imagem.

## Critérios de aceite

- [x] A informação principal da decisão se destaca; evento, escolhas e resultado são legíveis nos prints de PC e celular.
- [x] O jogador vê as mudanças causadas pela escolha e o motivo do fim da crônica nos prints recebidos.
- [ ] A tela de fim deixa evidente o que foi registrado; mensagem e histórico foram implementados, mas a tela atualizada ainda não foi conferida visualmente.
- [ ] A leitura permanece utilizável nas telas estreitas depois das mudanças; o usuário confirmou zoom 150% nas capturas de base.
- [ ] Animações não prejudicam leitura ou interação e respeitam a preferência de movimento reduzido.
- [x] Honra e raridade têm sinais além da cor no código: valor, nome, retrato e forma do contorno.
- [ ] As telas principais compartilham uma linguagem visual consistente; a barra foi alinhada à paleta no CSS, aguardando conferência visual.
- [x] Estação e ano aparecem no cabeçalho, com quatro marcas visuais implementadas para o ciclo.
- [ ] A borda e a etiqueta diferenciam tipos de evento; contraste e sobreposição com a arte aguardam conferência visual.
- [ ] Cartas curtas e longas mantêm composição equilibrada; os prints enviados não cobrem os dois extremos de texto.
- [ ] O histórico recolhível foi implementado na tela final; falta conferir apresentação e leitura.
- [ ] Conteúdos bloqueados se distinguem dos disponíveis e seus requisitos podem ser encontrados; falta a tela de seleção de herdeiro.
- [x] O jogador identifica partida, resultado, fim e legado e encontra ações de retorno nas telas enviadas.
- [ ] O zoom não corta conteúdo essencial nem impede o uso dos controles; 150% foi confirmado nas capturas anteriores às mudanças, e o PC segue pendente.

## Checklist deste plano

- [x] Partida e hierarquia: revisar capturas atuais de jogo antes e depois da escolha em PC e celular.
- [x] Encerramentos: mapear os quatro tipos no código e revisar visualmente a derrota; telas de vitória não enviadas.
- [ ] Movimento do fundo e preferência de movimento reduzido: falta observar na versão atual.
- [x] Sinais de cor: texto de raridade, valores assinados e contornos de Honra foram conferidos no código.
- [x] Unidade visual: partida, resultado, fim e legado usam a mesma base escura e serifada; a barra de progresso recebeu trilho grafite e preenchimento dourado.
- [x] Passagem do tempo: estação e ano estão no cabeçalho; as quatro marcas do ciclo foram implementadas.
- [x] Tipo de evento: etiquetas e bordas implementadas usando batalha, mercador, pacto, estação e tipos conhecidos.
- [ ] Cartas curtas e longas: falta comparar em imagem.
- [x] Resumo da crônica: confirmação de salvamento e histórico recolhível implementados na tela final.
- [x] Conteúdo bloqueado: requisitos e `aria-disabled` conferidos no código; falta a captura da seleção de herdeiro.
- [x] Orientação: partida, resultado, fim e legado identificáveis; retornos visíveis nos prints.
- [x] Zoom no celular: usuário confirmou que 150% não interfere nas telas de base; conferência das mudanças segue pendente.
- [x] Ajustes aprovados e implementados.
- [x] Validação estática: `node --check js/ui.js` e `npx eslint js/ui.js` passaram.
- [ ] Validar visualmente em desktop, celular e tela final; a captura pelo Opera falhou no processo gráfico.

**Resumo:** os cinco ajustes aprovados foram implementados: pontos de fundo menos fortes, barra do legado dourada, ordem semântica da carta antes das escolhas, categoria e estação sinalizadas por formas/etiquetas e confirmação com histórico recolhível no encerramento.

**Validações:** `node --check js/ui.js` e `npx eslint js/ui.js` passaram; a suíte de testes não foi executada. O Opera GX falhou ao criar o processo gráfico, por isso não obtive capturas após as mudanças. Os prints de base enviados pelo usuário confirmam zoom 150% no celular; faltam capturas atualizadas de PC e celular, movimento reduzido, seleção de herdeiros bloqueados e comparação de textos curtos/longos.
