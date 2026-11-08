# PRD: Combate com dados e herdeiros

Data: 8 de novembro de 2026.

Estado: as duas levas estão implementadas. Os retratos do Coringa e do Bruxo seguem pendentes por decisão do usuário; até lá, a interface usa `assets/selo.svg`. A interface ainda precisa de conferência manual em desktop e celular, e o balanceamento pede uma partida completa. Testes automatizados e lint passaram; a formatação passou nos arquivos alterados, enquanto a checagem geral também aponta arquivos de base sem alteração.

## Objetivo

Na abertura deste PRD, o combate com d20 já tinha entrado no commit `2e84537` (rolagem, rerrolagem por item, painel de disputa e conquistas de dado natural), mas ainda faltavam integração com herdeiros, testes, atualização do tutorial e ajuste do escalonamento. Esta especificação guiou as correções e o conteúdo novo:

- Dois herdeiros ligados aos dados (O Coringa e O Bruxo) e um buff para o Doente.
- Três itens de dado e três traços de inimigo que dão variedade sem arte nova.
- Doze cartas de combate novas, com uma pausa mínima de 4 rodadas entre batalhas.
- Um escalonamento refeito, já que na rodada 100 os inimigos estão 10 pontos mais fortes e um herdeiro com Ataque 5 cai para 12,2% de vitória.
- A carta do velho cego resolvida por rolagem em vez de por porcentagem escondida.

A medida-base, com um herdeiro de atributos padrão (1d20, Ataque 2, 120 Vida), é a média simples entre os 18 combates do catálogo:

| Cenário | Vitória na rodada 1 | Vitória na rodada 50 | Vitória na rodada 100 |
| --- | --- | --- | --- |
| Base | 35% | 17,4% | 6,4% |
| Base com Ataque 5 | 48,7% | 27,1% | 12,2% |
| Doente com −1 na Defesa inimiga | 39,4% | 20,3% | — |
| Bruxo: inimigo rola 1 dado a mais e fica com o menor | 59% | 38% | — |
| Coringa: média do pool de seis faces | 47% | 28% | — |
| Trevo: +5 no resultado final | 57,8% | 35% | 17,4% |

## Regras confirmadas

| Assunto | Regra |
| --- | --- |
| O Bruxo, desvantagem | O inimigo sempre rola um dado a mais e fica com o menor resultado, em toda batalha. |
| O Bruxo, escopo | Nada além disso muda além de menos Vida e menos Escudo. Escudo −1, literal (5 → 4). |
| O Coringa | Sorteia um efeito de dado no início de cada batalha, que vale só para aquela batalha. |
| O Doente | Ganha um bônus que enfraquece os inimigos em combate, já que hoje ele só tem desvantagens. −1 na Defesa, conforme decidido. |
| Itens de dado | Três novos: dado viciado (mínimo 5), dado que rerrola um dado e trevo (+5 no resultado final). |
| Efeito do trevo | +5 no resultado final da rolagem, sempre (decisão do usuário sobre a forma medida de 19/20). |
| Dado de osso novo | Item separado, com outro nome, coexistindo com o Par de dados de osso atual. |
| Traços de inimigo | Veloz, cego e feroz como modificadores por batalha, sem arte nova. |
| Cartas novas | 12, no contexto dos combates, reaproveitando as artes de batalha existentes. |
| Frequência | Deixar como está (peso 3 + pausa de 4); se o teste jogável pedir mais, aumenta depois. |
| Pausa entre batalhas | No mínimo 4 rodadas entre uma batalha e a seguinte. |
| Escalonamento | Candidato B: Defesa +4 e dano +8 no teto. |
| Itens "Ataque ≥ Defesa" | Referência à versão antiga do jogo; no código atual Adaga, Lança e Cinto já resolvem por automático. Sobra corrigir o tutorial. |
| Carta do velho cego | Passa a resolver por rolagem oposta visível (1d20 cada, empate para o velho). Aprovada. |
| Vida do Doente | 90 é o canônico; seleção e painel já mostram esse valor. |
| Nomes dos itens | Pensar depois; fora desta especificação. |

## Valores iniciais

