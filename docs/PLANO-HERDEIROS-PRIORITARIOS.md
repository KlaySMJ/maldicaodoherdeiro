# Plano: herdeiros do Culto, do Leste e Nórdico

Data: 6 de novembro de 2026. Estado: implementação funcional concluída e oito artes nórdicas integradas. Os herdeiros serão ilustrados depois dos eventos, um por vez, conforme a ordem definida pelo usuário.

## Prioridade e escopo

Implementar estes três herdeiros antes dos personagens ainda pendentes de [HERDEIROS-FUTUROS.md](HERDEIROS-FUTUROS.md). Os herdeiros já disponíveis continuam no jogo. O plano antigo serve como referência de ideias, mas suas listas de registros e números de linha precisam de revisão antes do uso.

O escopo funcional inclui os desbloqueios, as conquistas, as passivas e a ampliação do catálogo nórdico para **10 bênçãos e 10 maldições**. O usuário confirmou que o Nórdico recebe **um efeito sorteado por rodada**; não recebe todos ao mesmo tempo.

## Base conferida antes da implementação

`js/state.js` define 300 rodadas para vencer, anos de 100 rodadas e estações de 25. Os atributos comuns atuais são 120 de Vida, 5 de Escudo, 2 de Ataque, Honra 0, 50 habitantes e 5 gold. Os seis traços cadastrados são `corajoso`, `avarento`, `doente`, `druida_herdeiro`, `menino_cronista` e `heroi_do_povo`.

`js/events-specials.js` contém 12 animais do zodíaco, seis bênçãos nórdicas e seis maldições. A entrada do ano novo usa `ano_novo_ativo`; o Norte usa `bencao_norte_ativa`. Atualmente, o zodíaco depende de janelas a cada 50 rodadas após sua ativação, e as ofertas divinas respeitam um intervalo de 40 rodadas. Portanto, a cadência descrita para a Herdeira do Leste será uma regra exclusiva dela, sem tomar a descrição de “uma vez por ano” como retrato do código atual.

Os efeitos divinos atuais duram até 10 rodadas e ocupam `run.efeitoDivino`. As conquistas ficam em `js/conquistas.js`, os objetivos de desbloqueio em `js/legacy.js`. Ver uma carta especial já registra uma marca de visita; essa marca não comprova que o jogador aceitou seu efeito.

## Atributos iniciais

| Traço proposto | Nome | Vida / máxima | Ataque | Escudo | Honra | Habitantes | Gold | Seguidores reservados |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `herdeiro_culto` | O Herdeiro do Culto | 120 / 120 | 4 | 4 | 0 | 50 | 5 | 30 |
| `herdeira_leste` | A Herdeira do Leste | 120 / 120 | 2 | 7 | 0 | 60 | 3 | 0 |
| `herdeiro_nordico` | O Herdeiro Nórdico | 120 / 120 | 9 | 1 | 0 | 50 | 5 | 0 |

Valores não alterados pelo pedido seguem os iniciais comuns. Os seguidores do Culto não substituem os habitantes.

## 1. O Herdeiro do Culto

### Desbloqueio e conquista

Concluir uma run com `run.fim.tipo === "vitoria_culto"` libera `herdeiro_culto` para as próximas partidas. A conquista existente **Três anos de devoção** (`culto_concluido`) já expressa essa condição; acrescentar a recompensa de personagem pelo objetivo de legado, mantendo o ID e o progresso existentes.

Não liberar apenas por aderir ao culto ou por encerrar a crônica cedo. Para jogadores que já têm `culto_concluido` persistida, a migração deve conceder o herdeiro sem exigir outra vitória.

### Seguidores antes e depois da adesão

Começar fora do culto, com 50 habitantes e 30 seguidores em reserva. Mostrar a reserva na interface, com uma descrição que explique que ela entra em atividade na adesão. Antes disso, ela não gera renda, não permite sacrifícios de seguidores e não evita a derrota da vila pelas regras normais.

