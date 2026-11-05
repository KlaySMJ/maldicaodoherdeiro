# Plano de melhorias — A maldição do Herdeiro

Sugestões levantadas na análise do catálogo atual (270 eventos, 750 opções, 76 itens).

> As contagens abaixo são o diagnóstico anterior às mudanças. O registro de execução ao fim deste arquivo aponta o que foi alterado e as auditorias que confirmaram itens já cobertos.

## 1. Gameplay

- [x] **Tela de escolha do herdeiro** — lista os traços disponíveis e os bloqueados, incluindo o Druida e o Menino da Crônica.
- [x] **Condição de vitória** — concluir o primeiro ano da crônica (100 rodadas); runs derrotadas antes disso continuam derrotas.
- [x] **Histórico da crônica** — as últimas 12 escolhas e seus desfechos aparecem na tela da run.
- [x] **Atalhos de teclado** — `1`–`4` escolhem a opção, `Enter` continua.
- [x] **Exportar/importar progresso** — backup JSON com legado e run, com validação e migração de traços desconhecidos.

## 2. Áudio

Na análise original: 4 loops e **zero efeitos sonoros** (`js/audio.js:4-9`).

- [x] **SFX** — cinco efeitos sintetizados localmente: virada, confirmação, impacto, moedas e sino do culto.
- [x] **Ducking** — a música baixa durante batalha e resultado.
- [x] **Mais contextos** — loops próprios para as quatro estações e batalhas, além de menu, intro, jogo e culto.
- [x] **Pausar ao trocar de aba** — música e efeitos pausam com `visibilitychange`.
- [x] **Volume separado** — controles independentes de música e efeitos.
- [x] **Testabilidade** — o módulo de áudio tolera ausência de DOM e armazenamento local.
- [ ] **Opcional:** converter os 4 WAV (4,91 MB em 22050 Hz) para Ogg/MP3.

## 3. Design

- [x] **Aquecer a paleta da UI** — fundo `#0a0908`, superfícies em carvão quente e texto marfim.
- [x] **Faixas de honra no fundo da carta** — a carta recebe um tom sutil conforme a faixa de honra.
- [ ] **Arte para eventos genéricos** — a medição original encontrou `assets/vila.webp` em **78** cartas e o retrato do conselheiro em **30**. Trinta e seis cartas agora usam WebPs temáticos existentes; referências dinâmicas permanecem e cenas sem arte compatível continuam com a vila.


## 4. Balanceamento

| Dado medido | Valor | Leitura |
|---|---|---|
| Eventos **sem** `rodadaMin` (medição original) | **167 de 270** | disponíveis desde a rodada 1 |
| Gates ≥ rodada 31 (medição original) | **0** | nenhum conteúdo tardio por rodada |
| Batalhas | 16 (defesa base 2–7) | ataque inicial 2–4 → quase tudo vence cedo |
| Efeitos honra / escudo / ataque | **550** / 42 / 49 | escolhas de combate são pobres vs. morais |
| Opções com `testeSorte` | **35 de 750 (4,7%)** | jogo quase 100% determinístico |
| Eventos com peso 0 / ≥3 | 10 / 30 | sorteio concentrado |
| Renda | 1 gold a cada 3 rodadas por 50 hab. | a poção de 5 Gold já cabe no saldo inicial; arma/escudo de 10 Gold ficam ao alcance por volta da rodada 15 se o ouro for guardado |

- [x] **Dar progressão por rodada** — 39 eventos existentes ganharam marcos entre as rodadas 8 e 50, além de eventos tardios novos.
- [x] **Endurecer as batalhas tardias** — a dificuldade cresce a cada 10 rodadas e ganha estágios extras a cada 20 rodadas após a 30.
- [ ] **Equilibrar os atributos** — os eventos novos dão mais caminhos para ataque e escudo, mas a distribuição geral de honra ainda precisa de uma revisão de balanceamento.
- [x] **Mais moeda sob risco** — novas opções de sorte colocam ouro e recursos em risco e trazem alternativas de combate/defesa.
- [x] **Revisar a economia inicial** — com 5 Gold iniciais, a poção de 5 é acessível desde o começo e arma/escudo de 10 ficam ao alcance por volta da rodada 15 com 50 habitantes e sem outras compras. Preços preservados; a conta estática precisa de validação em partidas reais.

## 5. Novas features

- [x] **Vitrine de desbloqueios** — o menu mostra objetivos, conteúdo desbloqueado, melhores crônicas e progresso do herdeiro.
- [x] **Condição de vitória + registro de melhores runs** (ver Gameplay).
- [x] **Exportar/importar progresso** (ver Gameplay).

## 6. Novos eventos

