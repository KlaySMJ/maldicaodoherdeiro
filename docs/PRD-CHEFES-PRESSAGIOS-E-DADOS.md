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

O jogo marca recusas explícitas em encontros com a Entidade. A terceira recusa inicia **A Entidade exige uma resposta**, uma luta até a morte. As recusas anteriores não podem matar o herdeiro por sorteio. A Entidade tem 100 pontos de Vida, recebe 25 de dano por acerto e causa 22 de dano por contra-ataque antes das reduções. Vencer encerra a perseguição e concede o Selo da Recusa; perder encerra a crônica.

### Crônica Abissal

Depois da etapa `abissal_5`, aparece **O senhor sob a lagoa**. A luta é até a morte. Ele tem 120 pontos de Vida, recebe 30 de dano por acerto e causa 28 de dano por contra-ataque antes das reduções. Vencer encerra a crônica como `vitoria_abissal`; perder encerra como derrota.

### Turnos de combate dos chefes

Cada rolagem resolve um turno. Se o herdeiro vencer, o chefe perde Vida; se perder, o herdeiro recebe dano com os escudos e reduções normais. A luta continua com novos dados até a Vida do chefe ou do herdeiro chegar a zero. Os confrontos não usam vitória ou derrota automática por 20 ou 1 natural. A barra de Vida fica abaixo do quadro do chefe e acompanha os danos. O progresso dos turnos é preservado no save.

### Testes de evento

Cada teste usa um d20 e um bônus fixo indicado na opção. Total 14 ou maior dá sucesso; total 10 a 13 dá sucesso com custo; abaixo de 10 dá falha. Um 20 natural garante sucesso e um 1 natural causa falha. A regra vale para eventos, não para confrontos até a morte.

Há testes no encontro do bardo e na carroça atolada. A interface mostra bônus, dificuldade, limiar de custo e resultado rolado.

### Linhagem e debug

Vencer cada chefe grava uma marca de legado. Os chefes do Barão e da Crônica Abissal também registram a rota alternativa de vitória.

Os controles de debug ficam em **Especial → Testar lutas de chefes**. Eles abrem o Barão, o líder do culto, a Entidade ou o chefe abissal sem cumprir os gatilhos normais. O convite do líder continua exigindo que a opção de recusa seja escolhida para começar a luta.

## Critérios de aceite

- [x] **A Vinda do Barão** agenda a luta para 100 rodadas após sua resolução, com o agendamento preservado no save.
- [x] A luta do Barão apresenta aviso de fatalidade e sua vitória encerra a crônica por uma rota alternativa.
- [x] Honra 30 habilita o recrutamento do líder; recusar inicia combate fatal mais fácil que os demais.
- [x] Derrotar o líder concede o bônus único e remove cartas futuras do culto.
- [x] A terceira recusa marcada à Entidade inicia combate fatal.
- [x] A conclusão da quinta etapa abissal habilita o chefe e sua rota de vitória.
- [x] Testes de evento usam um d20, três resultados possíveis, 20 natural como sucesso e 1 natural como falha.
- [x] As quatro lutas podem ser abertas pelo painel de debug.
- [x] A vida de cada chefe aparece numa barra abaixo do nome durante o combate.
- [x] Lutas de chefes usam turnos sucessivos e encerram quando a Vida do herdeiro ou do chefe chega a zero.
- [x] Dano e Vida acumulados do chefe são preservados entre turnos e no save; a barra acompanha os acertos.
- [x] Marcas de chefes são gravadas no legado.
- [ ] Conferir em jogo o equilíbrio das lutas fatais e a apresentação visual dos eventos.

## Checklist da implementação

- [x] Implementar gatilho, prazo de um ano e confronto do Barão.
- [x] Implementar recrutamento e confronto do líder do culto.
- [x] Implementar a terceira recusa como gatilho do combate da Entidade.
- [x] Ligar o chefe à conclusão da cadeia abissal.
- [x] Implementar testes de evento com resultados naturais e resultado com custo.
- [x] Adicionar botões de debug para os quatro chefes.
- [x] Mostrar a vida dos chefes numa barra que se esvazia quando são derrotados.
- [x] Resolver ataques e contra-ataques por turno, encerrando a luta apenas quando um dos lados chega a zero de Vida.
- [x] Persistir o progresso da luta e mostrar a troca de dano entre as rolagens.
- [x] Atualizar persistência e registro de vitória para os novos resultados.
- [ ] Fazer uma sessão manual de jogo para avaliar dificuldade, fluxo e interface.

**Resumo:** os chefes têm combates por turnos com Vida própria, dano acumulado e contra-ataques mitigados pelos atributos do herdeiro. O prazo do Barão começa quando **A Vinda do Barão** é resolvido.

**Validação:** código e alterações revisados. Testes automatizados não foram executados. A sessão manual para conferir dificuldade e interface está pendente.