Ao aderir, somar 50 à reserva: a primeira adesão resulta em 80 seguidores, se a reserva continuar em 30. Os dois caminhos atuais de adesão em `js/engine.js` atribuem 50 diretamente; reunir essa inicialização em uma função comum para que nenhum caminho apague os 30 iniciais. Salvar uma marca da primeira adesão para impedir concessões repetidas ao carregar ou reabrir a mesma decisão. Uma eventual readesão após dissolução deve seguir uma regra explícita, sem recriar a reserva inicial.

### Redução das perdas de habitantes

Para uma perda positiva de magnitude `p`, aplicar `Math.max(1, Math.floor(p / 2))`, limitada à população disponível. Exemplos: perdas de 1, 2, 3, 5 e 10 viram 1, 1, 1, 2 e 5. Um efeito de perda zero continua zero.

Aplicar a toda redução de **habitantes**, incluindo eventos, combate, itens, sacrifícios e mudanças por multiplicador ou atribuição direta. Calcular a perda real antes da redução; não dividir o saldo final da população. Reduzir cada débito uma única vez. Quando o Celeiro também proteger a mesma perda, proposta de composição: Celeiro primeiro, passiva depois, com mínimo final de 1 para uma perda originalmente positiva. Registrar essa ordem nos testes.

Perdas de seguidores não recebem essa proteção: o pedido distingue os dois recursos. O custo especial da adaga tem regra própria.

### Frequência das cartas

Proposta inicial de balanceamento: multiplicar por 2 o peso das cartas de iniciação e das cartas com `tipo: "culto"` para este traço. Identificar a iniciação por uma categoria explícita no catálogo, cobrindo convites e entradas pertinentes; não procurar palavras nos títulos.

O multiplicador altera a chance entre cartas elegíveis. Preservar requisitos, intervalos, limites de repetição e condições de culto ativo; possuir 30 seguidores em reserva não libera antecipadamente cartas exclusivas de cultistas. Validar por simulação se o aumento permite encontrar os convites com frequência perceptível.

### Adaga

O item existente se chama **Adaga cerimonial**, ID `adaga_cerimonial`; ele corresponde à adaga sacrificial citada no pedido. Para este herdeiro, depois da adesão e ao escolher seguidores como pagamento, cobrar **5 seguidores** e conceder **+10 Ataque e +5 Escudo**. Preservar o ganho atual de Ataque, acrescentando o Escudo solicitado.

Manter o uso único na run e os requisitos de pagamento. Os demais herdeiros continuam pagando 10 para +10 Ataque. Atualizar a descrição contextual, a confirmação e o resultado; a tela não pode anunciar 10 seguidores e cobrar 5. O sacrifício de habitantes continua no caminho comum, sujeito à redução de perdas deste herdeiro, sem receber o Escudo exclusivo do pagamento com seguidores.

## 2. A Herdeira do Leste

### Como liberar

Na mesma run, ativar os eventos do ano novo pelo encontro do mercador e **receber efetivamente uma bênção de um animal do zodíaco**. Proposta de interpretação: aceitar a fortuna ou fazer a oferenda correspondente conta; guardar a carta, apenas vê-la ou receber uma bênção nórdica não conta.

Registrar uma marca própria de bênção zodiacal recebida no momento da escolha. O objetivo concede `herdeira_leste`; a conquista **A fortuna atravessa o mar** usa a mesma condição. Essa interpretação deve aparecer na descrição de desbloqueio para evitar confusão entre os dois catálogos de bênçãos.

### Calendário exclusivo

Começar com `ano_novo_ativo` habilitado e um calendário já sorteado para o primeiro ano, sem exigir o mercador. A cada ano, garantir duas cartas zodiacais em estações distintas:

| Primeira aparição | Segunda aparição permitida |
| --- | --- |
| Primavera, estação 1 | Outono ou inverno, estações 3 ou 4 |
| Verão, estação 2 | Inverno, estação 4 |

