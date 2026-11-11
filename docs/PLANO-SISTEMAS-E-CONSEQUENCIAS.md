# Plano de melhorias dos sistemas e das consequências

Data: 8 de novembro de 2026.

Estado: sistemas e expansão das construções implementados, com conferência automatizada. A checklist ao fim separa as entregas das verificações de equilíbrio e uso em aparelho físico ainda pendentes.

## 1. Objetivo e escopo

Melhorar a continuidade das histórias e fazer as decisões refletirem a situação da vila. Construções, companheiros e vitórias contra chefes devem oferecer consequências próprias, com explicações suficientes para o jogador entender seus efeitos.

O escopo original reúne os sete pontos escolhidos pelo autor:

| Frente | Resultado esperado |
| --- | --- |
| Intervalo das cadeias | Continuações retornam em uma janela adequada à história. |
| Origem dos bônus | O jogador consegue consultar a composição dos atributos e das proteções. |
| Situação da vila | População, Gold e obras abrem soluções diferentes em eventos existentes. |
| Estações | O calendário altera oportunidades e respostas em cartas selecionadas. |
| Chefes | Vitórias mudam encontros e concedem lendários ligados ao chefe derrotado. |
| Especialização de construção | Uma obra recebe uma escolha definitiva de função naquela crônica. |
| Vínculo com companheiro | Um encontro próprio fortalece a relação com um animal permanente. |

As aprovações posteriores acrescentam melhorias no mercador, na leitura dos resultados e na interação com os painéis, além de um tutorial próprio de combate. As seções 10 a 12 registram esses acréscimos; sugestões da conversa que não receberam aprovação não fazem parte desta entrega. Em 11 de novembro de 2026, o autor selecionou a explicação das alternativas indisponíveis e depois pediu a execução do plano de sistemas e construções. Essa execução inclui a expansão da seção 16, com os valores adotados registrados abaixo.

As regras abaixo formam a proposta de implementação. Os exemplos de recompensas e os valores experimentais ainda precisam de balanceamento; a escolha desses exemplos como base não define seus números finais.

## 2. Base existente e limites

O projeto já possui requisitos compartilhados, flags de run e legado, marcos de rodada, consequências agendadas, inventário e efeitos temporários. A engine também trata posturas de combate, reduções de dano, memória de cartas e eventos obrigatórios.

O sorteio atual tem várias prioridades: cura crítica, consequências agendadas e encontros próprios de condições ou presságios, entre outras. A implementação das cadeias precisa mapear essa ordem antes de inserir outra prioridade. Atualmente, as consequências agendadas podem retornar antes dos filtros comuns do sorteio; não basta aumentar o peso de uma carta para controlar todos os casos.

| Limite de escopo | Aplicação |
| --- | --- |
| Recursos | Usar os atributos existentes; não criar barras de vínculo, reputação ou manutenção. |
| Interface | Aproveitar inventário, detalhes de combate, construções e histórico. |
| Progressão | No escopo original, especialização e vínculo têm uma decisão própria, sem níveis sucessivos. A expansão futura das construções está registrada separadamente na seção 16. |
| Persistência | Recarregar preserva escolhas e prazos, sem conceder efeitos novamente. |
| Legado | Separar conteúdo desbloqueado de item efetivamente obtido na crônica. |
| Artes | Este plano não cria nem avalia ilustrações. Uma etapa futura de arte deve consultar a memória visual do projeto. |

## 3. Ritmo das cadeias

### Regras propostas

Classificar cada continuação como comum, rara ou obrigatória. A categoria define o tratamento do prazo; cadeias com regras próprias, como a perseguição da Entidade, conservam seus intervalos até uma revisão específica.

Para a primeira entrega, selecionar quatro cadeias comuns e registrar a rodada em que cada próxima etapa ficou disponível. Experimentar uma janela de 6 a 12 rodadas: antes da abertura, a etapa aguarda; dentro da janela, sua prioridade cresce; depois do limite, ela assume prioridade entre as continuações comuns elegíveis.

O limite expressa uma preferência de ritmo. Eventos urgentes podem adiar a continuação; se isso acontecer, ela mantém sua posição na fila. Entre etapas equivalentes, atender a que aguarda há mais tempo e evitar continuações comuns em rodadas consecutivas.

Cada cadeia deve declarar o que acontece quando perde um requisito: suspender a espera, encerrar a história ou apresentar uma conclusão alternativa. Não forçar uma etapa incompatível com o estado atual nem acumular várias entradas para o mesmo próximo evento.

### Trabalho previsto

1. Inventariar gatilhos, intervalos existentes e condições de encerramento das quatro cadeias escolhidas.
2. Definir os metadados de janela e a ordem de prioridade em relação aos eventos já programados.
3. Persistir a espera e remover registros ao resolver ou encerrar uma etapa.
4. Aplicar o piloto e medir intervalos reais, incluindo adiamentos por eventos urgentes.

**Aceite:** nenhuma continuação duplica após carregar; etapas inválidas seguem a política da própria cadeia; o piloto evita esperas indefinidas quando a etapa permanece elegível e não há bloqueio prioritário. Continuações de combate respeitam o intervalo aplicável às batalhas; confrontos obrigatórios preservam suas regras explícitas.

## 4. Origem dos bônus

Criar uma leitura compartilhada das fontes de atributos e modificadores. A interface deve consultar os mesmos valores e a mesma ordem de cálculo usados pela resolução, para que a explicação acompanhe o resultado.

Alguns equipamentos já somam seu benefício diretamente ao atributo. Antes de mostrar uma decomposição completa, verificar quais fontes o estado atual permite reconstruir com segurança. Se um save antigo não registrar a origem de um ganho permanente, exibir a parcela como valor permanente acumulado, sem inventar uma origem.

