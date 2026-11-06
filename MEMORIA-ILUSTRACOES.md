# Memória das ilustrações

Consulte este arquivo antes de qualquer geração, edição ou avaliação de artes do jogo. Use as referências citadas, não apenas uma descrição textual do estilo.

## Direção visual

- RPG medieval narrativo; atmosfera sombria, fundo do jogo preto e artes sem moldura desenhada dentro da imagem.
- Gravura medieval em nanquim: contornos feitos à mão e de espessuras variadas, hachuras para volume e rostos expressivos, com caricatura sutil. Evitar realismo fotográfico, anime, cartoon infantil, pixel art e 3D.
- Paleta de preto e marfim envelhecido, com detalhes pequenos em dourado envelhecido quando fizer sentido. Evitar branco puro e grandes áreas frias; não adicionar cores vibrantes sem pedido.
- Ao editar uma personagem existente, use a própria arte como referência de identidade. Preserve rosto, idade, cabelo, expressão e silhueta; enriqueça roupa, materiais, acessórios e hachuras sem trocar sua aparência.
- A arte deve manter fundo transparente quando o formato e o uso permitirem. O fundo preto pertence à interface; não desenhe uma placa ou moldura na ilustração.
- Artes de cartas de evento podem ser convertidas para WebP com qualidade 90 e máximo de 800 px no maior lado, preservando proporções, transparência e cor. Essa mudança é apenas de formato; não redesenhar nem alterar a tonalidade. Manter PNGs compartilhados com usos fora das cartas e os retratos de herdeiro requeridos pelo caminho dinâmico da interface.

## Referências por categoria

| Categoria | Referência principal | Uso |
| --- | --- | --- |
| Tonalidade das cartas de evento | `assets/vila.png` | Padrão de marfim envelhecido, sombras quentes e tinta escura para todas as artes de evento. A luz da referência fica aproximadamente em `#D6CAB6`; a própria imagem da vila é a referência final definida pelo usuário. |
| Cenas de evento e objetos | A carta existente mais próxima do tema; `assets/vila.png`, `assets/caixas.png`, `assets/forja.png` e `assets/ervas.png` são referências para cenas genéricas | Preservar leitura simples da cena e a paleta da vila. Evitar detalhes incidentais que desviem o foco. |
| Riqueza de gravura para eventos especiais | `assets/eventos-especiais/norte-odin.png`, `norte-freya.png` e `norte-loki.png` | Referência de hachuras, personalidade, silhueta e pequenos acentos dourados. Aproveitar a técnica; não copiar símbolos ou roupas sem relação com o evento. |
| Retratos de personagens de evento | O retrato atual da mesma personagem; para acabamento, comparar `assets/eventos-pessoas/ferreiro.png`, `padre.png`, `bruxa.png` e `viuva-do-moleiro.png` | Manter a identidade do rosto e acrescentar detalhes próprios ao ofício, roupa e história. Não reutilizar o mesmo figurino ou expressão para todos. |
| Herdeiros | Primeiro, a arte neutra do mesmo herdeiro em `assets/herdeiros/`; usar `avarento-neutra.png`, `corajoso-neutra.png` e `doente-neutra.png` como referências obrigatórias de linguagem visual, busto e proporção | Todo novo personagem herdeiro deve parecer parte do elenco existente: contorno preto grosso e irregular, formas e rostos simplificados, hachura econômica, paleta chapada de marfim/preto com dourado localizado e busto recortado com fundo transparente. Preservar a identidade do novo personagem entre honra neutra/alta/baixa e culto; não copiar o rosto nem os adereços exclusivos de outro herdeiro. As roupas são a principal diferença entre estados; a expressão muda pouco e acompanha o estado, sem carregá-lo sozinha. Honra positiva pode melhorar corte e tecido, mas a honra máxima deve continuar contida, sem camadas volumosas ou louros. O culto deve ter roupa própria. |
| Tom claro dos herdeiros | `assets/herdeiros/corajoso-neutra.png`, `avarento-neutra.png` e `doente-neutra.png` | Usar essas três artes como referência direta para pele, cabelo claro, tecido claro e áreas de luz. O tom médio observado nas áreas claras é aproximadamente `#F9EEDD`, com variação de papel e sombra preservada. Não usar branco puro nem o tom da vila `#D6CAB6` para herdeiros; esse tom pertence às cartas de evento. A referência visual dessas três imagens prevalece sobre o valor aproximado. |

Algumas artes PNG de evento têm correção de cor na exibição por meio da classe `imagem-evento--tom-vila`, listada em `js/ui.js` e definida em `index.html`. Use-a quando uma nova arte ficar mais branca ou fria que `assets/vila.png`; não aplique a correção às imagens que já estiverem na tonalidade de referência.

## Decisões já definidas

- Herdeiros são retratos de busto. A mulher usa tiara e vestido, não roupa pesada. Avarento e Doente usam coroa. Diferencie os trajes entre herdeiros; não use moedas ou flores na roupa do Avarento. A versão de culto deve ter roupa própria.
- A Heroína do povo tem uma pequena pinta redonda logo abaixo do canto direito da boca (para quem olha) em todas as versões. Pele e áreas claras dos cachos usam o branco quente padrão dos herdeiros. As versões neutra e de honra mantêm mangas curtas lisas iguais, com os antebraços visíveis no recorte do busto; o culto conserva o formato próprio das mangas. Manter a mesma escala, posição vertical e altura visível entre as versões de honra; usar a honra +30 como referência das margens transparentes.
- O plano `HERDEIROS-FUTUROS.md` define que novos retratos usem diretamente Corajoso, Avarento e Doente como referências visuais. A média aproximada das áreas claras é `#F9EEDD`; usar as imagens como fonte de verdade e não confundir esse tom com o marfim mais escuro da vila, que foi definido para eventos.
- O Druida mantém a arte em preto e branco, com capa vermelha; na versão do culto, a noz dá lugar à chama do culto.
- Cartas de personagens, deuses e entidades devem priorizar bustos quando a figura é o assunto principal. Cartas de cena podem mostrar o contexto necessário.
- O dragão do zodíaco tem um pequeno detalhe dourado nas escamas para combinar com os demais animais.
- O dourado é um acento localizado, como uma joia, broche ou detalhe de escama. Não transformar a arte inteira em amarelo.

## Fluxo para novas artes

1. Identifique a categoria e leia esta memória.
2. Escolha uma referência de composição/identidade da mesma categoria e uma referência de acabamento. Para eventos, a cor da referência `assets/vila.png` prevalece; os deuses nórdicos servem como referência de riqueza de traço.
3. Ao editar personagem existente, passe o retrato atual como referência de identidade e descreva quais traços devem permanecer.
4. Acrescente detalhes que contem algo específico sobre aquela figura ou evento. Evite símbolos genéricos, adereços sem relação e mudanças não solicitadas.
5. Para cartas de evento, usar as versões WebP otimizadas aprovadas pelo usuário; preservar PNG de origem quando outra parte do jogo ainda o usa e conservar os PNGs/SVGs dos herdeiros referenciados dinamicamente. A conversão de formato não altera a arte e não autoriza mudanças visuais adicionais.
