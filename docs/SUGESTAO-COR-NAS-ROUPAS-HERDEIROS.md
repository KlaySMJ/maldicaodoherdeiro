# Sugestão: cor monotom nas roupas dos herdeiros

Documento de sugestão. Nada foi alterado: nenhum PNG, prompt ou linha de código mudou por causa dele. A ideia vive aqui até você aprovar um teste.

## A proposta

Cada herdeiro ganha uma cor só, aplicada de ponta a ponta na roupa, como o preto do Herdeiro do Culto já faz. Um tom por personagem, nunca dois brigando na mesma peça. Pele, cabelo e os detalhes dourados ficam como estão, e o contorno preto com hachura continua por cima da cor para a imagem não sair do traço de gravura.

O escopo é só os herdeiros. Cartas de evento continuam na tonalidade da vila, sem mudança.

## Por que o sistema aguenta

O Culto é o retrato mais reconhecível do elenco, e ele é exatamente isso: uma cor decidida e usada inteira. Uma roupa chapada em escarlate com hachura preta por cima remete a xilogravura pintada à mão, que é técnica de época e não quebra a atmosfera sombria. Contra o fundo preto da interface, cor contida lê bem — o problema nunca foi cor, foi cor vibrante espalhada sem sistema.

## Regras que eu manteria

- Um tom envelhecido por herdeiro, sempre com hachura preta dando volume. Nada fluorescente.
- Dourado continua sendo acento localizado: grampo, fecho, detalhe de bordado. Não vira cor de roupa.
- Estado muda corte, adereço e acabamento sobre a cor base, como já muda hoje. Honra alta refina tecido e fecho; honra baixa desbota, remenda e desfaz a costura. A cor de origem permanece reconhecível em todos os níveis.
- Fundo transparente, margens limpas e escala do busto preservadas, sem exceção.
- Culto entra no esquema de cor apenas quando o próprio pedido pedir. Cada personagem define seu culto depois.

## O teste da Herdeira do Leste

Primeiro passo: uma versão da base aprovada com o vestido em escarlate, comparada lado a lado com `assets/herdeiros/herdeira-leste-neutra.png`. Preservar a boca original, o penteado preso, a escala do busto e o branco quente da pele; a cor toca só o vestido, gola cruzada e faixa.

O tom sugerido fica na faixa de um vermelho escarlate envelhecido, algo entre `#A63227` e `#C0442F`, com as hachuras pretas da gravura por cima. O valor exato se decide na comparação, não no papel.

Se a base passar, as seis honras (alta, alta-2, altissima, baixa, baixa-2, baixissima) repetem o mesmo vestido escarlate com as diferenças de corte e acabamento de sempre. A versão de culto fica fora: ela já tem o vestido preto com bordas carmesim e a chama clara aprovados em `assets/herdeiros/herdeira-leste-culto.png`, e não muda.

Um ponto para decidir antes de gerar: o vermelho do jogo também é o manto da Sombra Coroada, a capa do Druida e a chama do culto. Escarlate na base neutra convive com isso desde que o culto dela não repita o mesmo vermelho: hoje ele já é mais escuro e escasso, então a separação existe, mas vale conferir na tela.

## Depois do teste

Os prompts atuais de `assets/prompts/herdeira-leste.json` proígem cor saturada e pedem tecido claro na maioria das faixas. Se você aprovar o escarlate, esse JSON precisa de uma revisão que troque a regra de palha por uma regra de cor: mesma cor base nas sete honras, variação só no desgaste e no acabamento. A prévia `docs/previas/herdeira-leste.html` e a memória `docs/MEMORIA-ILUSTRACOES.md` entram na mesma revisão.

Para os demais herdeiros, a ordem que eu sugiro é escolher a cor de cada um depois que o sistema da Leste estiver aprovado. Candidatos naturais de tom contido: ocre, verde-garrafa, azul-tinta e bordô, sempre um por personagem.

## Checklist

- [x] Documento de sugestão criado, sem alterar artes, prompts, código ou memória existentes
- [x] Escopo definido com o usuário: apenas herdeiros; teste começando pela Herdeira do Leste
- [x] Estados definidos: escarlate em todas as honras e na neutra; culto fora do esquema
- [ ] Geração da versão escarlate da base neutra e comparação lado a lado com a arte aprovada
- [ ] Aprovação do tom exato do escarlate na tela
- [ ] Se aprovado: revisão das seis honras, do JSON de prompts, da prévia e da memória de ilustrações
- [ ] Definição de cores para os demais herdeiros, depois do resultado da Leste

## Resumo

Sugestão registrada em um documento novo, com o sistema de cor monotom, as regras de contenção e o plano de teste da Herdeira do Leste. Nenhuma validação visual foi feita: o escarlate ainda não existe em arte nenhuma, e a decisão de tom só fecha quando você ver a comparação. O ponto em aberto maior é a convivência do escarlate com o vermelho que já significa perigo e culto no resto do jogo.
