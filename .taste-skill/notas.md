# Direção e revisão visual

## Atualização: retratos dos herdeiros em WebP

Os 66 PNGs de `assets/herdeiros/` foram convertidos para WebP com qualidade 90 e alfa 100, mantendo a resolução original de cerca de 1254 px: os 100,0 MB de PNG caem para 14,5 MB de WebP. A interface passa a referenciar os WebP na grade de seleção e em `caminhoRetrato`, incluindo os retratos do Leste, do Nórdico e do Herdeiro do Culto integrados nesta versão. Os PNGs permanecem no mesmo diretório como arte-fonte, referência dos prompts e alvo das prévias em `docs/previas/`; `AGENTS.md`, `docs/MEMORIA-ILUSTRACOES.md`, `docs/HERDEIROS-FUTUROS.md` e `docs/PLANO-HERDEIROS-PRIORITARIOS.md` foram atualizados para refletir o formato. A troca é apenas de formato, sem redesenho, mudança de cor ou alteração de composição.

Validação: 172 testes e lint aprovados; nos 66 arquivos as dimensões são idênticas ao original e o canal alfa bate bit a bit; comparadas sobre fundo preto, as imagens apresentam diferença média de até 1,26/255 e PSNR mínimo de 38,2 dB. Amostras abertas lado a lado (Corajosa neutra e Nórdico em culto) não mostram perda perceptível na escala de exibição. O ganho prático: a grade de seleção cai de cerca de 9 MB para 1,3 MB e cada troca de honra de cerca de 1,5 MB para 150–300 KB. Falta a conferência manual no navegador da grade de seleção e da troca de honra/culto. Cinco PNGs são opacos na origem (`avarento-alta-2`, `avarento-altissima`, `avarento-culto`, `corajoso-culto`, `doente-culto`), característica preservada na conversão.

## Revisão dos oito eventos enviados pelo autor

Os eventos 20–27 do anexo não estavam no catálogo. Foram integrados com os efeitos e textos enviados, incluindo as decisões confirmadas: quatro respostas no banquete; negociação do barão por 3 gold e 3 HP; flag `vontade_lembrada` concedida pelo testamento e persistida apenas ao terminar qualquer run. O catálogo e o TXT agora têm 27 eventos, 76 escolhas e três mercadorias.

Corrigido o sorteio ao avançar: usa a rodada de destino, evitando atrasar em um turno eventos com rodada mínima. O carregamento aceita a carta já aberta se os controles de teste mudarem a honra; mantém a validação de rodada, flags e demais requisitos. Respostas continuam sendo reavaliadas pela honra atual. Em celulares baixos, as quatro respostas do banquete usam duas colunas, sem cortar o texto.

Validação: 47 testes automatizados, incluindo os efeitos das 24 decisões sem combate, os dois desfechos do barão, limites de honra e rodada, sequências, recarga e legado em vitória/derrota. Edge: 670 cenários de tela sem rolagem ou elementos fora da área visível; 320 resultados de escolhas e combates válidos. Cliques reais confirmaram testamento e transferência do legado, custo da negociação, órfão na rodada 8 e recarga do banquete após mudar a honra. Inspector e lint: zero FAIL, zero WARN. Revisadas as seis capturas do inspector e a tela de 320 × 568 com as quatro escolhas.

A composição, Georgia e direção preto/branco permanecem as existentes. A decisão central, os requisitos e as consequências derivam dos dados; o layout compacto conserva os quatro textos e os controles. Não há novas fontes, gráficos ou novas artes nesta revisão. A limitação visual continua sendo a redução das duas artes em janelas muito pequenas, para conservar todo o conteúdo da decisão sem rolagem.

## Atualização: herdeiro original, recursos e variedade

O neutro voltou ao desenho original `herdeiro.svg`, com enquadramento 3:4 que conserva todos os traços. Duas variações SVG preservam rosto e roupa: alta com ombros firmes, manto cuidado, selo e mão aberta; baixa com olhar duro, remendos, barra rasgada e mão na espada. Todos usam branco sobre preto. Os três retratos raster anteriores permanecem disponíveis, sem uso na interface. A transição de 520ms e os limiares de ±30 continuam.

O gold agora fica no topo, junto aos habitantes. Os quatro atributos pertencem ao herdeiro; os recursos ficam na faixa superior. Controles de teste +30/−30 de honra atualizam o retrato e as respostas imediatamente, preservam rodada e renda e são salvos. Nas telas menores, os recursos usam uma segunda linha e os controles de teste ficam compactos. Consequências usam duas colunas em janelas baixas. A revisão visual preserva a direção Achromatic ledger, seed 120947928, a Georgia local e o contraste preto/branco pedidos pelo autor, sem novo sorteio de estilo.

