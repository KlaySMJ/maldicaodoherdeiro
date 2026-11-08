# PRD: Chefes, presságios e testes com dados

Data: 8 de novembro de 2026.

Estado: implementado; equilíbrio e apresentação aguardam conferência em jogo.

## Objetivo

Ligar as lutas de chefes e alguns eventos à mecânica de dados. Chefes podem encerrar a crônica por rotas alternativas, alterar o baralho futuro ou deixar marcas para os próximos herdeiros.

## Regras implementadas

### Barão

**A Vinda do Barão** mantém a meta atual de obter 40 Gold em 50 rodadas. Ao resolver o presságio, o jogo agenda **Embate com o Barão** para 100 rodadas depois, contando desde a resolução. Isso equivale a um ano no calendário. O presságio só pode ser anunciado quando há tempo para cumprir o prazo e chegar ao confronto até a rodada 300.

A luta é até a morte. Vencer encerra a crônica como `vitoria_barao`; perder encerra como derrota. O combate usa as regras normais, sem sucesso ou falha automática por dado natural.

O Barão tem 100 pontos de Vida. Cada turno vencido causa 25 de dano; cada turno perdido causa 24 de dano ao herdeiro antes de escudo e reduções.

### Líder do culto

Com Honra 30 ou maior, o líder aparece e tenta recrutar o herdeiro. Aceitar inicia o culto. Recusar abre uma luta até a morte, mais fácil que as outras: o líder usa um d20 e tem defesa 2. Ele tem 75 pontos de Vida, recebe 25 de dano por acerto e causa 16 de dano por contra-ataque antes das reduções.

Ao vencer, o herdeiro recebe 10 Gold e 5 de Honra. Cartas futuras do culto deixam de aparecer; efeitos já ativos continuam. A vitória não encerra a crônica. A derrota é fatal.

### Entidade

Ao iniciar a perseguição, o jogo sorteia qual recusa irritará a Entidade além do limite. Se o herdeiro escolher essa recusa, ela bloqueia a estrada e inicia **A Entidade exige uma resposta**, uma luta até a morte. O confronto pode começar após uma recusa ou mais tarde na cadeia; não há uma contagem fixa. As outras recusas não matam o herdeiro por sorteio. A Entidade tem 100 pontos de Vida, recebe 25 de dano por acerto e causa 22 de dano por contra-ataque antes das reduções. Vencer encerra a perseguição e concede o Selo da Recusa; perder encerra a crônica.

### Crônica Abissal

Depois da etapa `abissal_5`, aparece **O senhor sob a lagoa**. A luta é até a morte. Ele tem 120 pontos de Vida, recebe 30 de dano por acerto e causa 28 de dano por contra-ataque antes das reduções. Vencer encerra a crônica como `vitoria_abissal`; perder encerra como derrota.

### Turnos de combate dos chefes

Cada rolagem resolve um turno. Se o herdeiro vencer, o chefe perde Vida; se perder, o herdeiro recebe dano com os escudos e reduções normais. A luta continua com novos dados até a Vida do chefe ou do herdeiro chegar a zero. Os confrontos não usam vitória ou derrota automática por 20 ou 1 natural. A barra de Vida fica abaixo do quadro do chefe e acompanha os danos. O progresso dos turnos é preservado no save.

### Testes de evento

Cada teste usa um d20 e o bônus indicado na opção. As dificuldades e os limites de sucesso com custo variam por teste: atingir a dificuldade dá sucesso; atingir apenas o limite de custo dá sucesso com custo; ficar abaixo dele dá falha. Um 20 natural garante sucesso e um 1 natural causa falha. A regra vale para eventos, não para confrontos até a morte.

Além do bardo e da carroça atolada, testes de d20 resolvem a travessia do lago, as rotas do desfiladeiro, a escolta pela ponte congelada, o resgate na casa em chamas e a reação ao cavalo desembestado. São tentativas do herdeiro sem rolagem de oponente; as opções seguras ou com custo conhecido continuam disponíveis nas cartas. Antes da escolha, a interface não antecipa bônus, dificuldade, limiar de custo nem desfechos. Depois da rolagem, mostra o resultado obtido.

Os testes de sorte das cartas de progresso, do Druida-Herdeiro e dos encontros sobrenaturais foram substituídos por testes de d20 com sucesso, sucesso com custo e falha. Falhas que ativariam uma condição agora têm um resultado intermediário de ferimento sem transformação. Também há novas opções com d20 no desabamento da mina, na tempestade, no enxame, na mina esquecida, nos ratos do celeiro, no vigia da torre, na cisterna rachada, nas cercas antigas, na última vigília e na noite dos lampiões. As alternativas anteriores continuam disponíveis. A guarda da estrada permanece uma batalha.

