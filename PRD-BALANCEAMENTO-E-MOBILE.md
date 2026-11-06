# PRD: balanceamento, eventos e interface mobile

## Objetivo

Dar mais margem para sobreviver aos encontros, tornar a crônica de três anos menos repetitiva e corrigir os problemas de espaço e tela preta relatados em celulares. As mudanças devem respeitar as diferenças entre herdeiros e manter legíveis as cartas e escolhas.

## Contexto atual

- A vitória exige 300 rodadas, descritas no jogo como três anos.
- As estações mudam a cada 25 rodadas; portanto, a crônica atravessa doze estações.
- Há eventos sazonais e anuais, mas a colheita “Pela primeira vez a colheita rendeu” precisa respeitar um intervalo próprio de duas estações.
- A cadeia da Entidade X e a cadeia abissal usam progressões e requisitos diferentes; a frequência percebida da entidade está acima da abissal.
- Jogadores relatam dano alto em alguns encontros, pouca Vida para os herdeiros, cartas comprimidas no celular e tela preta que aparece repetidamente.

## Propostas

### Vida e encontros

Aumentar em **20 pontos a Vida inicial de cada herdeiro, exceto o Druida**, e em **10 pontos a do Druida**, conforme decisão do usuário. Preservar os limites máximos e as diferenças de atributos existentes.

Revisar encontros com dano elevado junto com a mitigação por escudo e as penalidades adicionais. O aumento de Vida não deve esconder opções que causam dano desproporcional ou mortes sem oportunidade de resposta. A auditoria abaixo registra os 18 encontros de combate, o dano base, os efeitos de falha, a mitigação por Escudo e a Vida restante dos seis herdeiros na rodada 300. A progressão de dano de fim de crônica foi limitada a +20; a Nemesis mantém seu bônus adicional, até o nível 4.

Quando a Vida chegar a **30% ou menos do máximo**, priorizar uma oportunidade segura de cura antes do próximo sorteio. A carta dedicada não custa recursos e restaura a Vida a 70% do máximo; não entra na memória das 25 cartas recentes.

#### Auditoria dos combates

Os pares de Vida abaixo mostram **vitória/derrota** na rodada 300, sem itens, construções ou bônus temporários. Escudo inicial: Corajoso 5, Avarento 5, Doente 4, Druida 2, Menino 3 e Heroína 5. O dano ajustado soma até 20 à base; na Nemesis nível 4, soma mais 8 na vitória e 20 na derrota. A conta aplica o Escudo ao dano do combate e inclui efeitos de Vida e penalidades da falha. O Menino não recebe opção de combate em `espirito_da_floresta`.

| Encontro | Dano base vitória/derrota | Efeito adicional na falha | Corajoso V/D | Avarento V/D | Doente V/D | Druida V/D | Menino V/D | Heroína V/D |
|---|---:|---|---:|---:|---:|---:|---:|---:|
| Saqueadores | 10/24 | Habitantes −12 | 95/81 | 95/81 | 64/50 | 92/78 | 63/49 | 95/81 |
| Desertores | 16/25 | Habitantes −5, Gold −2 | 89/80 | 89/80 | 58/49 | 86/77 | 57/48 | 89/80 |
| Javalis | 12/20 | Vida −4, Habitantes −3 | 93/81 | 93/81 | 62/50 | 90/78 | 61/49 | 93/81 |
| Barão | 14/22 | Habitantes −6, Gold −3 | 91/83 | 91/83 | 60/52 | 88/80 | 59/51 | 91/83 |
| Lobos | 11/18 | Habitantes −3 | 94/87 | 94/87 | 63/56 | 91/84 | 62/55 | 94/87 |
| Ladrões da estrada | 11/18 | Gold −3, Habitantes −2 | 94/87 | 94/87 | 63/56 | 91/84 | 62/55 | 94/87 |
| Fera da floresta | 18/28 | Habitantes −4 | 87/77 | 87/77 | 56/46 | 84/74 | 55/45 | 87/77 |
| Duelo | 12/20 | Honra −3, Gold −3 | 93/85 | 93/85 | 62/54 | 90/82 | 61/53 | 93/85 |
| Portão aberto | 13/22 | Habitantes −8, Gold −3 | 92/83 | 92/83 | 61/52 | 89/80 | 60/51 | 92/83 |
| Vizinho pede ajuda | 15/24 | Habitantes −5, Honra −3 | 90/81 | 90/81 | 59/50 | 87/78 | 58/49 | 90/81 |
| Volta do Barão | 20/30 | Habitantes −12, Gold −5 | 85/75 | 85/75 | 54/44 | 82/72 | 53/43 | 85/75 |
| Cavaleiro de osso | 22/32 | Honra −5, Habitantes −3 | 83/73 | 83/73 | 52/42 | 80/70 | 51/41 | 83/73 |
| Caçador de hereges | 16/24 | Seguidores −15 | 89/81 | 89/81 | 58/50 | 86/78 | 57/49 | 89/81 |
| Nemesis da memória | 12/20 | Habitantes −2 | 85/65 | 85/65 | 54/34 | 82/62 | 53/33 | 85/65 |
| Cálice no pântano | 20/30 | Habitantes −8 | 105/95 | 105/95 | 74/64 | 102/92 | 73/63 | 105/95 |
| Espírito da floresta | 18/26 | Sem penalidade adicional | 107/99 | 107/99 | 76/68 | 104/96 | Sem combate | 107/99 |
| Guarda da estrada | 6/14 | Habitantes −2 | 99/91 | 99/91 | 68/60 | 96/88 | 67/59 | 99/91 |
| Bandeira sem pano | 6/12 | Sem penalidade adicional | 99/93 | 99/93 | 68/62 | 96/90 | 67/61 | 99/93 |