| Informação | Local proposto |
| --- | --- |
| Valor permanente e fontes conhecidas | Consulta ao atributo, acessível por clique, toque e teclado. |
| Bônus temporário e duração | Detalhe do atributo e registro do efeito no inventário quando aplicável. |
| Preparação de uso único | Detalhes anteriores à batalha, com indicação de quando será consumida. |
| Postura, margem e mitigação | Painel de combate, na ordem efetiva de aplicação. |
| Renda e cura passiva | Detalhes dos recursos e construções, aproveitando as previsões existentes. |

Começar por Ataque e dano recebido, que concentram várias interações. Depois cobrir Escudo, Vida máxima e efeitos recorrentes. Exibir modificadores negativos junto aos positivos.

**Aceite:** os totais conferem com a engine; itens permanentes não entram duas vezes; expiração e consumo atualizam a explicação. O jogador acessa os detalhes no celular sem depender de passar o mouse, enquanto a tela principal conserva os valores resumidos.

## 5. Escolhas conforme a situação da vila

A primeira revisão deve abranger oito cartas existentes, selecionadas por variedade de situações e frequência. Usar Habitantes para representar disponibilidade de pessoas, Gold para custeio e construções para soluções específicas.

Exemplos de aplicação: uma vila populosa organiza um mutirão, enquanto outra com poucos moradores contrata ajuda ou negocia um acordo. A narrativa explica por que a resposta aparece. Soluções coletivas podem custar Gold ou expor moradores ao risco; uma população alta não transforma toda alternativa em recompensa gratuita.

Definir as faixas de população depois de levantar os valores encontrados nas partidas. Reaproveitar requisitos disponíveis e manter o limite de quatro respostas visíveis, substituindo variantes incompatíveis em vez de somá-las indefinidamente.

Para cada carta, registrar a situação que muda, as opções afetadas, os custos e a saída disponível em crise. O conjunto deve incluir oportunidades para vilas pequenas e recuperação após perdas, para reduzir o risco de uma espiral sem saída.

**Aceite:** todas as combinações previstas conservam ao menos uma resposta utilizável; limites de população e Gold funcionam nas fronteiras; a descrição justifica as variantes e carregar mantém sua coerência.

## 6. Estações nas decisões

Revisar um lote de oito cartas, com duas por estação. O lote pode compartilhar cartas com a revisão da vila, desde que a combinação não ultrapasse o limite de respostas nem torne os requisitos difíceis de entender.

| Estação | Relação a experimentar | Consequência na escolha |
| --- | --- | --- |
| Primavera | Chuvas e ponte | Abrir uma travessia ou uma rota de abastecimento. |
| Verão | Calor e cisterna | Reduzir o custo de acolher viajantes ou atender moradores. |
| Outono | Colheita e moinho | Escolher entre benefício comunitário e venda da produção. |
| Inverno | Frio e celeiro | Oferecer uma resposta que preserve moradores. |

Consultar a estação calculada pelo jogo, incluindo o tratamento do Druida. Não criar uma contagem paralela de calendário. Os efeitos acontecem nas cartas selecionadas, sem acrescentar cobranças sazonais recorrentes.

**Aceite:** as variantes usam a estação correta, inclusive nas mudanças de ano; uma carta aberta mantém regras coerentes ao carregar; a falta de uma construção não impede a continuidade da partida. Testar também os encontros que não avançam a rodada.

## 7. Chefes: consequências e lendários

Cada vitória deve registrar sua marca uma única vez, apresentar a recompensa e explicar o que muda. Para chefes que permitem continuar, a consequência pode aparecer na própria crônica. Quando a luta encerra a partida, o resultado deve aparecer no fim e abrir conteúdo compatível nas gerações seguintes.

| Chefe | Consequência narrativa proposta | Função a explorar para o lendário |
| --- | --- | --- |
| Barão | Alterar encontros futuros sobre cobranças e soldados em crônicas que reconheçam sua derrota. | Estandarte com proteção coletiva ou resposta própria contra exigências militares. |
| Líder do culto | Acrescentar reações dos moradores à remoção das cartas futuras do culto já prevista no jogo. | Relíquia que evita uma cobrança ou sacrifício bem definido. |
| Entidade | Encerrar a perseguição e fazer encontros posteriores reconhecerem a recusa do herdeiro. | Selo que abre uma recusa especial em situações sobrenaturais selecionadas. |
| Senhor sob a lagoa | Registrar a vitória e alterar histórias futuras relacionadas à lagoa. | Arma ou relíquia abissal com benefício forte e custo explícito. |

### Entrega das recompensas

Para o líder do culto e a Entidade, propor a entrega do lendário ao fim da luta, mantendo os efeitos e recompensas existentes. Conferir nomes e IDs do inventário antes de criar itens, especialmente o Selo da Recusa já associado à Entidade na documentação.

Para Barão e chefe abissal, a proposta é registrar o troféu no encerramento e desbloquear um encontro de obtenção em outra crônica. O personagem seguinte não começa automaticamente com o item. A fotografia de legado feita no início da run continua definindo o conteúdo disponível nela.

**Decisão em aberto:** confirmar esse modelo para as vitórias que encerram a crônica. Também falta decidir se seus encontros de obtenção terão garantia de aparição ou entrarão no sorteio com uma janela própria.

Definir efeitos e custos dos quatro lendários antes de programá-los. Evitar benefícios que eliminem qualquer confronto ou permitam ignorar todas as consequências sobrenaturais; cada item precisa declarar seu alcance e seu consumo, quando houver.