O catálogo passou de 7 para 19 eventos, com cura, gold, equipamento, habitantes, dois novos combates e duas sequências da run. Ponte, poço e ervateira ganharam desenhos no estilo anterior. O sorteio evita as últimas cinco cartas; a memória é salva. Não foram criados objetivos de legado. O arquivo `docs/eventos-e-beneficios.txt` documenta as 51 escolhas e as três mercadorias com seus efeitos, condições, perdas e ganhos.

Validação final: 36 testes de engine/persistência/controlador; 510 cenários de tela em dez resoluções; 216 resultados de escolhas e combates nas quatro resoluções de referência. Botões de honra verificados por cliques reais no Edge, inclusive desbloqueio de respostas em ±50 e retomada sem renda ou avanço extra. Todos aprovados. Inspector e lint: zero FAIL, zero WARN. As seis capturas do inspector, os três retratos e as novas artes foram abertos para revisão.

Crítica: o evento e suas respostas continuam a decisão principal; números e efeitos vêm do mesmo estado; não há controles sobrepostos ou blocos cortados. O desenho do herdeiro e as respostas especiais preservam a identidade do jogo. A honra é o único sinal colorido. A faixa de recursos permanece legível no celular; as molduras conservam tamanho e proporção iguais. Não há gráficos ou dados ausentes a avaliar. Os valores dos eventos são conteúdo de jogo ajustável no catálogo.

## Atualização: retorno às artes anteriores dos eventos

Caixas suspeitas e mercador voltam a usar `assets/caixas.svg`, com os desenhos brancos sobre preto, acompanhando os demais eventos. O herdeiro conserva seus três retratos atuais em xilogravura, os limites de honra de ±30 e a transição entre estados. A arte PNG das caixas permanece disponível no projeto.

## Atualização: gold e comércio

Gold agora aparece junto aos atributos, com ícone de moeda. Nas telas estreitas, os cinco valores usam colunas iguais e os ícones ficam acima dos rótulos, evitando uma segunda linha de atributos. O mercador oferece três produtos com efeitos e preços visíveis, além da saída sem compra; ofertas sem saldo usam o estado desativado nativo. O resultado separa o custo da compra da renda ou manutenção e mostra o saldo líquido nas consequências.

Foram revisadas capturas do mercador em desktop, tablet, celular vertical, horizontal e na tela mínima de 320 × 568. As molduras permanecem iguais em 3:4. A matriz no Edge verificou 270 cenários em dez resoluções, incluindo os sete eventos, compras, resultados e avisos: sem conteúdo fora da tela ou rolagem. A interação real confirmou compra, preço progressivo independente, restauração do saldo e das compras, renda e manutenção. Os 30 testes de engine, persistência e controlador passaram.

## Atualização: tudo dentro da tela

O livro ocupa a altura dinâmica da janela e reserva o espaço dos avisos. O cabeçalho, espaçamentos, botões e textos foram compactados. Um ajuste após cada renderização e resize mede o conteúdo real e reduz primeiro as duas artes, mantendo proporção e dimensões iguais. Se necessário, compacta a tipografia em pequenos passos. A verificação considera os retângulos de textos, números, imagens e botões; não basta a página esconder o overflow.

No celular vertical, as duas cartas ficam lado a lado, antes de atributos, narrativa e respostas. No modo horizontal baixo, artes, texto e ações se distribuem em quatro colunas; resultados e fim de run têm arranjos próprios. Frases decorativas são omitidas em espaços compactos, e o resultado ocupa a área antes usada pela descrição do evento já lida. Nenhuma escolha ou consequência da fase atual é truncada.

Verificação no Edge: 180 cenários, abrangendo os seis eventos, escolhas, resultados, início, intro, fim e falhas de armazenamento. Dez resoluções, de 320×568 a 1920×1080, incluindo 844×390. Sem textos ou controles fora da tela e sem rolagem vertical ou horizontal. A honra, a proporção 3:4 e a animação continuam verificadas. Capturas representativas foram abertas para revisão.

## Atualização: arte encaixada em 3:4

As molduras agora são a própria área das ilustrações, ambas em 3:4, sem o antigo painel branco contendo uma imagem menor. Removidos os preenchimentos internos da arte e a borda externa duplicada. Títulos, narrativa, atributos e legendas ficam fora da área ilustrada. Os PNGs 3:4 preenchem essa área preservando a proporção e toda a composição; os SVGs provisórios de outras proporções continuam inteiros com `object-fit: contain`. A honra permanece como contorno externo, sem mudar as dimensões das cartas.