### Ritmo e variedade dos eventos

O evento **“Pela primeira vez a colheita rendeu”** volta a ser elegível depois de duas mudanças de estação desde sua ocorrência. O marco fica salvo na run e não reinicia ao carregar.

Os eventos anuais agora cobrem as oito janelas sazonais dos anos 2 e 3 sem repetir uma carta anual na mesma run. A rotação comum recebeu cinco cenas novas; a ideia do sino revisou uma carta já existente.

#### Auditoria do catálogo e novas propostas

O primeiro levantamento contou **276 eventos** porque o helper de auditoria não carregava `events-progresso.js`, que já continha mais 11 cartas. O catálogo de produção tinha 287 eventos antes desta execução e agora tem **301**. A engine guarda os últimos 25 IDs e também espaça eventos que compartilham `grupoRecorrencia`; quando não há alternativas, libera cartas mais antigas. Essa regra reduz repetições próximas, mas não evita que uma carta sazonal volte no ano seguinte.

Antes da mudança, quatro festivais ligados apenas à estação podiam reaparecer na mesma run: **As primeiras sementes**, **O dia mais longo**, **A última colheita** e **A vigília do solstício**. **Ano Novo Lunar**, **Festival dos Mortos** e o **Festival da seiva** também podiam se repetir por ano. Agora todos esses eventos têm limite de uma aparição por run.

Foram criadas alternativas anuais com `oncePerRun` e elegibilidade por ano e estação. A engine agora reconhece requisitos de ano; as cartas programadas ocupam as oito janelas sem repetir o mesmo festival em anos diferentes. A tabela registra as cenas implementadas:

| Ano e estação | Evento | Cena e escolhas que o distinguem |
|---|---|---|
| 2, primavera | **A disputa pelas mudas** | Dois grupos reivindicam sementes raras; dividir, arbitrar ou entregar a um deles. |
| 2, verão | **A cisterna rachada** | A água escasseia antes da colheita; pagar pelo reparo, organizar turnos ou proteger o próprio abastecimento. |
| 2, outono | **O celeiro comunitário** | As famílias discutem como repartir o estoque; reservar para o inverno, vender uma parte ou dar prioridade a quem perdeu a plantação. |
| 2, inverno | **A ponte sob o gelo** | A travessia ameaça ceder e interrompe o comércio; reforçar, fechar a passagem ou cobrar por uma rota alternativa. |
| 3, primavera | **As cercas antigas** | A expansão da vila revela limites de terras esquecidos; negociar, redistribuir ou favorecer os proprietários. |
| 3, verão | **A estrada dos retirantes** | Um grupo chega durante o calor, trazendo notícia de outra região; acolher, trocar mantimentos por trabalho ou recusar a passagem. |
| 3, outono | **A dívida do moinho** | O moleiro cobra promessas acumuladas durante os anos; quitar, renegociar com a vila ou tomar o moinho. |
| 3, inverno | **A última vigília** | Moradores decidem como atravessar o inverno final da crônica; dividir lenha, reunir recursos para uma festa ou impor racionamento. |

