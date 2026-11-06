# PRD: Maus Presságios

Data: 6 de novembro de 2026.

Estado: proposta de produto; implementação pendente. As regras marcadas como confirmadas vêm das decisões do usuário. Valores sugeridos servem ao primeiro teste de balanceamento.

## Objetivo

Acrescentar dez acontecimentos raros que anunciam uma ameaça e dão ao jogador tempo para enfrentá-la. O catálogo inicial de oito recebeu dois presságios adicionais a pedido do usuário: um para evitar ganhos de Honra em partidas ruins e outro para evitar perdas de Honra em partidas boas. O aviso interrompe a apresentação da partida, mas não consome rodada. Depois do anúncio, as escolhas normais continuam enquanto uma condição determina o desfecho do presságio.

O jogador precisa entender o risco antes de voltar à vila. Cumprir a preparação evita a penalidade e concede uma recompensa pequena, conforme decisão do usuário.

## Regras confirmadas

| Assunto | Regra |
| --- | --- |
| Nome do conjunto | Maus Presságios; cada ocorrência é um mau presságio. |
| Quantidade | Dez eventos: os oito iniciais e dois novos para caminhos morais diferentes. Parte das regras ainda depende de definição. |
| Anúncio | Cena própria, com escurecimento da tela e animação especial. |
| Conteúdo da cena | Uma caixa com nome, descrição, imagem e uma única resposta: “Preparar para o presságio”. |
| Passagem do tempo | Abrir a cena e responder não avançam a rodada. |
| Ameaça | Cada presságio tem uma consequência ruim que o jogador pode evitar por meio da preparação. |
| Desfecho favorável | Evitar a penalidade também concede uma recompensa pequena. |
| Duração | Varia entre presságios; alguns podem durar até um ano. |
| Simultaneidade | Apenas um ativo por vez. |
| Frequência | Rara; o intervalo e a chance exatos ainda precisam de teste. |
| Debug | Permite testar os dez eventos diretamente. |
| Lua Vermelha | Usa a queda de Vida em relação à Vida inicial do presságio, em vez de somar todas as perdas. |
| Verificação da Lua Vermelha | Apenas no fim do prazo. Curar antes do vencimento pode evitar a penalidade. |
| Acompanhamento | Indicador discreto ao lado das informações de Inventário e Cronologia. |
| Artes | Podem destoar das demais cartas, usando vermelho para demonstrar perigo. |

## Calendário e frequência

O calendário atual define quatro estações de 25 rodadas, totalizando 100 rodadas por ano. A vitória normal chega na rodada 300. As fontes são `js/state.js`, nas definições de calendário e duração da crônica, e `js/engine.js`, na função `avancar`.

“Um ano para se preparar” significa 100 rodadas reais. Cenas extras, incluindo encontros da Herdeira do Leste, não encurtam esse prazo. Segundos de animação, tempo com a página fechada e cliques no inventário também não contam.

### Valores sugeridos para o primeiro teste

| Parâmetro | Proposta inicial, ainda sem aprovação |
| --- | --- |
| Primeira oportunidade | Depois de concluir a rodada 25. |
| Chance | 2% por rodada elegível, com uma tentativa por rodada. |
| Intervalo | Pelo menos 50 rodadas completas após resolver o anterior. |
| Limite | Até três anúncios naturais por crônica. |
| Repetição | Cada presságio aparece no máximo uma vez por partida. |
| Prazos de referência | 25, 50 ou 100 rodadas, conforme a condição. |

O sorteio considera apenas presságios cujo prazo caiba antes do encerramento da crônica. Um presságio de 100 rodadas não pode começar após a rodada 200. Perto do fim, a seleção usa os de prazo menor, se houver candidatos elegíveis; não encurta silenciosamente um prazo anunciado.

Uma partida pode terminar sem mostrar todos os dez. O catálogo oferece variedade entre partidas; os dez não constituem uma sequência obrigatória.

Não sortear durante outro presságio, uma cena de anúncio ou um desfecho pendente. Também adiar a tentativa enquanto houver decisão de culto ou encontro extra em andamento. Derrota e encerramento da partida têm prioridade sobre um novo anúncio.

## Entrada, anúncio e retorno