O torneio da aldeia, o duelo de honra e o cavaleiro errante oferecem disputas de dados um contra um. O debug **Só eventos com dados** inclui testes de d20 e duelos de dados; opções de combate continuam resolvidas pelas regras próprias de batalha.

### Linhagem e debug

Vencer cada chefe grava uma marca de legado. Os chefes do Barão e da Crônica Abissal também registram a rota alternativa de vitória.

Os controles de debug ficam em **Especial → Testar lutas de chefes**. Eles abrem o Barão, o líder do culto, a Entidade ou o chefe abissal sem cumprir os gatilhos normais. O convite do líder continua exigindo que a opção de recusa seja escolhida para começar a luta.

## Critérios de aceite

- [x] **A Vinda do Barão** agenda a luta para 100 rodadas após sua resolução, com o agendamento preservado no save.
- [x] A luta do Barão apresenta aviso de fatalidade e sua vitória encerra a crônica por uma rota alternativa.
- [x] Honra 30 habilita o recrutamento do líder; recusar inicia combate fatal mais fácil que os demais.
- [x] Derrotar o líder concede o bônus único e remove cartas futuras do culto.
- [x] Uma recusa sorteada na cadeia da Entidade inicia combate fatal; o gatilho não depende de uma contagem fixa.
- [x] A conclusão da quinta etapa abissal habilita o chefe e sua rota de vitória.
- [x] Testes de evento usam um d20, três resultados possíveis, 20 natural como sucesso e 1 natural como falha.
- [x] Travessias, resgate de incêndio e reação ao cavalo usam testes de d20 sem dado de oponente, mantendo alternativas determinísticas.
- [x] Converter testes de sorte de progresso, do Druida-Herdeiro e sobrenaturais em testes de d20 com sucesso com custo.
- [x] Acrescentar opções de d20 a eventos de risco físico, mantendo as escolhas existentes.
- [x] Acrescentar disputas um contra um com dados ao torneio, duelo de honra e cavaleiro errante.
- [x] O filtro de debug inclui testes de d20 e duelos de dados, sem tratar batalhas como testes de evento.
- [x] As quatro lutas podem ser abertas pelo painel de debug.
- [x] A vida de cada chefe aparece numa barra abaixo do nome durante o combate.
- [x] Lutas de chefes usam turnos sucessivos e encerram quando a Vida do herdeiro ou do chefe chega a zero.
- [x] Dano e Vida acumulados do chefe são preservados entre turnos e no save; a barra acompanha os acertos.
- [x] Marcas de chefes são gravadas no legado.
- [ ] Conferir em jogo o equilíbrio das lutas fatais e a apresentação visual dos eventos.

## Checklist da implementação

- [x] Implementar gatilho, prazo de um ano e confronto do Barão.
- [x] Implementar recrutamento e confronto do líder do culto.
- [x] Implementar a recusa sorteada como gatilho do combate da Entidade.
- [x] Ligar o chefe à conclusão da cadeia abissal.
- [x] Implementar testes de evento com resultados naturais e resultado com custo.
- [x] Ampliar os testes individuais de d20 para travessias, rotas de serra, resgate de incêndio e reação a perigo imediato.
- [x] Converter os testes de sorte selecionados em progresso, Druida-Herdeiro e eventos sobrenaturais.
- [x] Acrescentar testes de d20 a novas opções de eventos e preservar as alternativas anteriores.
- [x] Usar duelos de dados em desafios individuais e incluí-los no filtro de debug.
- [x] Adicionar botões de debug para os quatro chefes.
- [x] Mostrar a vida dos chefes numa barra que se esvazia quando são derrotados.
- [x] Resolver ataques e contra-ataques por turno, encerrando a luta apenas quando um dos lados chega a zero de Vida.
- [x] Persistir o progresso da luta e mostrar a troca de dano entre as rolagens.
- [x] Atualizar persistência e registro de vitória para os novos resultados.
- [ ] Fazer uma sessão manual de jogo para avaliar dificuldade, fluxo e interface.

**Resumo:** os chefes têm combates por turnos com Vida própria e dano acumulado. Testes de d20 resolvem ações incertas em eventos, e disputas de dados adicionam um formato um contra um a três desafios. O prazo do Barão começa quando **A Vinda do Barão** é resolvido.

**Validação:** código e alterações revisados. Testes automatizados não foram executados. A sessão manual para conferir dificuldade e interface está pendente.
