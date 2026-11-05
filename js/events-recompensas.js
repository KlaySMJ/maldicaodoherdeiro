(function () {
  "use strict";
  const Jogo = (window.Jogo = window.Jogo || {});

  Jogo.registrarEventos(
    {
      id: "equipamento_sem_dono",
      titulo: "Uma peça à espera",
      tipo: "achado",
      peso: 1.15,
      imagem: "assets/forja.webp",
      imagemAlt: "Uma arma e um escudo deixados junto à forja",
      texto:
        "Entre ferramentas esquecidas, há uma peça que ainda pode servir. O ferreiro limpa a ferrugem e espera sua decisão.",
      informacoes: "Equipamentos recebidos melhoram seus atributos imediatamente e permanecem nesta run.",
      opcoes: [
        {
          id: "ficar",
          texto: "Escolher um equipamento comum, raro ou épico.",
          recompensaItemGenerico: true,
          resultado: "Você escolhe um dos objetos que ainda pode ser aproveitado.",
        },
        {
          id: "deixar",
          texto: "Deixar a peça para a próxima pessoa.",
          resultado: "O ferreiro guarda o achado numa prateleira seca.",
        },
      ],
    },
    {
      id: "reliquia_sem_dono",
      titulo: "Uma relíquia sem brasão",
      tipo: "achado",
      peso: 0.35,
      imagem: "assets/bau-estrada.webp",
      imagemAlt: "Um embrulho antigo retirado de um baú",
      texto:
        "Um embrulho lacrado é encontrado sob as tábuas do salão. O selo não pertence a nenhuma família conhecida.",
      informacoes: "O conteúdo pode ser uma dádiva, um pacto ou apenas mais um peso para carregar.",
      opcoes: [
        {
          id: "abrir",
          texto: "Abrir o embrulho.",
          recompensaItemEspecial: true,
          resultado: "Você rompe o selo e aceita o que foi guardado ali.",
        },
        {
          id: "guardar",
          texto: "Devolver o embrulho ao esconderijo.",
          resultado: "O selo permanece intacto sob as tábuas.",
        },
      ],
    },
    {
      id: "correu_mais_rapido_que_a_luz",
      titulo: "Correu mais rápido que a luz",
      tipo: "achado",
      peso: 0,
      requisitos: { flags: ["cinto_vento_ativo"] },
      imagem: "assets/vila.webp",
      imagemAlt: "Um caminho vazio junto às muralhas",
      texto:
        "Você correu por toda a estrada antes de encontrar qualquer batalha. Quando para, o cinto já não está mais em sua cintura.",
      informacoes: "A força durou menos que a corrida.",
      opcoes: [
        {
          id: "seguir",
          texto: "Continuar sem o cinto.",
          flags: { cinto_vento_ativo: false },
          resultado: "O vento leva o último sinal do cinto pela estrada.",
        },
      ],
    },
  );
})();