**Aceite:** recompensas e marcas não duplicam ao carregar ou tentar salvar novamente; a tela final distingue troféu, desbloqueio e item recebido. Alterações futuras respeitam o legado, e a vitória contra o líder preserva a regra atual sobre efeitos do culto já ativos.

## 8. Especialização de construção

O piloto usa o moinho. Após sua construção e um período de uso, uma carta oferece a escolha entre função comunitária e comercial. Ambas preservam o benefício original da obra e acrescentam uma função distinta; custos e valores ficam para a especificação do lote.

| Especialização | Direção do benefício | Resposta própria em eventos |
| --- | --- | --- |
| Moinho comunitário | Apoio à recuperação ou aos moradores. | Distribuir farinha durante uma dificuldade da vila. |
| Moinho comercial | Oportunidade de renda. | Negociar produção em uma carta de comércio ou colheita. |

A proposta inicial permite uma construção especializada por crônica. A escolha é definitiva e fica visível no painel da obra. Recusar preserva o moinho original e encerra a oferta naquela partida.

Antes de definir o prazo da oferta, verificar se o jogador costuma construir o moinho cedo o bastante para aproveitar a especialização. Usar o sistema de cadeias para apresentar o encontro, sem criar outro agendador.

**Aceite:** o efeito original permanece; apenas uma variante funciona por vez; salvar e carregar preserva escolha e benefício sem reaplicação. O jogador entende custo e função antes de decidir, e a recusa impede novas ofertas naquela crônica.

## 9. Vínculo com companheiro

Planejar um encontro de vínculo para cão, corvo e gato permanentes. Começar a implementação pelo cão para verificar a integração com o combate; depois ampliar ao restante do lote.

Contar a espera a partir da obtenção do companheiro e usar as janelas das cadeias. O encontro permite fortalecer o vínculo ou recusá-lo, mantendo o animal e encerrando a oferta naquela crônica. Cada companheiro pode receber uma única evolução, sem experiência ou manutenção periódica.

| Companheiro | Direção proposta |
| --- | --- |
| Cão | Uma intervenção de proteção com condição de ativação explícita. |
| Corvo | Uma resposta própria ligada a informação ou achados. |
| Gato | Uma ajuda relacionada a doença ou recuperação. |

Esses efeitos ainda precisam de especificação. Registrar no inventário o vínculo e qualquer carga de uso único. A primeira entrega considera apenas os companheiros permanentes: as passivas temporárias do Druida não abrem encontros de vínculo, mas suas combinações com os animais permanentes precisam de conferência.

**Aceite:** o encontro exige posse atual do animal; o vínculo não repete nem duplica efeitos; recusar mantém sua habilidade original. Saves antigos que não registram a rodada de obtenção recebem uma regra de espera conservadora, definida na migração.

## 10. Mercador e apresentação do progresso

### Mercador atento à partida

Ajustar o sorteio do item utilitário conforme o estado atual do herdeiro, preservando variedade e a oferta regular existente. Vida baixa pode favorecer recuperação; necessidades de combate podem favorecer proteção. Os critérios e pesos ainda precisam de definição para evitar uma oferta sempre ideal.

Resolver a oferta uma única vez ao abrir a visita e salvá-la. Recarregar, usar um item ou alterar um atributo com a carta aberta não deve sortear novos produtos. Manter preços, pagamento e encerramento da visita conforme as regras atuais, salvo revisão explícita posterior.

A vitrine deve distinguir melhorias aplicadas imediatamente de itens guardados na mochila. Cada produto informa preço, efeito e destino da compra. Uma observação contextual pode explicar uma oferta favorecida pela situação do herdeiro, desde que corresponda ao critério realmente usado.

**Aceite:** a ponderação altera oportunidades sem garantir produtos; a oferta permanece igual ao carregar; a vitrine explica o destino do item e o saldo insuficiente. Conferir os efeitos das compras antes da renda, conforme a economia existente.

### Resultados, presságios e encerramentos

| Aprovação | Comportamento planejado | Critério de aceite |
| --- | --- | --- |
| Consequência principal em destaque | Dar prioridade ao efeito decisivo da escolha, com as demais mudanças logo abaixo. | A apresentação preserva todas as alterações relevantes, inclusive custos e perdas; a prioridade segue uma regra consistente, a definir no lote. |
| Progresso legível dos presságios | Separar prazo, progresso e condição atual no indicador existente. Acumulações mostram quanto falta; proibições indicam se ainda foram respeitadas. | Cada tipo usa sua regra real. Recuperar um atributo não apaga uma violação que o sistema considera definitiva. |
| Encerramento próprio de cada rota | Diferenciar título e apresentação das rotas de vitória, conservando a posição dos dados e das ações seguintes. | Cada tipo de fim mostra causa e rota corretas, além do estado real do salvamento e do legado. |

Esses encerramentos devem se integrar às recompensas dos chefes da seção 7. Uma animação ou troca de tela não pode antecipar a confirmação de que o legado salvou.

## 11. Leitura das cartas e interação

### Informação durante a escolha

