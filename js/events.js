(function () {
  "use strict";
  const Jogo = window.Jogo = window.Jogo || {};

  // Eventos de exemplo. Textos, pesos, danos e efeitos podem ser balanceados aqui.
  // Respostas condicionais são filtradas antes de renderizar; algumas cartas têm quatro.
  // O comércio oferece suas mercadorias separadamente, com uma resposta para seguir.
  Jogo.eventos = [
    {
      id: "caixas_suspeitas", titulo: "Caixas suspeitas", tipo: "encontro", peso: 3,
      imagem: "assets/caixas.svg", imagemAlt: "Caixotes de madeira diante do portão do vilarejo, desenhados em branco sobre preto",
      texto: "Uma carroça chega ao portão. O mercador oferece mantimentos, mas um cheiro estranho escapa das caixas. O povo aguarda sua palavra.",
      informacoes: "O mercador pede passagem. Ninguém sabe de onde vieram os mantimentos.",
      opcoes: [
        { id: "deixar", texto: "Deixem vir.", efeitos: { habitantes: -12, honra: -4 }, flags: { praga_entrou: true }, resultado: "As caixas são abertas. Dias depois, a febre atravessa as casas. Doze moradores não resistem." },
        { id: "verificar", texto: "Vou verificar pessoalmente.", efeitos: { hp: -10, honra: 5 }, flags: { praga_evitada: true }, resultado: "Você encontra sinais de praga e queima a carga. A exposição cobra sua saúde, mas o povo está a salvo." },
        { id: "uniao", texto: "Juntos, protejamos a vila.", requisitos: { honra: "alta" }, efeitos: { honra: 2 }, flags: { praga_evitada: true }, resultado: "Confiando em você, os moradores denunciam a carga antes que seja aberta. O fogo leva a ameaça para longe." },
        { id: "expurgo", texto: "Expurgo! Queimem tudo.", requisitos: { honra: "baixa" }, efeitos: { honra: -8 }, multiplicadores: { habitantes: 0.4 }, resultado: "Seus homens queimam carroça, casas e celeiros. Mais da metade dos moradores morre. A febre cessa; o medo permanece." }
      ]
    },
    {
      id: "viajantes", titulo: "À procura de um lar", tipo: "encontro", peso: 3,
      imagem: "assets/vila.svg", imagemAlt: "Casas e uma estrada sob as muralhas do castelo",
      texto: "Cinco viajantes chegam da estrada do norte. Perderam a colheita e procuram um lugar onde possam recomeçar.",
      informacoes: "Os viajantes pedem abrigo e um pedaço de terra para cultivar.",
      opcoes: [
        { id: "acolher", texto: "Há lugar para vocês aqui.", requisitos: { honra: "nao_baixa" }, efeitos: { habitantes: 5, honra: 3 }, resultado: "Cinco novos moradores acendem o fogo em casas vazias. Pela primeira vez em semanas, há risos na praça." },
        { id: "trabalho", texto: "Abrigo em troca de trabalho.", efeitos: { habitantes: 3, honra: -1 }, resultado: "Três aceitam suas condições. Os outros seguem pela estrada. O trabalho cresce; a gratidão, nem tanto." },
        { id: "recusar", texto: "Sigam seu caminho.", efeitos: { honra: -3 }, resultado: "O portão se fecha. Os viajantes desaparecem na neblina antes do anoitecer." }
      ]
    },
    {
      id: "ferreiro", titulo: "O fogo da forja", tipo: "encontro", peso: 2,
      imagem: "assets/forja.svg", imagemAlt: "Uma espada sobre a bigorna da forja",
      texto: "O ferreiro recuperou o aço de uma antiga armadura. Há material para reforçar uma peça de seu equipamento.",
      informacoes: "O aço pode melhorar seu ataque ou seu escudo.",
      opcoes: [
        { id: "espada", texto: "Reforce minha espada.", efeitos: { ataque: 1 }, resultado: "O ferreiro endireita a lâmina e lhe dá um novo fio. Sua espada está pronta para o que vier." },
        { id: "escudo", texto: "Reforce meu escudo.", efeitos: { escudo: 1 }, resultado: "Uma nova chapa cobre a madeira. O escudo suportará golpes mais fortes." },
        { id: "povo", texto: "Façam ferramentas para o povo.", efeitos: { habitantes: 2, honra: 3 }, resultado: "O aço vira enxadas e martelos. Duas famílias que pensavam em partir decidem ficar." }
      ]
    },
    {
      id: "geada", titulo: "A primeira geada", tipo: "mandatorio", peso: 1,
      imagem: "assets/geada.svg", imagemAlt: "Um campo de trigo sob o inverno",
      texto: "O frio chega antes da colheita. Na noite em que você ajuda a proteger os campos, o gelo toma a terra e a febre toma seu corpo.",
      informacoes: "O inverno não espera uma decisão. Há coisas que nem um senhor pode impedir.",
      opcoes: [
        { id: "enfrentar", texto: "Enfrentaremos o inverno.", efeitos: { hp: -12, habitantes: -4 }, resultado: "Vocês salvam parte da colheita. Quatro moradores partem em busca de terras mais quentes. Você volta ao castelo adoecido." }
      ]
    },
    {
      id: "celeiro", titulo: "Sombras no celeiro", tipo: "desordem", peso: 1,
      pesos: [{ requisitos: { honra: "baixa" }, valor: 5 }],
      imagem: "assets/caixas.svg", imagemAlt: "Estoques de alimentos junto a um portão de pedra",
      texto: "O estoque de grãos está diminuindo. Na praça, dois vizinhos se acusam de roubo. Seus guardas esperam uma ordem.",
      informacoes: "Há comida desaparecida e nenhuma prova contra os acusados.",
      opcoes: [
        { id: "investigar", texto: "Procurem provas primeiro.", requisitos: { honra: "nao_baixa" }, efeitos: { honra: 3 }, resultado: "Os guardas encontram sacos escondidos por um atravessador. Os vizinhos voltam para casa, envergonhados pelas acusações." },
        { id: "punir", texto: "Punam os dois. Que sirva de exemplo.", efeitos: { habitantes: -3, honra: -5 }, resultado: "O castigo cala a praça. Três moradores fogem durante a noite. Os grãos continuam desaparecendo." },
        { id: "ignorar", texto: "Resolvam entre vocês.", efeitos: { habitantes: -5, honra: -2 }, resultado: "A discussão vira briga. Cinco pessoas deixam a vila, e a porta do celeiro continua sem guarda." }
      ]
    },
    {
      id: "mercador", titulo: "O mercador da estrada", tipo: "mercador", peso: 1,
      imagem: "assets/caixas.svg", imagemAlt: "Caixotes de mercadorias diante do portão do vilarejo, desenhados em branco sobre preto",
      texto: "O mercador abre seus caixotes na praça. Há remédios, armas e escudos para quem ainda tem moedas.",
      informacoes: "Compre um produto ou siga viagem. Cada compra encarece só aquele produto em 2 gold.",
      mercadorias: [
        { id: "pocao_cura", texto: "Poção de cura · +10 Vida", preco: 5, aumentoPreco: 2, efeitos: { hp: 10 }, resultado: "Você bebe a poção. O gosto é amargo, mas suas forças retornam: 10 de vida recuperados." },
        { id: "arma_melhor", texto: "Arma melhor · +2 Ataque", preco: 10, aumentoPreco: 2, efeitos: { ataque: 2 }, resultado: "Você troca sua arma por uma lâmina de melhor fio. Seu ataque aumenta em 2." },
        { id: "escudo_melhor", texto: "Escudo melhor · +3 Escudo", preco: 10, aumentoPreco: 2, efeitos: { escudo: 3 }, resultado: "O escudo reforçado se ajusta ao seu braço. Sua proteção aumenta em 3, sem desgaste em combate." }
      ],
      opcoes: [
        { id: "seguir", texto: "Seguir sem comprar.", resultado: "Você deixa as mercadorias na carroça. O mercador segue seu caminho, à procura de outro povoado." }
      ]
    },
    {
      id: "saqueadores", titulo: "Saqueadores à vista", tipo: "batalha", peso: 2,
      imagem: "assets/batalha.svg", imagemAlt: "Espadas diante de uma torre vigiada por estandartes",
      texto: "Uma coluna armada desce a colina. O vigia reconhece as bandeiras: saqueadores. Entre eles e as casas, apenas você e seus homens.",
      informacoes: "O ataque precisa alcançar a defesa inimiga. Seu escudo reduz o dano recebido, sem se desgastar.",
      batalha: {
        defesa: 3,
        vitoria: { dano: 10, efeitos: { honra: 3, gold: 3 }, resultado: "Sua lâmina rompe a linha inimiga. Os saqueadores recuam, deixando 3 gold. A vila está de pé; você retorna ferido." },
        derrota: { dano: 24, efeitos: {}, resultado: "A linha inimiga resiste. Você é obrigado a recuar, e os saqueadores alcançam as casas." },
        // A penalidade adicional é própria deste evento; não é um debuff universal.
        penalidadeFalha: { efeitos: { habitantes: -12 }, texto: "Durante o saque, a vila perde doze habitantes." }
      },
      opcoes: [
        { id: "combater", texto: "Às armas. Defendam a vila!", combate: true },
        { id: "retirar", texto: "Retirar o povo pelas trilhas.", efeitos: { habitantes: -5, honra: -2 }, resultado: "A maior parte do povo escapa, mas cinco moradores se perdem na retirada. Os saqueadores levam o que encontram." }
      ]
    },
    {
      id: "ervateira", titulo: "As mãos da ervateira", tipo: "encontro", peso: 2,
      imagem: "assets/ervas.svg", imagemAlt: "Ervas e um pilão de remédios, desenhados em branco sobre preto",
      texto: "Uma mulher chega com ervas e uma agulha torta. Trata feridas há quarenta invernos; seus pacientes ainda discutem os métodos.",
      informacoes: "Ela aceita moedas pelo tratamento ou ajuda para colher mais ervas.",
      opcoes: [
        { id: "tratamento", texto: "Aceitar o tratamento · 3 gold", requisitos: { goldMin: 3 }, efeitos: { gold: -3, hp: 18 }, resultado: "A agulha dói mais que a batalha. Ao amanhecer, a febre cede: você recupera 18 de vida por 3 gold." },
        { id: "colher", texto: "Ajudar na colheita das ervas.", efeitos: { hp: 8, honra: 2 }, resultado: "Você volta coberto de lama, com um emplastro e oito pontos de vida a mais. A ervateira guarda seu nome." },
        { id: "povo", texto: "Levá-la aos doentes da vila.", efeitos: { habitantes: 3, honra: 3 }, resultado: "Três moradores que pensavam em partir melhoram e ficam. O senhor precisará esperar pela própria consulta." }
      ]
    },
    {
      id: "ponte_partida", titulo: "A ponte partida", tipo: "encontro", peso: 2,
      requisitos: { flagsAusentes: ["ponte_reparada"] },
      imagem: "assets/ponte.svg", imagemAlt: "Uma ponte de madeira partida sobre um rio",
      texto: "A ponte do moinho cedeu. Do outro lado, carroças esperam; deste, o carpinteiro calcula quantas tábuas ainda podem ser chamadas de tábuas.",
      informacoes: "Reabrir a estrada pode trazer gente e comércio mais adiante.",
      opcoes: [
        { id: "madeira", texto: "Comprar madeira nova · 4 gold", requisitos: { goldMin: 4 }, efeitos: { gold: -4, habitantes: 4, honra: 3 }, flags: { ponte_reparada: true }, resultado: "A ponte fica pronta. Quatro viajantes escolhem ficar na vila. Agora as carroças podem voltar a passar." },
        { id: "trabalhar", texto: "Trabalhar ao lado do carpinteiro.", efeitos: { hp: -8, honra: 3 }, flags: { ponte_reparada: true }, resultado: "Você perde oito de vida entre farpas e pedras, mas a ponte resiste à primeira carroça. O carpinteiro parece surpreso." },
        { id: "pedagio", texto: "Cobrar a travessia para pagar a obra.", efeitos: { gold: 4, honra: -3 }, flags: { ponte_reparada: true, ponte_com_pedagio: true }, resultado: "Os viajantes pagam reclamando. A obra termina e sobram 4 gold no cofre. A estrada volta a ter movimento." }
      ]
    },
    {
      id: "caravana_da_ponte", titulo: "Rodas sobre o rio", tipo: "encontro", peso: 3,
      requisitos: { flags: ["ponte_reparada"], flagsAusentes: ["caravana_recebida"] },
      imagem: "assets/caixas.svg", imagemAlt: "Caixotes de uma caravana diante do portão",
      texto: "Uma caravana cruza a ponte reparada. A condutora oferece pagamento por um lugar no pátio; algumas famílias procuram algo mais permanente.",
      informacoes: "A ponte trouxe a primeira oportunidade de comércio. A caravana partirá de manhã.",
      opcoes: [
        { id: "comercio", texto: "Abrir o pátio ao comércio.", efeitos: { gold: 7, honra: 1 }, flags: { caravana_recebida: true }, resultado: "O pátio se enche de vozes. A vila recebe 7 gold pelo comércio; a condutora promete contar sobre a nova passagem." },
        { id: "acolher", texto: "Oferecer terra às famílias.", efeitos: { habitantes: 7, gold: 2, honra: 3 }, flags: { caravana_recebida: true }, resultado: "Sete pessoas ficam para cultivar as terras vazias. Deixam 2 gold como contribuição e penduram roupas nas janelas." },
        { id: "confiscar", texto: "Requisitar parte da carga.", efeitos: { gold: 10, honra: -6 }, flags: { caravana_recebida: true }, resultado: "Seus guardas recolhem mercadorias que rendem 10 gold. A condutora anota o nome da vila e parte antes da aurora." }
      ]
    },
    {
      id: "poco_turvo", titulo: "O fundo do poço", tipo: "encontro", peso: 2,
      requisitos: { flagsAusentes: ["poco_decidido"] },
      imagem: "assets/poco.svg", imagemAlt: "Poço de pedra e um balde gasto na praça",
      texto: "A água do poço tem gosto de ferro. Um pedreiro oferece limpar o fundo; na praça, alguém garante que sempre teve esse gosto.",
      informacoes: "Uma corda e algumas pedras podem custar menos que uma vila doente.",
      opcoes: [
        { id: "consertar", texto: "Pagar a limpeza · 3 gold", requisitos: { goldMin: 3 }, efeitos: { gold: -3, habitantes: 3, honra: 2 }, flags: { poco_decidido: true, poco_limpo: true }, resultado: "O pedreiro retira um balde enferrujado do fundo. A água clareia, e três moradores desistem de abandonar a vila." },
        { id: "descer", texto: "Descer ao poço com os guardas.", efeitos: { hp: -7, honra: 3 }, flags: { poco_decidido: true, poco_limpo: true }, resultado: "Você volta com os joelhos feridos e o balde culpado. Perde sete de vida; a água deixa de ter gosto de ferrugem." },
        { id: "adiar", texto: "Deixar para depois da colheita.", efeitos: { honra: -2 }, flags: { poco_decidido: true, poco_contaminado: true }, resultado: "As moedas ficam no cofre. Por alguns dias, só se fala do gosto da água. Depois, começam as tosses." }
      ]
    },
    {
      id: "febre_do_poco", titulo: "As portas fechadas", tipo: "desordem", peso: 4,
      requisitos: { flags: ["poco_contaminado"], flagsAusentes: ["febre_resolvida"] },
      imagem: "assets/poco.svg", imagemAlt: "O poço de água contaminada no centro do povoado",
      texto: "A água turva cobrou sua parte. Panos molhados cobrem as janelas, e a curandeira pede mãos e remédios antes que a febre tome a rua.",
      informacoes: "O problema deixado no poço voltou às casas. Ainda há gente que pode ser salva.",
      opcoes: [
        { id: "remedios", texto: "Trazer remédios · 4 gold", requisitos: { goldMin: 4 }, efeitos: { gold: -4, hp: 10, habitantes: 3, honra: 4 }, flags: { febre_resolvida: true }, resultado: "Os remédios chegam a tempo. Você recupera dez de vida; três moradores melhoram e permanecem na vila." },
        { id: "cuidar", texto: "Cuidar dos doentes pessoalmente.", efeitos: { hp: -10, honra: 5 }, flags: { febre_resolvida: true }, resultado: "A vila atravessa a febre sem novas partidas. Você paga com dez de vida e noites que os moradores não esquecerão." },
        { id: "expulsar", texto: "Mandar os doentes para fora.", efeitos: { habitantes: -6, honra: -6 }, flags: { febre_resolvida: true }, resultado: "Seis pessoas deixam suas casas. A febre recua dentro das muralhas; nas estradas, ninguém conta os dias." }
      ]
    },
    {
      id: "contrabandista", titulo: "O caminho sem guarda", tipo: "encontro", peso: 1,
      imagem: "assets/caixas.svg", imagemAlt: "Caixas fechadas junto à entrada da vila",
      texto: "Um viajante oferece moedas para atravessar sem abrir os sacos. Diz que transporta sal. Seu burro parece o único a acreditar.",
      informacoes: "Ele paga pela discrição. Inspecionar a carga também exige seus homens.",
      opcoes: [
        { id: "aceitar", texto: "Aceitar o pagamento e abrir passagem.", efeitos: { gold: 8, honra: -5 }, resultado: "O viajante deixa 8 gold. Ao amanhecer, uma aldeia vizinha reclama de ferramentas roubadas. Os sacos já estão longe." },
        { id: "inspecionar", texto: "Abrir os sacos sob sua guarda.", efeitos: { hp: -4, gold: 3, honra: 2 }, resultado: "Uma faca escondida corta seu braço: quatro de vida perdidos. Os bens roubados voltam aos donos, que deixam 3 gold." },
        { id: "voltar", texto: "Mandá-lo voltar pela estrada.", efeitos: { honra: 1 }, resultado: "O burro se vira antes do dono. Nenhuma moeda muda de mãos. Pela manhã, o caminho ainda está quieto." }
      ]
    },
    {
      id: "milicia", titulo: "Escudos de celeiro", tipo: "encontro", peso: 2,
      imagem: "assets/forja.svg", imagemAlt: "Lâmina e bigorna de uma oficina simples",
      texto: "Os moradores ensaiam uma defesa com tampas de barril. Um veterano oferece instrução; metade da turma segura o escudo ao contrário.",
      informacoes: "O treino pode melhorar seu equipamento ou devolver braços ao trabalho da vila.",
      opcoes: [
        { id: "instruir", texto: "Contratar o veterano · 5 gold", requisitos: { goldMin: 5 }, efeitos: { gold: -5, ataque: 1, escudo: 1 }, resultado: "Cinco gold compram lições e reparos. Seu ataque e seu escudo aumentam em um. As tampas voltam aos barris." },
        { id: "treinar", texto: "Conduzir o treino pessoalmente.", efeitos: { hp: -6, ataque: 1 }, resultado: "O treino termina com seis de vida a menos e um de ataque a mais. Seu ombro descobre por que o veterano se aposentou." },
        { id: "campos", texto: "Liberá-los para cuidar dos campos.", efeitos: { habitantes: 4, honra: 2 }, resultado: "Com ajuda na colheita, quatro moradores decidem ficar. O veterano guarda a espada e pede uma enxada." }
      ]
    },
    {
      id: "enchente", titulo: "O rio dentro de casa", tipo: "mandatorio", peso: 1,
      imagem: "assets/vila.svg", imagemAlt: "Casas nas terras baixas do vilarejo",
      texto: "O rio sobe durante a noite. Você ajuda a tirar crianças e sacos de farinha das casas; a corrente não distingue um do outro.",
      informacoes: "A água já entrou. O que resta é salvar quem ainda pode sair.",
      opcoes: [
        { id: "resgatar", texto: "Entrar na água com o povo.", efeitos: { hp: -6, habitantes: -3, honra: 2 }, resultado: "Três moradores partem após perder suas casas. Você perde seis de vida no resgate, mas os sinos voltam a tocar pela manhã." }
      ]
    },
    {
      id: "pedreira", titulo: "Pedra e pão", tipo: "encontro", peso: 2,
      imagem: "assets/forja.svg", imagemAlt: "Ferramentas de ferro usadas pelos trabalhadores",
      texto: "A velha pedreira ainda guarda pedra boa. Os trabalhadores pedem comida antes de entrar; o comprador quer a carga antes do próximo frio.",
      informacoes: "A obra pode render moedas, atrair trabalhadores ou esperar uma estação melhor.",
      opcoes: [
        { id: "trabalhar", texto: "Entrar na pedreira com eles.", efeitos: { hp: -5, gold: 5 }, resultado: "A carga rende 5 gold. Uma pedra cobra cinco de vida do seu pé. Os trabalhadores guardam uma porção de pão para você." },
        { id: "alimentar", texto: "Abastecer os trabalhadores · 3 gold", requisitos: { goldMin: 3 }, efeitos: { gold: -3, habitantes: 5, honra: 2 }, resultado: "Cinco trabalhadores ficam com suas famílias. Os 3 gold viram comida e mãos que a vila não tinha ontem." },
        { id: "fechar", texto: "Esperar até os escoramentos ficarem prontos.", efeitos: { honra: 2 }, resultado: "O comprador vai embora. Nenhum carro sai carregado, e nenhum trabalhador precisa ser carregado para casa." }
      ]
    },
    {
      id: "desertores", titulo: "Soldados sem bandeira", tipo: "batalha", peso: 1,
      requisitos: { rodadaMin: 6 },
      imagem: "assets/batalha.svg", imagemAlt: "Espadas e uma torre sob estandartes",
      texto: "Soldados sem senhor acampam perto do moinho. Pedem um tributo para ir embora. Os sacos de farinha já estão junto aos seus cavalos.",
      informacoes: "Eles têm treino e equipamento. A farinha e as moedas do moinho estão com eles.",
      batalha: {
        defesa: 5,
        vitoria: { dano: 16, efeitos: { gold: 7, habitantes: 3, honra: 3 }, resultado: "Os desertores fogem. Você recupera 7 gold, e três moleiros voltam à vila. A farinha será dividida na praça." },
        derrota: { dano: 25, efeitos: {}, resultado: "Os soldados rompem sua linha e levam o moinho. Você recua com os homens que ainda conseguem andar." },
        penalidadeFalha: { efeitos: { habitantes: -5, gold: -2 }, texto: "Cinco moradores fogem; o saque leva mais 2 gold." }
      },
      opcoes: [
        { id: "combater", texto: "Tomar o moinho de volta.", combate: true },
        { id: "pagar", texto: "Negociar a partida · 3 gold", requisitos: { goldMin: 3 }, efeitos: { gold: -3, honra: -1 }, resultado: "Os soldados aceitam 3 gold e deixam a farinha. O moleiro conta os sacos duas vezes antes de acreditar." },
        { id: "evacuar", texto: "Retirar as famílias do moinho.", efeitos: { habitantes: -2, honra: 1 }, resultado: "Duas pessoas se perdem na retirada. As outras chegam à vila; o moinho fica para os soldados por enquanto." }
      ]
    },
    {
      id: "javalis", titulo: "Os donos da plantação", tipo: "batalha", peso: 2,
      imagem: "assets/geada.svg", imagemAlt: "Espigas de uma plantação no campo",
      texto: "Javalis entraram na plantação. O maior dorme sobre o espantalho. Os lavradores esperam que alguém lhe explique a propriedade da terra.",
      informacoes: "Salvar a colheita permite vender o excedente e manter os lavradores na vila.",
      batalha: {
        defesa: 2,
        vitoria: { dano: 12, efeitos: { gold: 4, habitantes: 2, honra: 2 }, resultado: "A plantação é salva. A venda do excedente rende 4 gold, e dois lavradores desistem de partir." },
        derrota: { dano: 20, efeitos: {}, resultado: "Os animais atravessam sua defesa e a plantação. Você volta carregado numa porta de celeiro." },
        penalidadeFalha: { efeitos: { hp: -4, habitantes: -3 }, texto: "A queda custa mais quatro de vida; três lavradores abandonam as terras." }
      },
      opcoes: [
        { id: "cacar", texto: "Reunir os guardas para a caçada.", combate: true },
        { id: "cacador", texto: "Chamar um caçador · 3 gold", requisitos: { goldMin: 3 }, efeitos: { gold: -3, habitantes: 2 }, resultado: "O caçador afasta os animais por 3 gold. Dois lavradores ficam; o espantalho é aposentado com pouca cerimônia." },
        { id: "ceder", texto: "Abandonar aquela parte da plantação.", efeitos: { habitantes: -4, honra: -1 }, resultado: "Quatro lavradores partem. Os javalis ficam com a terra e não demonstram intenção de pagar impostos." }
      ]
    },
    {
      id: "colheita", titulo: "Uma noite sem fome", tipo: "encontro", peso: 2,
      imagem: "assets/geada.svg", imagemAlt: "Espigas maduras desenhadas em branco sobre preto",
      texto: "Pela primeira vez, sobrou grão. O celeireiro traz as contas; do lado de fora, alguém ensaia uma música que só lembra pela metade.",
      informacoes: "O excedente pode virar moedas, comida para os moradores ou um breve descanso.",
      opcoes: [
        { id: "vender", texto: "Vender o excedente na estrada.", efeitos: { gold: 6, honra: -2 }, resultado: "Os sacos rendem 6 gold. Na praça, a música termina cedo. O celeireiro guarda as moedas num pote de farinha." },
        { id: "repartir", texto: "Dividir o grão entre as casas.", efeitos: { hp: 10, habitantes: 4, honra: 3 }, resultado: "Você recupera dez de vida à mesa do povo. Quatro viajantes ficam para a próxima colheita, e a música ganha um verso." },
        { id: "descansar", texto: "Guardar sementes e descansar.", efeitos: { hp: 16, habitantes: 1 }, resultado: "Você recupera dezesseis de vida. Um lavrador fica para cuidar das sementes; ninguém lhe pede uma ordem até a manhã." }
      ]
    },
    {
      id: "orfao", titulo: "Uma criança no portão", tipo: "encontro", peso: 2,
      requisitos: { flagsAusentes: ["orfao_decidido"] },
      imagem: "assets/vila.svg", imagemAlt: "O portão e as casas do vilarejo em traços brancos sobre preto",
      texto: "Um menino sujo de cinzas espera no portão com uma trouxa menor que ele. Diz que veio da vila queimada ao sul e que conheceu seu pai. Os guardas fingem não ouvir.",
      informacoes: "Ninguém pode confirmar a história do menino.",
      opcoes: [
        { id: "acolher", texto: "Ele fica conosco.", requisitos: { honra: "nao_baixa" }, efeitos: { habitantes: 1, honra: 3 }, flags: { orfao_decidido: true, orfao_acolhido: true }, resultado: "O menino come como quem não vê comida há dias. A cozinheira finge reclamar e lhe dá um pedaço de pão a mais." },
        { id: "pao", texto: "Dar pão e mandá-lo seguir.", requisitos: { goldMin: 1 }, efeitos: { honra: 1, gold: -1 }, flags: { orfao_decidido: true }, resultado: "Ele agradece sem sorrir e segue pela estrada. Um guarda o observa até sumir na neblina." },
        { id: "tutelar", texto: "Seu pai também chegou aqui sem nada. Será criado como meu.", requisitos: { honra: "alta" }, efeitos: { habitantes: 1, honra: 2 }, flags: { orfao_decidido: true, orfao_acolhido: true }, resultado: "O menino ganha um catre perto da forja e um sobrenome emprestado. Na praça, ninguém comenta; todos observam." },
        { id: "explorar", texto: "Trabalho em troca de telhado.", requisitos: { honra: "baixa" }, efeitos: { gold: 3, honra: -4 }, flags: { orfao_decidido: true, orfao_explorado: true }, resultado: "O menino carrega sacos até cair de sono. Os moradores olham para o chão e fazem as contas do que isso diz sobre o senhor." }
      ]
    },
    {
      id: "orfao_cresce", titulo: "O menino e a espada", tipo: "encontro", peso: 3,
      requisitos: { flags: ["orfao_acolhido"], flagsAusentes: ["orfao_resolvido"], rodadaMin: 8 },
      imagem: "assets/forja.svg", imagemAlt: "Espada de treino junto à bigorna do ferreiro",
      texto: "O menino cresceu, e seu galho de árvore virou espada de treino. Ele pede que você o ensine, e que ninguém conte à cozinheira.",
      informacoes: "A vila acompanha o que você fizer com o garoto que acolheu.",
      opcoes: [
        { id: "treinar", texto: "Treinar com ele pessoalmente.", efeitos: { ataque: 1, honra: 2, hp: -4 }, flags: { orfao_resolvido: true }, resultado: "Ele acerta suas costelas três vezes antes de aprender a guardar. Você perde quatro de vida e ganha um aliado de verdade." },
        { id: "ferreiro", texto: "Encaminhá-lo ao ferreiro · 3 gold", requisitos: { goldMin: 3 }, efeitos: { escudo: 1, honra: 1, gold: -3 }, flags: { orfao_resolvido: true }, resultado: "O ferreiro aceita o aprendiz. Em um mês, seu escudo ganha rebites que não estavam ali antes." },
        { id: "campos", texto: "Ele aprende melhor nos campos.", efeitos: { habitantes: 2, honra: -1 }, flags: { orfao_resolvido: true }, resultado: "O menino volta à enxada, de cara fechada. Dois lavradores, que viam nele um sinal de esperança, decidem ficar." }
      ]
    },
    {
      id: "testamento", titulo: "A vontade do velho senhor", tipo: "mandatorio", peso: 1,
      requisitos: { rodadaMin: 5, flagsAusentes: ["testamento_lido"] },
      imagem: "assets/caixas.svg", imagemAlt: "Um cofre entre os bens guardados pelo antigo senhor",
      texto: "Numa noite de chuva, você encontra o cofre do seu predecessor atrás de uma tapeçaria. Dentro há moedas contadas e uma carta que pede perdão a pessoas que você nunca conheceu.",
      informacoes: "Há heranças que chegam sem pedir licença.",
      opcoes: [
        { id: "ler", texto: "Ler a vontade do senhor.", efeitos: { gold: 6, honra: -3 }, flags: { testamento_lido: true }, desbloqueia: { flags: ["vontade_lembrada"] }, resultado: "As moedas são suas. A culpa também. Nos dias seguintes, velhos moradores o olham como se reconhecessem alguém." }
      ]
    },
    {
      id: "banquete", titulo: "A mesa do povo", tipo: "encontro", peso: 2,
      requisitos: { honra: "alta" },
      imagem: "assets/vila.svg", imagemAlt: "As casas do povoado reunidas ao redor da praça",
      texto: "Os moradores arrastam mesas para a praça sem pedir permissão. Há pão, sopa rala e um violeiro que só sabe uma música. Guardaram o lugar da cabeceira para você.",
      informacoes: "O povo oferece a refeição; o que você faz com ela é decisão sua.",
      opcoes: [
        { id: "sentar", texto: "Sentar-se entre eles.", efeitos: { hp: 8, habitantes: 3, honra: 2 }, resultado: "Você come na mesma tigela que os outros. Três famílias ouvem falar do banquete e pedem lugar na vila." },
        { id: "vinho", texto: "Mandar abrir o barril de vinho · 4 gold", requisitos: { goldMin: 4 }, efeitos: { habitantes: 5, honra: 3, gold: -4 }, resultado: "A música ganha segunda estrofe. Cinco viajantes seguem o cheiro do vinho e ficam até o amanhecer, e depois." },
        { id: "servir", texto: "Erguer a taça ao povo e servi-lo.", requisitos: { honra: "alta" }, efeitos: { escudo: 1, honra: 3 }, resultado: "Você serve sopa até o último prato. Os ferreiros, tocados, soldam uma nova chapa no seu escudo antes de dormir." },
        { id: "cobrar", texto: "Cobrar uma moeda por prato.", efeitos: { gold: 5, honra: -4 }, resultado: "O violeiro para no meio da música. A praça se esvazia mais cedo do que enche, mas o cofre fica mais pesado." }
      ]
    },
    {
      id: "taverna", titulo: "A taverna sem dono", tipo: "desordem", peso: 1,
      pesos: [{ requisitos: { honra: "baixa" }, valor: 5 }],
      imagem: "assets/vila.svg", imagemAlt: "Casas de madeira junto à praça da vila",
      texto: "Uma briga começou por causa de uma canção e acabou quando a mesa quebrou. Agora três homens se acusam, e o dono da taverna chora em cima do balcão.",
      informacoes: "A vila observa quem o senhor decide proteger.",
      opcoes: [
        { id: "mediar", texto: "Entrar na briga para separar.", requisitos: { honra: "nao_baixa" }, efeitos: { honra: 3, hp: -5 }, resultado: "Você leva um banco nas costas antes de conseguir falar. A briga acaba por vergonha, não por autoridade." },
        { id: "pagar", texto: "Pagar uma rodada para todos · 3 gold", requisitos: { goldMin: 3 }, efeitos: { honra: 1, gold: -3 }, resultado: "A raiva afoga na cerveja. O dono da taverna anota o nome do senhor num caderno de \"bons clientes\"." },
        { id: "dispersar", texto: "Mandar os guardas dispersarem.", efeitos: { habitantes: -2, honra: -1 }, resultado: "A praça esvazia com cassetetes. Duas famílias decidem que uma vila sem canções não vale a estadia." },
        { id: "prender", texto: "Prender todos e fechar a taverna.", requisitos: { honra: "baixa" }, efeitos: { gold: 4, habitantes: -4, honra: -6 }, resultado: "As multas enchem o cofre, e as portas, os cadeados. Quatro moradores partem na mesma noite, sem se despedir." }
      ]
    },
    {
      id: "peregrino", titulo: "O peregrino das relíquias", tipo: "encontro", peso: 2,
      imagem: "assets/ervas.svg", imagemAlt: "Pequenos embrulhos e ervas de um viajante da estrada",
      texto: "Um peregrino de sandálias gastas oferece um dente de santo embrulhado em pano. Jura que traz bênçãos para quem o tocar. O pano cheira a estábulo.",
      informacoes: "Ninguém sabe se a relíquia é verdadeira. A fé do povo vale tanto quanto a verdade, ou mais.",
      opcoes: [
        { id: "comprar", texto: "Comprar a relíquia · 5 gold", requisitos: { goldMin: 5 }, efeitos: { habitantes: 3, honra: 2, gold: -5 }, resultado: "O povo reza diante do dente. Ninguém sabe se é de santo ou de cavalo, mas três pessoas decidem que a vila foi abençoada." },
        { id: "revistar", texto: "Examinar a bagagem do peregrino.", efeitos: { gold: 4, honra: 1 }, resultado: "Você encontra uma sacola de dentes de todos os tamanhos. O peregrino deixa 4 gold para não ser entregue à guarda." },
        { id: "taxar", texto: "Cobrar uma taxa pela bênção.", efeitos: { gold: 3, honra: -2 }, resultado: "O peregrino paga com cara fechada. Algumas pessoas na praça apontam o dedo, outras, a bolsa dele." }
      ]
    },
    {
      id: "barao", titulo: "O cobrador do barão", tipo: "batalha", peso: 2,
      requisitos: { rodadaMin: 4 },
      imagem: "assets/batalha.svg", imagemAlt: "Espadas e estandartes dos homens do barão",
      texto: "Um cavaleiro de armadura cinza exige tributo em nome de um barão que ninguém conhece. Seus homens esperam atrás, em formação mais limpa do que a de qualquer guarda seu.",
      informacoes: "O cavaleiro exige o tributo. A vila aguarda a sua palavra.",
      batalha: {
        forcarDerrota: true,
        encerrarAoFalhar: true,
        motivoFim: "A crônica do herdeiro termina diante do cobrador. No livro da vila, alguém deixou uma nota sobre a dívida que ficou.",
        mostrarLeitura: false,
        defesa: 4,
        vitoria: { dano: 14, efeitos: { gold: 6, habitantes: 2, honra: 3 }, resultado: "O cavaleiro cai da sela. Os homens do barão recuam levando-o, deixando 6 gold e dois desertores que pedem para ficar." },
        derrota: { dano: 22, efeitos: {}, resultado: "Você é desarmado antes de entender o golpe. O cavaleiro leva o que quer e deixa um aviso na porta." },
        penalidadeFalha: { efeitos: { habitantes: -6, gold: -3 }, texto: "Seis moradores seguem os soldados em busca de proteção; o saque leva mais 3 gold." }
      },
      opcoes: [
        { id: "combater", texto: "Recusar o tributo e lutar.", combate: true },
        { id: "pagar", texto: "Pagar o tributo · 6 gold", requisitos: { goldMin: 6 }, efeitos: { gold: -6, honra: -1 }, resultado: "O cavaleiro conta as moedas duas vezes e sorri. Você entende que ele voltará, e que o povo também entendeu." },
        { id: "negociar", texto: "Falar em nome do povo · 3 gold", requisitos: { honra: "alta", goldMin: 3 }, efeitos: { honra: 2, hp: -3, gold: -3 }, resultado: "O cavaleiro ouve até o fim, ofendido. No fim aceita metade do tributo, mas não sem acertar o seu ombro com a manopla." },
        { id: "recusar", texto: "Recusar e deixar uma nota aos que virão.", requisitos: { honraMax: 49 }, resultado: "O cobrador parte com os homens. No livro da vila, alguém registra o que restou da dívida.", encerramento: { tipo: "derrota", motivo: "A crônica do herdeiro termina diante do cobrador. No livro da vila, alguém deixou uma nota sobre a dívida que ficou." } }
      ]
    },
    {
      id: "pedagio_revolta", titulo: "O preço da ponte", tipo: "desordem", peso: 4,
      requisitos: { flags: ["ponte_com_pedagio"], flagsAusentes: ["pedagio_resolvido"] },
      imagem: "assets/ponte.svg", imagemAlt: "A passagem da ponte sob protestos dos viajantes",
      texto: "Os viajantes reclamam do pedágio. Alguém queimou a cancela durante a noite, e a fumaça ainda sobe sobre o rio. Os guardas procuram culpados; o povo procura desculpas.",
      informacoes: "A ponte que você cobrou voltou a cobrar de você.",
      opcoes: [
        { id: "abolir", texto: "Abolir o pedágio · 3 gold", requisitos: { goldMin: 3 }, efeitos: { habitantes: 3, honra: 3, gold: -3 }, flags: { pedagio_resolvido: true }, resultado: "Você paga a madeira nova de cancelas que ninguém cobrará. A estrada volta a lotar, e os viajantes agradecem sem fazer barulho." },
        { id: "guardar", texto: "Dobrar a guarda da ponte.", efeitos: { gold: 3, honra: -2 }, flags: { pedagio_resolvido: true }, resultado: "Os soldados vigiam a ponte de dia e de noite. O dinheiro chega e as visitas ficam mais raras." },
        { id: "enforcar", texto: "Enforcar os incendiários.", requisitos: { honra: "baixa" }, efeitos: { habitantes: -3, honra: -8 }, flags: { pedagio_resolvido: true }, resultado: "Ninguém discute o pedágio na semana seguinte. Três famílias levam suas coisas na calada da noite." }
      ]
    }
  ];
  // Eventos 28–100 fornecidos pelo autor.
  Jogo.eventos.push(...[
    {
      "id": "moinho_parado",
      "titulo": "Moinho parado",
      "tipo": "encontro",
      "peso": 2,
      "requisitos": {
        "flagsAusentes": [
          "moinho_decidido"
        ]
      },
      "texto": "A roda do moinho parou de girar. O moleiro jura que o rio mudou de ideia; o rio não comenta.",
      "informacoes": "Sem moinho, o pão encarece e a praça esvazia.",
      "opcoes": [
        {
          "id": "consertar",
          "texto": "Pagar o conserto · 4 gold",
          "requisitos": {
            "goldMin": 4
          },
          "efeitos": {
            "habitantes": 3,
            "honra": 2,
            "gold": -4
          },
          "resultado": "A roda volta a girar. Três famílias de padeiros se mudam para perto do cheiro de pão.",
          "flags": {
            "moinho_decidido": true,
            "moinho_reparado": true
          }
        },
        {
          "id": "canal",
          "texto": "Limpar o canal com as próprias mãos.",
          "efeitos": {
            "honra": 3,
            "hp": -7
          },
          "resultado": "Você tira galhos, lama e um sapato que ninguém reconhece. A roda gira, e suas costas reclamam por uma semana.",
          "flags": {
            "moinho_decidido": true,
            "moinho_reparado": true
          }
        },
        {
          "id": "vender",
          "texto": "Vender a pedra do moinho.",
          "efeitos": {
            "gold": 6,
            "habitantes": -2,
            "honra": -3
          },
          "resultado": "A pedra rende 6 gold. O moleiro parte com o filho, e o silêncio no vale passa a ter eco.",
          "flags": {
            "moinho_decidido": true
          }
        }
      ],
      "imagem": "assets/vila.svg",
      "imagemAlt": "Cena da vila durante moinho parado"
    },
    {
      "id": "farinha_nova",
      "titulo": "Farinha nova",
      "tipo": "encontro",
      "peso": 3,
      "requisitos": {
        "flags": [
          "moinho_reparado"
        ],
        "flagsAusentes": [
          "farinha_decidida"
        ]
      },
      "texto": "O moinho trabalha de novo e a farinha sai mais branca do que a vila está acostumada. Padeiros de três povoados querem comprar.",
      "informacoes": "O excedente pode virar moedas, pão ou reserva para o inverno.",
      "opcoes": [
        {
          "id": "vender",
          "texto": "Vender aos padeiros.",
          "efeitos": {
            "gold": 6,
            "honra": 1
          },
          "resultado": "Os padeiros pagam em dia e prometem voltar. O moleiro guarda parte das moedas num pote que já tinha dono.",
          "flags": {
            "farinha_decidida": true
          }
        },
        {
          "id": "assar",
          "texto": "Assar pão para as casas.",
          "efeitos": {
            "habitantes": 4,
            "honra": 3
          },
          "resultado": "O cheiro atravessa a vila e a estrada. Quatro viajantes chegam sem terem sido convidados.",
          "flags": {
            "farinha_decidida": true
          }
        },
        {
          "id": "guardar",
          "texto": "Guardar a farinha para o inverno.",
          "efeitos": {
            "hp": 8
          },
          "resultado": "Os sacos enchem o celeiro. Você dorme melhor, embora o celeireiro conte cada saco duas vezes.",
          "flags": {
            "farinha_decidida": true
          }
        },
        {
          "id": "padaria",
          "texto": "Abrir a padaria do povo.",
          "requisitos": {
            "honraMin": 50
          },
          "efeitos": {
            "habitantes": 6,
            "honra": 3
          },
          "resultado": "O povo assa junto, e o forno nunca esfria. Seis famílias descobrem que podem confiar no senhor.",
          "flags": {
            "farinha_decidida": true
          }
        }
      ],
      "imagem": "assets/vila.svg",
      "imagemAlt": "Cena da vila durante farinha nova"
    },
    {
      "id": "bardo",
      "titulo": "O bardo de uma canção só",
      "tipo": "encontro",
      "peso": 2,
      "requisitos": {
        "flagsAusentes": [
          "bardo_decidido"
        ]
      },
      "texto": "Um bardo chega pedindo pouso e promete compor uma canção sobre o senhor da vila. Não diz quando, nem como ela termina.",
      "informacoes": "Canções correm mais rápido que cavalos, para o bem e para o mal.",
      "opcoes": [
        {
          "id": "abrigar",
          "texto": "Dar abrigo e pão.",
          "efeitos": {
            "honra": 2,
            "gold": -1
          },
          "resultado": "O bardo dorme perto do fogo e parte antes da aurora. Deixa um verso rabiscado na parede.",
          "flags": {
            "bardo_decidido": true,
            "bardo_cantou": true
          }
        },
        {
          "id": "exigir",
          "texto": "Exigir uma canção de graça.",
          "efeitos": {
            "gold": 2,
            "honra": -2
          },
          "resultado": "O bardo canta de cara fechada. Os moradores aplaudem por educação e riem do final.",
          "flags": {
            "bardo_decidido": true,
            "bardo_cantou": true
          }
        },
        {
          "id": "recusar",
          "texto": "Mandá-lo embora.",
          "efeitos": {
            "honra": -1
          },
          "resultado": "Ele ergue as sobrancelhas e segue pela estrada, cantarolando algo que soa familiar demais.",
          "flags": {
            "bardo_decidido": true
          }
        }
      ],
      "imagem": "assets/vila.svg",
      "imagemAlt": "Cena da vila durante o bardo de uma canção só"
    },
    {
      "id": "cancao_que_corre",
      "titulo": "A canção que corre",
      "tipo": "encontro",
      "peso": 3,
      "requisitos": {
        "rodadaMin": 7,
        "flags": [
          "bardo_cantou"
        ],
        "flagsAusentes": [
          "cancao_resolvida"
        ]
      },
      "texto": "Um estranho cantarola na praça uma canção sobre a vila. Ele erra o nome do senhor, mas acerta quase tudo o mais.",
      "informacoes": "A canção já chegou a lugares onde a vila nunca foi.",
      "opcoes": [
        {
          "id": "aprender",
          "texto": "Aprender a canção com ele.",
          "requisitos": {
            "honraMin": -29
          },
          "efeitos": {
            "habitantes": 4,
            "honra": 2
          },
          "resultado": "A canção foi bem generosa com você. Quatro viajantes chegam pedindo para viver nessa vila.",
          "flags": {
            "cancao_resolvida": true
          }
        },
        {
          "id": "pagar",
          "texto": "Pagar para mudar um verso · 3 gold",
          "requisitos": {
            "goldMin": 3
          },
          "efeitos": {
            "honra": 1,
            "gold": -3
          },
          "resultado": "O estranho troca um verso por moedas. Ninguém na praça nota a diferença, exceto você.",
          "flags": {
            "cancao_resolvida": true
          }
        },
        {
          "id": "calar",
          "texto": "Calar o cantor.",
          "requisitos": {
            "honraMax": -30
          },
          "efeitos": {
            "habitantes": -3,
            "honra": -5
          },
          "resultado": "A praça silencia. Três pessoas partem sem dizer nada e cantarolam pela estrada.",
          "flags": {
            "cancao_resolvida": true
          }
        }
      ],
      "imagem": "assets/vila.svg",
      "imagemAlt": "Cena da vila durante a canção que corre"
    },
    {
      "id": "gado_perdido",
      "titulo": "Gado perdido",
      "tipo": "encontro",
      "peso": 2,
      "texto": "Metade do rebanho sumiu antes do amanhecer. Há pegadas de gado e de botas, mas nenhuma delas leva ao mesmo lugar.",
      "informacoes": "O rebanho alimenta a vila e paga parte dos impostos.",
      "opcoes": [
        {
          "id": "seguir",
          "texto": "Seguir as pegadas pessoalmente.",
          "efeitos": {
            "honra": 2,
            "gold": 2,
            "hp": -6
          },
          "resultado": "Você encontra o gado em um vale e uma cerca quebrada. Volta com lama até o pescoço e as vacas, mais ou menos intactas."
        },
        {
          "id": "rastreador",
          "texto": "Contratar um rastreador · 3 gold",
          "requisitos": {
            "goldMin": 3
          },
          "efeitos": {
            "habitantes": 2,
            "gold": -3
          },
          "resultado": "O rastreador recupera o rebanho em um dia. Dois pastores que pensavam em partir ficam."
        },
        {
          "id": "culpar",
          "texto": "Culpar os vizinhos.",
          "efeitos": {
            "gold": 3,
            "honra": -3,
            "habitantes": -2
          },
          "resultado": "A multa enche o cofre, mas duas famílias acusadas partem. O gado aparece dias depois, no mesmo vale de sempre."
        }
      ],
      "imagem": "assets/vila.svg",
      "imagemAlt": "Cena da vila durante gado perdido"
    },
    {
      "id": "lobos",
      "titulo": "Lobos na neve",
      "tipo": "batalha",
      "peso": 2,
      "texto": "Lobos magros rondam o curral. Eles entram à noite e saem antes que alguém aprenda seus nomes.",
      "informacoes": "O ataque precisa alcançar a defesa da matilha. Seu escudo reduz o dano recebido, sem se desgastar.",
      "opcoes": [
        {
          "id": "guardar",
          "texto": "Montar guarda no curral.",
          "combate": true
        },
        {
          "id": "fogueiras",
          "texto": "Soltar fogueiras no curral.",
          "efeitos": {
            "habitantes": -2,
            "honra": -1
          },
          "resultado": "Os lobos recuam, o feno queima. Dois pastores culpam você e partem."
        }
      ],
      "batalha": {
        "defesa": 3,
        "vitoria": {
          "dano": 11,
          "efeitos": {
            "honra": 3,
            "gold": 2
          },
          "resultado": "A matilha foge deixando uma pele para vender. O curral dorme em paz."
        },
        "derrota": {
          "dano": 18,
          "efeitos": {},
          "resultado": "Os lobos rompem a cerca e levam o que podem. Você volta com mordidas e vergonha."
        },
        "penalidadeFalha": {
          "efeitos": {
            "habitantes": -3
          },
          "texto": "Três pastores desistem da vila."
        }
      },
      "imagem": "assets/batalha.svg",
      "imagemAlt": "Cena da vila durante lobos na neve"
    },
    {
      "id": "prisioneiro",
      "titulo": "A fuga do prisioneiro",
      "tipo": "desordem",
      "peso": 1,
      "requisitos": {
        "flagsAusentes": [
          "prisioneiro_decidido"
        ]
      },
      "pesos": [
        {
          "requisitos": {
            "honra": "baixa"
          },
          "valor": 5
        }
      ],
      "texto": "A tranca da cela foi arrombada por dentro. O prisioneiro foi pego na cerca, ferido, e pede para falar com você.",
      "informacoes": "Ele afirma que foi preso por roubar pão. Ninguém lembra o julgamento.",
      "opcoes": [
        {
          "id": "ouvir",
          "texto": "Ouvi-lo antes de decidir.",
          "requisitos": {
            "honraMin": -49
          },
          "efeitos": {
            "honra": 3,
            "gold": -2
          },
          "resultado": "A história é esquisita e quase verdadeira. Você paga o pão que ele roubou e solta o homem.",
          "flags": {
            "prisioneiro_decidido": true,
            "prisioneiro_solto": true
          }
        },
        {
          "id": "devolver",
          "texto": "Devolver à cela.",
          "efeitos": {
            "honra": -1
          },
          "resultado": "A tranca é consertada. O homem não grita; os outros presos também ouvem.",
          "flags": {
            "prisioneiro_decidido": true
          }
        },
        {
          "id": "enforcar",
          "texto": "Enforcá-lo como exemplo.",
          "requisitos": {
            "honraMax": -50
          },
          "efeitos": {
            "habitantes": -3,
            "honra": -6
          },
          "resultado": "Ninguém mais tenta fugir. Três famílias se mudam para longe da forca.",
          "flags": {
            "prisioneiro_decidido": true
          }
        }
      ],
      "imagem": "assets/vila.svg",
      "imagemAlt": "Cena da vila durante a fuga do prisioneiro"
    },
    {
      "id": "prisioneiro_volta",
      "titulo": "O prisioneiro volta",
      "tipo": "encontro",
      "peso": 3,
      "requisitos": {
        "rodadaMin": 10,
        "flags": [
          "prisioneiro_solto"
        ],
        "flagsAusentes": [
          "prisioneiro_pago"
        ]
      },
      "texto": "O homem que você soltou volta com uma mula e um saco. Diz que deve algo a alguém, e esse alguém é você.",
      "informacoes": "Ele não parece perigoso, mas parece decidido.",
      "opcoes": [
        {
          "id": "receber",
          "texto": "Receber o pagamento.",
          "efeitos": {
            "gold": 5,
            "honra": 2
          },
          "resultado": "O saco está cheio de sal e moedas. Ele pede um lugar na vila e promete nunca mais roubar pão.",
          "flags": {
            "prisioneiro_pago": true
          }
        },
        {
          "id": "guarda",
          "texto": "Pedir que fique como guarda.",
          "efeitos": {
            "ataque": 1,
            "habitantes": 1
          },
          "resultado": "Ele recusa a espada, mas ensina os guardas a encostar a lâmina no lugar certo.",
          "flags": {
            "prisioneiro_pago": true
          }
        },
        {
          "id": "seguir",
          "texto": "Mandá-lo seguir viagem.",
          "efeitos": {
            "honra": -1
          },
          "resultado": "Ele vira a mula e parte sem protestar. O saco fica pesado na sua consciência.",
          "flags": {
            "prisioneiro_pago": true
          }
        }
      ],
      "imagem": "assets/vila.svg",
      "imagemAlt": "Cena da vila durante o prisioneiro volta"
    },
    {
      "id": "cofre_vazio",
      "titulo": "O cofre vazio",
      "tipo": "desordem",
      "peso": 1,
      "requisitos": {
        "goldMin": 3
      },
      "pesos": [
        {
          "requisitos": {
            "honra": "baixa"
          },
          "valor": 5
        }
      ],
      "texto": "O cofre foi aberto durante a noite sem arrombar a fechadura. Apenas quem conhece o esconderijo poderia ter feito isso.",
      "informacoes": "Alguém próximo de você sabe onde guardas o ouro.",
      "opcoes": [
        {
          "id": "interrogar",
          "texto": "Interrogar a criadagem.",
          "efeitos": {
            "gold": -3,
            "honra": -3,
            "habitantes": -2
          },
          "resultado": "O culpado confessa para parar a dor. As moedas voltam em parte, a confiança, nunca."
        },
        {
          "id": "trocar",
          "texto": "Trocar o esconderijo e seguir em frente.",
          "efeitos": {
            "gold": -3
          },
          "resultado": "Você aprende a lição. A criadagem aprende que você a conhece."
        },
        {
          "id": "perdoar",
          "texto": "Perdoar o ladrão que se apresentar.",
          "requisitos": {
            "honraMin": 50
          },
          "efeitos": {
            "honra": 3,
            "habitantes": 1,
            "gold": -3
          },
          "resultado": "Um jovem cozinheiro devolve o que sobrou e pede perdão. Ele passa a vigiar o cofre do lado de dentro."
        }
      ],
      "imagem": "assets/vila.svg",
      "imagemAlt": "Cena da vila durante o cofre vazio"
    },
    {
      "id": "casamento",
      "titulo": "Casamento na praça",
      "tipo": "encontro",
      "peso": 2,
      "requisitos": {
        "honraMin": 30
      },
      "texto": "Dois jovens de famílias rivais querem casar sob a árvore velha. Os pais fingem que isso não está acontecendo.",
      "informacoes": "Um casamento pode unir a vila ou rachá-la ao meio.",
      "opcoes": [
        {
          "id": "presidir",
          "texto": "Presidir a cerimônia.",
          "efeitos": {
            "habitantes": 4,
            "honra": 3
          },
          "resultado": "As famílias dançam, de má vontade e depois de boa. Quatro parentes distantes pedem para ficar."
        },
        {
          "id": "salao",
          "texto": "Oferecer o salão de banquetes · 4 gold",
          "requisitos": {
            "goldMin": 4
          },
          "efeitos": {
            "habitantes": 5,
            "honra": 2,
            "gold": -4
          },
          "resultado": "A festa dura dois dias. Cinco convidados nunca mais voltam para casa."
        },
        {
          "id": "dote",
          "texto": "Pedir um dote ao noivo.",
          "efeitos": {
            "gold": 5,
            "honra": -3
          },
          "resultado": "A cerimônia ocorre sem alegria. Os jovens se casam, e ninguém dança."
        }
      ],
      "imagem": "assets/vila.svg",
      "imagemAlt": "Cena da vila durante casamento na praça"
    },
    {
      "id": "seca",
      "titulo": "A seca",
      "tipo": "mandatorio",
      "peso": 1,
      "texto": "As nuvens passam sem parar. Os poços descem, e os campos racham. À noite, você divide sua água com quem não tem.",
      "informacoes": "A seca não negocia. Resta decidir como atravessá-la.",
      "opcoes": [
        {
          "id": "repartir",
          "texto": "Repartir a água com todos.",
          "efeitos": {
            "honra": 2,
            "hp": -8,
            "habitantes": -3
          },
          "resultado": "A água dura até a chuva. Três famílias partem em busca de terras mais úmidas; o resto fica, mais magro e mais unido."
        }
      ],
      "imagem": "assets/vila.svg",
      "imagemAlt": "Cena da vila durante a seca"
    },
    {
      "id": "padre",
      "titulo": "O padre sem igreja",
      "tipo": "encontro",
      "peso": 2,
      "requisitos": {
        "flagsAusentes": [
          "padre_decidido"
        ]
      },
      "texto": "Um padre de batina remendada pede abrigo. Diz que sua igreja ardeu e que ainda tem fé, mas não tem teto.",
      "informacoes": "A fé pode ser um bom alicerce ou um bom pretexto.",
      "opcoes": [
        {
          "id": "celeiro",
          "texto": "Dar o celeiro velho como capela.",
          "efeitos": {
            "habitantes": 3,
            "honra": 2
          },
          "resultado": "O padre varre o chão e acende duas velas. Três famílias passam a frequentar.",
          "flags": {
            "padre_decidido": true,
            "padre_aceito": true,
            "capela_erguida": true
          }
        },
        {
          "id": "dizimo",
          "texto": "Exigir um dízimo para ficar.",
          "efeitos": {
            "gold": 4,
            "honra": -3
          },
          "resultado": "O padre paga e agradece em latim. O povo percebe a transação e para de se confessar.",
          "flags": {
            "padre_decidido": true,
            "padre_aceito": true
          }
        },
        {
          "id": "recusar",
          "texto": "Recusar abrigo.",
          "efeitos": {
            "honra": -2
          },
          "resultado": "Ele ergue a mão num gesto que pode ser bênção ou ameaça, e segue.",
          "flags": {
            "padre_decidido": true
          }
        }
      ],
      "imagem": "assets/vila.svg",
      "imagemAlt": "Cena da vila durante o padre sem igreja"
    },
    {
      "id": "capela",
      "titulo": "A capela",
      "tipo": "encontro",
      "peso": 3,
      "requisitos": {
        "rodadaMin": 8,
        "flags": [
          "padre_aceito"
        ],
        "flagsAusentes": [
          "capela_decidida"
        ]
      },
      "texto": "O padre pede pedras e mãos para erguer uma capela de verdade. A vila discute se prefere um teto novo ou um sino.",
      "informacoes": "A capela pode trazer paz ou apenas mais uma conta.",
      "opcoes": [
        {
          "id": "erguer",
          "texto": "Erguer a capela com o povo.",
          "efeitos": {
            "habitantes": 5,
            "honra": 3,
            "hp": -6
          },
          "resultado": "Você carrega pedras até cair de sono. A capela ergue-se torta e bela, e cinco famílias pedem para ficar.",
          "flags": {
            "capela_decidida": true,
            "capela_erguida": true
          }
        },
        {
          "id": "pagar",
          "texto": "Pagar pedreiros · 5 gold",
          "requisitos": {
            "goldMin": 5
          },
          "efeitos": {
            "habitantes": 4,
            "honra": 2,
            "gold": -5
          },
          "resultado": "A capela fica reta e fria. Quatro viajantes ficam por causa do sino.",
          "flags": {
            "capela_decidida": true,
            "capela_erguida": true
          }
        },
        {
          "id": "dispensar",
          "texto": "Dispensar o padre.",
          "efeitos": {
            "honra": -3,
            "habitantes": -2
          },
          "resultado": "O padre parte com o sino debaixo do braço. Duas famílias, devotas, o acompanham.",
          "flags": {
            "capela_decidida": true
          }
        }
      ],
      "imagem": "assets/vila.svg",
      "imagemAlt": "Cena da vila durante a capela"
    },
    {
      "id": "menino_vai_embora",
      "titulo": "O menino vai embora",
      "tipo": "encontro",
      "peso": 3,
      "requisitos": {
        "rodadaMin": 8,
        "flags": [
          "orfao_explorado"
        ],
        "flagsAusentes": [
          "orfao_resolvido"
        ]
      },
      "texto": "O menino que carregava sacos fez uma trouxa menor do que as dívidas que você lhe deve. Ele está parado no portão e não chora.",
      "informacoes": "Os moradores esperam para ver o que o senhor fará.",
      "opcoes": [
        {
          "id": "perdao",
          "texto": "Pedir perdão e oferecer lugar à mesa.",
          "requisitos": {
            "honraMin": -49
          },
          "efeitos": {
            "habitantes": 2,
            "honra": 4
          },
          "resultado": "Ele pensa por muito tempo. Fica, mas com a porta aberta. A vila respira.",
          "flags": {
            "orfao_resolvido": true
          }
        },
        {
          "id": "pagar",
          "texto": "Pagar pelo trabalho que ele fez · 3 gold",
          "requisitos": {
            "goldMin": 3
          },
          "efeitos": {
            "honra": 2,
            "gold": -3
          },
          "resultado": "Ele conta as moedas duas vezes e parte. Os moradores o acompanham com os olhos até a curva.",
          "flags": {
            "orfao_resolvido": true
          }
        },
        {
          "id": "trancar",
          "texto": "Mandar os guardas trancarem o portão.",
          "efeitos": {
            "habitantes": -3,
            "honra": -5
          },
          "resultado": "O portão é fechado, o menino não. Ele sai por uma brecha, e três famílias vão atrás dele.",
          "flags": {
            "orfao_resolvido": true
          }
        }
      ],
      "imagem": "assets/vila.svg",
      "imagemAlt": "Cena da vila durante o menino vai embora"
    },
    {
      "id": "cinzas_da_praga",
      "titulo": "Cinzas da praga",
      "tipo": "desordem",
      "peso": 4,
      "requisitos": {
        "flags": [
          "praga_entrou"
        ],
        "flagsAusentes": [
          "cinzas_resolvidas"
        ]
      },
      "texto": "As casas dos mortos continuam fechadas. Há quem queira queimá-las, quem queira saqueá-las, e quem não queira ir lá.",
      "informacoes": "A febre passou, mas deixou perguntas.",
      "opcoes": [
        {
          "id": "queimar",
          "texto": "Queimar as casas com respeito.",
          "efeitos": {
            "honra": 3,
            "hp": -5
          },
          "resultado": "A fumaça sobe devagar. Você respira cinzas, mas ninguém mais adoece.",
          "flags": {
            "cinzas_resolvidas": true
          }
        },
        {
          "id": "recolher",
          "texto": "Permitir que os parentes recolham os bens.",
          "efeitos": {
            "honra": 2,
            "habitantes": -3
          },
          "resultado": "Alguns parentes levam mais que o necessário e partem com a carga. Três famílias seguem por perto.",
          "flags": {
            "cinzas_resolvidas": true
          }
        },
        {
          "id": "tomar",
          "texto": "Tomar os bens para o cofre.",
          "efeitos": {
            "gold": 6,
            "honra": -5,
            "habitantes": -2
          },
          "resultado": "Seus guardas esvaziam as casas. As moedas pesam no cofre, e as famílias no peito.",
          "flags": {
            "cinzas_resolvidas": true
          }
        }
      ],
      "imagem": "assets/vila.svg",
      "imagemAlt": "Cena da vila durante cinzas da praga"
    },
    {
      "id": "imunes",
      "titulo": "Os que ficaram de pé",
      "tipo": "encontro",
      "peso": 2,
      "requisitos": {
        "flags": [
          "praga_evitada"
        ],
        "flagsAusentes": [
          "imunes_decidido"
        ]
      },
      "texto": "A curandeira diz que a vila nunca esteve tão saudável. Ela pergunta, sem acusar, se o senhor sabia mais do que contou.",
      "informacoes": "A praga que não chegou ainda circula nas conversas.",
      "opcoes": [
        {
          "id": "verdade",
          "texto": "Contar a verdade.",
          "efeitos": {
            "honra": 2,
            "habitantes": 2
          },
          "resultado": "A praça ouve em silêncio. Duas famílias que temiam partir decidem ficar.",
          "flags": {
            "imunes_decidido": true
          }
        },
        {
          "id": "sorte",
          "texto": "Dizer que foi sorte.",
          "efeitos": {
            "honra": 1
          },
          "resultado": "A curandeira concorda sem acreditar. O povo prefere a versão simples.",
          "flags": {
            "imunes_decidido": true
          }
        },
        {
          "id": "cobrar",
          "texto": "Cobrar pelas ervas protetoras",
          "requisitos": {
            "honraMax": -30
          },
          "efeitos": {
            "gold": 5,
            "honra": -4
          },
          "resultado": "A vila paga, sem entender pelo quê. A curandeira nota e não diz nada.",
          "flags": {
            "imunes_decidido": true
          }
        }
      ],
      "imagem": "assets/vila.svg",
      "imagemAlt": "Cena da vila durante os que ficaram de pé"
    },
    {
      "id": "carta_do_velho",
      "titulo": "A carta do velho senhor",
      "tipo": "encontro",
      "peso": 3,
      "requisitos": {
        "rodadaMin": 8,
        "flags": [
          "testamento_lido"
        ],
        "flagsAusentes": [
          "carta_lida"
        ]
      },
      "texto": "Um antigo servo traz um envelope que o velho senhor mandou guardar. Diz que só deveria entregá-lo quando você hesitasse.",
      "informacoes": "A carta é breve e não explica quase nada.",
      "opcoes": [
        {
          "id": "ler",
          "texto": "Ler em voz alta para a vila.",
          "efeitos": {
            "honra": 3,
            "habitantes": 2
          },
          "resultado": "A carta pede paciência ao povo. Dois moradores choram e outros dois decidem ficar.",
          "flags": {
            "carta_lida": true
          }
        },
        {
          "id": "guardar",
          "texto": "Ler a sós e guardá-la.",
          "efeitos": {
            "honra": 1
          },
          "resultado": "A carta tem uma frase que você relê três vezes. O servo não pergunta o que diz.",
          "flags": {
            "carta_lida": true
          }
        },
        {
          "id": "queimar",
          "texto": "Queimar sem ler.",
          "efeitos": {
            "honra": -3
          },
          "resultado": "O papel vira cinza. O servo faz o sinal da cruz e parte para sempre.",
          "flags": {
            "carta_lida": true
          }
        }
      ],
      "imagem": "assets/vila.svg",
      "imagemAlt": "Cena da vila durante a carta do velho senhor"
    },
    {
      "id": "rosto_do_velho",
      "titulo": "O rosto do velho senhor",
      "tipo": "encontro",
      "peso": 3,
      "requisitos": {
        "rodadaMin": 12,
        "flags": [
          "carta_lida"
        ],
        "flagsAusentes": [
          "rosto_decidido"
        ]
      },
      "texto": "Uma velha na praça diz que você tem o olhar do senhor anterior. Não sabe se é elogio.",
      "informacoes": "Sua reputação agora tem um predecessor com quem comparar.",
      "opcoes": [
        {
          "id": "perguntar",
          "texto": "Perguntar o que ela recorda.",
          "efeitos": {
            "honra": 2,
            "hp": -2
          },
          "resultado": "A história é longa e triste. Você sai com o peito mais pesado e a vila, mais próxima.",
          "flags": {
            "rosto_decidido": true
          },
          "desbloqueia": {
            "flags": [
              "senhor_compreendido"
            ]
          }
        },
        {
          "id": "outro",
          "texto": "Dizer que você é outro homem.",
          "efeitos": {
            "honra": 1
          },
          "resultado": "A velha sorri sem concordar. O povo observa se o olhar muda.",
          "flags": {
            "rosto_decidido": true
          }
        },
        {
          "id": "calar",
          "texto": "Mandar calar a velha.",
          "requisitos": {
            "honraMax": -30
          },
          "efeitos": {
            "honra": -4,
            "habitantes": -2
          },
          "resultado": "A velha cala. Duas famílias, que também lembravam do velho senhor, partem na mesma noite.",
          "flags": {
            "rosto_decidido": true
          }
        }
      ],
      "imagem": "assets/vila.svg",
      "imagemAlt": "Cena da vila durante o rosto do velho senhor"
    },
    {
      "id": "incendio",
      "titulo": "O celeiro em chamas",
      "tipo": "mandatorio",
      "peso": 1,
      "texto": "O fogo começa no celeiro e pula para o telhado vizinho. Você corre com baldes ao lado do povo, sem saber quem acendeu.",
      "informacoes": "O fogo não pergunta quem é o senhor.",
      "opcoes": [
        {
          "id": "combater",
          "texto": "Combater o fogo com o povo.",
          "efeitos": {
            "honra": 2,
            "hp": -8,
            "habitantes": -2
          },
          "resultado": "As chamas cedem ao amanhecer. Duas famílias, sem teto, seguem para o sul."
        }
      ],
      "imagem": "assets/vila.svg",
      "imagemAlt": "Cena da vila durante o celeiro em chamas"
    },
    {
      "id": "ladroes_estrada",
      "titulo": "Ladrões na estrada",
      "tipo": "batalha",
      "peso": 2,
      "texto": "Uma carroça de grãos foi cercada na curva do bosque. O cocheiro volta a pé, sem a carroça e sem o chapéu.",
      "informacoes": "O ataque precisa alcançar a defesa dos ladrões. Seu escudo reduz o dano recebido, sem se desgastar.",
      "opcoes": [
        {
          "id": "perseguir",
          "texto": "Perseguir os ladrões.",
          "combate": true
        },
        {
          "id": "pagar",
          "texto": "Pagar o resgate da carga · 4 gold",
          "requisitos": {
            "goldMin": 4
          },
          "efeitos": {
            "gold": -4,
            "honra": -1
          },
          "resultado": "A carga volta, e os ladrões, em breve."
        }
      ],
      "batalha": {
        "defesa": 3,
        "vitoria": {
          "dano": 11,
          "efeitos": {
            "honra": 3,
            "gold": 4
          },
          "resultado": "Os ladrões largam a carga e correm. O cocheiro recupera o chapéu e promete contar a história por anos."
        },
        "derrota": {
          "dano": 18,
          "efeitos": {},
          "resultado": "Os ladrões conhecem o bosque melhor que seus homens. Você volta com mais cortes do que provas."
        },
        "penalidadeFalha": {
          "efeitos": {
            "gold": -3,
            "habitantes": -2
          },
          "texto": "O resgate leva 3 gold e dois ajudantes desistem de seguir viagem."
        }
      },
      "imagem": "assets/batalha.svg",
      "imagemAlt": "Cena da vila durante ladrões na estrada"
    },
    {
      "id": "torneio",
      "titulo": "O torneio da aldeia",
      "tipo": "encontro",
      "peso": 2,
      "texto": "Os jovens querem testar quem dá o melhor golpe com bastões de madeira. Um deles já escolheu seu adversário: você.",
      "informacoes": "Um torneio humilde ainda é um torneio.",
      "opcoes": [
        {
          "id": "aceitar",
          "texto": "Aceitar o desafio.",
          "efeitos": {
            "ataque": 1,
            "honra": 2,
            "hp": -6
          },
          "resultado": "Você perde dois rounds e ganha o terceiro por teimosia. A praça aplaude, e seu ombro, não."
        },
        {
          "id": "premiar",
          "texto": "Premiar o vencedor · 3 gold",
          "requisitos": {
            "goldMin": 3
          },
          "efeitos": {
            "habitantes": 3,
            "honra": 2,
            "gold": -3
          },
          "resultado": "O vencedor ganha uma bolsa e a fama de ser seu favorito. Três jovens pedem para treinar na vila."
        },
        {
          "id": "proibir",
          "texto": "Proibir o torneio.",
          "efeitos": {
            "honra": -2,
            "habitantes": -1
          },
          "resultado": "Os bastões voltam aos fornos. Um jovem desistiu de ficar e tira a vila da lista dos seus planos."
        }
      ],
      "imagem": "assets/forja.svg",
      "imagemAlt": "Cena da vila durante o torneio da aldeia"
    },
    {
      "id": "arauto_do_rei",
      "titulo": "O arauto do rei",
      "tipo": "encontro",
      "peso": 1,
      "requisitos": {
        "rodadaMin": 6,
        "flagsAusentes": [
          "arauto_decidido"
        ]
      },
      "texto": "Um arauto de tabardo limpo anuncia que o rei quer saber quantos homens a vila pode oferecer à guerra. A voz dele é maior que o corpo.",
      "informacoes": "O rei está distante, mas a convocação nunca esteve tão perto.",
      "opcoes": [
        {
          "id": "enviar",
          "texto": "Enviar soldados e cumprir o dever.",
          "efeitos": {
            "gold": 5,
            "honra": 1,
            "habitantes": -4
          },
          "resultado": "Quatro jovens partem com lanças emprestadas. O arauto paga e escreve seu nome num rolo que você não vê.",
          "flags": {
            "arauto_decidido": true
          }
        },
        {
          "id": "alegar",
          "texto": "Alegar que a vila é pobre.",
          "efeitos": {
            "honra": -2
          },
          "resultado": "O arauto anota \"pobre\" sem acreditar. Não promete nada, mas também não ameaça.",
          "flags": {
            "arauto_decidido": true
          }
        },
        {
          "id": "negociar",
          "texto": "Negociar um tributo em grãos.",
          "requisitos": {
            "honraMin": 50
          },
          "efeitos": {
            "honra": 2,
            "gold": -3
          },
          "resultado": "O arauto aceita grãos em vez de homens. O povo percebe e agradece com o silêncio de quem quer dizer mais.",
          "flags": {
            "arauto_decidido": true
          }
        }
      ],
      "imagem": "assets/vila.svg",
      "imagemAlt": "Cena da vila durante o arauto do rei"
    },
    {
      "id": "espiao",
      "titulo": "O espião de sotaque estranho",
      "tipo": "encontro",
      "peso": 1,
      "texto": "Um forasteiro pergunta demais sobre o moinho, o celeiro e a idade dos guardas. Diz que é só curiosidade, e cada pergunta tem um carimbo diferente.",
      "informacoes": "Ele pode ser um espião, ou apenas um sujeito muito curioso.",
      "opcoes": [
        {
          "id": "seguir",
          "texto": "Segui-lo discretamente.",
          "efeitos": {
            "honra": 2,
            "gold": 3,
            "hp": -4
          },
          "resultado": "Você descobre que ele anota tudo em código. O forasteiro foge, deixando o dinheiro para trás."
        },
        {
          "id": "prender",
          "texto": "Prendê-lo para interrogar.",
          "efeitos": {
            "honra": -3
          },
          "resultado": "A prisão só rende negativas. Os moradores perguntam se prender curiosos agora é norma da vila."
        },
        {
          "id": "conversar",
          "texto": "Oferecer-lhe um copo e conversar.",
          "requisitos": {
            "honraMin": 50
          },
          "efeitos": {
            "honra": 3,
            "habitantes": 2
          },
          "resultado": "Ele era apenas um cartógrafo em dificuldade. Seu mapa leva dois colonos até a vila."
        }
      ],
      "imagem": "assets/vila.svg",
      "imagemAlt": "Cena da vila durante o espião de sotaque estranho"
    },
    {
      "id": "bruxa",
      "titulo": "A bruxa da floresta",
      "tipo": "encontro",
      "peso": 2,
      "texto": "Uma mulher de olhos cansados oferece uma poção em troca de uma conversa. Os moradores a chamam de bruxa; ela não discorda nem confirma.",
      "informacoes": "Ninguém sabe se a poção cura ou apenas colore a língua.",
      "opcoes": [
        {
          "id": "beber",
          "texto": "Beber a poção.",
          "efeitos": {
            "hp": 14,
            "honra": 1,
            "gold": -2
          },
          "resultado": "A poção tem gosto de terra e promessa. Você recupera catorze de vida e uma sensação de dívida."
        },
        {
          "id": "ouvir",
          "texto": "Ouvi-la em vez de comprar.",
          "efeitos": {
            "honra": 3
          },
          "resultado": "Ela fala do bosque, das raízes e dos ancestrais. Ninguém na vila sabe o que você ouviu."
        },
        {
          "id": "acusar",
          "texto": "Acusá-la perante o povo.",
          "requisitos": {
            "honraMax": -30
          },
          "efeitos": {
            "honra": -5,
            "habitantes": -3
          },
          "resultado": "A mulher desaparece antes do julgamento. Três moradores, que a conheciam, partem para protegê-la."
        }
      ],
      "imagem": "assets/vila.svg",
      "imagemAlt": "Cena da vila durante a bruxa da floresta"
    },
    {
      "id": "feira",
      "titulo": "A feira da colheita",
      "tipo": "encontro",
      "peso": 2,
      "requisitos": {
        "honraMin": 30
      },
      "texto": "Os moradores montaram bancas sem que ninguém mandasse. Há pão, couro, ferro, e um único espelho que ninguém conseguiu vender.",
      "informacoes": "A feira é pequena, mas pode ser o começo de algo.",
      "opcoes": [
        {
          "id": "isentar",
          "texto": "Isentar as bancas de taxas.",
          "efeitos": {
            "habitantes": 6,
            "honra": 3
          },
          "resultado": "A feira lota e dura até a noite. Seis comerciantes pedem para ficar."
        },
        {
          "id": "cobrar",
          "texto": "Cobrar uma taxa mínima.",
          "efeitos": {
            "gold": 5,
            "honra": 1
          },
          "resultado": "A taxa é pequena e a reclamação também. O cofre agradece em silêncio."
        },
        {
          "id": "espelho",
          "texto": "Comprar o espelho · 3 gold",
          "requisitos": {
            "goldMin": 3
          },
          "efeitos": {
            "honra": 2,
            "habitantes": 1,
            "gold": -3
          },
          "resultado": "Você olha o reflexo por um tempo. O mercador sorri e anuncia que a vila é uma boa praça."
        }
      ],
      "imagem": "assets/vila.svg",
      "imagemAlt": "Cena da vila durante a feira da colheita"
    },
    {
      "id": "julgamento",
      "titulo": "O julgamento na praça",
      "tipo": "desordem",
      "peso": 1,
      "pesos": [
        {
          "requisitos": {
            "honra": "baixa"
          },
          "valor": 5
        }
      ],
      "texto": "Um camponês acusa o vizinho de mover as pedras do limite. O vizinho jura que as pedras se moveram sozinhas.",
      "informacoes": "Ninguém sabe quem mente. A vila espera uma sentença.",
      "opcoes": [
        {
          "id": "medir",
          "texto": "Medir o terreno com cuidado.",
          "requisitos": {
            "honraMin": -49
          },
          "efeitos": {
            "honra": 3,
            "hp": -3
          },
          "resultado": "A fita mostra que as pedras de fato se moveram, por erro de ambos. Os dois riem, relutantes."
        },
        {
          "id": "dividir",
          "texto": "Dividir o terreno pela metade.",
          "efeitos": {
            "honra": 1,
            "habitantes": -1
          },
          "resultado": "Ninguém fica satisfeito. Um dos vizinhos parte, achando justiça demais para si."
        },
        {
          "id": "condenar",
          "texto": "Condenar o mais pobre.",
          "requisitos": {
            "honraMax": -50
          },
          "efeitos": {
            "gold": 3,
            "honra": -4,
            "habitantes": -2
          },
          "resultado": "A multa é paga com o único boi da família. A praça se esvazia mais cedo do que o habitual."
        }
      ],
      "imagem": "assets/vila.svg",
      "imagemAlt": "Cena da vila durante o julgamento na praça"
    },
    {
      "id": "pregador",
      "titulo": "O pregador furioso",
      "tipo": "desordem",
      "peso": 2,
      "texto": "Um homem sobe na carroça e grita que a vila vive em pecado. Metade ri; a outra metade já está silenciosa.",
      "informacoes": "A fúria do pregador cresce com a plateia.",
      "opcoes": [
        {
          "id": "ouvir",
          "texto": "Ouvi-lo até o fim.",
          "efeitos": {
            "honra": 1,
            "habitantes": -1
          },
          "resultado": "Ao fim, ninguém sabe se foi ofendido ou convertido. Um homem parte sem despedida."
        },
        {
          "id": "mesa",
          "texto": "Levá-lo à mesa com os padres e anciãos.",
          "requisitos": {
            "honraMin": 30
          },
          "efeitos": {
            "honra": 2,
            "habitantes": 2
          },
          "resultado": "À mesa, o pregador cansa de gritar e começa a conversar. Duas famílias, aliviadas, decidem ficar."
        },
        {
          "id": "arrastar",
          "texto": "Mandar os guardas arrastá-lo.",
          "efeitos": {
            "honra": -3,
            "habitantes": -3
          },
          "resultado": "O pregador vira mártir em uma tarde. Três famílias o seguem para fora da vila."
        }
      ],
      "imagem": "assets/vila.svg",
      "imagemAlt": "Cena da vila durante o pregador furioso"
    },
    {
      "id": "mercador_de_gente",
      "titulo": "O mercador de gente",
      "tipo": "encontro",
      "peso": 1,
      "requisitos": {
        "rodadaMin": 5
      },
      "texto": "Uma carroça de grades passa pelo portão. Sob a lona, rostos cansados observam em silêncio. O mercador oferece duas bocas a mais pelo preço de um jantar.",
      "informacoes": "Há coisas que não se compram, mas se vendem.",
      "opcoes": [
        {
          "id": "libertar",
          "texto": "Comprar a liberdade deles · 5 gold",
          "requisitos": {
            "goldMin": 5
          },
          "efeitos": {
            "habitantes": 4,
            "honra": 4,
            "gold": -5
          },
          "resultado": "Quatro pessoas descem da carroça. O mercador conta as moedas e olha para trás sem falar."
        },
        {
          "id": "abrigar",
          "texto": "Dar-lhe uma noite de abrigo e seguir.",
          "efeitos": {
            "honra": -3
          },
          "resultado": "A carroça parte antes da aurora. Alguns moradores evitam seu olhar na manhã seguinte."
        },
        {
          "id": "atacar",
          "texto": "Atacar o mercador.",
          "requisitos": {
            "honraMin": 50
          },
          "efeitos": {
            "habitantes": 6,
            "honra": 3,
            "hp": -8
          },
          "resultado": "Os guardas ajudam a rendê-lo. Seis pessoas ficam na vila, e as grades viram lenha."
        },
        {
          "id": "servir",
          "texto": "Comprar uma pessoa para servir.",
          "requisitos": {
            "honraMax": -50
          },
          "efeitos": {
            "gold": 3,
            "honra": -8,
            "habitantes": -3
          },
          "resultado": "O servo trabalha de olhos baixos. Três moradores partem à noite, sem bater a porta."
        }
      ],
      "imagem": "assets/vila.svg",
      "imagemAlt": "Cena da vila durante o mercador de gente"
    },
    {
      "id": "fera_da_floresta",
      "titulo": "A fera da floresta",
      "tipo": "batalha",
      "peso": 1,
      "requisitos": {
        "rodadaMin": 9
      },
      "texto": "Um urso enorme invadiu a plantação. Os lavradores olham para você e para o urso, nessa ordem.",
      "informacoes": "O ataque precisa alcançar a defesa da fera. Seu escudo reduz o dano recebido, sem se desgastar.",
      "opcoes": [
        {
          "id": "enfrentar",
          "texto": "Enfrentar a fera.",
          "combate": true
        },
        {
          "id": "isca",
          "texto": "Atrair o urso com isca · 3 gold",
          "requisitos": {
            "goldMin": 3
          },
          "efeitos": {
            "honra": 1,
            "gold": -3,
            "hp": -3
          },
          "resultado": "A isca funciona, quase. Você ganha um arranhão e a promessa de que o urso não voltará."
        },
        {
          "id": "ceder",
          "texto": "Deixar a floresta em paz.",
          "efeitos": {
            "habitantes": -5,
            "honra": -1
          },
          "resultado": "A plantação vira refeição. Cinco lavradores migram para campos mais seguros."
        }
      ],
      "batalha": {
        "defesa": 6,
        "vitoria": {
          "dano": 18,
          "efeitos": {
            "honra": 4,
            "gold": 5,
            "habitantes": 2
          },
          "resultado": "A pele rende 5 gold. Dois lavradores, impressionados, decidem ficar."
        },
        "derrota": {
          "dano": 28,
          "efeitos": {},
          "resultado": "A fera derruba tudo que tenta contê-la. Você é arrastado para fora da plantação, com a dignidade intacta, ao menos."
        },
        "penalidadeFalha": {
          "efeitos": {
            "habitantes": -4
          },
          "texto": "Quatro lavradores deixam as terras."
        }
      },
      "imagem": "assets/batalha.svg",
      "imagemAlt": "Cena da vila durante a fera da floresta"
    },
    {
      "id": "mina_esquecida",
      "titulo": "A mina esquecida",
      "tipo": "encontro",
      "peso": 2,
      "requisitos": {
        "rodadaMin": 5,
        "flagsAusentes": [
          "mina_decidida"
        ]
      },
      "texto": "Crianças acharam uma entrada coberta de cipó atrás do moinho. Dentro, há tábuas apodrecidas e um brilho que talvez seja ferro.",
      "informacoes": "Minas velhas guardam riqueza e armadilhas.",
      "opcoes": [
        {
          "id": "reabrir",
          "texto": "Reabrir a mina com escoras novas · 5 gold",
          "requisitos": {
            "goldMin": 5
          },
          "efeitos": {
            "habitantes": 4,
            "honra": 2,
            "gold": 1
          },
          "resultado": "As escoras seguram. Quatro mineiros mudam para a vila, e a primeira carga já paga parte da obra.",
          "flags": {
            "mina_decidida": true,
            "mina_aberta": true
          }
        },
        {
          "id": "entrar",
          "texto": "Entrar sozinho para avaliar.",
          "efeitos": {
            "gold": 4,
            "honra": 2,
            "hp": -8
          },
          "resultado": "Você sai com ferro, poeira e uma ideia ruim para o futuro. A mina fica aberta, e ninguém a vigia.",
          "flags": {
            "mina_decidida": true,
            "mina_aberta": true
          }
        },
        {
          "id": "lacrar",
          "texto": "Lacrar a entrada.",
          "efeitos": {
            "honra": 1
          },
          "resultado": "As crianças reclamam, os pais agradecem. O brilho continua lá dentro, esperando.",
          "flags": {
            "mina_decidida": true
          }
        }
      ],
      "imagem": "assets/vila.svg",
      "imagemAlt": "Cena da vila durante a mina esquecida"
    },
    {
      "id": "desabamento",
      "titulo": "O desabamento",
      "tipo": "mandatorio",
      "peso": 4,
      "requisitos": {
        "rodadaMin": 9,
        "flags": [
          "mina_aberta"
        ],
        "flagsAusentes": [
          "desabamento_ocorrido"
        ]
      },
      "texto": "A terra treme sob os pés. Um som surdo vem de dentro da mina, e os gritos chegam depois. Você corre.",
      "informacoes": "Aquilo que se abre sem cuidado pode se fechar sem aviso.",
      "opcoes": [
        {
          "id": "resgatar",
          "texto": "Entrar para resgatar os mineiros.",
          "efeitos": {
            "honra": 3,
            "hp": -12,
            "habitantes": -4
          },
          "resultado": "Você tira cinco homens da escuridão. Quatro outros ficam para sempre. A mina é lacrada pela segunda vez.",
          "flags": {
            "desabamento_ocorrido": true
          }
        }
      ],
      "imagem": "assets/vila.svg",
      "imagemAlt": "Cena da vila durante o desabamento"
    },
    {
      "id": "irmaos_rivais",
      "titulo": "Os irmãos rivais",
      "tipo": "desordem",
      "peso": 2,
      "texto": "Dois irmãos herdaram a mesma casa e o mesmo ressentimento. Levam a briga à praça, onde ela cresce como se tivesse sido semeada.",
      "informacoes": "A vila escolhe lados rápido, e o senhor, mais devagar.",
      "opcoes": [
        {
          "id": "dividir",
          "texto": "Dividir a casa em duas.",
          "efeitos": {
            "honra": 1,
            "gold": -1
          },
          "resultado": "Um muro é erguido ao meio. Eles se falam pelos buracos entre as tábuas."
        },
        {
          "id": "juntos",
          "texto": "Fazer os dois trabalharem juntos.",
          "requisitos": {
            "honraMin": 30
          },
          "efeitos": {
            "honra": 3,
            "habitantes": 2
          },
          "resultado": "Cansados de cavar lado a lado, os irmãos acabam almoçando juntos. Duas famílias, ao ver, ficam."
        },
        {
          "id": "tomar",
          "texto": "Tomar a casa para a vila.",
          "efeitos": {
            "gold": 4,
            "honra": -4,
            "habitantes": -2
          },
          "resultado": "Os irmãos partem em direções opostas. A casa vira armazém, e ninguém a chama de lar."
        }
      ],
      "imagem": "assets/vila.svg",
      "imagemAlt": "Cena da vila durante os irmãos rivais"
    },
    {
      "id": "estalajadeira",
      "titulo": "A estalajadeira",
      "tipo": "encontro",
      "peso": 2,
      "texto": "Uma mulher quer abrir uma estalagem na estrada da vila. Já tem as panelas, o nome e a paciência; só falta a licença do senhor.",
      "informacoes": "Estalagens trazem viajantes, e viajantes trazem notícias.",
      "opcoes": [
        {
          "id": "conceder",
          "texto": "Conceder a licença.",
          "efeitos": {
            "habitantes": 4,
            "honra": 2
          },
          "resultado": "A estalagem abre com dois quartos e um cachorro. Quatro viajantes ficam por causa da sopa."
        },
        {
          "id": "taxa",
          "texto": "Cobrar uma taxa anual",
          "efeitos": {
            "gold": 4,
            "honra": -2
          },
          "resultado": "A estalajadeira paga, mas ajusta os preços. A sopa fica mais rala."
        },
        {
          "id": "negar",
          "texto": "Negar a licença.",
          "efeitos": {
            "honra": -2,
            "habitantes": -1
          },
          "resultado": "Ela carrega as panelas de volta pela estrada. O cachorro olha para trás."
        }
      ],
      "imagem": "assets/vila.svg",
      "imagemAlt": "Cena da vila durante a estalajadeira"
    },
    {
      "id": "ratos",
      "titulo": "Ratos no celeiro",
      "tipo": "encontro",
      "peso": 2,
      "texto": "Os ratos chegaram em ondas, mastigando sacos e dignidade. O celeireiro propõe soluções que ninguém entende.",
      "informacoes": "Um celeiro roído é um inverno mais duro.",
      "opcoes": [
        {
          "id": "gatos",
          "texto": "Trazer gatos de outras aldeias · 2 gold",
          "requisitos": {
            "goldMin": 2
          },
          "efeitos": {
            "habitantes": 2,
            "honra": 1,
            "gold": -2
          },
          "resultado": "Os gatos chegam em uma carroça e se instalam como senhores. Os ratos, de repente, têm compromissos em outros lugares."
        },
        {
          "id": "cacar",
          "texto": "Caçar os ratos com o povo.",
          "efeitos": {
            "honra": 2,
            "hp": -4
          },
          "resultado": "A noite é longa e ridícula. Você leva três mordidas e um título secreto: \"Senhor dos Ratos\"."
        },
        {
          "id": "queimar",
          "texto": "Queimar o celeiro velho.",
          "requisitos": {
            "honraMax": -30
          },
          "efeitos": {
            "honra": -4,
            "habitantes": -3
          },
          "resultado": "Os ratos fogem e os grãos também. Três famílias seguem os ratos para fora da vila."
        }
      ],
      "imagem": "assets/vila.svg",
      "imagemAlt": "Cena da vila durante ratos no celeiro"
    },
    {
      "id": "cometa",
      "titulo": "O corpo no céu",
      "tipo": "mandatorio",
      "peso": 1,
      "requisitos": {
        "flagsAusentes": [
          "cometa_visto"
        ]
      },
      "texto": "Uma estrela com cauda atravessa o céu por três noites. Os velhos se benzem, os jovens apontam, os cães uivam sem parar.",
      "informacoes": "Ninguém sabe o que ela anuncia, mas todos têm uma opinião.",
      "opcoes": [
        {
          "id": "observar",
          "texto": "Observar com o povo.",
          "efeitos": {
            "honra": 1,
            "hp": -3
          },
          "resultado": "Você passa as noites ao relento e pega um resfriado. A vila, que dormia mal, passa a dormir pior.",
          "flags": {
            "cometa_visto": true
          }
        }
      ],
      "imagem": "assets/vila.svg",
      "imagemAlt": "Cena da vila durante o corpo no céu"
    },
    {
      "id": "profeta_do_cometa",
      "titulo": "O profeta do cometa",
      "tipo": "desordem",
      "peso": 3,
      "requisitos": {
        "flags": [
          "cometa_visto"
        ],
        "flagsAusentes": [
          "profeta_decidido"
        ]
      },
      "texto": "Um homem com olhos acesos prega que o fim chega pelo céu. Metade da praça acredita; a outra metade ainda não decidiu.",
      "informacoes": "O medo é a moeda mais barata e a mais cara.",
      "opcoes": [
        {
          "id": "desmentir",
          "texto": "Desmentir o profeta com calma.",
          "requisitos": {
            "honraMin": 30
          },
          "efeitos": {
            "honra": 3,
            "habitantes": 2
          },
          "resultado": "A voz tranquila vence o grito. Duas famílias, antes em pânico, decidem permanecer.",
          "flags": {
            "profeta_decidido": true
          }
        },
        {
          "id": "pagar",
          "texto": "Pagar para o profeta partir · 3 gold",
          "requisitos": {
            "goldMin": 3
          },
          "efeitos": {
            "gold": -3,
            "honra": -1
          },
          "resultado": "O profeta aceita as moedas e anuncia o próximo fim em outra vila.",
          "flags": {
            "profeta_decidido": true
          }
        },
        {
          "id": "aproveitar",
          "texto": "Aproveitar o medo.",
          "requisitos": {
            "honraMax": -30
          },
          "efeitos": {
            "gold": 6,
            "honra": -5,
            "habitantes": -3
          },
          "resultado": "As doações enchem o cofre. Os que não doam, partem.",
          "flags": {
            "profeta_decidido": true
          }
        }
      ],
      "imagem": "assets/vila.svg",
      "imagemAlt": "Cena da vila durante o profeta do cometa"
    },
    {
      "id": "guarda_cansado",
      "titulo": "O guarda cansado",
      "tipo": "encontro",
      "peso": 2,
      "texto": "Seu guarda mais antigo dorme em pé, apoiado na lança. Quando o acorda, ele pede, com a voz de quem pede uma vez só, dias de folga.",
      "informacoes": "Guardas cansados protegem menos, mas guardas descansados cobram mais.",
      "opcoes": [
        {
          "id": "descanso",
          "texto": "Conceder uma semana de descanso.",
          "efeitos": {
            "habitantes": 1,
            "honra": 2,
            "gold": -1
          },
          "resultado": "A semana é calma, e o guarda volta renovado. Ele leva um pão extra para a ronda, por gratidão."
        },
        {
          "id": "dobrar",
          "texto": "Dobrar o turno dos outros.",
          "efeitos": {
            "honra": -2,
            "habitantes": -1
          },
          "resultado": "O guarda descansa, os outros resmungam. Um deles pede transferência para outra vila."
        },
        {
          "id": "assumir",
          "texto": "Assumir seu turno uma noite.",
          "efeitos": {
            "honra": 3,
            "hp": -4
          },
          "resultado": "A noite é fria e o guarda dorme em paz. Pela manhã, todos já sabem quem fez a ronda."
        }
      ],
      "imagem": "assets/vila.svg",
      "imagemAlt": "Cena da vila durante o guarda cansado"
    },
    {
      "id": "guardas_desertam",
      "titulo": "Guardas desertando",
      "tipo": "desordem",
      "peso": 1,
      "pesos": [
        {
          "requisitos": {
            "honra": "baixa"
          },
          "valor": 5
        }
      ],
      "texto": "Três guardas sumiram durante a noite, levando lanças e botas. Os que ficaram evitam seu olhar.",
      "informacoes": "Guardas que partem não costumam voltar, e os que ficam observam sua reação.",
      "opcoes": [
        {
          "id": "recompensa",
          "texto": "Oferecer uma recompensa aos que ficam · 4 gold",
          "requisitos": {
            "goldMin": 4
          },
          "efeitos": {
            "ataque": 1,
            "honra": 1,
            "gold": -4
          },
          "resultado": "Os guardas apertam as correias e voltam ao posto. Um deles pede para ser promovido."
        },
        {
          "id": "cacar",
          "texto": "Caçar os desertores.",
          "efeitos": {
            "hp": -5,
            "honra": -3
          },
          "resultado": "Você encontra dois e os traz de volta amarrados. A tropa fica, mas ressentida."
        },
        {
          "id": "ouvir",
          "texto": "Ouvir os motivos dos que ficaram.",
          "requisitos": {
            "honraMin": 30
          },
          "efeitos": {
            "honra": 3,
            "habitantes": 2
          },
          "resultado": "As queixas são justas: pouca comida, nenhuma folga. Você ajusta o que pode, e duas famílias de guardas decidem ficar."
        }
      ],
      "imagem": "assets/vila.svg",
      "imagemAlt": "Cena da vila durante guardas desertando"
    },
    {
      "id": "rumores",
      "titulo": "Rumores da lavanderia",
      "tipo": "desordem",
      "peso": 2,
      "texto": "As lavadeiras cochicham em voz baixa sobre o senhor. Cada versão do rumor é mais interessante que a anterior.",
      "informacoes": "Não existe verdade no rumor, só repetição.",
      "opcoes": [
        {
          "id": "ignorar",
          "texto": "Ignorar os rumores.",
          "efeitos": {
            "honra": -1
          },
          "resultado": "Os rumores crescem sem alimento extra. Ninguém os desmente e todos os repetem."
        },
        {
          "id": "pagar",
          "texto": "Pagar a lavanderia para falar bem · 2 gold",
          "requisitos": {
            "goldMin": 2
          },
          "efeitos": {
            "honra": 2,
            "gold": -2
          },
          "resultado": "As lavadeiras passam a lembrar suas virtudes com um tom suspeitamente entusiasmado."
        },
        {
          "id": "visitar",
          "texto": "Visitar a lavanderia e conversar.",
          "requisitos": {
            "honraMin": 30
          },
          "efeitos": {
            "honra": 3,
            "habitantes": 1,
            "hp": -2
          },
          "resultado": "Você leva um balde d'água na cabeça por acidente. Todos riem e o rumor morre de tédio."
        },
        {
          "id": "silenciar",
          "texto": "Silenciar as fofoqueiras.",
          "requisitos": {
            "honraMax": -30
          },
          "efeitos": {
            "honra": -4,
            "habitantes": -2
          },
          "resultado": "Duas lavadeiras, expulsas, levam o rumor para outras vilas. Ele chega lá antes delas."
        }
      ],
      "imagem": "assets/vila.svg",
      "imagemAlt": "Cena da vila durante rumores da lavanderia"
    },
    {
      "id": "cavaleiro_errante",
      "titulo": "O cavaleiro errante",
      "tipo": "encontro",
      "peso": 2,
      "requisitos": {
        "honraMin": 30
      },
      "texto": "Um cavaleiro de armadura remendada pede um dia de descanso. Diz que ouviu falar da vila numa canção, e que as canções costumam exagerar.",
      "informacoes": "Ele não pede nada além de pouso, mas observa tudo.",
      "opcoes": [
        {
          "id": "treino",
          "texto": "Oferecer pouso e treino.",
          "efeitos": {
            "ataque": 1,
            "escudo": 1,
            "honra": 2,
            "hp": -5
          },
          "resultado": "O cavaleiro ensina três lições e uma dor nas costelas. Parte na manhã, sem dizer adeus."
        },
        {
          "id": "guarda",
          "texto": "Propor que ele fique como guarda.",
          "efeitos": {
            "habitantes": 3,
            "honra": 2,
            "gold": -3
          },
          "resultado": "Ele recusa, mas dois escudeiros e uma cozinheira que o seguiam pedem para ficar."
        },
        {
          "id": "pedir",
          "texto": "Pedir que lute pela vila quando precisar.",
          "requisitos": {
            "honraMin": 50
          },
          "efeitos": {
            "honra": 3,
            "ataque": 1
          },
          "resultado": "Ele estende a mão e promete voltar. O povo observa e sente o peso dessa palavra."
        }
      ],
      "imagem": "assets/vila.svg",
      "imagemAlt": "Cena da vila durante o cavaleiro errante"
    },
    {
      "id": "duelo",
      "titulo": "O duelo de honra",
      "tipo": "batalha",
      "peso": 1,
      "requisitos": {
        "rodadaMin": 7
      },
      "texto": "Um jovem nobre diz que você ofendeu sua família ao usar o nome do pai dele numa frase. Ele exige um duelo, com testemunhas e sem pressa.",
      "informacoes": "O ataque precisa alcançar a defesa do duelista. Seu escudo reduz o dano recebido, sem se desgastar.",
      "opcoes": [
        {
          "id": "aceitar",
          "texto": "Aceitar o duelo.",
          "combate": true
        },
        {
          "id": "desculpar",
          "texto": "Pedir desculpas em público.",
          "efeitos": {
            "honra": -2
          },
          "resultado": "O jovem aceita as desculpas com ar de quem queria mais. A praça murmura."
        },
        {
          "id": "campeao",
          "texto": "Mandar um campeão em seu lugar.",
          "requisitos": {
            "goldMin": 4
          },
          "efeitos": {
            "honra": 1,
            "gold": -4
          },
          "resultado": "O campeão vence sem esforço. A vila aplaude e comenta que você deixou outro lutar."
        }
      ],
      "batalha": {
        "defesa": 4,
        "vitoria": {
          "dano": 12,
          "efeitos": {
            "honra": 3,
            "gold": 4
          },
          "resultado": "O duelista cai e perde o orgulho. Os padrinhos pagam a aposta e se retiram em silêncio."
        },
        "derrota": {
          "dano": 20,
          "efeitos": {},
          "resultado": "Você é humilhado diante de testemunhas. O jovem sorri e se vai."
        },
        "penalidadeFalha": {
          "efeitos": {
            "honra": -3,
            "gold": -3
          },
          "texto": "A derrota custa respeito e a bolsa da aposta."
        }
      },
      "imagem": "assets/batalha.svg",
      "imagemAlt": "Cena da vila durante o duelo de honra"
    },
    {
      "id": "coletor",
      "titulo": "O coletor de impostos",
      "tipo": "encontro",
      "peso": 2,
      "requisitos": {
        "rodadaMin": 4
      },
      "texto": "Um homem de chapéu alto confere o livro de contas da vila. Corrige somas com um sorriso que não alcança os olhos.",
      "informacoes": "Ele diz que representa o rei. Ninguém viu o rei, nem o selo.",
      "opcoes": [
        {
          "id": "pagar",
          "texto": "Pagar o imposto devido · 5 gold",
          "requisitos": {
            "goldMin": 5
          },
          "efeitos": {
            "honra": 2,
            "gold": -5
          },
          "resultado": "O coletor assina um recibo que talvez valha algo. A vila respira sem entender por quê."
        },
        {
          "id": "esconder",
          "texto": "Esconder parte dos grãos.",
          "efeitos": {
            "gold": 3,
            "honra": -3,
            "habitantes": -2
          },
          "resultado": "O coletor desconfia e faz perguntas. Dois moradores, assustados, partem na manhã seguinte."
        },
        {
          "id": "provar",
          "texto": "Pedir que prove seu mandato.",
          "requisitos": {
            "honraMin": 50
          },
          "efeitos": {
            "honra": 3,
            "hp": -3
          },
          "resultado": "O coletor falha em provar. Ele parte irritado, deixando uma cicatriz verbal e nenhuma conta."
        }
      ],
      "imagem": "assets/vila.svg",
      "imagemAlt": "Cena da vila durante o coletor de impostos"
    },
    {
      "id": "refugiados",
      "titulo": "Retirantes da guerra",
      "tipo": "encontro",
      "peso": 2,
      "requisitos": {
        "rodadaMin": 6,
        "flagsAusentes": [
          "refugiados_decidido"
        ]
      },
      "texto": "Uma fila de famílias com trouxas e crianças dorme perto do portão. Algumas têm feridas, outras só têm silêncio.",
      "informacoes": "Aceitar muitos é alimentar muitos. Recusar é escolher quem fica.",
      "opcoes": [
        {
          "id": "abrir",
          "texto": "Abrir os portões a todos.",
          "requisitos": {
            "honraMin": -29
          },
          "efeitos": {
            "habitantes": 8,
            "honra": 3,
            "hp": -4
          },
          "resultado": "A vila quase estoura, mas respira junto. Oito novas famílias dão novo ritmo ao trabalho.",
          "flags": {
            "refugiados_decidido": true
          }
        },
        {
          "id": "trabalhar",
          "texto": "Aceitar só quem puder trabalhar.",
          "efeitos": {
            "habitantes": 4,
            "honra": -3
          },
          "resultado": "Quatro famílias entram. As outras ficam para trás, sem olhar para você.",
          "flags": {
            "refugiados_decidido": true
          }
        },
        {
          "id": "recusar",
          "texto": "Recusar a entrada.",
          "efeitos": {
            "honra": -5
          },
          "resultado": "As famílias seguem pela estrada. Os moradores observam o portão se fechar e fazem o mesmo silêncio.",
          "flags": {
            "refugiados_decidido": true
          }
        }
      ],
      "imagem": "assets/vila.svg",
      "imagemAlt": "Cena da vila durante retirantes da guerra"
    },
    {
      "id": "heranca_disputada",
      "titulo": "A herança disputada",
      "tipo": "desordem",
      "peso": 1,
      "requisitos": {
        "rodadaMin": 6
      },
      "texto": "Um velho morreu sem testamento, e sete parentes aparecem para cobrar o mesmo cavalo.",
      "informacoes": "O cavalo tem pouco valor. A discussão, nenhum limite.",
      "opcoes": [
        {
          "id": "dividir",
          "texto": "Dividir os bens em partes iguais.",
          "efeitos": {
            "honra": 1,
            "habitantes": -1
          },
          "resultado": "O cavalo é vendido, e as moedas, divididas em sete. Um parente parte descontente."
        },
        {
          "id": "cuidador",
          "texto": "Dar tudo ao parente que cuidou do velho.",
          "requisitos": {
            "honraMin": 30
          },
          "efeitos": {
            "honra": 3,
            "habitantes": 1
          },
          "resultado": "Os outros reclamam, mas sabem que é justo. O cuidador passa a viver com mais dignidade."
        },
        {
          "id": "tomar",
          "texto": "Tomar a herança para o cofre.",
          "efeitos": {
            "gold": 5,
            "honra": -4,
            "habitantes": -2
          },
          "resultado": "Os parentes saem de mãos vazias. Dois deles juram que o cavalo ainda terá dono."
        }
      ],
      "imagem": "assets/vila.svg",
      "imagemAlt": "Cena da vila durante a herança disputada"
    },
    {
      "id": "sino_rachado",
      "titulo": "O sino rachado",
      "tipo": "encontro",
      "peso": 2,
      "texto": "O sino da vila rachou numa manhã de geada, produzindo um som que lembra uma tosse. Ninguém sabe quando começar o dia.",
      "informacoes": "O sino organiza a vila. Sem ele, cada um segue o relógio que prefere.",
      "opcoes": [
        {
          "id": "fundir",
          "texto": "Mandar fundir outro · 5 gold",
          "requisitos": {
            "goldMin": 5
          },
          "efeitos": {
            "habitantes": 3,
            "honra": 2,
            "gold": -5
          },
          "resultado": "O novo sino ressoa pela vila inteira. Três famílias de uma aldeia vizinha afirmam ouvi-lo ao longe."
        },
        {
          "id": "remendar",
          "texto": "Remendar o sino com o ferreiro.",
          "efeitos": {
            "honra": 1,
            "gold": -1
          },
          "resultado": "O sino volta a tocar, mas com um tom esquisito. As crianças o apelidam de \"o Doente\"."
        },
        {
          "id": "sem",
          "texto": "Ficar sem sino.",
          "efeitos": {
            "honra": -2,
            "habitantes": -1
          },
          "resultado": "O silêncio é incômodo. Alguns acordam tarde, outros cedo, e todos reclamam."
        }
      ],
      "imagem": "assets/forja.svg",
      "imagemAlt": "Cena da vila durante o sino rachado"
    },
    {
      "id": "velho_soldado",
      "titulo": "O velho soldado",
      "tipo": "encontro",
      "peso": 2,
      "texto": "Um homem manco, com um olho opaco, se apresenta como veterano de três guerras. Pede um canto para morar e um motivo para levantar de manhã.",
      "informacoes": "Ele conhece táticas que ninguém mais conhece.",
      "opcoes": [
        {
          "id": "treinar",
          "texto": "Pedir que treine seus homens.",
          "efeitos": {
            "ataque": 1,
            "habitantes": 1,
            "gold": -2
          },
          "resultado": "O veterano resmunga de manhã e ensina de tarde. Sua tropa melhora a olhos vistos."
        },
        {
          "id": "ouvir",
          "texto": "Ouvir suas histórias à noite.",
          "efeitos": {
            "honra": 2,
            "escudo": 1,
            "hp": -2
          },
          "resultado": "As histórias são tristes e úteis. Você aprende a segurar o escudo de modo diferente."
        },
        {
          "id": "recusar",
          "texto": "Mandá-lo embora sem pouso.",
          "efeitos": {
            "honra": -3
          },
          "resultado": "Ele sai pela estrada sem reclamar. Os moradores observam se você vai olhar para trás."
        }
      ],
      "imagem": "assets/forja.svg",
      "imagemAlt": "Cena da vila durante o velho soldado"
    },
    {
      "id": "pao_contado",
      "titulo": "Pão contado",
      "tipo": "desordem",
      "peso": 1,
      "pesos": [
        {
          "requisitos": {
            "honra": "baixa"
          },
          "valor": 5
        }
      ],
      "texto": "A padaria fechou três dias seguidos. As filas aumentam, e os preços também. Alguém começa a vender pão por baixo do balcão.",
      "informacoes": "A fome nunca precisou de tradutor.",
      "opcoes": [
        {
          "id": "abrir",
          "texto": "Abrir o celeiro do senhor · 3 gold",
          "requisitos": {
            "goldMin": 3
          },
          "efeitos": {
            "habitantes": 4,
            "honra": 3,
            "gold": -3
          },
          "resultado": "O pão volta a ser pão. Quatro famílias que olhavam a estrada decidem ficar."
        },
        {
          "id": "tabelar",
          "texto": "Tabelar o preço do pão.",
          "efeitos": {
            "honra": 1,
            "habitantes": -2
          },
          "resultado": "O preço cai, o pão some. Duas famílias partem em busca de padarias mais honestas."
        },
        {
          "id": "confiscar",
          "texto": "Confiscar pão dos revendedores.",
          "requisitos": {
            "honraMax": -30
          },
          "efeitos": {
            "gold": 4,
            "honra": -5,
            "habitantes": -3
          },
          "resultado": "Você enche o cofre e esvazia a praça. Três famílias deixam a vila de barriga cheia e olhar duro."
        }
      ],
      "imagem": "assets/vila.svg",
      "imagemAlt": "Cena da vila durante pão contado"
    },
    {
      "id": "noite_dos_mortos",
      "titulo": "A noite dos mortos",
      "tipo": "encontro",
      "peso": 2,
      "intervaloRodadas": 50,
      "texto": "Uma vez por ano, os moradores acendem velas no cemitério e deixam pão nas lápides. Ninguém lembra por quê, apenas como.",
      "informacoes": "Os mortos também fazem parte da vila.",
      "opcoes": [
        {
          "id": "velas",
          "texto": "Acender uma vela para cada morto.",
          "efeitos": {
            "honra": 3,
            "gold": -2
          },
          "resultado": "A noite é longa e silenciosa. Os moradores, comovidos, agradecem sem dizer palavra."
        },
        {
          "id": "enlutados",
          "texto": "Passar a noite com os enlutados.",
          "efeitos": {
            "honra": 2,
            "habitantes": 2,
            "hp": -3
          },
          "resultado": "Você ouve nomes que ninguém cita há anos. Duas famílias, sentindo-se ouvidas, decidem ficar."
        },
        {
          "id": "dispensar",
          "texto": "Dispensar a tradição.",
          "efeitos": {
            "honra": -3,
            "habitantes": -1
          },
          "resultado": "As velas são acesas mesmo assim, longe dos olhos do senhor. Um morador parte na manhã seguinte."
        }
      ],
      "imagem": "assets/vila.svg",
      "imagemAlt": "Cena da vila durante a noite dos mortos"
    },
    {
      "id": "nobre_falido",
      "titulo": "O nobre falido",
      "tipo": "encontro",
      "peso": 1,
      "requisitos": {
        "rodadaMin": 5
      },
      "texto": "Um nobre de roupas caras e mãos vazias pede asilo. Seu cavalo é mais bem vestido que ele.",
      "informacoes": "Ele diz conhecer pessoas importantes. Elas, talvez, não o conheçam mais.",
      "opcoes": [
        {
          "id": "acolher",
          "texto": "Acolhê-lo como hóspede.",
          "efeitos": {
            "honra": 2,
            "habitantes": 1,
            "gold": -2
          },
          "resultado": "O nobre agradece com cerimônia e come como um lavrador. Seu cavalo é presenteado à vila."
        },
        {
          "id": "penhor",
          "texto": "Exigir um penhor.",
          "efeitos": {
            "gold": 4,
            "honra": -2
          },
          "resultado": "O nobre entrega um anel que talvez seja falso. O ourives promete avaliar na semana seguinte."
        },
        {
          "id": "casar",
          "texto": "Pedir que se case com uma viúva da vila.",
          "requisitos": {
            "honraMin": 50
          },
          "efeitos": {
            "habitantes": 3,
            "honra": 3
          },
          "resultado": "O nobre aceita, relutante, e acaba feliz. A viúva traz uma família inteira ao altar."
        }
      ],
      "imagem": "assets/vila.svg",
      "imagemAlt": "Cena da vila durante o nobre falido"
    },
    {
      "id": "tempestade",
      "titulo": "A tempestade",
      "tipo": "mandatorio",
      "peso": 1,
      "requisitos": {
        "rodadaMin": 5
      },
      "texto": "O céu fecha à tarde, e à noite a chuva é de pedra. Telhados voam, o rio sobe, e você corre entre as casas, segurando o que consegue.",
      "informacoes": "Algumas noites não oferecem escolha, só resistência.",
      "opcoes": [
        {
          "id": "atravessar",
          "texto": "Atravessar a noite com o povo.",
          "efeitos": {
            "honra": 2,
            "hp": -9,
            "habitantes": -2
          },
          "resultado": "Na manhã, os telhados voltam a ser cobertos por braços. Duas famílias, sem casa, partem."
        }
      ],
      "imagem": "assets/geada.svg",
      "imagemAlt": "Cena da vila durante a tempestade"
    },
    {
      "id": "homens_do_senhor",
      "titulo": "Os homens do senhor",
      "tipo": "desordem",
      "peso": 5,
      "requisitos": {
        "honraMax": -30
      },
      "texto": "Seus guardas, sem ordem clara, começaram a pedir \"contribuições\" nas casas. Quem nega, apanha. Quem paga, também.",
      "informacoes": "A vila aprende a ser como o senhor.",
      "opcoes": [
        {
          "id": "punir",
          "texto": "Punir os guardas excessivos.",
          "efeitos": {
            "honra": 3,
            "gold": -2
          },
          "resultado": "Dois guardas são açoitados em público. A vila nota, em silêncio, que você pode ser contido."
        },
        {
          "id": "fingir",
          "texto": "Fingir que não viu.",
          "efeitos": {
            "gold": 3,
            "honra": -3,
            "habitantes": -3
          },
          "resultado": "Os guardas ficam mais ousados. Três famílias se despedem dos vizinhos às escondidas."
        },
        {
          "id": "parte",
          "texto": "Pedir parte do que arrecadarem.",
          "requisitos": {
            "honraMax": -50
          },
          "efeitos": {
            "gold": 6,
            "honra": -6,
            "habitantes": -4
          },
          "resultado": "Seu cofre pesa. A vila, vazia, ecoa seus passos."
        }
      ],
      "imagem": "assets/vila.svg",
      "imagemAlt": "Cena da vila durante os homens do senhor"
    },
    {
      "id": "culto_do_poco",
      "titulo": "O culto do poço",
      "tipo": "desordem",
      "peso": 4,
      "requisitos": {
        "rodadaMin": 8,
        "flags": [
          "poco_contaminado"
        ],
        "flagsAusentes": [
          "culto_resolvido"
        ]
      },
      "texto": "Algumas pessoas passaram a rezar de joelhos ao redor do poço, dizendo que ele fala à noite. Ninguém mais bebe daquela água, a não ser eles.",
      "informacoes": "A água foi contaminada por descuido. A reverência, por desespero.",
      "opcoes": [
        {
          "id": "cavar",
          "texto": "Fechar o poço e cavar outro · 5 gold",
          "requisitos": {
            "goldMin": 5
          },
          "efeitos": {
            "habitantes": 4,
            "honra": 3,
            "gold": -5
          },
          "resultado": "O novo poço dá água limpa. Os devotos esvaziam o antigo e carregam a lenda para a nova água.",
          "flags": {
            "culto_resolvido": true
          }
        },
        {
          "id": "conversar",
          "texto": "Conversar com os devotos.",
          "requisitos": {
            "honraMin": 30
          },
          "efeitos": {
            "honra": 3,
            "hp": -4
          },
          "resultado": "A conversa é longa e confusa. Os devotos aceitam abandonar o poço, mas não o culto.",
          "flags": {
            "culto_resolvido": true
          }
        },
        {
          "id": "dispersar",
          "texto": "Dispersar os devotos à força.",
          "efeitos": {
            "habitantes": -4,
            "honra": -4
          },
          "resultado": "Os guardas empurram e batem. Quatro devotos partem, levando o canto consigo.",
          "flags": {
            "culto_resolvido": true
          }
        }
      ],
      "imagem": "assets/vila.svg",
      "imagemAlt": "Cena da vila durante o culto do poço"
    },
    {
      "id": "portao_aberto",
      "titulo": "O portão aberto",
      "tipo": "batalha",
      "peso": 1,
      "requisitos": {
        "rodadaMin": 8
      },
      "texto": "Durante a ronda, o portão estava destrancado por dentro. Homens armados já estão entre as casas, e ninguém sabe quem abriu.",
      "informacoes": "O ataque precisa alcançar a defesa dos invasores. Seu escudo reduz o dano recebido, sem se desgastar.",
      "opcoes": [
        {
          "id": "retomar",
          "texto": "Retomar o portão.",
          "combate": true
        },
        {
          "id": "evacuar",
          "texto": "Evacuar pelas trilhas.",
          "efeitos": {
            "habitantes": -4,
            "honra": -2
          },
          "resultado": "A maior parte escapa. Quatro pessoas se perdem na escuridão."
        }
      ],
      "batalha": {
        "defesa": 4,
        "vitoria": {
          "dano": 13,
          "efeitos": {
            "honra": 3,
            "gold": 4
          },
          "resultado": "Os invasores recuam pela mesma abertura. O portão é trancado com três barras."
        },
        "derrota": {
          "dano": 22,
          "efeitos": {},
          "resultado": "Você é obrigado a recuar para o pátio. Os invasores saqueiam à vontade."
        },
        "penalidadeFalha": {
          "efeitos": {
            "habitantes": -8,
            "gold": -3
          },
          "texto": "Oito moradores morrem ou fogem no saque; o cofre perde 3 gold."
        }
      },
      "imagem": "assets/batalha.svg",
      "imagemAlt": "Cena da vila durante o portão aberto"
    },
    {
      "id": "viuva",
      "titulo": "A viúva do soldado",
      "tipo": "encontro",
      "peso": 2,
      "texto": "Uma mulher traz uma medalha a você. Diz que o marido a recebeu por lutar a seu serviço ou ao do seu antecessor. Os registros se contradizem.",
      "informacoes": "Ela só quer saber se a morte dele serviu a algo.",
      "opcoes": [
        {
          "id": "pensao",
          "texto": "Garantir uma pensão · 3 gold",
          "requisitos": {
            "goldMin": 3
          },
          "efeitos": {
            "honra": 3,
            "habitantes": 1,
            "gold": -3
          },
          "resultado": "A viúva agradece sem sorrir. Os outros soldados da vila notam o gesto."
        },
        {
          "id": "sentido",
          "texto": "Dizer que a morte tem sentido.",
          "efeitos": {
            "honra": 1
          },
          "resultado": "A viúva aceita as palavras e vai embora com a medalha. A vila não sabe se ela acreditou."
        },
        {
          "id": "negar",
          "texto": "Negar qualquer dívida.",
          "efeitos": {
            "honra": -4,
            "habitantes": -1
          },
          "resultado": "Ela deixa a medalha sobre a mesa. Os guardas olham para o chão, e o senhor, para a medalha."
        }
      ],
      "imagem": "assets/vila.svg",
      "imagemAlt": "Cena da vila durante a viúva do soldado"
    },
    {
      "id": "boticario",
      "titulo": "O aprendiz de boticário",
      "tipo": "encontro",
      "peso": 2,
      "texto": "Um rapaz pálido oferece xaropes de sabor discutível. Jura que seu mestre morreu sem lhe ensinar nada, exceto como misturar.",
      "informacoes": "Seus remédios podem curar, ou ao menos conservar.",
      "opcoes": [
        {
          "id": "comprar",
          "texto": "Comprar um xarope · 3 gold",
          "requisitos": {
            "goldMin": 3
          },
          "efeitos": {
            "hp": 12,
            "gold": -3
          },
          "resultado": "O xarope tem gosto de cobre e mel. Você recupera doze de vida e um leve zumbido."
        },
        {
          "id": "quarto",
          "texto": "Pagar-lhe um quarto na vila.",
          "efeitos": {
            "habitantes": 3,
            "honra": 2,
            "gold": -2
          },
          "resultado": "O aprendiz se instala. Em semanas, três famílias passam a procurá-lo."
        },
        {
          "id": "expulsar",
          "texto": "Expulsá-lo por charlatanismo.",
          "efeitos": {
            "honra": -2
          },
          "resultado": "O rapaz parte sem se queixar. Pela estrada, tosse mais do que deveria."
        }
      ],
      "imagem": "assets/vila.svg",
      "imagemAlt": "Cena da vila durante o aprendiz de boticário"
    },
    {
      "id": "pastores",
      "titulo": "Pastores de passagem",
      "tipo": "encontro",
      "peso": 2,
      "texto": "Um rebanho de ovelhas ocupa a estrada. Os pastores pedem pasto por três dias e prometem lã em troca.",
      "informacoes": "Ovelhas comem tudo o que veem, inclusive suas cercas.",
      "opcoes": [
        {
          "id": "permitir",
          "texto": "Permitir o pasto nos campos comunais.",
          "efeitos": {
            "gold": 4,
            "honra": 1
          },
          "resultado": "Os pastores pagam em lã e queijo. Os lavradores reclamam, mas o cofre agradece."
        },
        {
          "id": "ficar",
          "texto": "Convidá-los a ficar de vez.",
          "requisitos": {
            "honraMin": -29
          },
          "efeitos": {
            "habitantes": 4,
            "honra": 2
          },
          "resultado": "As ovelhas aprovam, os pastores também. Quatro famílias ficam, e um cachorro, sozinho, escolhe você."
        },
        {
          "id": "adiante",
          "texto": "Mandar o rebanho adiante.",
          "efeitos": {
            "honra": -1
          },
          "resultado": "As ovelhas partem balindo. Nenhuma cerca é mastigada, e ninguém sente falta delas."
        }
      ],
      "imagem": "assets/vila.svg",
      "imagemAlt": "Cena da vila durante pastores de passagem"
    },
    {
      "id": "ladrao_de_cavalos",
      "titulo": "O ladrão de cavalos",
      "tipo": "desordem",
      "peso": 2,
      "texto": "Um rapaz foi pego sentado em um cavalo que não era seu. Jura que o animal o seguiu até a cerca.",
      "informacoes": "A vila observa, em silêncio, o que será feito do rapaz.",
      "opcoes": [
        {
          "id": "ouvir",
          "texto": "Ouvir a versão do cavalo.",
          "requisitos": {
            "honraMin": 30
          },
          "efeitos": {
            "honra": 2,
            "habitantes": 1
          },
          "resultado": "O cavalo de fato o segue. O dono, tocado, deixa o animal com o rapaz por uma pequena troca."
        },
        {
          "id": "multar",
          "texto": "Aplicar uma multa.",
          "efeitos": {
            "gold": 3,
            "honra": -1
          },
          "resultado": "O rapaz paga com lágrimas e quatro dias de trabalho. O cavalo parece decepcionado."
        },
        {
          "id": "cortar",
          "texto": "Cortar-lhe a mão.",
          "requisitos": {
            "honraMax": -50
          },
          "efeitos": {
            "honra": -7,
            "habitantes": -4
          },
          "resultado": "Ninguém mais toca em um cavalo alheio. Quatro famílias deixam a vila antes do amanhecer."
        }
      ],
      "imagem": "assets/vila.svg",
      "imagemAlt": "Cena da vila durante o ladrão de cavalos"
    },
    {
      "id": "oleiro",
      "titulo": "O forno do oleiro",
      "tipo": "encontro",
      "peso": 2,
      "texto": "O oleiro quer construir um forno maior e mudar para a vila. Diz que seu barro é bom e suas pernas são ruins.",
      "informacoes": "Fornos grandes trazem moedas e fumaça.",
      "opcoes": [
        {
          "id": "ajudar",
          "texto": "Ajudar a construir o forno.",
          "efeitos": {
            "habitantes": 3,
            "honra": 2,
            "hp": -4
          },
          "resultado": "Você carrega tijolos até a tarde. O oleiro, agradecido, faz um prato com seu brasão que ninguém ousa usar."
        },
        {
          "id": "financiar",
          "texto": "Financiar a obra · 4 gold",
          "requisitos": {
            "goldMin": 4
          },
          "efeitos": {
            "habitantes": 4,
            "honra": 1,
            "gold": -4
          },
          "resultado": "O forno nasce em um mês. Quatro aprendizes chegam com cheiro de barro."
        },
        {
          "id": "aluguel",
          "texto": "Cobrar aluguel do terreno.",
          "efeitos": {
            "gold": 4,
            "honra": -2
          },
          "resultado": "O oleiro paga, mas a fumaça sobe com mais ressentimento que o normal."
        }
      ],
      "imagem": "assets/vila.svg",
      "imagemAlt": "Cena da vila durante o forno do oleiro"
    },
    {
      "id": "criancas_floresta",
      "titulo": "Crianças na floresta",
      "tipo": "encontro",
      "peso": 2,
      "texto": "Três crianças desapareceram depois do jantar. Os pais cercam o portão e olham para você, não para as árvores.",
      "informacoes": "A floresta escurece rápido.",
      "opcoes": [
        {
          "id": "entrar",
          "texto": "Entrar na floresta com tochas.",
          "efeitos": {
            "honra": 4,
            "habitantes": 3,
            "hp": -8
          },
          "resultado": "As crianças são achadas em uma clareira, assustadas e cheias de amoras. Três famílias ficam por gratidão."
        },
        {
          "id": "guardas",
          "texto": "Mandar os guardas na frente.",
          "efeitos": {
            "honra": 1,
            "gold": -2
          },
          "resultado": "Os guardas as trazem ao amanhecer. Você é agradecido com educação, não com calor."
        },
        {
          "id": "esperar",
          "texto": "Esperar até o amanhecer.",
          "efeitos": {
            "honra": -4,
            "habitantes": -2
          },
          "resultado": "As crianças voltam sozinhas. Os pais não esquecem a noite, e duas famílias partem com os pequenos."
        }
      ],
      "imagem": "assets/vila.svg",
      "imagemAlt": "Cena da vila durante crianças na floresta"
    },
    {
      "id": "pedra_do_limite",
      "titulo": "A pedra do limite",
      "tipo": "encontro",
      "peso": 2,
      "requisitos": {
        "rodadaMin": 4
      },
      "texto": "O senhor da aldeia vizinha diz que a pedra do limite foi movida para dentro das terras dele. Pede que a coloquem de volta, ou que ele mesmo o faça.",
      "informacoes": "A pedra tem cem anos e muitas versões.",
      "opcoes": [
        {
          "id": "medir",
          "texto": "Medir o limite junto com o vizinho.",
          "efeitos": {
            "honra": 2,
            "habitantes": 1,
            "hp": -3
          },
          "resultado": "A medição é longa e comprova que ambos tinham razão. Vocês dividem um pedaço de terra e uma garrafa."
        },
        {
          "id": "recusar",
          "texto": "Recusar e fortalecer a fronteira.",
          "efeitos": {
            "escudo": 1,
            "honra": -2,
            "gold": -2
          },
          "resultado": "O vizinho parte irritado. Seus guardas ganham escudos novos e um inimigo permanente."
        },
        {
          "id": "ceder",
          "texto": "Ceder a faixa de terra.",
          "efeitos": {
            "habitantes": -2,
            "honra": -1
          },
          "resultado": "A faixa é entregue, e duas famílias que a cultivavam partem junto com ela."
        }
      ],
      "imagem": "assets/vila.svg",
      "imagemAlt": "Cena da vila durante a pedra do limite"
    },
    {
      "id": "sonho_do_velho",
      "titulo": "O sonho do velho senhor",
      "tipo": "mandatorio",
      "peso": 1,
      "requisitos": {
        "rodadaMin": 10,
        "flagsAusentes": [
          "sonho_tido"
        ]
      },
      "texto": "Você dorme na poltrona do seu predecessor e sonha com uma vila que não reconhece. Ele está de pé na porta, sem rosto, e pergunta o que você fez.",
      "informacoes": "Alguns sonhos exigem resposta, mesmo sem perguntas.",
      "opcoes": [
        {
          "id": "responder",
          "texto": "Responder ao sonho com sinceridade.",
          "efeitos": {
            "honra": 1,
            "hp": -4
          },
          "resultado": "Você acorda com o coração acelerado e a certeza de que ninguém mais ouviu a resposta.",
          "flags": {
            "sonho_tido": true
          },
          "desbloqueia": {
            "flags": [
              "vontade_ouvida"
            ]
          }
        }
      ],
      "imagem": "assets/vila.svg",
      "imagemAlt": "Cena da vila durante o sonho do velho senhor"
    },
    {
      "id": "moedas_falsas",
      "titulo": "Moedas falsas",
      "tipo": "desordem",
      "peso": 2,
      "requisitos": {
        "goldMin": 4
      },
      "texto": "O ferreiro mostra uma moeda que se desfaz sob o martelo. Três outras iguais passaram pelo cofre sem que ninguém notasse.",
      "informacoes": "Há alguém fabricando moedas na região.",
      "opcoes": [
        {
          "id": "investigar",
          "texto": "Investigar a origem.",
          "efeitos": {
            "honra": 2,
            "gold": -3,
            "hp": -3
          },
          "resultado": "A trilha leva a um estaleiro de falsificadores. Você derruba o ateliê, e as moedas falsas se tornam lenha."
        },
        {
          "id": "trocar",
          "texto": "Trocar as moedas pelas boas.",
          "efeitos": {
            "gold": -4
          },
          "resultado": "O prejuízo é pago em silêncio. O ferreiro guarda uma das moedas falsas como lembrança."
        },
        {
          "id": "passar",
          "texto": "Passar adiante as moedas falsas.",
          "requisitos": {
            "honraMax": -30
          },
          "efeitos": {
            "gold": 4,
            "honra": -6,
            "habitantes": -2
          },
          "resultado": "As moedas circulam. Algumas famílias descobrem de onde vieram e partem sem fazer barulho."
        }
      ],
      "imagem": "assets/vila.svg",
      "imagemAlt": "Cena da vila durante moedas falsas"
    },
    {
      "id": "carvoeiros",
      "titulo": "Os carvoeiros",
      "tipo": "encontro",
      "peso": 2,
      "texto": "Uma família de pele escurecida de fuligem pede para queimar lenha no bosque comunal. Seus filhos parecem mais velhos que seus pais.",
      "informacoes": "Carvão aquece e vende, mas queima árvores.",
      "opcoes": [
        {
          "id": "permitir",
          "texto": "Permitir a queima controlada.",
          "efeitos": {
            "gold": 5,
            "habitantes": 2,
            "honra": -1
          },
          "resultado": "O bosque diminui, o cofre aumenta. A fuligem desenha sombras novas nas paredes."
        },
        {
          "id": "terreno",
          "texto": "Oferecer um terreno distante.",
          "efeitos": {
            "habitantes": 3,
            "honra": 2
          },
          "resultado": "O terreno é áspero, mas os carvoeiros o transformam em casa. Três famílias vizinhas se juntam a eles."
        },
        {
          "id": "proibir",
          "texto": "Proibir a queima.",
          "efeitos": {
            "honra": 1
          },
          "resultado": "Os carvoeiros parecem entender e vão embora. O bosque agradece em folhas."
        }
      ],
      "imagem": "assets/vila.svg",
      "imagemAlt": "Cena da vila durante os carvoeiros"
    },
    {
      "id": "contador_de_mortos",
      "titulo": "O contador de mortos",
      "tipo": "encontro",
      "peso": 1,
      "requisitos": {
        "rodadaMin": 10
      },
      "texto": "O padre, o ferreiro e a ervateira se juntam à porta de seu salão e apresentam uma lista de nomes. Pedem que você a leia em voz alta.",
      "informacoes": "A lista contém todos que a vila perdeu desde que você chegou.",
      "opcoes": [
        {
          "id": "ler",
          "texto": "Ler cada nome com calma.",
          "efeitos": {
            "honra": 4,
            "hp": -5
          },
          "resultado": "A leitura é longa. Ao fim, o salão está em silêncio, e alguém começa a chorar."
        },
        {
          "id": "guardar",
          "texto": "Pedir que a lista seja guardada para depois.",
          "efeitos": {
            "honra": -3
          },
          "resultado": "Eles concordam, sem concordar. A lista é guardada em uma gaveta que ninguém esquece."
        },
        {
          "id": "culpa",
          "texto": "Dizer que não foi sua culpa.",
          "requisitos": {
            "honraMax": -30
          },
          "efeitos": {
            "honra": -5,
            "habitantes": -2
          },
          "resultado": "A lista é dobrada e devolvida ao bolso. Dois dos presentes saem da vila na manhã seguinte."
        }
      ],
      "imagem": "assets/vila.svg",
      "imagemAlt": "Cena da vila durante o contador de mortos"
    },
    {
      "id": "vigia_da_torre",
      "titulo": "O vigia da torre",
      "tipo": "encontro",
      "peso": 2,
      "texto": "O vigia da torre desceu para dizer que viu fumaça no horizonte três noites seguidas. Ele não sabe se é aviso ou invenção.",
      "informacoes": "Ele não está acostumado a ser ouvido.",
      "opcoes": [
        {
          "id": "batedor",
          "texto": "Mandar um batedor investigar.",
          "efeitos": {
            "honra": 2,
            "escudo": 1,
            "gold": -2
          },
          "resultado": "O batedor volta com notícias de um acampamento distante. Você reforça o portão, só por precaução."
        },
        {
          "id": "subir",
          "texto": "Subir à torre e ver por si mesmo.",
          "efeitos": {
            "honra": 2,
            "hp": -3
          },
          "resultado": "A subida é longa e o horizonte, vazio. O vigia suspira aliviado por ter sido levado a sério."
        },
        {
          "id": "ignorar",
          "texto": "Ignorar o aviso.",
          "efeitos": {
            "honra": -2
          },
          "resultado": "O vigia volta à torre. Na noite seguinte, não desce mais para avisar."
        }
      ],
      "imagem": "assets/vila.svg",
      "imagemAlt": "Cena da vila durante o vigia da torre"
    },
    {
      "id": "enxame",
      "titulo": "O enxame",
      "tipo": "encontro",
      "peso": 2,
      "texto": "Um enxame de abelhas pousou no telhado da cozinha. A cozinheira recusa-se a sair, e o enxame também.",
      "informacoes": "Abelhas podem ser sorte ou problema, dependendo do ferrão.",
      "opcoes": [
        {
          "id": "fumaca",
          "texto": "Tirar o enxame com fumaça.",
          "efeitos": {
            "gold": 4,
            "honra": 1,
            "hp": -4
          },
          "resultado": "Você leva meia dúzia de picadas e um pote de mel. O enxame se muda para a colmeia do pátio."
        },
        {
          "id": "apicultor",
          "texto": "Chamar o apicultor da aldeia vizinha · 2 gold",
          "requisitos": {
            "goldMin": 2
          },
          "efeitos": {
            "habitantes": 2,
            "honra": 1,
            "gold": -2
          },
          "resultado": "O apicultor resolve em uma tarde. Duas famílias de sua aldeia passam a visitar a vila por causa do mel."
        },
        {
          "id": "esperar",
          "texto": "Esperar que se mudem.",
          "efeitos": {
            "honra": -1
          },
          "resultado": "As abelhas ficam. A cozinheira passa a cozinhar fora."
        }
      ],
      "imagem": "assets/vila.svg",
      "imagemAlt": "Cena da vila durante o enxame"
    },
    {
      "id": "lagoa_proibida",
      "titulo": "A lagoa proibida",
      "tipo": "encontro",
      "peso": 1,
      "texto": "Os mais velhos dizem que a lagoa atrás do bosque é amaldiçoada. Os mais jovens dizem que há peixes. Ambos podem estar certos.",
      "informacoes": "A lagoa nunca ficou seca, nem nos piores invernos.",
      "opcoes": [
        {
          "id": "pescar",
          "texto": "Pescar na lagoa.",
          "efeitos": {
            "habitantes": 4,
            "gold": 2,
            "honra": -3
          },
          "resultado": "Os peixes são gordos. Os velhos olham de longe e se benzem."
        },
        {
          "id": "respeitar",
          "texto": "Respeitar a proibição.",
          "efeitos": {
            "honra": 3
          },
          "resultado": "Os velhos assentem. Os jovens, mais tarde, pescam escondidos, e ninguém conta."
        },
        {
          "id": "consagrar",
          "texto": "Consagrar a lagoa em nome do povo.",
          "requisitos": {
            "honraMin": 50
          },
          "efeitos": {
            "honra": 4,
            "habitantes": 3
          },
          "resultado": "A lagoa vira lugar de encontro e silêncio. Três famílias se instalam à margem, sem fazer barulho."
        }
      ],
      "imagem": "assets/vila.svg",
      "imagemAlt": "Cena da vila durante a lagoa proibida"
    },
    {
      "id": "vizinho_pede_ajuda",
      "titulo": "O vizinho pede ajuda",
      "tipo": "batalha",
      "peso": 1,
      "requisitos": {
        "rodadaMin": 9
      },
      "texto": "Um mensageiro suado conta que a aldeia vizinha está sendo atacada por bandidos. Pede homens e lanças, e pede depressa.",
      "informacoes": "O ataque precisa alcançar a defesa dos bandidos. Seu escudo reduz o dano recebido, sem se desgastar.",
      "opcoes": [
        {
          "id": "marchar",
          "texto": "Marchar em socorro.",
          "combate": true
        },
        {
          "id": "suprimentos",
          "texto": "Enviar apenas suprimentos · 3 gold",
          "requisitos": {
            "goldMin": 3
          },
          "efeitos": {
            "gold": -3,
            "honra": -2
          },
          "resultado": "O mensageiro agradece com o olhar de quem esperava mais. A vila vizinha sobrevive, a custo."
        },
        {
          "id": "recusar",
          "texto": "Recusar o pedido.",
          "efeitos": {
            "honra": -4,
            "habitantes": -1
          },
          "resultado": "O mensageiro parte sem discutir. A fumaça no horizonte, nos dias seguintes, discute por ele."
        }
      ],
      "batalha": {
        "defesa": 5,
        "vitoria": {
          "dano": 15,
          "efeitos": {
            "honra": 4,
            "habitantes": 5,
            "gold": 4
          },
          "resultado": "Os bandidos fogem ao ver sua bandeira. Cinco famílias da aldeia salva pedem asilo, e o vizinho paga com um cavalo magro."
        },
        "derrota": {
          "dano": 24,
          "efeitos": {},
          "resultado": "Você chega tarde e é empurrado de volta. A aldeia vizinha queima, e você volta ferido."
        },
        "penalidadeFalha": {
          "efeitos": {
            "habitantes": -5,
            "honra": -3
          },
          "texto": "Cinco de seus homens não voltam, e a vila ouve a notícia sem querer."
        }
      },
      "imagem": "assets/batalha.svg",
      "imagemAlt": "Cena da vila durante o vizinho pede ajuda"
    },
    {
      "id": "volta_do_barao",
      "titulo": "A volta do barão",
      "tipo": "batalha",
      "peso": 1,
      "requisitos": {
        "rodadaMin": 12
      },
      "texto": "Os estandartes cinzentos aparecem no vale. O barão, que ninguém conhece, agora chega em pessoa, com mais homens e menos paciência.",
      "informacoes": "O ataque precisa alcançar a defesa do exército. Seu escudo reduz o dano recebido, sem se desgastar.",
      "opcoes": [
        {
          "id": "defender",
          "texto": "Defender a vila nas muralhas.",
          "combate": true
        },
        {
          "id": "pagar",
          "texto": "Pagar o tributo atrasado · 8 gold",
          "requisitos": {
            "goldMin": 8
          },
          "efeitos": {
            "gold": -8,
            "honra": -2
          },
          "resultado": "O barão conta as moedas e sorri. Você entende que, para ele, o assunto não terminou."
        },
        {
          "id": "encontro",
          "texto": "Pedir um encontro sem armas.",
          "requisitos": {
            "honraMin": 50
          },
          "efeitos": {
            "honra": 3,
            "hp": -6
          },
          "resultado": "O barão ouve com ar de tédio e concorda em partir. Antes, quebra seu nariz, só para ter algo a contar."
        }
      ],
      "batalha": {
        "defesa": 6,
        "vitoria": {
          "dano": 20,
          "efeitos": {
            "honra": 5,
            "gold": 8,
            "habitantes": 4
          },
          "resultado": "O barão recua com metade dos homens. A vila canta, mesmo com as paredes chamuscadas."
        },
        "derrota": {
          "dano": 30,
          "efeitos": {},
          "resultado": "As muralhas cedem na terceira investida. O barão ocupa a praça por uma noite e se retira ao amanhecer, sem explicações."
        },
        "penalidadeFalha": {
          "efeitos": {
            "habitantes": -12,
            "gold": -5
          },
          "texto": "Doze moradores morrem ou fogem; o saque leva 5 gold."
        }
      },
      "imagem": "assets/batalha.svg",
      "imagemAlt": "Cena da vila durante a volta do barão"
    },
    {
      "id": "primo_distante",
      "titulo": "O primo distante",
      "tipo": "desordem",
      "peso": 2,
      "requisitos": {
        "rodadaMin": 12,
        "flagsAusentes": [
          "primo_decidido"
        ]
      },
      "texto": "Um homem de sobrenome parecido com o seu chega com uma carta e um sorriso que não olha ninguém nos olhos. Diz ter direitos sobre a terra.",
      "informacoes": "Os papéis parecem verdadeiros. Os parentescos, talvez.",
      "opcoes": [
        {
          "id": "receber",
          "texto": "Receber o primo como hóspede.",
          "efeitos": {
            "honra": 1,
            "gold": -3
          },
          "resultado": "O primo come, bebe, mede os tapetes e parte. Deixa um cheiro de perfume caro e uma pergunta no ar.",
          "flags": {
            "primo_decidido": true
          }
        },
        {
          "id": "contestar",
          "texto": "Contestar os papéis diante do povo.",
          "requisitos": {
            "honraMin": 30
          },
          "efeitos": {
            "honra": 3,
            "habitantes": 2,
            "hp": -4
          },
          "resultado": "A farsa é exposta pelo próprio padre. O primo foge, e a vila, pela primeira vez, ri com você.",
          "flags": {
            "primo_decidido": true
          }
        },
        {
          "id": "expulsar",
          "texto": "Expulsá-lo pela força.",
          "requisitos": {
            "honraMax": -30
          },
          "efeitos": {
            "honra": -5,
            "habitantes": -3
          },
          "resultado": "O primo é arrastado para fora. Três famílias, que o achavam simpático, deixam a vila logo depois.",
          "flags": {
            "primo_decidido": true
          }
        }
      ],
      "imagem": "assets/vila.svg",
      "imagemAlt": "Cena da vila durante o primo distante"
    },
    {
      "id": "inverno_longo",
      "titulo": "O inverno longo",
      "tipo": "mandatorio",
      "peso": 1,
      "requisitos": {
        "rodadaMin": 14
      },
      "texto": "A neve cobre as portas pela segunda vez. As reservas diminuem, e cada pessoa conta a lenha como quem conta dias.",
      "informacoes": "O inverno não faz perguntas.",
      "opcoes": [
        {
          "id": "dividir",
          "texto": "Dividir o que resta com o povo.",
          "efeitos": {
            "honra": 2,
            "hp": -10,
            "habitantes": -4
          },
          "resultado": "Vocês atravessam os meses. Quatro moradores não chegam ao degelo, e sua barba, sim."
        }
      ],
      "imagem": "assets/geada.svg",
      "imagemAlt": "Cena da vila durante o inverno longo"
    },
    {
      "id": "bispo",
      "titulo": "A visita do bispo",
      "tipo": "encontro",
      "peso": 1,
      "requisitos": {
        "rodadaMin": 14
      },
      "texto": "Um bispo gordo e educado chega em liteira e pede para inspecionar a moral da vila. Ele traz um livro de contas diferente do coletor.",
      "informacoes": "O bispo não pede nada, apenas observa. Esse é o problema.",
      "opcoes": [
        {
          "id": "humildade",
          "texto": "Receber com humildade.",
          "requisitos": {
            "honraMin": 30
          },
          "efeitos": {
            "honra": 3,
            "habitantes": 3,
            "gold": -3
          },
          "resultado": "O bispo deixa uma bênção e uma anotação elogiosa. Três famílias do clero ficam para ajudar."
        },
        {
          "id": "doar",
          "texto": "Pagar uma doação · 5 gold",
          "requisitos": {
            "goldMin": 5
          },
          "efeitos": {
            "honra": 2,
            "gold": -5
          },
          "resultado": "O bispo agradece com palavras longas. A vila entende que o bom nome tem preço."
        },
        {
          "id": "esconder",
          "texto": "Esconder o que a vila realmente é.",
          "requisitos": {
            "honraMax": -30
          },
          "efeitos": {
            "gold": 3,
            "honra": -4,
            "habitantes": -2
          },
          "resultado": "O bispo parte sem desconfiar. Dois moradores que viram a farsa partem logo depois."
        }
      ],
      "imagem": "assets/vila.svg",
      "imagemAlt": "Cena da vila durante a visita do bispo"
    },
    {
      "id": "aquele_que_vem_depois",
      "titulo": "Aquele que vem depois",
      "tipo": "mandatorio",
      "peso": 1,
      "requisitos": {
        "rodadaMin": 20,
        "flagsAusentes": [
          "sucessor_visto"
        ]
      },
      "texto": "Numa noite sem lua, você vê uma criança sentada no degrau do portão. Ela não responde quando você fala. Apenas olha, e parece já saber seu nome.",
      "informacoes": "Nada acontece até que algo aconteça.",
      "opcoes": [
        {
          "id": "sentar",
          "texto": "Sentar-se ao lado da criança.",
          "efeitos": {
            "honra": 3,
            "hp": -5
          },
          "resultado": "Vocês ficam em silêncio até o amanhecer. Ao despertar, o degrau está vazio, e sua vontade, mais leve.",
          "flags": {
            "sucessor_visto": true
          },
          "desbloqueia": {
            "flags": [
              "sucessor_pressentido"
            ]
          }
        }
      ],
      "imagem": "assets/vila.svg",
      "imagemAlt": "Cena da vila durante aquele que vem depois"
    }
  ]);
  // Eventos especiais 101–120 fornecidos pelo autor.
  Jogo.eventos.push(...[
    {
      "id": "dama_da_agua",
      "titulo": "A dama sob a água",
      "tipo": "especial",
      "peso": 0.3,
      "especial": true,
      "requisitos": {
        "rodadaMin": 8,
        "flagsAusentes": [
          "pacto_feito"
        ]
      },
      "texto": "No fim da tarde, uma mulher de cabelos que se movem contra a corrente emerge até a cintura no rio. Diz que devolve tudo o que a água já levou, e que só precisa de algo que o rio ainda não tenha.",
      "informacoes": "Ninguém na margem ousa respirar alto. A água ao redor dela está parada.",
      "opcoes": [
        {
          "id": "espada",
          "texto": "Afundar sua espada no rio.",
          "requisitos": {
            "ataqueMin": 3
          },
          "efeitos": {
            "habitantes": 8,
            "honra": 3,
            "ataque": -2
          },
          "resultado": "A lâmina some sem som. Na manhã seguinte, oito pessoas que o rio levara em invernos antigos aparecem à margem, confusas e vivas.",
          "flags": {
            "pacto_feito": true,
            "pacto_dama": true
          }
        },
        {
          "id": "lembranca",
          "texto": "Entregar uma lembrança querida.",
          "efeitos": {
            "hp": 20,
            "honra": -3
          },
          "resultado": "Você não sabe mais o nome da primeira pessoa que o ensinou a cavalgar. Sente-se leve, e ligeiramente menor.",
          "flags": {
            "pacto_feito": true,
            "pacto_dama": true
          }
        },
        {
          "id": "recusar",
          "texto": "Agradecer e recusar.",
          "efeitos": {
            "honra": 2
          },
          "resultado": "A mulher afunda sem protestar. O rio volta a correr, e os moradores demoram a se afastar da margem."
        }
      ],
      "imagem": "assets/dama-da-agua.svg",
      "imagemAlt": "A dama do lago emerge entre ondas e juncos",
      "pacto": true
    },
    {
      "id": "corvo",
      "titulo": "O corvo que fala",
      "tipo": "especial",
      "peso": 0.3,
      "especial": true,
      "requisitos": {
        "rodadaMin": 6,
        "flagsAusentes": [
          "pacto_feito"
        ]
      },
      "texto": "Um corvo pousa na mesa do salão e cumprimenta você pelo nome, pelo nome do seu pai, e pelo nome de quem ainda não nasceu. Diz que sabe o que as pessoas pensam antes de escolher.",
      "informacoes": "O corvo oferece ver o que a vila não vê. Cobra pelo serviço.",
      "opcoes": [
        {
          "id": "aceitar",
          "texto": "Aceitá-lo no ombro.",
          "requisitos": {
            "goldMin": 5
          },
          "efeitos": {
            "gold": -5,
            "honra": -2
          },
          "resultado": "O corvo sussurra ao seu ouvido o que cada opção custa aos outros. Você passa a escolher com os olhos abertos.",
          "flags": {
            "pacto_feito": true,
            "pacto_corvo": true
          },
          "efeitoContinuo": {
            "revelarHonraRodadas": 5
          },
          "itens": ["amuleto_ultima_guarda"]
        },
        {
          "id": "segredo",
          "texto": "Pagar por um segredo só.",
          "requisitos": {
            "goldMin": 2
          },
          "efeitos": {
            "gold": 8,
            "honra": -3
          },
          "resultado": "O corvo conta onde um mercador esconde as moedas. Você as encontra. Ninguém pergunta como."
        },
        {
          "id": "expulsar",
          "texto": "Expulsá-lo da casa.",
          "efeitos": {
            "honra": 1
          },
          "resultado": "O corvo sai pela janela rindo. Por semanas, você ouve pássaros demais nos telhados."
        }
      ],
      "imagem": "assets/corvo.svg",
      "imagemAlt": "Corvo de perfil com tapa-olho e uma runa sob as asas",
      "pacto": true
    },
    {
      "id": "mercador_sem_sombra",
      "titulo": "O mercador sem sombra",
      "tipo": "especial",
      "peso": 0.3,
      "especial": true,
      "requisitos": {
        "rodadaMin": 7,
        "flagsAusentes": [
          "pacto_feito"
        ]
      },
      "texto": "Um homem de sorriso fácil atravessa o pátio em pleno meio-dia, sem sombra. Abre a capa e mostra armaduras, armas e frascos. Diz que aceita qualquer moeda, menos as de ouro.",
      "informacoes": "O mercador não cobra em gold. Ele cobra naquilo que você não sabe que tem.",
      "opcoes": [
        {
          "id": "armadura",
          "texto": "Comprar a armadura do silêncio.",
          "efeitos": {
            "escudo": 4,
            "habitantes": -5
          },
          "resultado": "A armadura serve como se tivesse sido feita para você. Cinco moradores partem na mesma noite, sem se despedir, e ninguém fala disso.",
          "flags": {
            "pacto_feito": true,
            "pacto_sem_sombra": true
          }
        },
        {
          "id": "lamina",
          "texto": "Comprar a lâmina que nunca erra.",
          "efeitos": {
            "ataque": 3,
            "honra": -6
          },
          "resultado": "A lâmina corta o que você aponta. O povo olha para ela e depois para você, calculando quem manda em quem.",
          "flags": {
            "pacto_feito": true,
            "pacto_sem_sombra": true
          }
        },
        {
          "id": "sombra",
          "texto": "Vender a própria sombra.",
          "efeitos": {
            "gold": 15,
            "hp": -10,
            "honra": -4
          },
          "resultado": "Ao meio-dia seguinte, você projeta um pouco menos de chão do que antes. O ouro, porém, é verdadeiro.",
          "flags": {
            "pacto_feito": true,
            "pacto_sem_sombra": true
          }
        },
        {
          "id": "seguir",
          "texto": "Deixá-lo seguir.",
          "efeitos": {
            "honra": 1
          },
          "resultado": "O mercador faz uma mesura exagerada e parte. Os cães ladram até o anoitecer, para a estrada vazia."
        }
      ],
      "imagem": "assets/mercador-sem-sombra.svg",
      "imagemAlt": "Mercador encapuzado diante de uma balança e sem sombra",
      "pacto": true
    },
    {
      "id": "arvore_que_pede",
      "titulo": "A árvore que pede",
      "tipo": "especial",
      "peso": 0.3,
      "especial": true,
      "requisitos": {
        "rodadaMin": 5,
        "flagsAusentes": [
          "pacto_feito"
        ]
      },
      "texto": "No limite do bosque, um carvalho tão velho quanto a vila abriu uma fenda no tronco com o formato de uma boca. As raízes se levantaram da terra e apontam para você.",
      "informacoes": "Os mais velhos dizem que a árvore já pediu coisas antes, e que quem negou nunca contou o resto.",
      "opcoes": [
        {
          "id": "sangue",
          "texto": "Regar as raízes com seu sangue.",
          "efeitos": {
            "habitantes": 6,
            "honra": 3,
            "hp": -12
          },
          "resultado": "As folhas caem de uma vez e brotam de novo em um dia. Seis famílias chegam do bosque, dizendo que sonharam com a vila.",
          "flags": {
            "pacto_feito": true,
            "pacto_arvore": true
          }
        },
        {
          "id": "ouvir",
          "texto": "Ajoelhar-se e ouvir.",
          "requisitos": {
            "honraMin": 50
          },
          "efeitos": {
            "honra": 5,
            "escudo": 2,
            "habitantes": 4
          },
          "resultado": "A árvore não pede nada. Apenas fala, em uma língua que você entende e esquece ao despertar. Os moradores ouvem de longe, comovidos sem saber por quê.",
          "flags": {
            "pacto_feito": true,
            "pacto_arvore": true
          }
        },
        {
          "id": "cortar",
          "texto": "Mandar cortar a árvore.",
          "efeitos": {
            "gold": 8,
            "honra": -6,
            "habitantes": -4
          },
          "resultado": "O machado se parte duas vezes antes de morder. Quando cai, a árvore sangra seiva escura. Quatro famílias deixam a vila antes do pôr do sol."
        }
      ],
      "imagem": "assets/arvore-que-pede.svg",
      "imagemAlt": "Árvore antiga com um rosto entalhado e uma mão oferecendo",
      "pacto": true
    },
    {
      "id": "cervo_branco",
      "titulo": "O cervo de chifres brancos",
      "tipo": "especial",
      "peso": 0.3,
      "especial": true,
      "requisitos": {
        "rodadaMin": 8
      },
      "texto": "Um cervo de pelagem clara e chifres que parecem osso polido cruza o campo sem pressa. Os cães não latem, e os caçadores baixam as lanças sem que ninguém ordene.",
      "informacoes": "A lenda diz que quem o abate prospera e quem o poupa é lembrado. A lenda não diz qual é melhor.",
      "opcoes": [
        {
          "id": "abater",
          "texto": "Abatê-lo.",
          "efeitos": {
            "gold": 12,
            "honra": -10
          },
          "resultado": "Os chifres rendem uma fortuna a um mercador distante. Na vila, os cães não se aproximam de você por muito tempo."
        },
        {
          "id": "poupar",
          "texto": "Deixá-lo passar.",
          "efeitos": {
            "honra": 6,
            "habitantes": 4
          },
          "resultado": "O cervo olha para você uma vez e some entre as árvores. Quatro famílias do bosque pedem abrigo, dizendo que os animais as guiaram."
        },
        {
          "id": "seguir",
          "texto": "Segui-lo até a clareira.",
          "requisitos": {
            "honraMin": 30
          },
          "efeitos": {
            "ataque": 2,
            "escudo": 2,
            "honra": 3,
            "hp": -8
          },
          "resultado": "A clareira guarda uma pedra coberta de musgo. Você toca nela e volta dois dias depois, mais velho e mais firme."
        }
      ],
      "imagem": "assets/cervo-branco.svg",
      "imagemAlt": "Cervo branco parado na orla de uma floresta"
    },
    {
      "id": "ceifadeira",
      "titulo": "A ceifadeira à mesa",
      "tipo": "especial",
      "peso": 0.3,
      "especial": true,
      "requisitos": {
        "rodadaMin": 10
      },
      "texto": "Na ceia, há um prato a mais na mesa que ninguém lembra de ter posto. Uma mulher de manto cinzento senta e pede vinho, com a naturalidade de quem nunca precisou pedir.",
      "informacoes": "Ela diz que veio só jantar. Os cães do pátio estão em silêncio.",
      "opcoes": [
        {
          "id": "conversar",
          "texto": "Servir vinho e conversar.",
          "efeitos": {
            "hp": 20,
            "honra": 2,
            "habitantes": -2
          },
          "resultado": "Ela fala de tudo, menos de mortes. Ao se despedir, deixa o prato limpo. Duas pessoas que dormiam nas casas vizinhas não acordam."
        },
        {
          "id": "barganhar",
          "texto": "Barganhar a vida de um moribundo.",
          "efeitos": {
            "habitantes": 3,
            "honra": 4,
            "hp": -10
          },
          "resultado": "Ela concorda com um aceno cansado. Você se levanta da mesa com a cabeça girando. Três vizinhos, antes à beira da morte, acordam com fome."
        },
        {
          "id": "outro",
          "texto": "Pedir que leve outro no seu lugar.",
          "requisitos": {
            "honraMax": -50
          },
          "efeitos": {
            "hp": 25,
            "habitantes": -8,
            "honra": -10
          },
          "resultado": "Ela sorri sem alegria. Na manhã seguinte, oito casas têm cortinas fechadas. A vila nunca mais pergunta nada ao senhor."
        }
      ],
      "imagem": "assets/ceifadeira.svg",
      "imagemAlt": "Figura encapuzada da ceifadeira sentada à mesa"
    },
    {
      "id": "espelho_do_antecessor",
      "titulo": "O espelho do antecessor",
      "tipo": "especial",
      "peso": 0.3,
      "especial": true,
      "requisitos": {
        "rodadaMin": 9
      },
      "texto": "Atrás de uma cortina no salão, você encontra um espelho que não tinha visto. Nele, em vez de seu rosto, aparece o do senhor anterior, de costas, olhando para algo que você não vê.",
      "informacoes": "O espelho não tem moldura e não reflete a sala.",
      "opcoes": [
        {
          "id": "olhar",
          "texto": "Olhar fixamente.",
          "efeitos": {
            "honra": 3,
            "hp": -5
          },
          "resultado": "Ele se vira. Não diz nada. Você sai com os olhos úmidos e uma estranha certeza de que ele esperava mais.",
          "desbloqueia": {
            "flags": [
              "antecessor_visto"
            ]
          }
        },
        {
          "id": "perguntar",
          "texto": "Perguntar o que ele faria.",
          "requisitos": {
            "honraMin": 30
          },
          "efeitos": {
            "honra": 4,
            "ataque": 1,
            "escudo": 1,
            "hp": -3
          },
          "resultado": "A resposta vem em forma de memória: um dia de batalha que você nunca viveu. Suas mãos passam a saber algo que a cabeça ignora."
        },
        {
          "id": "quebrar",
          "texto": "Quebrar o espelho.",
          "efeitos": {
            "gold": 4,
            "honra": -4
          },
          "resultado": "Os cacos valem algo para um vidraceiro, mas a vila ouve o barulho e entende que o senhor quebrou algo importante."
        }
      ],
      "imagem": "assets/espelho-do-antecessor.svg",
      "imagemAlt": "Espelho antigo refletindo a silhueta de um antecessor"
    },
    {
      "id": "fiandeiras",
      "titulo": "As três fiandeiras",
      "tipo": "especial",
      "peso": 0.3,
      "especial": true,
      "requisitos": {
        "rodadaMin": 10,
        "flagsAusentes": [
          "pacto_feito"
        ]
      },
      "texto": "Três velhas fiam sob o carvalho da praça, e ninguém sabe quando chegaram. Os fios que enrolam são de cores que não têm nome. Uma delas ergue uma tesoura e pergunta quanto tempo você acha que ainda tem.",
      "informacoes": "Os fios pertencem a todos os moradores. Um deles pertence a você.",
      "opcoes": [
        {
          "id": "longo",
          "texto": "Pedir um fio mais longo.",
          "efeitos": {
            "hp": 30,
            "honra": -6
          },
          "resultado": "A tesoura corta o fio de outra pessoa para emendar ao seu. Você sente o corpo ficar mais firme. Nunca descobre de quem era.",
          "flags": {
            "pacto_feito": true,
            "pacto_fiandeiras": true
          }
        },
        {
          "id": "vila",
          "texto": "Pedir o fio da vila inteira entrelaçado ao seu.",
          "efeitos": {
            "habitantes": 10,
            "hp": -15
          },
          "resultado": "O fio da vila se enrola ao seu. Dez novos moradores aparecem pela estrada, sem lembrar por que vieram. Seus joelhos pesam como os de um velho.",
          "flags": {
            "pacto_feito": true,
            "pacto_fiandeiras": true
          }
        },
        {
          "id": "intocado",
          "texto": "Pedir que não toquem em nenhum fio.",
          "requisitos": {
            "honraMin": 30
          },
          "efeitos": {
            "honra": 4
          },
          "resultado": "As velhas se entreolham e voltam a fiar. Quando você olha de novo, a praça está vazia e o carvalho carrega três fitas coloridas."
        }
      ],
      "imagem": "assets/fiandeiras.svg",
      "imagemAlt": "Três fiandeiras trabalhando em um único fio",
      "pacto": true
    },
    {
      "id": "contrato_vermelho",
      "titulo": "O contrato vermelho",
      "tipo": "especial",
      "peso": 0.3,
      "especial": true,
      "requisitos": {
        "rodadaMin": 8,
        "flagsAusentes": [
          "pacto_feito"
        ]
      },
      "texto": "Um homem muito educado deixa um pergaminho em sua mesa e desaparece pela chaminé. O papel está em branco até você tocá-lo, e então as letras surgem em vermelho, com uma caligrafia que parece a sua.",
      "informacoes": "O contrato promete força, ouro e proteção. As cláusulas são longas. Há uma linha apagada.",
      "opcoes": [
        {
          "id": "assinar",
          "texto": "Assinar com o próprio sangue.",
          "efeitos": {
            "gold": 20,
            "ataque": 2,
            "honra": -10,
            "hp": -12
          },
          "resultado": "O sangue seca em forma de selo. Seus bolsos pesam e sua mão direita nunca erra. Ninguém na vila mais olha para suas mãos.",
          "flags": {
            "pacto_feito": true,
            "pacto_contrato": true
          }
        },
        {
          "id": "renegociar",
          "texto": "Ler as cláusulas e renegociar.",
          "requisitos": {
            "honraMin": 30
          },
          "efeitos": {
            "gold": 10,
            "ataque": 1,
            "honra": -4,
            "hp": -5
          },
          "resultado": "Você descobre uma brecha, e o homem aparece para discutir em voz baixa. Ele sai com uma metade do que queria, e você, com a outra.",
          "flags": {
            "pacto_feito": true,
            "pacto_contrato": true
          }
        },
        {
          "id": "povo",
          "texto": "Assinar em nome do povo.",
          "requisitos": {
            "honraMax": -50
          },
          "efeitos": {
            "ataque": 4,
            "escudo": 4,
            "habitantes": -10,
            "honra": -12
          },
          "resultado": "As casas ficam quietas durante a noite. Pela manhã, dez delas estão vazias, com as portas abertas e o fogo ainda aceso.",
          "flags": {
            "pacto_feito": true,
            "pacto_contrato": true
          }
        },
        {
          "id": "rasgar",
          "texto": "Rasgar o contrato.",
          "efeitos": {
            "honra": 4,
            "hp": -6
          },
          "resultado": "O papel grita ao ser rasgado, e sua mão queima. A vila acorda com o som e olha para o senhor, sem saber o que viu."
        }
      ],
      "imagem": "assets/contrato-vermelho.svg",
      "imagemAlt": "Contrato selado repousando sobre uma mesa",
      "pacto": true
    },
    {
      "id": "cavaleiro_de_osso",
      "titulo": "O cavaleiro de osso",
      "tipo": "especial",
      "peso": 0.3,
      "especial": true,
      "requisitos": {
        "rodadaMin": 12
      },
      "texto": "Uma armadura enferrujada caminha pela estrada com um arco de ossos no lugar do rosto. Não fala. Planta a lança no chão diante do portão e espera.",
      "informacoes": "O ataque precisa alcançar a defesa do cavaleiro. Seu escudo reduz o dano recebido, sem se desgastar.",
      "opcoes": [
        {
          "id": "enfrentar",
          "texto": "Enfrentá-lo.",
          "combate": true
        },
        {
          "id": "jurar",
          "texto": "Jurar lealdade ao cavaleiro.",
          "requisitos": {
            "honraMin": 50,
            "flagsAusentes": [
              "pacto_feito"
            ]
          },
          "efeitos": {
            "ataque": 3,
            "escudo": 3,
            "habitantes": -8,
            "honra": -2
          },
          "resultado": "O cavaleiro ergue a lança e a abaixa sobre seus ombros. Oito moradores que presenciaram seguem a armadura pela estrada, em silêncio.",
          "flags": {
            "pacto_feito": true,
            "pacto_cavaleiro": true
          }
        },
        {
          "id": "passagem",
          "texto": "Pedir passagem pacificamente.",
          "efeitos": {
            "honra": -3
          },
          "resultado": "O cavaleiro não responde. Passa pelo portão, atravessa a vila e some ao norte, sem tocar em ninguém, deixando um vazio atrás."
        }
      ],
      "imagem": "assets/cavaleiro-de-osso.svg",
      "imagemAlt": "Cavaleiro de ossos com elmo e espada enferrujada",
      "batalha": {
        "defesa": 7,
        "vitoria": {
          "dano": 22,
          "efeitos": {
            "honra": 6,
            "ataque": 1,
            "gold": 10
          },
          "resultado": "A armadura desmonta peça por peça. Debaixo dela, há apenas pó e uma moeda antiga. Os moradores nunca esquecem a luta."
        },
        "derrota": {
          "dano": 32,
          "efeitos": {},
          "resultado": "Cada golpe seu encontra apenas aço oco. O cavaleiro o derruba sem raiva e vai embora pela estrada."
        },
        "penalidadeFalha": {
          "efeitos": {
            "honra": -5,
            "habitantes": -3
          },
          "texto": "A vila viu o senhor cair. Três famílias partem sem esperar o amanhecer."
        }
      }
    },
    {
      "id": "santa_sem_nome",
      "titulo": "A santa sem nome",
      "tipo": "especial",
      "peso": 0.3,
      "especial": true,
      "requisitos": {
        "rodadaMin": 8
      },
      "texto": "Uma mulher descalça entra na vila pedindo apenas água. Onde pisa, o barro seca. As crianças a seguem em silêncio e os doentes se arrastam até a porta.",
      "informacoes": "Ninguém sabe seu nome. Ela cura, mas diz que cada cura tem um dono.",
      "opcoes": [
        {
          "id": "vila",
          "texto": "Pedir cura para os doentes da vila.",
          "efeitos": {
            "habitantes": 8,
            "honra": 4,
            "hp": -8
          },
          "resultado": "A santa toca os doentes um a um. Ao terminar, está mais pálida e o senhor, mais cansado. Oito famílias sentem que a vila foi escolhida."
        },
        {
          "id": "si",
          "texto": "Pedir cura para si.",
          "efeitos": {
            "hp": 35,
            "honra": -6
          },
          "resultado": "Seu corpo parece novo e a vila, desconfiada. Os doentes, nas portas, entendem que foram preteridos."
        },
        {
          "id": "agua",
          "texto": "Oferecer água e nada pedir.",
          "requisitos": {
            "honraMin": 50
          },
          "efeitos": {
            "honra": 6,
            "escudo": 1
          },
          "resultado": "Ela bebe devagar. Antes de partir, toca seu escudo. Ele passa a pesar menos e a proteger mais."
        }
      ],
      "imagem": "assets/santa-sem-nome.svg",
      "imagemAlt": "Pequena estátua de uma santa sem rosto"
    },
    {
      "id": "lobo_pactuario",
      "titulo": "O lobo que fala baixo",
      "tipo": "especial",
      "peso": 0.3,
      "especial": true,
      "requisitos": {
        "rodadaMin": 7,
        "flagsAusentes": [
          "pacto_feito"
        ]
      },
      "texto": "Um lobo cinzento senta no pátio e fala em voz baixa, quase um ronronar. Oferece a proteção da matilha em troca de parte do rebanho e de um lugar à mesa.",
      "informacoes": "Atrás dele, entre as árvores, dezenas de olhos observam sem piscar.",
      "opcoes": [
        {
          "id": "matilha",
          "texto": "Aceitar o pacto da matilha.",
          "efeitos": {
            "ataque": 2,
            "escudo": 2,
            "habitantes": -5,
            "honra": -2
          },
          "resultado": "A matilha passa a dormir no limite da vila. Cinco moradores somem em semanas, e ninguém acusa os lobos. Ninguém ousa.",
          "flags": {
            "pacto_feito": true,
            "pacto_lobo": true
          }
        },
        {
          "id": "rebanho",
          "texto": "Oferecer parte do rebanho, sem pacto.",
          "efeitos": {
            "honra": 1,
            "gold": -3
          },
          "resultado": "O lobo come devagar e agradece a hospitalidade. Parte ao anoitecer, e os cães do pátio voltam a latir."
        },
        {
          "id": "expulsar",
          "texto": "Expulsá-lo com os guardas.",
          "efeitos": {
            "honra": 2,
            "hp": -8
          },
          "resultado": "O lobo recua sem lutar, mas uma dentada profunda em seu braço fica como lembrete. Pelos próximos dias, você ouve uivos que parecem rir."
        }
      ],
      "imagem": "assets/lobo-pactuario.svg",
      "imagemAlt": "Lobo olhando para trás sob uma lua estreita",
      "pacto": true
    },
    {
      "id": "anjo_cansado",
      "titulo": "O anjo cansado",
      "tipo": "especial",
      "peso": 0.3,
      "especial": true,
      "requisitos": {
        "honraMin": 30,
        "rodadaMin": 12
      },
      "texto": "Um homem de asas encolhidas dorme na porta do celeiro, encolhido sobre palha. Tem as mãos queimadas, as penas escuras de fuligem, e chora baixinho quando acorda.",
      "informacoes": "Ele diz que carregou a vontade de muitos e que agora só quer descansar. Não pede nada além de um canto.",
      "opcoes": [
        {
          "id": "pouso",
          "texto": "Dar-lhe pouso e silêncio.",
          "efeitos": {
            "honra": 6,
            "habitantes": 8
          },
          "resultado": "O anjo dorme por sete dias. Ao partir, deixa uma pena sobre o travesseiro. Oito famílias, tocadas pelo rumor, chegam à vila."
        },
        {
          "id": "bencao",
          "texto": "Pedir uma bênção para o povo.",
          "efeitos": {
            "escudo": 4,
            "honra": 4,
            "hp": -8
          },
          "resultado": "Ele ergue as mãos queimadas e murmura. O cansaço dele passa para você, e a proteção, para a vila."
        },
        {
          "id": "pena",
          "texto": "Recolher uma pena como relíquia.",
          "requisitos": {
            "honraMax": -30
          },
          "efeitos": {
            "gold": 20,
            "honra": -10
          },
          "resultado": "A pena vale uma fortuna a um colecionador. O anjo acorda ao ver a mão, não protesta, e parte sem olhar para trás."
        }
      ],
      "imagem": "assets/anjo-cansado.svg",
      "imagemAlt": "Anjo cansado sentado com as asas baixas"
    },
    {
      "id": "sussurro_do_ouro",
      "titulo": "O sussurro no cofre",
      "tipo": "especial",
      "peso": 0.3,
      "especial": true,
      "requisitos": {
        "honraMax": -30,
        "goldMin": 5,
        "rodadaMin": 9,
        "flagsAusentes": [
          "pacto_feito"
        ]
      },
      "texto": "À noite, o cofre fala. Primeiro, parece um ranger de metal; depois, uma voz clara que conta as moedas e promete multiplicá-las.",
      "informacoes": "A voz não ameaça. Apenas pede que você a ouça até o fim.",
      "opcoes": [
        {
          "id": "ouvir",
          "texto": "Ouvir até o fim.",
          "efeitos": {
            "gold": 25,
            "honra": -8,
            "hp": -8
          },
          "resultado": "As moedas dobram em uma noite. Você acorda com uma sensação de ter sido contado também.",
          "flags": {
            "pacto_feito": true,
            "pacto_ouro": true
          }
        },
        {
          "id": "morador",
          "texto": "Oferecer um morador em troca.",
          "requisitos": {
            "honraMax": -50
          },
          "efeitos": {
            "gold": 40,
            "habitantes": -5,
            "honra": -12
          },
          "resultado": "O cofre engole cinco nomes. As portas ficam abertas durante a noite, e os cães não reconhecem seu cheiro pela manhã.",
          "flags": {
            "pacto_feito": true,
            "pacto_ouro": true
          }
        },
        {
          "id": "esvaziar",
          "texto": "Esvaziar o cofre entre o povo.",
          "requisitos": {
            "goldMin": 5
          },
          "efeitos": {
            "habitantes": 8,
            "honra": 6,
            "gold": -5
          },
          "resultado": "A voz cala. As moedas são repartidas, e oito pessoas que nunca tinham tido uma passam a olhar para você de outro jeito."
        }
      ],
      "imagem": "assets/sussurro-do-ouro.svg",
      "imagemAlt": "Cofre aberto com moedas e um rosto sussurrante",
      "pacto": true
    },
    {
      "id": "rei_sob_a_colina",
      "titulo": "O rei sob a colina",
      "tipo": "especial",
      "peso": 0.3,
      "especial": true,
      "requisitos": {
        "rodadaMin": 14,
        "flagsAusentes": [
          "pacto_feito"
        ]
      },
      "texto": "Um pastor corre até o salão afirmando que a colina se abriu. Dentro, uma fila de soldados de pedra dorme em volta de um trono, e o homem que o ocupa abre os olhos quando você entra.",
      "informacoes": "O rei diz que esperou séculos por um senhor digno. Ou desesperado.",
      "opcoes": [
        {
          "id": "exercito",
          "texto": "Pedir o exército adormecido.",
          "efeitos": {
            "ataque": 4,
            "escudo": 4,
            "habitantes": -15,
            "honra": -4
          },
          "resultado": "Os soldados de pedra marcham até as muralhas e se instalam. Quinze moradores, apavorados, partem antes do primeiro dia.",
          "flags": {
            "pacto_feito": true,
            "pacto_rei": true
          }
        },
        {
          "id": "conselho",
          "texto": "Pedir conselho e nada mais.",
          "requisitos": {
            "honraMin": 30
          },
          "efeitos": {
            "honra": 5,
            "ataque": 1,
            "escudo": 1,
            "hp": -6
          },
          "resultado": "O rei fala por três noites. Você sai da colina com um mapa mental de erros que ainda não cometeu.",
          "itens": ["oleo_de_lamina"]
        },
        {
          "id": "ouro",
          "texto": "Pedir o ouro do trono.",
          "efeitos": {
            "gold": 30,
            "honra": -8,
            "hp": -10
          },
          "resultado": "O rei não protesta. Suas moedas, porém, nunca pesaram tanto, e à noite os soldados de pedra mudam de posição.",
          "flags": {
            "pacto_feito": true,
            "pacto_rei": true
          }
        },
        {
          "id": "selar",
          "texto": "Selar a colina de novo.",
          "efeitos": {
            "honra": 3,
            "habitantes": 2,
            "hp": -6
          },
          "resultado": "As pedras voltam ao lugar com esforço da vila inteira. O pastor chora de alívio, e os cães, desde então, evitam a colina."
        }
      ],
      "imagem": "assets/rei-sob-a-colina.svg",
      "imagemAlt": "Rei antigo sentado em um salão subterrâneo",
      "pacto": true
    },
    {
      "id": "mao_na_janela",
      "titulo": "A mão na janela",
      "tipo": "especial",
      "peso": 0.3,
      "especial": true,
      "requisitos": {
        "rodadaMin": 6
      },
      "texto": "Em plena madrugada, uma mão de dedos longos se apoia no parapeito da janela do seu quarto. Não bate, não puxa. Apenas espera.",
      "informacoes": "O quarto está no segundo andar. A mão não tem braço visível.",
      "opcoes": [
        {
          "id": "apertar",
          "texto": "Apertar a mão.",
          "efeitos": {
            "hp": 10,
            "honra": 2,
            "habitantes": -2
          },
          "resultado": "A mão é fria e firme. Pela manhã, duas famílias que moravam longe do castelo não estão em casa, e as portas rangem sozinhas."
        },
        {
          "id": "fechar",
          "texto": "Fechar a janela.",
          "efeitos": {
            "hp": -3
          },
          "resultado": "A mão recua devagar. Por semanas, você dorme com a janela trancada e acorda sempre antes do amanhecer."
        },
        {
          "id": "moeda",
          "texto": "Colocar uma moeda na palma.",
          "requisitos": {
            "goldMin": 1
          },
          "efeitos": {
            "honra": 3,
            "gold": -1
          },
          "resultado": "A mão se fecha sobre a moeda e some. De manhã, a moeda está no parapeito, mais velha, com o seu rosto gravado."
        }
      ],
      "imagem": "assets/mao-na-janela.svg",
      "imagemAlt": "Mão pálida surgindo de uma janela entreaberta"
    },
    {
      "id": "relojoeiro",
      "titulo": "O relojoeiro do tempo",
      "tipo": "especial",
      "peso": 0.3,
      "especial": true,
      "requisitos": {
        "rodadaMin": 10,
        "flagsAusentes": [
          "pacto_feito"
        ]
      },
      "texto": "Um homem de aventais cheios de engrenagens chega à vila carregando um relógio que marca horas que ninguém reconhece. Oferece consertar o que se quebrou entre as pessoas e o tempo.",
      "informacoes": "Ele diz que pode apagar o que foi feito. Não diz o que acontece com as consequências.",
      "opcoes": [
        {
          "id": "erros",
          "texto": "Apagar seus erros.",
          "requisitos": {
            "honraMax": -30
          },
          "efeitos": {
            "hp": -10,
            "habitantes": -3
          },
          "resultado": "As engrenagens giram ao contrário. Os moradores lembram de você como alguém neutro e, por isso, ainda mais assustador. Três pessoas partem sem entender por quê.",
          "flags": {
            "pacto_feito": true,
            "pacto_relojoeiro": true
          },
          "definir": {
            "honra": 0
          }
        },
        {
          "id": "acertos",
          "texto": "Apagar seus acertos.",
          "requisitos": {
            "honraMin": 30
          },
          "efeitos": {
            "gold": 20
          },
          "resultado": "O relojoeiro faz um arranjo discreto. Seus feitos nobres viram boatos, e o cofre ganha um peso estranho. Os moradores lembram que você fez algo importante, mas não o quê.",
          "flags": {
            "pacto_feito": true,
            "pacto_relojoeiro": true
          },
          "definir": {
            "honra": 0
          }
        },
        {
          "id": "vida",
          "texto": "Pedir mais tempo de vida.",
          "efeitos": {
            "hp": 25,
            "honra": -5
          },
          "resultado": "O relógio acelera por um instante, e seu corpo recupera meses perdidos. Algo, em algum lugar, envelhece no seu lugar.",
          "flags": {
            "pacto_feito": true,
            "pacto_relojoeiro": true
          }
        },
        {
          "id": "recusar",
          "texto": "Recusar e deixá-lo seguir.",
          "efeitos": {
            "honra": 1
          },
          "resultado": "O relojoeiro ajusta uma engrenagem e parte. Os relógios da vila passam a marcar horas diferentes por uma semana."
        }
      ],
      "imagem": "assets/relojoeiro.svg",
      "imagemAlt": "Relojoeiro curvado sobre um relógio aberto",
      "pacto": true
    },
    {
      "id": "colheita_de_sombras",
      "titulo": "A colheita de sombras",
      "tipo": "especial",
      "peso": 0.3,
      "especial": true,
      "requisitos": {
        "rodadaMin": 9
      },
      "texto": "Durante a noite, uma figura percorre as ruas com uma foice fina e corta algo no chão, atrás de cada morador adormecido. Pela manhã, ninguém lembra de ter sonhado, e as sombras parecem mais claras.",
      "informacoes": "Os moradores acordam descansados. Também mais silenciosos.",
      "opcoes": [
        {
          "id": "enfrentar",
          "texto": "Esperar a figura e enfrentá-la.",
          "efeitos": {
            "honra": 4,
            "ataque": 1,
            "hp": -12
          },
          "resultado": "A foice acerta seu peito sem ferir. A figura se desfaz em fumaça escura, e as sombras dos moradores voltam ao lugar com um suspiro."
        },
        {
          "id": "comprar",
          "texto": "Comprar o que foi colhido · 5 gold",
          "requisitos": {
            "goldMin": 5
          },
          "efeitos": {
            "habitantes": 5,
            "honra": 2,
            "gold": -5
          },
          "resultado": "A figura aceita as moedas e devolve as sombras. Cinco famílias, aliviadas, passam a dormir melhor, e a se curvar mais."
        },
        {
          "id": "deixar",
          "texto": "Deixar a colheita continuar.",
          "efeitos": {
            "gold": 6,
            "honra": -4,
            "habitantes": -3
          },
          "resultado": "As noites se tornam quietas, e os dias, mais obedientes. Três famílias, que perceberam, partem à noite."
        }
      ],
      "imagem": "assets/colheita-de-sombras.svg",
      "imagemAlt": "Espantalho projetando sombras compridas sobre o campo"
    },
    {
      "id": "sino_antigo",
      "titulo": "A voz do sino antigo",
      "tipo": "especial",
      "peso": 0.3,
      "especial": true,
      "requisitos": {
        "rodadaMin": 11
      },
      "texto": "Do fundo do lago atrás do bosque, um sino toca sem ninguém tocá-lo. As ondas pulsam em compasso com o som, e as crianças dizem que ele chama pelos nomes dos moradores.",
      "informacoes": "Ninguém lembra de uma igreja afundada naquele lago.",
      "opcoes": [
        {
          "id": "mergulhar",
          "texto": "Mergulhar para encontrá-lo.",
          "efeitos": {
            "escudo": 1,
            "honra": 5,
            "gold": 10,
            "hp": -14
          },
          "resultado": "A água é gelada e escura. Você traz uma cruz de bronze e uma sensação de ter sido visto por algo maior."
        },
        {
          "id": "responder",
          "texto": "Responder ao chamado com um sino da vila.",
          "efeitos": {
            "habitantes": 5,
            "honra": 2,
            "gold": -2
          },
          "resultado": "O sino da vila ressoa na mesma nota. Cinco pessoas, antes alheias, aparecem à margem sem lembrar de ter sido chamadas."
        },
        {
          "id": "esperar",
          "texto": "Tapar os ouvidos e esperar o fim.",
          "efeitos": {
            "honra": -2,
            "habitantes": -2
          },
          "resultado": "O som cessa depois de três noites. Duas famílias que o ouviam melhor que as outras partem, e os cães nunca mais se aproximam do lago."
        }
      ],
      "imagem": "assets/sino-antigo.svg",
      "imagemAlt": "Sino antigo pendurado em uma viga rachada"
    },
    {
      "id": "primeiro_herdeiro",
      "titulo": "O primeiro herdeiro",
      "tipo": "especial",
      "peso": 0.2,
      "especial": true,
      "requisitos": {
        "rodadaMin": 18,
        "flagsAusentes": [
          "pacto_feito"
        ],
        "flagsLegado": [
          "sucessor_pressentido"
        ]
      },
      "texto": "Em um cômodo trancado do castelo, que ninguém abria há gerações, um homem de armadura antiga se levanta de uma cadeira. Seu rosto lembra o seu, e o de todos os senhores que vieram antes. Ele diz que foi o primeiro a herdar a vontade, e que está cansado de esperar.",
      "informacoes": "A vontade que você carrega é mais antiga do que a vila. Ele quer sabê-la inteira.",
      "opcoes": [
        {
          "id": "aceitar",
          "texto": "Aceitar a vontade completa.",
          "requisitos": {
            "honraMin": 30
          },
          "efeitos": {
            "honra": 4,
            "ataque": 2,
            "escudo": 2,
            "hp": 20,
            "habitantes": -8
          },
          "resultado": "Memórias que não são suas se encaixam nas suas. Você enxerga os erros e os acertos de todos os herdeiros. Oito moradores, tocados pela aura, deixam a vila por uma estrada que só eles veem.",
          "flags": {
            "pacto_feito": true,
            "pacto_primeiro": true
          },
          "desbloqueia": {
            "flags": [
              "vontade_completa"
            ]
          }
        },
        {
          "id": "recusar",
          "texto": "Recusar a vontade e seguir o próprio caminho.",
          "efeitos": {
            "honra": 6,
            "habitantes": 4,
            "hp": -10
          },
          "resultado": "O homem abaixa a cabeça e some como fumaça. Quatro famílias, que ouviram falar de um novo senhor, chegam à vila.",
          "flags": {
            "primeiro_recusado": true
          },
          "desbloqueia": {
            "flags": [
              "vontade_recusada"
            ]
          }
        },
        {
          "id": "coroa",
          "texto": "Tomar a coroa dele.",
          "requisitos": {
            "honraMax": -50
          },
          "efeitos": {
            "ataque": 4,
            "gold": 30,
            "honra": -12,
            "habitantes": -12
          },
          "resultado": "O primeiro herdeiro não luta. Entrega a coroa e se desfaz. Doze moradores acordam sem saber o próprio nome e deixam a vila na manhã seguinte.",
          "flags": {
            "pacto_feito": true,
            "pacto_primeiro": true
          },
          "desbloqueia": {
            "flags": [
              "coroa_tomada"
            ]
          }
        }
      ],
      "imagem": "assets/primeiro-herdeiro.svg",
      "imagemAlt": "Primeiro herdeiro usando uma coroa antiga",
      "pacto": true
    }
  ]);

  // Cadeia abissal: as marcas garantem a ordem sem regras especiais na engine.
  Jogo.eventos.push(...[
    {
      id: "sonhos_umidos", titulo: "O canto das marés secas", tipo: "especial", peso: 0.3, especial: true, abissal: true,
      requisitos: { rodadaMin: 8, flagsAusentes: ["abissal_1"] },
      imagem: "assets/canto-das-mares.svg", imagemAlt: "Ondas concêntricas e uma sombra indistinta sob a água",
      texto: "Pela manhã, os moradores acordam com os cabelos úmidos e sal nos lábios. Todos sonharam com o mesmo som: algo grande, a muitas léguas daqui, respirando devagar debaixo d'água. A vila está a dias de qualquer mar.",
      informacoes: "Ninguém sabe explicar o sal. Os cães recusam-se a entrar no salão.",
      opcoes: [
        { id: "ouvir", texto: "Reunir os moradores e ouvir os sonhos.", efeitos: { honra: 2, hp: -4 }, resultado: "Os relatos são parecidos demais. Você anota os pontos em comum, e à noite o som volta, mais claro. Passa a notar que respira no mesmo compasso.", flags: { abissal_1: true, abissal_curioso: true } },
        { id: "proibir", texto: "Proibir conversas sobre os sonhos.", efeitos: { honra: -2, habitantes: -1 }, resultado: "O silêncio cai sobre a vila. Um morador parte, dizendo que prefere sonhar em paz do que viver calado.", flags: { abissal_1: true, abissal_resistente: true } },
        { id: "vigilia", texto: "Pedir ao padre uma noite de vigília.", efeitos: { honra: 3, gold: -2 }, resultado: "Velas ardem até a aurora. O som não vem, mas os moradores acordam sabendo que ele esperava do outro lado do sono.", flags: { abissal_1: true, abissal_resistente: true } },
        { id: "dormir", texto: "Dormir no meio da praça, para escutar de perto.", efeitos: { ataque: 1, honra: -5, hp: -6 }, resultado: "Você acorda com água nos pulmões, sem ter nenhuma por perto. Passa o dia tossindo uma pergunta que não consegue lembrar.", flags: { abissal_1: true, abissal_devoto: true } }
      ]
    },
    {
      id: "mare_no_poco", titulo: "A maré no poço", tipo: "especial", peso: 0.4, especial: true, abissal: true,
      requisitos: { rodadaMin: 11, flags: ["abissal_1"], flagsAusentes: ["abissal_2"] },
      imagem: "assets/mare-no-poco.svg", imagemAlt: "Balde de poço com peixes pálidos e símbolos na água",
      texto: "A água dos poços subiu à borda, com gosto de sal. Nos baldes, peixes brancos, sem olhos, de dentes quase humanos, batem contra a madeira. As crianças brincam com eles, e as mães não conseguem impedir.",
      informacoes: "A água salgada não se mistura com o rio. Circula dentro das paredes.",
      opcoes: [
        { id: "tapar", texto: "Tapar todos os poços com pedra.", efeitos: { honra: 2, gold: -5, habitantes: -3 }, resultado: "Sem água, três famílias partem em busca de rios limpos. As pedras estremecem à noite, como se alguém batesse por baixo.", flags: { abissal_2: true, abissal_resistente: true } },
        { id: "examinar", texto: "Examinar os peixes com o boticário.", efeitos: { honra: 3, escudo: 1, hp: -6 }, resultado: "Dentro de cada peixe, uma pequena pedra com símbolos gravados. O boticário vomita e se recusa a continuar. Você leva uma das pedras ao bolso, sem saber por quê.", flags: { abissal_2: true, abissal_curioso: true } },
        { id: "permitir", texto: "Permitir que o povo beba.", efeitos: { habitantes: 4, honra: -4 }, resultado: "A água é doce na boca dos que aceitam. Quatro viajantes, ao sentir o gosto, pedem para ficar. Seus olhos brilham um pouco além do normal.", flags: { abissal_2: true, abissal_devoto: true } },
        { id: "observar", texto: "Deixar a água subir e observar o que vem.", requisitos: { honraMax: -30 }, efeitos: { gold: 8, honra: -5, hp: -8 }, resultado: "Uma mão sem dedos aparece na superfície, abre e fecha, e some. O mercador da estrada, interessado em peixes raros, deixa 8 gold e parte, sem fazer perguntas.", flags: { abissal_2: true, abissal_curioso: true } }
      ]
    },
    {
      id: "olhos_largos", titulo: "Os de olhos largos", tipo: "especial", peso: 0.5, especial: true, abissal: true,
      requisitos: { rodadaMin: 14, flags: ["abissal_2"], flagsAusentes: ["abissal_3"] },
      imagem: "assets/olhos-largos.svg", imagemAlt: "Silhuetas de moradores de olhos abertos junto à lagoa",
      texto: "Seus guardas relatam que um grupo de moradores se reúne à noite na margem da lagoa, de mãos dadas, em silêncio. Quando o sol nasce, voltam para casa com os olhos mais abertos do que o normal e cantarolando algo que ninguém ensinou.",
      informacoes: "Não parecem perigosos. Parecem felizes, o que é pior.",
      opcoes: [
        { id: "confrontar", texto: "Confrontá-los na margem.", efeitos: { honra: 3, ataque: 1, hp: -8, habitantes: -3 }, resultado: "Os de olhos largos não resistem, apenas sorriem. Três deles se jogam na lagoa antes que você os alcance. Os outros voltam para casa, mais silenciosos.", flags: { abissal_3: true, abissal_resistente: true } },
        { id: "juntar", texto: "Juntar-se à roda uma noite.", efeitos: { escudo: 3, habitantes: 4, honra: -6, hp: -8 }, resultado: "A roda canta, e você aprende a letra sem entender uma palavra. Ao amanhecer, quatro moradores novos aparecem à porta, pedindo por um lugar que não conhecem.", flags: { abissal_3: true, abissal_devoto: true } },
        { id: "expulsar", texto: "Pedir ao padre que os expulse.", efeitos: { honra: -4, habitantes: -5 }, resultado: "O padre tenta, falha, e foge da vila na mesma noite. Cinco famílias o acompanham, apavoradas, sem olhar para trás.", flags: { abissal_3: true, abissal_resistente: true } },
        { id: "decorar", texto: "Ouvir a canção até decorar.", efeitos: { honra: 2, hp: -4 }, resultado: "A canção é feita de intervalos impossíveis. Você sai com uma dor de cabeça e um nome que não é humano preso na língua.", flags: { abissal_3: true, abissal_curioso: true } }
      ]
    },
    {
      id: "torre_na_lagoa", titulo: "A torre na lagoa", tipo: "especial", peso: 0.5, especial: true, abissal: true,
      requisitos: { rodadaMin: 17, flags: ["abissal_3"], flagsAusentes: ["abissal_4"] },
      imagem: "assets/torre-na-lagoa.svg", imagemAlt: "Torre escura e sem janelas emergindo da lagoa",
      texto: "Em uma noite sem vento, a lagoa baixa de repente, em silêncio. No fundo, coberta de lama e algas, ergue-se uma torre de pedra escura sem janelas, mais antiga que a vila, com ângulos que o olho não acompanha. A porta está aberta.",
      informacoes: "Cada pessoa que olha por muito tempo para a torre sai do transe sem lembrar o que viu.",
      opcoes: [
        { id: "entrar", texto: "Entrar na torre.", efeitos: { ataque: 2, escudo: 2, gold: 10, hp: -15, honra: -5 }, resultado: "Nas paredes, gravuras sobre algo que dorme e outro que espera. Você carrega um punhado de moedas de metal desconhecido e uma certeza: a torre é uma porta, e não um fim.", flags: { abissal_4: true, abissal_curioso: true } },
        { id: "afastar", texto: "Ordenar que a vila se afaste da lagoa.", efeitos: { honra: 3, habitantes: -4, gold: -2 }, resultado: "Os moradores obedecem, mas quatro famílias aproveitam para partir de vez. A torre fica visível da muralha, sem que ninguém ouse apontar para ela.", flags: { abissal_4: true, abissal_resistente: true } },
        { id: "selar", texto: "Selar a porta com ferro e pedra.", requisitos: { goldMin: 5 }, efeitos: { honra: 4, gold: -5, hp: -8 }, resultado: "O ferro entorta ao tocar a porta, mas a pedra segura. Uma pulsação passa pelo chão. Por três dias, ninguém dorme direito.", flags: { abissal_4: true, abissal_resistente: true } },
        { id: "guarda", texto: "Deixar a porta aberta e montar guarda.", requisitos: { honraMax: -30 }, efeitos: { gold: 12, habitantes: 3, honra: -8 }, resultado: "Peregrinos de lugares distantes aparecem, pagando para ver a torre. Três ficam. Na manhã seguinte, a lagoa já está um dedo mais cheia.", flags: { abissal_4: true, abissal_devoto: true } }
      ]
    },
    {
      id: "aquele_que_acorda", titulo: "Aquele que acorda", tipo: "especial", peso: 0.6, especial: true, abissal: true,
      requisitos: { rodadaMin: 20, flags: ["abissal_4"], flagsAusentes: ["abissal_5"] },
      imagem: "assets/aquele-que-acorda.svg", imagemAlt: "Um único olho sugerido dentro de uma coluna de escuridão",
      texto: "A lagoa ferve sem calor. Da torre, uma coluna de escuridão sobe ao céu, e as estrelas se afastam dela. O chão treme em compasso com a respiração dos seus sonhos. Os moradores se ajoelham sem que ninguém peça. Algo imenso abre um olho.",
      informacoes: "Não é uma batalha. Não é uma negociação. É um momento em que a vila inteira espera o que o senhor fará com o que sabe.",
      opcoes: [
        { id: "selar", texto: "Selar o despertar com o próprio sangue.", requisitos: { honraMin: 30 }, efeitos: { honra: 10, habitantes: 4, hp: -35 }, resultado: "Você ergue a mão e deixa o sangue cair na pedra. O olho se fecha, devagar, como quem concede uma trégua. A coluna se apaga. Você cai de joelhos, e a vila, em silêncio, entende o preço.", flags: { abissal_5: true, abissal_selado: true }, desbloqueia: { flags: ["mare_selada"] } },
        { id: "ler", texto: "Ler as palavras do fundo em voz alta.", requisitos: { flags: ["abissal_curioso"] }, efeitos: { ataque: 5, escudo: 5, honra: -15 }, multiplicadores: { habitantes: 0.3 }, resultado: "As palavras saem pela sua boca como se fossem sempre suas. A coisa assente. Dos moradores ajoelhados, a maioria não se levanta. Você sente a força de algo antigo no seu braço.", flags: { abissal_5: true, abissal_leitor: true }, desbloqueia: { flags: ["palavras_lembradas"] } },
        { id: "servir", texto: "Oferecer-se como servo.", requisitos: { flags: ["abissal_devoto"] }, efeitos: { gold: 40, ataque: 6, hp: 20, honra: -20 }, multiplicadores: { habitantes: 0.5 }, resultado: "O olho se fixa em você. Você sente que sempre foi o senhor desta vila por alguém, e não por si. Metade dos moradores se junta à roda e deixa de olhar para o céu.", flags: { abissal_5: true, abissal_servo: true }, desbloqueia: { flags: ["senhor_do_abismo"] } },
        { id: "fugir", texto: "Fugir com quem puder ser levado.", efeitos: { honra: -5, hp: -10 }, multiplicadores: { habitantes: 0.6 }, resultado: "Você puxa o máximo de gente pelas estradas, deixando os de joelhos para trás. A coluna some ao amanhecer, mas a lagoa nunca mais seca. Pelo resto da vida, você ouvirá uma respiração ao longe.", flags: { abissal_5: true, abissal_fuga: true } },
        { id: "gritar", texto: "Gritar com a criatura até ela voltar a dormir.", requisitos: { flags: ["abissal_resistente"], honraMin: 50 }, efeitos: { honra: 8, ataque: 1, escudo: 1, hp: -25, habitantes: -8 }, resultado: "Você grita todos os nomes de quem a vila perdeu, e o olho, confuso, cede. Oito moradores, que não suportam a luz da escuridão, morrem ou partem. A criatura dorme de novo, mas lembra de você.", flags: { abissal_5: true, abissal_selado: true }, desbloqueia: { flags: ["mare_selada"] } }
      ]
    }
  ]);

  Jogo.eventos.push(
    {
      id: "bau_estrada", titulo: "O baú à beira da estrada", tipo: "achado", peso: 2,
      imagem: "assets/bau-estrada.svg", imagemAlt: "Baú de madeira meio enterrado na lama",
      texto: "Depois da chuva, um baú aparece junto à estrada. A tampa está quebrada, mas três objetos foram embrulhados em panos secos. Seus homens esperam que você escolha apenas um.",
      informacoes: "O que ficar para trás poderá ser encontrado por outra pessoa.",
      opcoes: [
        { id: "pocao", texto: "Levar a poção grande.", itens: ["pocao_cura_grande"], resultado: "O frasco é pesado, e o líquido vermelho-escuro se move devagar. Você o prende ao cinto." },
        { id: "faca", texto: "Ficar com a faca de caça.", itens: ["faca_de_caca"], resultado: "A lâmina curta ainda cheira a couro. Seu braço parece mais pronto para o que vier." },
        { id: "moedas", texto: "Pegar o pote de moedas velhas.", itens: ["pote_de_moedas_velhas"], resultado: "O pote parece pesado demais para o tamanho. Você o guarda sem abrir." }
      ]
    },
    {
      id: "bau_mimico", titulo: "Um baú entre as raízes", tipo: "achado", peso: 1,
      imagem: "assets/bau-mimico.svg", imagemAlt: "Baú estreito preso entre duas raízes",
      texto: "Um baú estreito está preso entre duas raízes. A madeira está úmida, e um frasco e um pequeno pote podem ser vistos pela fresta da tampa.",
      informacoes: "Os dois objetos parecem ao alcance da mão.",
      opcoes: [
        { id: "frasco", texto: "Retirar o frasco pela fresta.", itens: ["pocao_cura_grande"], armadilha: { chance: 1 / 6, danoHp: 10, perderItem: true }, resultado: "O vidro se solta com um estalo. Você guarda o frasco no cinto." },
        { id: "pote", texto: "Alcançar o pote de moedas no fundo.", itens: ["pote_de_moedas_velhas"], armadilha: { chance: 1 / 6, danoHp: 10, perderItem: true }, resultado: "Seus dedos encontram metal frio na escuridão. Você puxa o pote para fora." },
        { id: "deixar", texto: "Seguir sem mexer no baú.", resultado: "Você deixa os objetos onde estão e retoma a estrada." }
      ]
    }
  );

  // Honra extrema abre decisões novas em cenas já conhecidas.
  const opcoesPorHonra = {
    ferreiro: [
      { id: "selo_guardioes", texto: "Aceitar o Selo dos guardiões.", requisitos: { honraMin: 91 }, itens: ["selo_do_povo"], resultado: "O ferreiro reconhece a confiança do povo e grava seu selo no aço. A peça reforça seu corpo e seu equipamento." }
    ],
    corvo: [
      { id: "pacto_dente", texto: "Aceitar a oferta do corvo.", requisitos: { honraMax: -90 }, itens: ["dente_do_abismo"], flags: { pacto_feito: true, pacto_dente: true }, resultado: "O corvo deixa cair um dente negro na sua palma. Uma voz promete força; o preço se faz sentir antes que a ave desapareça." }
    ],
    mercador_sem_sombra: [
      { id: "pacto_dente", texto: "Aceitar a oferta sem sombra.", requisitos: { honraMax: -90 }, itens: ["dente_do_abismo"], flags: { pacto_feito: true, pacto_dente: true }, resultado: "O mercador entrega um dente negro. Uma voz promete força; o preço se faz sentir antes que a carroça desapareça." }
    ],
    lobo_pactuario: [
      { id: "pacto_dente", texto: "Aceitar a oferta da matilha.", requisitos: { honraMax: -90 }, itens: ["dente_do_abismo"], flags: { pacto_feito: true, pacto_dente: true }, resultado: "O lobo deixa um dente negro aos seus pés. Uma voz promete força; o preço se faz sentir antes que a matilha desapareça." }
    ],
    rei_sob_a_colina: [
      { id: "pacto_dente", texto: "Aceitar a oferta do rei sob a colina.", requisitos: { honraMax: -90 }, itens: ["dente_do_abismo"], flags: { pacto_feito: true, pacto_dente: true }, resultado: "O rei entrega um dente negro retirado de sua coroa. Uma voz promete força; o preço se faz sentir quando a pedra se fecha." }
    ],
    sussurro_do_ouro: [
      { id: "pacto_dente", texto: "Aceitar a oferta que vem do cofre.", requisitos: { honraMax: -90 }, itens: ["dente_do_abismo"], flags: { pacto_feito: true, pacto_dente: true }, resultado: "Entre as moedas, aparece um dente negro. Uma voz promete força; o preço se faz sentir quando o cofre se cala." }
    ],
    viajantes: [
      { id: "dar_sementes", texto: "Confiar-lhes sementes e um começo sem dívida.", requisitos: { honraMin: 90 }, efeitos: { habitantes: 5, honra: 5 }, resultado: "Você entrega sementes do celeiro e dispensa qualquer pagamento. Os viajantes plantam junto às casas; o povo vê que a confiança também pode ser herdada." },
      { id: "cobrar_entrada", texto: "Cobrar pela entrada e tomar parte da carga.", requisitos: { honraMax: -90 }, efeitos: { habitantes: -3, honra: -6, gold: 4 }, resultado: "Os guardas recolhem as ferramentas e as últimas moedas dos viajantes. Três deles partem a pé; os demais entram sem erguer os olhos." }
    ],
    caravana_da_ponte: [
      { id: "abrigo_sem_pedagio", texto: "Oferecer abrigo e dividir a carga sem cobrar passagem.", requisitos: { honraMin: 90 }, efeitos: { habitantes: 5, honra: 4, gold: -2 }, flags: { caravana_recebida: true }, resultado: "Você paga o abrigo com as próprias moedas e reparte a carga entre as famílias. A condutora leva a história pela estrada." }
    ],
    noite_dos_mortos: [
      { id: "lembrar_nomes", texto: "Ouvir cada nome e ficar até a última vela.", requisitos: { honraMin: 90 }, efeitos: { honra: 5, hp: -3 }, resultado: "A vigília atravessa a noite. Ao amanhecer, cada família sabe que seus mortos foram lembrados pelo senhor.", flags: { mortos_ouvidos: true } },
      { id: "tomar_oferendas", texto: "Recolher o pão das lápides para o cofre.", requisitos: { honraMax: -90 }, efeitos: { gold: 4, honra: -6, habitantes: -2 }, resultado: "Seus homens levam o pão antes que as velas se apaguem. Duas casas fecham as janelas e não voltam a abrir para o castelo." }
    ]
  };
  for (const [eventoId, opcoes] of Object.entries(opcoesPorHonra)) {
    const evento = Jogo.eventos.find(carta => carta.id === eventoId);
    if (evento) evento.opcoes.push(...opcoes);
  }

  const cartaOrfao = Jogo.eventos.find(evento => evento.id === "orfao");
  if (cartaOrfao) {
    for (const opcao of cartaOrfao.opcoes.filter(item => item.flags?.orfao_acolhido)) {
      opcao.marcoRodada = { id: "menino_adotado", honraMin: 50, flag: "menino_adotado_com_honra" };
    }
  }

  const cartaBruxa = Jogo.eventos.find(evento => evento.id === "bruxa");
  if (cartaBruxa) cartaBruxa.peso = 5;

  Jogo.eventos.push(
    {
      id: "bruxa_fio_da_vida", titulo: "A bruxa e o fio da vida", tipo: "encontro", peso: 3,
      requisitos: { flagsAusentes: ["bruxa_fio_da_vida_resolvida"] },
      imagem: "assets/ervas.svg", imagemAlt: "Ervas medicinais arrumadas junto a um pilão",
      texto: "A bruxa retorna com um feixe de raízes frescas. Diz que pode fechar suas feridas ou ensinar a vila a reconhecer as plantas.",
      informacoes: "Ela não pede ouro pelo conhecimento, só que ninguém chame tudo de mato.",
      opcoes: [
        { id: "tratar", texto: "Pedir que cuide das suas feridas · 2 gold", requisitos: { goldMin: 2 }, efeitos: { hp: 20, gold: -2, honra: 1 }, flags: { bruxa_fio_da_vida_resolvida: true }, resultado: "A bruxa prepara um emplastro ardido. A febre cede, e ela deixa uma parte das raízes para a vila." },
        { id: "ensinar", texto: "Ensinar as famílias a colher as raízes.", efeitos: { habitantes: 3, honra: 3 }, flags: { bruxa_fio_da_vida_resolvida: true }, resultado: "Três famílias aprendem a distinguir remédio de erva daninha. A bruxa corrige a pronúncia de todos, inclusive a sua." },
        { id: "guardar", texto: "Guardar as raízes para outra ocasião.", efeitos: { hp: 6 }, flags: { bruxa_fio_da_vida_resolvida: true }, resultado: "Você guarda algumas folhas no bolso. A bruxa avisa que elas duram menos que uma promessa." }
      ]
    },
    {
      id: "bruxa_frutos_negros", titulo: "Frutos negros na soleira", tipo: "encontro", peso: 3,
      requisitos: { flagsAusentes: ["bruxa_frutos_resolvido"] },
      imagem: "assets/vila.svg", imagemAlt: "Um pequeno cesto deixado diante de uma porta",
      texto: "Um cesto de frutos escuros aparece diante do salão. A bruxa espera no caminho e garante que são seguros, desde que ninguém os cozinhe em ferro.",
      informacoes: "O cheiro é doce. O aviso sobre a panela parece específico demais.",
      opcoes: [
        { id: "provar", texto: "Provar um dos frutos.", efeitos: { hp: 14, honra: 1 }, flags: { bruxa_frutos_resolvido: true }, resultado: "A língua fica roxa até o jantar, mas suas forças voltam. A bruxa ri como quem já sabia." },
        { id: "repartir", texto: "Repartir o cesto entre as casas.", efeitos: { habitantes: 4, honra: 3 }, flags: { bruxa_frutos_resolvido: true }, resultado: "O povo come os frutos crus. Quatro viajantes que estavam de passagem decidem esperar a próxima colheita." },
        { id: "frasco", texto: "Pedir que a bruxa prepare um tônico.", itens: ["pocao_cura_grande"], flags: { bruxa_frutos_resolvido: true }, resultado: "Ela mói os frutos num frasco e manda que você não pergunte pela cor. O tônico fica guardado para quando precisar." }
      ]
    },
    {
      id: "bruxa_vela", titulo: "A vela que não apaga", tipo: "encontro", peso: 3,
      requisitos: { flagsAusentes: ["bruxa_vela_resolvida"] },
      imagem: "assets/ervas.svg", imagemAlt: "Uma vela curta entre folhas secas e pequenos frascos",
      texto: "A bruxa acende uma vela no pátio. O vento a dobra, mas não a apaga. Ela oferece a chama para proteger sua próxima batalha.",
      informacoes: "A vela cheira a cera, fumaça e alguma coisa que você prefere não nomear.",
      opcoes: [
        { id: "aceitar", texto: "Aceitar a proteção da vela.", itens: ["amuleto_ultima_guarda"], efeitos: { honra: 1 }, flags: { bruxa_vela_resolvida: true }, resultado: "A bruxa apaga a vela entre os dedos e recolhe a fumaça num pequeno amuleto." },
        { id: "estudar", texto: "Pedir que ensine o preparo aos guardas.", efeitos: { escudo: 1, honra: 2 }, flags: { bruxa_vela_resolvida: true }, resultado: "Os guardas passam a cobrir melhor as frestas das armaduras. A bruxa chama isso de feitiço; o armeiro chama de ajuste." },
        { id: "recusar", texto: "Agradecer e deixar a vela no pátio.", efeitos: { honra: 1 }, flags: { bruxa_vela_resolvida: true }, resultado: "A chama continua acesa até o amanhecer. A bruxa leva o resto da cera para a floresta." }
      ]
    },
    {
      id: "bruxa_fonte", titulo: "Água para a bruxa", tipo: "encontro", peso: 3,
      requisitos: { flagsAusentes: ["bruxa_fonte_resolvida"] },
      imagem: "assets/poco.svg", imagemAlt: "Um poço de pedra com um balde de madeira",
      texto: "A bruxa encontra o poço quase seco e pede ajuda para descer um balde. Diz que precisa de água limpa para uma cura, não para um feitiço.",
      informacoes: "O poço é fundo, e a corda foi remendada muitas vezes.",
      opcoes: [
        { id: "descer", texto: "Descer com a bruxa até a água.", efeitos: { hp: -4, honra: 3, habitantes: 2 }, flags: { bruxa_fonte_resolvida: true }, resultado: "Você volta com as mãos feridas e água suficiente. A bruxa trata dois doentes; as famílias ficam para agradecer." },
        { id: "corda", texto: "Dar uma corda nova à bruxa · 2 gold", requisitos: { goldMin: 2 }, efeitos: { gold: -2, hp: 15 }, flags: { bruxa_fonte_resolvida: true }, resultado: "Com a corda nova, ela alcança a água sem descer. O primeiro gole tem gosto de ferrugem; a cura, ao menos, funciona." },
        { id: "mandar", texto: "Mandá-la buscar água na floresta.", efeitos: { honra: -1 }, flags: { bruxa_fonte_resolvida: true }, resultado: "Ela vai sem discutir. Na manhã seguinte, o poço amanhece cheio e ninguém sabe explicar por quê." }
      ]
    },
    {
      id: "mao_do_rei", titulo: "A mão do Rei", tipo: "encontro", peso: 0.1,
      forcarSorteioQuandoElegivel: true,
      requisitos: { flags: ["menino_adotado_com_honra"], flagsAusentes: ["mao_do_rei_resolvida"], rodadasDesde: { menino_adotado: 40 } },
      imagem: "assets/vila.svg", imagemAlt: "O jovem herdeiro e o menino diante do salão do conselho",
      texto: "Quarenta rodadas se passaram desde que o menino ganhou um lugar à sua mesa. Os moradores já procuram por ele antes de levar certos problemas ao salão.",
      informacoes: "O nome do cargo é antigo. O trabalho, não.",
      opcoes: [
        { id: "nomear", texto: "Nomeá-lo conselheiro da vila.", efeitos: { honra: 5 }, flags: { menino_conselheiro: true, mao_do_rei_resolvida: true }, resultado: "Diante do povo, você entrega ao menino o selo do conselho. A partir de hoje, ele terá voz ao seu lado — e não esquecerá quem lhe deu lugar." }
      ]
    },
    {
      id: "conselheiro_menino_armazem", titulo: "Conselho: Contas do armazém", tipo: "especial", peso: 0.3, especial: true, conselheiro: true,
      requisitos: { flags: ["menino_conselheiro"] },
      imagem: "assets/vila.svg", imagemAlt: "Sacos de grãos organizados junto à porta do celeiro",
      texto: "O jovem conselheiro percebe que os sacos do armazém foram contados duas vezes e propõe repartir o excedente antes que estrague.",
      informacoes: "Ele já sabe quais famílias precisam mais. Você confirma a lista.",
      opcoes: [{ id: "repartir", texto: "Seguir o conselho.", efeitos: { habitantes: 5, honra: 3, gold: -2 }, resultado: "Os grãos chegam às casas antes da chuva. Cinco pessoas que pensavam partir decidem ficar." }]
    },
    {
      id: "conselheiro_menino_ponte", titulo: "Conselho: A ponte e a estrada", tipo: "especial", peso: 0.3, especial: true, conselheiro: true,
      requisitos: { flags: ["menino_conselheiro"] },
      imagem: "assets/ponte.svg", imagemAlt: "A ponte de madeira sobre o rio da vila",
      texto: "O menino ouve os carroceiros antes de falar. Sugere consertar as tábuas soltas antes que uma roda quebre no meio da travessia.",
      informacoes: "A obra é pequena; o desvio que ela evita, não.",
      opcoes: [{ id: "reparar", texto: "Pagar o reparo · 2 gold", requisitos: { goldMin: 2 }, efeitos: { gold: -2, habitantes: 3, honra: 2 }, resultado: "A ponte volta a receber carroças. Três viajantes escolhem ficar depois de uma travessia tranquila." }, { id: "esperar", texto: "Aguardar a próxima estação.", efeitos: { honra: 1 }, resultado: "O menino aceita a decisão e anota quais tábuas cederam primeiro. A lista será útil quando houver moedas." }]
    },
    {
      id: "conselheiro_menino_guardas", titulo: "Conselho: Treinar sem ferir", tipo: "especial", peso: 0.3, especial: true, conselheiro: true,
      requisitos: { flags: ["menino_conselheiro"] },
      imagem: "assets/forja.svg", imagemAlt: "Uma espada e um escudo de treino junto à forja",
      texto: "O jovem conselheiro observa os guardas treinarem e aponta que os mais novos nunca praticam com escudos do mesmo tamanho.",
      informacoes: "O armeiro já separou madeira para fazer os ajustes.",
      opcoes: [{ id: "ajustar", texto: "Preparar equipamento para os guardas.", efeitos: { ataque: 1, escudo: 1, honra: 2 }, resultado: "O treino fica mais seguro e mais justo. O armeiro diz que o menino enxerga detalhes que adultos preferem ignorar." }]
    }
  );

  const conselhosPositivos = [
    { id: "conselho_positivo_01", titulo: "Conselho: Fechar as contas", texto: "O conselheiro nota uma taxa esquecida nas contas da ponte e sugere cobrá-la uma única vez, sem pesar sobre as famílias.", efeitos: { gold: 4 }, resultado: "A cobrança cobre os reparos do portão e ainda deixa algumas moedas no cofre." },
    { id: "conselho_positivo_02", titulo: "Conselho: Ouvir o moinho", texto: "O conselheiro recomenda perguntar ao moleiro antes de comprar farinha. O moinho pode suprir parte do estoque.", efeitos: { habitantes: 2, gold: 2 }, resultado: "O moleiro oferece trabalho e farinha. Duas pessoas que ajudavam na colheita ficam na vila." },
    { id: "conselho_positivo_03", titulo: "Conselho: Repouso antes da marcha", texto: "O conselheiro percebe que você mal consegue segurar a espada e pede uma noite de repouso antes da patrulha.", efeitos: { hp: 12 }, resultado: "Você dorme uma noite inteira. O conselheiro assume a vigília e não reclama do frio." },
    { id: "conselho_positivo_04", titulo: "Conselho: A lâmina no lugar", texto: "O conselheiro sugere que o ferreiro lime a rebarba da sua espada antes do próximo combate.", efeitos: { ataque: 1 }, resultado: "O ferreiro melhora o fio sem pedir pagamento. O conselheiro anotou a dívida para quando houver trabalho." },
    { id: "conselho_positivo_05", titulo: "Conselho: Cobrir a torre", texto: "O conselheiro vê água entrando na torre e recomenda reforçar o escudo usado pelo vigia.", efeitos: { escudo: 1 }, resultado: "Uma chapa reaproveitada cobre a madeira. O vigia diz que dormirá melhor; você espera que seja verdade." },
    { id: "conselho_positivo_06", titulo: "Conselho: Pão antes da estrada", texto: "O conselheiro pede para separar pão aos viajantes que chegam depois do anoitecer.", efeitos: { habitantes: 3, honra: 2, gold: -1 }, resultado: "Três viajantes aceitam ficar depois de comer e dormir sob um teto." },
    { id: "conselho_positivo_07", titulo: "Conselho: Trocar sementes", texto: "O conselheiro propõe trocar sementes excedentes por ferramentas, antes que a umidade estrague ambas.", efeitos: { gold: 3, habitantes: 1 }, resultado: "A troca rende algumas moedas e um lavrador decide trabalhar as terras vazias." },
    { id: "conselho_positivo_08", titulo: "Conselho: Uma ronda curta", texto: "O conselheiro sugere uma ronda menor, mas regular, para que os guardas não abandonem os campos.", efeitos: { ataque: 1, honra: 1 }, resultado: "Os guardas aprendem os caminhos e param de se perder entre a torre e o celeiro." },
    { id: "conselho_positivo_09", titulo: "Conselho: Limpar o poço", texto: "O conselheiro nota que basta retirar o lodo da borda para a água voltar a correr melhor.", efeitos: { habitantes: 2, honra: 2 }, resultado: "Duas famílias desistem de partir quando a água fica mais limpa." },
    { id: "conselho_positivo_10", titulo: "Conselho: Esperar pelo preço", texto: "O conselheiro aconselha esperar até a feira acabar antes de vender o couro.", efeitos: { gold: 5 }, resultado: "Um comprador tardio paga mais pelo couro. O conselheiro diz que paciência também cabe no cofre." },
    { id: "conselho_positivo_11", titulo: "Conselho: A porta lateral", texto: "O conselheiro encontra uma porta lateral que pode ser reforçada com madeira reaproveitada.", efeitos: { escudo: 1, habitantes: 1 }, resultado: "A porta resiste ao primeiro teste e uma família que ajudou na obra fica na vila." },
    { id: "conselho_positivo_12", titulo: "Conselho: Dividir a lenha", texto: "O conselheiro percebe que as casas mais distantes recebem menos lenha e sugere mudar a rota dos carroceiros.", efeitos: { honra: 3, hp: 5 }, resultado: "A divisão fica mais justa. O trabalho ao lado do povo também aquece você." },
    { id: "conselho_positivo_13", titulo: "Conselho: Reabrir a oficina", texto: "O conselheiro convence um artesão aposentado a abrir a oficina por mais uma estação.", efeitos: { ataque: 1, gold: 2 }, resultado: "O artesão afia ferramentas e vende algumas peças. O cofre recebe o que sobrou da primeira semana." },
    { id: "conselho_positivo_14", titulo: "Conselho: Uma mesa comprida", texto: "O conselheiro sugere reunir as famílias novas com as antigas para dividir tarefas da colheita.", efeitos: { habitantes: 4, honra: 2 }, resultado: "Quatro trabalhadores ficam, e a colheita termina antes das primeiras chuvas." },
    { id: "conselho_positivo_15", titulo: "Conselho: Remendar antes da geada", texto: "O conselheiro pede para remendar as janelas do salão antes que o frio chegue.", efeitos: { hp: 8, escudo: 1 }, resultado: "O salão fica menos gelado e as tábuas sob o escudo param de ceder." }
  ];
  const conselhosNegativos = [
    { id: "conselho_negativo_01", titulo: "Conselho: Vender a farinha cedo", texto: "O conselheiro insiste em vender toda a farinha antes da colheita, embora os celeiros ainda estejam baixos.", efeitos: { gold: 4, habitantes: -4 }, resultado: "As moedas chegam, mas quatro famílias partem quando descobrem que não haverá pão suficiente." },
    { id: "conselho_negativo_02", titulo: "Conselho: Aumentar a ronda", texto: "O conselheiro quer dobrar a ronda noturna e retirar braços dos campos para isso.", efeitos: { habitantes: -3, gold: -2 }, resultado: "Os guardas dormem durante o dia. Três lavradores deixam a vila e o cofre paga as tochas." },
    { id: "conselho_negativo_03", titulo: "Conselho: Treino até a exaustão", texto: "O conselheiro manda repetir o treino mesmo quando seu braço já treme.", efeitos: { hp: -10 }, resultado: "Você termina a sessão com o ombro dolorido e a espada ainda no mesmo lugar." },
    { id: "conselho_negativo_04", titulo: "Conselho: Reforçar o lado errado", texto: "O conselheiro recomenda reforçar a parte mais bonita do escudo, não a que recebe os golpes.", efeitos: { escudo: -1, gold: -2 }, resultado: "A chapa reluz um pouco mais. O ferreiro aponta a rachadura que ficou sem cobertura." },
    { id: "conselho_negativo_05", titulo: "Conselho: Cobrar duas vezes", texto: "O conselheiro sugere cobrar novamente dos viajantes que já pagaram pela ponte.", efeitos: { gold: 5, honra: -4, habitantes: -2 }, resultado: "O cofre ganha moedas. Dois carroceiros anunciam que não voltarão, e os moradores ouvem a discussão." },
    { id: "conselho_negativo_06", titulo: "Conselho: Fechar a enfermaria", texto: "O conselheiro diz que os doentes custam mais do que produzem e recomenda fechar a enfermaria.", efeitos: { hp: -8, honra: -3 }, resultado: "A enfermaria esvazia. A febre não lê os registros e continua passando de casa em casa." },
    { id: "conselho_negativo_07", titulo: "Conselho: Acusar sem prova", texto: "O conselheiro escolhe um suspeito para o roubo sem esperar pelos guardas.", efeitos: { habitantes: -3, honra: -4 }, resultado: "O acusado foge antes do julgamento. Três parentes seguem pela estrada." },
    { id: "conselho_negativo_08", titulo: "Conselho: Comprar aço molhado", texto: "O conselheiro encontrou aço barato e recomenda comprá-lo antes que alguém pergunte de onde veio.", efeitos: { gold: -4, ataque: -1 }, resultado: "O aço se parte na primeira dobra. O ferreiro cobra para retirar os pedaços da forja." },
    { id: "conselho_negativo_09", titulo: "Conselho: Taxar o poço", texto: "O conselheiro propõe cobrar por balde de água para aumentar a renda do salão.", efeitos: { gold: 4, habitantes: -3, honra: -3 }, resultado: "A renda dura pouco. Três moradores passam a buscar água em outra aldeia." },
    { id: "conselho_negativo_10", titulo: "Conselho: Cortar o descanso", texto: "O conselheiro quer que os guardas patrulhem sem revezamento até o próximo pagamento.", efeitos: { ataque: -1, hp: -5 }, resultado: "A patrulha continua, mas ninguém percebe o portão destrancado até o amanhecer." },
    { id: "conselho_negativo_11", titulo: "Conselho: Arma sem teste", texto: "O conselheiro traz uma arma de um vendedor e recomenda entregá-la aos guardas sem testar o fio.", efeitos: { gold: -3, ataque: -1 }, resultado: "A lâmina entorta no primeiro golpe. O vendedor já está longe da estrada." },
    { id: "conselho_negativo_12", titulo: "Conselho: Mandar os viajantes embora", texto: "O conselheiro sugere fechar o portão para todos os viajantes, inclusive os que buscam abrigo.", efeitos: { habitantes: -4, honra: -2 }, resultado: "Quatro pessoas seguem para outra vila. O conselheiro anota que o portão ficou mais quieto." },
    { id: "conselho_negativo_13", titulo: "Conselho: Vender as ferramentas", texto: "O conselheiro propõe vender ferramentas de reserva para pagar uma dívida pequena.", efeitos: { gold: 3, habitantes: -2 }, resultado: "A dívida é paga. Dois lavradores não conseguem trabalhar e partem antes da próxima feira." },
    { id: "conselho_negativo_14", titulo: "Conselho: Uma punição pública", texto: "O conselheiro recomenda castigar o primeiro morador que reclamar dos impostos.", efeitos: { honra: -5, habitantes: -2 }, resultado: "A praça se cala. Duas famílias deixam a vila sem esperar outra ordem." },
    { id: "conselho_negativo_15", titulo: "Conselho: Ignorar a rachadura", texto: "O conselheiro diz que a rachadura na muralha pode esperar até depois da próxima chuva.", efeitos: { escudo: -1, habitantes: -2 }, resultado: "A parede cede durante a noite. Duas famílias levam o que conseguem carregar." }
  ];
  const criarCartaConselheiro = (carta, positiva) => ({
    id: carta.id, titulo: carta.titulo, tipo: "encontro", peso: 0.4, conselheiro: true,
    ...(positiva ? {} : { requisitos: { flagsAusentes: ["menino_conselheiro"] } }),
    imagem: "assets/vila.svg", imagemAlt: "Moradores reunidos no salão do conselho",
    texto: carta.texto,
    informacoes: positiva ? "O conselho parece sensato. A decisão continua sendo sua." : "O conselho parece apressado. Você pode segui-lo ou recusar.",
    opcoes: [
      { id: "seguir", texto: "Seguir o conselho.", efeitos: carta.efeitos, resultado: carta.resultado },
      { id: "recusar", texto: "Agradecer e decidir por conta própria.", efeitos: positiva ? {} : { honra: 1 }, resultado: positiva ? "Você guarda a ideia para outra ocasião e decide por conta própria." : "Você recusa a proposta. O conselheiro fica contrariado, mas a vila evita o prejuízo." }
    ]
  });
  Jogo.eventos.push(...conselhosPositivos.map(carta => criarCartaConselheiro(carta, true)));
  Jogo.eventos.push(...conselhosNegativos.map(carta => criarCartaConselheiro(carta, false)));
  Jogo.eventos.push(
    {
      id: "equipamento_sem_dono", titulo: "Uma peça à espera", tipo: "achado", peso: 0.8,
      imagem: "assets/forja.svg", imagemAlt: "Uma arma e um escudo deixados junto à forja",
      texto: "Entre ferramentas esquecidas, há uma peça que ainda pode servir. O ferreiro limpa a ferrugem e espera sua decisão.",
      informacoes: "Equipamentos recebidos melhoram seus atributos imediatamente e permanecem nesta run.",
      opcoes: [
        { id: "ficar", texto: "Escolher um equipamento comum, raro ou épico.", recompensaItemGenerico: true, resultado: "Você escolhe um dos objetos que ainda pode ser aproveitado." },
        { id: "deixar", texto: "Deixar a peça para a próxima pessoa.", resultado: "O ferreiro guarda o achado numa prateleira seca." }
      ]
    },
    {
      id: "reliquia_sem_dono", titulo: "Uma relíquia sem brasão", tipo: "achado", peso: 0.25,
      imagem: "assets/bau-estrada.svg", imagemAlt: "Um embrulho antigo retirado de um baú",
      texto: "Um embrulho lacrado é encontrado sob as tábuas do salão. O selo não pertence a nenhuma família conhecida.",
      informacoes: "O conteúdo pode ser uma dádiva, um pacto ou apenas mais um peso para carregar.",
      opcoes: [
        { id: "abrir", texto: "Abrir o embrulho.", recompensaItemEspecial: true, resultado: "Você rompe o selo e aceita o que foi guardado ali." },
        { id: "guardar", texto: "Devolver o embrulho ao esconderijo.", resultado: "O selo permanece intacto sob as tábuas." }
      ]
    },
    {
      id: "correu_mais_rapido_que_a_luz", titulo: "Correu mais rápido que a luz", tipo: "achado", peso: 0,
      requisitos: { flags: ["cinto_vento_ativo"] },
      imagem: "assets/vila.svg", imagemAlt: "Um caminho vazio junto às muralhas",
      texto: "Você correu por toda a estrada antes de encontrar qualquer batalha. Quando para, o cinto já não está mais em sua cintura.",
      informacoes: "A força durou menos que a corrida.",
      opcoes: [{ id: "seguir", texto: "Continuar sem o cinto.", flags: { cinto_vento_ativo: false }, resultado: "O vento leva o último sinal do cinto pela estrada." }]
    }
  );
})();