O ponto sugerido de entrada é depois de concluir todos os acontecimentos da rodada, antes de avançar para a seguinte. O aviso fica fora do sorteio normal de cartas e não ocupa o lugar de um evento diário.

1. O jogador conclui a decisão da rodada e pede para continuar.
2. Se a rodada permitir um anúncio e o sorteio selecionar um presságio, o jogo salva a ocorrência e escurece a tela.
3. A interface troca para a caixa do presságio, sem painel de atributos, inventário ou outras opções ao fundo.
4. A descrição apresenta a condição, o prazo e a consequência. O jogador responde “Preparar para o presságio”.
5. O jogo salva a confirmação e retoma a passagem normal para a rodada seguinte, uma única vez.

A ocorrência guarda a Vida de referência no anúncio e mantém esse valor ao carregar. A confirmação inicia a contagem; a primeira rodada monitorada é a seguinte à do anúncio. Não há custo automático para apertar o botão: a preparação acontece nas decisões posteriores.

O anúncio não concede renda, cura, visita extra, efeito periódico ou novo sorteio da passiva nórdica. Ao retornar, o avanço habitual executa esses efeitos apenas onde já deveriam acontecer. A tela não transforma uma carta comum em outra nem altera a ordem das escolhas já sorteadas.

### Apresentação

Proposta de duração: cerca de um segundo para escurecer e revelar a cena. Durante a troca, bloquear ações duplicadas; a cena precisa aparecer mesmo se a imagem falhar ou a animação não disparar seu evento de término.

Respeitar a preferência por movimento reduzido com uma troca breve de opacidade. O foco vai para a caixa e depois para a resposta; teclado e toque devem permitir confirmar. A versão de celular mantém a resposta acessível sem cortar a descrição.

Por decisão do usuário, as artes dos Maus Presságios podem destoar das demais cartas e usar vermelho para demonstrar perigo. O vermelho pode ocupar áreas maiores da composição; a paleta de marfim da vila não limita esse conjunto. Manter o traço de gravura medieval, a atmosfera sombria e a ausência de moldura desenhada, conforme a exceção registrada em `MEMORIA-ILUSTRACOES.md`.

Entregar WebP em qualidade 90, com maior lado de 800 px, preservando proporções e transparência. Este PRD não inclui geração de imagens.

## Acompanhamento e resolução

A cena inicial mantém somente os quatro elementos pedidos. Depois dela, a interface normal exibe um indicador discreto ao lado das informações de Inventário e Cronologia, conforme decisão do usuário. Ao clicar ou acionar por teclado, o indicador permite consultar o nome, a condição, o prazo restante e a consequência do presságio ativo. Essa consulta não avança rodada nem repete a animação do anúncio.

Condições podem exigir manter um atributo acima de um limite ou alcançar uma preparação até o prazo. Cada definição deve informar se verifica o resultado continuamente ou apenas no vencimento. A descrição precisa explicar essa diferença, sem obrigar o jogador a adivinhar.

Uma rodada monitorada inclui suas decisões e encontros extras antes de encerrar. No último dia, o jogador ainda pode agir; só depois o jogo verifica condições que vencem naquela rodada. Efeitos automáticos da abertura desse dia também contam. A resolução não exige uma rodada adicional fora do prazo.

Ao resolver, mostrar a causa e a alteração de recursos. Aplicar a penalidade ou a recompensa uma vez, registrar o resultado e liberar o espaço para um futuro presságio, respeitando o intervalo. A proposta é usar um aviso de resultado com uma confirmação, sem consumir rodada; a animação especial completa fica reservada ao anúncio.

### Exemplo em definição: A Lua Vermelha

O usuário propôs uma ameaça ligada à perda de 40 de Vida, com penalidade de 20 habitantes. Esses valores permanecem como referência para discussão, sem aprovação de balanceamento. Prazo sugerido para o primeiro teste: 25 rodadas.

Guardar `vidaReferencia` no anúncio. A queda em uma verificação é `max(0, vidaReferencia - vidaAtual)`. Não somar danos de momentos diferentes. A referência permanece fixa até o desfecho, inclusive se a Vida máxima mudar; essa interação precisa de teste antes de aprovar a regra final.