Sortear a primeira estação entre 1 e 2; quando ela for 1, sortear a segunda entre 3 e 4. Sortear um dia válido dentro de cada estação escolhida. Salvar o calendário, os animais e os encontros consumidos; carregar não muda o sorteio. A primeira aparição nunca ocorre no outono ou no inverno.

Cada run completa de três anos terá seis encontros próprios. Selecionar animais ainda não usados na run enquanto houver opções. Proposta: usar animais distintos nos dois encontros anuais, seguindo a regra atual de cartas já vistas. O mercador não deve reiniciar esse calendário nem criar uma terceira aparição por meio da janela comum.

### Encontros sem passagem de dia

Apresentar a carta zodiacal como encontro adicional no dia agendado. Após a resposta e seu resultado, retomar a carta normal daquele dia; a sequência zodiacal não aumenta `run.rodada`. O encontro continua permitindo ganhos, custos, conquistas e derrota por seus efeitos.

Separar a conclusão de uma escolha da passagem de um dia. Nesse encontro adicional, não repetir renda, manutenção, cura periódica, desgaste de efeitos, recargas, estação, combate escalado ou progresso de sobrevivência por rodada. Marcas de visita e consequências da escolha continuam válidas. Salvar a carta normal suspensa, sua ordem de opções e o estado do encontro extra, evitando duas recompensas ao recarregar.

Quando outro evento obrigatório coincidir com o dia agendado, enfileirar os dois sem descartar nenhum. Priorizar transições letais e decisões de culto; depois resolver o encontro zodiacal e retomar o fluxo. No último dia, concluir os encontros devidos antes de avaliar a vitória. A condição de vitória continua sendo completar 300 dias, mesmo havendo cartas adicionais.

## 3. O Herdeiro Nórdico

### Como liberar

Receber efetivamente uma bênção **ou** uma maldição de uma entidade nórdica. Registrar a marca ao ativar `opcao.efeitoDivino`, não ao ver a carta, acolher o viajante, recusar a bênção ou desafiar a maldição sem recebê-la.

O objetivo libera `herdeiro_nordico`, acompanhado da conquista **Sob o olhar do Norte**. Guardar o ID do efeito recebido para que a condição permaneça comprovada depois que ele expirar. Não depender apenas de `run.efeitoDivino`, que volta a `null`.

### Um efeito sorteado por rodada

No começo de cada dia normal, inclusive o primeiro, sortear **um** efeito do catálogo nórdico. A proposta inicial usa as versões básicas, sem tributo ou sacrifício, com chances iguais entre as 10 bênçãos e as 10 maldições. O sorteio não cobra o custo de aceitar uma carta e não cria uma carta adicional: concede apenas sua passiva por aquele dia.

Adaptar os efeitos para duração de um dia. Ataque, Escudo e proteção valem nas decisões e combates desse dia; efeitos periódicos como cura, perda de Vida, gold e população disparam uma única vez. A interpretação proposta para um efeito que normalmente age a cada dois dias é uma aplicação no dia em que ele for sorteado, pois a passiva não dura até um segundo dia. Revelações afetam as escolhas desse dia.

Ao mudar o dia, remover o efeito anterior antes do novo sorteio. Bônus temporários não se tornam ganhos permanentes de atributos; ganhos e perdas instantâneos de recursos permanecem. A remoção deve retirar apenas o modificador correspondente, sem restaurar um retrato antigo dos atributos e apagar ganhos feitos durante o dia. Conferir os casos de atributos no mínimo zero.

Guardar esse efeito em estado separado de `run.efeitoDivino`, pois o herdeiro ainda pode receber efeitos normais das cartas nórdicas. Proposta de composição: modificadores somam; revelações equivalentes não duplicam; os efeitos periódicos de cada origem disparam uma vez; ganhos de gold sofrem a redução aplicável uma única vez por origem. Registrar a origem de cada modificador para desfazê-lo com segurança.

Persistir o efeito sorteado e a marca do último dia processado. Uso de item, recarga da página, abertura de menu e encontro sem passagem de dia não sorteiam outra passiva nem repetem seus recursos. As passivas sorteadas não contam como aceitação de uma carta para conquistas de coleção de eventos.

