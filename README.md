# A maldição do Herdeiro

MVP de um jogo de escolhas em fantasia medieval. HTML, CSS e JavaScript puros, sem bibliotecas, instalação ou build.

## Jogar

Abra `index.html` diretamente no navegador. Clique em **Iniciar** no menu e, na introdução animada, clique em **Iniciar** quando quiser entrar no jogo. A introdução não termina automaticamente. **Continuar** avança para outra carta. **Voltar ao início** permite retomar com **Carregar**.

A run é salva ao começar, a cada decisão e ao avançar. Recarregar depois de uma decisão mostra seu resultado, sem aplicar os efeitos novamente. A derrota acontece ao chegar a zero de HP ou habitantes. O fim oferece outro herdeiro com atributos reiniciados.

**Carregar** relê a run salva no momento do clique, preservando rodada, atributos, evento, flags e resultado pendente. Se o armazenamento estiver inacessível, a sessão em memória ainda pode ser retomada.

## Regras definidas

- Início: HP 100, ESCUDO 5, ATAQUE 2, HONRA 0, 50 habitantes e 5 gold.
- Renda nas rodadas 3, 6, 9…: 1 gold por grupo completo de 50 habitantes. Entre 20 e 49, não há ganho. Abaixo de 20, perde-se 1 gold **a cada rodada**, com saldo mínimo zero. A população considerada é a que resta após a decisão; a renda é aplicada uma vez, ao mostrar o resultado.
- O visual muda em +30 ou mais (honra alta, azul) e −30 ou menos (honra baixa, vermelha); fica neutro de −29 a +29. A borda e o número acompanham a faixa.
- As respostas especiais exigem +50 ou mais para honra alta, ou −50 ou menos para honra baixa. Opções com `nao_baixa` são bloqueadas em −50 ou menos. Os pesos e requisitos de estado dos eventos continuam usando a faixa visual de ±30.
- As respostas não antecipam suas mudanças de honra. As consequências aparecem depois da decisão.
- Batalha: ATAQUE maior ou igual à defesa inimiga vence. O dano de cada desfecho vem do evento; o recebido é `Math.max(0, dano - escudo)`. O escudo não é consumido.
- Um ataque malsucedido também aplica `batalha.penalidadeFalha`, definida por evento. No exemplo, além do dano mitigado, a vila perde 12 habitantes. Outro evento pode definir perda adicional de HP ou outros efeitos.
- Não há condição de vitória definida nesta fase. `Jogo.engine.encerrar(run, "vitoria", motivo)` usa o mesmo encerramento para uma futura condição de vitória.

O visual da interface usa fundo preto com textos, bordas e desenhos brancos. O herdeiro usa o desenho SVG original e duas novas variações desse mesmo personagem conforme a honra, com indicações azul e vermelha. O catálogo tem 100 eventos, incluindo cadeias de consequências e quatro eventos com quatro respostas. Os valores continuam sujeitos a balanceamento. Nenhum recurso externo é necessário.

O gold fica no topo, junto aos recursos da vila, separado de Vida, Escudo, Ataque e Honra. Os botões **Testar honra: +30 / −30** mudam somente a honra e salvam a alteração, sem avançar a rodada, aplicar renda ou repetir a decisão. A mudança de retrato e as opções disponíveis são atualizadas imediatamente.

## Eventos e recompensas

O catálogo inclui encontros com ervateira, pedreira e milícia, colheita, enchente, contrabando e caçadas a javalis. As recompensas variam entre gold, cura, ataque, escudo e novos habitantes; vitórias também podem recuperar recursos. Os desertores só entram no sorteio a partir da rodada 6.

As sequências da própria run incluem a ponte e sua caravana, o poço e a febre, o órfão acolhido e seu treinamento (a partir da rodada 8), além da revolta contra o pedágio da ponte. As etapas dessas sequências deixam de aparecer quando resolvidas. São flags da run, sem novos objetivos de legado.

O testamento pode ser sorteado a partir da rodada 5, uma vez por run. Lê-lo concede 6 gold, reduz a honra em 3 e registra `vontade_lembrada` em `run.conquistas`; essa flag só entra no legado no encerramento, inclusive em derrota. Não concede moedas automaticamente a outros herdeiros.

O banquete exige honra ≥30 para entrar no sorteio, e sua resposta especial exige ≥50. Em celulares baixos, cartas com quatro respostas as mostram em duas colunas. A taverna tem peso maior em honra ≤−30 e uma resposta exclusiva em ≤−50. O barão aparece a partir da rodada 4: negociar exige honra ≥50 e 3 gold, custa 3 gold e 3 HP diretos. Seus combates usam defesa 4 e as mesmas regras de mitigação e penalidade de falha dos demais eventos.