Exemplo: com referência de 120 de Vida, chegar a 95 representa queda de 25. Curar até 110 reduz a queda para 10; perder 15 depois deixa a queda em 25, embora o personagem tenha sofrido 40 de dano ao todo.

Conferir a queda apenas no fim do prazo, conforme decisão do usuário. Atingir o limite antes disso não confirma a falha nem antecipa a penalidade.

| Vida no vencimento | Exemplo com referência de 120 |
| --- | --- |
| 80 ou menos | A queda alcança pelo menos 40; aplicar a penalidade uma vez. |
| 81 ou mais | A queda fica abaixo de 40; evitar a penalidade e conceder a recompensa pequena. |

Cair a 75 e recuperar até 110 antes do fim evita a falha. A descrição precisa deixar claro que a verificação acontece ao término do prazo.

Recompensa sugerida para evitar a Lua Vermelha: +2 Gold. O valor ainda precisa de aprovação. O botão do anúncio não cobra Gold nem compra proteção.

## Definição dos dez eventos

As posições 2 a 7, 9 e 10 têm suas regras aprovadas pelo usuário. A Lua Vermelha mantém as decisões já registradas, com valores finais pendentes. A posição 8 recebe uma nova narrativa ligada ao Barão, a pedido do usuário, e segue em análise. As sugestões apresentadas na conversa só entram como aprovadas após a decisão do usuário.

| Posição | Nome | Situação |
| --- | --- | --- |
| 1 | A Lua Vermelha | Verificação final e cura confirmadas; prazo e valores finais pendentes. |
| 2 | O Cometa de Cinzas | Aprovado: 50 rodadas; reserva final de 30 Gold; falha causa −20 de Vida e −10 habitantes; sucesso recupera 5 de Vida. |
| 3 | A Nuvem Faminta | Aprovado: praga de gafanhotos; investir 15 Gold em auxílio à vila durante 50 rodadas; falha causa −15 habitantes e −10 de Vida; sucesso concede 5 habitantes. |
| 4 | A Ferrugem Negra | Aprovado: 50 rodadas; aumentar o Escudo inicial em 50%, com aumento mínimo de 2; falha retira 40% da Vida no vencimento, preservando 1 de Vida; sucesso concede 20% do Escudo final como ganho permanente. |
| 5 | Os corvos | Aprovado: ganhar 50 de Honra por decisões em 50 rodadas; sucesso concede o Olhar de Odin por 20 rodadas; falha aplica uma maldição nórdica aleatória por 10. |
| 6 | A Noite do Lamento | Aprovado: 100 rodadas; terminar com 20 habitantes a mais do que no anúncio; falha causa −20 habitantes; sucesso concede 10 habitantes adicionais. |
| 7 | A Procissão sem Rostos | Aprovado: realizar 12 escolhas de auxílio em 50 rodadas; falha causa −20 de Vida e −5 habitantes; sucesso concede permanentemente 10 de Vida máxima e recupera 10 de Vida. |
| 8 | A Vinda do Barão | Nova narrativa em análise, substituindo O Cofre que Respira; manter a proposta de ganhar 40 Gold por decisões em 50 rodadas; falha retira metade do Gold disponível e 10 de Vida; sucesso concede 10 Gold. |
| 9 | A Sombra Coroada | Aprovado: para partidas ruins; evitar decisões que concedam Honra durante 25 rodadas; sucesso concede 15% de Ataque; falha retira 20% de Ataque. |
| 10 | A Testemunha de Pedra | Aprovado: para partidas boas; evitar decisões que retirem Honra durante 25 rodadas; sucesso concede 15% de Escudo; falha retira 20% de Escudo. |

### Aprovado: O Cometa de Cinzas

Uma estrela deixa um rastro sobre a vila. Todas as manhãs, cinzas cobrem os telhados, embora ninguém encontre fogo. O aviso anuncia que a queda das cinzas vai adoecer os moradores; a vila precisará de dinheiro para cuidar deles.

O prazo é de 50 rodadas. Verificar o saldo de Gold apenas no vencimento: 30 ou mais evita a penalidade e recupera 5 de Vida, respeitando a Vida máxima; menos de 30 causa a perda conjunta de 20 de Vida e 10 habitantes. Aplicar as proteções habituais da partida, conforme a regra geral de consequências deste PRD.

