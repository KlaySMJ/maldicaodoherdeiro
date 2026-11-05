(function () {
  "use strict";
  const Jogo = window.Jogo = window.Jogo || {};

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
    conselheiroPadrao: true, conselhoNegativo: !positiva,
    ...(positiva ? {} : { requisitos: { flagsAusentes: ["menino_conselheiro"] } }),
    imagem: "assets/eventos-pessoas/conselheiro.webp", imagemAlt: "Um conselheiro pálido de sorriso suspeito, vestido com um manto escuro",
    texto: carta.texto,
    informacoes: positiva ? "O conselho parece sensato. A decisão continua sendo sua." : "O conselho parece apressado. Você pode segui-lo ou recusar.",
    opcoes: [
      { id: "seguir", texto: "Seguir o conselho.", efeitos: carta.efeitos, resultado: carta.resultado },
      { id: "recusar", texto: "Agradecer e decidir por conta própria.", efeitos: positiva ? {} : { honra: 1 }, resultado: positiva ? "Você guarda a ideia para outra ocasião e decide por conta própria." : "Você recusa a proposta. O conselheiro fica contrariado, mas a vila evita o prejuízo." }
    ]
  });
  Jogo.eventos.push(...conselhosPositivos.map(carta => criarCartaConselheiro(carta, true)));
  Jogo.eventos.push(...conselhosNegativos.map(carta => criarCartaConselheiro(carta, false)));
})();