As novas cadeias acompanham o moinho e a farinha, o bardo e sua canção, o prisioneiro, o padre e a capela, a praga, a mina, o cometa e o poço. Outras cartas entram a partir de rodadas específicas, incluindo batalhas contra a fera, invasores e o retorno do barão. As escolhas de três eventos registram `senhor_compreendido`, `vontade_ouvida` e `sucessor_pressentido` no legado ao fim da run. `sucessor_pressentido` fica disponível para uma futura carta “O Primeiro Herdeiro”, ainda sem conteúdo nesta proposta.

O sorteio evita as últimas cinco cartas, mantendo os pesos por honra entre as elegíveis. Se restarem poucas cartas, libera a mais antiga primeiro para continuar o jogo. O histórico é salvo; carregar não reinicia esse intervalo. O catálogo completo de escolhas e consequências está em `eventos-e-beneficios.txt`.

## Gold e mercador

O mercador entra no sorteio de eventos e pode aparecer ocasionalmente. Cada visita permite comprar um produto ou seguir sem comprar. As melhorias são aplicadas imediatamente, e a visita termina como qualquer decisão. Ofertas sem saldo suficiente ficam desativadas.

| Produto | Efeito | Preço inicial |
| --- | --- | --- |
| Poção de cura | +10 HP | 5 gold |
| Arma melhor | +2 ATAQUE | 10 gold |
| Escudo melhor | +3 ESCUDO | 10 gold |

Cada compra aumenta em 2 gold o preço **daquele produto**, nas próximas visitas da mesma run. Os contadores são independentes: comprar uma poção não encarece armas nem escudos. A compra é paga antes da renda da rodada; moedas que ainda serão recebidas não podem financiar a oferta. O resultado discrimina compra, renda ou manutenção e variação final do saldo.

Saldo e contadores `comprasMercador` são salvos junto à run. Ao carregar, compras e renda não são repetidas. Saves da versão anterior recebem 5 gold e preços iniciais, preservando rodada, atributos, evento e resultado. Cada novo herdeiro começa com 5 gold e preços iniciais; moedas e compras não passam para o legado.

O jogo se ajusta à largura e à altura disponíveis, sem rolagem da página. No desktop, cartas, informações e escolhas usam três colunas. Em telas estreitas, as duas artes ficam lado a lado, com atributos, narrativa e respostas logo abaixo. Em telas baixas na horizontal, os blocos usam quatro colunas. O tamanho das artes é calculado novamente ao mudar a tela, escolher uma resposta, redimensionar a janela ou mostrar um aviso de salvamento.

As molduras do herdeiro e do evento mantêm a proporção 3:4 e o mesmo tamanho. As ilustrações não são esticadas nem recortadas. O ajuste reduz primeiro as artes e os espaços, compactando o texto apenas quando necessário. Frases decorativas deixam de aparecer nos modos compactos; no resultado, a consequência ocupa o lugar da descrição e dos detalhes do evento que o jogador já leu. Os atributos e as escolhas continuam visíveis. A honra usa um contorno azul ou vermelho por fora do retrato, e os números de batalha seguem em texto corrido.

O mesmo herdeiro tem três retratos SVG 3:4: o desenho original neutro, honra alta e honra baixa, todos em traços brancos sobre preto. As variações preservam o rosto e a roupa base. Na alta, a postura é firme e aberta, o manto está cuidado e há um selo do povo; a mão fica aberta e vazia. Na baixa, a expressão endurece, o manto fica remendado e rasgado e a mão segura o punho da arma embainhada. A transição entre faixas dura 520ms, com deslocamento leve e troca de opacidade. Ela só acontece quando uma run em andamento troca de faixa, inclusive ao voltar ao neutro; não se repete a cada decisão nem ao carregar um save. Com movimento reduzido, a troca é imediata. Os limites ficam separados em `js/state.js`; os caminhos dos retratos ficam em `js/ui.js`.

Arquivos atuais: `assets/herdeiro.svg`, `assets/herdeiro-honra-alta.svg` e `assets/herdeiro-honra-baixa.svg`. Os PNGs e seus prompts anteriores foram preservados, mas não são usados na interface. Ponte, poço e ervateira também têm desenhos SVG próprios no mesmo estilo das artes anteriores.

## Organização

| Arquivo | Responsabilidade |
| --- | --- |
| `js/state.js` | Valores iniciais, faixas de honra e criação da run |
| `js/events.js` | Catálogo de eventos, requisitos, efeitos, pesos e batalhas |
| `js/items.js` | Catálogo vazio, preparado para itens na próxima fase |
| `js/legacy.js` | Objetivos vazios, concessões e união do legado |
| `js/engine.js` | Pools, requisitos, sorteio, resolução e encerramento |
| `js/save.js` | Persistência, validação e recuperação de falhas |
| `js/ui.js` | Telas e apresentação, sem regras de resolução |
| `js/main.js` | Fluxo e conexão entre interface, engine e salvamento |

