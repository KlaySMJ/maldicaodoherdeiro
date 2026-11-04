# A maldição do Herdeiro

MVP de um jogo de escolhas em fantasia medieval. HTML, CSS e JavaScript puros, sem bibliotecas, instalação ou build.

## Jogar

Abra `index.html` diretamente no navegador. Clique em **Iniciar** no menu e, na introdução animada, clique em **Iniciar** quando quiser entrar no jogo. A introdução não termina automaticamente. **Continuar** avança para outra carta. **Voltar ao início** permite retomar com **Carregar**.

A run é salva ao começar, a cada decisão e ao avançar. Recarregar depois de uma decisão mostra seu resultado, sem aplicar os efeitos novamente. Sem honra negativa suficiente, chegar a zero habitantes encerra a run. Com honra de −30 ou menos, surge a escolha de encerrar ou juntar-se ao culto. Ao aderir, recebe 50 seguidores; perde se eles chegarem a zero.

**Carregar** relê a run salva no momento do clique, preservando rodada, atributos, evento, flags e resultado pendente. Se o armazenamento estiver inacessível, a sessão em memória ainda pode ser retomada.

## Regras definidas

- Início: todos têm HONRA 0 e 50 habitantes. O traço sorteado ajusta outros valores: Corajoso começa com ATAQUE 3; Avarento com 10 gold; Doente com 70/70 Vida e ESCUDO 4. Os demais valores começam em Vida 100, ESCUDO 5, ATAQUE 2 e 5 gold.
- Renda nas rodadas 3, 6, 9…: 1 gold por grupo completo de 50 habitantes. Entre 20 e 49, não há ganho. Abaixo de 20, perde-se 1 gold **a cada rodada**, com saldo mínimo zero. A população considerada é a que resta após a decisão; a renda é aplicada uma vez, ao mostrar o resultado.
- O visual muda em +30 ou mais (honra alta, azul) e −30 ou menos (honra baixa, vermelha); fica neutro de −29 a +29. Em +90 e −90, aparecem retratos extremos e novas opções. A borda e o número acompanham a faixa.
- As respostas especiais exigem +50 ou mais para honra alta, ou −50 ou menos para honra baixa. Opções com `nao_baixa` são bloqueadas em −50 ou menos. Os pesos e requisitos de estado dos eventos continuam usando a faixa visual de ±30.
- As respostas não antecipam suas mudanças de honra. A exceção é o pacto do corvo: por cinco rodadas, as opções mostram apenas a variação de honra antes da decisão.
- Batalha: ATAQUE maior ou igual à defesa inimiga vence. O dano de cada desfecho vem do evento; o recebido é `Math.max(0, dano - escudo)`. O escudo não é consumido.
- A cada dez rodadas completas, a defesa de inimigos aumenta em 1 e o dano em caso de vitória ou derrota aumenta em 2. A carta mostra os valores ajustados antes da decisão.
- Um ataque malsucedido também aplica `batalha.penalidadeFalha`, definida por evento. No exemplo, além do dano mitigado, a vila perde 12 habitantes. Outro evento pode definir perda adicional de HP ou outros efeitos.
- Não há condição de vitória definida nesta fase. `Jogo.engine.encerrar(run, "vitoria", motivo)` usa o mesmo encerramento para uma futura condição de vitória.

O visual da interface usa fundo preto com textos, bordas e desenhos brancos. Cada run sorteia um traço (Corajoso, Avarento ou Doente), que ajusta os atributos iniciais e o retrato; as ilustrações acompanham as faixas de honra. A estação muda a cada 25 rodadas, com cartas sazonais. O catálogo contém 222 definições, incluindo 12 escolhas letais bloqueadas antes da rodada 6 e eventos próprios do culto; uma definição é a transição do último habitante e só é disparada pela engine. As opções visíveis são embaralhadas ao abrir cada carta e a ordem fica salva ao carregar. Nenhum recurso externo é necessário.

Os companheiros são passivos: o cão reduz 2 de dano em batalhas, o corvo acrescenta 1 gold às recompensas positivas e o gato recupera 1 HP por rodada. Construções duram até o fim da run: ponte (+1 gold em cada renda), moinho (+1 HP por rodada), capela (+1 Escudo), forja (−2 gold no preço da arma) e muralha (−2 dano em batalha). O legado registra a rodada, honra final e causa do fim de cada herdeiro; cartas de memória podem reapresentar o registro à geração seguinte.