## Catálogo nórdico: 10 bênçãos e 10 maldições

As bênçãos atuais são Thor, Odin, Freya, Týr, Njord e Iðunn. Acrescentar as quatro pedidas. Os valores abaixo são propostas iniciais de balanceamento, ainda sem implementação; usar duração comum de 10 dias, com as alternativas de pagamento definidas na etapa de conteúdo.

| Nova bênção | Efeito básico proposto | Aplicação diária do Nórdico |
| --- | --- | --- |
| Baldr | Reduzir 2 do dano de batalha | Proteção durante o dia |
| Frigg | +2 Escudo temporário | +2 Escudo durante o dia |
| Heimdall | Revelar mudanças de habitantes nas escolhas | Revelação durante o dia |
| Freyr | +1 habitante por dia | Uma concessão de +1 habitante |

As maldições atuais são Loki, Hel, Skadi, Surtr, **Höðr** e Rán. **Hoder já corresponde a Höðr, ID `maldicao_hodr`**. Manter essa carta e acrescentar Jormungand, Fenrir, Hrym e Níðhöggr, cuja inclusão o usuário aprovou, para completar as 10 maldições. Preservar o ID existente de Höðr e, se necessário, mostrar “Höðr (Hoder)” na documentação.

| Entidade solicitada | Tratamento | Efeito básico proposto |
| --- | --- | --- |
| Jormungand | Nova maldição | Receber 1 de dano direto por dia |
| Fenrir | Nova maldição | Reduzir Ataque em 2 temporariamente e reduzir pela metade a cura de Vida recebida |
| Hoder / Höðr | Manter a maldição existente | Redução temporária de 3 de Ataque |
| Hrym | Nova maldição | Reduzir Escudo em 2 temporariamente e cobrar 1 gold de manutenção adicional por dia |
| Níðhöggr (Nidhogg) | Inclusão aprovada pelo usuário | Perder 1 habitante por dia |

Fenrir reduz toda recuperação positiva de Vida pela metade, arredondando para baixo; uma cura de 1 passa a 0. Aplicar essa redução uma única vez, antes do limite de Vida máxima, incluindo poções, cartas e curas periódicas. Não reduzir aumentos de Vida máxima nem ajustes de inicialização. No sorteio diário do Nórdico, a penalidade vale apenas naquele dia. Se a carta e a passiva diária concederem a mesma restrição, aplicar metade uma única vez, sem reduzir a cura a um quarto.

A manutenção de Hrym retira 1 gold por dia, com saldo mínimo zero, sem converter falta de gold em dano ou perda de população. Ela se soma à manutenção comum da vila. Na carta normal, cobrar uma vez em cada dia de efeito; na passiva diária do Nórdico, cobrar uma única vez ao ativar. Recarregar ou resolver encontros sem passagem de dia não repete a cobrança. A redução de Escudo continua temporária.

As novas cartas devem seguir o formato atual: opção básica, alternativa com custo e recusa ou desafio conforme o tipo. Definir títulos, narrações e custos na implementação; evitar prometer aqui textos ainda não escritos. Conservar a relação entre honra e os pesos das ofertas comuns. O sorteio diário do Nórdico usa sua regra própria e não exige aguardar o intervalo das ofertas.

## Conquistas relacionadas

| ID proposto ou existente | Nome | Condição e recompensa |
| --- | --- | --- |
| `culto_concluido`, existente | Três anos de devoção | Vitória cultista; libera o Herdeiro do Culto |
| `fortuna_do_leste` | A fortuna atravessa o mar | Ativar o ano novo e aceitar uma bênção zodiacal na mesma run; libera a Herdeira do Leste |
| `chamado_nordico` | Sob o olhar do Norte | Receber um efeito de carta nórdica; libera o Herdeiro Nórdico |
| `culto_adaga_herdeiro` | O preço da lâmina | Usar a adaga como Herdeiro do Culto pagando 5 seguidores |
| `leste_duas_estacoes` | Duas visitas no mesmo ano | Resolver os dois encontros zodiacais anuais como Herdeira do Leste |
| `nordico_duas_faces` | Entre favor e castigo | Receber uma passiva diária de bênção e uma de maldição na mesma run como Nórdico |