| Melhoria aprovada | Regra de apresentação |
| --- | --- |
| Sinais discretos de ação | Acompanhar respostas de combate, comércio ou uso de item com símbolos pequenos e rótulos acessíveis. Os símbolos identificam ações, sem revelar consequências ocultas. |
| Requisitos mostrando quanto falta | Nas condições que o jogo já revela, informar a diferença até o requisito, como “Faltam 3 Gold”. Requisitos de construção usam seu nome; condições alternativas devem explicar uma saída válida sem sugerir que todas são obrigatórias. |
| Explicação das alternativas indisponíveis | Oferecer um informativo por clique ou ao passar o mouse sobre a alternativa indisponível, explicando o requisito que falta. Permitir consulta por toque e teclado; abrir a informação não executa a escolha nem avança a rodada. Explicar somente condições que o jogo pode revelar, sem expor consequências secretas. |
| Velocidade dos textos | Oferecer revelação gradual e texto imediato, salvando a preferência. Durante a escrita, o primeiro toque revela o restante; esse mesmo gesto não escolhe uma resposta. |
| Presença dos companheiros | Colocar um marcador consultável próximo ao retrato, com habilidade e estado do vínculo. Distinguir companheiros permanentes das passivas temporárias do Druida e prever mais de um animal. |

**Aceite:** símbolos e requisitos continuam compreensíveis por toque e teclado; o modo de texto imediato não cria esperas artificiais; indicadores de companheiros respeitam o espaço do retrato e mostram apenas habilidades realmente ativas.

### Transições e efeitos

A passagem de estação recebe uma apresentação curta, com frase contextual e mudança discreta de ambiente. Usar o calendário existente e mostrar a transição uma única vez por passagem efetiva, inclusive ao carregar. Encontros que não avançam a rodada não repetem a apresentação. O jogador pode seguir sem esperar pela animação.

Quando uma proteção ou efeito consumir uma carga, apresentar uma reação breve e identificar a fonte no resultado. Redesenhar a tela ou carregar a partida não consome outra carga nem repete uma intervenção como se fosse nova. A reação precisa acompanhar a resolução já concluída.

**Aceite:** movimento reduzido preserva a informação em texto; transições não encobrem respostas; todos os sinais visuais refletem efeitos efetivamente aplicados.

### Controles e retorno aos painéis

| Melhoria aprovada | Comportamento e verificação |
| --- | --- |
| Impedir cliques entre telas | Um gesto que avança ou fecha uma tela não aciona controles recém-exibidos. Cobrir clique duplo, toque e repetição de teclado, sem impor uma espera longa a cada decisão. |
| Preservar a posição do inventário | Ao fechar e reabrir na mesma crônica, restaurar a posição da lista e, quando possível, o item consultado. Se a lista mudar, usar uma posição válida; uma nova crônica começa com estado de consulta próprio. |
| Fechar painéis com Escape | Fechar o painel superior e devolver o foco ao elemento que o abriu. Não usar Escape para abandonar uma luta, aceitar uma escolha ou descartar uma decisão obrigatória. Manter botão de fechar acessível no celular. |

Não acrescentar filtros de inventário ou outras sugestões ainda não aprovadas como dependência dessas melhorias.

## 12. Combate: leitura e tutorial

### Apresentação da disputa

Explicar quem vence o empate no próprio painel de disputa, usando a regra da modalidade atual. Combates, duelos e testes não devem receber uma explicação genérica que contradiga sua resolução.

Separar a apresentação da rolagem e do vencedor da apresentação do dano. A sequência visual consulta um único resultado calculado pela engine: avançar, pular uma animação ou recarregar não rola novamente nem reaplica dano. No modo imediato ou com movimento reduzido, manter os dois resultados visualmente distintos sem exigir espera.

Durante chefes, conservar a última troca de golpes visível junto à Vida do adversário até a próxima resolução. Identificar quem recebeu dano ou qual proteção impediu o golpe. O texto deve acompanhar o progresso salvo do confronto, mesmo depois de carregar.

**Aceite:** os empates seguem a regra real; a separação visual não modifica o resultado; a última troca continua legível entre turnos e após recarga.

### Primeira abertura e consulta pelo “?”

O tutorial deve abrir automaticamente na primeira entrada do jogador em um combate, antes da primeira rolagem. O gatilho é a entrada no painel de combate, inclusive se a primeira luta for contra um chefe; uma carta que apenas oferece combater ainda não dispara a explicação.

Manter um botão “?” visível junto ao painel durante os combates comuns e contra chefes, inclusive na apresentação do resultado. Seu nome acessível deve explicar a ação, como “Ajuda de combate”, e permitir abertura por toque ou teclado. O acesso por “Como jogar” complementa esse botão.

Registrar separadamente a preferência de apresentação automática do tutorial geral. Concluir ou pular a ajuda registra que a primeira apresentação ocorreu e impede abertura automática nas próximas crônicas naquele navegador. Se o armazenamento falhar, manter essa informação em memória durante a sessão. Saves anteriores recebem o registro na primeira entrada em combate após a atualização, sem inferir que já conhecem as regras.

### Conteúdo e comportamento

| Etapa de ensino | Conteúdo |
| --- | --- |
| Disputa | Dados do herdeiro e do inimigo, bônus e regra de empate aplicável. |
| Preparação | Posturas e efeitos sobre Ataque e dano recebido. |
| Resultado | Vencedor, margem quando aplicável, dano e ordem das reduções. |
| Recursos e chefes | Itens, rerrolagens e consumo; Vida própria e continuidade dos turnos nos chefes. |

Relacionar cada explicação ao elemento correspondente da interface. Mostrar a etapa de chefes quando aplicável e permitir sua consulta posterior. O jogador pode pular ou rever etapas; botões de avançar no tutorial apenas mudam a explicação.

Enquanto a ajuda estiver aberta, preservar o turno e impedir ações de combate por clique ou atalho. Abrir, avançar, fechar ou pular não consome itens, não rola dados, não aplica dano e não avança a rodada. Ao fechar, restaurar o foco no botão de ajuda ou no controle de origem disponível. Se o tutorial abrir pela primeira vez automaticamente, devolver o foco ao controle inicial do combate.