A condição exige uma reserva, sem descontar os 30 Gold. O jogador pode gastar e recompor o saldo durante o prazo. A falha representa a falta de cuidados para os moradores e o adoecimento do herdeiro ao tentar ajudá-los sem recursos suficientes. A interação com o culto permanece pendente, conforme a seção de decisões em aberto.

### Aprovado: A Nuvem Faminta

Um lavrador chega com um gafanhoto preso no punho. Outros cobrem as cercas e os telhados; além dos campos, uma nuvem avança contra o vento.

O presságio anuncia uma praga de gafanhotos. Durante 50 rodadas, o jogador precisa investir pelo menos 15 Gold em auxílio à vila, financiando a proteção das plantações e a distribuição de mantimentos. Contabilizar os gastos efetivos das escolhas de auxílio elegíveis após o anúncio; compras pessoais e perdas involuntárias de Gold não contam. O saldo guardado não substitui o investimento.

Verificar o total investido apenas no vencimento. Se atingir 15 Gold, evitar as perdas e conceder 5 habitantes; se não atingir, aplicar a perda conjunta de 15 habitantes e 10 de Vida, respeitando as proteções habituais. Mostrar o progresso no indicador, como 9/15 Gold, sem cobrar outra vez os gastos já feitos.

A implementação precisa identificar as escolhas elegíveis e garantir oportunidades suficientes durante o prazo. A definição dessas oportunidades e a interação com o culto permanecem pendentes. Esta proposta substitui Os Sinos Enterrados e a versão anterior de A Fome sob a Terra.

### Aprovado: A Ferrugem Negra

O ferreiro aperta uma fivela entre os dedos, e o metal se desfaz. Na manhã seguinte, o mesmo pó negro cobre as armaduras dos guardas.

Guardar o Escudo do anúncio como referência fixa. Ao fim de 50 rodadas, exigir esse valor mais 50%, arredondando o aumento para cima e respeitando aumento mínimo de 2. A meta é `escudoReferencia + max(2, ceil(escudoReferencia * 0.5))`: começar com 4 exige terminar com 6; começar com 10 exige 15.

Na falha, retirar 40% da Vida que o herdeiro tiver no vencimento, arredondando a perda para cima e preservando pelo menos 1 de Vida. Com 100 de Vida, a perda é 40; com 30, é 12. Se houver apenas 1 de Vida, preservá-la tem prioridade sobre o percentual. Esta penalidade sozinha não encerra a partida.

No sucesso, conceder um aumento permanente de 20% sobre o Escudo existente no vencimento, arredondando para cima. Primeiro verificar a meta; depois calcular e aplicar a recompensa uma vez. Com 10 de Escudo, conceder +2; com 15, +3. O ganho substitui a recompensa de 2 Gold da proposta anterior.

Os testes de balanceamento ainda precisam conferir a influência de modificadores temporários no Escudo de referência e no Escudo final. Essa verificação não altera as porcentagens aprovadas.

### Aprovado: Os corvos

Dois corvos ocupam os telhados da praça e acompanham o vilarejo em silêncio. Quando você volta ao salão, encontra uma pena negra sobre a sua cadeira.

O nome e o texto acima vêm do usuário. Ele aprovou a meta de Honra e os desfechos abaixo, incluindo as durações dos efeitos.

Meta aprovada: somar 50 pontos de Honra provenientes de decisões ao longo de 50 rodadas. Contar ganhos positivos das escolhas e de seus resultados efetivos, sem incluir efeitos automáticos. Perdas posteriores não apagam os ganhos registrados. Verificar o total no vencimento, em vez de exigir uma Honra final positiva ou um aumento líquido de 50.

#### Referência para a meta de Honra

Levantamento de 6 de novembro de 2026 com o catálogo carregado pelo helper `tests/helpers/jogo.cjs`: 384 eventos, com 1.100 opções de escolha, incluindo os conjuntos `poolOpcoes`. Dessas opções, 547 apresentam `efeitos.honra` positivo, com média de aproximadamente 2,19 pontos entre as escolhas positivas. Os valores mais comuns são +1 e +2, que aparecem em 386 dessas 547 opções.

