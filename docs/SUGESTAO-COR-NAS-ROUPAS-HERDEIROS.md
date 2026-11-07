# Cores aprovadas para as roupas dos herdeiros

As cores foram aprovadas pelo usuário. A Heroína do Leste, o Herdeiro Nórdico, a Herdeira Corajosa, o Herdeiro Avarento, o Herdeiro Doente, a Heroína do Povo e o Menino da Crônica estão integrados.

## O critério aprovado

Cada herdeiro recebe uma cor envelhecida para as áreas principais de tecido, como o vestido escuro do Herdeiro do Culto. Pele, cabelo e detalhes dourados ficam como estão; contorno preto e hachura continuam visíveis por cima da cor para preservar o aspecto de gravura.

O escopo fica nos retratos dos herdeiros. As cartas de evento seguem a tonalidade da vila.

## Por que o sistema aguenta

O Culto já mostra como uma cor concentrada pode dar identidade ao retrato sem abandonar o preto, o marfim e o traço de nanquim. No fundo preto da interface, uma roupa de cor contida ganha leitura; o limite está em espalhar cores vivas por toda parte.

## Regras que eu manteria

- Uma família de tom envelhecido por herdeiro; nas honras negativas, a cor pode desbotar gradualmente sem perder sua leitura. A hachura preta continua dando volume. Nada fluorescente.
- Dourado continua como detalhe localizado, em grampo, fecho ou bordado. Não cobre a roupa e não cria novos símbolos no traje do Avarento.
- Honra muda corte, adereço e acabamento sobre a cor base. Nas honras negativas, a cor pode desbotar; na honra mínima do Avarento, o ocre fica muito pálido, mas permanece dentro da família aprovada.
- Fundo transparente, margens limpas e escala do busto preservadas.
- As roupas de culto mantêm desenho próprio e ficam fora desta paleta, salvo pedido específico.

## O teste da Herdeira do Leste

A versão neutra escarlate aprovada foi integrada em assets/herdeiros/herdeira-leste-neutra.png; a prévia de cor permanece em docs/previas/herdeira-leste-neutra-escarlate-teste.png.

O escarlate aprovado tem como referência aproximada #B23A30, dentro da faixa visual #A63227 a #C0442F. O hexadecimal orienta a geração, sem prometer igualdade em cada pixel.

A roupa neutra e as honras positivas usam escarlate próximo de #B23A30. Nas honras negativas, a cor desbota em etapas: baixa #A84A41, baixa-2 #A97872 e baixíssima #AD8B86. São alvos visuais aproximados. A cor cobre o tecido liso, gola cruzada e faixa; preserva boca, penteado, pele quente, contornos, hachura, detalhes dourados, escala do busto e transparência. A roupa de culto permanece preta com bordas carmesim e chama clara.

Esta etapa muda apenas a Heroína do Leste. Os trajes do Culto, da Sombra Coroada e do Druida permanecem como estão.

## Sugestões para os outros retratos

As seis cores da tabela foram aprovadas. A integração segue uma por vez; Leste, Nórdico, Corajosa, Avarento, Doente e Heroína do Povo já foram concluídos. Os valores situam cada família visual e podem variar um pouco na imagem gerada.

