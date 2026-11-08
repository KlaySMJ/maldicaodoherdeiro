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

## Dano e conquistas: 7 de novembro de 2026

Alteração localizada nos efeitos da interface, seguindo a composição, a tipografia e a paleta existentes. A queda de Vida provoca um recuo curto do retrato, um clarão vermelho e o destaque do valor perdido. Uma conquista revela o selo dourado e seu nome numa faixa temporária; várias conquistas entram em sequência. A faixa ocupa o canto inferior no desktop e o topo em telas de até 900 px, onde o rodapé cobriria as escolhas.

- [x] Disparar o dano pela diferença real de Vida, sem repetir ao redesenhar a tela, curar ou carregar uma crônica.
- [x] Consumir e salvar os avisos de conquista, preservar a fila ao avançar e evitar recriar o save de uma crônica já encerrada.
- [x] Permitir dispensar o aviso, pausar seu prazo com foco ou cursor e respeitar movimento reduzido.
- [x] Conferir as capturas e o comportamento em 1440, 768 e 390 px, incluindo movimento reduzido em 390 px.

Resumo: os efeitos acompanham os acontecimentos da partida e mantêm as escolhas disponíveis. Nenhuma pendência desta alteração.

Validações: 27 testes de interface, conquistas e controlador passaram, assim como ESLint, Prettier e a conferência de whitespace. O navegador confirmou a fila sem duplicatas, saída automática, pausa com foco, reabertura sem repetir avisos e ausência de erros JavaScript ou rolagem horizontal. As capturas dos efeitos e da tela de batalha foram abertas para revisão; o relatório final da batalha registrou zero falhas em três larguras. A sombra do nome sobre a arte foi permitida como parte do desenho existente; o aviso de textos auxiliares pequenos também pertence à interface anterior. O scanner estático amplo continua apontando os gradientes do fundo e o símbolo lunar já presentes no jogo. Relatórios e capturas ficam em `.taste-skill/qa/feedback-after/` e `.taste-skill/inspect-feedback-final/`.

## Coleção de conquistas: 7 de novembro de 2026

A tela responde quais conquistas faltam e como encontrá-las. As 81 entradas foram distribuídas entre Crônicas, Herdeiros, Histórias e encontros, Transformações, Vila e recursos e Combate. O resumo mostra a fração conquistada, a porcentagem e quantas faltam; cada tema também mostra seu progresso. A busca considera nome e condição, sem distinguir acentos ou maiúsculas. Os filtros de estado e categoria funcionam em conjunto e permanecem ao alternar as abas.

A revisão das capturas levou à redução do cabeçalho no celular, onde o botão de retorno usa uma seta e as categorias aparecem num seletor. No desktop, uma lista lateral permite trocar de tema. Os nomes e as condições ganharam tamanho, os selos deixaram as caixas decorativas e o dourado indica conquistas obtidas. A paleta e as margens seguem as do jogo; os números vêm do catálogo e do legado, sem estimar progresso individual que o save não registra.

- [x] Organizar todas as conquistas em seis temas, com contagem sem IDs antigos ou duplicados.
- [x] Acrescentar busca, filtros combinados, limpeza e estado sem resultados.
- [x] Melhorar a leitura e a navegação nas três larguras, preservando as condições de desbloqueio.
- [x] Conferir coleção vazia, parcial e completa, navegação por teclado e troca entre Conquistas, Jornada e Recordes.

Resumo: a aba permite encontrar uma meta e acompanhar a coleção com menos rolagem. Nenhuma pendência desta alteração.

Validações: 31 testes de interface, melhorias e conquistas passaram, assim como ESLint, Prettier e a conferência de whitespace. O navegador confirmou os filtros em 1440, 768 e 390 px, sem erros JavaScript ou rolagem horizontal. A inspeção final registrou zero falhas; os avisos de marfim e margem de 14 px correspondem à paleta e ao alinhamento existentes. Todas as capturas finais foram abertas para revisão. Os dados parciais e completos usados nas capturas são de ensaio e não alteram o progresso do jogador. Capturas e relatórios ficam em `.taste-skill/qa/conquistas-after/` e `.taste-skill/inspect-conquistas-final/`.