O gold fica no topo, junto aos recursos da vila, separado de Vida, Escudo, Ataque e Honra. Os controles de debug **Hab. −50** e **Honra +30 / −30** alteram esses valores sem avançar a rodada ou aplicar renda; a interface e as opções disponíveis são atualizadas imediatamente.

## Eventos e recompensas

O catálogo inclui encontros com ervateira, pedreira e milícia, colheita, enchente, contrabando e caçadas a javalis. As recompensas variam entre gold, cura, ataque, escudo e novos habitantes; vitórias também podem recuperar recursos. Os desertores só entram no sorteio a partir da rodada 6.

As sequências da própria run incluem a ponte e sua caravana, o poço e a febre, o órfão acolhido e seu treinamento (a partir da rodada 8), além da revolta contra o pedágio da ponte. Se o órfão for acolhido com honra ≥50, a nomeação como conselheiro aparece após 40 rodadas; então as cartas negativas do conselheiro deixam de ser sorteadas. O conselheiro tem 15 cartas positivas e 15 negativas, mais três cartas especiais positivas do menino. Depois de um conselho, cinco outros conselhos precisam aparecer antes que ele possa voltar; essa sequência é salva na run. A bruxa tem peso maior no sorteio e quatro encontros adicionais. As etapas dessas sequências deixam de aparecer quando resolvidas. São flags da run, sem novos objetivos de legado.

O testamento pode ser sorteado a partir da rodada 5, uma vez por run. Lê-lo concede 6 gold, reduz a honra em 3 e registra `vontade_lembrada` em `run.conquistas`; essa flag só entra no legado no encerramento, inclusive em derrota. Não concede moedas automaticamente a outros herdeiros.

O banquete exige honra ≥30 para entrar no sorteio, e sua resposta especial exige ≥50. Em celulares baixos, cartas com quatro respostas as mostram em duas colunas. A taverna tem peso maior em honra ≤−30 e uma resposta exclusiva em ≤−50. O barão aparece a partir da rodada 4: negociar exige honra ≥50 e 3 gold, custa 3 gold e 3 HP diretos. Seus combates usam defesa 4 e as mesmas regras de mitigação e penalidade de falha dos demais eventos.

As novas cadeias acompanham o moinho e a farinha, o bardo e sua canção, o prisioneiro, o padre e a capela, a praga, a mina, o cometa e o poço. Outras cartas entram a partir de rodadas específicas, incluindo batalhas contra a fera, invasores e o retorno do barão. As escolhas de três eventos registram `senhor_compreendido`, `vontade_ouvida` e `sucessor_pressentido` no legado ao fim da run. `sucessor_pressentido`, vindo do evento 100, libera “O Primeiro Herdeiro” a partir da rodada 18.

As cartas 101–120 são especiais, pesam 0,3 no sorteio (o Primeiro Herdeiro, 0,2) e só podem aparecer uma vez por run, mesmo se recusadas. Pactos são exclusivos: aceitar um pacto marca `pacto_feito` e impede outros pactos nessa run. O Corvo revela somente a variação de honra das opções durante as cinco rodadas seguintes. O Relojoeiro pode definir a honra do herdeiro como zero. O Espelho, o Primeiro Herdeiro, alguns pactos e três desfechos da cadeia abissal concedem flags de legado, gravadas ao encerrar a run.

As cartas 130–155 abrem duas cadeias raras. O Mercador de vermelho surge com 25% de chance logo após uma visita de mercador; seus diálogos mostram a resposta correta e duas alternativas em ordem aleatória. Aceitá-lo corretamente agenda uma carta do zodíaco a cada 50 rodadas, elegível durante uma janela de 10 rodadas. O Viajante do Norte pode surgir depois da Geada ou do Inverno Longo; se acolhido, libera um evento divino no máximo a cada 40 rodadas. As doze cartas do zodíaco e as doze cartas divinas têm arte própria. Os efeitos divinos duram de cinco a dez rodadas, aparecem no indicador da run e podem modificar atributos, ganhos de gold, população, cura, dano de batalha ou informação das escolhas. As cartas não identificam a bênção ou maldição antes da decisão.

O sorteio evita as últimas dez cartas, mantendo os pesos por honra entre as elegíveis. Se restarem poucas cartas, libera a mais antiga primeiro para continuar o jogo. O histórico é salvo; carregar não reinicia esse intervalo. O catálogo completo de escolhas e consequências está em `eventos-e-beneficios.txt`.

## Gold e mercador

O mercador entra no sorteio de eventos e pode aparecer ocasionalmente. Cada visita oferece os três produtos regulares e um item utilitário aleatório, salvo junto à run para não mudar ao recarregar. Os produtos regulares aplicam seus aprimoramentos imediatamente; o item aleatório vai para o inventário e pode ser usado em outra rodada. Comprar encerra a visita. Ofertas sem saldo suficiente ficam desativadas.