Acrescentar os três traços às conquistas geradas de vitória por herdeiro e às metas que consideram todos os herdeiros. Conquistas já registradas permanecem conquistadas após ampliar o catálogo; informar a nova lista de requisitos nas metas ainda pendentes. Não conceder duas conquistas de desbloqueio cultista com a mesma condição.

Os objetivos e as conquistas devem compartilhar a condição de origem, evitando que o aviso prometa um herdeiro ainda bloqueado. Definir a persistência do desbloqueio no mesmo fluxo das conquistas, que já podem ser gravadas durante a partida, sem perder o prêmio ao abandonar a run depois do aviso. Migrar desbloqueios antigos apenas quando houver evidência suficiente; visita a carta não comprova recebimento de bênção ou maldição.

## Alterações previstas e ordem de execução

1. Preparar os registros comuns em `js/state.js`, `js/save.js`, `js/legacy.js`, `js/conquistas.js` e `js/ui.js`. Incluir disponibilidade, atributos, seleção, retratos, memórias e ranking. Conferir também listas fixas em `js/main.js` e testes; não copiar os números de linha do plano antigo. A seleção precisa validar se o traço está desbloqueado.
2. Implementar primeiro o Herdeiro do Culto e seus desbloqueios. Centralizar adesão e perdas, integrar a adaga e testar a convivência com o Celeiro. Não alterar as regras comuns da Heroína do povo.
3. Implementar o calendário e os encontros adicionais da Herdeira do Leste. Separar dias de escolhas antes de acrescentar a passiva nórdica, para que ela também respeite encontros sem passagem de tempo.
4. Ampliar o catálogo com Níðhöggr como a décima maldição; em seguida, implementar o Nórdico com sorteio diário persistido. Reunir as definições de efeitos em um catálogo consultado por cartas e passiva, evitando duas cópias de cada regra.
5. Integrar conquistas, descrições e retratos. Se houver novos módulos, registrá-los em `index.html` e `tests/helpers/jogo.cjs` na ordem correta. Atualizar o inventário textual e os catálogos depois que o conteúdo estiver implementado.

Campos novos de calendário, encontro suspenso, efeito diário e marcas de recebimento precisam de validação e migração em `js/save.js`. Salvar e carregar nos estados de escolha e resultado, inclusive no encontro adicional. Não trocar um traço desconhecido silenciosamente por outro como efeito colateral deste trabalho; tratar compatibilidade por migração explícita e cobrir as runs válidas atuais.

## Debug: um único botão para liberar personagens

Adicionar um único botão **Liberar personagens** na área de debug. Ao acioná-lo, liberar todos os herdeiros cadastrados que exigem desbloqueio, incluindo Culto, Leste e Nórdico, e gravar as permissões no legado para que continuem disponíveis depois de recarregar. A ação não inicia nem substitui a run atual; a escolha do personagem continua na seleção de herdeiros.

Substituir os controles de debug exclusivos de personagem por esse botão, incluindo os que forçam Druida, Conselheiro ou Heroína do povo e os que iniciam um personagem diretamente. Preservar os demais controles de debug. Limpar ou ignorar as antigas preferências `debug_forcar_druida`, `debug_forcar_menino` e `debug_forcar_heroi`, para que elas não continuem forçando um personagem depois da mudança.

Usar um registro comum dos desbloqueios de herdeiros, consultado tanto pela seleção quanto pelo debug, para incluir personagens futuros sem criar outro botão. A liberação concede apenas as permissões de personagem: não simular vitórias, aceitar bênçãos, marcar objetivos como cumpridos nem conceder conquistas relativas às condições ignoradas. Exibir a confirmação de liberação somente depois de salvar; se a gravação falhar, informar a falha e permitir tentar novamente. Repetir a ação não duplica recompensas.