## Prévia de conquista no debug

- [x] Adicionar o botão “Debug: animação de conquista” ao menu e “Conquista” aos controles de debug da partida.
- [x] Reutilizar a animação e a fila existentes, com o rótulo “Prévia de conquista”, sem registrar desbloqueios ou gravar a partida.
- [x] Conferir o acionamento, a repetição e o bloqueio fora do modo debug.

Resumo: clicar na imagem da vila revela os controles; o botão de conquista reproduz o aviso de “Um ano inteiro”. Nenhuma pendência desta alteração.

Validações: 30 testes de controlador, interface e conquistas passaram, assim como ESLint, Prettier e a conferência de whitespace. No navegador em 1440, 768 e 390 px, os botões do menu e da partida acionaram a prévia, a repetição entrou na fila e o legado e o save permaneceram iguais. Não houve erros JavaScript nem rolagem horizontal. As três capturas foram abertas para revisão e ficam em `.taste-skill/qa/debug-conquista/`.

## Conquistas das adições recentes

A coleção passa de 81 para 111 conquistas. A aba ganha o tema Maus Presságios; as demais entradas seguem nas categorias existentes.

| Conteúdo | Novas conquistas | Condição |
| --- | ---: | --- |
| Maus Presságios | 11 | Superar cada um dos dez e completar a coleção entre crônicas. |
| Histórias em quatro encontros | 8 | Concluir cada uma das sete histórias e completar o conjunto entre crônicas. |
| Olhos de Mercúrio e Olho dos Mil Nomes | 7 | Aceitar cada transformação, removê-la ou mantê-la na decisão final, além de ativar ambas na mesma partida. |
| Obras | 2 | Construir a Cisterna comunitária e o Entreposto comercial. |
| Encontros nórdicos recentes | 2 | Ver Baldr, Frigg, Heimdall e Freyr; ver Jormungand, Fenrir, Hrym e Níðhöggr. Cada grupo acumula entre crônicas. |

As histórias exigem a chegada ao quarto encontro e uma escolha de desfecho. A flag de encerramento também aparece nos abandonos anteriores, portanto não basta para obter a conquista. Nos olhos, desistir no terceiro encontro não conta como manter a transformação na decisão final. As metas coletivas de histórias e presságios usam as conquistas individuais já salvas, sem depender de todo o histórico permanecer na partida atual.

Resolver um presságio avalia e salva o desbloqueio naquele momento. O aviso aguarda o retorno à vila para preservar a leitura do resultado no celular. O seletor móvel mostra apenas o nome da categoria; o cabeçalho da lista mantém a contagem. A descrição de “Toda a linhagem” acompanha os nove herdeiros que a condição já exigia.

ROUND 1
Seen in one second: uma coleção filtrada de presságios, com metas obtidas e pendentes.
Idea (one sentence): os acontecimentos recentes viram metas com condições ligadas às decisões da crônica.
Live thing: busca, filtros combinados e desbloqueios que acionam o aviso existente.
Layout words by section: resumo=progresso / filtros=busca e tema / lista=nome e condição.
Scores: design 8 · usability 8 · creativity 7 · content 9 → overall 8.0
Caps applied: nenhuma.
Top three problems (most visible first), each with the screenshot it shows in and the fix:
1. O aviso escondia o título do presságio em `390-new-toast.jpg`; a fila agora aguarda o retorno à vila.
2. A contagem cortava o nome do seletor em `390-pressagios.jpg`; o seletor mostra só o nome, com a contagem no cabeçalho.
3. Nenhum outro problema desta alteração nas capturas finais. Os avisos de marfim e margem de 14 px mantêm a paleta e o alinhamento existentes.

- [x] Criar as 30 conquistas e integrar as sete categorias à busca e aos filtros.
- [x] Verificar desfechos reais, abandonos, persistência, coleção entre partidas e ausência de avisos repetidos.
- [x] Conferir a categoria e o aviso em 1440, 768 e 390 px, incluindo o retorno do resultado à vila.
- [x] Executar a suíte completa, ESLint, Prettier e a conferência de whitespace.