Com essa média, 50 pontos equivalem a cerca de 23 escolhas positivas em 50 rodadas. Essa conta é uma referência de esforço; não representa a média de Honra de partidas reais e não considera todos os custos, testes de sorte ou consequências das decisões.

Como conferência adicional, o levantamento avaliou o potencial das cartas comuns elegíveis nas rodadas 26 a 75, ponderadas pelos pesos da engine. Em cenários de Honra inicial −30, 0 e +30, com 70 habitantes e saldos fixos de 5, 15 ou 30 Gold, escolher sempre o maior ganho direto disponível resultou em potencial estimado entre 98 e 103 pontos em 50 rodadas. Esse cálculo mantém os atributos dos cenários fixos e exclui cartas especiais e letais; não simula uma partida completa, a memória das cartas nem o avanço das cadeias.

A meta aprovada de 50 usa aproximadamente metade desse potencial estimado, deixando espaço para decisões de sobrevivência. Ainda exige simulação de partidas e teste com os herdeiros antes da implementação.

#### Desfechos aprovados

No sucesso, conceder o Olhar de Odin durante 20 rodadas: revelar o valor de Honra do herdeiro e o número de habitantes. Usar como referência a variante da bênção de Odin que revela os dois atributos, sem cobrar o sacrifício da carta. A recompensa substitui os 2 Gold sugeridos antes; não concede o item Corvo da estrada, cujo efeito é acrescentar Gold às recompensas.

Na falha, sortear uma das dez maldições nórdicas do catálogo, usando seu efeito básico durante 10 rodadas. O sorteio e a aplicação acontecem uma vez no desfecho; carregar o save não troca a maldição. Essa consequência substitui a perda de 10 habitantes da proposta anterior.

A convivência desses efeitos com uma bênção ou maldição de carta já ativa ainda precisa de regra explícita. A sugestão é preservar o efeito anterior e manter o do presságio com prazo próprio, respeitando as proteções e evitando duplicar efeitos que não acumulam. Os desfechos não abrem outra carta nórdica nem consomem rodada adicional.

### Aprovado: A Noite do Lamento

Um viajante conta que, na aldeia além do rio, os primogênitos morreram na mesma noite. Outras famílias chegam atrás dele, carregando os filhos e trazendo nas roupas o sangue com que marcaram suas portas.

A narrativa adapta a referência à morte dos primogênitos nas pragas do Egito ao mundo do jogo. A preparação representa acolher famílias que fogem da ameaça e tornar a vila um refúgio.

Guardar o número de habitantes no anúncio. Ao fim de 100 rodadas, exigir pelo menos 20 habitantes a mais do que essa referência: uma vila com 50 precisa terminar com 70; uma com 100 precisa terminar com 120. Novas chegadas compensam perdas durante o prazo, pois a condição usa a população no vencimento, sem somar apenas os ganhos.

Na falha, aplicar a perda de 20 habitantes, respeitando as proteções habituais. No sucesso, conceder 10 habitantes adicionais após verificar a meta. Tanto a meta quanto os desfechos usam valores fixos, conforme a preferência do usuário por simplificar a contagem.

Esta versão substitui O Exército sem Pegadas e as propostas intermediárias A Névoa dos Ausentes e As Casas Marcadas. A interação com o culto ainda depende da regra geral de população desse sistema.

### Aprovado: A Procissão sem Rostos

Uma procissão atravessa a estrada com velas apagadas. Quando os vigias se aproximam, as figuras erguem a cabeça; sob os capuzes, não há olhos nem boca.

A procissão retorna todas as noites, parando diante das casas de quem pediu ajuda e não recebeu.

Durante 50 rodadas, realizar pelo menos 12 escolhas de auxílio aos moradores. Contar cada decisão elegível uma vez, incluindo auxílios que não cobram Gold, como socorrer feridos ou proteger moradores. O indicador mostra o progresso, por exemplo, 6/12 auxílios. A condição conta ações após o anúncio, sem considerar decisões anteriores.

No vencimento, verificar o total. Se houver menos de 12 auxílios, aplicar a perda conjunta de 20 de Vida e 5 habitantes, respeitando as proteções habituais. Se houver 12 ou mais, aumentar permanentemente a Vida máxima em 10 e depois recuperar 10 de Vida, respeitando o novo máximo. Salvar a resolução para impedir a repetição da recompensa ao carregar.