**Aceite:** a ajuda abre no primeiro combate e deixa de abrir automaticamente após conclusão ou salto; o “?” permanece disponível nos combates seguintes. Conferir também armazenamento bloqueado, recarga durante a ajuda, primeiro combate contra chefe e fechamento por Escape. Nenhum desses caminhos altera o turno ou consome recursos.

## 13. Organização da implementação

| Etapa | Entrega | Dependência para avançar |
| --- | --- | --- |
| A. Especificação dos lotes | Seleção das cartas, inventário das cadeias, definição dos efeitos, critérios do mercador e decisões sobre lendários. | Regras de cada lote fechadas antes de programá-lo. |
| B. Ritmo e persistência | Piloto das quatro cadeias e migração do estado necessário. | Prioridades e retomada de save verificadas. |
| C. Explicação dos efeitos | Consulta de fontes, consequência principal e progresso dos presságios. | Totais e indicadores iguais aos da resolução. |
| D. Vila e calendário | Revisão das oito cartas de vila e oito sazonais, com sobreposição possível. | Saídas de crise e fronteiras dos requisitos verificadas. |
| E. Chefes | Consequências, lendários e obtenção futura quando aplicável. | Modelo de recompensa definido e encerramento recuperável preservado. |
| F. Construção e companheiros | Moinho especializado e vínculos, começando pelo cão. | Agendamento e leitura dos bônus prontos. |
| G. Mercador | Oferta contextual e vitrine com destino das compras. | Ponderação definida e oferta salva sem novo sorteio ao carregar. |
| H. Interação e leitura | Sinais de ação, requisitos, texto configurável, transições e controles de painéis. | Gestos não atravessam telas e preferências permanecem disponíveis. |
| I. Combate e ensino | Empates, rolagem separada do dano, última troca dos chefes e tutorial com “?”. | Ajuda e apresentação preservam a resolução e o turno salvo. |
| J. Conferência integrada | Partidas e ajustes dos valores experimentais, incluindo presença dos companheiros e apresentação das rotas finais. | Critérios de aceite dos lotes atendidos. |

Arquivos prováveis: `js/engine.js` concentra seleção e resolução; `js/state.js` e `js/save.js` recebem estado e migração quando necessários. `js/ui.js` e `css/style.css` apresentam os detalhes. Os catálogos de eventos, `js/items.js`, `js/legacy.js` e `js/conquistas.js` recebem apenas o conteúdo correspondente a cada lote. Confirmar o ponto de alteração ao iniciar cada etapa, pois o repositório contém trabalho em andamento.

## 14. Verificações e riscos

| Risco | Verificação prevista |
| --- | --- |
| Continuações ocuparem quase todo o baralho | Medir intervalo entre etapas e proporção de cartas independentes. |
| Explicação divergir do cálculo | Comparar a decomposição com resultados de combate e efeitos conhecidos. |
| Vila pequena perder todas as alternativas | Exercitar valores abaixo, no limite e acima de cada requisito. |
| Variantes sazonais multiplicarem respostas | Conferir combinações de estação, obra e população. |
| Lendário desaparecer no encerramento ou duplicar | Testar recompensa, falha de gravação, nova tentativa e obtenção futura. |
| Especialização ou vínculo acumularem efeitos indevidos | Conferir migração, recarga e combinações com efeitos temporários. |
| Oferta contextual mudar ao carregar | Comparar produtos salvos antes e depois da recarga, inclusive após uso de item na visita. |
| Animação repetir efeito ou deixar clicar na próxima tela | Exercitar clique duplo, toque e atalhos durante transições, rolagem e consumo de proteção. |
| Tutorial interferir na luta | Abrir, pular e fechar a ajuda antes e depois de rolar, verificando recursos e turno. |
| Painéis perderem posição ou foco | Reabrir inventário e encerrar consultas com Escape no computador e no celular com teclado. |

Os testes automatizados devem cobrir comportamento e persistência, sobretudo filas, fronteiras de requisitos e concessões únicas. Executar as verificações de JavaScript e formatação adequadas aos arquivos alterados, além da suíte necessária para avaliar regressões.

Nas simulações repetidas, somar todos os cenários e rodadas de verificação em um único controle, com máximo de 500 repetições para esta tarefa. Priorizar cenários determinísticos para regras de fronteira e reservar as simulações para o ritmo do sorteio e o equilíbrio. Não ampliar o total em uma nova rodada de ajustes.

A conferência manual deve percorrer uma cadeia do piloto, consultar bônus no computador e no celular, atravessar uma mudança de estação e verificar uma recompensa de chefe. Também deve concluir uma especialização e um vínculo, incluindo recarga após a decisão. Conferir a vitrine contextual, indicadores de presságios e as rotas de encerramento, além de velocidade dos textos e movimento reduzido.

Reservar cenários de interação para cliques repetidos nas transições, posição do inventário e fechamento por Escape. No combate, verificar a primeira abertura automática, a consulta pelo “?” em uma luta posterior e a separação entre rolagem e dano, incluindo uma luta de chefe retomada do save. Todas essas verificações práticas continuam pendentes.

## 15. Decisões em aberto

