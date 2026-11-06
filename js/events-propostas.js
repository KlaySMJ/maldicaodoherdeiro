(function () {
  "use strict";
  const Jogo = window.Jogo;

  const artes = {
    vila: ["assets/vila.webp", "Casas e torre de pedra cercadas pelo caminho da vila"],
    caixas: ["assets/caixas.webp", "Caixotes, pão e um saco junto ao arco de pedra"],
    forja: ["assets/forja.webp", "Espada, bigorna e martelo na oficina do ferreiro"],
    ponte: ["assets/ponte.webp", "Ponte de tábuas sobre um trecho estreito do rio"],
    poco: ["assets/poco.webp", "Poço de pedra com um balde preso por uma corda"],
    ervas: ["assets/ervas.webp", "Almofariz, frascos e ramos de ervas medicinais"],
    construcao: [
      "assets/eventos-sistemas/construcoes.webp",
      "Forno e ferramentas diante de uma obra de pedra",
    ],
    tumulo: ["assets/eventos-sistemas/tumulo.webp", "Monólito antigo erguido sobre a terra"],
    outono: ["assets/eventos-sistemas/outono.webp", "Colheita guardada sob folhas de outono"],
    mapa: ["assets/eventos-especificos/mapa-na-pedra.webp", "Mapa e marcas de rota gravados numa pedra"],
    documento: [
      "assets/eventos-especificos/testamento-selado.webp",
      "Documento antigo fechado com um selo de cera",
    ],
    frutos: [
      "assets/eventos-especificos/frutos-negros-na-soleira.webp",
      "Cesto de frutos escuros junto à soleira",
    ],
    sino: ["assets/sino-antigo.webp", "Sino antigo suspenso sobre uma pedra"],
    ouro: ["assets/sussurro-do-ouro.webp", "Moeda antiga pousada sobre a tampa de um cofre"],
    janela: ["assets/mao-na-janela.webp", "Janela escura de uma casa vazia"],
    vela: ["assets/eventos-especificos/vela-que-nao-apaga.webp", "Vela acesa perto da soleira de uma casa"],
    lente: [
      "assets/eventos-especificos/olhos-de-mercurio.webp",
      "Lente metálica sobre as páginas de um livro de contas",
    ],
    olho: [
      "assets/eventos-especificos/olho-dos-mil-nomes.webp",
      "Olho dourado preso a um fragmento de reboco rachado",
    ],
    bau: ["assets/bau-estrada.webp", "Baú antigo fechado entre montes de terra"],
    caravana: [
      "assets/eventos-especificos/caravana-na-ponte.webp",
      "Carroça carregada atravessa uma ponte de pedra",
    ],
    fiandeiras: ["assets/fiandeiras.webp", "Três fiandeiras trabalham juntas num fio"],
    refeicao: [
      "assets/eventos-especificos/uma-noite-sem-fome.webp",
      "Família divide uma refeição ao redor de uma mesa",
    ],
    arvoreCaida: ["assets/eventos-especificos/arvore-sobre-estrada.webp", "Árvore caída atravessa a estrada"],
    salgueiro: [
      "assets/eventos-especificos/raizes-sob-parede.webp",
      "Raízes de um salgueiro deslocam uma parede de pedra",
    ],
    rodaDagua: ["assets/eventos-especificos/roda-dagua.webp", "Eixo rachado de uma roda d'água"],
    retrato: [
      "assets/eventos-especificos/retrato-sem-dono.webp",
      "Retrato antigo parcialmente coberto por um pano",
    ],
    lanterna: [
      "assets/eventos-especificos/lanterna-na-colina.webp",
      "Pequena lanterna pendurada num poste sobre a colina",
    ],
    panos: [
      "assets/eventos-especificos/codigo-dos-panos.webp",
      "Três faixas de pano marcadas com sinais repetidos",
    ],
    barril: [
      "assets/eventos-especificos/desenho-no-barril.webp",
      "Desenho de uma cisterna no fundo de um barril",
    ],
    tear: [
      "assets/eventos-especificos/tear-desmontado.webp",
      "Peças de um tear desmontado ao lado de tecido",
    ],
    chaves: ["assets/eventos-especificos/chaves-sala-comum.webp", "Três chaves antigas presas a uma argola"],
  };

  function opcao(id, texto, resultado, efeitos = {}, extras = {}) {
    return { id, texto, resultado, efeitos, ...extras };
  }

  function carta(id, titulo, texto, informacoes, arte, opcoes, extras = {}) {
    return {
      id,
      titulo,
      tipo: "encontro",
      peso: 1.8,
      oncePerRun: true,
      imagem: arte[0],
      imagemAlt: arte[1],
      texto,
      informacoes,
      opcoes,
      ...extras,
    };
  }

  const comuns = [
    carta(
      "arvore_sobre_estrada",
      "A árvore sobre a estrada",
      "Uma árvore tombou na curva durante a madrugada. Uma carroça já está presa entre o tronco e a vala; o cocheiro espera ajuda antes que a chuva chegue.",
      "A madeira serve à vila, aos carroceiros ou pode ficar onde caiu.",
      artes.arvoreCaida,
      [
        opcao(
          "serrar_madeira",
          "Cortar o tronco e repartir a madeira.",
          "Os lenhadores deixam a estrada livre e levam as toras ao depósito.",
          { habitantes: -1, gold: -1, honra: 2 },
        ),
        opcao(
          "vender_toras",
          "Vender a madeira ao primeiro comprador.",
          "A carroça volta a andar. O comprador leva o tronco inteiro para a estrada do sul.",
          { gold: 5, honra: -2 },
        ),
        opcao(
          "desviar_carrocas",
          "Marcar um desvio até a árvore secar.",
          "Os carroceiros seguem por uma trilha mais longa, sem esperar pela serra.",
          { gold: -1, honra: 1 },
        ),
      ],
    ),
    carta(
      "telhas_antes_da_chuva",
      "Telhas antes da chuva",
      "Um lote de telhas chega ao portão na mesma manhã em que as nuvens fecham o vale. O depósito não tem espaço para guardar tudo.",
      "Cobrir os telhados mais frágeis, cobrar pela distribuição ou vender parte do lote define quem atravessa a chuva em segurança.",
      artes.construcao,
      [
        opcao(
          "cobrir_telhas",
          "Consertar os telhados mais frágeis · 3 Gold.",
          "As casas recebem telhas novas antes da chuva. O barro escorre pelas calhas, não pelas camas.",
          { gold: -3, honra: 3, hp: 4 },
        ),
        opcao(
          "cobrar_telhas",
          "Cobrar pelo uso de cada telha.",
          "A conta enche o cofre, mas algumas casas deixam a fila sem material.",
          { gold: 5, honra: -3, habitantes: -1 },
        ),
        opcao(
          "guardar_telhas",
          "Guardar metade para o salão comunal.",
          "O lote fica sob lona. As famílias remendam o que podem com tábuas e palha.",
          { gold: 2, honra: -1 },
        ),
      ],
    ),
    carta(
      "medida_do_trigo",
      "A medida do trigo",
      "A farinha acaba antes do esperado, embora o livro do celeiro registre sacos suficientes. Na banca, o medidor do comerciante parece menor que o usado pela vila.",
      "Rever a medida pode recuperar o que falta ou transformar uma suspeita em disputa pública.",
      artes.caixas,
      [
        opcao(
          "conferir_trigo",
          "Conferir as medidas diante dos compradores · 1 Gold.",
          "A diferença aparece quando os grãos passam para o recipiente da vila. O comerciante devolve o excedente.",
          { gold: -1, habitantes: 2, honra: 3 },
        ),
        opcao(
          "aceitar_medida_trigo",
          "Aceitar a medida e fechar a banca.",
          "O comerciante parte com os sacos. A fila termina, mas duas casas ficam sem a porção esperada.",
          { gold: 4, habitantes: -2, honra: -3 },
        ),
        opcao(
          "taxar_medida_trigo",
          "Cobrar uma taxa de fiscalização.",
          "A taxa entra no cofre. O medidor permanece na banca, sem nova conferência.",
          { gold: 3, honra: -1 },
        ),
      ],
    ),
    carta(
      "parede_de_pedra",
      "A parede de pedra",
      "A pedreira antiga ainda guarda blocos sob a encosta. Um veio aquece a mão quando o pedreiro se aproxima; acima dele, uma rachadura atravessa a parede.",
      "Retirar os blocos soltos, escorar a encosta ou abrir o veio aquecido trazem riscos diferentes.",
      artes.construcao,
      [
        opcao(
          "pedras_soltas",
          "Retirar apenas as pedras que já cederam.",
          "O pedreiro enche duas carroças sem tocar na rachadura. A obra da praça pode continuar.",
          { gold: 3, honra: 1 },
        ),
        opcao(
          "veio_aquecido",
          "Quebrar o veio aquecido e guardar a pedra.",
          "A pedra se abre num brilho verde e quente. Dentro dela, um amuleto de jaspe conserva o calor.",
          { hp: -3, honra: 1 },
          { itens: ["amuleto_de_jaspe"] },
        ),
        opcao(
          "escorar_parede",
          "Escorar a encosta antes de qualquer extração · 3 Gold.",
          "As vigas seguram a parede. Ninguém trabalha ali até que a pedra possa ser examinada com cuidado.",
          { gold: -3, escudo: 1, honra: 2 },
        ),
      ],
    ),
    carta(
      "carroca_de_ferramentas",
      "A carroça de ferramentas",
      "Um vendedor oferece ferramentas usadas a preço baixo. Algumas ainda têm a marca da oficina de onde vieram; outras perderam o cabo ou o fio.",
      "Comprar o lote pode ajudar os trabalhadores, mas nem toda peça vale o preço pedido.",
      artes.forja,
      [
        opcao(
          "comprar_ferramentas",
          "Comprar o lote e reservar as luvas de trabalho · 4 Gold.",
          "As ferramentas seguem para as obras. Um par de luvas reforçadas fica com a guarda da oficina.",
          { gold: -4, honra: 1 },
          { itens: ["luvas_de_trabalho"] },
        ),
        opcao(
          "examinar_ferramentas",
          "Examinar cada peça antes de negociar.",
          "Duas ferramentas ainda servem. O vendedor aceita um preço menor e leva o restante.",
          { gold: -1, honra: 2, escudo: 1 },
        ),
        opcao(
          "recusar_ferramentas",
          "Recusar a oferta e avisar os artesãos.",
          "O vendedor parte sem abrir a carroça. A oficina confere seus próprios estoques.",
          { honra: 1 },
        ),
      ],
    ),
    carta(
      "canal_assoreado",
      "O canal assoreado",
      "O canal perde profundidade a cada cheia. A água ainda alcança os campos, mas os sulcos mais distantes já secaram antes do meio-dia.",
      "Um mutirão, uma cobrança aos proprietários ou uma mudança no plantio decide o próximo uso da água.",
      artes.poco,
      [
        opcao(
          "limpar_canal",
          "Organizar um mutirão para retirar a lama.",
          "A vila limpa o trecho mais raso. A água volta a correr para os campos de baixo.",
          { habitantes: -1, honra: 2, gold: 1 },
        ),
        opcao(
          "cobrar_canal",
          "Cobrar dos proprietários beneficiados.",
          "O cofre recebe a taxa. Os lavradores abrem sozinhos uma vala menor.",
          { gold: 4, honra: -2 },
        ),
        opcao(
          "mudar_cultivo_canal",
          "Mudar o plantio para perto da nascente.",
          "As sementes mais resistentes ocupam o terreno alto. A parte distante fica em pousio.",
          { habitantes: 1, honra: 1, gold: -2 },
        ),
      ],
    ),
    carta(
      "salgueiro_marcado",
      "O salgueiro marcado",
      "As raízes de um salgueiro antigo levantaram as pedras da passagem. Pastores dizem que, sem a árvore, ninguém encontra o caminho de volta depois da neblina.",
      "A árvore pode ficar, ser podada ou perder a passagem que divide com a trilha.",
      artes.salgueiro,
      [
        opcao(
          "proteger_salgueiro",
          "Proteger as raízes e refazer o caminho ao lado.",
          "Os pedreiros contornam a árvore. Os pastores mantêm o salgueiro como marco da rota.",
          { gold: -2, honra: 3 },
        ),
        opcao(
          "podar_salgueiro",
          "Podar as raízes que avançaram sobre as pedras.",
          "O caminho abre espaço para uma carroça. O salgueiro permanece, mais estreito junto à trilha.",
          { gold: 2, honra: 1 },
        ),
        opcao(
          "abrir_rota_salgueiro",
          "Abrir outra passagem pelo campo baixo.",
          "Os pastores mudam o trajeto, e o terreno da rota antiga volta a descansar.",
          { habitantes: -1, honra: -1, gold: 2 },
        ),
      ],
    ),
    carta(
      "caldeira_emprestada",
      "A caldeira emprestada",
      "Uma comunidade vizinha pede a caldeira usada para tingir tecidos. A oficina da vila pretende preparar uma fornada de remédios na mesma semana.",
      "O empréstimo pode fortalecer o acordo entre as comunidades ou atrasar o trabalho local.",
      artes.forja,
      [
        opcao(
          "emprestar_caldeira",
          "Emprestar a caldeira com uma peça como garantia.",
          "A caldeira volta limpa depois do tingimento. A outra comunidade deixa lã como agradecimento.",
          { habitantes: 1, honra: 2 },
        ),
        opcao(
          "alugar_caldeira",
          "Cobrar pelo uso e pela lenha.",
          "A taxa paga a lenha da oficina. Os vizinhos procuram outra caldeira para o próximo lote.",
          { gold: 4, honra: -1 },
        ),
        opcao(
          "reservar_caldeira",
          "Reservar a caldeira para os remédios da vila.",
          "A ervateira prepara as doses no prazo. Os visitantes partem sem discutir a decisão.",
          { hp: 6, honra: 1 },
        ),
      ],
    ),
    carta(
      "roda_perde_eixo",
      "A roda que perde o eixo",
      "A roda d'água para no meio da moagem. O eixo gasto ainda gira à mão, mas cada volta abre uma fenda maior na madeira.",
      "Um eixo novo custa Gold; um reparo improvisado consome tempo e pode parar o moinho de vez.",
      artes.rodaDagua,
      [
        opcao(
          "comprar_eixo",
          "Pedir um eixo novo ao carpinteiro · 4 Gold.",
          "A roda volta a girar sem ranger. O moinho recebe sacos até a próxima cheia.",
          { gold: -4, honra: 2 },
        ),
        opcao(
          "improvisar_eixo",
          "Reforçar o eixo com uma cinta de ferro.",
          "A cinta segura por enquanto. O ferreiro cobra a peça e pede que ninguém sobrecarregue a roda.",
          { gold: -2, escudo: 1, honra: 1 },
        ),
        opcao(
          "parar_moagem",
          "Suspender a moagem até a próxima estação.",
          "Os sacos seguem para outro moinho. A vila economiza o conserto, mas perde parte do serviço.",
          { gold: 2, habitantes: -1, honra: -1 },
        ),
      ],
    ),
    carta(
      "ponte_de_corda",
      "A ponte de corda",
      "A travessia encurta o caminho entre os campos, mas uma mula cedeu sobre as tábuas na semana passada. Os nós já estão desfiando.",
      "Reforçar a passagem, limitar o peso ou desmontá-la muda quem consegue atravessar.",
      artes.ponte,
      [
        opcao(
          "reforcar_corda",
          "Trocar as cordas principais · 3 Gold.",
          "Os trabalhadores apertam os nós e substituem a amarra mais gasta. A passagem volta a receber carroças leves.",
          { gold: -3, honra: 2 },
        ),
        opcao(
          "limitar_peso",
          "Permitir apenas pedestres e animais pequenos.",
          "Uma placa anuncia o limite. Os pastores atravessam em grupos menores.",
          { honra: 1, habitantes: -1 },
        ),
        opcao(
          "desmontar_corda",
          "Desmontar a travessia antes de outro acidente.",
          "As tábuas retornam ao depósito. A rota fica mais longa, mas ninguém depende de uma corda rompida.",
          { gold: -1, honra: 2 },
        ),
      ],
    ),
    carta(
      "velas_de_sebo",
      "As velas de sebo",
      "O cesto de velas está quase vazio antes da noite em que os escribas precisam terminar os registros. A guarda também pediu luz para a ronda.",
      "O estoque pode ser dividido, encomendado ou reservado para quem patrulha o muro.",
      artes.vela,
      [
        opcao(
          "dividir_velas",
          "Repartir as velas entre os escribas e a guarda.",
          "Cada sala recebe luz por algumas horas. Os registros e a ronda terminam antes do amanhecer.",
          { gold: -2, honra: 2 },
        ),
        opcao(
          "encomendar_velas",
          "Encomendar outro lote ao fabricante · 3 Gold.",
          "O fabricante promete entregar antes da próxima lua. A vila paga pela cera adiantada.",
          { gold: -3, escudo: 1, honra: 1 },
        ),
        opcao(
          "reservar_velas",
          "Guardar a cera para a guarda.",
          "Os vigias mantêm a ronda. Os escribas deixam os nomes para outra noite.",
          { honra: -1, gold: 1 },
        ),
      ],
    ),
    carta(
      "deposito_de_carvao",
      "O depósito de carvão",
      "Um comerciante oferece carvão escuro que ficou anos sob lona. O ferreiro quebra uma pedra e encontra pó solto entre as partes.",
      "Testar o combustível custa uma amostra; comprar o lote inteiro pode sair caro se a brasa não durar.",
      artes.forja,
      [
        opcao(
          "testar_carvao",
          "Pagar por uma queima de prova · 1 Gold.",
          "A brasa segura o calor até a manhã. O ferreiro compra o lote pelo preço combinado.",
          { gold: 3, honra: 1 },
        ),
        opcao(
          "comprar_carvao",
          "Comprar o lote sem testar.",
          "Parte do carvão vira pó antes de alcançar a forja. O restante mantém o trabalho por dois dias.",
          { gold: -3, honra: -1, hp: -2 },
        ),
        opcao(
          "trocar_carvao",
          "Trocar por madeira seca da vila.",
          "O comerciante aceita a troca e leva a madeira. A forja usa carvão apenas nas peças mais difíceis.",
          { gold: 1, honra: 1 },
        ),
      ],
    ),
    carta(
      "cerca_de_espinhos",
      "A cerca de espinhos",
      "A cerca viva protege as hortas, mas os galhos fecharam a trilha usada por quem leva água até o moinho. O dono pede que ninguém corte a cerca sem avisá-lo.",
      "Podar, desviar ou compensar o trabalho deixa a passagem e a horta em condições diferentes.",
      artes.vila,
      [
        opcao(
          "podar_espinhos",
          "Podar os galhos que invadiram a trilha.",
          "Os espinhos saem do caminho e viram lenha para o forno. A cerca continua protegendo as hortas.",
          { habitantes: -1, honra: 2 },
        ),
        opcao(
          "desviar_espinhos",
          "Abrir uma passagem mais larga pelo campo.",
          "O moinho recebe água sem cortar a cerca. O novo trajeto atravessa uma faixa de cultivo.",
          { gold: -1, honra: 1, habitantes: -1 },
        ),
        opcao(
          "compensar_cerca",
          "Pagar pelo trabalho de quem mantém a cerca · 2 Gold.",
          "O proprietário abre uma passagem e conserva os espinhos no restante do terreno.",
          { gold: -2, honra: 2 },
        ),
      ],
    ),
    carta(
      "lastro_de_cobre",
      "O lastro de cobre",
      "Um carregamento de peças chega misturado a parafusos quebrados e minério sem marca. O transportador quer partir antes de conferir o peso.",
      "Separar o cobre leva tempo; devolver o lote evita que a vila pague por sucata.",
      artes.forja,
      [
        opcao(
          "separar_cobre",
          "Separar o cobre antes de pesar o lote.",
          "O ferreiro encontra metal suficiente para duas dobradiças. A sucata volta ao transportador.",
          { gold: 3, honra: 2 },
        ),
        opcao(
          "vender_cobre",
          "Vender o lote inteiro no mercado.",
          "O comprador paga pelas peças e pela sucata. O transportador não volta a negociar na vila.",
          { gold: 6, honra: -2 },
        ),
        opcao(
          "devolver_cobre",
          "Devolver a carga e pedir uma conta corrigida.",
          "O transportador leva o lote de volta. O ferreiro anota o peso correto para a próxima entrega.",
          { gold: -1, honra: 2 },
        ),
      ],
    ),
    carta(
      "lugar_a_mesa",
      "O lugar à mesa",
      "Uma família recém-chegada aparece quando a refeição comunal já está servida. Há espaço para mais uma cadeira, mas os sacos da cozinha foram contados para quem já mora na vila.",
      "Abrir a mesa custa provisões; pedir contribuição ou fechar a sala muda a primeira noite da família.",
      artes.refeicao,
      [
        opcao(
          "abrir_lugar",
          "Puxar outra cadeira e dividir a sopa.",
          "A porção de cada pessoa fica menor. Ninguém come sozinho no chão da cozinha.",
          { habitantes: 2, honra: 3, gold: -1 },
        ),
        opcao(
          "pedir_contribuicao",
          "Pedir à família que contribua com a próxima colheita.",
          "A família aceita o acordo e passa a noite no salão. A cozinha guarda parte do estoque.",
          { habitantes: 1, gold: 1, honra: 1 },
        ),
        opcao(
          "fechar_mesa",
          "Manter a contagem e fechar a sala.",
          "A família procura abrigo na estrada. A comida dura mais uma noite para os moradores atuais.",
          { gold: 2, habitantes: -1, honra: -2 },
        ),
      ],
    ),
    carta(
      "troca_de_turnos",
      "A troca de turnos",
      "Os vigias pedem uma escala mais leve depois de três noites na muralha. Uma troca de turnos deixaria o portão norte sem guarda por parte da madrugada.",
      "Reorganizar as rondas custa Gold ou horas de descanso; manter a escala força os vigias a escolher quem fica.",
      artes.construcao,
      [
        opcao(
          "reorganizar_turnos",
          "Pagar um substituto para cobrir a madrugada · 3 Gold.",
          "O substituto assume o trecho norte. Os vigias voltam a dormir antes do sino da manhã.",
          { gold: -3, escudo: 1, honra: 2 },
        ),
        opcao(
          "rodizio_turnos",
          "Criar um rodízio curto entre as famílias.",
          "Cada casa cobre uma parte da noite. O portão fica vigiado sem prolongar o turno de uma só pessoa.",
          { habitantes: -1, honra: 2 },
        ),
        opcao(
          "manter_turnos",
          "Manter a escala até a feira terminar.",
          "A muralha continua coberta. Os vigias aceitam, mas entregam as chaves ao próximo turno sem falar.",
          { gold: 2, honra: -2 },
        ),
      ],
    ),
    carta(
      "chaves_sala_comum",
      "As chaves da sala comum",
      "Duas cópias da chave do salão desapareceram. Ali ficam ferramentas, sacos de farinha e os registros que o escrivão usa durante a feira.",
      "Um rodízio, uma pessoa responsável ou um acesso restrito define quem responde pelo espaço.",
      artes.chaves,
      [
        opcao(
          "rodizio_chaves",
          "Entregar uma chave por turno e registrar a troca.",
          "O livro ganha uma linha a cada entrega. A guarda devolve a cópia que estava sob um banco.",
          { habitantes: 1, honra: 2 },
        ),
        opcao(
          "responsavel_chaves",
          "Nomear uma pessoa para guardar as chaves.",
          "A pessoa escolhida recebe um pequeno pagamento e passa a abrir o salão quando pedirem.",
          { gold: -2, escudo: 1, honra: 1 },
        ),
        opcao(
          "restringir_sala",
          "Trancar o salão fora das horas de trabalho.",
          "Os objetos ficam protegidos, mas os grupos deixam de usar o espaço depois do anoitecer.",
          { gold: 3, habitantes: -1, honra: -1 },
        ),
      ],
    ),
    carta(
      "patio_dividido",
      "O pátio dividido",
      "Artesãos deixam tábuas secando no pátio onde os lavradores descarregam cestos. Um grupo chegou antes do outro e ninguém quer mover sua carga.",
      "Dividir os horários, cobrar pelo espaço ou escolher um uso permanente resolve a disputa por enquanto.",
      artes.vila,
      [
        opcao(
          "horarios_patio",
          "Marcar períodos para cada grupo.",
          "Os cestos saem antes do pôr do sol. As tábuas ficam cobertas e secam mais devagar.",
          { honra: 2, habitantes: 1 },
        ),
        opcao(
          "taxar_patio",
          "Cobrar pelo espaço usado durante a feira.",
          "As bancas pagam a taxa. Os lavradores descarregam fora do muro.",
          { gold: 4, honra: -2 },
        ),
        opcao(
          "uso_patio",
          "Reservar o pátio para a oficina.",
          "As tábuas ganham lugar fixo. Os cestos passam a ser descarregados junto ao portão.",
          { escudo: 1, honra: -1 },
        ),
      ],
    ),
    carta(
      "retrato_sem_dono",
      "O retrato sem dono",
      "Um retrato aparece na sala comunal, coberto por um pano que ninguém lembra de ter pendurado. A moldura traz o nome de uma vila que já não aparece nos mapas.",
      "Guardar a pintura, leiloá-la ou pedir ajuda para localizar a família muda o destino do objeto.",
      artes.retrato,
      [
        opcao(
          "guardar_retrato",
          "Guardar o retrato junto aos registros antigos.",
          "O escrivão anota a vila da moldura. A pintura fica protegida da umidade do salão.",
          { gold: -1, honra: 2 },
        ),
        opcao(
          "leiloar_retrato",
          "Leiloar a moldura na próxima feira.",
          "Um colecionador paga por ela e leva a pintura enrolada sob o braço.",
          { gold: 5, honra: -1 },
        ),
        opcao(
          "procurar_familia_retrato",
          "Pedir aos viajantes que procurem a família.",
          "Um mercador reconhece o brasão e promete levar a notícia pela estrada do leste.",
          { gold: -1, habitantes: 1, honra: 2 },
        ),
      ],
    ),
    carta(
      "cao_escolheu_porta",
      "O cão que escolheu a porta",
      "Um cão sem coleira dorme diante da mesma casa há quatro noites. A família diz que nunca o alimentou; ainda assim, ele não acompanha ninguém que tente levá-lo.",
      "Procurar o antigo dono, deixar que a família o acolha ou confiar a ronda ao cão dá outro lugar à sua vigília.",
      artes.vila,
      [
        opcao(
          "buscar_dono_cao",
          "Procurar o dono entre as carroças da feira.",
          "Ninguém reclama o cão. O feirante guarda o aviso até a próxima passagem de viajantes.",
          { gold: -1, honra: 1 },
        ),
        opcao(
          "acolher_cao",
          "Deixar que a família o acolha.",
          "O cão entra na casa antes de escurecer. Na manhã seguinte, acompanha a família até a praça.",
          { habitantes: 2, honra: 2 },
        ),
        opcao(
          "cao_de_guarda",
          "Levar o cão para a ronda do portão.",
          "O cão passa a dormir perto da guarda e alerta os vigias quando alguém se aproxima pela estrada.",
          { escudo: 1, honra: 1 },
          { itens: ["cao_companheiro"] },
        ),
      ],
    ),
    carta(
      "carta_recomendacao",
      "A carta de recomendação",
      "Uma jovem aprendiz pede uma carta para seguir a um ateliê distante. A oficina local também precisa de alguém que saiba remendar tecidos antes do inverno.",
      "Recomendar a viagem, oferecer formação na vila ou pedir que ela espere deixa uma vaga em lugares diferentes.",
      artes.documento,
      [
        opcao(
          "recomendar_aprendiz",
          "Assinar a carta para o ateliê distante.",
          "A aprendiz leva a carta no primeiro carro. O mestre promete enviar notícias quando chegar.",
          { habitantes: -1, honra: 3 },
        ),
        opcao(
          "formar_aprendiz",
          "Pagar por ferramentas e formação local · 2 Gold.",
          "A oficina recebe uma mesa de costura. A aprendiz começa a ensinar duas vizinhas.",
          { gold: -2, habitantes: 2, honra: 2 },
        ),
        opcao(
          "esperar_aprendiz",
          "Pedir que ela espere mais uma estação.",
          "A jovem volta à oficina, mas deixa a carta sobre a mesa para decidir depois.",
          { gold: 1, honra: -1 },
        ),
      ],
    ),
    carta(
      "heranca_ferramentas",
      "A herança das ferramentas",
      "Um artesão morre sem deixar instruções sobre as ferramentas da oficina. Os parentes querem guardá-las; os aprendizes afirmam que ainda há trabalho pela metade.",
      "Fazer um inventário, entregar as peças à família ou vender tudo encerra a disputa de modos diferentes.",
      artes.forja,
      [
        opcao(
          "inventariar_ferramentas",
          "Registrar cada ferramenta e devolver as emprestadas.",
          "O inventário separa as peças da família das que pertencem à oficina. Os aprendizes terminam a encomenda.",
          { gold: -1, honra: 3, escudo: 1 },
        ),
        opcao(
          "entregar_familia_ferramentas",
          "Entregar o conjunto à família.",
          "Os parentes fecham a oficina e carregam as ferramentas para casa.",
          { habitantes: -1, honra: 1 },
        ),
        opcao(
          "vender_ferramentas",
          "Leiloar as ferramentas para pagar as dívidas.",
          "O ferreiro vizinho compra o lote. O cofre recebe o valor antes do fim da feira.",
          { gold: 6, honra: -3 },
        ),
      ],
    ),
    carta(
      "copia_do_registro",
      "A cópia do registro",
      "A umidade apagou parte dos nomes no livro de moradores. Um escrivão oferece copiar as páginas restantes antes que as folhas se desfaçam.",
      "Uma cópia completa custa mais; registrar apenas os nomes legíveis protege parte da história.",
      artes.documento,
      [
        opcao(
          "pagar_copia",
          "Pagar pela cópia inteira · 3 Gold.",
          "O escrivão termina antes da próxima chuva. O livro novo fica guardado numa caixa seca.",
          { gold: -3, honra: 2 },
        ),
        opcao(
          "copiar_nomes",
          "Copiar apenas os nomes ainda legíveis · 1 Gold.",
          "As páginas perdidas ficam em branco. As famílias reconhecem ao menos os nomes que restaram.",
          { gold: -1, honra: 2, habitantes: 1 },
        ),
        opcao(
          "nao_copiar",
          "Deixar o registro como está.",
          "O livro volta à prateleira. O escrivão cobre a caixa com um pano encerado.",
          { gold: 2, honra: -1 },
        ),
      ],
    ),
    carta(
      "bolsa_de_botoes",
      "A bolsa de botões",
      "Uma bolsa de botões raros cai de uma carroça antes da ponte. Alguns têm marcas de uma oficina distante; os demais foram talhados à mão.",
      "Encontrar o dono pode custar a venda; guardar as peças ajuda um alfaiate local.",
      artes.caixas,
      [
        opcao(
          "procurar_dono_botoes",
          "Perguntar aos carroceiros antes de vender.",
          "O dono reconhece a bolsa e paga a busca com um botão de osso entalhado.",
          { gold: 1, honra: 3 },
        ),
        opcao(
          "vender_botoes",
          "Vender as peças na feira.",
          "Uma banca de tecidos compra o lote. O carroceiro segue viagem sem saber onde a bolsa caiu.",
          { gold: 4, honra: -2 },
        ),
        opcao(
          "guardar_botoes",
          "Entregar as peças ao alfaiate da vila.",
          "O alfaiate separa os botões por tamanho e reserva os melhores para as roupas de inverno.",
          { gold: -1, escudo: 1, honra: 1 },
        ),
      ],
    ),
    carta(
      "carregamento_de_vidro",
      "O carregamento de vidro",
      "Um mercador oferece placas de vidro que sobreviveram à viagem. A enfermaria tem janelas abertas; a feira pagaria bem pelas peças coloridas.",
      "Comprar o lote, negociar uma troca ou deixá-lo seguir preserva Gold para outros usos.",
      artes.construcao,
      [
        opcao(
          "comprar_vidro",
          "Comprar placas para a enfermaria · 4 Gold.",
          "As janelas fecham antes da próxima chuva. A ervateira guarda os cacos que sobraram.",
          { gold: -4, hp: 8, honra: 2 },
        ),
        opcao(
          "trocar_vidro",
          "Trocar vidro por tábuas e reparos.",
          "O mercador escolhe peças de madeira e deixa placas menores para as janelas do salão.",
          { gold: -1, escudo: 1, honra: 1 },
        ),
        opcao(
          "revender_vidro",
          "Revender as placas na feira.",
          "Os compradores pagam pelas cores raras. A enfermaria mantém as janelas cobertas por tecido.",
          { gold: 5, honra: -2 },
        ),
      ],
    ),
    carta(
      "farinha_com_limalha",
      "Farinha com limalha",
      "Uma família encontra pó de ferro no fundo do saco de farinha. O moleiro jura que a pedra de moer está inteira, mas não quer abrir o moinho diante da fila.",
      "Conferir o lote, peneirar a farinha ou vendê-la depressa muda o que chega às mesas.",
      artes.caixas,
      [
        opcao(
          "conferir_limalha",
          "Fechar a venda e examinar o moinho.",
          "Uma peça solta se desfaz entre as mós. O moleiro troca a farinha contaminada por sacos novos.",
          { habitantes: 2, honra: 3, gold: -1 },
        ),
        opcao(
          "peneirar_limalha",
          "Peneirar o lote antes de devolver as porções.",
          "Parte da farinha se perde na peneira. O restante pode ser usado depois de uma segunda moagem.",
          { hp: 4, gold: -2, honra: 1 },
        ),
        opcao(
          "vender_limalha",
          "Vender o lote a quem não perguntar pela origem.",
          "Os sacos saem pela porta dos fundos. O dinheiro entra no cofre antes que a fila descubra.",
          { gold: 5, habitantes: -2, honra: -4 },
        ),
      ],
    ),
    carta(
      "pedra_de_distancias",
      "A pedra de medir distâncias",
      "Uma pedra junto à estrada traz marcas regulares entre dois povoados. O mapa do escrivão indica que as medidas não seguem nenhum caminho conhecido.",
      "Decifrar os sinais pode abrir uma rota; mover a pedra apaga o único marco que os viajantes reconhecem.",
      artes.mapa,
      [
        opcao(
          "decifrar_distancias",
          "Pagar ao escrivão para comparar as marcas · 2 Gold.",
          "As medidas apontam para uma passagem estreita entre as colinas. O mapa ganha uma rota mais curta.",
          { gold: -2, honra: 2 },
        ),
        opcao(
          "marco_distancias",
          "Deixar a pedra como marco da estrada.",
          "O caminho permanece sem nome, mas os viajantes passam a usar a pedra para combinar encontros.",
          { habitantes: 1, honra: 2 },
        ),
        opcao(
          "remover_distancias",
          "Retirar a pedra para abrir espaço à carroça.",
          "A passagem fica livre. As marcas se perdem quando o pedreiro quebra a base.",
          { gold: 3, honra: -2 },
        ),
      ],
    ),
    carta(
      "remessa_trocada",
      "A remessa trocada",
      "Uma carroça descarrega lã onde deveriam estar os sacos de grão. O motorista diz que recebeu outro selo no último posto e quer resolver a troca antes de partir.",
      "Devolver a carga, negociar com o dono ou procurar o destinatário dos grãos muda o prazo da entrega.",
      artes.caixas,
      [
        opcao(
          "devolver_remessa",
          "Mandar a lã de volta com o mesmo motorista.",
          "A carroça retorna ao posto. O selo errado fica registrado no livro da estrada.",
          { gold: -1, honra: 2 },
        ),
        opcao(
          "trocar_remessa",
          "Negociar parte da lã pelos sacos de grão.",
          "O dono da carga aceita a troca. A vila recebe menos farinha, mas não espera por outra carroça.",
          { habitantes: 1, gold: -2, honra: 1 },
        ),
        opcao(
          "reter_remessa",
          "Reter a lã até que alguém traga os grãos.",
          "A carga ocupa o depósito. O motorista parte sem pagamento e promete voltar com o selo correto.",
          { gold: 2, honra: -1 },
        ),
      ],
    ),
    carta(
      "cadernos_agrimensor",
      "Os cadernos do agrimensor",
      "Um agrimensor deixa três cadernos no salão antes de seguir a estrada. As anotações indicam quais terrenos alagam primeiro e onde a pedra aparece perto da superfície.",
      "Comprar a informação, confirmar os limites com os moradores ou devolver os cadernos afeta as próximas obras.",
      artes.mapa,
      [
        opcao(
          "comprar_cadernos",
          "Pagar pelos mapas dos terrenos · 3 Gold.",
          "O agrimensor deixa as cópias e segue viagem. Os pedreiros ganham medidas para a próxima obra.",
          { gold: -3, escudo: 1, honra: 2 },
        ),
        opcao(
          "consultar_moradores",
          "Comparar as anotações com quem trabalha nos campos.",
          "Os moradores corrigem duas marcas. O agrimensor recebe uma lista de limites que não conhecia.",
          { habitantes: 1, honra: 2 },
        ),
        opcao(
          "devolver_cadernos",
          "Devolver tudo antes que a tinta se apague.",
          "O agrimensor guarda os cadernos e promete enviar uma cópia quando terminar o levantamento.",
          { gold: 1, honra: 1 },
        ),
      ],
    ),
    carta(
      "mercado_ferramentas_quebradas",
      "O mercado de ferramentas quebradas",
      "Uma banca vende ferramentas com dentes partidos, cabos rachados e ferrugem nos encaixes. O vendedor garante que cada peça ainda tem algum uso.",
      "Comprar o lote, testar uma ferramenta ou fechar a banca decide se a sucata volta à oficina.",
      artes.forja,
      [
        opcao(
          "comprar_sucata",
          "Comprar as peças que podem ser consertadas · 3 Gold.",
          "O ferreiro recupera uma tenaz e um martelo. O restante volta para o vendedor como sucata.",
          { gold: -3, ataque: 1, honra: 1 },
        ),
        opcao(
          "testar_ferramentas",
          "Testar uma ferramenta antes de pagar.",
          "A peça aguenta o trabalho e o vendedor reduz o preço do lote.",
          { gold: -1, escudo: 1, honra: 1 },
        ),
        opcao(
          "fechar_banca",
          "Mandar a guarda retirar a banca.",
          "As ferramentas voltam para a carroça. A praça fica livre antes do início da feira.",
          { gold: 2, honra: -1 },
        ),
      ],
    ),
    carta(
      "caixa_de_amostras",
      "A caixa de amostras",
      "Um boticário deixa uma caixa com frascos sem rótulo. Pede que a ervateira anote qualquer reação, mas não explica de onde vieram as misturas.",
      "Abrir uma amostra, cobrar pelo registro ou devolver a caixa fechada evita que o conteúdo circule sem controle.",
      artes.ervas,
      [
        opcao(
          "testar_amostra",
          "Pedir à ervateira que teste uma gota.",
          "A mistura amarga reduz a febre. A ervateira anota o efeito e lacra os outros frascos.",
          { hp: 9, honra: 1 },
        ),
        opcao(
          "cobrar_registro",
          "Cobrar pelo trabalho de catalogar os frascos · 2 Gold.",
          "O boticário paga e leva a caixa. A ervateira guarda uma cópia das anotações.",
          { gold: 2, honra: 1 },
        ),
        opcao(
          "devolver_amostras",
          "Devolver a caixa sem abrir.",
          "O boticário a recebe e parte pela estrada. A ervateira mantém a porta fechada até o fim do dia.",
          { honra: 2 },
        ),
      ],
    ),
    carta(
      "leilao_de_cordas",
      "O leilão de cordas",
      "Uma embarcação vende cordas antes de partir. Há peças grossas para puxar carroças e cordas finas usadas para içar sacos.",
      "Comprar para as obras custa Gold; dividir o lote com outro comprador reduz o que fica para a vila.",
      artes.ponte,
      [
        opcao(
          "comprar_cordas",
          "Comprar o lote grosso para as obras · 4 Gold.",
          "As cordas seguem para o depósito. O barqueiro parte com as peças menores.",
          { gold: -4, escudo: 1, honra: 2 },
        ),
        opcao(
          "dividir_cordas",
          "Dividir o preço e o lote com o barqueiro.",
          "A vila recebe cordas suficientes para a ponte. O restante segue na embarcação.",
          { gold: -2, honra: 1 },
        ),
        opcao(
          "esperar_cordas",
          "Esperar por uma oferta na próxima viagem.",
          "A embarcação parte com o lote. O depósito guarda as cordas antigas para um remendo.",
          { gold: 2, honra: -1 },
        ),
      ],
    ),
    carta(
      "sombra_campanario",
      "A sombra no campanário",
      "Ao meio-dia, uma sombra cruza o campanário enquanto o sino permanece imóvel. Quando os vigias olham de novo, a torre está vazia.",
      "Subir, fechar a torre ou esperar pelo fim da tarde custa tempo de guarda.",
      artes.sino,
      [
        opcao(
          "subir_campanario",
          "Subir com dois vigias e uma lanterna.",
          "A escada termina sob o sino. Os vigias encontram penas presas à trave e nenhum outro sinal.",
          { hp: -3, honra: 2 },
        ),
        opcao(
          "fechar_campanario",
          "Trancar a torre até que o padre examine o sino.",
          "A guarda recebe a chave. O badalar da tarde chega abafado pelas portas fechadas.",
          { escudo: 1, honra: 1 },
        ),
        opcao(
          "observar_campanario",
          "Esperar até que o sol deixe a parede.",
          "A sombra volta a atravessar a torre quando o sol baixa. O sino continua quieto.",
          { gold: 1, honra: -1 },
        ),
      ],
    ),
    carta(
      "sal_nao_derrete",
      "O sal que não derrete",
      "Um pote fica submerso por uma noite, mas o sal lá dentro permanece seco e solto. O oleiro diz que a tampa estava fechada; a água ainda escorre pelas laterais.",
      "Entregar o pote a um estudioso, vender a curiosidade ou descartá-lo evita transformar o caso em promessa de cura.",
      artes.poco,
      [
        opcao(
          "estudar_sal",
          "Mandar o pote ao boticário para exame · 1 Gold.",
          "O boticário guarda uma amostra e devolve o pote. Não encontra uso medicinal no sal.",
          { gold: -1, honra: 2, hp: 2 },
        ),
        opcao(
          "vender_sal",
          "Vender o pote como curiosidade na feira.",
          "Um viajante paga pela história e leva o sal para outra cidade.",
          { gold: 4, honra: -2 },
        ),
        opcao(
          "descartar_sal",
          "Jogar o sal fora e quebrar o pote.",
          "A água leva o sal pelo canal. O oleiro recolhe os cacos para a próxima fornada.",
          { honra: 1 },
        ),
      ],
    ),
    carta(
      "quarto_sem_pegadas",
      "O quarto sem pegadas",
      "Uma hospedaria amanhece com a porta trancada por dentro. O pó do chão não guarda marcas, embora a cama esteja desfeita e a bacia ainda esteja morna.",
      "Revistar o quarto com testemunhas, chamar a guarda ou não espalhar o caso muda o que a vila acredita ter acontecido.",
      artes.vila,
      [
        opcao(
          "revistar_quarto",
          "Revistar o quarto com a estalajadeira presente.",
          "A janela está presa por dentro. Sob a cama, a guarda encontra uma chave que não abre nenhuma porta da casa.",
          { hp: -2, honra: 2 },
        ),
        opcao(
          "chamar_guarda_quarto",
          "Deixar a guarda fechar a hospedaria por uma noite.",
          "Os viajantes recebem abrigo no salão. A estalajadeira paga a vigília extra.",
          { gold: -2, escudo: 1, honra: 1 },
        ),
        opcao(
          "calar_quarto",
          "Pedir que ninguém transforme o caso em rumor.",
          "A porta abre ao meio-dia. O quarto fica vazio, e a hospedaria volta a receber viajantes.",
          { habitantes: -1, honra: -1 },
        ),
      ],
    ),
    carta(
      "chuva_poco_seco",
      "A chuva sobre o poço seco",
      "Uma chuva estreita cai sobre o poço seco enquanto o restante da praça continua coberto de poeira. Pela manhã, há água até a primeira pedra.",
      "Recolher a água, pedir um exame ou cobrir o poço evita que a curiosidade vire uma fila perigosa.",
      artes.poco,
      [
        opcao(
          "recolher_agua_poco",
          "Recolher a água em recipientes limpos.",
          "A água chega à enfermaria antes que a poeira volte a cobrir a praça.",
          { hp: 8, honra: 2 },
        ),
        opcao(
          "examinar_agua_poco",
          "Pedir que a ervateira examine uma amostra · 1 Gold.",
          "A ervateira não encontra gosto ou cheiro estranho. A amostra fica guardada até a próxima semana.",
          { gold: -1, hp: 5, honra: 1 },
        ),
        opcao(
          "cobrir_poco",
          "Cobrir o poço até que a nascente volte.",
          "A tampa impede que alguém desça para buscar a pouca água que resta.",
          { gold: 1, honra: -1 },
        ),
      ],
    ),
    carta(
      "moedas_viradas",
      "As moedas viradas",
      "As moedas do cofre aparecem todas com o mesmo lado para cima. O administrador afirma que contou duas vezes e não tocou na caixa desde a noite anterior.",
      "Conferir o cofre, procurar o cunhador ou fechar a caixa evita que o sinal vire uma regra de mercado.",
      artes.ouro,
      [
        opcao(
          "contar_moedas",
          "Contar o cofre peça por peça.",
          "A conta confere. O administrador troca a caixa por uma com tampa firme.",
          { gold: 2, honra: 1 },
        ),
        opcao(
          "chamar_cunhador",
          "Chamar quem cunhou as peças.",
          "O cunhador reconhece o lote e diz que algumas moedas foram polidas na mesma oficina.",
          { gold: -1, honra: 2 },
        ),
        opcao(
          "aceitar_moedas",
          "Fechar o cofre e aceitar o ocorrido.",
          "O administrador tranca a caixa. Ninguém explica como as moedas ficaram viradas.",
          { gold: 3, honra: -1 },
        ),
      ],
    ),
    carta(
      "janela_casa_vazia",
      "A janela acesa na casa vazia",
      "Uma janela mostra luz em três noites seguidas, embora a casa esteja fechada desde a partida de seus antigos moradores. Ninguém ouviu passos no caminho.",
      "Entrar com testemunhas, vender a propriedade ou manter a porta fechada encerra a vigília por motivos diferentes.",
      artes.janela,
      [
        opcao(
          "entrar_casa_vazia",
          "Entrar com a guarda e conferir os cômodos.",
          "A lamparina está apagada e sem óleo. A janela fecha quando os guardas encontram a tranca solta.",
          { hp: -2, honra: 2 },
        ),
        opcao(
          "vender_casa_vazia",
          "Vender a casa antes que a história se espalhe.",
          "Um comprador assume a propriedade e paga pela chave. A janela fica escura naquela noite.",
          { gold: 6, honra: -2 },
        ),
        opcao(
          "fechar_casa_vazia",
          "Manter a porta fechada e dobrar a ronda.",
          "Os guardas passam diante da janela até o amanhecer. A luz não volta na noite seguinte.",
          { escudo: 1, honra: 1 },
        ),
      ],
    ),
  ];

  function etapa(cadeia, numero, dados) {
    const flagFechada = `${cadeia}_encerrada`;
    const flagsAusentes = [...(dados.requisitos?.flagsAusentes || []), flagFechada];
    const flagsEtapa = numero === 1 ? [] : [`${cadeia}_etapa${numero}`];
    const requisitos = {
      ...dados.requisitos,
      ...(flagsEtapa.length ? { flags: [...(dados.requisitos?.flags || []), ...flagsEtapa] } : {}),
      flagsAusentes,
    };
    const opcoes = dados.opcoes.map((item) => {
      const { continua, ...escolha } = item;
      const flags = { ...(escolha.flags || {}) };
      if (numero < 4 && continua) flags[`${cadeia}_etapa${numero + 1}`] = true;
      else flags[flagFechada] = true;
      return { ...escolha, flags };
    });
    return carta(dados.id, dados.titulo, dados.texto, dados.informacoes, dados.arte, opcoes, {
      peso: 2.5,
      requisitos,
    });
  }

  const cadeias = [
    ["carta_na_encadernacao", "marcas_no_vau", "posto_de_pedra", "destino_da_carta"].map((id, indice) => {
      const n = indice + 1;
      const dados = [
        {
          titulo: "Uma carta na encadernação",
          texto:
            "Um livro comprado na feira esconde uma carta de navegação dobrada entre as capas. O desenho mostra um vau que não aparece nos mapas recentes.",
          informacoes: "Guardar a carta e procurar o autor abre uma rota; vender o papel encerra a busca.",
          arte: artes.mapa,
          opcoes: [
            {
              ...opcao(
                "seguir_carta",
                "Guardar a carta e procurar o vau.",
                "O escrivão reconhece o selo apagado. Você guarda o mapa antes que a feira termine.",
                { gold: -1, honra: 2 },
              ),
              continua: true,
            },
            {
              ...opcao(
                "vender_carta",
                "Vender o papel a um colecionador.",
                "O colecionador paga pelo desenho e leva o livro para outra cidade.",
                { gold: 4, honra: -1 },
              ),
              continua: false,
            },
          ],
        },
        {
          titulo: "As marcas no vau",
          texto:
            "A carta leva a um vau baixo, riscado por marcas recentes. A água cobre os tornozelos, mas os sinais continuam pela margem em direção ao bosque.",
          informacoes:
            "Medir a travessia, pagar aos barqueiros ou seguir as marcas decide até onde a vila vai atrás do mapa.",
          arte: artes.ponte,
          opcoes: [
            {
              ...opcao(
                "medir_vau",
                "Medir o vau antes de atravessar.",
                "A vara encontra uma faixa rasa. Os barqueiros anotam o ponto seguro para a próxima viagem.",
                { gold: -1, honra: 2 },
              ),
              continua: true,
            },
            {
              ...opcao(
                "pagar_barqueiros",
                "Pagar aos barqueiros para continuar.",
                "Os barqueiros levam a carta até a margem oposta e voltam antes de escurecer.",
                { gold: -3, habitantes: 1, honra: 1 },
              ),
              continua: true,
            },
            {
              ...opcao(
                "abandonar_vau",
                "Deixar a carta no posto da estrada.",
                "O escrivão arquiva o mapa. Ninguém atravessa o vau naquela noite.",
                { honra: 1 },
              ),
              continua: false,
            },
          ],
        },
        {
          titulo: "O posto de pedra",
          texto:
            "Entre as árvores surge um antigo posto de cobrança. As pedras trazem marcas de rodas e um desenho de barco, embora o rio tenha mudado de curso.",
          informacoes:
            "Registrar os sinais, retirar os blocos ou procurar uma passagem por baixo da construção altera a rota.",
          arte: artes.tumulo,
          opcoes: [
            {
              ...opcao(
                "registrar_posto",
                "Copiar as marcas no mapa.",
                "O escrivão compara os sinais com a carta. A rota segue para uma abertura sob o posto.",
                { gold: -1, honra: 2 },
              ),
              continua: true,
            },
            {
              ...opcao(
                "retirar_posto",
                "Levar os blocos para uma obra da vila.",
                "Os pedreiros desmontam o posto. O desenho do barco se parte no meio.",
                { gold: 5, honra: -2 },
              ),
              continua: false,
            },
            {
              ...opcao(
                "buscar_passagem",
                "Procurar uma passagem abaixo do posto.",
                "Uma escada curta desce até um abrigo seco. A carta aponta para a porta escondida sob as raízes.",
                { hp: -2, honra: 1 },
              ),
              continua: true,
            },
          ],
        },
        {
          titulo: "O destino da carta",
          texto:
            "A última marca aponta para um abrigo de pedra escondido entre as raízes. Há objetos de viagem no chão, mas nenhuma inscrição sobre quem os deixou.",
          informacoes:
            "Levar os objetos, deixar uma oferta ou fechar o abrigo decide quem poderá encontrá-lo depois.",
          arte: artes.caixas,
          opcoes: [
            opcao(
              "tomar_abrigo",
              "Levar os objetos que ainda servem.",
              "A vila recebe ferramentas e provisões. O abrigo fica vazio, mas a rota permanece marcada.",
              { gold: 5, escudo: 1, honra: -1 },
            ),
            opcao(
              "deixar_oferta",
              "Deixar provisões para a próxima pessoa que passar.",
              "A caixa recebe pão e uma vela. O mapa volta ao livro do escrivão.",
              { gold: -2, honra: 3 },
            ),
            opcao(
              "fechar_abrigo",
              "Fechar a entrada e apagar o caminho.",
              "As pedras cobrem a abertura. A carta fica guardada sem revelar o local a outros viajantes.",
              { honra: 2 },
            ),
          ],
        },
      ][indice];
      return etapa("carta_navegacao", n, { id, ...dados, requisitos: n === 1 ? { rodadaMin: 6 } : {} });
    }),
    ["cacos_sob_cinza", "receita_incompleta", "forno_de_areia", "janela_guarda_calor"].map((id, indice) => {
      const n = indice + 1;
      const dados = [
        {
          titulo: "Cacos sob a cinza",
          texto:
            "Uma família encontra vidro colorido entre as cinzas de um forno abandonado. As bordas estão inteiras; o forno, rachado até a base.",
          informacoes:
            "Recolher as peças, chamar um vidreiro ou deixar o terreno fechado define se a oficina reabre.",
          arte: artes.construcao,
          opcoes: [
            {
              ...opcao(
                "recolher_cacos",
                "Recolher os cacos e levar à oficina.",
                "O vidreiro reconhece as cores e pede tempo para reconstruir a receita.",
                { gold: -1, honra: 1 },
              ),
              continua: true,
            },
            {
              ...opcao(
                "chamar_vidreiro",
                "Pedir ao vidreiro que examine o forno.",
                "O artesão encontra um caderno sob a cinza e começa a copiar as medidas.",
                { gold: -2, escudo: 1, honra: 2 },
              ),
              continua: true,
            },
            {
              ...opcao(
                "fechar_forno",
                "Fechar o terreno e impedir a extração.",
                "A guarda cerca o forno. O vidro permanece sob as cinzas.",
                { honra: 1 },
              ),
              continua: false,
            },
          ],
        },
        {
          titulo: "A receita incompleta",
          texto:
            "O vidreiro encontra a receita sem sua última medida. Os antigos aprendizes lembram de um forno de areia, mas discordam sobre a proporção do material.",
          informacoes:
            "Buscar os aprendizes, testar uma mistura ou vender o caderno encerra a dúvida por caminhos diferentes.",
          arte: artes.forja,
          opcoes: [
            {
              ...opcao(
                "buscar_aprendizes",
                "Procurar os antigos aprendizes.",
                "Dois deles trazem medidas anotadas em pedaços de cerâmica.",
                { habitantes: 1, honra: 2 },
              ),
              continua: true,
            },
            {
              ...opcao(
                "testar_receita",
                "Pagar por uma fornada de teste · 3 Gold.",
                "A mistura endurece sem rachar. O vidreiro pede areia adequada para repetir o resultado.",
                { gold: -3, hp: -2, honra: 1 },
              ),
              continua: true,
            },
            {
              ...opcao(
                "vender_caderno",
                "Vender o caderno a um colecionador.",
                "O colecionador paga pelo papel. O vidreiro guarda de memória as medidas que conseguiu ler.",
                { gold: 4, honra: -2 },
              ),
              continua: false,
            },
          ],
        },
        {
          titulo: "O forno de areia",
          texto:
            "Os aprendizes localizam areia fina fora das muralhas. O forno precisa de combustível e de uma parede nova antes de suportar outra fornada.",
          informacoes:
            "Financiar o reparo, dividir o custo ou abandonar o trabalho decide se a oficina continua.",
          arte: artes.construcao,
          opcoes: [
            {
              ...opcao(
                "financiar_forno",
                "Pagar combustível e reparos · 4 Gold.",
                "O forno mantém o calor por uma noite inteira. Os aprendizes preparam o primeiro lote.",
                { gold: -4, honra: 2 },
              ),
              continua: true,
            },
            {
              ...opcao(
                "dividir_forno",
                "Dividir o custo entre a oficina e a vila.",
                "O vidreiro oferece metade dos materiais. A vila fornece areia e madeira seca.",
                { gold: -2, habitantes: 1, honra: 2 },
              ),
              continua: true,
            },
            {
              ...opcao(
                "abandonar_forno",
                "Desmontar a parede e guardar os tijolos.",
                "Os tijolos seguem para outra obra. A oficina fecha o caderno da receita.",
                { gold: 3, honra: -1 },
              ),
              continua: false,
            },
          ],
        },
        {
          titulo: "A janela que guarda calor",
          texto:
            "O primeiro lote pode fechar as janelas da enfermaria ou ser vendido para pagar o forno. O vidreiro põe as placas sobre a mesa e espera sua decisão.",
          informacoes:
            "Usar o vidro na vila, reservar parte ou vender toda a produção encerra a oficina por esta estação.",
          arte: artes.vila,
          opcoes: [
            opcao(
              "usar_vidro_enfermaria",
              "Fechar as janelas da enfermaria.",
              "O vidro segura o calor dentro dos quartos. A ervateira consegue manter água quente durante a noite.",
              { hp: 10, honra: 3, gold: -1 },
            ),
            opcao(
              "reservar_vidro",
              "Reservar metade para o salão comunal.",
              "A oficina guarda as placas menores. O restante cobre duas janelas da enfermaria.",
              { escudo: 1, honra: 2 },
            ),
            opcao(
              "vender_vidro",
              "Vender toda a fornada na feira.",
              "O lote paga o reparo do forno e deixa uma sobra no cofre. As janelas continuam cobertas por tecido.",
              { gold: 7, honra: -2 },
            ),
          ],
        },
      ][indice];
      return etapa("oficio_vidreiro", n, { id, ...dados, requisitos: n === 1 ? { rodadaMin: 6 } : {} });
    }),
    ["frutos_terreno_baldio", "enxerto_recusado", "raizes_sob_parede", "primeira_cesta_pomar"].map(
      (id, indice) => {
        const n = indice + 1;
        const dados = [
          {
            titulo: "Frutos no terreno baldio",
            texto:
              "Uma árvore carregada cresce num terreno que não aparece nos registros. Os frutos caem antes de amadurecer, e ninguém sabe quem tem direito de colhê-los.",
            informacoes:
              "Colher agora, proteger a árvore ou consultar os registros decide quem cuida do terreno.",
            arte: artes.frutos,
            opcoes: [
              {
                ...opcao(
                  "colher_terreno",
                  "Colher o que já caiu e repartir.",
                  "As famílias recolhem os frutos antes que estraguem. O terreno continua sem dono no registro.",
                  { habitantes: 2, honra: 2 },
                ),
                continua: true,
              },
              {
                ...opcao(
                  "proteger_pomar",
                  "Proteger a árvore até a próxima estação.",
                  "A guarda marca os limites com estacas. Ninguém colhe enquanto a propriedade não for conferida.",
                  { gold: -1, honra: 2 },
                ),
                continua: true,
              },
              {
                ...opcao(
                  "vender_terreno",
                  "Vender o direito de colher ao primeiro comprador.",
                  "O comprador leva as frutas e paga pelo terreno. Os moradores perdem o acesso à árvore.",
                  { gold: 5, habitantes: -1, honra: -2 },
                ),
                continua: false,
              },
            ],
          },
          {
            titulo: "O enxerto recusado",
            texto:
              "Um jardineiro oferece enxertos, mas diz que a árvore pertence à sua família. O registro da vila não confirma nem desmente a história.",
            informacoes:
              "Negociar o plantio, aceitar poucas mudas ou encerrar o acordo define o alcance do pomar.",
            arte: artes.frutos,
            opcoes: [
              {
                ...opcao(
                  "negociar_enxerto",
                  "Negociar o direito de plantar no terreno.",
                  "O jardineiro aceita dividir a colheita futura e entrega as mudas ao escrivão.",
                  { gold: -2, honra: 2 },
                ),
                continua: true,
              },
              {
                ...opcao(
                  "aceitar_mudas",
                  "Aceitar apenas três mudas.",
                  "As mudas ficam perto do muro, onde a família do jardineiro consegue cuidar delas.",
                  { habitantes: 1, honra: 1 },
                ),
                continua: true,
              },
              {
                ...opcao(
                  "encerrar_enxerto",
                  "Encerrar a conversa até que haja um registro.",
                  "O jardineiro parte com os enxertos. A vila não planta em terra disputada.",
                  { honra: 1 },
                ),
                continua: false,
              },
            ],
          },
          {
            titulo: "As raízes sob a parede",
            texto:
              "As raízes deslocam a parede de um quintal. Uma pedra caiu sobre o caminho; os moradores querem saber se devem cortar a árvore antes que ceda mais.",
            informacoes:
              "Podar parte das raízes, reforçar a parede ou transferir a árvore tem custos distintos.",
            arte: artes.salgueiro,
            opcoes: [
              {
                ...opcao(
                  "podar_raizes",
                  "Podar as raízes que empurram a parede.",
                  "O jardineiro corta apenas o trecho exposto. A árvore permanece onde as mudas cresceram.",
                  { habitantes: -1, honra: 2 },
                ),
                continua: true,
              },
              {
                ...opcao(
                  "reforcar_parede",
                  "Reforçar a parede com pedras do depósito · 3 Gold.",
                  "A parede fica firme. O jardineiro muda o caminho das raízes com uma vala estreita.",
                  { gold: -3, escudo: 1, honra: 2 },
                ),
                continua: true,
              },
              {
                ...opcao(
                  "transferir_arvore",
                  "Transferir a árvore para o terreno comum.",
                  "A árvore perde alguns galhos na mudança, mas a parede deixa de ceder.",
                  { gold: -2, honra: 1 },
                ),
                continua: false,
              },
            ],
          },
          {
            titulo: "A primeira cesta do pomar",
            texto:
              "O pomar entrega a primeira cesta inteira. Os frutos amadureceram ao mesmo tempo, e as famílias pedem que a colheita não desapareça no mercado antes do jantar.",
            informacoes: "Repartir, guardar sementes ou vender a cesta fecha o primeiro ciclo do pomar.",
            arte: artes.frutos,
            opcoes: [
              opcao(
                "repartir_pomar",
                "Dividir os frutos entre as casas.",
                "Cada casa recebe alguns frutos. As sementes ficam separadas para o próximo plantio.",
                { habitantes: 3, honra: 3 },
              ),
              opcao(
                "guardar_sementes",
                "Guardar sementes para ampliar o pomar.",
                "A cesta fica menor, mas o viveiro ganha sementes para outra fileira. A colheita fortalece a vila para os próximos invernos.",
                { hpMax: 10, honra: 2 },
              ),
              opcao(
                "vender_cesta",
                "Vender a cesta para financiar o cuidado das árvores.",
                "O comprador leva os frutos. O jardineiro recebe o valor necessário para manter as mudas.",
                { gold: 5, honra: 1 },
              ),
            ],
          },
        ][indice];
        return etapa("pomar_sem_placa", n, { id, ...dados, requisitos: n === 1 ? { rodadaMin: 6 } : {} });
      },
    ),
    ["pagina_fundo_bau", "herdeiro_cobrador", "testemunhas_ponte", "conta_encerrada"].map((id, indice) => {
      const n = indice + 1;
      const dados = [
        {
          titulo: "Uma página no fundo do baú",
          texto:
            "Um inventário antigo lista dívidas que ninguém reconhece. A página está dobrada no fundo de um baú, ao lado de contas já pagas.",
          informacoes:
            "Comparar assinaturas, rasgar o registro ou chamar os nomes ainda vivos abre a disputa.",
          arte: artes.bau,
          opcoes: [
            {
              ...opcao(
                "comparar_dividas",
                "Comparar as assinaturas com os registros da vila.",
                "Duas assinaturas pertencem a pessoas que ainda vivem. O escrivão procura seus parentes.",
                { gold: -1, honra: 2 },
              ),
              continua: true,
            },
            {
              ...opcao(
                "rasgar_dividas",
                "Rasgar a página e encerrar a cobrança.",
                "Os pedaços queimam na lareira. Nenhum cobrador pode apresentar a conta outra vez.",
                { honra: 1 },
              ),
              continua: false,
            },
            {
              ...opcao(
                "convocar_devedores",
                "Convocar quem ainda aparece na lista.",
                "O sino reúne as famílias. Uma pessoa chega antes do mensageiro que trouxe a dívida.",
                { habitantes: 1, honra: 1 },
              ),
              continua: true,
            },
          ],
        },
        {
          titulo: "O herdeiro do cobrador",
          texto:
            "Um visitante afirma que herdou o direito de cobrar aquelas dívidas. Traz um selo parecido com o da página, mas não sabe quem escreveu os valores.",
          informacoes:
            "Pedir prova, negociar uma quitação ou expulsar o cobrador mantém a página no centro da disputa.",
          arte: artes.ouro,
          opcoes: [
            {
              ...opcao(
                "pedir_prova_cobrador",
                "Pedir provas antes de aceitar qualquer cobrança.",
                "O visitante apresenta uma cópia, mas faltam os nomes de quem testemunhou o acordo.",
                { honra: 2 },
              ),
              continua: true,
            },
            {
              ...opcao(
                "pagar_cobrador",
                "Oferecer uma quantia para encerrar o assunto · 4 Gold.",
                "O visitante aceita o pagamento e assina o fim da cobrança diante do escrivão.",
                { gold: -4, honra: 1 },
              ),
              continua: false,
            },
            {
              ...opcao(
                "expulsar_cobrador",
                "Expulsar o visitante do salão.",
                "A guarda o acompanha até a estrada. O selo fica na mesa, sem dono.",
                { habitantes: -1, honra: -2 },
              ),
              continua: false,
            },
          ],
        },
        {
          titulo: "As testemunhas da ponte",
          texto:
            "Moradores lembram que parte do dinheiro pagou uma ponte que já não existe. Um antigo registro do pedágio confirma o nome do cobrador.",
          informacoes:
            "Investigar a ponte, ouvir as famílias ou reconhecer o documento como inválido separa a dívida do que ela construiu.",
          arte: artes.ponte,
          opcoes: [
            {
              ...opcao(
                "investigar_ponte_divida",
                "Conferir os registros da antiga ponte.",
                "O pedágio cobriu uma obra que caiu na última cheia. A dívida não pode ser cobrada das famílias atuais.",
                { gold: -1, honra: 2 },
              ),
              continua: true,
            },
            {
              ...opcao(
                "ouvir_familias",
                "Ouvir as famílias antes de decidir.",
                "Cada casa confirma uma parte do trabalho. O escrivão encontra o nome de quem recebeu o pagamento.",
                { habitantes: 1, honra: 2 },
              ),
              continua: true,
            },
            {
              ...opcao(
                "invalidar_divida",
                "Declarar o documento inválido.",
                "A guarda devolve a cópia ao visitante. A página original fica no arquivo da vila.",
                { honra: 1 },
              ),
              continua: false,
            },
          ],
        },
        {
          titulo: "A conta encerrada",
          texto:
            "Os registros mostram quem lucrou com a cobrança. O antigo pedágio pagou uma obra que sumiu, mas parte do dinheiro ficou com quem a administrava.",
          informacoes: "Publicar os nomes, negociar reparação ou destruir os papéis termina a cobrança.",
          arte: artes.documento,
          opcoes: [
            opcao(
              "publicar_divida",
              "Publicar os nomes e devolver o que restou.",
              "O escrivão afixa a lista na praça. As famílias recebem parte do dinheiro antes de a feira fechar.",
              { gold: 4, honra: 3 },
            ),
            opcao(
              "negociar_divida",
              "Negociar reparação com os herdeiros.",
              "Os herdeiros entregam ferramentas para a obra da ponte. A dívida deixa de constar no registro.",
              { escudo: 1, honra: 2 },
            ),
            opcao(
              "queimar_divida",
              "Queimar os registros e encerrar o assunto.",
              "A página se desfaz na lareira. Os nomes deixam de ser cobrados, mas também somem do arquivo.",
              { gold: 2, honra: -1 },
              { itens: ["tomo_do_esquecimento"] },
            ),
          ],
        },
      ][indice];
      return etapa("livro_dividas", n, { id, ...dados, requisitos: n === 1 ? { rodadaMin: 8 } : {} });
    }),
    ["lanterna_colina", "cinzas_no_abrigo", "codigo_dos_panos", "aviso_recebido"].map((id, indice) => {
      const n = indice + 1;
      const dados = [
        {
          titulo: "A lanterna na colina",
          texto:
            "Uma luz aparece numa colina sem casas. Não pisca nem se move, mesmo quando o vento apaga as lanternas da estrada.",
          informacoes: "Subir, responder com um sinal ou esperar a manhã define como a vila trata a luz.",
          arte: artes.lanterna,
          opcoes: [
            {
              ...opcao(
                "subir_lanterna",
                "Subir a colina com uma lanterna própria.",
                "No alto há um abrigo antigo e cinzas ainda mornas. A luz vem de uma abertura na pedra.",
                { hp: -2, honra: 2 },
              ),
              continua: true,
            },
            {
              ...opcao(
                "responder_lanterna",
                "Responder com um sinal do portão.",
                "Uma luz menor aparece no alto e se apaga. O vigia pede que você confira o abrigo.",
                { gold: -1, honra: 1 },
              ),
              continua: true,
            },
            {
              ...opcao(
                "esperar_lanterna",
                "Esperar até o amanhecer.",
                "A luz desaparece antes do sol nascer. A guarda registra a colina para a próxima ronda.",
                { honra: 1 },
              ),
              continua: false,
            },
          ],
        },
        {
          titulo: "Cinzas no abrigo",
          texto:
            "O abrigo guarda cinzas recentes e marcas de uma vigia antiga. Há lenha empilhada, mas nenhuma ferramenta para reacender o fogo.",
          informacoes:
            "Procurar o responsável, reconstruir a lareira ou usar o lugar como depósito dá outro destino ao posto.",
          arte: artes.construcao,
          opcoes: [
            {
              ...opcao(
                "procurar_vigia",
                "Procurar quem acendeu a lareira.",
                "Um morador confessa que subiu para esperar uma caravana e pede que a guarda mantenha o posto aberto.",
                { habitantes: 1, honra: 2 },
              ),
              continua: true,
            },
            {
              ...opcao(
                "reconstruir_lareira",
                "Reparar a lareira com pedra do muro · 2 Gold.",
                "A lareira segura o fogo sem soltar fumaça. O posto volta a servir de abrigo.",
                { gold: -2, hp: 4, honra: 1 },
              ),
              continua: true,
            },
            {
              ...opcao(
                "fechar_abrigo",
                "Usar o abrigo como depósito da guarda.",
                "As ferramentas ocupam o lugar da lenha. O vigia deixa de subir até a colina.",
                { escudo: 1, honra: 1 },
              ),
              continua: false,
            },
          ],
        },
        {
          titulo: "O código dos panos",
          texto:
            "Faixas de pano aparecem em três pontos do vale. As cores se repetem numa ordem que o vigia diz ter visto antes, mas ninguém lembra quando.",
          informacoes:
            "Decifrar o código, trocar as faixas por sinais da vila ou ignorar o recado define a rota do posto.",
          arte: artes.panos,
          opcoes: [
            {
              ...opcao(
                "decifrar_panos",
                "Comparar as faixas com as marcas do mapa.",
                "O desenho aponta para uma curva da estrada que desaparece atrás da colina.",
                { gold: -1, honra: 2 },
              ),
              continua: true,
            },
            {
              ...opcao(
                "trocar_panos",
                "Substituir as faixas pelos sinais da guarda.",
                "Os vigias deixam um código simples para indicar perigo e passagem livre.",
                { escudo: 1, honra: 1 },
              ),
              continua: true,
            },
            {
              ...opcao(
                "ignorar_panos",
                "Retirar as faixas e não deixar resposta.",
                "A guarda recolhe os panos. Nenhuma outra luz aparece no posto naquela noite.",
                { gold: 2, honra: -1 },
              ),
              continua: false,
            },
          ],
        },
        {
          titulo: "O aviso recebido",
          texto:
            "A sequência de sinais anuncia perigo na estrada e uma caravana atrasada. O último vigia pede ajuda para receber os viajantes antes que escureça.",
          informacoes:
            "Organizar a guarda, preparar abrigo ou cobrar por uma passagem segura encerra o posto de sinais.",
          arte: artes.caravana,
          opcoes: [
            opcao(
              "organizar_guarda_sinais",
              "Enviar a guarda para proteger a estrada.",
              "A caravana chega sem perder outra roda. O vigia entrega o código ao capitão da ronda.",
              { gold: -2, habitantes: 2, honra: 3 },
            ),
            opcao(
              "abrigo_caravana",
              "Abrir o abrigo e dividir a lenha.",
              "Os viajantes passam a noite na colina. Pela manhã, o último vigia desce para a vila.",
              { hp: 6, honra: 2, gold: -1 },
            ),
            opcao(
              "cobrar_passagem",
              "Cobrar pela passagem protegida.",
              "A caravana paga e segue sem parar. O posto fica vazio depois da última luz.",
              { gold: 5, honra: -2 },
            ),
          ],
        },
      ][indice];
      return etapa("posto_sinais", n, { id, ...dados, requisitos: n === 1 ? { rodadaMin: 8 } : {} });
    }),
    ["desenho_no_barril", "camada_de_argila", "agua_sobe_devagar", "primeira_distribuicao"].map(
      (id, indice) => {
        const n = indice + 1;
        const dados = [
          {
            titulo: "O desenho no barril",
            texto:
              "Aprendizes encontram o desenho de uma cisterna no fundo de um barril comprado na feira. Uma marca no canto indica o terreno perto da muralha leste.",
            informacoes:
              "Conferir o terreno, pagar um pedreiro ou descartar o desenho decide se a obra começa.",
            arte: artes.barril,
            opcoes: [
              {
                ...opcao(
                  "conferir_desenho",
                  "Conferir o terreno antes de cavar.",
                  "O pedreiro encontra marcas antigas de uma escavação interrompida.",
                  { gold: -1, honra: 2 },
                ),
                continua: true,
              },
              {
                ...opcao(
                  "chamar_pedreiro",
                  "Pedir a um pedreiro que examine o plano · 2 Gold.",
                  "O pedreiro reconhece a camada de argila que poderia vedar a cisterna.",
                  { gold: -2, escudo: 1, honra: 1 },
                ),
                continua: true,
              },
              {
                ...opcao(
                  "descartar_desenho",
                  "Descartar o plano e usar o barril no depósito.",
                  "O barril guarda farinha. Os aprendizes devolvem o desenho ao papel usado.",
                  { gold: 2, honra: -1 },
                ),
                continua: false,
              },
            ],
          },
          {
            titulo: "A camada de argila",
            texto:
              "A escavação encontra uma camada de argila que pode vedar a água. O solo cede em dois pontos, e a margem da vala já está inclinada.",
            informacoes:
              "Reforçar, mudar o local ou interromper o trabalho evita que os aprendizes fiquem sob a terra.",
            arte: artes.construcao,
            opcoes: [
              {
                ...opcao(
                  "reforcar_cisterna",
                  "Reforçar a vala com pedras · 3 Gold.",
                  "A parede aguenta o peso da terra. Os aprendizes continuam com escoras novas.",
                  { gold: -3, honra: 2 },
                ),
                continua: true,
              },
              {
                ...opcao(
                  "mudar_cisterna",
                  "Mudar a escavação para o terreno alto.",
                  "A argila fica mais longe, mas a vala passa a ter uma margem firme.",
                  { habitantes: -1, honra: 1 },
                ),
                continua: true,
              },
              {
                ...opcao(
                  "parar_cisterna",
                  "Interromper a obra antes de outro deslizamento.",
                  "Os pedreiros cobrem a vala. O desenho volta para o barril.",
                  { hp: 3, honra: 2 },
                ),
                continua: false,
              },
            ],
          },
          {
            titulo: "A água que sobe devagar",
            texto:
              "A cisterna acumula água aos poucos. O fundo ainda tem barro, e os aprendizes discordam sobre quanto tempo falta para a primeira retirada.",
            informacoes:
              "Reservar para a enfermaria, testar a qualidade ou ajustar o canal impede que a pressa contamine o poço.",
            arte: artes.poco,
            opcoes: [
              {
                ...opcao(
                  "reservar_cisterna",
                  "Reservar a água para a enfermaria.",
                  "A ervateira usa a primeira retirada para preparar remédios. O restante permanece intocado.",
                  { hp: 8, honra: 2 },
                ),
                continua: true,
              },
              {
                ...opcao(
                  "testar_cisterna",
                  "Testar a água antes de abrir a torneira · 1 Gold.",
                  "A amostra sai limpa depois de passar pelo filtro de areia.",
                  { gold: -1, escudo: 1, honra: 2 },
                ),
                continua: true,
              },
              {
                ...opcao(
                  "ajustar_canal",
                  "Deixar os aprendizes ajustarem o canal.",
                  "A vala recebe outra saída. A água sobe com mais lentidão, sem levar barro ao poço.",
                  { habitantes: 1, honra: 1 },
                ),
                continua: true,
              },
            ],
          },
          {
            titulo: "A primeira distribuição",
            texto:
              "A cisterna está limpa e pode receber uma fila. As casas pedem horários; a enfermaria quer uma reserva para os dias em que o poço baixar.",
            informacoes:
              "A construção permanece na vila. Distribuir por ordem, separar uma reserva ou deixar a retirada livre encerra a obra.",
            arte: artes.poco,
            opcoes: [
              opcao(
                "construir_cisterna",
                "Abrir a cisterna e marcar uma fila pública.",
                "A vila instala uma tampa e organiza a retirada. A cisterna acrescentará 1 Habitante a cada três rodadas.",
                { gold: -3, habitantes: 2, honra: 3 },
                { construcoes: ["cisterna_comunitaria"], marcoRodada: { id: "cisternaConstruidaRodada" } },
              ),
              opcao(
                "reservar_cisterna_enfermaria",
                "Separar metade para a enfermaria.",
                "A cisterna abre com uma reserva protegida. A ervateira anota quem retirou cada balde.",
                { gold: -2, hp: 5, honra: 2 },
                { construcoes: ["cisterna_comunitaria"], marcoRodada: { id: "cisternaConstruidaRodada" } },
              ),
              opcao(
                "retirada_livre",
                "Deixar cada casa retirar o que puder.",
                "A água fica acessível sem fila, mas a reserva termina antes que o próximo mês comece.",
                { habitantes: 1, honra: -1 },
              ),
            ],
          },
        ][indice];
        return etapa("aprendizes_cisterna", n, { id, ...dados, requisitos: n === 1 ? { rodadaMin: 8 } : {} });
      },
    ),
    ["tear_desmontado", "fio_tres_cores", "padrao_emprestado", "ultimo_rolo"].map((id, indice) => {
      const n = indice + 1;
      const dados = [
        {
          titulo: "O tear desmontado",
          texto:
            "Uma caravana deixa um tear desmontado ao perceber que perdeu uma roda. As peças ocupam o pátio, onde a vila guarda tábuas para o inverno.",
          informacoes:
            "Guardar o tear, ajudar a procurar a peça ou cobrar pelo espaço ocupado define a passagem da caravana.",
          arte: artes.tear,
          opcoes: [
            {
              ...opcao(
                "guardar_tear",
                "Guardar as peças no salão coberto.",
                "As peças ficam secas. A caravana procura a roda entre as carroças da feira.",
                { gold: -1, honra: 1 },
              ),
              continua: true,
            },
            {
              ...opcao(
                "buscar_roda_tear",
                "Ajudar a procurar a roda perdida.",
                "A roda aparece sob um cesto. Os tecelões oferecem ensinar o uso do tear.",
                { habitantes: 1, honra: 2 },
              ),
              continua: true,
            },
            {
              ...opcao(
                "cobrar_espaco_tear",
                "Cobrar pelo espaço ocupado no pátio.",
                "A caravana paga e parte antes que a feira termine. O tear segue desmontado.",
                { gold: 3, honra: -1 },
              ),
              continua: false,
            },
          ],
        },
        {
          titulo: "O fio de três cores",
          texto:
            "Com a roda recuperada, os tecelões propõem tingir fios com plantas locais. As cores ficam diferentes a cada fervura e a oficina não quer desperdiçar o estoque.",
          informacoes:
            "Fornecer material, cobrar pelo pátio ou pedir parte do tecido define o acordo com a caravana.",
          arte: artes.fiandeiras,
          opcoes: [
            {
              ...opcao(
                "fornecer_tingimento",
                "Fornecer plantas e lenha para o teste.",
                "Os fios secam no pátio. Os tecelões deixam uma amostra para a vila.",
                { gold: -2, honra: 2 },
              ),
              continua: true,
            },
            {
              ...opcao(
                "cobrar_patio_tecido",
                "Cobrar pelo uso do pátio.",
                "A caravana paga pelo espaço e termina o lote do lado de fora do muro.",
                { gold: 3, honra: -1 },
              ),
              continua: true,
            },
            {
              ...opcao(
                "pedir_tecido",
                "Pedir parte do tecido em troca dos materiais.",
                "A vila recebe tecido suficiente para remendar roupas de trabalho.",
                { escudo: 1, honra: 1 },
              ),
              continua: true,
            },
          ],
        },
        {
          titulo: "O padrão emprestado",
          texto:
            "Um desenho repetido no tecido pertence a uma comunidade distante. A caravana diz que aprendeu o padrão num mercado, mas não sabe quem o criou.",
          informacoes:
            "Pedir autorização, criar um padrão local ou manter o desenho sem acordo muda o próximo negócio.",
          arte: artes.fiandeiras,
          opcoes: [
            {
              ...opcao(
                "pedir_autorizacao",
                "Pedir que a caravana procure a comunidade autora.",
                "Os tecelões anotam o nome e enviam uma carta pela estrada.",
                { gold: -1, honra: 2 },
              ),
              continua: true,
            },
            {
              ...opcao(
                "criar_padrao",
                "Criar um desenho próprio para a vila.",
                "Os aprendizes registram um padrão de linhas e telhados que não imita o antigo.",
                { habitantes: 1, honra: 2 },
              ),
              continua: true,
            },
            {
              ...opcao(
                "usar_padrao",
                "Continuar usando o desenho sem buscar autorização.",
                "O tecido fica pronto mais depressa. A caravana não pretende voltar à vila.",
                { gold: 4, honra: -3, habitantes: -1 },
                { flags: { tecelagem_padrao_sem_acordo: true } },
              ),
              continua: true,
            },
          ],
        },
        {
          titulo: "O último rolo",
          texto:
            "Antes de partir, a caravana oferece um rolo de tecido como pagamento. A enfermaria precisa de panos limpos; o mercado pagaria Gold por um lote inteiro.",
          informacoes:
            "A construção do entreposto só está disponível se a vila não usou o padrão sem autorização.",
          arte: artes.fiandeiras,
          opcoes: [
            opcao(
              "tecido_enfermaria",
              "Entregar o rolo à enfermaria.",
              "A ervateira corta o tecido em faixas limpas. Os tecelões partem com o tear reparado.",
              { hp: 8, honra: 3 },
            ),
            opcao(
              "vender_rolo",
              "Vender o rolo no mercado.",
              "O rolo encontra comprador antes do meio-dia. A caravana segue sem outra oferta.",
              { gold: 6, honra: 1 },
            ),
            opcao(
              "construir_entreposto",
              "Abrir um entreposto para a próxima caravana.",
              "A vila prepara um espaço de troca junto ao portão. Ele rende 1 Gold a cada duas rodadas.",
              { gold: -3, honra: 2 },
              {
                requisitos: { flagsAusentes: ["tecelagem_padrao_sem_acordo"] },
                construcoes: ["entreposto_comercial"],
                marcoRodada: { id: "entrepostoComercialRodada" },
              },
            ),
          ],
        },
      ][indice];
      return etapa("caravana_teceles", n, { id, ...dados, requisitos: n === 1 ? { rodadaMin: 8 } : {} });
    }),
  ].flat();

  const transformacoes = [
    carta(
      "cambista_sem_balanca",
      "O cambista sem balança",
      "Na feira, um homem pesa moedas na palma aberta. Antes de você falar, calcula o custo de mandar uma carroça pela estrada do norte e aponta para a antiga casa de contas.",
      "Segui-lo abre uma sequência rara. Entregá-lo à guarda encerra a conversa.",
      artes.ouro,
      [
        opcao(
          "seguir_cambista",
          "Segui-lo até a casa de contas.",
          "O cambista fecha o livro e espera que você volte antes do próximo sino.",
          { gold: -1, honra: 1 },
          { flags: { olhos_mercurio_etapa2: true } },
        ),
        opcao(
          "entregar_cambista",
          "Entregá-lo à guarda.",
          "A guarda encontra uma balança escondida sob o manto. O cambista deixa de falar sobre a estrada.",
          { honra: 2 },
          { flags: { olhos_mercurio_encerrada: true } },
        ),
      ],
      { peso: 1.25, requisitos: { rodadaMin: 8, flagsAusentes: ["olhos_mercurio_encerrada"] } },
    ),
    carta(
      "vidro_sob_palpebra",
      "Vidro sob a pálpebra",
      "Na casa de contas, os livros estão cheios de números riscados e manchas antigas. O cambista mostra uma lente fina de mercúrio: diz que ela revela o preço em Gold e Vida escondido em cada decisão.",
      "Aceitar ativa Olhos de Mercúrio. A lente custa Gold e Vida; recusá-la encerra a sequência.",
      artes.lente,
      [
        opcao(
          "aceitar_lente",
          "Aceitar a lente e fixá-la sob a pálpebra.",
          "A lente se prende à pele. As próximas escolhas mostram quanto Gold e Vida podem custar.",
          { gold: -3, hp: -5 },
          {
            flags: { olhos_mercurio_ativo: true, olhos_mercurio_etapa3: true },
            marcoRodada: { id: "olhosMercurioInicio" },
          },
        ),
        opcao(
          "recusar_lente",
          "Recusar a lente e deixar a casa de contas.",
          "O cambista fecha o livro. A porta permanece aberta, mas a lente fica na mesa.",
          { honra: 1 },
          { flags: { olhos_mercurio_encerrada: true } },
        ),
      ],
      {
        peso: 1.5,
        requisitos: { flags: ["olhos_mercurio_etapa2"], flagsAusentes: ["olhos_mercurio_encerrada"] },
      },
    ),
    carta(
      "primeira_conta",
      "A primeira conta",
      "Uma carroça tombou na estrada. O mercador ferido oferece uma poção antes que você atravesse os destroços; a lente mostra o valor que cada gesto cobra.",
      "Olhos de Mercúrio exibe Gold e Vida em cada resultado, inclusive em testes de sorte.",
      artes.caravana,
      [
        opcao(
          "comprar_pocao_cambista",
          "Comprar a poção · 4 Gold.",
          "O mercador entrega o frasco e recebe as moedas com a mão ferida.",
          { gold: -4, hp: 12, honra: 1 },
          { flags: { olhos_mercurio_etapa4: true } },
        ),
        opcao(
          "abrir_caixa_cambista",
          "Abrir a caixa caída sem pagar.",
          "A poção ainda está inteira entre os cacos.",
          {},
          {
            flags: { olhos_mercurio_etapa4: true },
            testeSorte: {
              chance: 55,
              sucesso: { efeitos: { gold: 3, hp: 6 }, resultado: "Você alcança o frasco sem ferir a mão." },
              falha: {
                efeitos: { gold: -2, hp: -8 },
                resultado: "Os cacos cortam a palma antes que o frasco saia da caixa.",
              },
            },
          },
        ),
        opcao(
          "deixar_estrada",
          "Guardar a lente e seguir sem a poção.",
          "O mercador fecha a caixa. Você atravessa os destroços sem levar nada.",
          { hp: -5 },
          { flags: { olhos_mercurio_encerrada: true } },
        ),
      ],
      {
        peso: 2,
        requisitos: {
          flags: ["olhos_mercurio_ativo", "olhos_mercurio_etapa3"],
          flagsAusentes: ["olhos_mercurio_encerrada"],
        },
      },
    ),
    carta(
      "peso_da_visao",
      "O peso da visão",
      "Dezesseis rodadas depois, a lente começa a arder. Gotas de mercúrio escorrem pelo rosto quando você tenta dormir; a ervateira conhece um modo de removê-la.",
      "Retirar custa Gold, mas devolve forças. Manter a lente conserva a previsão das escolhas.",
      artes.lente,
      [
        opcao(
          "retirar_lente",
          "Pedir à ervateira que retire a lente · 2 Gold.",
          "A operação termina antes do amanhecer. A lente deixa de mostrar custos, e você recupera algumas forças.",
          { gold: -2, hp: 5, honra: 2 },
          { flags: { olhos_mercurio_ativo: false, olhos_mercurio_encerrada: true } },
        ),
        opcao(
          "manter_lente",
          "Manter a lente e suportar a dor.",
          "A ervateira cobre a ferida. A lente permanece, e os custos continuam visíveis.",
          { hp: -5, honra: -1 },
          { flags: { olhos_mercurio_encerrada: true } },
        ),
      ],
      {
        peso: 1.5,
        requisitos: {
          flags: ["olhos_mercurio_ativo", "olhos_mercurio_etapa4"],
          flagsAusentes: ["olhos_mercurio_encerrada"],
          rodadasDesde: { olhosMercurioInicio: 16 },
        },
      },
    ),
    carta(
      "olho_no_reboco",
      "O olho no reboco",
      "Ao derrubar uma parede de uma casa vazia, os pedreiros encontram um olho dourado preso entre as pedras. A pupila se move quando alguém fala; do outro lado, uma voz dá o nome de uma família que ainda não chegou.",
      "Levar a relíquia à ervateira inicia a investigação. Cobri-la com argamassa encerra o assunto.",
      artes.olho,
      [
        opcao(
          "examinar_olho",
          "Levar a relíquia à ervateira.",
          "A ervateira tenta separar o olho do reboco, mas a peça não se solta.",
          { gold: -1, honra: 1 },
          { flags: { olho_mil_nomes_etapa2: true } },
        ),
        opcao(
          "cobrir_olho",
          "Cobrir o olho com argamassa e fechar a parede.",
          "A voz para quando o último buraco é coberto. A parede volta a ficar lisa.",
          { gold: -2, honra: 2 },
          { flags: { olho_mil_nomes_encerrado: true } },
        ),
      ],
      { peso: 1.25, requisitos: { rodadaMin: 8, flagsAusentes: ["olho_mil_nomes_encerrado"] } },
    ),
    carta(
      "olho_dos_mil_nomes",
      "O Olho dos Mil Nomes",
      "A ervateira não consegue separar a relíquia do reboco. Quando você a toca, o olho dourado se fixa sobre sua testa. As vozes deixam de vir da parede; agora anunciam quantas pessoas uma escolha pode trazer à vila.",
      "Aceitar ativa o Olho dos Mil Nomes. Ele mostra ganhos de Habitantes, nunca a quantidade perdida.",
      artes.olho,
      [
        opcao(
          "aceitar_olho_nomes",
          "Aceitar a transformação.",
          "As vozes acompanham cada decisão. A lente dourada fica presa à pele.",
          { gold: -2, hp: -5 },
          {
            flags: { olho_mil_nomes_ativo: true, olho_mil_nomes_etapa3: true },
            marcoRodada: { id: "olhoMilNomesInicio" },
          },
        ),
        opcao(
          "enterrar_olho",
          "Arrancar a relíquia e enterrá-la.",
          "A ervateira cobre a peça com terra e fecha a caixa. As vozes cessam na mesma hora.",
          { honra: 1 },
          { flags: { olho_mil_nomes_encerrado: true } },
        ),
      ],
      {
        peso: 1.5,
        requisitos: { flags: ["olho_mil_nomes_etapa2"], flagsAusentes: ["olho_mil_nomes_encerrado"] },
      },
    ),
    carta(
      "fila_no_portao",
      "A fila no portão",
      "Uma família chega depois de perder a casa numa tempestade. O Olho conta quatro vozes entre os viajantes e diz que todas podem ficar se a vila abrir espaço.",
      "A transformação mostra apenas ganhos positivos de Habitantes; uma perda aparece como “sem ganho de Habitantes”.",
      artes.vila,
      [
        opcao(
          "acolher_familia_olho",
          "Acolher a família e abrir uma casa vazia.",
          "A família entra antes do anoitecer. Quatro nomes passam a constar no registro da vila.",
          { habitantes: 4, gold: -3, honra: 2 },
          { flags: { olho_mil_nomes_etapa4: true } },
        ),
        opcao(
          "mandar_familia_adiante",
          "Mandar a família seguir para outra vila.",
          "A guarda acompanha os viajantes até a estrada. O Olho não repete os nomes.",
          { habitantes: -2, honra: -2 },
          { flags: { olho_mil_nomes_etapa4: true } },
        ),
        opcao(
          "recusar_oraculo",
          "Pedir que o Olho se cale e recusar sua orientação.",
          "As vozes cessam por uma noite. A relíquia permanece, e o herdeiro decide sem ela.",
          { hp: -2 },
          { flags: { olho_mil_nomes_encerrado: true } },
        ),
      ],
      {
        peso: 2,
        requisitos: {
          flags: ["olho_mil_nomes_ativo", "olho_mil_nomes_etapa3"],
          flagsAusentes: ["olho_mil_nomes_encerrado"],
        },
      },
    ),
    carta(
      "olho_pede_silencio",
      "O olho pede silêncio",
      "Dezesseis rodadas depois, as vozes continuam mesmo quando ninguém chega ao portão. A ervateira encontra um ritual capaz de soltar o Olho, mas a escolha final é sua.",
      "Remover a relíquia custa Gold, mas devolve forças. Aceitá-la conserva as previsões de Habitantes.",
      artes.olho,
      [
        opcao(
          "remover_olho_nomes",
          "Remover a relíquia com o ritual da ervateira · 2 Gold.",
          "O olho cai sobre o pano. As vozes somem, e a ervateira fecha a ferida.",
          { gold: -2, hp: 5, honra: 2 },
          { flags: { olho_mil_nomes_ativo: false, olho_mil_nomes_encerrado: true } },
        ),
        opcao(
          "aceitar_olho_nomes",
          "Aceitar o Olho como parte de você.",
          "A ervateira guarda o ritual. As vozes continuam, agora sem interromper seu sono.",
          { hp: -5, honra: -1 },
          { flags: { olho_mil_nomes_encerrado: true } },
        ),
      ],
      {
        peso: 1.5,
        requisitos: {
          flags: ["olho_mil_nomes_ativo", "olho_mil_nomes_etapa4"],
          flagsAusentes: ["olho_mil_nomes_encerrado"],
          rodadasDesde: { olhoMilNomesInicio: 16 },
        },
      },
    ),
  ];

  Jogo.registrarEventos(...comuns, ...cadeias, ...transformacoes);
})();