Resumo: as adições recentes têm metas próprias e aproveitam a animação de conquista já existente. Nenhuma decisão em aberto. A conferência manual não incluiu uma partida completa de 300 rodadas; os testes exercitam os prazos e as escolhas pela engine real.

Validações: 187 testes passaram. ESLint e Prettier aprovaram os arquivos alterados, e a conferência de whitespace passou. O navegador confirmou os filtros, coleções vazia e completa, persistência e aviso de uma conquista nova, sem erros JavaScript ou rolagem horizontal. A inspeção registrou zero falhas e os dois avisos já justificados. As capturas finais da inspeção e dos avisos foram abertas para revisão; os relatórios ficam em `.taste-skill/qa/conquistas-after/` e `.taste-skill/inspect-conquistas-recentes/`.

## Animação de conquista no centro

O aviso ocupa o centro da janela em todas as larguras. O selo aparece acima do nome, com a condição abaixo; o painel mantém o fundo escuro e o dourado do jogo. A entrada dura 640 ms, com escala discreta e deslocamento de 18 px. Selo e texto chegam com pequenos atrasos. A saída dura 320 ms e parte da opacidade e da posição atuais, mesmo quando o jogador fecha o aviso durante a entrada. A fila avança ao terminar a animação; um prazo de reserva cobre a ausência do evento de término.

ROUND 1
Seen in one second: um aviso de conquista no centro, com selo e nome em destaque.
Idea (one sentence): a conquista recebe um momento próprio sobre a partida, como o usuário pediu.
Live thing: dispensar o aviso ou deixar a fila seguir automaticamente; foco e cursor pausam a leitura.
Layout words by section: aviso=selo, nome e condição / partida=conteúdo existente ao fundo.
Scores: design 8 · usability 8 · creativity 7 · content 8 → overall 7.8
Caps applied: a sobreposição temporária cobre partes da partida por decisão explícita do usuário.
Top three problems (most visible first), each with the screenshot it shows in and the fix:
1. O aviso anterior ficava num canto; as capturas `*-center.jpg` confirmam o centro horizontal e vertical.
2. Fechar durante a entrada podia substituir a posição por um quadro inicial diferente; o fechamento agora começa no estado calculado do painel. O ensaio comparou a opacidade antes e depois da interrupção.
3. Nenhum outro problema desta alteração nas capturas finais. O painel flutuante pode cobrir conteúdo durante a leitura; o botão de fechar e o prazo automático continuam disponíveis.

A inspeção final permite `heavy-shadow` para a sombra do aviso flutuante, `covered-text` para sua posição central solicitada e `text-shadow` para o nome sobre o retrato já existente. Os avisos de marfim, bordas e textos pequenos pertencem à paleta e aos controles do jogo; o novo aviso usa corpo de 15 px e nome de 26 px no desktop, 23 px no celular.

- [x] Centralizar o aviso, ampliar o nome e reorganizar o selo e os textos.
- [x] Suavizar entrada e saída, incluindo o fechamento antes do fim da entrada.
- [x] Preservar fila, fechamento automático, pausa com foco e movimento reduzido.
- [x] Conferir desktop, tablet, celular e tela horizontal, além dos testes e da inspeção visual.

Resumo: o aviso de conquista aparece no centro com movimento contínuo. Nenhuma pendência desta alteração.

Validações: 39 testes de interface, controlador e conquistas passaram; ESLint, Prettier e a conferência de whitespace também passaram. O navegador confirmou centralização com erro menor que 1 px, ausência de rolagem horizontal, foco, fila, fechamento automático e interrupção da entrada em 1440×900, 768×1024, 390×844 e 640×320. O ensaio com movimento reduzido manteve o conteúdo estático. As capturas finais foram abertas; a inspeção registrou zero falhas com as permissões acima. Arquivos de ensaio e relatórios ficam em `.taste-skill/qa/conquista-central/` e `.taste-skill/inspect-conquista-central-final/`.

## Aviso compacto com saída automática