| Produto | Efeito | Preço inicial |
| --- | --- | --- |
| Poção de cura | +10 HP | 5 gold |
| Arma melhor | +2 ATAQUE | 10 gold |
| Escudo melhor | +3 ESCUDO | 10 gold |

Cada compra aumenta em 2 gold o preço **daquele produto**, nas próximas visitas da mesma run. Os contadores são independentes: comprar uma poção não encarece armas nem escudos. A compra é paga antes da renda da rodada; moedas que ainda serão recebidas não podem financiar a oferta. O resultado discrimina compra, renda ou manutenção e variação final do saldo.

Os itens aleatórios iniciais incluem o Amuleto de última guarda (anula o dano da próxima batalha), o Óleo de lâmina (+2 Ataque na próxima batalha), a Moeda sussurrante (+1 gold na próxima recompensa positiva em gold) e o Elixir do escudo (+3 Escudo na próxima batalha). O baú da estrada pode conceder uma Poção de cura grande (+25 HP), uma Faca de caça (+1 Ataque permanente) ou um Pote de moedas velhas (+5 gold ao usar). Usar um item consome uma unidade e não avança a rodada. Cada item vendido tem seu próprio preço; o Elixir começa em 7 gold e sobe 2 gold por compra bem-sucedida. Os itens encontrados não têm preço. Itens de run podem ser concedidos por escolhas com `itens: ["id_item"]`. Equipamentos com `aoReceber` aplicam o bônus diretamente aos atributos; ao encontrar uma arma, a próxima compra de Arma melhor fica 2 gold mais cara.

Saldo e contadores `comprasMercador` são salvos junto à run. Ao carregar, compras e renda não são repetidas. Saves da versão anterior recebem 5 gold e preços iniciais, preservando rodada, atributos, evento e resultado. Cada novo herdeiro começa com 5 gold e preços iniciais; moedas e compras não passam para o legado.

Itens são classificados por raridade e cor: Comum (branco), Raro (azul), Épico (roxo), Lendário (laranja) e Pacto (vermelho). Acima de 90 de honra, o ferreiro pode oferecer o Selo dos guardiões (+3 Ataque, +4 Escudo e +25 Vida). Com −90 ou menos, algumas entidades oferecem o Dente do Abismo (+5 Ataque, +5 Escudo e +30 Vida), que cobra 15 de Honra e 5 habitantes.

O inventário fica disponível em um painel expansível durante a run e mantém o registro dos itens conquistados, com raridade, descrição do efeito e estado: disponível na mochila, efeito permanente aplicado ou sem unidades disponíveis. Usar um consumível não apaga seu registro. Ao aderir ao culto, o herdeiro recebe uma Adaga cerimonial de pacto: uma vez por run, sacrifica 10 habitantes ou seguidores para ganhar +10 Ataque. Ganhar habitantes durante a run acrescenta de 1 a 5 seguidores aleatórios; a cada dez rodadas após a adesão, chegam mais cinco. Cada ponto de honra ganho causa a saída de dois a quatro seguidores, informada em destaque no resultado da decisão.

O catálogo também contém 36 equipamentos genéricos permanentes: 13 comuns, 14 raros e 9 épicos. Eles aparecem no achado da forja com pesos de raridade 10:4:1; cada peça só pode ser recebida uma vez por run. Equipamentos de Ataque encarecem Arma melhor em 2 gold, os de Escudo encarecem Escudo melhor, e os de Vida aumentam Vida máxima e atual pelo mesmo valor. Corajoso e Avarento começam com máximo 100; o Doente começa com máximo 70, que pode aumentar com melhorias permanentes. Curas respeitam o limite atual de cada herdeiro.

Relíquias e pactos chegam pelo embrulho sem brasão. Entre os efeitos estão vitórias com dano de derrota, conversão de soldados em habitantes, cargas de proteção para batalhas, aumento da chance de eventos abissais e bônus especiais para o culto. O Escudo da fé permite reutilizar consumíveis com dez rodadas de intervalo, exceto itens de uso único por run. A Espada da verdade só entra no legado depois de 200 rodadas consecutivas com honra entre −30 e +30; a Lança do Herói exige +100 de honra e evita dez batalhas.