| Assunto | Valor adotado | Situação |
| --- | --- | --- |
| Vida e Escudo do Bruxo | 70 de Vida (padrão 120) e 4 de Escudo (−1 literal, confirmado) | Decisão fechada do usuário. |
| Bônus do Doente | −1 na Defesa de todos os inimigos | Decisão fechada; medido: 39,4% na rodada 1 e 20,3% na rodada 50. |
| Pool do Coringa | Seis faces, incluindo uma face sem efeito | Implementado; validar a frequência dos efeitos em partidas. |
| Cartas novas | 12 cartas de combate, peso 3 cada | Decisão fechada; ver a seção de frequência. |
| Frequência | Manter peso 3 + pausa de 4 (~9,2 batalhas por crônica) | Decisão fechada: deixar como está e aumentar só se o teste pedir. |
| Pausa | 4 rodadas inteiras entre batalhas | Decisão fechada. |
| Traços de inimigo | 60% nenhum, 15% veloz, 15% cego, 10% feroz | Inicial, ajustar no teste. |
| Escalonamento | Candidato B: Defesa +4 e dano +8 no teto | Decisão fechada; medido: 20,3% e 30,9% nas rodadas 50 e 100. |
| Arte das 12 cartas | Reaproveitar o acervo de batalha existente (`assets/batalha.webp`) | Decisão fechada. |
| Nomes e raridade dos itens | A definir depois | Decisão fechada: fora desta especificação. |
| Velho cego | Rola oposta, 1d20 cada, empate para o velho | Decisão fechada: "está ótimo". |
| Vida do Doente | 90 (canônico) | Decisão fechada; corrigir as descrições que prometem 70. |

## O Bruxo

Traduzir "desvantagem" para este sistema exige cuidado, porque a desvantagem clássica (rolar dois, ficar com o menor) não faz nada quando o inimigo rola um dado só: o menor de um dado é o próprio dado. **12 dos 18 inimigos do catálogo rolam exatamente um dado**; só `desertores`, `fera_da_floresta`, `cavaleiro_de_osso`, `cacador_de_hereges`, `nemesis_da_memoria` e `calice_no_pantano` rolam dois. Com a leitura ingênua, o Bruxo daria 0 ponto percentual de vantagem na maioria das batalhas, o que medimos como 35% contra 35% na rodada 1.

A regra aprovada resolve isso: o inimigo rola `dadosInimigo + 1` dados e fica com o menor. O efeito passa a valer em todas as batalhas e leva a vitória de 35% para 59% na rodada 1 e de 19% para 38% na rodada 50. O contraponto decidido é literal: 70 de Vida e **−1 de Escudo** (5 → 4).

Comportamento implementado:

- `perfilCombate` informa quantos dados o inimigo rola, e o save valida essa quantidade.
- `resolverCombate` usa `Math.min` sob desvantagem; a interface marca e descreve o menor dado.
- Cartas com `forcarDerrota` preservam a derrota independente dos dados mostrados.
- A regra vale em todas as batalhas do Bruxo, sem acumular por batalha.

## O Coringa

Um d6 é rolado em `iniciarCombate` (`js/engine.js:1481`) e guardado em `run.combatePendente.coringa`, antes da rolagem dos dados. Sortear antes é o que deixa o jogador decidir os itens de preparação sabendo o efeito que vai receber.

| Face | Efeito | Mecanismo existente | Vitória r1 | Vitória r50 |
| --- | --- | --- | --- | --- |
| 1 | +1 dado neste combate | `efeitosPreparados.bonusDadosCombateProximaBatalha` | 50% | 30% |
| 2 | +2 Ataque neste combate | `efeitosPreparados.bonusAtaqueProximaBatalha` | 44% | 26% |
| 3 | Desvantagem no inimigo | mesma regra do Bruxo | 59% | 38% |
| 4 | Uma rerrolagem grátis | caminho de rerrolagem, sem item | 56% | 34% |
| 5 | −1 na Defesa inimiga | mesmo ajuste do Doente | 39% | 22% |
| 6 | Nenhum efeito | a rolagem já é o evento | 35% | 19% |

Os efeitos de `efeitosPreparados` já são zerados ao fim do combate em `js/engine.js:893-900`; nenhum reset manual. A face 6 existe para o traço não virar bônus garantido: sem ela, a média do pool sobe de 47% para 50% na rodada 1.

Implementação atual:

