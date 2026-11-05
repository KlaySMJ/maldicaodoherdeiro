# Plano de melhorias — A maldição do Herdeiro

Sugestões levantadas na análise do catálogo atual (270 eventos, 750 opções, 76 itens).

## 1. Gameplay

- [ ] **Tela de escolha do herdeiro** — o traço é sempre aleatório (`js/state.js:92-95`). `iniciar(personagem)` (`js/main.js:53`) já aceita o parâmetro, mas nenhum botão da UI o passa (só o toggle de debug `debug_forcar_druida`). O jogador desbloqueia o Druida ao poupar o cervo (`js/events-pactos.js:275`) e pode nunca jogar com ele.
- [ ] **Condição de vitória** — o jogo só termina em derrota ou em "sem eventos elegíveis" (`js/engine.js:1282`, na prática nunca acontece). Sem meta, a run não tem arco.
- [ ] **Histórico da crônica** — hoje só `run.eventosRecentes` (10 IDs) e `logItens`. Mostrar as últimas N escolhas e seus desfechos reforça o mote "o povo lembra".
- [ ] **Atalhos de teclado** — `1`–`4` escolhem a opção, `Enter` continua.
- [ ] **Exportar/importar progresso** — hoje tudo vive só no `localStorage` (`js/save.js:4-5`), sem backup manual.

## 2. Áudio

Hoje: 4 loops, **zero efeitos sonoros** (`js/audio.js:4-9`).

- [ ] **SFX** — virada de carta, confirmação, impacto de batalha, moedas, sino do culto. O `scripts/generate_music.cjs` já gera tudo por osciladores PCM (`note()`, `pulso()`, `delayRoom()`), então dá para gerar os SFX sem nenhum asset externo: uma função `sfx()` e um canal separado.
- [ ] **Ducking** — baixar a música no resultado/batalha; reaproveitar o crossfade de `transicionar()` (`js/audio.js:38`).
- [ ] **Mais contextos** — hoje são `menu/intro/jogo/culto`. `definirContexto()` aceita qualquer chave; dá para variar por estação ou faixa de honra sem tocar na engine.
- [ ] **Pausar ao trocar de aba** — não há `visibilitychange`.
- [ ] **Volume separado** — música e efeitos em controles distintos.
- [ ] **Testabilidade** — `js/audio.js:10-12` lê o DOM no topo do módulo e lança `ReferenceError` sem `document`, por isso tem 0% de cobertura. Envolver em `?.` já permitiria carregá-lo nos testes.
- [ ] **Opcional:** converter os 4 WAV (4,91 MB em 22050 Hz) para Ogg/MP3.

## 3. Design

- [ ] **Aquecer a paleta da UI** — `css/style.css:3-5`: `--papel`, `--papel-claro` e `--papel-escuro` são **os três `#000`** (variáveis mortas) e `--tinta: #fff`. A direção de arte usa luz `#D6CAB6` (`MEMORIA-ILUSTRACOES.md:18`) e o filtro `tom-vila` empurra as imagens para essa tonalidade. **A interface é fria, a arte é quenta.** Proposta: fundo `#0a0908`, texto `#EDE4D3`.
- [ ] **Faixas de honra no fundo da carta** — já recoloram borda e número; tingir sutilmente o fundo por faixa, com a mesma técnica do `feColorMatrix`, reforça a mecânica central.
- [ ] **Arte para eventos genéricos** — 270 cartas, só 115 imagens distintas: `assets/vila.webp` em **78** e `conselheiro.webp` em **30**. Seguir a `MEMORIA-ILUSTRACOES.md`, sem redesenhar o que já existe.


## 4. Balanceamento

| Dado medido | Valor | Leitura |
|---|---|---|
| Eventos **sem** `rodadaMin` | **167 de 270** | disponíveis desde a rodada 1 |
| Gates ≥ rodada 31 | **0** | nenhum conteúdo tardio por rodada |
| Batalhas | 16 (defesa base 2–7) | ataque inicial 2–4 → quase tudo vence cedo |
| Efeitos honra / escudo / ataque | **550** / 42 / 49 | escolhas de combate são pobres vs. morais |
| Opções com `testeSorte` | **35 de 750 (4,7%)** | jogo quase 100% determinístico |
| Eventos com peso 0 / ≥3 | 10 / 30 | sorteio concentrado |
| Renda | 1 gold a cada 3 rodadas por 50 hab. | arma de 10 gold ≈ 30 rodadas sem eventos |

- [ ] **Dar progressão por rodada** — `rodadaMin` em parte dos 167 eventos sem gate cria uma curva real; hoje o conteúdo "tardio" depende só de flags e estações.
- [ ] **Endurecer as batalhas tardias** — a escala é +1 defesa a cada 10 rodadas (`js/engine.js:233`) sobre base 2–7; comprar arma cedo zera a ameaça.
- [ ] **Equilibrar os atributos** — escudo e ataque mudam em 42/49 opções contra 550 de honra.
- [ ] **Mais moeda sob risco** — só 4,7% das opções têm `testeSorte`; o jogo é determinístico demais para gerar tensão.
- [ ] **Revisar a economia** — confirmar se 1 gold/3 rodadas não torna o mercador irrelevante nas primeiras 30 rodadas.

