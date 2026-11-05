(function () {
  "use strict";
  const Jogo = window.Jogo;

  Jogo.eventos.push(
    {
      id: "uivos_no_bosque", titulo: "Os uivos no bosque", tipo: "sobrenatural", peso: 0.8,
      requisitos: { rodadaMin: 8, flagsAusentes: ["condicao_decidida"] },
      marcaCondicaoDecidida: true,
      texto: "Por três noites seguidas, uivos que não parecem de lobo vêm do bosque. Na manhã do quarto dia, as pegadas na lama são de algo que anda sobre duas e quatro patas.",
      informacoes: "Ninguém viu a criatura. Os cães pararam de comer.",
      imagem: "assets/vila.webp", imagemAlt: "O bosque escuro além das casas da vila",
      opcoes: [
        { id: "cacar", texto: "Caçar a fera com os guardas.", testeSorte: { chance: 55,
          sucesso: { efeitos: { honra: 4, gold: 6 }, resultado: "A fera cai com uma lança no flanco. A pele rende 6 Gold, e os guardas voltam com histórias demais para uma só noite." },
          falha: { efeitos: { hp: -14 }, condicaoAtivar: "licantropia", resultado: "Os dentes atravessam sua manga. A ferida sara depressa demais. Na manhã seguinte, suas mãos têm mais pelos do que ontem." } } },
        { id: "oferenda", texto: "Deixar carne na orla do bosque · 2 Gold.", requisitos: { goldMin: 2 }, testeSorte: { chance: 75,
          sucesso: { efeitos: { honra: 1, gold: -2 }, resultado: "A carne some, e os uivos cessam. Algo na floresta parece ter entendido." },
          falha: { efeitos: { gold: -2, hp: -6 }, condicaoAtivar: "licantropia", resultado: "A fera aceita a carne e, de passagem, a sua mão. A dor é breve. A mudança, não." } } },
        { id: "trancar", texto: "Trancar-se no salão e esperar.", efeitos: { habitantes: -2, honra: -2 },
          resultado: "Os uivos param ao amanhecer, e duas casas estão vazias. Os moradores olham para o salão trancado sem dizer nada." }
      ]
    },
    {
      id: "hospede_palido", titulo: "O hóspede pálido", tipo: "sobrenatural", peso: 0.8,
      requisitos: { rodadaMin: 9, flagsAusentes: ["condicao_decidida"] },
      marcaCondicaoDecidida: true,
      texto: "Um viajante de rosto muito claro bate ao portão depois do anoitecer. Pede pouso por uma noite, recusa a comida e prefere ficar longe dos espelhos do salão. Seus dentes parecem limpos demais.",
      informacoes: "Ele é educado e sabe o nome de todos os seus criados.",
      imagem: "assets/vila.webp", imagemAlt: "Um viajante pálido aguarda diante do portão",
      opcoes: [
        { id: "conversar", texto: "Dar-lhe pouso e conversar a noite toda.", testeSorte: { chance: 60,
          sucesso: { efeitos: { gold: 6, honra: 2 }, resultado: "Ele deixa um saco de moedas antigas e uma frase sobre a hospitalidade. Ao amanhecer, a cama está intacta." },
          falha: { efeitos: { hp: -10 }, condicaoAtivar: "vampirismo", resultado: "Duas marcas pequenas no pescoço, e um gosto de ferro na língua. A luz da manhã dói um pouco mais do que ontem." } } },
        { id: "cruz", texto: "Pedir que ele faça o sinal da cruz.", efeitos: { honra: -2, habitantes: -1 },
          resultado: "O hóspede sorri e parte sem responder. Na manhã seguinte, um criado está ausente, e uma janela, aberta." },
        { id: "agua_benta", texto: "Aspergir água benta na porta.", requisitos: { itens: ["agua_benta"] },
          consumirItens: ["agua_benta"], efeitos: { honra: 3 },
          resultado: "O hóspede recua um passo, depois outro. Agradece a noite que não teve e desaparece na névoa." }
      ]
    },
    {
      id: "anel_do_defunto", titulo: "O anel do defunto", tipo: "sobrenatural", peso: 0.8,
      requisitos: { rodadaMin: 9, flagsAusentes: ["condicao_decidida"] },
      marcaCondicaoDecidida: true,
      texto: "Durante a exumação de um velho cemitério, os coveiros encontram um anel de ferro no dedo de um esqueleto. O ferro ainda está quente. Alguns juram que ouvem uma voz, dizendo seu nome.",
      informacoes: "O anel parece valer mais do que o corpo, mas a voz também parece valer.",
      imagem: "assets/vila.webp", imagemAlt: "Um anel de ferro repousa sobre a terra de uma sepultura",
      opcoes: [
        { id: "colocar", texto: "Colocar o anel no dedo.", testeSorte: { chance: 55,
          sucesso: { efeitos: { gold: 8, ataque: 1 }, resultado: "A voz cala. O anel esfria e se ajusta ao dedo como uma velha amizade. Por alguns dias, tudo parece mais fácil." },
          falha: { efeitos: { hp: -8 }, condicaoAtivar: "possessao", resultado: "A voz não cala. Sussurra dentro de você, calma como alguém que já sabia que viria." } } },
        { id: "enterrar", texto: "Enterrar o anel de novo.", efeitos: { honra: 1, gold: -2 },
          resultado: "Os coveiros o devolvem à cova. O esqueleto parece, por um instante, de mão fechada." },
        { id: "vender", texto: "Vender o anel a um mercador de passagem.", efeitos: { gold: 6, honra: -2 },
          resultado: "O mercador paga sem perguntar. Duas aldeias depois, alguém acorda falando outra língua." }
      ]
    },
    {
      id: "lua_cheia", titulo: "A noite da lua cheia", tipo: "sobrenatural", peso: 0,
      disparadoPelaEngine: true,
      texto: "A lua sobe grande e branca. Suas unhas pesam, os dentes doem, e a voz dentro de você já não pede licença. O salão parece pequeno demais.",
      informacoes: "A noite dura até o amanhecer. O que você fizer, a vila lembrará.",
      imagem: "assets/vila.webp", imagemAlt: "A lua cheia ilumina o bosque ao redor da vila",
      opcoes: [
        { id: "acorrentar", texto: "Acorrentar-se no porão.", efeitos: { honra: 1, hp: -6 },
          resultado: "As correntes aguentam, e o porão, não. Pela manhã, você acorda sangrando, com as paredes marcadas e a vila intacta." },
        { id: "correr", texto: "Deixar a fera correr pelos campos.", efeitos: { habitantes: -3, honra: -3 }, efeitoTemporario: { atributo: "ataque", valor: 4, rodadas: 1 },
          resultado: "A corrida é longa e cheia de gritos. Pela manhã, três casas estão vazias, e a força que ficou em seus braços pesa como um segredo." },
        { id: "fugir", texto: "Fugir para a floresta.", efeitos: { habitantes: -2, honra: -1 },
          resultado: "Você corre até as árvores. A noite passa longe da vila, mas dois moradores, que o viram sair, partem na manhã seguinte." },
        { id: "abracar", texto: "Abraçar a fera.", requisitos: { rodadaMin: 24 }, efeitos: { honra: -6, habitantes: -4 }, abracarCondicao: true,
          resultado: "Você para de lutar. A transformação vem fácil, e a alma, junto. Quatro moradores não vivem para ver o amanhecer." }
      ]
    },
    {
      id: "a_sede", titulo: "A sede", tipo: "sobrenatural", peso: 0,
      disparadoPelaEngine: true,
      texto: "A fome chega como um zumbido nos ouvidos. Os criados dormem, o cavalo respira no estábulo, e o cheiro de sangue, mesmo de longe, tem gosto de lembrança.",
      informacoes: "A sede não passa sozinha. No inventário, a Sede de sangue troca um aldeão por Vida.",
      imagem: "assets/vila.webp", imagemAlt: "A noite cobre as casas enquanto uma janela permanece acesa",
      opcoes: [
        { id: "morador", texto: "Beber de um morador adormecido.", requisitos: { itensProntos: ["sede_de_sangue"] }, efeitos: { hp: 15, habitantes: -1, honra: -4 }, iniciarRecargaItens: ["sede_de_sangue"],
          resultado: "Ele não acorda. A vila só nota na manhã seguinte, e o silêncio do enterro é o pior dos ruídos." },
        { id: "cacar", texto: "Caçar na floresta.", efeitos: { hp: 6, honra: -1 },
          resultado: "Um cervo, depois outro. O sangue animal sacia pouco e deixa um gosto de falta." },
        { id: "resistir", texto: "Resistir à sede.", efeitos: { honra: 2, hp: -10 },
          resultado: "Você passa a noite agarrado à coluna do salão, ouvindo as batidas dos corações da vila. Ao amanhecer, ninguém sabe o que foi evitado." },
        { id: "abracar", texto: "Entregar-se à noite.", requisitos: { rodadaMin: 24 }, efeitos: { honra: -8, habitantes: -6 }, abracarCondicao: true,
          resultado: "A sede some, e a luz da manhã passa a pertencer a outros. Seis moradores sumiram de suas camas." }
      ]
    },
    {
      id: "a_voz", titulo: "A voz", tipo: "sobrenatural", peso: 0,
      disparadoPelaEngine: true,
      texto: "A voz fala baixo, bem perto do ouvido. Diz que sabe quem na vila mente, quem rouba, quem merece. Pede só que você faça o que ela mandar, uma vez.",
      informacoes: "A voz não parece mentir. Esse é o problema.",
      imagem: "assets/vila.webp", imagemAlt: "Uma sombra parece sussurrar junto ao ouvido do herdeiro",
      opcoes: [
        { id: "obedecer", texto: "Obedecer à voz.", efeitos: { gold: 10, ataque: 1, honra: -4 },
          resultado: "Você faz o que ela manda. O resultado é prático e sujo. Pela manhã, ninguém olha você de frente." },
        { id: "rezar", texto: "Calar a voz com orações.", efeitos: { honra: 2, hp: -8 },
          resultado: "As palavras ardem como brasas. A voz recua, e você passa a noite com o rosto no chão." },
        { id: "barganhar", texto: "Barganhar com a voz.", testeSorte: { chance: 50,
          sucesso: { efeitos: { gold: 14 }, resultado: "A voz aceita o acordo. Você sente uma risada que não é sua. As moedas aparecem em lugares onde ninguém as colocou." },
          falha: { efeitos: { hp: -12, honra: -3 }, resultado: "A voz percebe a fraude e cobra o preço com juros. Você acorda com um gosto de ferro e uma dor surda no peito." } } },
        { id: "abracar", texto: "Ceder o corpo à voz.", requisitos: { rodadaMin: 24 }, efeitos: { honra: -8, habitantes: -5 }, abracarCondicao: true,
          resultado: "A voz assume o comando sem pressa. Nos dias seguintes, você se observa de fora, com orgulho e medo. Cinco moradores desaparecem." }
      ]
    },
    {
      id: "cura_licantropia", titulo: "O preço da cura", tipo: "sobrenatural", peso: 3,
      requisitos: { condicaoAtiva: "licantropia", rodadasDesde: { condicao: 16 }, flagsAusentes: ["condicao_abracada", "condicao_curada"] },
      texto: "Uma velha de colar de dentes pede para vê-lo na lua nova. Diz que sabe o que você é e que há maneiras de mudar isso. Nenhuma é de graça.",
      informacoes: "Ela fala sem pressa, como quem já curou outros.",
      imagem: "assets/vila.webp", imagemAlt: "Uma velha aguarda junto a um círculo de pedras",
      opcoes: [
        { id: "prata", texto: "Cravar a lâmina de prata benta no chão do círculo.", requisitos: { itens: ["lamina_de_prata_benta"] }, consumirItens: ["lamina_de_prata_benta"], efeitos: { honra: 4, hp: -10 }, curarCondicao: true,
          resultado: "A lâmina se parte ao tocar a pedra, e a lua parece escurecer de vergonha. Seus pelos caem como folhas." },
        { id: "aconito", texto: "Beber o chá de acônito.", testeSorte: { chance: 50,
          sucesso: { efeitos: { honra: 2, hp: -8 }, curarCondicao: true, resultado: "O chá é amargo e escuro. A noite passa em convulsões, e ao amanhecer só resta o cansaço." },
          falha: { efeitos: { hp: -25 }, resultado: "O veneno corta fundo, mas a fera dentro de você resiste. A condição permanece." } } },
        { id: "bencao", texto: "Pedir a bênção da Santa · 5 Gold.", requisitos: { honraMin: 50, goldMin: 5 }, efeitos: { honra: 3, gold: -5 }, curarCondicao: true,
          resultado: "A velha acena para alguém que você não vê. A bênção desce como uma chuva fina e dissolve o que havia de selvagem." },
        { id: "recusar", texto: "Recusar a cura.", resultado: "A velha assente, sem julgar. Diz que a lua nova não volta tão cedo." }
      ]
    },
    {
      id: "cura_vampirismo", titulo: "A estaca e a aurora", tipo: "sobrenatural", peso: 3,
      requisitos: { condicaoAtiva: "vampirismo", rodadasDesde: { condicao: 16 }, flagsAusentes: ["condicao_abracada", "condicao_curada"] },
      texto: "Um padre andarilho bate ao salão e olha para você sem medo. Diz que o reconhece e que a última coisa que ainda existe de humano em você pode ser salva, se você quiser.",
      informacoes: "Ele traz uma cruz de madeira e um sorriso triste.",
      imagem: "assets/vila.webp", imagemAlt: "Um padre viajante segura uma cruz diante do salão",
      opcoes: [
        { id: "estaca", texto: "Cravar a estaca de freixo no próprio peito, de leve.", requisitos: { itens: ["estaca_de_freixo"] }, consumirItens: ["estaca_de_freixo"], efeitos: { honra: 4, hp: -15 }, curarCondicao: true,
          resultado: "A dor é de um fogo antigo. A estaca vira cinza, e os espelhos voltam a mostrar seu rosto." },
        { id: "sol", texto: "Esperar o sol nascer sem abrigo.", testeSorte: { chance: 45,
          sucesso: { efeitos: { honra: 3, hp: -10 }, curarCondicao: true, resultado: "A pele arde, e a sede desfalece. O sol toca você como um perdão, e não uma sentença." },
          falha: { efeitos: { hp: -30 }, resultado: "A luz o queima antes de curá-lo. Você se arrasta de volta à sombra, vivo por pouco, e ainda amaldiçoado." } } },
        { id: "absolvicao", texto: "Pedir absolvição ao padre · 10 Gold.", requisitos: { flags: ["padre_aceito"], goldMin: 10 }, efeitos: { honra: 3, gold: -10 }, curarCondicao: true,
          resultado: "O padre da vila ouve a confissão até o amanhecer. Ao fim, a cruz de madeira é colocada em suas mãos, e ela não queima." },
        { id: "recusar", texto: "Mandar o padre embora.", efeitos: { honra: -2 },
          resultado: "O padre se curva e sai. Os criados evitam seu olhar por semanas." }
      ]
    },
    {
      id: "cura_possessao", titulo: "O exorcismo", tipo: "sobrenatural", peso: 3,
      requisitos: { condicaoAtiva: "possessao", rodadasDesde: { condicao: 16 }, flagsAusentes: ["condicao_abracada", "condicao_curada"] },
      texto: "A voz, hoje, fala em outra língua. Alguns moradores rezam em frente ao salão. Uma criança aponta para você e pergunta quem é o homem atrás do senhor.",
      informacoes: "A voz está fraca. Esta pode ser a única janela.",
      imagem: "assets/vila.webp", imagemAlt: "Moradores rezam diante das portas do salão",
      opcoes: [
        { id: "sino", texto: "Realizar o exorcismo com o sino consagrado.", requisitos: { itens: ["sino_de_exorcismo"] }, consumirItens: ["sino_de_exorcismo"], efeitos: { honra: 4, hp: -10 }, curarCondicao: true,
          resultado: "O sino toca uma nota que parece vir de baixo. A voz grita uma vez e depois cala. A sala inteira respira junto." },
        { id: "agua_benta", texto: "Aspergir água benta sobre a cabeça.", requisitos: { itens: ["agua_benta"] }, consumirItens: ["agua_benta"], testeSorte: { chance: 70,
          sucesso: { efeitos: { honra: 2 }, curarCondicao: true, resultado: "A água chia na sua testa, e a voz se desfaz em fumaça. Você chora sem entender de quê." },
          falha: { efeitos: { hp: -10 }, resultado: "A voz ri, baixinho. A água escorre sem efeito." } } },
        { id: "confrontar", texto: "Confrontar a voz sozinho.", requisitos: { honraMin: 50 }, efeitos: { honra: 4, hp: -20 }, curarCondicao: true,
          resultado: "Você diz o próprio nome em voz alta, três vezes. Na terceira, a voz não responde. Os moradores, na porta, aplaudem sem fazer barulho." },
        { id: "esperar", texto: "Mandar a vila se calar e esperar.", efeitos: { honra: -2 },
          resultado: "A voz volta com força, e os moradores reclamam do silêncio que você impôs." }
      ]
    }
  );
})();
