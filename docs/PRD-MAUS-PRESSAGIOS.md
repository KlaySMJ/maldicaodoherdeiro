# PRD: Maus Presságios

Data: 6 de novembro de 2026.

Estado: implementado em 6 de novembro de 2026. As regras marcadas como aprovadas vêm das decisões do usuário. Ao executar o PRD, adotamos os valores iniciais de frequência, Lua Vermelha e Barão para permitir o primeiro teste jogável; isso não equivale a uma aprovação final de balanceamento.

## Objetivo

Acrescentar dez acontecimentos raros que anunciam uma ameaça e dão ao jogador tempo para enfrentá-la. O catálogo inicial de oito recebeu dois presságios adicionais a pedido do usuário: um para evitar ganhos de Honra em partidas ruins e outro para evitar perdas de Honra em partidas boas. O aviso interrompe a apresentação da partida, mas não consome rodada. Depois do anúncio, as escolhas normais continuam enquanto uma condição determina o desfecho do presságio.

O jogador precisa entender o risco antes de voltar à vila. Cumprir a preparação evita a penalidade e concede uma recompensa pequena, conforme decisão do usuário.

## Regras confirmadas

| Assunto | Regra |
| --- | --- |
| Nome do conjunto | Maus Presságios; cada ocorrência é um mau presságio. |
| Quantidade | Dez eventos: os oito iniciais e dois novos para caminhos morais diferentes. |
| Anúncio | Cena própria, com escurecimento da tela e animação especial. |
| Conteúdo da cena | Uma caixa com nome, descrição, imagem e uma única resposta: “Preparar para o presságio”. |
| Passagem do tempo | Abrir a cena e responder não avançam a rodada. |
| Ameaça | Cada presságio tem uma consequência ruim que o jogador pode evitar por meio da preparação. |
| Desfecho favorável | Evitar a penalidade também concede uma recompensa pequena. |
| Duração | Varia entre presságios; alguns podem durar até um ano. |
| Simultaneidade | Apenas um ativo por vez. |
| Frequência | 2% por rodada elegível, intervalo de 50 rodadas após o desfecho e limite de três anúncios naturais. Valores iniciais para teste. |
| Debug | Permite testar os dez eventos diretamente. |
| Lua Vermelha | Usa a queda de Vida em relação à Vida inicial do presságio, em vez de somar todas as perdas. |
| Verificação da Lua Vermelha | Apenas no fim do prazo. Curar antes do vencimento pode evitar a penalidade. |
| Acompanhamento | Indicador discreto ao lado das informações de Inventário e Cronologia. |
| Artes | Podem destoar das demais cartas, usando vermelho para demonstrar perigo. |

## Calendário e frequência

O calendário atual define quatro estações de 25 rodadas, totalizando 100 rodadas por ano. A vitória normal chega na rodada 300. As fontes são `js/state.js`, nas definições de calendário e duração da crônica, e `js/engine.js`, na função `avancar`.

“Um ano para se preparar” significa 100 rodadas reais. Cenas extras, incluindo encontros da Herdeira do Leste, não encurtam esse prazo. Segundos de animação, tempo com a página fechada e cliques no inventário também não contam.

### Valores utilizados no primeiro teste

| Parâmetro | Implementação inicial |
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

O ponto de entrada é depois de concluir todos os acontecimentos da rodada, antes de avançar para a seguinte. O aviso fica fora do sorteio normal de cartas e não ocupa o lugar de um evento diário.

1. O jogador conclui a decisão da rodada e pede para continuar.
2. Se a rodada permitir um anúncio e o sorteio selecionar um presságio, o jogo salva a ocorrência e escurece a tela.
3. A interface troca para a caixa do presságio, sem painel de atributos, inventário ou outras opções ao fundo.
4. A descrição apresenta a condição, o prazo e a consequência. O jogador responde “Preparar para o presságio”.
5. O jogo salva a confirmação e retoma a passagem normal para a rodada seguinte, uma única vez.