A implementação precisa marcar as escolhas elegíveis e garantir oportunidades suficientes durante o prazo. A contagem pode compartilhar a identificação dos auxílios com A Nuvem Faminta, mas cada condição mantém sua unidade: decisões para a Procissão e Gold efetivamente gasto para a Nuvem.

### Em análise: A Vinda do Barão

Um mensageiro de estandarte cinzento entrega uma carta selada. O barão virá à vila, e os soldados que o acompanham já recolhem provisões nas aldeias do caminho.

O usuário pediu uma narrativa relacionada ao Barão no lugar do cofre. A referência vem dos eventos existentes `barao` (O cobrador do barão, em `js/events.js`) e `volta_do_barao` (A volta do barão, em `js/events-vila.js`), que usam estandartes cinzentos e cobranças de tributo.

Manter, para avaliação, a preparação econômica da proposta anterior: conquistar 40 Gold por decisões durante 50 rodadas. Contar ganhos efetivos de negociações e recompensas das escolhas após o anúncio, sem incluir renda automática. O jogador pode gastar os ganhos depois; a condição acompanha o total conquistado, não o saldo final. O texto final da condição precisa deixar essa diferença clara, sem anunciar uma cobrança automática de 40 Gold.

Na falha, o séquito saqueia metade do Gold disponível, arredondando a perda para cima, e causa 10 de dano ao herdeiro. No sucesso, comerciantes voltam a negociar com a vila após a passagem dos soldados, concedendo 10 Gold. Nome, narrativa e desfechos continuam em avaliação.

Definir a ligação com as cartas atuais do Barão antes de implementar. Evitar que outra visita dele contradiga o anúncio ou repita a mesma cobrança durante o acompanhamento. Este presságio ainda não agenda uma batalha nem altera as cartas existentes.

### Aprovado: A Sombra Coroada

Sua sombra deixa de acompanhar seus passos e permanece junto à cadeira do salão. Sobre a cabeça dela, uma coroa de pontas compridas se move quando alguém pede clemência.

O usuário aprovou este presságio para partidas ruins que exige evitar ganhos de Honra. Permitir seu anúncio com Honra igual ou inferior a −30, usando como referência o limite atual de Honra baixa do jogo. Esse requisito vale para a entrada no sorteio, não como substituto da condição de preparação.

Durante 25 rodadas, evitar decisões que concedam qualquer ponto positivo de Honra. Registrar se uma decisão viola a regra, mesmo quando o saldo total de Honra permanece negativo. Ganhar +1 e perder −5 depois não apaga a violação. Verificar o registro no vencimento, sem aplicar uma perda no momento da escolha.

No sucesso, aumentar permanentemente o Ataque em 15% do valor existente no vencimento. Na falha, retirar 20% do Ataque existente no vencimento, sem permitir valor negativo. Arredondar os valores das alterações para cima. Tema, prazo, percentuais e requisito de entrada aprovados; balanceamento em partidas ainda pendente.

### Aprovado: A Testemunha de Pedra

Uma estátua aparece na praça durante a noite, com as mãos cobrindo o rosto. Pela manhã, lágrimas escuras escorrem entre os dedos, e o chão à sua volta guarda marcas de joelhos.

O usuário aprovou este presságio, com narrativa própria, para partidas boas que exige evitar perdas de Honra. Permitir seu anúncio com Honra igual ou superior a +30, usando como referência o limite atual de Honra alta do jogo.

Durante 25 rodadas, evitar decisões que retirem qualquer ponto de Honra. Registrar cada violação independentemente do saldo final: perder −1 e recuperar +5 depois não desfaz o registro. A resolução acontece no vencimento.

No sucesso, aumentar permanentemente o Escudo em 15% do valor existente no vencimento. Na falha, retirar 20% do Escudo existente no vencimento, sem permitir valor negativo. Arredondar os valores das alterações para cima. Tema, prazo, percentuais e requisito de entrada aprovados; balanceamento em partidas ainda pendente.

#### Contagem dos dois novos presságios

