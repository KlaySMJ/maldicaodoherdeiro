(function () {
  "use strict";
  const Jogo = window.Jogo;
  const marcar = (...ids) => Object.fromEntries(ids.map(id => [id, true]));

  Jogo.eventos.push(
    {
      id: "cavaleiro_moribundo", titulo: "O cavaleiro moribundo", tipo: "especial", peso: 1, especial: true,
      requisitos: { rodadaMin: 10, flagsAusentes: ["calice_1"] },
      imagem: "assets/cavaleiro-de-osso.webp", imagemAlt: "Um cavaleiro de ossos jaz sob a armadura rachada",
      texto: "Um cavaleiro de armadura rachada jaz à beira da estrada. Ele murmura sobre um cálice que cura e condena, e sobre um lugar onde dois caminhos se separam. Cada palavra custa ao peito dele um suspiro.",
      informacoes: "O cavaleiro não tem muito tempo. Ele só quer ser ouvido.",
      opcoes: [
        { id: "ouvir", texto: "Ouvi-lo até o fim.", efeitos: { honra: 2 }, flags: marcar("calice_1", "calice_ouviu"), resultado: "Ele fala por muito tempo sobre uma capela, um pântano e um lugar entre os dois. Quando termina, está morto, com os olhos abertos e a mão no seu braço." },
        { id: "agua", texto: "Dar-lhe água e esperar o fim.", efeitos: { honra: 1 }, flags: marcar("calice_1"), resultado: "Ele agradece com um gesto. Antes de morrer, murmura palavras que você mal entende, mas não esquece." },
        { id: "espada", texto: "Levar a espada dele.", efeitos: { ataque: 1, honra: -4 }, flags: marcar("calice_1"), resultado: "A lâmina se solta fácil demais da mão fraca. Você a embainha antes que o último suspiro termine." },
        { id: "interrogar", texto: "Interrogá-lo antes que morra.", requisitos: { honraMax: -30 }, efeitos: { gold: 4, honra: -3 }, flags: marcar("calice_1", "calice_ouviu"), resultado: "Ele cospe sangue e um nome de lugar. No bolso dele, você encontra moedas que não eram para você." }
      ]
    },
    {
      id: "mapa_na_pedra", titulo: "O mapa na pedra", tipo: "especial", peso: 1, especial: true,
      requisitos: { rodadaMin: 14, flags: ["calice_1"], flagsAusentes: ["calice_2"] },
      imagem: "assets/ponte.webp", imagemAlt: "Uma ponte antiga de madeira cruza o caminho sobre um rio",
      texto: "Numa pedra à beira da estrada, alguém gravou há séculos um mapa: duas trilhas que se cruzam em um círculo, e uma inscrição quase apagada pelo líquen.",
      informacoes: "O mapa está incompleto. A pedra, porém, parece conhecer o resto.",
      opcoes: [
        { id: "copiar", texto: "Copiar o mapa com cuidado · 3 Gold.", requisitos: { goldMin: 3 }, efeitos: { gold: -3, honra: 1 }, flags: marcar("calice_2"), resultado: "Você gasta papel, tinta e uma tarde. A cópia é fiel, e a pedra parece agradecer com uma sombra." },
        { id: "lembranca", texto: "Seguir a lembrança do cavaleiro.", requisitos: { flags: ["calice_ouviu"] }, efeitos: { honra: 2 }, flags: marcar("calice_2"), resultado: "Você fecha os olhos e reconhece, em cada gravura, uma palavra do moribundo. O resto do mapa se completa sozinho." },
        { id: "decifrar", texto: "Decifrar a pedra por dois dias, no frio.", efeitos: { hp: -5, honra: 2 }, flags: marcar("calice_2"), resultado: "A neve cobre seus ombros, mas as letras se tornam claras. Você sai com a testa gelada e o mapa na memória." },
        { id: "arrancar", texto: "Arrancar a pedra e levá-la para casa.", requisitos: { honraMax: -30 }, efeitos: { hp: -6, honra: -3 }, flags: marcar("calice_2"), resultado: "A pedra pesa como um defunto, mas você a leva. Quando a instala no pátio, o mapa se revela por completo, e o vento passa a soar diferente." }
      ]
    },
    {
      id: "encruzilhada_calice", titulo: "A encruzilhada do Cálice", tipo: "especial", peso: 0.8, especial: true,
      requisitos: { rodadaMin: 18, flags: ["calice_2"], flagsAusentes: ["calice_3", "calice_desistiu"], honra: "decidida" },
      imagem: "assets/vila.webp", imagemAlt: "Uma estrada se cruza diante do portão da vila",
      texto: "Duas estradas saem do mesmo ponto. À esquerda, pedras brancas e passarinhos. À direita, pedras negras e corvos. No centro, um marco de pedra traz uma inscrição: ‘Só passa quem é o que parece ser.’",
      informacoes: "Você sente que a estrada o escolheu antes de você escolhê-la.",
      opcoes: [
        { id: "luz", texto: "Seguir a trilha das pedras brancas.", requisitos: { honraMin: 30 }, efeitos: { honra: 2 }, flags: marcar("calice_3", "calice_rota_luz"), resultado: "As pedras brancas guiam seus passos como uma mão invisível. Nos galhos, os passarinhos o acompanham sem cantar." },
        { id: "sombra", texto: "Seguir a trilha dos corvos.", requisitos: { honraMax: -30 }, efeitos: { honra: -2 }, flags: marcar("calice_3", "calice_rota_sombra"), resultado: "Os corvos abrem passagem, e a névoa se fecha atrás de você. Algo pesado o observa do alto, com paciência." },
        { id: "voltar", texto: "Voltar atrás.", efeitos: { gold: 4 }, flags: marcar("calice_3", "calice_desistiu"), resultado: "Você dá as costas para as duas estradas. No caminho de volta, acha algumas moedas na lama, como pagamento por uma escolha sensata." }
      ]
    },
    {
      id: "prova_do_ermitao", titulo: "A prova do ermitão", tipo: "especial", peso: 1, especial: true,
      requisitos: { rodadaMin: 18, flags: ["calice_3", "calice_rota_luz"], flagsAusentes: ["calice_4", "calice_desistiu"], honra: "alta" },
      imagem: "assets/ervas.webp", imagemAlt: "Ervas, frascos e um pilão usados para cuidar de doentes",
      texto: "Numa caverna alta, um ermitão magro oferece água e três perguntas. Ele diz que o Cálice não se dá a quem quer, apenas a quem já faz o que ele pede.",
      informacoes: "As perguntas não têm palavras. São ações.",
      opcoes: [
        { id: "esmola", texto: "Dar a metade do que carrega a um mendigo · 5 Gold.", requisitos: { goldMin: 5 }, efeitos: { gold: -5, honra: 4 }, flags: marcar("calice_4"), resultado: "O mendigo olha para as moedas como para uma aparição. O ermitão balança a cabeça, satisfeito, sem dizer palavra." },
        { id: "cuidar", texto: "Passar a noite cuidando de doentes.", efeitos: { hp: -10, habitantes: 2, honra: 4 }, flags: marcar("calice_4"), resultado: "Você troca curativos até as velas queimarem. Ao amanhecer, os doentes que melhoraram decidem seguir seu nome." },
        { id: "confessar", texto: "Confessar seu maior erro diante de todos.", efeitos: { habitantes: -2, honra: 3 }, flags: marcar("calice_4"), resultado: "A confissão é curta e verdadeira. Duas pessoas, ao ouvir, deixam a vila em silêncio. As que ficam olham para você de outro jeito." }
      ]
    },
    {
      id: "pacto_corvo_negro", titulo: "O pacto do corvo negro", tipo: "especial", peso: 1, especial: true,
      requisitos: { rodadaMin: 18, flags: ["calice_3", "calice_rota_sombra"], flagsAusentes: ["calice_4", "calice_desistiu"], honra: "baixa" },
      imagem: "assets/corvo.webp", imagemAlt: "Um corvo negro do tamanho de um homem espera sobre um altar",
      texto: "Num santuário abandonado, em meio à névoa, um corvo do tamanho de um homem espera sobre o altar. Fala em voz grave e cansada. Diz que a sombra também tem um preço, e que ele cobra em coisas pequenas.",
      informacoes: "O corvo não discute. Apenas cobra.",
      opcoes: [
        { id: "sangue", texto: "Pagar com seu sangue.", efeitos: { hp: -20, honra: -3 }, flags: marcar("calice_4"), resultado: "O sangue escorre pelas pedras do altar, e o corvo o bebe pelos olhos. Você sai cambaleando, mais leve e mais frio." },
        { id: "gente", texto: "Pagar com gente da vila.", sacrificarPopulacao: 8, efeitos: { honra: -6 }, flags: marcar("calice_4"), resultado: "O corvo aceita as sombras sem comentar. Oito moradores adormecem e não acordam. A vila inteira percebe o preço sem entender por quê.", resultadoCulto: "O corvo aceita as sombras sem comentar. Oito seguidores adormecem e não acordam. A vila inteira percebe o preço sem entender por quê." },
        { id: "ouro", texto: "Pagar com ouro · 15 Gold.", requisitos: { goldMin: 15 }, efeitos: { gold: -15, honra: -2 }, flags: marcar("calice_4"), resultado: "As moedas se transformam em penas negras e voam para dentro do bico. O corvo inclina a cabeça, aprovando, como quem recebe uma gorjeta." }
      ]
    },
    {
      id: "calice_na_capela", titulo: "O Cálice na capela", tipo: "especial", peso: 1, especial: true,
      requisitos: { rodadaMin: 22, flags: ["calice_4", "calice_rota_luz"], flagsAusentes: ["calice_5", "calice_desistiu"], honra: "alta" },
      imagem: "assets/santa-sem-nome.webp", imagemAlt: "Uma figura sagrada com um halo de luz",
      texto: "No alto da montanha, uma capela sem teto deixa o sol cair sobre um altar de pedra. Sobre ele, um cálice de madeira simples, gasto pelo uso. Não há guardião. Apenas um silêncio que parece vir de dentro do cálice.",
      informacoes: "Peregrinos esperam à porta da capela, em fila. Ninguém ousa tocá-lo.",
      opcoes: [
        { id: "levar", texto: "Levar o Cálice com você.", efeitos: { honra: -3 }, itens: ["calice_sagrado"], flags: marcar("calice_5"), resultado: "O cálice cabe na sua mão como se tivesse sido moldado nela. Os peregrinos baixam os olhos sem protestar, mas a fila inteira se desfaz." },
        { id: "deixar", texto: "Deixá-lo no altar para o povo.", efeitos: { habitantes: 10, honra: 8 }, flags: marcar("calice_5"), resultado: "Você se ajoelha, em vez de pegar. Os peregrinos se levantam um a um. Dez famílias decidem ficar perto do altar e da pessoa que o respeitou." },
        { id: "dividir", texto: "Beber e dividir com a vila.", efeitos: { hp: 30, habitantes: 5, honra: 4 }, curarCondicao: true, curaUniversal: true, flags: marcar("calice_5"), resultado: "Você bebe a primeira gota, e depois passa o cálice adiante. A água nunca acaba. Cinco peregrinos, curados, decidem seguir você até a vila." }
      ]
    },
    {
      id: "calice_no_pantano", titulo: "O Cálice no pântano", tipo: "batalha", peso: 1, especial: true,
      requisitos: { rodadaMin: 26, flags: ["calice_4", "calice_rota_sombra"], flagsAusentes: ["calice_5", "calice_desistiu"], honra: "baixa" },
      imagem: "assets/torre-na-lagoa.webp", imagemAlt: "Uma torre de pedra meio submersa em águas escuras",
      texto: "Um templo meio afundado no pântano negro mostra, entre as colunas, um cálice de pedra escura, coberto de algas. Um guardião de lama, armadura e raiva ergue-se da água, sem dizer palavra.",
      informacoes: "O ataque precisa alcançar a defesa do guardião. Seu escudo reduz o dano recebido, sem se desgastar.",
      batalha: {
        semAjuste: true, semOverrides: true, somenteEscudo: true, defesa: 6,
        vitoria: { dano: 20, efeitos: { honra: -3 }, itens: ["calice_negro"], resultado: "O guardião se desfaz em lama, e o cálice se solta do pedestal como uma pedra de rio. Em seus dedos, o frio parece vivo." },
        derrota: { dano: 30, efeitos: {}, resultado: "O guardião o afunda na água, e você é arrastado de volta pela margem. O cálice some sob as algas." },
        penalidadeFalha: { efeitos: { habitantes: -8 }, efeitosCulto: { seguidores: -8 }, texto: "Os que o seguiram ao pântano não voltam." }
      },
      opcoes: [
        { id: "tomar", texto: "Tomar o Cálice à força.", combate: true, flags: marcar("calice_5") },
        { id: "sacrificio", texto: "Oferecer o sangue de um morador.", sacrificarPopulacao: 5, efeitos: { honra: -8 }, itens: ["calice_negro"], flags: marcar("calice_5"), resultado: "O guardião aceita a oferenda sem rancor e volta à água. O cálice se solta, ainda quente. Você o carrega, e a vila, o peso." },
        { id: "deixar", texto: "Deixar o Cálice afundar.", efeitos: { honra: 3 }, flags: marcar("calice_5"), resultado: "Você recua um passo, depois outro. O guardião não o segue. O pântano se fecha sobre o templo, e a névoa cobre o resto." }
      ]
    }
  );
})();
