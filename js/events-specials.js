(function () {
  "use strict";
  const Jogo = window.Jogo;
  const flag = id => ({ [`${id}_visto`]: true });
  const escolha = (id, texto, efeitos, resultado, extra = {}) => ({ id, texto, efeitos, resultado, ...extra });

  const dialogosMercador = [
    escolha("D01", "Pegar o envelope de imediato, com um sorriso.", { honra: -1 }, "O mercador entrega o envelope, mas sua pressa deixa a recepção fria.", { flags: { ano_novo_visto: true, ano_novo_recusado: true } }),
    escolha("D02", "Recusar duas vezes, por cortesia, e aceitar com as duas mãos.", { gold: 5, honra: 2 }, "O mercador sorri. Diz que a fortuna do novo ano passará pela vila e voltará a cada ciclo.", { flags: { ano_novo_visto: true, ano_novo_ativo: true } }),
    escolha("D03", "Abrir o envelope diante dele para contar o conteúdo.", { gold: 2, honra: -3 }, "As moedas são contadas diante do mercador, que parte sem se despedir.", { flags: { ano_novo_visto: true, ano_novo_recusado: true } }),
    escolha("D04", "Oferecer-lhe um sino pequeno de bronze.", { honra: -2 }, "O mercador aceita o sino por educação e o deixa na carroça ao partir.", { flags: { ano_novo_visto: true, ano_novo_recusado: true } }),
    escolha("D05", "Pagar com quatro moedas de prata, para ser justo.", { gold: -1, honra: -2 }, "O mercador devolve uma moeda e parte em silêncio.", { requisitos: { goldMin: 1 }, flags: { ano_novo_visto: true, ano_novo_recusado: true } }),
    escolha("D06", "Recebê-lo vestido de branco, na porta.", { honra: -2 }, "Ele entrega o envelope sem sorrir e segue caminho.", { flags: { ano_novo_visto: true, ano_novo_recusado: true } }),
    escolha("D07", "Cortar o macarrão que ele oferece, para facilitar.", { honra: -2, hp: -2 }, "A tigela cai. Você escorrega no caldo e o mercador parte constrangido.", { flags: { ano_novo_visto: true, ano_novo_recusado: true } }),
    escolha("D08", "Apontar para a carga e perguntar o preço.", { honra: -1 }, "Ele explica que nada está à venda hoje e parte.", { flags: { ano_novo_visto: true, ano_novo_recusado: true } }),
    escolha("D09", "Fincar os palitos no arroz, em sinal de respeito.", { honra: -3 }, "O mercador retira os palitos com cuidado e deixa a mesa intocada.", { flags: { ano_novo_visto: true, ano_novo_recusado: true } }),
    escolha("D10", "Pedir que deixe o pacote e vá embora.", { gold: 1, honra: -2 }, "Ele deixa o pacote com uma moeda dentro e parte. Os moradores comentam sua pressa.", { flags: { ano_novo_visto: true, ano_novo_recusado: true } }),
    escolha("D11", "Dividir uma pêra com ele, em sinal de amizade.", { honra: -1 }, "O mercador aceita um pedaço, guarda o restante e encerra a conversa pouco depois.", { flags: { ano_novo_visto: true, ano_novo_recusado: true } })
  ];

  const animais = [
    { id: "boi", titulo: "O ano do Boi", nome: "Boi", cena: "Uma carta vermelha mostra um boi de chifres largos arando sozinho um campo sem fim.", info: "A carta fala de esforço que se paga com o tempo.", imagem: "boi", opcoes: [
      escolha("aceitar", "Aceitar a fortuna do Boi.", { escudo: 2, habitantes: 3 }, "Os campos rendem mais e os braços ficam. Seu escudo parece mais firme."),
      escolha("oferenda", "Oferecer grãos ao Boi · 3 gold", { escudo: 3, habitantes: 5 }, "Cinco famílias pedem terra para cultivar.", { requisitos: { goldMin: 3 } }),
      escolha("guardar", "Guardar a carta sem usá-la.", { honra: 2 }, "A carta desbota um pouco na gaveta.")
    ] },
    { id: "tigre", titulo: "O ano do Tigre", nome: "Tigre", cena: "Um tigre de olhos atentos está imóvel na neve, pintado numa carta que cheira a floresta distante.", info: "A carta pede coragem, mas não diz de que tipo.", imagem: "tigre", opcoes: [
      escolha("aceitar", "Aceitar a fortuna do Tigre.", { ataque: 2 }, "Seus passos ficam mais leves e o olhar, mais firme."),
      escolha("desafiar", "Encarar o Tigre da carta.", { ataque: 3, hp: -10 }, "Você mantém o olhar até o papel arder nos dedos; fica ferido e mais forte."),
      escolha("guardar", "Guardar a carta sem usá-la.", { honra: 2 }, "À noite algo caminha devagar pelo corredor e se afasta.")
    ] },
    { id: "coelho", titulo: "O ano do Coelho", nome: "Coelho", cena: "Um coelho branco olha para a lua numa carta vermelha; ao lado, um campo quieto espera a primavera.", info: "A carta sugere descanso e crescimento.", imagem: "coelho", opcoes: [
      escolha("aceitar", "Aceitar a fortuna do Coelho.", { habitantes: 5 }, "Casas vazias voltam a ter fumaça na primavera."),
      escolha("oferenda", "Deixar uma cenoura à porta · 2 gold", { habitantes: 8, gold: -2 }, "Oito pessoas chegam à vila ao longo da semana.", { requisitos: { goldMin: 2 } }),
      escolha("descansar", "Descansar sob a lua.", { hp: 15 }, "Ao acordar, as dores do corpo parecem pertencer a outra pessoa.")
    ] },
    { id: "dragao", titulo: "O ano do Dragão", nome: "Dragão", cena: "Um dragão de bigodes longos atravessa nuvens pintadas em ouro gasto e escarlate; o papel está morno ao toque.", info: "A carta anuncia uma sorte rara. Rara demais para ser desperdiçada.", imagem: "dragao", opcoes: [
      escolha("aceitar", "Aceitar a fortuna do Dragão.", { gold: 10, honra: 3 }, "Um mercador paga uma dívida antiga que você já dava por perdida."),
      escolha("taca", "Erguer a taça ao Dragão.", { gold: 20, ataque: 1, escudo: 1, honra: 5 }, "A taça esquenta em suas mãos e uma força antiga passa por seus ombros.", { requisitos: { honraMin: 30 } }),
      escolha("saude", "Pedir apenas saúde.", { hp: 20 }, "Seus ferimentos cicatrizam mais depressa que o normal.")
    ] },
    { id: "cavalo", titulo: "O ano do Cavalo", nome: "Cavalo", cena: "Um cavalo de crina solta corre numa carta de papel; no estábulo, os animais relincham juntos.", info: "A carta fala de jornadas e de pressa.", imagem: "cavalo", opcoes: [
      escolha("aceitar", "Aceitar a fortuna do Cavalo.", { hp: 10, gold: 8 }, "Uma caravana chega cedo e paga bem pelo pouso."),
      escolha("cavalgar", "Cavalgar até o fim da estrada.", { gold: 15, hp: -5 }, "Você volta com poeira nas botas e uma bolsa mais pesada."),
      escolha("guardar", "Guardar a carta sem usá-la.", { honra: 2 }, "A carta fica ao lado da sela; os cavalos parecem agradecer.")
    ] },
    { id: "galo", titulo: "O ano do Galo", nome: "Galo", cena: "Um galo de bico erguido canta sob a janela enquanto a primeira luz alcança o salão.", info: "A carta pede atenção ao que vem antes da aurora.", imagem: "galo", opcoes: [
      escolha("aceitar", "Aceitar a fortuna do Galo.", { ataque: 1, escudo: 1 }, "Você treina ao nascer do sol; os guardas passam a imitar sua rotina."),
      escolha("treinar", "Treinar com o galo ao amanhecer · 2 gold", { ataque: 2, escudo: 2, gold: -2 }, "Por duas semanas, um instrutor disciplina a guarda.", { requisitos: { goldMin: 2 } }),
      escolha("dormir", "Dormir até mais tarde.", { hp: 10 }, "Você dorme bem e acorda disposto.")
    ] },
    { id: "cao", titulo: "O ano do Cão", nome: "Cão", cena: "Um cão magro de olhos mansos senta ao portão, segue você até o salão e deita aos seus pés.", info: "A carta fala de lealdade, e o cão parece conhecê-la bem.", imagem: "cao", opcoes: [
      escolha("aceitar", "Aceitar a fortuna do Cão.", { habitantes: 4, honra: 3 }, "Quatro famílias decidem ficar ao ver as crianças seguindo o cão."),
      escolha("alimentar", "Alimentar o cão com sua mesa · 3 gold", { habitantes: 6, honra: 4, gold: -3 }, "O cão dorme à soleira e seis pessoas se juntam à vila.", { requisitos: { goldMin: 3 } }),
      escolha("povo", "Deixar o cão com o povo.", { honra: 2 }, "O cão segue para a praça e adota uma criança.")
    ] },
    { id: "porco", titulo: "O ano do Porco", nome: "Porco", cena: "Um porco gordo dorme ao sol sobre uma carta. O cozinheiro jura que não o trouxe até ali.", info: "A carta fala de fartura; a cozinha confirma o cheiro.", imagem: "porco", opcoes: [
      escolha("aceitar", "Aceitar a fortuna do Porco.", { hp: 15, gold: 5 }, "A despensa se enche sem explicação e você come melhor que em semanas."),
      escolha("banquete", "Oferecer um banquete ao povo · 3 gold", { hp: 25, habitantes: 6, gold: -3 }, "Seis viajantes sentam à mesa e esquecem a estrada.", { requisitos: { goldMin: 3 } }),
      escolha("guardar", "Guardar a carta sem usá-la.", { honra: 2 }, "O porco acorda, olha para você com desdém e volta a dormir.")
    ] },
    { id: "rato", titulo: "O ano do Rato", nome: "Rato", cena: "Um rato de olhos vivos carrega um grão de arroz; sombras pequenas cruzam sob a porta do celeiro.", info: "A carta fala de astúcia, e ninguém sabe a quem ela pertence.", imagem: "rato", opcoes: [
      escolha("aceitar", "Aceitar a fortuna do Rato.", { habitantes: -3, gold: -4 }, "Os ratos levam moedas e grãos; três famílias partem sem pão."),
      escolha("oferenda", "Oferecer grãos aos ratos · 3 gold", { gold: -3, habitantes: -1 }, "A oferta poupa o resto do celeiro; uma família ainda parte.", { requisitos: { goldMin: 3 } }),
      escolha("cacar", "Caçar os ratos pessoalmente.", { honra: 1, hp: -6 }, "A noite é longa e suja. Você sai mordido, mas o celeiro está limpo.")
    ] },
    { id: "serpente", titulo: "O ano da Serpente", nome: "Serpente", cena: "Uma serpente fina repousa sobre a carta e ergue a cabeça como se medisse uma refeição.", info: "A carta fala de segredos; alguém na vila guarda um.", imagem: "serpente", opcoes: [
      escolha("aceitar", "Aceitar a fortuna da Serpente.", { hp: -10, honra: -3 }, "Uma mordida o derruba por dois dias; ao acordar, rumores percorrem a vila."),
      escolha("silencio", "Comprar o silêncio da serpente · 4 gold", { gold: -4, hp: -4 }, "A serpente aceita o pagamento. A mordida é leve, mas ninguém explica o motivo.", { requisitos: { goldMin: 4 } }),
      escolha("desafiar", "Encarar a serpente.", { honra: 3, hp: -6 }, "A serpente cede depois de morder seu braço.", { requisitos: { honraMin: 30 } })
    ] },
    { id: "macaco", titulo: "O ano do Macaco", nome: "Macaco", cena: "Um macaco inteligente senta no telhado com a carta enrolada na cauda e objetos perdidos ao redor.", info: "A carta fala de travessura; o macaco parece orgulhoso.", imagem: "macaco", opcoes: [
      escolha("aceitar", "Aceitar a fortuna do Macaco.", { gold: -5, honra: -2 }, "O macaco leva sua bolsa e a vila ri de você por uma semana."),
      escolha("banana", "Dar-lhe uma banana · 1 gold", { gold: -1, honra: -1 }, "O macaco aceita a oferta, devolve a bolsa e some.", { requisitos: { goldMin: 1 } }),
      escolha("cacar", "Caçar o macaco.", { gold: 2, hp: -5 }, "A caçada termina em tombo e arranhões; o macaco foge e deixa moedas.")
    ] },
    { id: "cabra", titulo: "O ano da Cabra", nome: "Cabra", cena: "Uma cabra solitária olha para longe do rebanho; na carta, ela está sob a chuva sem abrigo.", info: "A carta fala de afastamento. Alguns moradores parecem ouvir o mesmo chamado.", imagem: "cabra", opcoes: [
      escolha("aceitar", "Aceitar a fortuna da Cabra.", { habitantes: -4, gold: -2 }, "Quatro famílias seguem pela estrada em busca de pasto mais verde."),
      escolha("procurar", "Procurar o rebanho disperso.", { hp: -8, habitantes: -1 }, "Você caminha pelas colinas e recupera quase todos os animais."),
      escolha("dividir", "Dividir o pasto da vila com os desgarrados.", { honra: 2, habitantes: -2 }, "Duas famílias seguem a cabra; as outras ficam agradecidas.", { requisitos: { honraMin: 30 } })
    ] }
  ];

  const dialogosNorte = [
    escolha("E01", "Perguntar quem ele é e o que quer, antes de abrir o portão.", { honra: -1 }, "O viajante toma o frio como resposta, ergue o cajado e segue sem olhar para trás.", { flags: { bencao_norte_visto: true, bencao_norte_recusada: true } }),
    escolha("E02", "Oferecer um lugar junto ao fogo e uma tigela de comida, sem perguntar nada até ele terminar.", { hp: 8, honra: 2 }, "Ele come em silêncio e agradece ao fogo. Ao amanhecer, parte deixando uma runa gravada na porta.", { flags: { bencao_norte_visto: true, bencao_norte_ativa: true } }),
    escolha("E03", "Cobrar uma moeda pelo pouso.", { gold: 1, honra: -3 }, "O viajante paga devagar. Pela manhã, a cama está intacta e a porta, aberta.", { flags: { bencao_norte_visto: true, bencao_norte_recusada: true } }),
    escolha("E04", "Oferecer água fria, que é o que se serve a estranhos.", { honra: -2 }, "Ele bebe, olha para o fogo ao fundo e parte em silêncio.", { flags: { bencao_norte_visto: true, bencao_norte_recusada: true } }),
    escolha("E05", "Desembainhar a espada para mostrar quem manda.", { honra: -3, hp: -3 }, "O frio aumenta ao redor. Você sente um corte de gelo no braço e ele parte.", { flags: { bencao_norte_visto: true, bencao_norte_recusada: true } }),
    escolha("E06", "Mandar os guardas revistarem a bagagem dele.", { honra: -2 }, "Nada é encontrado. O viajante recolhe a trouxa e parte.", { flags: { bencao_norte_visto: true, bencao_norte_recusada: true } }),
    escolha("E07", "Brindar com ele, mas sem beber da taça.", { honra: -1 }, "Ele reconhece a desconfiança, bebe sozinho e parte antes do próximo brinde.", { flags: { bencao_norte_visto: true, bencao_norte_recusada: true } }),
    escolha("E08", "Dizer que os deuses dele não têm poder aqui.", { honra: -3 }, "Ele assente devagar. Ao partir, os corvos da torre voam atrás dele.", { flags: { bencao_norte_visto: true, bencao_norte_recusada: true } }),
    escolha("E09", "Pedir que deixe as armas fora da casa e durma no estábulo.", { honra: -2 }, "O viajante parte antes do sol. Os cavalos ficam inquietos por dias.", { flags: { bencao_norte_visto: true, bencao_norte_recusada: true } }),
    escolha("E10", "Dizer que o inverno foi duro e que ele deve partir antes que a comida acabe.", { honra: -2 }, "O viajante curva a cabeça e parte. A vila sente uma estranha vergonha.", { flags: { bencao_norte_visto: true, bencao_norte_recusada: true } }),
    escolha("E11", "Pedir que ele cante para pagar pela comida.", { honra: -1 }, "Ele canta uma estrofe curta e parte antes do fim da refeição.", { flags: { bencao_norte_visto: true, bencao_norte_recusada: true } })
  ];

  const divindades = [
    { id: "bencao_thor", title: "O martelo do trovão", name: "Thor", kind: "bencao", image: "thor", scene: "Um trovão rompe o céu limpo. Um martelo que você nunca viu repousa por um instante em suas mãos e desaparece.", info: "O trovão anuncia força e rapidez. Os moradores guardam silêncio.", options: [
      ["Receber o martelo do trovão.", "A força do trovão percorre seus braços.", { modificadores: { ataque: 3 } }],
      ["Oferecer seu sangue ao martelo.", "O sangue fumega ao tocar o metal; o trovão responde.", { modificadores: { ataque: 5 }, custo: { hp: -10 } }],
      ["Recusar com respeito.", "O trovão se afasta sem raiva.", { recusar: true }]
    ] },
    { id: "bencao_odin", title: "Os corvos na janela", name: "Odin", kind: "bencao", image: "odin", scene: "Dois corvos pousam na janela do salão. Um terceiro olho, que não é de corvo, observa do fundo da sombra.", info: "Os corvos anunciam sabedoria, e a sabedoria costuma cobrar um preço.", options: [
      ["Aceitar o olhar de Odin.", "Uma dor aguda atravessa sua cabeça e cada decisão passa a ter um peso visível.", { revealHonra: true, custo: { hp: -3 } }],
      ["Oferecer ouro aos corvos · 6 gold", "Duas penas ficam na janela; você passa a ver mais, e tudo tem um preço.", { revealHonra: true, revealHabitantes: true, custo: { gold: -6 }, requisitos: { goldMin: 6 } }],
      ["Recusar com respeito.", "Os corvos partem sem levar nada.", { recusar: true }]
    ] },
    { id: "bencao_freya", title: "Flores na muralha", name: "Freya", kind: "bencao", image: "freya", scene: "Flores amarelas abrem caminho entre as pedras. Uma mulher de manto de falcão observa do campo e desaparece ao vento.", info: "A vila floresce onde antes havia apenas terra escura.", options: [
      ["Receber a bênção de Freya.", "As casas se enchem aos poucos, e os canteiros não voltam a ficar vazios.", { porRodada: { aCada: 2, efeitos: { habitantes: 1 } } }],
      ["Preparar uma festa de flores · 3 gold", "A festa dura uma noite; novas famílias chegam a cada manhã.", { porRodada: { efeitos: { habitantes: 1 } }, custo: { gold: -3 }, requisitos: { goldMin: 3 } }],
      ["Recusar com respeito.", "O vento leva as pétalas sem protesto.", { recusar: true }]
    ] },
    { id: "bencao_tyr", title: "A mão e a balança", name: "Týr", kind: "bencao", image: "tyr", scene: "Uma mão de ferro repousa sobre a mesa. A espada junto dela está partida, mas a balança não pende para lado algum.", info: "Uma promessa pesa tanto quanto o braço que a sustenta.", options: [
      ["Receber a bênção de Týr.", "A postura se firma quando o próximo golpe chega.", { reducaoDano: 5 }],
      ["Jurar com a mão sobre a mesa.", "O juramento deixa uma cicatriz na palma e protege ainda mais.", { reducaoDano: 8, custo: { hp: -6 } }],
      ["Recusar com respeito.", "A balança permanece imóvel.", { recusar: true }]
    ] },
    { id: "bencao_njord", title: "O peixe de prata", name: "Njord", kind: "bencao", image: "njord", scene: "O cheiro do mar chega à vila. Em cada barril de água, um peixe prateado nada em círculos.", info: "A água parece conter algo além de água.", options: [
      ["Receber a bênção de Njord.", "Moedas aparecem no fundo dos baldes, nas redes e dentro dos pães.", { porRodada: { efeitos: { gold: 1 } } }],
      ["Oferecer parte da pesca · 2 gold", "Os peixes somem; em compensação, os bolsos ficam pesados.", { porRodada: { efeitos: { gold: 2 } }, custo: { gold: -2 }, requisitos: { goldMin: 2 } }],
      ["Recusar com respeito.", "Os peixes voltam à água sem pressa.", { recusar: true }]
    ] },
    { id: "bencao_idunn", title: "Maçãs à porta", name: "Iðunn", kind: "bencao", image: "idunn", scene: "Uma mulher de olhar jovem e mãos antigas deixa uma cesta de maçãs na porta. Ninguém a viu chegar.", info: "A cesta só se esvazia quando alguém come.", options: [
      ["Comer uma maçã dourada.", "As dores do corpo vão embora uma a uma, a cada manhã.", { porRodada: { efeitos: { hp: 2 } } }],
      ["Comer três maçãs · 3 gold", "A mulher recolhe as moedas. As frutas desaparecem e seu corpo parece de outra idade.", { porRodada: { efeitos: { hp: 4 } }, custo: { gold: -3 }, requisitos: { goldMin: 3 } }],
      ["Recusar com respeito.", "A mulher recolhe a cesta e desaparece na neblina.", { recusar: true }]
    ] },
    { id: "maldicao_loki", title: "A risada no corredor", name: "Loki", kind: "maldicao", image: "loki", scene: "Uma risada ecoa nos corredores. Sapatos aparecem amarrados, o vinho vira água e o anel do cofre muda de bolso.", info: "A brincadeira é cruel e cheira a enxofre.", options: [
      ["Suportar a brincadeira.", "As moedas somem de lugares que ninguém sabe.", { porRodada: { efeitos: { gold: -1 } }, custo: { honra: -2 } }],
      ["Pagar o tributo ao trapaceiro · 2 gold", "A risada diminui aos poucos; algo de valor é devolvido, mas nunca o bastante.", { porRodada: { efeitos: { gold: -1 } }, custo: { gold: -2 }, duracao: 5, requisitos: { goldMin: 2 } }],
      ["Desmascarar o truque.", "Você aponta o canto de onde nasce o riso. Algo se parte, e o salão silencia.", { desafio: true, custo: { hp: -4 }, requisitos: { honraMin: 50 } }]
    ] },
    { id: "maldicao_hel", title: "O frio no salão", name: "Hel", kind: "maldicao", image: "hel", scene: "Metade do rosto de uma mulher emerge na sombra, uma parte viva e a outra cinzenta. O ar cheira a pedra fria.", info: "O frio é verdadeiro. Cada respiração custa mais.", options: [
      ["Suportar o frio.", "A cada manhã, você desperta mais pálido e com os dedos mais frios.", { porRodada: { efeitos: { hp: -2 } } }],
      ["Acender velas aos mortos · 3 gold", "As velas queimam a noite inteira; a mulher aceita a oferta em silêncio.", { porRodada: { efeitos: { hp: -2 } }, custo: { gold: -3 }, duracao: 5, requisitos: { goldMin: 3 } }],
      ["Recusar-se a seguir pelo portão dos mortos.", "Você planta os pés. O frio recua e a mulher some.", { desafio: true, custo: { hp: -8 }, requisitos: { honraMin: 50 } }]
    ] },
    { id: "maldicao_skadi", title: "A caçadora na muralha", name: "Skadi", kind: "maldicao", image: "skadi", scene: "Uma caçadora de arco longo observa do alto da muralha. A neve começa a cair apesar do céu limpo.", info: "A geada se instala nas paredes e nas armaduras.", options: [
      ["Suportar a geada.", "As armaduras racham ao menor golpe e os escudos pesam como gelo.", { modificadores: { escudo: -3 } }],
      ["Acender fogueiras nas muralhas · 3 gold", "As fogueiras ardem a noite inteira e a caçadora parte antes do amanhecer.", { modificadores: { escudo: -3 }, custo: { gold: -3 }, duracao: 5, requisitos: { goldMin: 3 } }],
      ["Subir à muralha e encará-la.", "Você sobe sem armadura. A caçadora abaixa o arco e a neve para.", { desafio: true, custo: { hp: -8 }, requisitos: { honraMin: 50 } }]
    ] },
    { id: "maldicao_surtr", title: "O horizonte vermelho", name: "Surtr", kind: "maldicao", image: "surtr", scene: "O horizonte avermelha. Um gigante com espada em chamas surge entre nuvens e deixa cheiro de fumaça.", info: "O cheiro de queimado persiste nas casas e nos campos.", options: [
      ["Suportar o calor.", "Pequenos incêndios surgem sem causa e famílias partem em busca de terras frescas.", { porRodada: { aCada: 2, efeitos: { habitantes: -1 } } }],
      ["Cavar valas contra o fogo.", "As valas seguram a maior parte das chamas, mas o trabalho cobra suas costas.", { porRodada: { aCada: 2, efeitos: { habitantes: -1 } }, custo: { hp: -6 }, duracao: 5 }],
      ["Apagar o fogo ao lado do povo.", "Você carrega baldes até as mãos racharem. Os moradores passam a chamá-lo de outra coisa.", { desafio: true, custo: { hp: -10 }, honra: 3, requisitos: { honraMin: 50 } }]
    ] },
    { id: "maldicao_hodr", title: "O homem vendado", name: "Höðr", kind: "maldicao", image: "hodr", scene: "Um homem de olhos vendados caminha pela praça. Um dardo de visco cai de sua mão sem que perceba.", info: "O visco é pequeno, mas ele diz que já matou um deus.", options: [
      ["Suportar a escuridão.", "Seus golpes erram por dedos e as sombras parecem se mover no canto do olho.", { modificadores: { ataque: -3 } }],
      ["Guiar-se pelo som · 2 gold", "Você paga um menino para ser seus olhos até que a escuridão passe.", { modificadores: { ataque: -3 }, custo: { gold: -2 }, duracao: 5, requisitos: { goldMin: 2 } }],
      ["Enxergar sem olhos.", "Você fecha os olhos e vê tudo com clareza. O homem vendado assente e parte.", { desafio: true, custo: { hp: -6 }, requisitos: { honraMin: 50 } }]
    ] },
    { id: "maldicao_ran", title: "A rede sobre os telhados", name: "Rán", kind: "maldicao", image: "ran", scene: "Uma rede escura aparece sobre o telhado, pingando água salgada. As moedas do bolso parecem mais leves.", info: "A rede continua lá, embora ninguém mais a veja.", options: [
      ["Suportar a rede.", "As moedas escorrem pelos dedos antes de chegar ao cofre.", { reducaoGanhoGold: 2 }],
      ["Lançar ouro ao mar · 3 gold", "Você lança moedas no rio, que as engole sem barulho; a rede escurece e se afasta.", { reducaoGanhoGold: 2, custo: { gold: -3 }, duracao: 5, requisitos: { goldMin: 3 } }],
      ["Cortar a rede com a espada.", "A lâmina atravessa algo que não é ar. A rede se desfaz em água.", { desafio: true, custo: { hp: -8 }, requisitos: { honraMin: 50 } }]
    ] }
  ];

  const marcarDivino = (evento, opcao) => ({
    ...opcao,
    flags: { ...opcao.flags, [`${evento.id}_visto`]: true },
    ...(opcao.efeitoDivino ? {} : {})
  });

  const zodiacos = animais.map(animal => ({
    id: `zodiaco_${animal.id}`, titulo: animal.titulo, tipo: "especial", peso: 2, especial: true, zodiaco: true,
    imagem: `assets/eventos-especiais/zodiaco-${animal.imagem}.svg`, imagemAlt: `Ilustração própria do ${animal.nome} do zodíaco, em traços brancos sobre fundo preto`,
    texto: animal.cena, informacoes: animal.info,
    opcoes: animal.opcoes.map(opcao => ({ ...opcao, flags: { ...opcao.flags, ...flag(`zodiaco_${animal.id}`) } }))
  }));

  const deuses = divindades.map(deus => {
    const maldicao = deus.kind === "maldicao";
    const options = deus.options.map(([texto, resultado, efeito], indice) => {
      const custo = efeito.custo || {};
      const extra = {};
      if (efeito.requisitos) extra.requisitos = efeito.requisitos;
      if (efeito.recusar) { extra.efeitos = { honra: 2 }; extra.resultado = resultado; return marcarDivino(deus, escolha("recusar", texto, extra.efeitos, resultado, extra)); }
      if (efeito.desafio) { extra.efeitos = { ...(custo.hp ? { hp: custo.hp } : {}), ...(efeito.honra ? { honra: efeito.honra } : {}), honra: efeito.honra || 2 }; extra.resultado = resultado; return marcarDivino(deus, escolha("desafiar", texto, extra.efeitos, resultado, extra)); }
      if (Object.keys(custo).length) extra.efeitos = custo;
      if (efeito.modificadores || efeito.porRodada || efeito.reducaoDano || efeito.reducaoGanhoGold || efeito.revealHonra || efeito.revealHabitantes) {
        const duracao = efeito.duracao || 10;
        extra.efeitoDivino = {
          nome: deus.name, duracao, modificadores: efeito.modificadores,
          porRodada: efeito.porRodada, reducaoDano: efeito.reducaoDano,
          reducaoGanhoGold: efeito.reducaoGanhoGold,
          revelarHonraRodadas: efeito.revealHonra ? duracao : 0,
          revelarHabitantesRodadas: efeito.revealHabitantes ? duracao : 0
        };
      }
      extra.resultado = resultado;
      return marcarDivino(deus, escolha(indice === 0 ? "aceitar" : indice === 1 ? (maldicao ? "tributo" : "sacrificio") : "desafiar", texto, extra.efeitos, resultado, extra));
    });
    return {
      id: deus.id, titulo: deus.title, tipo: "especial", peso: 1.5, especial: true, divino: true,
      natureza: deus.kind, pesos: [{ requisitos: { honra: maldicao ? "baixa" : "alta" }, valor: 3 }],
      imagem: `assets/eventos-especiais/norte-${deus.image}.svg`, imagemAlt: `Ilustração própria de ${deus.name}, em traços brancos sobre fundo preto`,
      texto: deus.scene, informacoes: deus.info, opcoes: options
    };
  });

  Jogo.eventos.push(
    {
      id: "mercador_chines", titulo: "O mercador de vermelho", tipo: "especial", peso: 1, especial: true,
      apenasAposTipo: "mercador", chanceAposAnterior: 0.25,
      imagem: "assets/eventos-especiais/mercador-vermelho.svg", imagemAlt: "Mercador diante de uma carroça com lanternas e envelope vermelho",
      texto: "Logo após o mercador da estrada partir, outra carroça passa pelo portão, coberta de lanternas de papel. O dono desce com um envelope vermelho e espera que você diga a primeira palavra.",
      informacoes: "O mercador observa seus modos mais do que suas palavras. Uma resposta demonstra a cortesia que ele espera.",
      opcaoCorreta: "D02", poolOpcoes: dialogosMercador
    },
    ...zodiacos,
    {
      id: "emissario_do_norte", titulo: "O viajante do Norte", tipo: "especial", peso: 3, especial: true,
      apenasAposIds: ["geada", "inverno_longo"],
      imagem: "assets/eventos-especiais/viajante-norte.svg", imagemAlt: "Viajante de manto de pele junto a um fogo e apoiado em um cajado",
      texto: "Quando o gelo cede, um viajante de manto de pele bate ao portão com a ponta do cajado. Está há dias sem comer, mas permanece de pé. Os cães ficam em silêncio.",
      informacoes: "Ele diz que carrega o favor de deuses antigos. Uma das respostas o acolhe da forma que espera.",
      opcaoCorreta: "E02", poolOpcoes: dialogosNorte
    },
    ...deuses
  );
})();