A ocorrência guarda a Vida de referência no anúncio e mantém esse valor ao carregar. A confirmação inicia a contagem; a primeira rodada monitorada é a seguinte à do anúncio. Não há custo automático para apertar o botão: a preparação acontece nas decisões posteriores.

O anúncio não concede renda, cura, visita extra, efeito periódico ou novo sorteio da passiva nórdica. Ao retornar, o avanço habitual executa esses efeitos apenas onde já deveriam acontecer. A tela não transforma uma carta comum em outra nem altera a ordem das escolhas já sorteadas.

### Apresentação

Duração implementada: cerca de um segundo para escurecer e revelar a cena. A troca bloqueia ações duplicadas; a cena aparece mesmo se a imagem falhar ou a animação não disparar seu evento de término.

A preferência por movimento reduzido desativa a animação e o escurecimento. O foco vai para a resposta, dentro da caixa identificada pelo título; teclado e toque permitem confirmar. A versão de celular permite rolar o conteúdo sem cortar a descrição ou a resposta.

Por decisão do usuário, as artes dos Maus Presságios podem destoar das demais cartas e usar vermelho para demonstrar perigo. O vermelho pode ocupar áreas maiores da composição; a paleta de marfim da vila não limita esse conjunto. Manter o traço de gravura medieval, a atmosfera sombria e a ausência de moldura desenhada, conforme a exceção registrada em `MEMORIA-ILUSTRACOES.md`.

As dez artes foram produzidas durante a execução, com as revisões pedidas pelo usuário. Os WebPs usam qualidade 90, maior lado de 800 px, proporções preservadas e transparência. Gafanhotos usam cinza; os corvos seguem Odin, sem lua e sem vermelho. A Noite do Lamento mostra só a porta com uma mancha grande de sangue. A Sombra Coroada mantém a cadeira, o manto e a figura, sem lua e com chão marfim. Referências e prompts estão em [ARTES-MAUS-PRESSAGIOS.md](ARTES-MAUS-PRESSAGIOS.md).

## Acompanhamento e resolução

A cena inicial mantém somente os quatro elementos pedidos. Depois dela, a interface normal exibe um indicador discreto ao lado das informações de Inventário e Cronologia, conforme decisão do usuário. Ao clicar ou acionar por teclado, o indicador permite consultar o nome, a condição, o prazo restante e a consequência do presságio ativo. Essa consulta não avança rodada nem repete a animação do anúncio.

Condições podem exigir manter um atributo acima de um limite ou alcançar uma preparação até o prazo. Cada definição deve informar se verifica o resultado continuamente ou apenas no vencimento. A descrição precisa explicar essa diferença, sem obrigar o jogador a adivinhar.

Uma rodada monitorada inclui suas decisões e encontros extras antes de encerrar. No último dia, o jogador ainda pode agir; só depois o jogo verifica condições que vencem naquela rodada. Efeitos automáticos da abertura desse dia também contam. A resolução não exige uma rodada adicional fora do prazo.

Ao resolver, mostrar a causa e a alteração de recursos. Aplicar a penalidade ou a recompensa uma vez, registrar o resultado e liberar o espaço para um futuro presságio, respeitando o intervalo. A proposta é usar um aviso de resultado com uma confirmação, sem consumir rodada; a animação especial completa fica reservada ao anúncio.

### A Lua Vermelha: valores do primeiro teste

O usuário propôs uma ameaça ligada à perda de 40 de Vida, com penalidade de 20 habitantes. A implementação inicial usa esses valores, prazo de 25 rodadas e recompensa de 2 Gold; o balanceamento permanece sujeito ao teste jogável.

Guardar `vidaReferencia` no anúncio. A queda em uma verificação é `max(0, vidaReferencia - vidaAtual)`. Não somar danos de momentos diferentes. A referência permanece fixa até o desfecho, inclusive se a Vida máxima mudar; essa interação precisa de teste antes de aprovar a regra final.

Exemplo: com referência de 120 de Vida, chegar a 95 representa queda de 25. Curar até 110 reduz a queda para 10; perder 15 depois deixa a queda em 25, embora o personagem tenha sofrido 40 de dano ao todo.