- **Rerrolagem grátis:** a face 4 libera uma rerrolagem do conjunto inteiro, uma vez naquela batalha; o uso conta para a conquista de vitória com rerrolagem.
- **Desvantagem pontual (face 3):** usa a regra do Bruxo. As fontes somam até dois dados extras; uma terceira reduz a Defesa inimiga em 1.
- **Informação no painel:** a face sorteada e seu efeito aparecem antes da rolagem.

## O Doente

Os inimigos não têm Ataque; a soma deles é `dado + Defesa`. "Diminuir o ataque dos inimigos" vira, portanto, −1 na Defesa, matematicamente idêntico a −1 no dado do inimigo, conforme decisão do usuário. O ganho medido é de 35% para 39,4% na rodada 1 e de 17,4% para 20,3% na rodada 50 — modesto de propósito, já que o Doente já carrega desvantagens pesadas.

O ajuste está em `batalhaAjustada` (`js/engine.js`), antes do retorno antecipado para as rodadas iniciais. Assim o bônus já vale desde a primeira batalha.

## Itens de dado

Três itens novos, medidos contra a base de 35% na rodada 1 e 6,4% na rodada 100:

| Item | Raridade inicial | Efeito | Rodada 1 | Rodada 100 |
| --- | --- | --- | --- | --- |
| Trevo | a definir com os nomes | +5 no resultado final da rolagem, sempre | 57,8% | 17,4% |
| Dado viciado (nome provisório) | a definir com os nomes | Seus dados nunca ficam abaixo de 5; rolagens menores são repetidas | 43% | 8% |
| Dado lascado | a definir com os nomes | Rerrola o menor dado do seu conjunto, uma vez por combate | 56,5% | 12,2% |

O trevo com +5 fixo é o mais forte dos três: leva de 35% para 57,8% na rodada 1 e dobra a chance na rodada 100. Como o usuário decidiu deixar nomes e raridades para depois, a raridade final precisa acompanhar esse poder medido.

Os três convivem com o catálogo atual: o Par de dados de osso mantém os +2 dados, o Dado do destino mantém a rerrolagem do conjunto inteiro e o Dado da linhagem mantém o dado permanente. O Dado lascado rende menos que o Dado do destino em heróis de vários dados, porque só rerrola a menor face; para o herdeiro de 1 dado, os dois têm o mesmo efeito.

Regras de implementação:

- O mínimo de 5 vale **só nos dados do herói**: `rolarDado20` (`js/engine.js:771-777`) é compartilhado com o inimigo, então a repetição da rolagem entra no caminho do herói em `rolarCombate` e em `resolverCombate`, não na função comum.
- O +5 do trevo entra **no final do resultado** (soma dos dados + Ataque), antes da comparação com o total inimigo, em toda rolagem; a contagem de `dadosNaturais20Combate` continua usando o valor bruto do dado.
- O Dado lascado aparece na seção "Itens de rerrolagem" do painel (`js/ui.js:1838`), junto do Dado do destino, só quando o resultado estiver visível e não for `forcarDerrota`.
- Itens de dado valem em combate; a rolagem do velho cego é independente deles.

## Traços de inimigo

Cada batalha sorteada recebe um traço, que aparece como etiqueta ao lado do nome do inimigo no painel. A regra é sempre sobre a batalha, nunca sobre a carta, o que dá variedade sem produzir arte.

| Traço | Peso | Regra | Efeito medido |
| --- | --- | --- | --- |
| (nenhum) | 60% | Como hoje. | — |
| Veloz | 15% | O empate no total passa a favorecer o inimigo; hoje o herói leva o empate. | Tira do herói cerca de 4 pontos, que é a chance de empate das rolagens. |
| Cego | 15% | O inimigo rola um dado a mais e fica com o menor, a mesma regra do Bruxo. | +24 pontos na rodada 1; a batalha fica fácil, e é isso que se espera de um alvo cego. |
| Feroz | 10% | +6 de dano antes do Escudo somente em derrota. | Torna a derrota mais perigosa sem cobrar vida pela vitória. |