O usuário pediu uma faixa menor, só com a estrela ao lado do nome. O aviso mantém o centro da janela, usa estrela de 24 px e nome de 18 px (17 px no celular), com altura mínima de 56 px. A largura acompanha o nome até 420 px; nomes maiores podem quebrar linha. O aviso inteiro funciona como botão para dispensar, com contexto de conquista ou prévia no nome acessível. A interface não mostra o rótulo, a descrição nem o botão separado de fechar.

O aviso começa a sair após 3 segundos e conclui a animação em mais 320 ms. Cursor e foco não interrompem esse prazo, conforme o pedido seguinte do usuário. Clicar ou tocar permite fechá-lo antes. A fila continua com uma conquista por vez.

ROUND 1
Seen in one second: estrela e nome numa faixa curta no centro.
Idea (one sentence): reconhecer a conquista com um aviso pequeno sobre a partida.
Live thing: tocar na faixa para dispensar ou aguardar a saída automática.
Layout words by section: aviso=estrela ao lado do nome / partida=conteúdo ao fundo.
Scores: design 8 · usability 8 · creativity 7 · content 8 → overall 7.8
Caps applied: a posição central mantém a sobreposição temporária solicitada.
Top three problems (most visible first), each with the screenshot it shows in and the fix:
1. O painel anterior ocupava espaço demais; as capturas finais mostram a faixa com apenas uma linha para “Um ano inteiro”.
2. A pausa com cursor ou foco podia manter o aviso aberto; o prazo agora é fixo e o navegador confirmou a saída com ambos sobre o aviso.
3. Nenhum outro problema desta alteração nas capturas finais. A revisão também removeu a sombra da faixa.

- [x] Colocar a estrela ao lado do nome e retirar os textos extras.
- [x] Reduzir o tamanho e preservar o centro e a animação suave.
- [x] Dispensar por clique ou toque e sair automaticamente após 3 segundos.
- [x] Conferir fila, foco, cursor, movimento reduzido e as larguras de desktop, tablet, celular e tela horizontal.

Resumo: a conquista aparece numa faixa compacta e desaparece sozinha. Nenhuma pendência desta alteração.

Validações: 15 testes de interface e controlador passaram, assim como ESLint, Prettier e a conferência de whitespace. O ensaio no navegador passou em quatro tamanhos de janela e em movimento reduzido; o teste adicional confirmou a saída automática com cursor e foco sobre a faixa. A inspeção visual registrou zero falhas e dois avisos da paleta e dos textos auxiliares existentes. As permissões `text-shadow` e `covered-text` correspondem ao nome do retrato e à sobreposição central já solicitada. As capturas finais foram abertas e ficam em `.taste-skill/inspect-conquista-compacta-final/`; o ensaio de comportamento fica em `.taste-skill/qa/conquista-compacta/`.

## Brilho de desbloqueio

O pedido seguinte acrescenta brilho à faixa compacta. A estrela entra com giro curto e um pulso dourado, enquanto uma onda circular se expande e desaparece. Um reflexo diagonal atravessa a faixa uma vez; a borda também ilumina por um instante. Os efeitos terminam antes da saída automática, que continua começando após 3 segundos. A faixa mantém o tamanho, o centro e apenas o nome ao lado da estrela. Movimento reduzido oculta as camadas de luz e mantém o conteúdo estático.

ROUND 1
Seen in one second: uma conquista com estrela iluminada e reflexo dourado.
Idea (one sentence): o brilho marca o instante do desbloqueio sem ampliar a faixa.
Live thing: dispensar por clique ou aguardar a saída automática.
Layout words by section: aviso=estrela e nome / luz=pulso e reflexo breve.
Scores: design 8 · usability 8 · creativity 8 · content 8 → overall 8.0
Caps applied: nenhuma nova; a sobreposição central permanece por pedido do usuário.
Top three problems (most visible first), each with the screenshot it shows in and the fix:
1. A faixa anterior tinha pouco destaque; o quadro de 650 ms mostra o reflexo e a estrela iluminada.
2. Efeitos contínuos poderiam disputar a leitura; o reflexo atravessa a faixa uma vez e as ondas desaparecem.
3. Nenhum outro problema nas capturas finais. O texto permanece legível durante o brilho.