Conferir a queda apenas no fim do prazo, conforme decisão do usuário. Atingir o limite antes disso não confirma a falha nem antecipa a penalidade.

| Vida no vencimento | Exemplo com referência de 120 |
| --- | --- |
| 80 ou menos | A queda alcança pelo menos 40; aplicar a penalidade uma vez. |
| 81 ou mais | A queda fica abaixo de 40; evitar a penalidade e conceder a recompensa pequena. |

Cair a 75 e recuperar até 110 antes do fim evita a falha. A descrição precisa deixar claro que a verificação acontece ao término do prazo.

Recompensa inicial para evitar a Lua Vermelha: +2 Gold. O botão do anúncio não cobra Gold nem compra proteção.

## Definição dos dez eventos

As posições 2 a 7, 9 e 10 têm suas regras aprovadas pelo usuário. A Lua Vermelha e a Vinda do Barão usam os valores iniciais descritos abaixo, adotados na execução. Os números podem mudar após o teste; esta implementação não os registra como novas aprovações do usuário.

| Posição | Nome | Situação |
| --- | --- | --- |
| 1 | A Lua Vermelha | Verificação final e cura confirmadas; implementação inicial de 25 rodadas, queda de 40 de Vida, falha de 20 habitantes e sucesso de 2 Gold. |
| 2 | O Cometa de Cinzas | Aprovado: 50 rodadas; reserva final de 30 Gold; falha causa −20 de Vida e −10 habitantes; sucesso recupera 5 de Vida. |
| 3 | A Nuvem Faminta | Aprovado: praga de gafanhotos; investir 15 Gold em auxílio à vila durante 50 rodadas; falha causa −15 habitantes e −10 de Vida; sucesso concede 5 habitantes. |
| 4 | A Ferrugem Negra | Aprovado: 50 rodadas; aumentar o Escudo inicial em 50%, com aumento mínimo de 2; falha retira 40% da Vida no vencimento, preservando 1 de Vida; sucesso concede 20% do Escudo final como ganho permanente. |
| 5 | Os corvos | Aprovado: ganhar 50 de Honra por decisões em 50 rodadas; sucesso concede o Olhar de Odin por 20 rodadas; falha aplica uma maldição nórdica aleatória por 10. |
| 6 | A Noite do Lamento | Aprovado: 100 rodadas; terminar com 20 habitantes a mais do que no anúncio; falha causa −20 habitantes; sucesso concede 10 habitantes adicionais. |
| 7 | A Procissão sem Rostos | Aprovado: realizar 12 escolhas de auxílio em 50 rodadas; falha causa −20 de Vida e −5 habitantes; sucesso concede permanentemente 10 de Vida máxima e recupera 10 de Vida. |
| 8 | A Vinda do Barão | Implementação inicial, substituindo O Cofre que Respira: ganhar 40 Gold por decisões em 50 rodadas; falha retira metade do Gold disponível e 10 de Vida; sucesso concede 10 Gold. |
| 9 | A Sombra Coroada | Aprovado: para partidas ruins; evitar decisões que concedam Honra durante 25 rodadas; sucesso concede 15% de Ataque; falha retira 20% de Ataque. |
| 10 | A Testemunha de Pedra | Aprovado: para partidas boas; evitar decisões que retirem Honra durante 25 rodadas; sucesso concede 15% de Escudo; falha retira 20% de Escudo. |

### Aprovado: O Cometa de Cinzas

Uma estrela deixa um rastro sobre a vila. Todas as manhãs, cinzas cobrem os telhados, embora ninguém encontre fogo. O aviso anuncia que a queda das cinzas vai adoecer os moradores; a vila precisará de dinheiro para cuidar deles.

O prazo é de 50 rodadas. Verificar o saldo de Gold apenas no vencimento: 30 ou mais evita a penalidade e recupera 5 de Vida, respeitando a Vida máxima; menos de 30 causa a perda conjunta de 20 de Vida e 10 habitantes. Aplicar as proteções habituais da partida, conforme a regra geral de consequências deste PRD.