A largura do jogo foi ajustada para 1120px no desktop, 880px no tablet e no máximo 420px no celular. Isso mantém as artes maiores e os atributos legíveis sem criar cartas gigantes em telas intermediárias. A hierarquia de leitura no celular continua: herdeiro e atributos, evento e narrativa, respostas e detalhes adicionais.

Verificação final: seis eventos em seis larguras, sem overflow e com molduras iguais; transição de honra, retorno ao neutro, save/load e movimento reduzido aprovados no Edge. Capturas com os PNGs reais revisadas em desktop, tablet e celular: a imagem ocupa a moldura inteira, sem distorção ou áreas de preenchimento. Inspetor com zero FAIL; o aviso de presença de cor vem das ilustrações em pergaminho solicitadas pelo autor.

## Atualização: retratos por honra e transições

Três retratos 3:4 em xilogravura, gerados com a ferramenta integrada: base neutra, honra alta com manto cuidado, selo do povo e mãos vazias, honra baixa com manto muito sujo e rasgado, expressão tensa e mão na arma. As duas variações usam o retrato neutro como referência de identidade. A versão atual de honra alta foi editada para remover o pão por solicitação do autor. Os prompts e arquivos anteriores foram preservados.

Faixas visuais: alta em +30, baixa em −30, neutra no intervalo. As opções de diálogo usam limites independentes de +50 e −50. Os pesos de eventos usam a faixa de estado. A transição dura 520ms, com pequeno deslocamento e opacidade, aguarda a imagem de destino e limpa a anterior ao terminar. Só anima ao mudar a faixa dentro da mesma run; menu, carregamento e nova run não disparam a animação. Movimento reduzido troca o retrato imediatamente.

Verificação: 20 testes de engine/controlador aprovados; no Edge, transições de ida e volta, não repetição dentro da faixa, limites de diálogo, carregamento dos retratos, save/load, movimento reduzido e molduras iguais em 1440, 768 e 390px. Todos os PNGs finais têm 1086 × 1448 (3:4). Capturas dos três estados, transição e larguras revisadas. O inspetor não encontrou FAIL; os avisos de bordas fortes e presença de cor se justificam pelas molduras solicitadas e pela nova arte terrosa em pergaminho. A interface continua preta e branca.

## Atualização: molduras iguais e informações integradas

As duas molduras ocupam colunas laterais de mesma largura e compartilham a altura da primeira linha da grade. Em telas estreitas, duas linhas flexíveis iguais preservam as dimensões ao empilhar. A altura mínima é de 520px no desktop/tablet e 440px no celular; o conteúdo pode expandir ambas sem cortes.

Os atributos deixaram a caixa quadriculada: agora são números e rótulos com pequenos ícones lineares na própria página. A honra mantém a cor e o contorno do retrato. As informações extras do evento perderam o painel externo; a tabela de batalha virou texto corrido com os mesmos valores dos dados.

A composição atual preserva a direção existente e o preto e branco solicitado. Verificação no Edge com os seis eventos em 1440, 1100, 768, 640, 390 e 320px: dimensões iguais, molduras visíveis, opções disponíveis, texto sem cortes e nenhuma rolagem horizontal. As legendas e valores continuam derivados do estado e dos eventos. As capturas foram revisadas; os registros seguintes descrevem as versões anteriores.

## Atualização: preto e branco e introdução manual

Por pedido do autor, a paleta atual substitui o pergaminho por preto puro, textos e desenhos brancos. A composição anterior foi preservada; a honra mantém azul e vermelho com contraste ajustado ao fundo preto. Todos os SVGs locais foram recoloridos nos próprios arquivos.

O temporizador da introdução foi removido. O texto continua tremendo até o jogador acionar **Iniciar** nessa tela, respeitando a preferência de movimento reduzido. Verificação no Edge confirmou que a introdução permanece após o antigo prazo e que o botão entra no jogo.

Inspeção atual em 1440, 768 e 390 px: início sem FAIL ou WARN; jogo sem FAIL, com o único aviso de bordas contrastantes, mantidas como parte do desenho solicitado. Nenhuma imagem quebrada ou rolagem horizontal. As capturas atuais foram revisadas. Os registros abaixo descrevem a versão anterior em pergaminho.

Direção: Achromatic ledger, seed 120947928. Cores e tipografia preservadas do pedido: pergaminho #f3e6d3, tinta escura, Georgia com fallback local. O enquadramento foi adaptado ao wireframe explícito de três colunas, sem sidebar: retrato, decisões, evento. Nenhum redraw.

Pergunta principal: qual decisão tomar diante deste evento, com os atributos atuais e a população restante?