Testar a presença de apenas um botão de liberação, a remoção dos controles antigos, o desbloqueio dos personagens atuais e novos, a persistência após recarga e a seleção posterior. Conferir que a run atual permanece igual, que nenhuma conquista aparece por causa do debug e que as antigas preferências não alteram mais o personagem escolhido.

## Artes previstas

Seguir [MEMORIA-ILUSTRACOES.md](MEMORIA-ILUSTRACOES.md) por inteiro. Usar Corajoso, Avarento e Doente como referências diretas de busto, traço e tom claro; construir as variantes a partir da identidade neutra aprovada. A arte nasce em PNG com fundo transparente e o mesmo enquadramento do elenco, e vira WebP (qualidade 90, alfa 100, resolução original) para a interface.

Conferir em `js/ui.js` as oito variantes PNG usadas atualmente: neutra, alta, alta-2, altíssima, baixa, baixa-2, baixíssima e culto, além do SVG de referência. Prever 27 arquivos para os três herdeiros. O Herdeiro do Culto precisa de identidade própria mesmo antes da adesão; a Herdeira do Leste e o Nórdico também mantêm versões de honra e culto.

Direções propostas, sujeitas à revisão visual: tiara e vestido para a Herdeira do Leste; trajes com referências do Norte para o Nórdico; vestes ligadas ao culto para seu herdeiro, distinguindo o estado inicial do traje de adesão. Não copiar rostos de personagens existentes.

As artes das novas entidades seguem obrigatoriamente o padrão dos deuses nórdicos já adotado no jogo. Pela revisão do usuário, `assets/eventos-especiais/norte-thor.webp` é a referência principal de traço e cor; conferir os resultados com essa carta e evitar a tonalidade amarelada das primeiras propostas. As referências específicas de personagem enviadas pelo usuário definem roupas, anatomia e composição. Os novos herdeiros, inclusive o Nórdico, seguem o padrão dos retratos de herdeiros já definidos, com suas referências próprias de rosto simplificado, busto e marfim claro.

As novas cartas nórdicas usam WebP, qualidade 90, maior lado de 800 px e transparência quando aplicável. O plano prevê oito novas cartas para chegar a 20, incluindo Níðhöggr; a arte atual de Höðr continua em uso. Conferir a correspondência com as referências de cada categoria na revisão visual antes da entrega da implementação.

## Validação da implementação

Testar os atributos exatos, desbloqueio pela condição correta e bloqueio em condições parecidas. Cobrir vitória cultista antiga, migração e seleção sem desbloqueio. Conferir as conquistas no menu de legado e os avisos durante a partida.

Para o Culto: reserva inicial sem ativação, adesão resultando em 80, ausência de bônus repetido, arredondamento das perdas, mínimo 1, composição com Celeiro, seguidores sem proteção geral e adaga cobrando 5 para +10 Ataque e +5 Escudo. Verificar os requisitos de uso com 4 e 5 seguidores e o comportamento ao gastar os últimos seguidores.

Para o Leste: validar todos os pares sazonais permitidos, seis encontros em 300 dias, ausência de primeira aparição tardia e de terceira visita anual. Salvar e carregar antes da carta, na escolha, no resultado e após a retomada. Comprovar que cada dia rende e processa efeitos periódicos apenas uma vez, inclusive nos limites 25/26, 100/101 e no dia 300. Testar conflito com decisões de culto, eventos obrigatórios e derrota num encontro extra.

Para o Nórdico: uma passiva no primeiro dia e em cada dia seguinte; nenhuma repetição ao carregar ou usar item. Cobrir efeitos instantâneos, revelações, combate, expiração e convivência com um efeito divino comum. Garantir que Ataque e Escudo não acumulem indefinidamente e que terminar um modificador não crie atributos quando uma penalidade atingiu o mínimo zero.