## 5. Novas features

- [ ] **Vitrine de desbloqueios** — a infraestrutura existe e está quase ociosa: `Jogo.objetivosLegado` tem **1 objetivo** (`js/legacy.js:21`), `desbloqueia` é usado 24 vezes mas **0 com `eventos`**, `bloqueado: true` 1 vez, `requerDesbloqueio` 1 item. Falta só a tela. É o menor esforço e a maior recompensa.
- [ ] **Condição de vitória + registro de melhores runs** (ver Gameplay).
- [ ] **Exportar/importar progresso** (ver Gameplay).

## 6. Novos eventos

- [ ] **Linha "ano 2+"** com `rodadaMin` ≥ 30 — hoje **zero** eventos nessa faixa.
- [ ] **Batalhas com escolha** — das 16, o padrão é atacar ou falhar; fuga, negociação ou trariam dão peso ao Ataque.
- [ ] **Construções com cadeia própria** — `nomesConstrucoes` (`js/ui.js:74-85`) lista 10 construções, mas nem todas têm eventos de construção/quebra.
- [ ] **Eventos exclusivos por traço** — a máquina já existe e é usada: `requisitos.tracos` em 7 eventos do druída (`events-druida.js`) e 3 opções (`events-foundations.js:40-42`). Só o Druida tem linha própria.
- [ ] **Eventos condicionados ao legado** — usar `requerDesbloqueio`/`bloqueado` em eventos (hoje: zero). Fecha o ciclo com a vitrine.
- [ ] **Mais eventos sazonais** — já existem 4 (uma por estação); as estações mudam a cada 25 rodadas e são o único senso de tempo.

## 7. Novos herdeiros desbloqueáveis

**Custo por herdeiro** (medido em `assets/herdeiros/`):

| Peça | Arquivos |
|---|---|
| Corajoso / Avarento / Doente | **15 cada** (8 PNG: 7 faixas + culto, e 7 SVG) |
| Druida-Herdeiro | **9** (8 PNG + 1 SVG) |

**Onde tocar para adicionar um traço — 9 pontos:**

1. `js/state.js:92-93` — `poolTracos` + condição de desbloqueio
2. `js/state.js:94-95` — escolha do traço (generalizar o `personagem === "druida_herdeiro"`)
3. `js/state.js:96-101` — `iniciaisTraco`
4. `js/ui.js:45` — `nomesTraco`
5. `js/ui.js:52` — `descricoesTraco`
6. `js/ui.js:58` — `retratos`
7. **`js/save.js:78`** — `runValida` **rejeita traço desconhecido**
8. `js/save.js:242` — migração ao carregar
9. `js/legacy.js:12` — whitelist de `registro.traco` nas memórias

> ⚠️ **Atenção ao ponto 7:** se um save for gravado com um traço novo e o código reverter (ou o save abrir em versão antiga), **a run inteira é descartada** como corrompida. Criar o herdeiro com todos os 9 pontos antes de qualquer coisa, ou adicionar migração que degrade o traço em vez de descartar.

**Herdeiros sugeridos** (todos aproveitam `requisitos.tracos`, que já existe):

| Herdeiro | Início | Identidade | Desbloqueio |
|---|---|---|---|
| **A Viúva** | 15 gold, honra −10 | economia e legado; perde habitantes com facilidade | encerrar uma run com ≥100 gold |
| **O Menino da crônica** | 70 hp, escudo 3 | fecha o círculo do órfão (`orfao_acolhido` já existe) | acolher o órfão e nomeá-lo conselheiro |
| **O Herege** | honra inicial −20 | honra extrema; interage com o culto | aderir ao culto e sobreviver 20 rodadas |
| **O Veterano** | ataque 4, escudo 2 | batalha; compensa a fraqueza atual de Ataque | vencer 10 batalhas em uma run |
| **A Usurária** | 20 gold, habitantes 40 | riqueza em troca de população | completar a cadeia do mercador |

O **Druida já é o modelo**: 8 PNG, 1 SVG, desbloqueio por `desbloqueia.flags` (`js/events-pactos.js:275`) e entrada na pool em `js/state.js:93`.

---

## Ordem sugerida

1. **Vitrine de desbloqueios + tela de escolha de herdeiro** — resolve a maior falha de gameplay reaproveitando legado que já existe.
2. **`rodadaMin` em parte dos 167 eventos sem gate** — cria progressão com uma linha por evento, sem arte nem áudio.
3. **SFX gerados no `generate_music.cjs`** — zero asset externo, dá vida a um jogo silencioso.
4. **Aquecer a paleta da UI** para casar com a arte em marfim.
5. **Novo herdeiro**, só depois de unificar os 9 pontos de registro.