A distribuição de pesos e o valor do dano do Feroz são iniciais. A vitória não causa dano de combate; dano de cartas e do traço Feroz só é aplicado em derrotas. Regras de composição: o traço é sorteado em `iniciarCombate` junto da face do Coringa e guardado em `combatePendente`; cartas com `forcarDerrota` ficam de fora do sorteio de traço; desvantagem do Bruxo, do Cego e da face 3 do Coringa somam um dado a mais cada, até dois. O traço precisa aparecer antes da rolagem, senão o jogador não sabe que a batalha é fácil ou perigosa.

## Escalonamento

Hoje `batalhaAjustada` (`js/engine.js:331-347`) cresce a Defesa em +1 a cada 10 rodadas (mais +1 a cada 20 depois da rodada 30), com teto em +10, e o dano em +2 por estágio com teto em +20. O teto de Defesa é atingido por volta da rodada 91. Resultado medido, média dos 18 combates:

| Rodada | Ataque 2, atual | Ataque 5, atual | Ataque 2, cand. A (+6/+12) | Ataque 5, cand. A | Ataque 2, cand. B (+4/+8) | Ataque 5, cand. B |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 35% | 48,7% | 35% | 48,7% | 35% | 48,7% |
| 50 | 17,4% | 27,1% | 17,4% | 27,1% | 20,3% | 30,9% |
| 100 e depois | 6,4% | 12,2% | 14,7% | 23,6% | 20,3% | 30,9% |

A curva atual confirma a reclamação do usuário: com Ataque 5 sobem a 12,2% na rodada 100 e lá ficam. O candidato A derruba os tetos para +6 de Defesa e +12 de dano; o candidato B, para +4 e +8. Os dois param de crescer por volta da rodada 60, o que é proposital: depois disso o progresso do herói (itens, dados permanentes, Ataque de equipamento) é quem dita a curva, e essa progressão não está modelada nas contas acima. **O candidato B é o adotado, por decisão do usuário.**

O dano escalonado se aplica somente à derrota. Com o candidato B, `bonusDano` vai para +8, na mesma proporção do teto de Defesa; vitórias não retiram Vida.

## Cartas novas e pausa entre batalhas

Doze cartas de batalha novas entram com peso 3, e o sorteio ganha uma regra de pausa: depois de uma batalha resolvida, nenhuma outra batalha pode ser sorteada nas 4 rodadas seguintes (`run.rodada - run.ultimaBatalhaRodada < 4` bloqueia candidatos com `batalha`).

Medição com o sorteio real da engine, 40 crônicas por variante, semente reprodutível:

| Variante | Batalhas por crônica (média) | Mediana | Mínimo | Máximo |
| --- | --- | --- | --- | --- |
| Hoje | 5,9 | 6 | 2 | 10 |
| 12 cartas peso 2 + pausa 4 | 8,1 | 8 | 4 | 14 |
| 12 cartas peso 2, sem pausa | 10,3 | 10 | 5 | 16 |
| 12 cartas peso 3 + pausa 4 | 9,2 | 9 | 4 | 14 |
| Peso extra de 54 + pausa 3 | 11,9 | 12 | 8 | 15 |
| Peso extra de 72 + pausa 4 | 11,9 | 12 | 8 | 16 |

A pergunta do usuário foi se 8 batalhas em 300 rodadas não ficam pouco para sustentar as mecânicas novas. O peso 3 com pausa de 4 responde a isso: mediana de 9, e nenhuma das 40 crônicas simuladas ficou abaixo de 4. A pausa faz diferença real: sem ela a variante de peso 3 passa de 10 e aceita sequências de duas batalhas seguidas, que era justamente o que a pausa existe para evitar. Decisão do usuário: **deixar como está**; se o teste jogável mostrar que é pouco, aí sim aumenta.

Detalhes de implementação:

- `resolverCombate` grava `run.ultimaBatalhaRodada`; `sortear` filtra batalhas nas quatro rodadas seguintes. Consequências agendadas e presságios não sofrem a pausa.
- `debugSempreCombate` ignora a pausa para permitir a inspeção de batalhas.
- O save normaliza `ultimaBatalhaRodada` com valor padrão 0 e valida o tipo.
- Arte: decisão fechada — as 12 cartas reaproveitam o acervo de batalha existente (hoje em sua maioria `assets/batalha.webp`). Nenhuma ilustração nova nesta leva; `docs/MEMORIA-ILUSTRACOES.md` só será lida quando os retratos dos dois herdeiros forem produzidos.