| Decisão | Recomendação inicial | Momento de definição |
| --- | --- | --- |
| Cadeias e cartas do piloto | Escolher conteúdo frequente e histórias com continuidade já existente. | Antes da etapa B. |
| Janelas e conflitos de prioridade | Experimentar 6 a 12 rodadas nas cadeias comuns, preservando urgências. | Na especificação do agendamento. |
| Faixas da vila e valores sazonais | Usar dados de partidas e testar fronteiras. | Antes da etapa D. |
| Lendários após finais imediatos | Desbloquear encontro de obtenção em outra crônica. | Antes da etapa E. |
| Nomes, efeitos e custos dos lendários | Função ligada ao chefe, com limites explícitos. | Antes de criar os itens. |
| Especialização | Moinho como piloto e uma obra especializada por crônica. | Antes da etapa F. |
| Vínculo e espera em saves antigos | Um encontro por animal; começar pelo cão e adotar espera conservadora na migração. | Antes da etapa F. |
| Critérios da oferta contextual | Favorecer necessidades sem garantir o melhor item; preservar os produtos regulares. | Antes da etapa G. |
| Consequência principal do resultado | Definir precedência entre encerramento, evento narrativo importante e alterações de recursos. | Antes da etapa C. |
| Apresentação das transições e velocidades | Definir durações curtas e opções de texto, com apresentação imediata disponível. | Antes da etapa H. |

O primeiro combate como gatilho e o botão “?” permanente nas lutas são requisitos definidos pelo autor, sem decisão pendente sobre sua inclusão. As escolhas de efeitos dos itens e de apresentação ainda abertas não impedem a especificação dos demais lotes.

## 16. Mapa e evolução das construções

Esta seção reúne as escolhas do brainstorm cuja execução o autor pediu em 11 de novembro de 2026. As demais ideias apresentadas na conversa continuam fora do escopo.

### Direção escolhida

O jogador consulta as construções em uma interface apresentada como um mapa da vila. Todas as construções possíveis aparecem, inclusive as bloqueadas; as liberadas recebem destaque. O mapa mostra a vila ganhando caminhos e detalhes conforme as obras surgem; mudanças visuais por estação também fazem parte da direção desejada, com execução de arte a definir.

As estações deixam marcas no mapa, como neve nos telhados ou folhas no chão. Acontecimentos também podem acrescentar detalhes temporários, como enfeites após uma celebração ou destroços após uma crise. Os exemplos ilustram a ideia; os eventos que deixam marcas e a duração de cada uma ainda precisam de definição.

Ao selecionar uma obra, o painel mostra seu estado, bônus atual e próxima melhoria: benefício, custo e rodadas restantes quando aplicáveis. As opções indisponíveis explicam os requisitos que podem ser revelados, conforme a seção 11, por clique ou hover e com acesso por toque e teclado. A aparência distingue os níveis e mostra danos visíveis, como marcas de fogo ou partes quebradas.

Cada construção tem três níveis, contando a construção inicial. Depois de um intervalo em rodadas, o jogador pode melhorá-la gastando Gold ou liberar um evento ou cadeia que produza sua evolução. Os eventos e continuações de evolução não consomem dias. Os benefícios devem dar identidade às obras: além de aumentar valores, uma melhoria pode abrir uma resposta em um evento. O funcionamento exato de cada obra, seus valores e a forma de liberação continuam em aberto.

No último nível, algumas construções oferecem caminhos diferentes por meio de uma escolha definitiva. Por exemplo, uma ponte poderia favorecer comércio ou segurança; as construções contempladas e os efeitos de cada caminho ainda serão definidos.

Eventos e batalhas malsucedidas podem danificar construções. Conforme o acontecimento, o dano reduz o bônus ou o interrompe por completo; o mapa e o painel devem mostrar o estado e o efeito atual. A reparação precisa ter ao menos uma alternativa para uma vila sem Gold, como uma escolha em evento, a ser especificada. O custo, as consequências e a frequência de danos ainda serão definidos.

### Integração e decisões pendentes

O moinho já possui especialização comunitária ou comercial neste plano. Antes de implementar níveis, decidir como preservar essa escolha e evitar concessões duplicadas, inclusive em saves existentes. Também conferir as construções e efeitos reais no código: há efeitos em renda, desconto e combate, entre outros, que precisam respeitar o estado de dano.

As regras adotadas abaixo fecham as decisões de funcionamento desta entrega. A revisão visual apresenta uma planta da vila com caminhos e ícones próprios em SVG, usando a arte existente da vila ao fundo. Selecionar um marco abre o painel daquela construção; no celular, os detalhes ficam abaixo da planta. Os estados escritos e os sinais de estação complementam a aparência. Os exemplos anteriores servem de direção, e os valores continuam sujeitos à avaliação em partidas completas.

### Regras adotadas em 11 de novembro

Cada obra tem nível 1, 2 ou 3. O intervalo de melhoria é individual: seis dias desde a construção ou a última melhoria/reparação. Saves anteriores entram no nível 1 e começam essa espera quando a obra passa a ter registro. Um moinho já especializado mantém a escolha e a passiva, sem ganhar níveis ao carregar; sua melhoria final conserva o mesmo caminho.

O nível 2 custa 6 Gold e o nível 3 custa 10. Como alternativa, reunir os artesãos abre uma cena no próprio painel; após três dias comuns, o jogador conclui a obra no mapa, sem Gold. Iniciar e concluir essas cenas, comprar melhorias, consultar ou reparar não avançam o dia e não geram renda. Cartas extras do Leste, combate e resultados permitem consulta, mas bloqueiam os trabalhos. A construção inicial permanece nos eventos existentes, com suas regras de tempo e pagamento.

| Obra | Benefício adicional por nível acima do primeiro |
| --- | --- |
| Ponte | +1 Gold a cada 3 dias com ao menos 20 habitantes. |
| Moinho | +1 Vida por dia. A especialização soma sua passiva uma única vez. |
| Capela | +1 Vida por dia; o Escudo concedido na construção permanece como ganho permanente. |
| Forja | Mais 1 Gold de desconto na arma melhorada. |
| Muralha e torre de vigia | Evitam mais 1 de dano de combate. |
| Mercado coberto | +1 Gold a cada 5 dias. |
| Cisterna comunitária | +1 Habitante a cada 3 dias do calendário. |
| Entreposto comercial | +1 Gold a cada 2 dias do calendário. |
| Enfermaria da ervateira | +1 Vida por dia enquanto a Vida estiver abaixo de 60. |
| Praça da Forca | +1 Gold a cada 6 dias. |
| Celeiro | Evita 1 de dano de combate; conserva a proteção original contra perdas de habitantes. |