Para a rotação comum, foram escolhidas cenas com recursos e consequências pouco representados, sem acrescentar outra batalha genérica ou disputa de honra na praça:

- **A enfermaria sem lenha:** aquecer os doentes, poupar madeira ou desmontar uma estrutura abandonada; as escolhas deixam claro o custo da recuperação.
- **O poço de duas aldeias:** dividir a água, cobrar pelo uso ou negar a passagem; os efeitos envolvem habitantes, honra e recursos.
- **A carroça atolada:** gastar recursos para salvar a carga, pedir ajuda ou aproveitá-la antes da chegada do dono.
- **O sino rachado:** reparar o sistema de aviso, pagar por vigias ou aceitar o risco; a carta existente recebeu escolhas de defesa.
- **O livro das rações:** conferir as contas, confiar no escrivão ou distribuir o restante; as escolhas afetam Gold, habitantes e honra.
- **A casa que muda de dono:** acolher recém-chegados, leiloar os bens ou reservar a casa para uso comunitário.

Nesta execução entraram as oito cartas anuais da tabela e cinco cartas comuns: **A enfermaria sem lenha**, **O poço de duas aldeias**, **A carroça atolada**, **O livro das rações** e **A casa que muda de dono**. A ideia do sino foi aplicada à carta existente **O sino rachado**, para evitar uma duplicata. As cartas usam ilustrações já disponíveis. A lista separada `PROPOSTAS-NOVOS-EVENTOS.txt` contém outras 80 ideias e fica como backlog; por orientação do usuário, não foi implementada nesta rodada.

Os pesos e requisitos da Entidade X e da cadeia abissal foram ajustados e medidos por janela elegível, considerando flags, memória de eventos e eventos anuais forçados.

**Resultado da simulação:** as sete cartas da Entidade X passaram de peso 0,5 para **0,25**; a pausa de 24 rodadas entre aparições continua valendo. Em 100 simulações de 300 sorteios, com as duas cadeias habilitadas desde o início para compará-las sob condições equivalentes, foram observadas 18.476 janelas elegíveis para a Entidade e 22.631 para o abissal. A Entidade apareceu em 44 cartas (0,238% por janela elegível; média 0,44 carta por simulação) e o abissal em 87 (0,384%; média 0,87). A simulação usa o sorteio ponderado da engine, flags das cadeias, memória de 25 cartas e eventos anuais forçados. Escolhas comuns não foram simuladas; escolhas das duas cadeias foram aplicadas para atualizar suas flags. No fluxo normal, o abissal só é liberado após resistir à Entidade, que então não pode reaparecer; habilitar ambas desde o início torna esta comparação mais favorável à Entidade.

### Interface para celular

Foram adicionados botões compactos com ícones para **Casa**, **Inventário** e **Progresso** no cabeçalho da crônica. Casa volta ao menu, Inventário abre o painel de itens e Progresso abre o histórico da crônica atual, conforme decisão do usuário. Os botões têm rótulos acessíveis, nomes visíveis ao foco e área de toque de 44 × 44 px.

Em telas estreitas, a interface deixa de comprimir as cartas com o ajuste automático de altura e permite rolagem vertical. O texto de resultado também permanece visível. A rolagem interna dos painéis de Inventário e Progresso mantém esses controles utilizáveis em telas baixas.

Foram adicionadas mensagens de recuperação para erro de JavaScript ou rejeição não tratada durante a inicialização, com opção de recarregar, e um estado de erro para falhas ao iniciar a run. A causa da tela preta original ainda não foi reproduzida em aparelho; confirmar retrato, paisagem, restauração de partida e navegador móvel permanece pendente.

## Escopo

Inclui ajustes de atributos iniciais, seleção e pesos de eventos, persistência do intervalo da colheita, apresentação mobile e correção do fluxo que deixa a tela preta. Inclui testes automatizados e verificação manual em navegador móvel.

Não inclui mudar a duração da vitória, implementar as 80 ideias do arquivo de propostas ou redesenhar ilustrações. Os valores de Vida foram definidos pelo usuário; o dano de combate foi limitado e auditado. A verificação manual em aparelho continua pendente.

## Critérios de aceite