### As 12 cartas

Cartas implementadas para cobrir os traços e itens novos (Defesa de 2 a 7, mistura de 1 e 2 dados inimigos, três com saída que evita a luta):

| Carta | Premissa | Perfil |
| --- | --- | --- |
| Cães famintos | Uma matilha entra no terreiro atrás do gado. | 1 dado, Defesa 2, rodada 1+ |
| Os náufragos | Sobreviventes de um naufrágio exigem provisões. | 1 dado, Defesa 3, rodada 1+, paga e vai embora |
| A carroça virada | Emboscada na estrada, com a carga espalhada. | 1 dado, Defesa 4, rodada 1+, divide a carga e evita a luta |
| O bando da tocha | Linchadores de uma aldeia vizinha chegam à vila. | 1 dado, Defesa 4, rodada 10+ |
| O cavaleiro sem senhor | Sem bandeira e sem patrão, corta quem atravessa. | 1 dado, Defesa 5, rodada 15+, rendição possível |
| As almas do pântano | Figuras de lama saem da margem na madrugada. | 2 dados, Defesa 4, rodada 20+ |
| Os arqueiros da colina | Flechas antes de qualquer palavra. | 1 dado, Defesa 6, rodada 25+ |
| O capitão dos salteadores | O bando tem nome, e ele cobra pedágio de sangue. | 2 dados, Defesa 6, rodada 30+ |
| O morto da estrada | Um corpo de pé bloqueia a ponte. | 2 dados, Defesa 5, rodada 35+ |
| Os feridos da guerra | Desertores feridos atacam por instinto. | 1 dado, Defesa 5, rodada 12+ |
| O gigante do fosso | Algo enorme mora onde a estrada afunda. | 2 dados, Defesa 7, rodada 50+ |
| Os cavaleiros negros | Armadura sem insígnia, ordem sem justiça. | 2 dados, Defesa 7, rodada 60+ |

Os textos seguem a skill de escrita do projeto e o ritmo das cartas de batalha existentes: cena curta, informação objetiva, desfechos com custo dos dois lados.

## O velho dos dados

`dados_do_velho` (`js/events-lethal.js:470-524`) e `revanche_dados` (linhas 525-564) agora usam uma disputa visível: cada lado rola um d20, empate favorece o velho; na revanche, ele soma +1. As chances são 47,5% e 42,75%, respectivamente. As faces e os totais ficam registrados no resultado para continuar visíveis depois de salvar ou recarregar.

Você e o velho rolam 1d20 cada, o maior leva e o empate é dele. Isso dá 47,5% na aposta de ouro (hoje 50%) e 42,75% na aposta de sangue, com o velho rolando com +1 (hoje 45%).

Implementação: a rolagem acontece na resolução da escolha, sem fase pendente; o resultado salvo guarda as duas faces e o bônus do velho, e a tela usa o mesmo d20 visual do combate. A carta do velho continua fora dos itens de dado.

## Registro dos herdeiros e arte

Quase tudo é automático a partir de `novos` em `js/herdeiros.js`: `todos` e `desbloqueaveis`, `TRACOS_VALIDOS` do save, legado, atributos iniciais, nomes, descrições da interface e listas de conquistas. Os desbloqueios novos são avaliados durante a crônica: o Coringa exige um 20 natural em qualquer dado de combate; o Bruxo exige oito vitórias na mesma crônica. Os testes cobrem ambas as condições e seus atributos.

1. A entrada em `novos` com `nome`, `descricao`, `desbloqueio` e `iniciais` (o Bruxo leva `hp: 70` e `escudo: -1`).
2. O nome próprio em `nomes` (`js/herdeiros.js:26`).
3. A condição de desbloqueio em `condicoes` (`js/herdeiros.js:39`).
4. Os retratos em `retratos` (`js/ui.js`); enquanto não há arquivo de arte, a interface usa o selo existente.
5. A arte fica para depois, conforme pedido do usuário. Quando essa etapa começar, consultar `docs/MEMORIA-ILUSTRACOES.md`; retratos devem seguir o formato e as dimensões registrados ali.

O documento `docs/HERDEIROS-FUTUROS.md` cobra os nove pontos de registro em um único commit, com testes verdes no final. Vale seguir à risca: um traço fora da lista vira `corajoso` na carga do save (`js/save.js:575`) e o herdeiro novo simplesmente não aparece na crônica.