A condição exige uma reserva, sem descontar os 30 Gold. O jogador pode gastar e recompor o saldo durante o prazo. A falha representa a falta de cuidados para os moradores e o adoecimento do herdeiro ao tentar ajudá-los sem recursos suficientes. No culto, os efeitos de Vida permanecem e habitantes não se transformam em seguidores.

### Aprovado: A Nuvem Faminta

Um lavrador chega com um gafanhoto preso no punho. Outros cobrem as cercas e os telhados; além dos campos, uma nuvem avança contra o vento.

O presságio anuncia uma praga de gafanhotos. Durante 50 rodadas, o jogador precisa investir pelo menos 15 Gold em auxílio à vila, financiando a proteção das plantações e a distribuição de mantimentos. Contabilizar os gastos efetivos das escolhas de auxílio elegíveis após o anúncio; compras pessoais e perdas involuntárias de Gold não contam. O saldo guardado não substitui o investimento.

Verificar o total investido apenas no vencimento. Se atingir 15 Gold, evitar as perdas e conceder 5 habitantes; se não atingir, aplicar a perda conjunta de 15 habitantes e 10 de Vida, respeitando as proteções habituais. Mostrar o progresso no indicador, como 9/15 Gold, sem cobrar outra vez os gastos já feitos.

A implementação identifica as escolhas elegíveis no conjunto `auxilios` de `js/pressagios.js`. A carta Proteção dos moradores oferece auxílio a cada 10 rodadas, enquanto a meta não estiver completa, com prioridade abaixo das consequências agendadas e condições obrigatórias. Esta proposta substitui Os Sinos Enterrados e a versão anterior de A Fome sob a Terra.

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

Levantamento de 6 de novembro de 2026, anterior à inclusão da carta de auxílio, com o catálogo carregado pelo helper `tests/helpers/jogo.cjs`: 384 eventos, com 1.100 opções de escolha, incluindo os conjuntos `poolOpcoes`. Dessas opções, 547 apresentam `efeitos.honra` positivo, com média de aproximadamente 2,19 pontos entre as escolhas positivas. Os valores mais comuns são +1 e +2, que aparecem em 386 dessas 547 opções.

Com essa média, 50 pontos equivalem a cerca de 23 escolhas positivas em 50 rodadas. Essa conta é uma referência de esforço; não representa a média de Honra de partidas reais e não considera todos os custos, testes de sorte ou consequências das decisões.

Como conferência adicional, o levantamento avaliou o potencial das cartas comuns elegíveis nas rodadas 26 a 75, ponderadas pelos pesos da engine. Em cenários de Honra inicial −30, 0 e +30, com 70 habitantes e saldos fixos de 5, 15 ou 30 Gold, escolher sempre o maior ganho direto disponível resultou em potencial estimado entre 98 e 103 pontos em 50 rodadas. Esse cálculo mantém os atributos dos cenários fixos e exclui cartas especiais e letais; não simula uma partida completa, a memória das cartas nem o avanço das cadeias.

A meta aprovada de 50 usa aproximadamente metade desse potencial estimado, deixando espaço para decisões de sobrevivência. As simulações da execução constam ao fim deste documento; elas não substituem o teste jogável de balanceamento.

#### Desfechos aprovados

No sucesso, conceder o Olhar de Odin durante 20 rodadas: revelar o valor de Honra do herdeiro e o número de habitantes. Usar como referência a variante da bênção de Odin que revela os dois atributos, sem cobrar o sacrifício da carta. A recompensa substitui os 2 Gold sugeridos antes; não concede o item Corvo da estrada, cujo efeito é acrescentar Gold às recompensas.

Na falha, sortear uma das dez maldições nórdicas do catálogo, usando seu efeito básico durante 10 rodadas. O sorteio e a aplicação acontecem uma vez no desfecho; carregar o save não troca a maldição. Essa consequência substitui a perda de 10 habitantes da proposta anterior.