A proposta é avaliar a Honra associada à decisão e aos seus desfechos, sem contar renda, passivas ou outros efeitos automáticos. A preparação exige evitar a direção proibida; não obriga a ganhar Honra no caminho bom ou perder Honra no caminho ruim. Decisões neutras podem cumprir ambas as condições.

Antes da implementação, definir como a contagem trata imunidade da Heroína do povo e efeitos de itens que neutralizam Honra. A recomendação é avaliar a alteração prevista pela decisão antes dessas proteções, com descrição explícita na carta, para que imunidade não conceda sucesso automático. Esta interpretação ainda precisa da aprovação do usuário.

Conferir também se todas as cartas que podem aparecer oferecem uma saída compatível com a preparação. Uma escolha obrigatória ou um desfecho aleatório oculto não deve tornar a falha inevitável sem possibilidade de reação. Esses pontos de balanceamento continuam pendentes.

Cada proposta deve explicar o que o jogador pode fazer para se preparar com as escolhas e recursos existentes. Evitar dez variações de perder Vida; incluir condições que mudem a forma de gastar recursos ou proteger a vila. Uma condição que dependa apenas de receber uma carta rara oferece pouca capacidade de reação.

Penalidades devem ter gravidade comparável entre herdeiros, respeitando suas proteções. Até definir uma regra para o culto, a proposta é excluir do sorteio presságios que afetem apenas habitantes quando a partida usa seguidores como população. Se a conversão ao culto acontecer durante um presságio, o projeto ainda precisa decidir como tratar a consequência; não substituir habitantes por seguidores sem uma regra explícita.

## Estado da partida e integração

Manter um módulo próprio para as definições e regras dos presságios. Integrar estado, engine, interface, controlador e save sem registrar os anúncios como cartas diárias comuns.

| Dado persistente | Finalidade |
| --- | --- |
| Presságio atual | ID, fase do anúncio ou acompanhamento, rodada do anúncio e começo da contagem. |
| Condição | Prazo, rodada final, valores de referência e progresso necessário à regra. |
| Desfecho pendente | Resultado e confirmação de aplicação, para impedir repetição ao carregar. |
| Histórico | IDs anunciados e resultados já concluídos. |
| Controle de frequência | Última rodada tentada, última resolução e quantidade de anúncios naturais. |
| Retorno à partida | Ponto de retomada e dados da cena suspensa, quando necessários. |

Salvar antes de apresentar o anúncio e após confirmá-lo. Uma recarga durante a animação volta à caixa de anúncio, sem sortear outro presságio. Uma recarga durante o acompanhamento conserva a referência de Vida e o prazo.

O processamento de condições precisa usar mudanças reais dos atributos e os pontos em que cada regra vence. Não contabilizar alterações apenas na interface. Auditar também mudanças diretas de Vida que não passem por `aplicarEfeitos`, incluindo itens, combates e mudanças de Vida máxima.

Aplicar penalidades pelo mesmo caminho de efeitos e proteções dos demais acontecimentos. Verificar derrota ou transição ao culto após a consequência, sem aplicar a perda duas vezes. A confirmação de um resultado não pode servir para adiar indefinidamente uma penalidade já determinada.

Saves antigos recebem estado vazio. Estados novos validam ID, fase e rodadas. Separar a apresentação do avanço impede repetir ganhos ao retomar cenas.

Bênçãos e maldições nórdicas podem coexistir com um presságio. O efeito diário do Herdeiro Nórdico continua limitado a um sorteio por rodada. Visitas da Herdeira do Leste mantêm sua carta de retorno; presságios aguardam o término da visita. As estações do Druida não alteram o prazo de 100 rodadas que representa um ano neste sistema.

## Debug

Acrescentar “Maus Presságios” ao debug existente, com escolha individual dos dez nomes quando o catálogo estiver definido. O teste deve exibir a mesma cena e a mesma animação do anúncio natural.

Disponibilizar ações para inspecionar o estado, simular sucesso, simular falha e limpar o presságio de teste. Os desfechos simulados usam o fluxo real de consequência e salvamento. Os controles identificam o que altera recursos da partida.

Se já houver um presságio ativo, recusar a ativação de outro e mostrar o motivo. A limpeza explícita permite trocar de caso sem manter dois ativos. O debug pode ignorar chance e intervalo para testar; não avança o calendário ao anunciar ou limpar, nem concede recompensas por limpeza.