No nível 3, a ponte escolhe comércio (+1 Gold a cada 3 dias) ou guarda (evita 2 de dano). O moinho usa os caminhos comunitário e comercial já descritos neste plano. As escolhas são definitivas; a evolução e o encontro anterior de especialização compartilham o mesmo registro do moinho.

Derrotas contra saqueadores ou desertores danificam uma obra, seguindo a ordem do catálogo, sem atingir uma obra já interrompida. O primeiro dano reduz em um nível a parcela das melhorias, preservando o benefício original; o segundo suspende as passivas da construção, inclusive especialização, renda e desconto. O Escudo já recebido ao construir a capela permanece. Um ataque também interrompe os trabalhos comunitários daquela obra.

Reparar custa 4 Gold, ou o jogador organiza ajuda comunitária e espera três dias para concluir sem pagar. O reparo remove os danos e preserva nível e caminho. O mapa registra destroços durante cinco dias após um ataque; uma escolha de colheita com ganho explícito de Honra deixa enfeites pelo mesmo período. O calendário do jogo determina a estação do mapa, inclusive com o Druida.

Todas as 12 construções aparecem no mapa. As não construídas informam que dependem de encontros; o painel não revela flags ou histórias secretas. O jogador abre detalhes por clique, toque ou teclado. Os painéis mostram custo, espera e motivo do bloqueio. Requisitos públicos das cartas usam consultas próprias, limitadas ao espaço restante entre as quatro respostas; requisitos secretos continuam ocultos. Compras sem saldo informam o Gold faltante e permitem abrir essa explicação sem comprar.

Antes de criar ou avaliar a arte, consultar `docs/MEMORIA-ILUSTRACOES.md` por inteiro. Definir como o mapa atende computador e celular, sem depender apenas de cor ou hover. Consultar o mapa não deve consumir dias; o custo de tempo de construir, melhorar e reparar ainda precisa de decisão, respeitando a regra já escolhida para os eventos de evolução.

### Sequência e verificações previstas

1. Inventariar obras, formas de obtenção, efeitos e a especialização existente; definir como os saves antigos entram no novo sistema.
2. Especificar os níveis, o intervalo e os caminhos de evolução de cada obra, incluindo as histórias sem gasto de dia.
3. Definir os danos e reparos, com uma solução para falta de Gold e informação clara sobre a perda de bônus.
4. Desenhar o mapa e seus estados, consultar a memória visual e verificar o uso por toque, mouse e teclado.
5. Implementar somente após autorização, verificando persistência, recarga durante uma cadeia, pagamento único, efeitos reais de cada nível e suspensão ou recuperação dos bônus ao danificar e reparar.
6. Avaliar equilíbrio e frequência em partidas, limitando a 500 o total de repetições de testes e simulações da tarefa, somando cenários e novas rodadas.

**Aceite proposto:** cada construção possível aparece no mapa com estado compreensível; o painel mostra a melhoria seguinte e os requisitos reveláveis; evoluções e reparos preservam seu estado ao carregar; eventos de evolução não avançam o dia; e os efeitos de uma obra danificada correspondem ao que o jogo informa. Conferir manualmente o mapa em computador e celular, incluindo os estados bloqueado, melhorável e danificado.

## 17. Checklist de entrega

- [x] Registrar os sete pontos escolhidos e a base existente.
- [x] Organizar etapas, critérios de aceite e decisões pendentes.
- [x] Definir a cobertura de persistência e o limite das simulações.
- [x] Revisar o documento e sua referência no índice da documentação.
- [x] Incorporar as aprovações posteriores de mercador, interface e combate, incluindo tutorial automático e acesso pelo “?”.
- [x] Selecionar os lotes e adotar valores experimentais para a primeira implementação.
- [x] Implementar o piloto das continuações de farinha, bardo, prisioneiro e capela, com janela de 6 a 12 rodadas, fila persistida e intervalo entre continuações.
- [x] Adicionar consulta aos atributos, preparos e modificadores conhecidos.
- [x] Conferir a origem dos bônus temporários pelo valor efetivamente aplicado, inclusive perdas limitadas pelo mínimo; equipamentos antigos permanecem no valor permanente acumulado, sem atribuição inventada.
- [x] Acrescentar variantes de vila e estação às oito cartas selecionadas, mantendo até quatro respostas e salvando a situação da carta aberta.

