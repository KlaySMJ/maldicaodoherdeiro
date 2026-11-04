(function () {
  "use strict";
  const Jogo = window.Jogo;

  // Consumíveis guardados no inventário e usados quando o jogador decidir,
  // além de equipamentos aplicados no recebimento. Efeitos definidos nos dados.
  Jogo.itens = [
    {
      id: "amuleto_ultima_guarda", nome: "Amuleto de última guarda",
      texto: "Amuleto de última guarda · anula o dano da próxima batalha",
      descricao: "Ao usar, anula todo o dano recebido na próxima batalha.",
      tipo: "uso", mercador: true, preco: 8, aumentoPreco: 2,
      uso: { bloquearDanoProximaBatalha: true }
    },
    {
      id: "oleo_de_lamina", nome: "Óleo de lâmina",
      texto: "Óleo de lâmina · +2 Ataque na próxima batalha",
      descricao: "Ao usar, concede +2 Ataque apenas na próxima batalha.",
      tipo: "uso", mercador: true, preco: 7, aumentoPreco: 2,
      uso: { bonusAtaqueProximaBatalha: 2 }
    },
    {
      id: "moeda_sussurrante", nome: "Moeda sussurrante",
      texto: "Moeda sussurrante · +1 gold na próxima recompensa",
      descricao: "Ao usar, acrescenta 1 gold à próxima recompensa positiva em gold.",
      tipo: "uso", mercador: true, preco: 4, aumentoPreco: 2,
      uso: { bonusGoldProximaRecompensa: 1 }
    },
    {
      id: "pocao_cura_grande", nome: "Poção de cura grande",
      texto: "Poção de cura grande · +25 Vida",
      descricao: "Ao usar, recupera 25 HP.",
      categoria: "consumivel", raridade: "incomum", tipo: "uso",
      uso: { efeitos: { hp: 25 } }
    },
    {
      id: "elixir_do_escudo", nome: "Elixir do escudo",
      texto: "Elixir do escudo · +3 Escudo na próxima batalha",
      descricao: "Ao usar, concede +3 Escudo apenas na próxima batalha.",
      categoria: "consumivel", raridade: "comum", tipo: "uso", mercador: true,
      preco: 7, aumentoPreco: 2,
      uso: { bonusEscudoProximaBatalha: 3 }
    },
    {
      id: "pote_de_moedas_velhas", nome: "Pote de moedas velhas",
      texto: "Pote de moedas velhas · +5 gold",
      descricao: "Ao abrir, recebe 5 gold.",
      categoria: "consumivel", raridade: "comum", tipo: "uso",
      uso: { efeitos: { gold: 5 } }
    },
    {
      id: "faca_de_caca", nome: "Faca de caça",
      texto: "Faca de caça · +1 Ataque",
      descricao: "Afiada e leve. Aumenta permanentemente o Ataque em 1 e encarece a próxima Arma melhor.",
      categoria: "arma", raridade: "comum", tipo: "equipamento", encarece: "arma_melhor",
      aoReceber: { ataque: 1 }
    }
  ];
})();