## Critérios de aceite e validação prevista

| Verificação | Resultado esperado |
| --- | --- |
| Abrir e confirmar o anúncio | A cena extra não conta rodada; o retorno executa o avanço normal uma vez. |
| Limite de simultaneidade | Sorteio e debug não criam dois presságios ativos. |
| Lua Vermelha | Usa a Vida de referência, sem somar danos; queda de 39 evita a falha e de 40 causa a penalidade no vencimento. |
| Recuperação antes do vencimento | Cair mais de 40 e depois recuperar pode evitar a falha; não há penalidade antecipada. |
| Cura e Vida máxima | O resultado acompanha a regra anunciada, inclusive após recarga. |
| Presságios morais | Ganhos e perdas posteriores não apagam uma violação; decisões neutras não violam a regra e efeitos automáticos não entram na contagem proposta. |
| Prazo | Respeita a última decisão e os encontros extras da rodada final. |
| Frequência | Uma tentativa por rodada; respeita intervalo, limite e histórico. |
| Fim da crônica | Um anúncio natural nunca exige tempo além da rodada 300. |
| Salvamento | Recarregar em qualquer fase não repete sorteio, efeito, prêmio ou perda. |
| Herdeiros e cadeias | Passivas, visitas, culto e encerramentos mantêm seu funcionamento. |
| Debug | Cada evento pode abrir sua cena e resolver pelos dois desfechos. |
| Acessibilidade | Teclado, toque e movimento reduzido permitem concluir o anúncio. |
| Falha de imagem ou animação | A resposta permanece utilizável e a partida retoma. |

Implementar testes de estado e controlador para frequência, limites de prazo e salvamento. Fazer simulações de partidas completas para estimar quantos anúncios aparecem e quantas falhas ocorrem por herdeiro; usar esses resultados para ajustar os valores sugeridos.

A conferência manual deve cobrir desktop e celular, leitura da regra, tempo do escurecimento e retorno à partida. Este PRD ainda não valida o equilíbrio das penalidades nem a animação.

## Decisões em aberto

| Decisão | Situação |
| --- | --- |
| Frequência | Aprovar ou ajustar as propostas de 2%, intervalo de 50 e limite de três. |
| Catálogo | Avaliar A Vinda do Barão e fechar os valores da Lua Vermelha. Posições 2 a 7, 9 e 10 aprovadas. |
| Barão | Definir a ligação do presságio com as visitas e cobranças das cartas existentes. |
| Caminhos morais | Nomes, narrativas, prazo, requisitos e desfechos aprovados; definir interação com imunidades e escolhas obrigatórias. |
| Os corvos | Definir a convivência dos desfechos com efeitos nórdicos já ativos; meta e durações aprovadas. |
| Auxílio à vila | Definir as escolhas que contam para A Nuvem Faminta e A Procissão sem Rostos, garantindo oportunidades durante os prazos. |
| Valores | Aprovar prazos, penalidades e recompensas; Lua Vermelha ainda usa números de exemplo. |
| Culto | Definir elegibilidade e tratamento de presságio ativo durante a conversão. |

## Checklist de entrega

- [x] Registrar as aprovações das posições 2 a 7, 9 e 10, separando decisões confirmadas de sugestões.
- [x] Incorporar recompensa pequena, durações variáveis e queda de Vida relativa à referência inicial.
- [x] Registrar verificação no fim do prazo, possibilidade de cura e indicador ao lado de Inventário e Cronologia.
- [x] Registrar a direção visual própria dos presságios, com vermelho para indicar perigo.
- [x] Conferir calendário, avanço de rodada e integração com os herdeiros no código atual.
- [x] Especificar anúncio, retorno, salvamento e debug.
- [x] Ampliar o catálogo para dez e propor dois novos presságios para caminhos morais diferentes.
- [ ] Fechar as decisões em aberto e definir os dez eventos.
- [ ] Implementar e testar o sistema, produzir as artes e conferir a interface manualmente.

Resultado: PRD pronto para discussão; nenhuma mecânica foi implementada nesta entrega. Validação realizada: leitura do calendário, do fluxo de avanço e dos efeitos atuais. Balanceamento e conferência visual continuam pendentes.