O jogo se ajusta à largura e à altura disponíveis, sem rolagem da página. No desktop, cartas, informações e escolhas usam três colunas. Em telas estreitas, as duas artes ficam lado a lado, com atributos, narrativa e respostas logo abaixo. Em telas baixas na horizontal, os blocos usam quatro colunas. O tamanho das artes é calculado novamente ao mudar a tela, escolher uma resposta, redimensionar a janela ou mostrar um aviso de salvamento.

As molduras do herdeiro e do evento mantêm a proporção 3:4 e o mesmo tamanho. As ilustrações não são esticadas nem recortadas. O ajuste reduz primeiro as artes e os espaços, compactando o texto apenas quando necessário. Frases decorativas deixam de aparecer nos modos compactos; no resultado, a consequência ocupa o lugar da descrição e dos detalhes do evento que o jogador já leu. Os atributos e as escolhas continuam visíveis. A honra usa um contorno azul ou vermelho por fora do retrato, e os números de batalha seguem em texto corrido.

O retrato volta aos três SVGs clássicos: neutro, honra alta e honra baixa. A honra extrema mantém o contorno duplo da carta. O cabeçalho explica o traço: Corajosa começa com +1 Ataque, Avarento com 10 Gold, e Doente com 70 Vida e 4 Escudo. O Doente começa com 70 de Vida máxima, que pode aumentar com melhorias permanentes. As temporadas mudam a cada 25 rodadas e são mostradas no cabeçalho; quatro cartas só aparecem na estação correspondente.

As cartas especiais do culto e os doze novos eventos letais têm ilustrações SVG próprias. A memória da run anterior fica no legado separado e pode aparecer em cartas sobre o túmulo ou uma criança que reconta a crônica.

## Organização

| Arquivo | Responsabilidade |
| --- | --- |
| `js/state.js` | Valores iniciais, faixas de honra e criação da run |
| `js/events.js`, `js/events-specials.js`, `js/events-lethal.js`, `js/events-cult.js`, `js/events-foundations.js` | Catálogo de eventos, requisitos, efeitos, pesos, batalhas, estações, culto e cadeias especiais |
| `js/items.js` | Catálogo e efeitos dos itens utilizáveis |
| `js/legacy.js` | Objetivos vazios, concessões e união do legado |
| `js/engine.js` | Pools, requisitos, sorteio, resolução e encerramento |
| `js/save.js` | Persistência, validação e recuperação de falhas |
| `js/ui.js` | Telas e apresentação, sem regras de resolução |
| `js/main.js` | Fluxo e conexão entre interface, engine e salvamento |

Os scripts comuns compartilham o namespace `window.Jogo`; não usam `fetch` nem módulos, para funcionar em `file://`.

## Adicionar eventos

Cada evento tem `id`, `titulo`, `tipo`, `peso`, `imagem`, `imagemAlt`, `texto`, `informacoes` e `opcoes`. Cada opção tem `id`, `texto`, `efeitos`, `resultado` e, opcionalmente, `requisitos`, `flags`, `multiplicadores`, `combate`, `definir`, `efeitoContinuo` e `desbloqueia`. Eventos especiais usam `tipo: "especial"`, `especial: true` e peso decimal; pactos têm `pacto: true`. A run tem ainda cartas de achado, incluindo um baú de aparência comum cuja armadilha só se revela no resultado se disparar. A chance é 1 em 6; a armadilha causa 10 de dano de HP e rouba um item aleatório da mochila, se houver. Os eventos 121–125 formam uma cadeia abissal rara: cada etapa exige a marca da etapa anterior, e toda resposta avança a cadeia. Os pesos permanecem fixos.

`efeitos` soma valores a `hp`, `escudo`, `ataque`, `honra`, `habitantes` e `gold`. Depois, `multiplicadores` aplica fatores e arredonda para baixo. Todos os atributos exceto honra têm mínimo zero. A geada causa dano direto; a mitigação é aplicada somente ao dano de batalha.

Requisitos aceitam `honra: "alta"`, `"baixa"` ou `"nao_baixa"`, limites como `hpMin`, `honraMax`, `ataqueMin`, `goldMin`, `rodadaMin` e `rodadaMax`, listas `flags` (da run), `flagsAusentes`, `flagsLegado` e `itens`. `flagsAusentes` impede repetir etapas já resolvidas. Eventos e opções usam o mesmo avaliador. Uma carta pode mostrar até quatro opções visíveis; o evento das caixas tem duas variantes mutuamente exclusivas para a terceira resposta. Um evento mandatório oferece uma opção.

Ao avançar, o sorteio avalia a rodada de destino, permitindo um evento já na sua rodada mínima. Os requisitos de honra da carta são avaliados no sorteio; as respostas são reavaliadas a cada alteração de honra. Usar os controles de teste numa carta já aberta não invalida seu salvamento; rodada, flags e demais requisitos continuam sendo validados ao carregar.