Conferir 10 bênçãos e 10 maldições com IDs únicos, todas com arte existente. Executar `npm test`, `npm run lint` e `npm run format:check` após a implementação. Fazer simulações de runs completas para avaliar sobrevivência e frequência das cartas, sem alterar os valores pedidos sem registrar a proposta de ajuste. A revisão manual deve cobrir seleção, tooltips, seguidores reservados, retratos e retomada de encontros no celular.

## Registro da implementação

Os três herdeiros estão cadastrados com seleção, desbloqueios persistidos, conquistas, atributos, regras próprias e compatibilidade com saves. O catálogo agora contém 384 definições: as oito entidades nórdicas novas e o convite exclusivo **A chama guardada** somam nove cartas ao catálogo anterior. O convite permite ao Herdeiro do Culto aderir antes de perder todos os habitantes; as cartas com requisito de culto ativo também recebem o peso dobrado, mesmo quando seu tipo não é culto.

O Leste preserva a carta normal, as opções, a oferta do mercador e as recompensas do baú quando o zodíaco interrompe o dia. Encontros obrigatórios podem terminar primeiro; a visita pendente ocorre ainda no mesmo dia, antes da vitória no dia 300. A adesão ao culto durante a visita não invalida o save nem perde a carta suspensa.

As alternativas pagas das novas bênçãos duram 10 dias: Baldr reduz 4 de dano, Frigg concede +3 Escudo, Heimdall revela Honra e habitantes, Freyr concede +2 habitantes por dia. As versões básicas mantêm os valores da tabela. As alternativas pagas das maldições encurtam a duração para 5 dias.

Uma readesão ao culto concede 50 seguidores, sem recriar os 30 da reserva inicial. O botão **Liberar personagens** grava apenas as permissões de seleção; os controles individuais e as preferências antigas de personagem deixaram de forçar novos inícios.

As oito entidades nórdicas têm artes próprias em WebP, qualidade 90 e maior lado de 800 px, preservando proporção e transparência. Thor define a referência de traço e cor, conforme a revisão do usuário. Os arquivos e os prompts estão em [ARTES-EVENTOS-NORDICOS.md](ARTES-EVENTOS-NORDICOS.md). Os novos herdeiros continuam usando `assets/selo.svg` como retrato provisório e serão produzidos um por vez.

Validações: 153 testes automatizados passaram, assim como lint, conferência de formatação e git diff --check. Também executei nove simulações do catálogo real, três por novo herdeiro. Todas chegaram ao dia 300 com saves válidos; as três partidas do Leste resolveram seis encontros zodiacais. A estratégia automática compara as consequências das escolhas e não representa a experiência de um jogador sem conhecimento prévio. Os testes incluem partidas de 300 dias com save e carregamento em cada escolha e resultado, cobrindo os pares sazonais.

## Checklist de entrega

- [x] Conferir as regras atuais e implementar os três herdeiros com prioridade sobre o backlog anterior.
- [x] Integrar atributos, passivas, desbloqueios, conquistas e compatibilidade dos saves.
- [x] Implementar calendário sem passagem de dia e persistência dos encontros do Leste.
- [x] Completar 10 bênçãos e 10 maldições, incluindo Níðhöggr e os efeitos adicionais de Fenrir e Hrym.
- [x] Substituir os controles individuais por um único botão de debug para liberar personagens.
- [x] Atualizar documentação e catálogos, mantendo as referências obrigatórias das artes.
- [x] Executar 153 testes, lint, conferência de formatação e nove simulações completas.
- [x] Produzir e revisar as oito artes nórdicas, usando Thor como referência principal e incorporando as referências de personagem enviadas.
- [ ] Produzir e revisar os retratos dos novos herdeiros, um por vez, depois dos eventos.
- [ ] Conferir visualmente a interface no navegador e no celular; os testes de renderização não substituem essa revisão.

Resultado: implementação funcional e oito artes próprias dos novos eventos nórdicos entregues. Os testes cobrem as regras e a persistência; o relatório das imagens confere formato, resolução, transparência e comparação de cor. Permanecem pendentes os retratos dos herdeiros e a revisão visual manual no navegador e no celular.