- [x] Implementar recompensas dos chefes e encontros de obtenção futura para Barão e chefe abissal, preservando o Selo da Recusa existente.
- [x] Implementar especialização comunitária ou comercial do moinho e vínculos com cão, corvo e gato.
- [x] Implementar ponderação contextual do mercador, oferta persistida e indicação do destino das compras.
- [x] Acrescentar sinais de ação, consequência principal e consulta do progresso dos presságios.
- [x] Exibir requisitos públicos, alternativas com “ou”, limites máximos, estações e itens, mantendo condições secretas ocultas; mostrar o saldo faltante na vitrine.
- [x] Registrar a seleção de 11 de novembro de 2026: explicação das alternativas indisponíveis por clique ou hover, sem aprovar as demais ideias do brainstorm.
- [x] Acrescentar o informativo das alternativas indisponíveis e conferir clique, hover, toque emulado e teclado, sem executar a opção nem avançar a rodada durante a consulta.
- [x] Registrar a proposta do mapa, os três níveis, a evolução por Gold ou história, os danos e as cinco melhorias de experiência escolhidas.
- [x] Registrar caminhos definitivos no último nível de algumas obras, marcas das estações e detalhes temporários de acontecimentos no mapa.
- [x] Definir caminhos para ponte e moinho, efeitos e marcas temporárias de ataques e colheita.
- [x] Registrar as regras de cada construção, incluindo a integração com o moinho existente e a entrada dos saves antigos.
- [x] Implementar o mapa em HTML/CSS, níveis, cenas dos artesãos, danos e reparos; conferir controles no Edge em computador e celular emulado.
- [x] Revisar botões e campos com foco visível, distinguir conquistas obtidas e pendentes e reorganizar os avisos no canto da tela.
- [x] Apresentar as quatro etapas da ajuda de combate com exemplos visuais; mostrar a obra selecionada em um painel junto à planta da vila.
- [ ] Conferir os controles em celular físico; avaliar uma ilustração própria do mapa caso o autor a solicite.
- [x] Adicionar aviso de estação, consulta dos companheiros e indicação de proteções consumidas.

- [x] Implementar velocidades normal, rápida e imediata, bloqueio breve de cliques entre telas, restauração da posição do inventário e fechamento de painéis por Escape.
- [x] Mostrar a regra de empate, separar vencedor e dano e preservar a última troca dos chefes.
- [x] Implementar tutorial no primeiro combate, consulta pelo “?” e acesso pela ajuda geral, com preferência própria e restauração de foco.
- [x] Diferenciar a apresentação dos encerramentos por rota, mantendo o estado real do salvamento.
- [x] Executar os 15 testes novos de sistemas e uma conferência automatizada no Edge em desktop e celular emulado.
- [x] Revisar as alterações e executar testes, lint e formatação dos arquivos modificados após os ajustes; registrar separadamente as falhas anteriores da suíte e da formatação global.
- [x] Simular as quatro filas com urgências, intervalo entre continuações e recarga em cada rodada, respeitando o limite total da tarefa.
- [ ] Ampliar a simulação para partidas completas com todas as interações e avaliar o balanceamento, dentro do saldo do limite desta tarefa.
- [ ] Conferir em navegador os demais fluxos: fila, bônus, mercador, especialização, vínculos, chefes e encerramentos.
- [ ] Avaliar o balanceamento em partidas completas e conferir um celular físico.

**Valores adotados nesta implementação:** a vila pequena tem até 25 habitantes; o mutirão exige pelo menos 60 e custa 2 Gold. As variantes sazonais compartilham as oito cartas da vila. Especializar o moinho custa 3 Gold: a função comunitária acrescenta 1 Vida por dia, enquanto a comercial rende 1 Gold a cada 5 dias. O cão evita 8 pontos do primeiro golpe de combate que causaria pelo menos 12 após as proteções; o corvo abre uma busca por 4 Gold; o gato acrescenta 1 de cura diária abaixo da metade da Vida. Esses valores ainda precisam da avaliação de balanceamento. A seção 15 conserva as decisões que motivaram o plano; esta lista registra as escolhas feitas para executá-lo.

**Resumo:** a implementação cobre os sistemas anteriores e acrescenta o mapa das 12 construções, níveis, caminhos definitivos, cenas dos artesãos e reparos sem Gold. O cálculo de renda, cura, proteção e desconto respeita as obras interrompidas; carregar preserva níveis e escolhas. As alternativas indisponíveis permitem consultar requisitos públicos sem decidir pela pessoa. Permanecem pendentes o balanceamento em partidas completas, os fluxos de navegador ainda assinalados e o celular físico.

**Validações registradas em 11 de novembro:** a suíte completa executou 262 testes: 225 passaram e 37 falharam. A execução com os arquivos JavaScript de `HEAD` reproduziu essas mesmas 37 falhas, sem falhas novas na comparação; as falhas não representam aprovação da suíte. Os 15 testes de sistemas e os 13 novos testes de construções passaram. O lint passou, assim como o Prettier dos arquivos modificados; a verificação global de formatação continua apontando 35 arquivos que esta tarefa não alterou.

O Edge conferiu tutorial automático, preferência, foco, Escape e preservação do turno em 1366 × 768 e 390 × 844. Conferiu também as 12 obras no mapa, pagamento e dia preservados, ausência de rolagem horizontal, retorno do foco e consultas de requisitos por clique, hover, teclado e toque emulado, com movimento reduzido e sem exceções de JavaScript. As capturas e os relatórios estão em `.taste-skill/qa/sistemas/`.

A revisão visual passou nos 45 testes direcionados de sistemas, construções, interface e controlador, além do lint. O navegador percorreu as quatro etapas da ajuda, selecionou obras sem alterar o save e verificou busca e limpeza dos filtros das conquistas. Os campos da coleção usam texto de 16 px no celular. As capturas incluem a coleção em computador e celular, os exemplos da ajuda e a nova planta da vila; a conferência em aparelho físico continua pendente.

A simulação da fila concluiu 48 continuações em 12 cenários e 360 passos, com 14 adiamentos por urgências, intervalos de 12 a 20 rodadas, nenhuma duplicação e nenhuma das quatro filas restante. Duas tentativas interrompidas durante o ajuste do simulador percorreram 13 passos cada; o total acumulado desta tarefa é 386 passos de simulação, deixando 114 dentro do limite de 500. Esse levantamento verifica espera e persistência, sem comprovar o equilíbrio de partidas completas. Não houve teste em celular físico.