Um evento pode ter `pesos: [{ requisitos: { honra: "baixa" }, valor: 5 }]`; a primeira regra satisfeita substitui o peso base. Isso aumenta a incidência de desordem com honra baixa. O intervalo de repetição dentro da run fica em `Jogo.config.memoriaEventos`; `run.eventosRecentes` guarda as últimas cartas resolvidas. O legado também guarda as cartas comuns das duas runs anteriores, mesmo se foram substituídas antes do fim, e as evita quando há outras opções elegíveis.

As cartas `especial: true` recebem a marca `especial_<id>` quando sorteadas e saem da pool pelo restante da run. A cadeia abissal depende também das flags `abissal_1` a `abissal_5`, concedidas por qualquer resposta do estágio correspondente. `pacto: true` exige que `pacto_feito` ainda esteja ausente; uma opção de pacto grava essa marca ao ser escolhida. Recusar não grava pacto. `definir` define atributos diretamente; `efeitoContinuo.revelarHonraRodadas` mantém a prévia de honra durante o prazo salvo na run.

Eventos de comércio também aceitam `mercadorias`, com `id`, `texto`, `preco`, `aumentoPreco`, `efeitos` e `resultado` por produto. Seus requisitos são opcionais. Use uma opção normal para seguir sem comprar, garantindo uma saída mesmo sem gold. Os preços, efeitos e incrementos ficam no catálogo; o intervalo de renda e as faixas de população ficam em `Jogo.config.economia`, em `js/state.js`.

## Legado

`localStorage.run_atual` contém a run; `localStorage.legado` contém conteúdo liberado, objetivos concluídos e a rotação de cartas comuns entre runs. Apagar a run não apaga o legado.

As conquistas são registradas em `run.conquistas` quando obtidas, mas só são transferidas para a chave `legado` no encerramento de qualquer run. A run usa `legadoDaRun`, uma fotografia dos desbloqueios existentes no seu início. Assim, um desbloqueio só entra no sorteio em runs seguintes.

`Jogo.objetivosLegado` está vazio por decisão do autor. Para adicionar um objetivo depois, use este formato (esquemático):

```js
{
  id: "id_definido_pelo_autor",
  condicao: run => /* condição definida pelo autor */ false,
  desbloqueia: { eventos: [], itens: [], flags: [] }
}
```

A condição é checada no começo, após cada decisão e no encerramento. Uma opção pode ter `desbloqueia: { eventos: ["id_evento"], itens: ["id_item"], flags: ["id_flag"] }`. Flags da run em `opcao.flags` são diferentes de flags persistentes em `opcao.desbloqueia.flags`.

No catálogo, `bloqueado: true` exige que o próprio ID esteja liberado no conjunto correspondente. `requerDesbloqueio: "id"` exige uma chave já liberada como evento, item ou flag de legado. A engine constrói ambas as pools a partir desses campos. Itens comprados e concedidos por opções ficam no inventário da run; `Jogo.engine.usarItem(run, id)` aplica o uso e consome uma unidade. Os itens podem preparar bônus para a próxima batalha ou recompensa em gold.

O legado não entrega inventário nem altera os atributos iniciais. Não há lista de objetivos secretos, avisos de conquista nem registro público dos desbloqueios nesta versão.

O encerramento salva primeiro uma run terminal recuperável, une as conquistas ao legado e só então apaga a run. Se a gravação do legado falhar, mantém a run terminal e oferece nova tentativa. A união não duplica IDs ao repetir uma tentativa. Leitura, gravação e remoção usam `try/catch`; saves incompatíveis ou corrompidos são rejeitados e o jogador recebe um aviso.

Se o armazenamento estiver bloqueado, também é possível começar outro herdeiro sem salvar. As conquistas de runs encerradas são mantidas em memória durante a sessão e incluídas numa futura gravação bem-sucedida. O aviso informa que fechar a página pode perder esses dados.

## Verificar

Com Node instalado, execute `node --test tests/engine.test.cjs tests/main.test.cjs tests/novos-eventos.test.cjs`. Não é necessário para jogar.

Teste também no navegador: iniciar → escolher → recarregar → carregar; confira que a escolha não é reaplicada. Melhore a espada na forja e compare a batalha antes e depois. Verifique que o escudo permanece igual. Jogue até uma derrota e inicie outro herdeiro. Para simular corrupção, altere uma chave no painel de armazenamento do navegador e recarregue; o jogo deve continuar utilizável.