O brilho e o gradiente do reflexo atendem ao pedido explícito do usuário, que prevalece sobre a regra visual geral da skill. A inspeção permite `gradient` para esse reflexo; `text-shadow` e `covered-text` continuam restritos ao retrato existente e à posição central solicitada. O quadro de inspeção congela uma cópia do aviso em 650 ms para permitir a comparação entre larguras; o ensaio de comportamento usa o aviso real com seu prazo normal.

- [x] Acrescentar pulso na estrela, onda circular e reflexo dourado na faixa.
- [x] Preservar tamanho compacto, nome e posição central.
- [x] Manter saída após 3 segundos, fila, dispensa por clique e movimento reduzido.
- [x] Conferir as animações no navegador e abrir as capturas da inspeção nas três larguras.

Resumo: o aviso ganha um brilho breve de desbloqueio sem aumentar de tamanho. Nenhuma pendência desta alteração.

Validações: 15 testes de interface e controlador passaram, assim como ESLint, Prettier e a conferência de whitespace. O navegador confirmou fila, centralização, fechamento antecipado e saída automática, inclusive com cursor e foco, em desktop, tablet, celular, tela horizontal e movimento reduzido. Não houve erros JavaScript nem rolagem horizontal. A inspeção registrou zero falhas e os dois avisos existentes de paleta e textos auxiliares. Capturas e relatórios ficam em `.taste-skill/qa/conquista-brilho/` e `.taste-skill/inspect-conquista-brilho/`.

## Correção da rolagem no aviso

O quadro ainda usava `overflow-y: auto`, que podia transformar a expansão dos efeitos em rolagem. O quadro agora deixa os efeitos visíveis; apenas a camada do reflexo usa `overflow: clip`. O nome define a altura necessária, e a coluna da grade respeita a largura da janela. Essa última correção evita que o nome mais longo ultrapasse as bordas no celular.

- [x] Remover a área rolável do quadro, preservando o brilho e a saída automática.
- [x] Conferir o maior nome do catálogo em cinco momentos da animação, nas larguras de 1440, 768, 390 e 320 px.

Resumo: o aviso não cria barra de rolagem e mantém o nome completo, com quebra de linha quando necessário. Nenhuma pendência desta correção.

Validações: o navegador confirmou ausência de deslocamento interno nos dois eixos, nome dentro do quadro, quadro dentro da janela e saída automática nas quatro larguras. As quatro capturas foram abertas e não houve erros JavaScript ou rolagem horizontal da página. A conferência de whitespace passou. O ensaio está em `.taste-skill/qa/conquista-sem-scroll/`; a inspeção do quadro registrou zero falhas, com as permissões de brilho e sobreposição já documentadas.

## Revisão de design do jogo inteiro: 8 de novembro de 2026

Rodada feita só com capturas e medições do jogo rodando; nenhum arquivo de `css/`, `js/` ou `index.html` foi tocado. Os scripts e as imagens ficam em `.taste-skill/qa/`, começando por `varrer-cortes.mjs`, `repetir-caso.mjs`, `medir-colunas-estreitas.mjs`, `medir-celular.mjs`, `medir-composicao.mjs`, `medir-secundarios2.mjs`, `capturar-corte-real.mjs`, `achar-fundo.mjs`, `varrer-vazio.mjs` e `testar-travamento.mjs`.