## Textos e interface

O tutorial em `js/ui.js` descreve a comparação dos totais dos dados com Ataque e Defesa, além dos efeitos do Coringa, do Bruxo e das rerrolagens. Adaga amaldiçoada, Lança do Herói e Cinto dos ventos continuam com sucesso automático, conforme as regras atuais.

Decisão do usuário: **90 de Vida é o canônico** de Doente e do Menino da Crônica. As descrições da seleção e do jogo agora correspondem aos valores em `js/state.js`.

## Estado persistente

| Campo | Onde | Validação |
| --- | --- | --- |
| `combatePendente.coringa` | face 1 a 6, número inteiro | Implementado e validado em `js/save.js`. |
| `combatePendente.rerrolagemCoringa` | cargas restantes da face 4 | Implementado; aceita 0 ou 1. |
| `combatePendente.tracoInimigo` | `veloz`, `cego`, `feroz` ou vazio | Implementado com lista fixa. |
| `run.ultimaBatalhaRodada` | rodada da última batalha resolvida | Implementado com default 0 e validação de inteiro não negativo. |
| `perfil.dadosInimigo` com desvantagem | contagem rolada maior | Implementado; o save compara o tamanho do conjunto com o perfil. |
| `efeitosPreparados` | bônus de combate registrados | Defaults e validação por campo implementados. |

O validador não faz whitelist de chaves, então campos extras sobrevivem à carga, mas o padrão do projeto é registrar tipo e default nos dois lugares.

## Testes e debug

`tests/combate.test.cjs` cobre as disputas, modificadores dos herdeiros e inimigos, itens, pausas, escalonamento, cartas novas e o duelo do velho cego. `tests/herdeiros-prioritarios.test.cjs` verifica atributos, saves e condições de desbloqueio do Coringa e do Bruxo. A rolagem usa sequências determinísticas de `tests/helpers/jogo.cjs`.

Cobertura implementada: desvantagem do Bruxo rola dados extras e decide pelo menor; Doente aplica −1 na Defesa desde a rodada 1; cada face do Coringa produz o efeito declarado; traços de inimigo, pausa, escalonamento, itens, duelo do velho e saves têm testes. A suíte também verifica as 12 cartas, desbloqueios e atributos dos herdeiros.

O debug `debugSempreCombate` força cartas de combate sem `forcarDerrota`; controles de debug também permitem definir a face do Coringa e o traço inimigo para inspecionar os efeitos.

## Critérios de aceite e validação

| Verificação | Resultado esperado |
| --- | --- |
| Bruxo em batalha contra inimigo de 1 dado | O inimigo rola 2 dados e fica com o menor; o painel destaca o menor. |
| Bruxo em batalha contra inimigo de 2 dados | O inimigo rola 3 dados e fica com o menor. |
| Save no meio da disputa do Bruxo | Recarregar mantém os dados rolados e a validação passa. |
| Coringa | A face sorteada aparece antes da rolagem, vale só naquela batalha e some depois. |
| Coringa, rerrolagem grátis | O botão aparece uma vez sem item e some ao usar ou ao concluir. |
| Doente | A Defesa inimiga aparece 1 ponto menor já na rodada 1 e nos estágios avançados. |
| Traços | A etiqueta aparece antes da rolagem; Veloz decide o empate para o inimigo; Feroz cobra 6 a mais. |
| Itens de dado | Viciado não deixa o dado do herói abaixo de 5 e não mexe no dado do inimigo; trevo soma 5 no resultado final sempre; lascado rerrola só a menor face. |
| Pausa | Duas batalhas ficam a pelo menos 4 rodadas de distância; `debugSempreCombate` ignora a regra. |
| Escalonamento | Na rodada 100, herói com Ataque 5 fica em torno de 31% com o candidato B, em vez de 12,2%. |
| Velho cego | Os dois dados aparecem no desfecho e as chances ficam em 47,5% e 42,75%. |
| `barao` | Derrota segue forçada; nenhum efeito ofensivo nem traço vira vitória. |
| Frequência | Repeti a medição das 40 crônicas com os pesos novos e a média ficou perto de 9,2. |
| Tutorial | O texto novo menciona dados, totais e rerrolagem. |
| Herdeiros | Aparecem na seleção, destravam pela condição, salvam e recarregam. |
| Regressão | Suíte completa e lint verdes; Prettier conferido nos arquivos alterados. A checagem geral lista arquivos de base que já estavam fora do formato. |