| Herdeiro | Cor aprovada | Motivo e cuidado | Prova |
| --- | --- | --- | --- |
| Herdeira Corajosa | Azul-tinta envelhecido, em torno de `#46586F` | Dá presença ao vestido sem repetir o escarlate do Leste. A honra +60 usa capa, V e painel do peito em marfim; manter o dourado da tiara como detalhe pequeno. | `docs/previas/corajoso-neutra-cor-teste.png`; variantes em `docs/previas/corajoso.html` |
| Herdeiro Avarento | Ocre castanho, em torno de `#8B673D` | A neutra e as honras positivas usam o ocre; as negativas desbotam para `#9B8160`, `#B0A18B` e o ocre muito pálido `#C3BCB1`. Coroa e moeda na mão continuam douradas; sem moedas ou flores aplicadas à roupa. | `docs/previas/avarento.html`; teste neutro em `docs/previas/avarento-neutra-cor-teste.png` |
| Herdeiro Doente | Verde-sálvia acinzentado, em torno de `#747661` | A neutra e as honras positivas usam esse verde apagado; na honra +30, só a camisa e as mangas ficam verdes, enquanto a peça drapeada fica marfim. Nas negativas, a cor desbota para `#858679`, `#9B9C90` e `#AEB0A4`. | `docs/previas/doente.html`; teste neutro em `docs/previas/doente-neutra-cor-teste.png` |
| Menino da Crônica | Laranja queimado envelhecido, em torno de `#B9753F` | Gola alta e túnica recebem o laranja; a capa continua marfim. Nas honras negativas, a roupa desbota em três etapas sem perder o tom quente. | `docs/previas/menino-cronista.html`; prova neutra em `docs/previas/menino-cronista-neutra-cor-teste.png` |
| Heroína do povo | Ameixa envelhecida, em torno de `#6C596D` | O vestido neutro e as honras positivas usam a ameixa. Preservar a pinta, as mangas curtas lisas, os antebraços visíveis e o broche dourado. | `docs/previas/heroi-do-povo.html`; teste neutro em `docs/previas/heroi-do-povo-neutra-cor-teste.png` |
| Herdeiro Nórdico | Azul-ferro acinzentado, em torno de `#59656F` | Mais frio e cinzento que o azul da Corajosa; combina com a gola de peles clara e não antecipa o manto vermelho do culto. | `docs/previas/herdeiro-nordico-neutra-cor-teste.png` |

A prova neutra aprovada do Menino da Crônica foi integrada. A prévia mostra as sete honras lado a lado com o culto, que permaneceu inalterado.

O Druida-Herdeiro tem uma regra anterior na memória: arte em preto e branco com capa vermelha. Não proponho outra cor para ele. Há uma divergência a resolver antes de qualquer nova arte: a memória registra capa vermelha, enquanto a base neutra atual `assets/herdeiros/druida-herdeiro-neutra.png` aparece verde.

A paleta aprovada não altera a direção anterior do Druida. A diferença entre a capa vermelha prevista na memória e a capa verde da base neutra dele continua pendente.

## Sequência de integração

O Leste, o Nórdico, a Corajosa, o Avarento, o Doente, a Heroína do Povo e o Menino da Crônica estão integrados: PNGs, WebP, prompts, prévias e memória foram atualizados. Na Corajosa, a honra +60 ganhou capa, V e painel do peito em marfim. No Avarento, a honra mínima usa ocre muito pálido. No Doente, a honra +30 mantém a peça drapeada marfim sobre a camisa verde-sálvia. A Heroína do Povo usa ameixa envelhecida em todos os estados de honra; o culto permanece intacto. O Menino da Crônica usa laranja queimado na gola e na túnica, com capa marfim.

Manter a execução sequencial solicitada: concluir e revisar um herdeiro antes de começar o próximo. A divergência registrada para o Druida deve ser resolvida antes de alterar o retrato dele.

## Checklist

- [x] Registrar o sistema de cor por herdeiro, com hachura, dourado localizado e fundo transparente preservados
- [x] Gerar e comparar a prévia escarlate da base neutra do Leste
- [x] Propor e gerar prévias de cor para os outros seis retratos neutros
- [x] Aprovar as cores propostas para os herdeiros
- [x] Integrar o escarlate na neutra e nas seis honras do Leste, preservando o traje de culto
- [x] Atualizar PNGs, WebP em qualidade 90, prompts, prévia e memória do Leste
- [x] Integrar a túnica azul-ferro na neutra e nas seis honras do Nórdico, com capa marfim na honra máxima
- [x] Atualizar os PNGs e WebPs do Nórdico, prompts, prévia e memória, preservando o culto
- [x] Integrar o azul-tinta na neutra e nas seis honras da Corajosa; diferenciar a honra +60 com capa, V e painel marfim
- [x] Atualizar PNGs, WebPs, prompts, prévia e memória da Corajosa, preservando o culto
- [x] Integrar o ocre castanho na neutra e nas seis honras do Avarento; manter o ocre muito pálido na honra mínima e preservar o culto
- [x] Atualizar PNGs, WebPs, prompts, prévia e memória do Avarento, preservando coroa dourada e moeda na mão
- [ ] Conferir manualmente a prévia do Avarento no navegador ou no jogo
- [x] Integrar o verde-sálvia na neutra e nas seis honras do Doente; na honra +30, manter camisa verde e peça drapeada marfim
- [x] Atualizar PNGs, WebPs, prompts, prévia e memória do Doente, preservando o culto
- [ ] Conferir manualmente a prévia do Doente no navegador ou no jogo
- [x] Integrar a ameixa envelhecida na neutra e nas três honras positivas da Heroína do Povo, preservando a pinta e as mangas curtas
- [x] Atualizar PNGs, WebPs, prompt, prévia e memória da Heroína do Povo, preservando o culto
- [ ] Conferir manualmente a prévia da Heroína do Povo no navegador ou no jogo
- [x] Integrar o laranja queimado na neutra e nas seis honras do Menino da Crônica; manter a capa marfim e o culto intacto
- [x] Atualizar os sete PNGs e WebPs, prompt, prévia e memória do Menino da Crônica
- [ ] Conferir manualmente a prévia do Menino da Crônica no navegador ou no jogo
- [ ] Conferir manualmente a prévia da Corajosa no navegador ou no jogo
- [ ] Resolver a divergência entre a capa vermelha indicada para o Druida na memória e a capa verde da base neutra
- [ ] Definir cores dos herdeiros futuros quando houver bases visuais
## Resumo