ROUND 1
Seen in one second: uma mesa preta de três colunas, com o retrato do herdeiro à esquerda e a decisão no centro pedindo um clique.
Idea (one sentence): a crônica é um livro-caixa preto onde o herdeiro e as consequências do governo dele ficam frente a frente, com a honra como único sinal de cor.
Live thing: a quantidade e o tamanho das opções mudam a cada sorteio, e a borda do retrato acompanha a honra.
Layout words by section: início=arte e lista de ações em duas colunas / jogo=retrato, decisão, evento / resultado=consequências e "Continuar →" / legado=progresso, busca e categorias.
Scores: design 7 · usability 5 · creativity 7 · content 8 → overall 6.5
Caps applied: conteúdo cortado fora da tela limita usability a 5, pelas capturas de 1024×600 e 1366×625.
Top three problems (most visible first), each with the screenshot it shows in and the fix:
1. A última escolha fica cortada em janela baixa. Em `.taste-skill/qa/corte-real-1024x600-mercador.png` o botão "Seguir sem comprar." termina em 644 px contra 600 px de janela e a `.mesa` vai a 659 px; em `corte-real-1366x625-obras.png` as sete opções empurram o último botão para 665 px contra 625 px. Acima de 900 px o `body` fica com `overflow: hidden` (css/style.css:23), então quem recebe o corte não alcança o botão nem com rolagem. Correção: liberar rolagem vertical em janela baixa (`@media (min-width:901px) and (max-height:700px)`) ou dar `min-height: 0` às linhas de `.mesa` e um `overflow-y: auto` à `.coluna-escolhas`.
2. A fileira de atributos do celular colide. Em `.taste-skill/qa/celular-atributos-390.png` a `.herdeiro-detalhes` tem 165 px com `grid-template-columns: repeat(5, 33px)`; "120 / 120" mede 67 px e termina em x=180, atravessando a coluna Escudo que começa em x=146; "+50" quebra em duas linhas de 48 px e sobe o ícone 7 px, desalinhando a fileira. A causa é `width: min(100%, calc(var(--altura-cartas)*.75))` (css/style.css:333) sem contrapartida nos blocos de ≤600 px (linhas 655-687 e 688-750). Correção: `width: 100%` nesses blocos, `repeat(5, minmax(0,1fr))` em `.atributos` e `dd` sem quebra de linha com fonte menor.
3. As colunas laterais viram fita de uma palavra por linha em janela baixa. Na mesma captura de 1024×600 a grade é `313px 298px 313px`, mas `.carta-herdeiro` e `.evento-detalhes` têm 144 px porque a largura deriva da altura do cartão; `.informacoes` cai para 144 px em 8 linhas, enquanto 169 px de cada trilho lateral ficam vazios e o centro recebe só 298 px. Correção: largura de coluna vinda do trilho (`width: 100%` com `clamp` no `max-width`) em vez de `--altura-cartas`, e `align-content: center` em `.mesa`.

Achados secundários, com medição:

