# Herdeiros futuros — especificação de implementação

> Prioridade atual: implementar primeiro os herdeiros de [Culto, Leste e Norte](PLANO-HERDEIROS-PRIORITARIOS.md). Este documento contém referências antigas: o Conselheiro (`menino_cronista`) já está cadastrado, assim como a Heroína do povo, e os registros e números de linha abaixo precisam de conferência antes do uso.

Especificação dos cinco herdeiros desbloqueáveis planejados. Cada um segue o modelo do **Druida-Herdeiro**, que já funciona de ponta a ponta.

> **Regra de ouro:** implementar os **9 pontos de registro num único commit**, com testes verdes no final. O ponto 7 (`js/save.js:78`) descarta a run inteira se o traço não for reconhecido.

---

## Como o desbloqueio funciona hoje

Há **dois caminhos**, ambos existentes e em uso:

**Caminho A — flag em uma opção** (como o Druida)
```js
// js/events-pactos.js:275
"desbloqueia": { "flags": ["druida_herdeiro"] }
```
`js/engine.js:810` chama `Jogo.legado.conceder(run, opcao.desbloqueia)` a cada escolha → a flag vai para `run.conquistas.flags` → vira `legado.flags`.

**Caminho B — objetivo de legado** (para condições agregadas)
```js
// js/legacy.js:21-25 — formato documentado na linha 20
Jogo.objetivosLegado.push({
  id: "viuva_rica",
  condicao: run => run.atributos.gold >= 100,
  desbloqueia: { flags: ["viuva"] }
});
```
`Jogo.legado.avaliar(run)` roda em **duas** ocasiões: a cada escolha (`js/engine.js:811`) e no encerramento (`js/engine.js:481`). Uma condição de fim de run funciona sem tocar na engine.

**Depois disso**, a flag entra na pool em `js/state.js:92-93`:
```js
const poolTracos = ["corajoso", "avarento", "doente"];
if (legadoDaRun.flags.druida_herdeiro === true) poolTracos.push("druida_herdeiro");
```

### Requisitos disponíveis em `cumpre` (`js/engine.js:122-152`)

| Requisito | Efeito |
|---|---|
| `flags: [...]` | flag presente e `true` em `run.flags` |
| `flagsAusentes: [...]` | flag ausente ou falsa |
| `flagsLegado: [...]` | flag em `run.legadoDaRun.flags` (desbloqueio anterior) |
| `rodadasDesde: { marco: n }` | `run.rodada - run.marcos[marco] >= n` |
| `rodadaMin` / `rodadaMax` / `estacao` / `tracos` | óbvios |
| `qualquer: [ ... ]` | disjunção — **novo nesta versão** (`js/engine.js:124`) |

---

## Checklist dos 9 pontos (vale para todos)

| # | Arquivo / linha | O que muda |
|---|---|---|
| 1 | `js/state.js:92-93` | `poolTracos.push("<id>")` sob a condição `legadoDaRun.flags.<id> === true` |
| 2 | `js/state.js:94-95` | **Generalizar** a escolha: hoje `personagem === "druida_herdeiro"` é fixo. Trocar por `poolTracos.includes(personagem)` |
| 3 | `js/state.js:96-101` | Entrada em `iniciaisTraco` |
| 4 | `js/ui.js:45` | `nomesTraco.<id>` |
| 5 | `js/ui.js:52-56` | `descricoesTraco.<id>` |
| 6 | `js/ui.js:58-63` | `retratos.<id> = { arquivo, descricao }` |
| 7 | **`js/save.js:78`** | Whitelist do `runValida` — **crítico** |
| 8 | `js/save.js:242` | Migração ao carregar (`if (dados.traco === ...)`) |
| 9 | `js/legacy.js:12` | Whitelist de `registro.traco` nas memórias |

**Adicional (se tiver linha própria de eventos):**

