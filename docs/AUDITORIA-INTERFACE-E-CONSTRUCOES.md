# Conferência da interface e das construções

Data: 11 de novembro de 2026. Base: `2f39e3c`.

Atualização de 12 de novembro: as correções abaixo foram executadas. Consulte o [registro da execução](EXECUCAO-PENDENCIAS-INTERFACE.md) para o estado atual; este documento conserva o diagnóstico anterior. Os JSONs de validação agora registram a conferência após as correções.

O mapa ainda não atende à direção visual do plano. A implementação entrega as regras das obras e permite consultá-las, mas a checklist confundia esses resultados com a conclusão do desenho. O autor confirmou essa diferença durante esta revisão.

Conferi o [plano de sistemas](PLANO-SISTEMAS-E-CONSEQUENCIAS.md), o [plano de revisão visual](PLANO-REVISAO-INTERFACE-E-LEGADO.md), o pedido mestre anexado e os arquivos atuais. Esta etapa altera os registros da auditoria; as correções abaixo continuam pendentes no jogo.

## Construções: o que falta no desenho

| Pedido | Arquivos atuais | Pendência |
| --- | --- | --- |
| Vila ganha caminhos e detalhes conforme as obras surgem | `mapa()` em `js/sistemas-ui.js` desenha sempre os mesmos caminhos e posições; `css/interface.css` usa a mesma imagem de fundo. | Fazer o cenário acompanhar o progresso real das obras. |
| Aparência distingue níveis e mostra danos visíveis | O ícone SVG da construção não muda; barras indicam nível, texto e borda tracejada indicam dano. | Desenhar evolução e deterioração nas próprias construções. Preservar os rótulos acessíveis. |
| Estações deixam marcas no cenário | As classes sazonais mudam tons de fundo. As regras antigas para o ícone perdem as bordas com a regra posterior `.mapa-inspecao .mapa-casa { border: 0; }`. | Mostrar sinais visuais de estação, além do nome e da cor. Neve e folhas são exemplos do plano; não há arte específica aprovada. |
| Acontecimentos deixam detalhes temporários | `v.marcas` produz frases de enfeites ou destroços abaixo da planta. | Representar esses acontecimentos no mapa e retirar os detalhes ao terminar seu prazo. |
| Fundo preto, apresentação compacta, nome e benefício principal; detalhes ao selecionar | O painel interno usa superfícies castanhas e ocupa uma área extensa. Na planta, cada marco mostra nome e estado, mas não o benefício. | Recuperar a apresentação compacta e a base preta do pedido mestre, mantendo os detalhes completos sob seleção. |
| Boa leitura no celular | Em 390 px, nomes usam 11 px e estados usam 8 px; o painel selecionado aparece abaixo da planta. | Aumentar a legibilidade e reduzir o deslocamento entre consulta e ação. |

Selecionar uma obra já abre somente seus detalhes. As 12 construções aparecem, inclusive as não erguidas. O painel informa nível, efeito atual, custo e espera; os testes verificam evolução paga, artesãos, reparo sem Gold, persistência e migração do moinho especializado.

Há dois problemas de informação no painel. Com moinho de nível 2, espera cumprida e zero Gold, o aviso diz “Faltam 10 Gold”, embora “Reunir os artesãos” esteja habilitado. Além disso, uma obra danificada ainda apresenta “Próxima melhoria” antes das ações de reparo. É preciso relacionar cada bloqueio à sua ação e deixar evidente a recuperação necessária.

## Inputs e consultas

A camada `css/interface.css`, carregada depois de `css/style.css`, substitui a cor dos botões e escolhas por `#17140f` e a ação principal por `#d0bc90`. A base anterior usava escolhas em `var(--papel)` e ação principal em `var(--tinta)`. Isso contraria a preservação das cores originais pedida no texto mestre. O avanço da ajuda também voltou a incluir uma seta decorativa.

O bloqueio de recursos continua em um único componente, com motivo escrito, mas a consulta interativa da seção 11 ficou desconectada. `J.sistemasUI.indisponiveis()` gera os informativos; `js/ui.js` chama apenas `opcoesBloqueadas()` e `escolhaDesabilitada()`. No evento `moinho_especializacao`, com zero Gold, o helper gera duas consultas, enquanto a tela apresenta zero consultas e dois botões com `disabled`. Esses botões não abrem explicação por clique e não recebem foco por Tab.

Integrar o informativo deve preservar a regra posterior do pedido mestre: não duplicar escolhas nem expor requisitos narrativos de Honra. O helper atual inclui Honra entre os requisitos públicos; ligá-lo diretamente sem revisar esse filtro reintroduziria uma divergência com a orientação do autor.

O roteiro `scripts/validar-sistemas-browser.cjs` clica no botão desativado e confere que a run não mudou; isso comprova ausência de execução, mas não comprova abertura por clique, hover ou teclado. Sua asserção atual exige que os botões estejam desativados. A aprovação desse roteiro não encerra a pendência do informativo.