A roupa da Heroína do Leste foi atualizada para escarlate; a neutra e as seis honras do Nórdico usam azul-ferro, com capa marfim na honra máxima. A neutra e as seis honras da Corajosa usam azul-tinta, e a honra +60 tem capa, V e painel marfim. A neutra e as honras do Avarento usam ocre envelhecido, muito pálido na honra mínima. O Doente usa verde-sálvia e mantém a peça drapeada marfim sobre a camisa verde na honra +30. A Heroína do Povo usa ameixa envelhecida na neutra e nas três honras positivas. O Menino da Crônica usa laranja queimado na gola e na túnica, com capa marfim. Os trajes de culto permanecem inalterados; os seis herdeiros da tabela estão integrados. A divergência do Druida permanece pendente.

## Validação

No Menino da Crônica, os sete PNGs e WebPs mantêm a resolução original por estado e transparência alfa; os WebPs foram exportados em qualidade 90 e alfa 100. O prompt JSON foi analisado e a prévia HTML contém as sete honras e o culto. A arte de culto não foi alterada. A túnica e a gola alta usam laranja queimado, a capa permanece marfim e as três honras negativas desbotam em etapas. A inspeção visual das artes foi feita; a conferência da página no navegador/jogo continua pendente. A suíte de testes não foi executada.

Os dois JSONs de prompts foram analisados com sucesso. Os sete PNGs e sete WebPs do Nórdico mantêm 1254 × 1254 px, transparência alfa e quatro canais; os WebPs foram exportados em qualidade 90 e alfa 100. A arte de culto não foi alterada. A prévia HTML e a inspeção visual confirmam a capa marfim sobre a túnica azul-ferro na honra máxima. A suíte de testes não foi executada.

Na Corajosa, os sete PNGs e WebPs mantêm as dimensões originais por estado e transparência alfa; os WebPs usam qualidade 90 e alfa 100. Os prompts JSON foram analisados, a página HTML contém oito imagens e o culto não foi alterado. A conferência da prévia no navegador/jogo continua pendente. A suíte de testes não foi executada.

No Avarento, os sete PNGs e WebPs mantêm as dimensões originais por estado e transparência alfa; os WebPs usam qualidade 90 e alfa 100. O prompt JSON foi analisado, a prévia HTML contém oito imagens e o retrato de culto não foi alterado. A honra mínima agora usa ocre muito pálido, com coroa e moeda douradas. A conferência da prévia no navegador/jogo continua pendente. A suíte de testes não foi executada.

No Doente, os sete PNGs e WebPs mantêm 1278 × 1230 px, transparência alfa e quatro canais; os WebPs usam qualidade 90 e alfa 100. O prompt JSON foi analisado e a prévia HTML contém oito imagens. O culto não foi alterado. A honra +30 mantém a camisa verde-sálvia e a peça drapeada marfim; a conferência da prévia no navegador/jogo continua pendente. A suíte de testes não foi executada.

Na Heroína do Povo, os quatro PNGs e os quatro WebPs de honra mantêm 1254 × 1254 px, transparência alfa e quatro canais; os WebPs usam qualidade 90 e alfa 100. O prompt JSON foi analisado e a prévia HTML contém os quatro estados de honra e o culto. A arte de culto não foi alterada. A pinta, as mangas curtas e os antebraços visíveis permanecem; a conferência da prévia no navegador/jogo continua pendente. A suíte de testes não foi executada.