O efeito do presságio ocupa uma fonte própria, com prazo independente, sem substituir a bênção ou maldição da carta nem a passiva diária do Herdeiro Nórdico. Redução de cura usa presença do efeito e não acumula a mesma restrição duas vezes. Manutenção, efeitos periódicos e expiração executam uma vez por rodada real. Os desfechos não abrem outra carta nórdica nem consomem rodada adicional.

### Aprovado: A Noite do Lamento

Um viajante conta que, na aldeia além do rio, os primogênitos morreram na mesma noite. Outras famílias chegam atrás dele, carregando os filhos e trazendo nas roupas o sangue com que marcaram suas portas.

A narrativa adapta a referência à morte dos primogênitos nas pragas do Egito ao mundo do jogo. A preparação representa acolher famílias que fogem da ameaça e tornar a vila um refúgio.

Guardar o número de habitantes no anúncio. Ao fim de 100 rodadas, exigir pelo menos 20 habitantes a mais do que essa referência: uma vila com 50 precisa terminar com 70; uma com 100 precisa terminar com 120. Novas chegadas compensam perdas durante o prazo, pois a condição usa a população no vencimento, sem somar apenas os ganhos.

Na falha, aplicar a perda de 20 habitantes, respeitando as proteções habituais. No sucesso, conceder 10 habitantes adicionais após verificar a meta. Tanto a meta quanto os desfechos usam valores fixos, conforme a preferência do usuário por simplificar a contagem.

Esta versão substitui O Exército sem Pegadas e as propostas intermediárias A Névoa dos Ausentes e As Casas Marcadas. O culto não recebe esse presságio no sorteio natural; uma conversão durante o acompanhamento cancela a ocorrência, registra o histórico e começa o intervalo, sem prêmio nem penalidade.

### Aprovado: A Procissão sem Rostos

Uma procissão atravessa a estrada com velas apagadas. Quando os vigias se aproximam, as figuras erguem a cabeça; sob os capuzes, não há olhos nem boca.

A procissão retorna todas as noites, parando diante das casas de quem pediu ajuda e não recebeu.

Durante 50 rodadas, realizar pelo menos 12 escolhas de auxílio aos moradores. Contar cada decisão elegível uma vez, incluindo auxílios que não cobram Gold, como socorrer feridos ou proteger moradores. O indicador mostra o progresso, por exemplo, 6/12 auxílios. A condição conta ações após o anúncio, sem considerar decisões anteriores.

No vencimento, verificar o total. Se houver menos de 12 auxílios, aplicar a perda conjunta de 20 de Vida e 5 habitantes, respeitando as proteções habituais. Se houver 12 ou mais, aumentar permanentemente a Vida máxima em 10 e depois recuperar 10 de Vida, respeitando o novo máximo. Salvar a resolução para impedir a repetição da recompensa ao carregar.

A implementação precisa marcar as escolhas elegíveis e garantir oportunidades suficientes durante o prazo. Durante a Procissão, a carta Proteção dos moradores reaparece com intervalo de 10 rodadas; outras escolhas elegíveis completam a meta. A contagem pode compartilhar a identificação dos auxílios com A Nuvem Faminta, mas cada condição mantém sua unidade: decisões para a Procissão e Gold efetivamente gasto para a Nuvem.

### Implementação inicial: A Vinda do Barão

Um mensageiro de estandarte cinzento entrega uma carta selada. O barão virá à vila, e os soldados que o acompanham já recolhem provisões nas aldeias do caminho.

O usuário pediu uma narrativa relacionada ao Barão no lugar do cofre. A referência vem dos eventos existentes `barao` (O cobrador do barão, em `js/events.js`) e `volta_do_barao` (A volta do barão, em `js/events-vila.js`), que usam estandartes cinzentos e cobranças de tributo.

A preparação econômica usa a proposta anterior: conquistar 40 Gold por decisões durante 50 rodadas. Contar ganhos efetivos de negociações e recompensas das escolhas após o anúncio, sem incluir renda automática. O jogador pode gastar os ganhos depois; a condição acompanha o total conquistado, não o saldo final. O texto da condição explica essa diferença, sem anunciar uma cobrança automática de 40 Gold.