| # | Arquivo | O que muda |
|---|---|---|
| 10 | `js/events-<id>.js` | Novo arquivo, `Jogo.registrarEventos(...)` |
| 11 | `index.html:15-38` | Incluir na lista `arquivos` (antes de `events-ajustes.js`) |
| 12 | `tests/helpers/jogo.cjs:33-39` | Incluir na lista de carga dos testes |
| 13 | `js/legacy.js:21-25` | `objetivosLegado` com a condição de desbloqueio (Caminho B) |

### ⚠️ Ponto 7 — o risco

`js/save.js:78`:
```js
if (!(["corajoso", "avarento", "doente", "druida_herdeiro"].includes(run.traco)) ...
```
Save gravado com traço novo + código revertido = **run descartada como corrompida**.

**Exigência:** além de incluir o novo id, fazer o `runValida` **degradar** em vez de descartar:
```js
if (!TRACOS_VALIDOS.includes(run.traco)) run.traco = "corajoso"; // em vez de retornar false
```
Isso vale para os 4 ids atuais também.

### Arte por herdeiro

#### Base visual obrigatória para construir um herdeiro

- Antes de gerar ou revisar um herdeiro, consultar `MEMORIA-ILUSTRACOES.md` por inteiro.
- Usar `assets/herdeiros/corajoso-neutra.png`, `avarento-neutra.png` e `doente-neutra.png` como referências visuais diretas, junto da arte neutra do personagem em construção para preservar sua identidade. Não basta descrever o estilo em texto.
- O resultado precisa pertencer ao mesmo elenco: busto transparente com enquadramento e proporção equivalentes, contorno preto espesso e irregular, formas simplificadas, hachura econômica, marfim e preto com dourado pequeno e localizado.
- Preservar o rosto e os traços próprios do novo personagem. Tomar o elenco como base de estilo e composição, sem copiar rosto, coroa, roupa ou símbolos exclusivos de outro herdeiro.
- Construir as variantes de honra e culto a partir da imagem neutra aprovada, mantendo o mesmo rosto, idade, cabelo e proporção. A roupa deve carregar a maior parte da mudança de estado; a expressão muda pouco e acompanha o traje, sem ser a única diferença visível.
- Distinguir cada faixa por corte, cor, condição e acabamento próprios da roupa. A expressão deve continuar reconhecível como a mesma pessoa; exceções como raiva na honra negativa ou malícia no culto devem ser sutis e explícitas no pedido.
- Distinguir a variante de culto com roupa própria e acentos pedidos — para o Menino da Crônica, tecido vermelho e expressão um pouco maliciosa. Ela continua na linguagem visual do elenco, sem mudar para outro estilo de desenho.

#### Aplicação no Menino da Crônica

- A arte neutra e as sete variantes devem seguir as referências dos outros herdeiros no contorno, simplificação do rosto, proporção do busto, coroa pequena e fundo transparente.
- As faixas de honra se distinguem principalmente pela roupa: limpa e bem cortada nas faixas altas, mais escura, gasta e remendada nas negativas. A expressão varia pouco; nas negativas fica irritada sem exagero.
- Honra máxima usa roupa formal simples, sem louros e sem camadas volumosas. O culto tem traje vermelho próprio e sorriso discretamente malicioso.

`js/ui.js:488-492` monta o caminho: `assets/herdeiros/<arquivo>-<faixa>.png`

| Peça | Qtd | Faixas (`js/ui.js:67-74`) |
|---|---|---|
| PNG | **8** | `neutra`, `alta`, `alta-2`, `altissima`, `baixa`, `baixa-2`, `baixissima`, `culto` |
| SVG | **1** | retrato de referência (como `druida-herdeiro.svg`) |
| **Total** | **9** | |

`caminhoRetrato` tem um ramo fixo para `druida_herdeiro` (`js/ui.js:490`) — **não é preciso** adicionar ramo novo: o caminho genérico das linhas 491-492 já serve para qualquer traço com `retratos[<id>].arquivo`.