Elementos do projeto: herdeiros sucessivos, vila distante, habitantes, carta de protagonista, carta de evento, uma a três respostas, honra, praga, inverno, forja, saqueadores e crônica persistente. A carta do protagonista é o elemento próprio da interface: sua borda acompanha o estado da honra.

O papel da crônica se torna a superfície onde o herdeiro e as consequências do seu governo ficam frente a frente. O elemento interativo é o próprio loop de decisões e consequências, com sorteio ponderado pelo estado.

As sete ilustrações SVG são desenhos locais provisórios para este MVP, sem imagens ou fontes de terceiros. Eventos e valores numéricos são exemplos a validar; os objetivos de legado permanecem vazios.

## Revisão inicial

- O evento e as escolhas ocupam o centro da tarefa; os atributos e habitantes vêm do mesmo estado.
- Os três blocos usam a mesma grade e as mesmas margens. Na versão de tablet, o evento vem antes das escolhas para preservar leitura.
- A primeira captura de celular mostrou o título espremido pelo contador e pelo botão de início. O cabeçalho passou a uma grade de duas colunas com a ação numa linha própria.
- A primeira captura de tablet deixou espaço excessivo sob o menu. O conteúdo inicial foi centralizado verticalmente.
- A honra recebe cor no número e contorno na célula, além da borda do retrato, para continuar legível com o retrato oculto no celular.
- Nenhum overflow horizontal ou imagem quebrada foi encontrado em 1440, 768 e 390 px. Os controles passaram por testes no navegador abrindo o arquivo diretamente.
- Exceções justificadas aos avisos: `palette-cream` e `heavy-borders`. O usuário pediu explicitamente pergaminho e bordas pretas. Foram mantidos.

## Critério de aprovação

Leitura e ação principal claras; os atributos refletem os efeitos calculados; a batalha mostra a defesa e os danos base; as consequências só aparecem após a escolha; números com algarismos tabulares; foco visível, botões nativos, intro pulável e respeito a movimento reduzido. Os estados vazios, erro de armazenamento, derrota, resultado e nova run foram exercitados. Não há gráficos ou legendas estatísticas a avaliar.

Limites: ilustrações provisórias, seis eventos de exemplo e balanceamento a validar. Sem condição de vitória ou objetivos inventados.

## Resultado final

Inspeções de início e jogo: zero FAIL em 1440, 768 e 390 px. Permanecem somente os avisos de pergaminho e bordas escuras exigidos pelo brief. Todas as capturas finais, incluindo as pranchas com a página completa, foram abertas para revisão. A grade corrigida mantém o título do celular em uma linha e elimina o grande vazio inferior do menu no tablet.

Testes: 16 cenários automatizados da engine aprovados. No Edge real, foram aprovados abertura por file://, intro pulável, escolhas, carregamento sem reaplicar efeito, modal de substituição da run, batalha, bordas de honra, encerramento, novo herdeiro, corrupção de dados, falha de gravação e continuação sem salvar. A animação da intro é desativada com movimento reduzido. Nenhuma exceção JavaScript foi registrada.

## Eventos 28–100

Integradas as 73 cartas da proposta ao catálogo, mantendo efeitos, resultados, pesos, requisitos, flags de run e cadeias. As três batalhas com escolhas alternativas preservam a mitigação pelo escudo e suas penalidades de falha. “Farinha nova”, “Mercador de gente” e “Rumores da lavanderia” têm quatro opções; a interface mostra essas respostas em duas colunas no celular estreito.

As opções designadas na proposta concedem `senhor_compreendido`, `vontade_ouvida` e `sucessor_pressentido` como flags persistentes ao terminar qualquer run. A etapa seguinte, “O Primeiro Herdeiro”, foi integrada na proposta 101–120 e usa `sucessor_pressentido` como requisito. O TXT autoral foi regenerado para listar o catálogo atualizado.

## Eventos especiais 101–120

Incluídas as 20 cartas especiais da proposta. A engine registra `especial_<id>` no momento do sorteio, inclusive se o jogador recusar; eventos de pacto saem da pool após `pacto_feito`. O Relojoeiro define HONRA como zero. O pacto do Corvo revela a variação de honra das opções nas cinco rodadas seguintes; esse prazo fica salvo na run e saves antigos recebem zero. “O Primeiro Herdeiro” exige a flag de legado `sucessor_pressentido` do evento 100. Opções propostas no Espelho e no Primeiro Herdeiro gravam suas flags persistentes no encerramento. A cadeia abissal 121–125 usa marcas da run para manter a ordem. Os achados 126–127 concedem itens; o baú mímico esconde sua armadilha até a resolução. O catálogo e o TXT passam a listar 127 eventos.