Os scripts comuns compartilham o namespace `window.Jogo`; não usam `fetch` nem módulos, para funcionar em `file://`.

## Adicionar eventos

Cada evento tem `id`, `titulo`, `tipo`, `peso`, `imagem`, `imagemAlt`, `texto`, `informacoes` e `opcoes`. Cada opção tem `id`, `texto`, `efeitos`, `resultado` e, opcionalmente, `requisitos`, `flags`, `multiplicadores`, `combate` e `desbloqueia`.

`efeitos` soma valores a `hp`, `escudo`, `ataque`, `honra`, `habitantes` e `gold`. Depois, `multiplicadores` aplica fatores e arredonda para baixo. Todos os atributos exceto honra têm mínimo zero. A geada causa dano direto; a mitigação é aplicada somente ao dano de batalha.

Requisitos aceitam `honra: "alta"`, `"baixa"` ou `"nao_baixa"`, limites como `hpMin`, `honraMax`, `ataqueMin`, `goldMin`, `rodadaMin` e `rodadaMax`, listas `flags` (da run), `flagsAusentes`, `flagsLegado` e `itens`. `flagsAusentes` impede repetir etapas já resolvidas. Eventos e opções usam o mesmo avaliador. Os dados oferecem de uma a três opções **visíveis**, com exceção autorizada do banquete, que permite quatro; o evento das caixas tem duas variantes mutuamente exclusivas para a terceira resposta. Um evento mandatório oferece uma opção.

Ao avançar, o sorteio avalia a rodada de destino, permitindo um evento já na sua rodada mínima. Os requisitos de honra da carta são avaliados no sorteio; as respostas são reavaliadas a cada alteração de honra. Usar os controles de teste numa carta já aberta não invalida seu salvamento; rodada, flags e demais requisitos continuam sendo validados ao carregar.

Um evento pode ter `pesos: [{ requisitos: { honra: "baixa" }, valor: 5 }]`; a primeira regra satisfeita substitui o peso base. Isso aumenta a incidência de desordem com honra baixa. O intervalo de repetição fica em `Jogo.config.memoriaEventos`; `run.eventosRecentes` guarda as últimas cartas resolvidas.

Eventos de comércio também aceitam `mercadorias`, com `id`, `texto`, `preco`, `aumentoPreco`, `efeitos` e `resultado` por produto. Seus requisitos são opcionais. Use uma opção normal para seguir sem comprar, garantindo uma saída mesmo sem gold. Os preços, efeitos e incrementos ficam no catálogo; o intervalo de renda e as faixas de população ficam em `Jogo.config.economia`, em `js/state.js`.

## Legado

`localStorage.run_atual` contém a run; `localStorage.legado` contém somente conteúdo liberado e objetivos concluídos. Apagar a run não apaga o legado.

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

No catálogo, `bloqueado: true` exige que o próprio ID esteja liberado no conjunto correspondente. `requerDesbloqueio: "id"` exige uma chave já liberada como evento, item ou flag de legado. A engine constrói ambas as pools a partir desses campos. O catálogo de itens está vazio; recompensas em atributos e gold já funcionam. Recompensas de itens, inventário e uso de itens completos ficam para uma próxima fase validada.

O legado não entrega inventário nem altera os atributos iniciais. Não há lista de objetivos secretos, avisos de conquista nem registro público dos desbloqueios nesta versão.

O encerramento salva primeiro uma run terminal recuperável, une as conquistas ao legado e só então apaga a run. Se a gravação do legado falhar, mantém a run terminal e oferece nova tentativa. A união não duplica IDs ao repetir uma tentativa. Leitura, gravação e remoção usam `try/catch`; saves incompatíveis ou corrompidos são rejeitados e o jogador recebe um aviso.

Se o armazenamento estiver bloqueado, também é possível começar outro herdeiro sem salvar. As conquistas de runs encerradas são mantidas em memória durante a sessão e incluídas numa futura gravação bem-sucedida. O aviso informa que fechar a página pode perder esses dados.

## Verificar

Com Node instalado, execute `node --test tests/engine.test.cjs tests/main.test.cjs tests/novos-eventos.test.cjs`. Não é necessário para jogar.

Teste também no navegador: iniciar → escolher → recarregar → carregar; confira que a escolha não é reaplicada. Melhore a espada na forja e compare a batalha antes e depois. Verifique que o escudo permanece igual. Jogue até uma derrota e inicie outro herdeiro. Para simular corrupção, altere uma chave no painel de armazenamento do navegador e recarregue; o jogo deve continuar utilizável.