Antes de qualquer arte: ler `MEMORIA-ILUSTRACOES.md` **por inteiro**. Retratos ficam em **PNG/SVG** — não converter para WebP.

---

# 1. A Viúva

| Campo | Valor |
|---|---|
| ID do traço | `viuva` |
| Nome na UI | `A Viúva` |
| Arquivo de arte | `viuva` (→ `viuva-alta.png`, etc.) |
| Início | `{ ...Jogo.config.iniciais, gold: 15, honra: -10 }` |
| Identidade | economia e legado; aguenta perda de habitantes melhor que os demais |
| Desbloqueio | **Caminho B** — encerrar uma run com ≥ 100 gold |

**Objetivo de legado:**
```js
{ id: "viuva_rica", condicao: run => run.atributos.gold >= 100,
  desbloqueia: { flags: ["viuva"] } }
```

**Balanceamento a testar:** 100 gold é bastante — a renda dá 1 gold a cada 3 rodadas por 50 habitantes, mas há eventos de +12/+15 gold e a `mercador_sem_sombra` vende sombra por 15. Se achado impossível, baixar para 80.

**Linha própria:** `js/events-viuva.js`, 6–8 eventos com `requisitos: { tracos: "viuva" }`
- Cadeia de cobranças de dívidas e heranças
- Pelo menos um evento por estação (`requisitos.estacao` já funciona)
- Reaproveitar `mercador_sem_sombra` (`js/events-pactos.js:123`) como contraponto

**Sem campo novo na run** — é o herdeiro mais seguro para começar.

---

# 2. O Menino da crônica

| Campo | Valor |
|---|---|
| ID do traço | `menino_cronica` |
| Nome na UI | `O Menino da crônica` |
| Arquivo de arte | `menino-cronica` |
| Início | `{ ...Jogo.config.iniciais, hp: 70, escudo: 3 }` |
| Identidade | fecha o círculo do órfão; começa frágil mas com escudo |
| Desbloqueio | **Caminho B** — a run acolheu o órfão **e** nomeou-o conselheiro |

**A cadeia JÁ EXISTE INTEIRA no jogo.** Nada precisa ser construído:

| Etapa | Onde | O que faz |
|---|---|---|
| 1. Acolher o órfão | `js/events.js:249,251` | `flags: { orfao_acolhido: true }` + `marcoRodada: { id: "menino_adotado", honraMin: 50, flag: "menino_adotado_com_honra" }` |
| 2. Esperar 40 rodadas | `js/events-personagens-cadeias.js:57` | `requisitos: { flags: ["menino_adotado_com_honra"], rodadasDesde: { menino_adotado: 40 } }` |
| 3. **Nomear conselheiro** | `js/events-personagens-cadeias.js:62` | opção `nomear` → `flags: { menino_conselheiro: true, mao_do_rei_resolvida: true }` |
| 4. Conselhos do menino | `js/events-personagens-cadeias.js:67,75,83` + `js/events-conselheiro.js:42` | 3+ eventos condicionados a `menino_conselheiro` |

⚠️ A etapa 2 exige honra ≥ 50 **no momento do acolhimento** (para gravar `menino_adotado_com_honra`). Sem isso, a cadeia não anda. Documentar isso na descrição do herdeiro.

**Objetivo de legado:**
```js
{ id: "menino_conselheiro",
  condicao: run => run.flags.orfao_acolhido === true && run.flags.menino_conselheiro === true,
  desbloqueia: { flags: ["menino_cronica"] } }
```

**Linha própria:** `js/events-menino.js`, 5–7 eventos. Usar `requisitos.flagsLegado: ["menino_cronica"]` para eventos que só fazem sentido **depois** do desbloqueio.

**Sem campo novo na run** — `menino_conselheiro` e `orfao_acolhido` já são gravados e persistidos.

---

# 3. O Herege