- Em 1920×1080 a `.mesa` termina em y=760 e a janela tem 1080 px, o que deixa 320 px vazios embaixo; em 1440×900 sobram 146 px. A `.marca` começa em x=284 e a `.mesa` em x=360, diferença fixa de 76 px que aparece também em 1440 (x=44 contra x=120).
- Cada linha de atributo põe o ícone em x=167 e o valor terminando em x=477: 202 px de nada entre "120 / 120" e o resto, 282 px na linha do escudo (`justify-content: space-between`, css/style.css:377).
- "Habitantes da vila" quebra em duas linhas em 1440 porque o `dt` tem `max-width: 100px` (css/style.css:282).
- No resultado, cada item das consequências ocupa os 372 px da coluna com rótulos de seis caracteres ("Honra-3", "Gold+4"), medido em 1440×900.
- Em 768×1024 as linhas da `.mesa` ficam `240px 166px 145px 0px 281px`: existe uma linha de 0 px, provavelmente um item de grade morto. Correção do registro anterior: não há vazio de 181 px entre atributos e escolhas nessa largura, porque `.evento-detalhes` ocupa y=598–733 e as escolhas começam em y=757, gap de 24 px.
- Varredura completa dos 385 eventos em 19 resoluções, um sorteio por caso: corte real em 1024×600 (3 eventos), 1000×650 (1), 960×600 (8) e 1280×720 (1, um rótulo de resultado 13 px abaixo da dobra). Em 1440×900, 1920×1080, 1536×864, 1600×900, 1024×768 e 1280×800 nenhum elemento saiu da tela.
- Sorteio repetido oito vezes no mesmo caso: mercador em 1024×600 cortou 8 de 8, com o último botão em 644 ou 665 px; resultado de `vidro_sob_palpebra` em 1366×768 cortou 6 de 8 com a `.mesa` em 771 px; `construcoes_da_vila` em 1366×625 cortou 2 de 8, sempre com sete opções sorteadas.
- Em ≤900 px o conteúdo abaixo da dobra é comum (683 casos em 768×800, 186 em 900×1000), mas `body { overflow-y: auto }` (css/style.css:657) deixa a rolagem alcançar tudo; o corte só é travamento acima de 900 px.
- O gate `.taste-skill/qa/sem-scroll.mjs` está quebrado: na linha 51 ele lê `Jogo.engine.opcoes(evento,cenario)[0].id` e recebe `undefined` para `cirurgiao_barbeiro`, porque as três opções exigem `requisitos: { hpMax: 50 }` (js/events-lethal.js:437, 448 e 466) e `cumpre` lê `hpMax` como "vida atual ≤ 50" (js/engine.js:161-166) numa run nova de 120 de vida. A porta nunca termina, e foi assim que os cortes passaram. O mesmo gate ainda usa `document.documentElement.scrollHeight` como prova de corte: em 1280×720, 768 dos 770 cenários têm `docH` maior que a janela sem nenhum elemento fora da tela, porque o excedente vem da `.cronica`.
- O sorteio usa `Math.random()` sem semente em todo o engine (js/engine.js:360, 631 e 2212), então o mesmo caso corta em um sorteio e passa limpo no outro. Repetido, o teste só acerta o pior caso.
- Forçando eventos fora do sorteio, 5 casos de 385 eventos em 5 estados renderizam zero botões: `profeta_do_cometa` e `bispo` com gold 0, e `cirurgiao_barbeiro` com vida cheia, com o texto "As opções estão disponíveis" sobre nada. O sorteio normal exclui esses eventos (js/engine.js:466), então não achei travamento em partida real; a interface ainda não tem estado vazio para o dia em que um caminho agendado entregar um deles.
- O que está medido e bom: em 1440×900 os botões do cabeçalho têm todos 44 px de altura (Tutorial 93×44, ícones 44×44, y=81–125), o menu empilha quatro botões de 430×44 com passo de 54 px, e a barra do legado mede 1080×119 com progresso de 873×6.

- [x] Capturar e medir o jogo em 1920×1080, 1440×900, 1366×768, 1366×625, 1280×720, 1100×700, 1024×600, 1000×650, 960×600, 900×1000, 768×1024, 768×800 e 390×844.
- [x] Rodar os 385 eventos nas 19 resoluções separando corte real de `docH` inflado.
- [x] Repetir os casos suspeitos oito vezes para medir a frequência do corte.
- [x] Achar a causa do gate quebrado e do `hpMax`.
- [x] Conferir os secundários: grade de herdeiros em repouso, barra do legado, consequências do resultado, botões do cabeçalho e menu.
- [x] Gravar as capturas de corte real em `.taste-skill/qa/`.
- [x] Corrigir os cortes em janela baixa, a fileira de atributos do celular e a largura das colunas laterais.
- [x] Consertar `sem-scroll.mjs` com guarda para zero opções e medição por retângulos, e rodá-lo de novo.
- [x] Verificar o resultado em 1366×768 e confirmar que “Continuar” fica acessível pela rolagem.
- [x] Definir `hpMax` no barbeiro como o limite da Vida atual ferida: o evento aparece com 50 de Vida ou menos.

Resumo: janelas de desktop baixas agora permitem rolagem vertical; a faixa de atributos ocupa a largura disponível no celular e alinha os valores junto aos ícones no desktop; as informações do evento usam a largura do trilho lateral. O barbeiro exige Vida atual de até 50, coerente com a oferta de tratar ferimentos.

Validações: `sem-scroll.mjs` percorreu 14.877 cenários em 19 resoluções, sem cortes inacessíveis, overflow horizontal, erros de console ou eventos sem opções. No Edge, o resultado em 1366×768 ficou acessível após rolar 72 px; no mercador em 1024×600, a última oferta ficou visível após 59 px. As capturas foram abertas para revisão. Nenhuma decisão ficou pendente; não houve teste em aparelho físico.