Na falha, o séquito saqueia metade do Gold disponível, arredondando a perda para cima, e causa 10 de dano ao herdeiro. No sucesso, comerciantes voltam a negociar com a vila após a passagem dos soldados, concedendo 10 Gold. Os valores iniciais seguem para avaliação no teste jogável.

Durante esse presságio, as cartas `barao` e `volta_do_barao` saem temporariamente dos candidatos do sorteio comum. Após a resolução, voltam a obedecer às condições normais. O presságio não agenda batalha ou cobrança adicional.

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

A contagem usa a intenção da escolha antes das proteções da Heroína do povo ou dos itens que neutralizam Honra. A regra aparece na descrição e evita sucesso automático por imunidade. Essa decisão técnica adotada na execução continua sujeita ao teste jogável.

O sorteio comum exige pelo menos uma opção compatível e considera os dois desfechos de testes de sorte. Se uma carta obrigatória não oferecer nenhuma saída compatível, sua escolha não registra violação. A contagem não obriga o jogador a aceitar um resultado impossível de evitar.

Cada proposta deve explicar o que o jogador pode fazer para se preparar com as escolhas e recursos existentes. Evitar dez variações de perder Vida; incluir condições que mudem a forma de gastar recursos ou proteger a vila. Uma condição que dependa apenas de receber uma carta rara oferece pouca capacidade de reação.

Penalidades respeitam as proteções habituais dos herdeiros e do celeiro. A Noite do Lamento, cuja condição e desfechos dependem somente de habitantes, fica fora do sorteio natural durante o culto. Os demais preservam seus efeitos declarados: habitantes não se convertem em seguidores. O debug pode abrir qualquer caso para inspeção.

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

## Critérios de aceite e validação

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

Os testes de estado e controlador cobrem frequência, limites de prazo, salvamento, condições, efeitos nórdicos, decisões morais, culto e visitas do Leste. As simulações ao fim deste documento registram anúncios e desfechos por herdeiro; seus limites impedem um ajuste automático dos valores.

A conferência da interface usa Edge com Playwright em desktop e celular emulado, além da inspeção visual das capturas. O teste jogável de balanceamento e a conferência em um celular físico continuam pendentes.

Validação da entrega: 172 testes passaram, incluindo 15 específicos de presságios; lint, formatação e conferência de diferenças passaram. O navegador carregou as dez artes e abriu os dez anúncios em 1440 × 1000 e 390 × 844 com toque emulado. Recargas no anúncio e no desfecho, retorno sem repetir efeitos, indicador, foco por teclado, movimento reduzido e imagem ausente passaram, sem erros de JavaScript ou transbordamento horizontal. O relatório está em [PRESSAGIOS-INTERFACE-VALIDACAO.json](PRESSAGIOS-INTERFACE-VALIDACAO.json).

## Decisões adotadas na execução

| Decisão | Regra implementada |
| --- | --- |
| Frequência | 2%, primeira oportunidade na rodada 25, intervalo de 50 e limite de três; uma tentativa por rodada e sem repetição natural. |
| Lua Vermelha | 25 rodadas, queda final de 40 de Vida, falha de 20 habitantes e sucesso de 2 Gold. |
| Barão | 40 Gold conquistados por decisões em 50 rodadas; as duas cartas comuns do Barão aguardam o desfecho. |
| Caminhos morais | Intenção antes das imunidades; cartas comuns precisam oferecer saída compatível. Escolha obrigatória sem alternativa compatível não registra violação. |
| Os corvos | Fonte nórdica própria; preserva o efeito da carta e a passiva diária. Odin dura 20 rodadas reais, maldições básicas duram 10. |
| Auxílio à vila | 34 pares de evento/opção identificados; Proteção dos moradores reaparece a cada 10 rodadas na Nuvem Faminta e na Procissão, abaixo das consequências obrigatórias. Pagamento de 1 Gold ou trabalho de 2 de Vida contam como auxílio; adiar não conta. |
| Culto | Noite do Lamento não entra naturalmente durante o culto e cancela na conversão. Nenhum efeito troca habitantes por seguidores. |