| Campo | Valor |
|---|---|
| ID do traço | `herege` |
| Nome na UI | `O Herege` |
| Arquivo de arte | `herege` |
| Início | `{ ...Jogo.config.iniciais, honra: -20 }` |
| Identidade | honra extrema oposta ao Corajoso; vive em conflito com o culto |
| Desbloqueio | **Caminho B** — aderir ao culto e sobreviver 20 rodadas depois |

**Infra existente:**
- `js/engine.js:424` — grava `run.marcos.cultoAdesao = run.rodada` ao entrar no culto
- `js/engine.js:427` — `Jogo.legado.conceder(run, { flags: ["culto_conhecido"] })`
- `js/events-cult.js:10` — já usa `rodadasDesde: { cultoAdesao: rodadaMin }` (o padrão existe)

**Objetivo de legado:**
```js
{ id: "herege_sobrevivente",
  condicao: run => Number.isSafeInteger(run.marcos?.cultoAdesao)
    && run.rodada - run.marcos.cultoAdesao >= 20,
  desbloqueia: { flags: ["herege"] } }
```
`avaliar` roda a cada escolha, então dispara exatamente na rodada 20 do culto — não precisa esperar o fim da run.

**Linha própria:** `js/events-herege.js`, 6–8 eventos. Interação direta com `js/events-cult.js`: opções que **recusam** o culto com honra alta e o **abandonam** (`js/events-cult.js:97` já tem `dissolverCulto`).

⚠️ **Honra inicial −20 com `honraBaixa: -30`** (`js/state.js:13`) fica a 10 pontos dos limiares de aparência baixa — rodar o teste das faixas de retrato antes de definir os eventos iniciais.

⚠️ **`run.marcos` é validado** em `js/save.js:113-116`: toda entrada precisa ser `inteiro >= 1 && <= run.rodada`. Não inventar marcos fora dessa faixa.

---

# 4. O Veterano

| Campo | Valor |
|---|---|
| ID do traço | `veterano` |
| Nome na UI | `O Veterano` |
| Arquivo de arte | `veterano` |
| Início | `{ ...Jogo.config.iniciais, ataque: 4, escudo: 2 }` |
| Identidade | batalha; compensa a fraqueza atual de Ataque no balanceamento |
| Desbloqueio | **Caminho B** — vencer 10 batalhas em uma run |

**⚠️ É o único que exige campo novo na run.**

Hoje **não há contador de vitórias**. O resultado do combate é decidido em `js/engine.js:498`:
```js
const venceu = !batalha.forcarDerrota && (lancaAtiva || adagaAtiva || run.atributos.ataque + bonusAtaque + ... >= defesa);
```

**O que construir:**

1. **`js/state.js`** — em `novo()`, junto aos outros campos (`js/state.js:112-135`):
   ```js
   batalhasVencidas: 0,
   ```
2. **`js/engine.js:498-499`** — incrementar quando `venceu`:
   ```js
   const desfecho = venceu ? batalha.vitoria : batalha.derrota;
   if (venceu) run.batalhasVencidas = (run.batalhasVencidas || 0) + 1;
   ```
3. **`js/save.js`** — três lugares:
   - `runValida`: exigir `inteiro(run.batalhasVencidas) && run.batalhasVencidas >= 0`
   - migração de load (perto da linha 172, onde `comprasMercador` é injetado): `if (!Object.hasOwn(dados, "batalhasVencidas")) dados.batalhasVencidas = 0;`
4. **`js/legacy.js`** — objetivo:
   ```js
   { id: "veterano_vitorioso",
     condicao: run => (run.batalhasVencidas || 0) >= 10,
     desbloqueia: { flags: ["veterano"] } }
   ```

**Ordem importa:** campo novo sem migração = saves antigos rejeitados em `runValida`. Fazer o passo 3 **antes** de liberar.

**Linha própria:** `js/events-veterano.js`, 6–8 eventos, todos com `batalha:` ou opções `combate: true`. É o herdeiro que dá sentido à sugestão **B3** do plano (equilibrar Ataque/escudo).