Os controles já respondem ao primeiro gesto nos casos percorridos. O roteiro também verifica clique duplo e seleção de herdeiro por toque emulado. Nos filtros da coleção, busca e seleções têm rótulos, fonte de 16 px e altura de 46 px no celular; busca e limpeza funcionaram. Essas verificações não substituem uso em aparelho físico.

## Tutoriais

A ajuda de combate tem quatro etapas com exemplos visuais e botão “?” sem moldura, com área de 44 × 44 px. O navegador confirmou acesso automático, avanço, Escape e retorno do foco sem alterar o turno. A consulta pela ajuda geral também abre e devolve o foco ao botão de origem. Em sessão nova, o primeiro combate contra o Barão abriu a ajuda mesmo com gravação bloqueada; depois de fechá-la, ela não reabriu na mesma sessão.

Ainda cabe reduzir a repetição entre título da janela, nomes das etapas, subtítulo e parágrafo introdutório. A primeira etapa do tutorial geral se chama “Leia antes de escolher”, mas seu texto começa explicando combate, Bruxa e Bufão. As seis etapas gerais não explicam o novo mapa, a espera individual ou as duas formas de trabalho. Esse último ponto é uma lacuna de orientação recomendada pela auditoria; o tutorial obrigatório da seção 12 ensina combate.

O seletor de velocidade tem outra falha confirmada: quando `localStorage.setItem` lança erro, `alternarVelocidadeTexto()` retorna `rapido`, mas `preferenciaTexto()` continua retornando `normal`. Falta preservar a escolha na sessão, como a própria ajuda já faz.

## Outras diferenças de apresentação confirmadas

| Caso determinístico | Resultado atual | Critério pendente |
| --- | --- | --- |
| Derrota com vínculo do cão ativo | A prévia mostra 22 de dano e Vida final 98; a engine aplica 14 e deixa 106 de Vida. | A prévia deve consultar a proteção sem consumir sua carga. |
| Falha contra javalis | O resultado mostra 20 de dano; a perda real é 24, com mais 4 da penalidade da carta. | Informar a perda adicional sem duplicar o dano de combate. |
| Vitória contra o Barão | O resultado registra o Estandarte, mas a tela final não apresenta essa recompensa fora do histórico recolhido. | Distinguir troféu, conteúdo desbloqueado e item recebido na apresentação final. |

A perda temporária limitada pelo mínimo já usa o valor efetivamente aplicado. A renda prevista do moinho comercial também confere com a resolução; esses pontos não devem continuar como falhas.

## Validação e limites

Os 40 testes direcionados de sistemas, construções, integração da interface e controlador passaram. Executei o roteiro existente do Edge e uma conferência adicional: planta em 1440, 768 e 390 px sem rolagem horizontal, obras danificadas e interrompidas, alternativa gratuita, campos e ajuda com armazenamento bloqueado. Nenhuma dessas execuções registrou exceções de JavaScript. Revisei capturas da planta, ajuda, coleção e avisos; isso não aprova a direção visual rejeitada pelo autor.

Os dados estão em [validação da interface](AUDITORIA-INTERFACE-VALIDACAO.json) e [cenários de apresentação](AUDITORIA-PLANO-VALIDACAO.json). Capturas e roteiros adicionais ficam em `.taste-skill/qa/auditoria-atual/`; o roteiro existente salva em `.taste-skill/qa/sistemas/`. Esses diretórios de trabalho estão no `.gitignore`.

Não executei novas simulações aleatórias nem repeti a suíte completa. O plano registra 386 passos da tarefa anterior; esta conferência não amplia aquela simulação. A suíte completa anteriormente registrava 37 falhas, sem aprovação global. Continuam pendentes aparelho físico, zoom, comparação sistemática de cartas curtas e longas, observação prolongada do fundo e dos movimentos, fluxos integrados restantes e balanceamento. As artes dos herdeiros seguem adiadas. A fórmula proporcional anterior de dano continua sem referência localizada.

## Checklist da conferência

- [x] Comparar os pedidos com os arquivos atuais e conferir as regras das obras.
- [x] Executar testes direcionados e conferir interface e campos no navegador.
- [x] Corrigir os estados da checklist e registrar evidências.
- [ ] Entregar o desenho do mapa conforme a direção escolhida e conferir os estados visuais.
- [ ] Corrigir cores, seta decorativa, consulta de requisitos e explicações dos trabalhos; revisar os textos do tutorial.
- [ ] Corrigir prévia de dano, perda adicional, recompensa final e velocidade sem armazenamento.
- [ ] Concluir as verificações manuais e de balanceamento assinaladas.

Resultado: a auditoria separa regras entregues de apresentação incompleta. Os testes direcionados e os roteiros de navegador passaram nos comportamentos que verificam; a entrega visual do mapa permanece aberta, conforme a observação do autor.