- [x] Os herdeiros recebem +20 de Vida inicial, exceto o Druida, que recebe +10; os limites máximos e as diferenças de atributos são preservados.
- [x] A decisão sobre a Vida inicial do Druida (+10) está registrada.
- [x] A auditoria cobre os 18 encontros, dano base e escalado, mitigação, penalidades e Vida restante dos seis herdeiros.
- [x] Com Vida em 30% ou menos, a carta de cura sem custo aparece antes do próximo sorteio e recupera até 70% do máximo.
- [x] “Pela primeira vez a colheita rendeu” respeita duas mudanças de estação, inclusive após salvar e carregar.
- [x] Oito eventos anuais novos ocupam as janelas dos anos 2 e 3; uma mesma carta anual não se repete na run.
- [x] Os quatro festivais sazonais e os eventos globais anuais não se repetem na mesma run.
- [x] Cinco eventos comuns novos oferecem escolhas próprias; a proposta do sino atualiza uma carta existente em vez de duplicá-la.
- [x] A simulação comparativa de 100 runs registra taxas por janela elegível, requisitos, flags, memória e sorteios anuais forçados; a taxa da Entidade ficou abaixo da abissal.
- [x] Os controles de Casa, Inventário e Progresso têm nomes acessíveis, áreas de toque de 44 × 44 px e acionam menu, inventário e histórico da crônica.
- [ ] Nenhum conteúdo essencial da carta fica inacessível em celular; orientação retrato e paisagem continuam utilizáveis.
- [ ] O problema da tela preta tem uma reprodução ou causa identificada e uma correção verificada nos navegadores móveis escolhidos para teste.
- [x] Testes cobrem sorteio, intervalo sazonal, recuperação crítica, regras de renderização responsiva, combate e persistência após carregar.
- [x] O sorteio evita os 25 eventos mais recentes quando há alternativas; pools menores liberam eventos antigos para o jogo continuar.

## Decisões e verificações em aberto

- **Tela preta:** falta reproduzir o problema em aparelho e navegador específicos e verificar a recuperação em retrato e paisagem.
- **Interface mobile:** falta conferir manualmente a leitura das cartas e os painéis em um telefone real.
- **Propostas de conteúdo:** as 80 ideias em `PROPOSTAS-NOVOS-EVENTOS.txt` ficam como backlog; não foram implementadas nesta execução, conforme orientação do usuário.

## Checklist final do PRD

- [x] Ler `SKILL.md` antes de editar textos; `references/banned-words.md` não está disponível neste repositório.
- [x] Reconciliar o PRD com as decisões do usuário: Druida +10, cura crítica a 30% e Progresso abrindo o histórico atual.
- [x] Corrigir Vida inicial, dano máximo tardio, cura crítica e intervalo persistente da colheita.
- [x] Auditar os 18 combates para os seis herdeiros, incluindo Escudo, efeitos diretos e penalidades.
- [x] Acrescentar oito eventos anuais, cinco eventos comuns e atualizar a carta existente do sino; catálogo de produção agora tem 301 eventos.
- [x] Impedir repetição dos festivais e eventos anuais na mesma run.
- [x] Reduzir o peso das sete cartas da Entidade para 0,25 e confirmar taxa inferior à abissal em 100 simulações.
- [x] Implementar controles mobile acessíveis, rolagem vertical e mensagens de recuperação de inicialização.
- [x] Manter as 80 propostas separadas como backlog, conforme pedido do usuário.
- [x] Validar os testes automatizados, o ESLint e o lint visual do skill.
- [ ] Verificar em telefone real a leitura e a rolagem em retrato e paisagem.
- [ ] Reproduzir a tela preta em aparelho e navegador específicos e verificar a recuperação nesse ambiente.

**Resumo:** os ajustes de balanceamento, variedade anual, controles mobile e recuperação inicial foram implementados. As 80 ideias de conteúdo continuam no backlog. A validação em telefone e a reprodução da tela preta ainda dependem de conferência manual.

**Validações:** `npm test` passou com 126 testes; `npm run lint` passou. O lint visual registrou zero falhas e dois avisos: zero-padding do relógio e dez travessões longos. A simulação comparativa de 100 runs e a auditoria dos 18 combates estão registradas acima. O inspetor visual não abriu a página: Edge/CDP expirou em `Page.enable` e o modo headless encerrou com falha ao iniciar a GPU; portanto, não houve verificação manual em navegador móvel.