Os parâmetros iniciais de Lua Vermelha, frequência e Barão ainda precisam da avaliação do usuário em jogo. As regras de integração acima tornam a primeira versão testável sem alterar as porcentagens e metas aprovadas dos outros eventos.

## Resultados das simulações

O relatório [PRESSAGIOS-SIMULACAO.json](PRESSAGIOS-SIMULACAO.json) reúne dois ensaios com sorteador congruente linear reproduzível: `s = (1664525 * s + 1013904223) mod 2^32`, usando `s / 2^32` como resultado. Para reproduzir, executar `node scripts/simular-pressagios.cjs` na raiz do projeto; o script usa a engine real pelo helper de testes e regrava o relatório.

No ensaio de frequência, 2.000 calendários percorreram as 300 rodadas com Honra neutra e recursos mantidos para evitar derrotas. As sementes foram de 1 a 2.000. O sorteio real e os prazos dos presságios rodaram sem forçar anúncios; os recursos estáveis isolam o calendário, portanto esse ensaio não mede sobrevivência ou dificuldade. A distribuição ficou em 14 calendários sem anúncio, 407 com um, 1.444 com dois e 135 com três, média de 1,85 por crônica. Nenhum prazo ultrapassou a rodada 300.

O segundo ensaio executou três partidas por herdeiro, com recursos normais, cartas reais e sementes `n * 18973 + índiceDoHerdeiro`, para `n` de 1 a 3. A política prioriza Vida quando baixa, Gold, população e melhorias de combate; evita combates quando há alternativa e dá peso extra à meta do presságio. Ela não planeja cadeias ou compras. O fluxo concluiu as 27 partidas, com uma vitória e 14 anúncios: nove sucessos de presságios, nenhuma falha concluída e cinco acompanhamentos interrompidos pela derrota. Os dados por herdeiro estão no relatório.

Essa amostra pequena e a política de escolha não permitem aprovar o equilíbrio das penalidades. A frequência fica verificada; a taxa de falha por herdeiro requer partidas jogadas por pessoas ou um simulador com planejamento melhor.

## Checklist de entrega

- [x] Registrar as aprovações das posições 2 a 7, 9 e 10, separando decisões confirmadas de sugestões.
- [x] Incorporar recompensa pequena, durações variáveis e queda de Vida relativa à referência inicial.
- [x] Registrar verificação no fim do prazo, possibilidade de cura e indicador ao lado de Inventário e Cronologia.
- [x] Registrar a direção visual própria dos presságios, com vermelho para indicar perigo.
- [x] Conferir calendário, avanço de rodada e integração com os herdeiros no código atual.
- [x] Especificar anúncio, retorno, salvamento e debug.
- [x] Ampliar o catálogo para dez e propor dois novos presságios para caminhos morais diferentes.
- [x] Definir os dez eventos e adotar valores iniciais para as decisões de balanceamento pendentes.
- [x] Implementar módulo, estado, engine, controlador, indicador e salvamento com migração.
- [x] Integrar culto, visitas do Leste e fonte nórdica própria, sem consumir dias extras.
- [x] Produzir as dez artes em WebP e incorporar as revisões pedidas pelo usuário.
- [x] Implementar debug dos dez casos, inspeção, desfechos reais e limpeza sem recompensa.
- [x] Testar regras, recargas, limites de prazo e penalidades que levam à derrota ou à decisão de culto.
- [x] Simular frequência em 2.000 calendários e executar 27 partidas automáticas com os nove herdeiros.
- [x] Conferir a interface no navegador em desktop e celular emulado, inspecionar as capturas e registrar as validações finais.
- [ ] Avaliar o balanceamento em partidas jogadas pelo usuário e conferir um celular físico.

Resultado: dez presságios implementados, com artes próprias, preparação durante a partida e debug. Validações: 172 testes, lint, formatação, diferenças e interface em desktop/celular emulado passaram. O balanceamento jogável e a conferência em celular físico permanecem em aberto; os resultados automáticos e os limites da amostra estão registrados acima.