## Checklist de entrega

- [x] Confirmar a regra do Bruxo com o usuário: dado a mais sempre; escudo −1 literal.
- [x] Registrar as decisões da segunda leva: trevo +5 no resultado final, Doente −1, escalonamento B, arte reaproveitada, frequência mantida, 90 de Vida canônico, velho cego aprovado, nomes depois.
- [x] Medir a chance de vitória exata de base, Doente, Bruxo e pool do Coringa nas rodadas 1 e 50 (`.taste-skill/qa/balancear-novos.mjs`).
- [x] Listar os 18 combates com peso, Defesa e dados por inimigo (`.taste-skill/qa/listar-combates.mjs`).
- [x] Medir a frequência real em crônicas simuladas, antes e depois do aumento, com e sem pausa (`.taste-skill/qa/medir-frequencia-real.mjs`, `medir-sugestoes.mjs`, `medir-frequencia-opcoes.mjs`).
- [x] Medir o escalonamento atual e os candidatos A e B nas rodadas 1, 50, 100, 150 e 250.
- [x] Medir os três itens de dado contra a base, na rodada 1 e na rodada 100.
- [x] Verificar que Adaga, Lança e Cinto já resolvem por automático e que "mercenários" não existe no repositório.
- [x] Mapear pontos de implementação, validação de save e riscos de interface.
- [x] Especificar registro dos herdeiros, arte, textos, testes e debug.
- [x] Implementar o Bruxo (perfil, `Math.min`, painel, 70 de Vida e 4 de Escudo).
- [x] Implementar o Coringa (sorteio da face, painel, rerrolagem grátis, validação de save).
- [x] Implementar o bônus do Doente em `batalhaAjustada`, antes do retorno antecipado.
- [x] Implementar os três itens de dado, com o mínimo 5 valendo só para o herói.
- [x] Implementar os três traços de inimigo, a etiqueta no painel e as regras de composição.
- [x] Escrever as 12 cartas de combate, com saídas que evitam luta em três delas e arte reutilizada.
- [x] Implementar a pausa de 4 rodadas, com save e exceção do debug.
- [x] Refazer o escalonamento pelo candidato B (Defesa +4, dano de derrota +8; vitória sem dano).
- [x] Converter as duas cartas do velho cego para disputa de d20 visível.
- [x] Atualizar o texto do tutorial e corrigir as descrições de Doente e Menino (70 → 90), inclusive na seleção.
- [x] Registrar as condições aprovadas: Coringa com 20 natural em uma crônica; Bruxo com oito vitórias na mesma crônica.
- [x] Garantir fallback de selo existente para os retratos pendentes, sem criar arquivos de arte.
- [x] Implementar que vitórias em combate não causam dano ao herdeiro.
- [x] Rodar a suíte completa e o lint; formatar e conferir os arquivos alterados.
- [ ] Conferir a interface em 1366×768 e em um celular físico.
- [ ] Jogar partidas completas para avaliar os buffs, itens, dificuldade e frequência.
- [ ] Produzir as artes dos dois herdeiros quando o usuário liberar essa etapa.

Resultado: mecânicas da especificação implementadas, incluindo novos herdeiros, itens, inimigos, cartas, duelo do velho e dano zero em vitórias. A seleção mantém 90 de Vida para Doente e Menino, e as condições de desbloqueio dos novos herdeiros estão registradas e testadas. Nenhuma arte nova foi criada; os dois usam o selo existente até a etapa visual.

Validações: suíte completa (205 testes), lint e formatação direcionada aos arquivos alterados passaram. A checagem geral do Prettier ainda aponta arquivos sem alteração; a interface não foi conferida em navegador/celular e falta uma partida completa de balanceamento.

Pendências: conferência visual em desktop e celular; teste jogável de balanceamento; raridade final dos novos itens; criação dos retratos, adiada a pedido do usuário. Os pesos dos traços inimigos e o dano extra do Feroz ainda dependem do teste jogável.