- [x] **Progressão tardia do primeiro ano** — eventos existentes têm gates a partir da rodada 31; três eventos novos surgem nas rodadas 35, 55 e 75. A vitória chega ao completar 100 rodadas.
- [x] **Batalhas com escolha** — auditoria das 16 batalhas confirmou de uma a três opções não combativas em cada uma; a sugestão original já estava coberta.
- [x] **Construções com cadeia própria** — auditoria confirmou eventos ou efeitos para as dez construções listadas; a sugestão original já estava coberta.
- [x] **Eventos exclusivos por traço** — linhas novas para Corajoso, Avarento e Doente complementam a do Druida.
- [x] **Eventos condicionados ao legado** — a assembleia das raízes requer o desbloqueio do objetivo do Druida.
- [x] **Mais eventos sazonais** — novos eventos anuais cobrem primavera, verão, outono e inverno.

## 7. Novos herdeiros desbloqueáveis

**Custo por herdeiro** (medido em `assets/herdeiros/`):

| Peça | Arquivos |
|---|---|
| Corajoso / Avarento / Doente | **15 cada** (8 PNG: 7 faixas + culto, e 7 SVG) |
| Druida-Herdeiro | **9** (8 PNG + 1 SVG) |
| Menino da Crônica | **15** (8 PNG + 7 SVG) |

**Onde tocar para adicionar um traço — 9 pontos:**

1. [x] `js/state.js` — pool e condição de desbloqueio
2. [x] `js/state.js` — seleção explícita do traço
3. [x] `js/state.js` — atributos iniciais (70 Vida, 3 Escudo)
4. [x] `js/ui.js` — nome e descrição
5. [x] `js/ui.js` — retratos e caminhos de arquivo
6. [x] `js/ui.js` — tela de escolha
7. [x] `js/save.js` — validação do traço
8. [x] `js/save.js` — migração que degrada traços desconhecidos para Corajoso
9. [x] `js/legacy.js` — memórias e recordes aceitam o novo traço

Os retratos incluem oito PNGs e sete SVGs em `assets/herdeiros/`.

Na variante do Menino da Crônica, honra negativa usa expressão raivosa; honra alta não tem louros; honra máxima tem roupa contida; a variante do culto usa vermelho e expressão maligna.

> O loader atual converte um traço desconhecido em Corajoso, preservando a run. Versões antigas ainda não reconhecem esse herdeiro.

**Herdeiros sugeridos** (todos aproveitam `requisitos.tracos`, que já existe):

| Herdeiro | Início | Identidade | Desbloqueio | Estado |
|---|---|---|---|---|
| **A Viúva** | 15 gold, honra −10 | economia e legado; perde habitantes com facilidade | encerrar uma run com ≥100 gold | backlog |
| **O Menino da Crônica** | 70 Vida, escudo 3 | fecha o círculo do órfão | acolher o órfão com honra e torná-lo conselheiro | implementado |
| **O Herege** | honra inicial −20 | honra extrema; interage com o culto | aderir ao culto e sobreviver 20 rodadas | backlog |
| **O Veterano** | ataque 4, escudo 2 | batalha; compensa a fraqueza atual de Ataque | vencer 10 batalhas em uma run | backlog |
| **A Usurária** | 20 gold, habitantes 40 | riqueza em troca de população | completar a cadeia do mercador | backlog |

O **Druida já é o modelo**: 8 PNG, 1 SVG, desbloqueio por `desbloqueia.flags` (`js/events-pactos.js:275`) e entrada na pool em `js/state.js:93`.

---

## Ordem sugerida

1. [x] **Vitrine de desbloqueios + tela de escolha de herdeiro**.
2. [x] **Progressão por rodada** em parte dos eventos sem gate.
3. [x] **SFX gerados no `generate_music.cjs`** sem assets externos.
4. [x] **Aquecer a paleta da UI** para casar com a arte em marfim.
5. [x] **Novo herdeiro** após integrar validação, migração, legado e retratos.

## Registro da execução

- A primeira vitória acontece ao concluir 100 rodadas; a objetiva do Druida foi ajustada para um ano para continuar alcançável.
- A arte temática reaproveita WebPs existentes. As cenas ainda sem imagem específica continuam com `vila.webp`; retratos de conselheiro mantêm seus usos dinâmicos.
- A economia inicial foi revisada por cálculo: 5 Gold iniciais pagam a poção; guardando o ouro e mantendo 50 habitantes, arma ou escudo de 10 Gold ficam ao alcance por volta da rodada 15. Preços preservados; a validação em partidas reais continua pendente.
- A conversão opcional de WAV para Ogg/MP3 e a revisão ampla do peso de honra continuam pendentes.