⚠️ As batalhas escalam `+1 defesa a cada 10 rodadas` (`js/engine.js:233-236`); com ataque inicial 4, vencer 10 é factível mas exige cuidado. Testar a curva.

---

# 5. A Usurária

| Campo | Valor |
|---|---|
| ID do traço | `usuraria` |
| Nome na UI | `A Usurária` |
| Arquivo de arte | `usuraria` |
| Início | `{ ...Jogo.config.iniciais, gold: 20, habitantes: 40 }` |
| Identidade | riqueza em troca de população |
| Desbloqueio | **Caminho B** — acumular compras no mercador |

**Não existe "cadeia do mercador" com flag final** — verifiquei: `desbloqueia.flags` em eventos de mercador só tem `pacto_feito`, `antecessor_visto`, `vontade_completa`, `coroa_tomada`, `senhor_compreendido`, `vontade_ouvida`, `sucessor_pressentido`, `ano_novo_ativo` — nenhum marca o fim de uma cadeia comercial.

**O que existe de verdade:** `run.comprasMercador` (`js/state.js:123`) — objeto `{ [idMercadoria]: contagem }`, incrementado em `js/engine.js:866` e `js/engine.js:1123`, validado em `js/save.js:125`, migrado em `js/save.js:172`.

**Objetivo de legado:**
```js
{ id: "usuraria_ascendente",
  condicao: run => Object.values(run.comprasMercador || {})
    .reduce((total, n) => total + n, 0) >= 6,
  desbloqueia: { flags: ["usuraria"] } }
```
(6 compras em uma run — testar se é alcançável dado que cada compra encarece o produto em 2 gold.)

**Alternativa mais temática** (se preferir riqueza sobre comércio): acumular 2 itens lendários no inventário — `run.itensConquistados` já é persistido e validado.

**Linha própria:** `js/events-usuraria.js`, 6–8 eventos de cobrança, penhora e empréstimo. Combinar com `requisitos.goldMin` alto — ela só aparece para quem tem ouro.

⚠️ Início com 40 habitantes e a manutenção (`js/state.js:11`: perda de 1/rodada abaixo de 20 hab.) — ela começa acima do limiar, então sobrevive mais fácil no começo. Compensar nos eventos.

**Sem campo novo na run.**

---

## Sequência de implementação (por herdeiro)

1. **Criar `js/events-<id>.js`** só com `requisitos.tracos` (sem retratos ainda) + registrar em `index.html` e `tests/helpers/jogo.cjs` → testes verdes
2. **Adicionar o `objetivosLegado`** (Caminho B) → testes verdes
3. **Fazer os 9 pontos de registro num commit só** → testes verdes
4. **Corrigir o `save.js:78`** para degradar em vez de descartar → testes verdes
5. **Gerar os 9 arquivos de arte** seguindo a `MEMORIA-ILUSTRACOES.md`
6. **Escrever os testes:**
   - valores iniciais exatos (como `novos herdeiros começam com os valores acordados`)
   - desbloqueio: condição cumprida → flag presente na próxima run
   - `save.js`: traço desconhecido **degrada**, não descarta
   - evento da linha só aparece para o traço certo

## Ordem de implementação sugerida

1. **A Viúva** — a mais simples (nenhum campo novo na run)
2. **O Menino da crônica** — a cadeia de conteúdo **já existe inteira**; só falta o objetivo de legado
3. **O Herege** — usa marcos que já existem
4. **A Usurária** — depende de `comprasMercador`, já persistido
5. **O Veterano** — por último: exige campo novo `batalhasVencidas` + migração de save

Antes do primeiro herdeiro: **generalizar o ponto 2** (`js/state.js:94-95`) para que a escolha aceite qualquer traço da pool — hoje só `druida_herdeiro` pode ser forçado, e sem isso a tela de escolha de herdeiro (item G1 do plano) não funciona para os novos.
