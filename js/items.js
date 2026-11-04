(function () {
  "use strict";
  const Jogo = window.Jogo;

  // Consumíveis guardados no inventário e usados quando o jogador decidir,
  // além de equipamentos aplicados no recebimento. Efeitos definidos nos dados.
  Jogo.itens = [
    {
      id: "adaga_cerimonial", nome: "Adaga cerimonial",
      texto: "Adaga cerimonial · sacrifique 10 para +10 Ataque",
      descricao: "Uso único nesta run: sacrifique 10 habitantes ou, em uma run do culto, 10 seguidores para ganhar +10 Ataque.",
      categoria: "pacto", raridade: "pacto", tipo: "uso",
      uso: { sacrificioAtaque: 10 }
    },
    {
      id: "amuleto_ultima_guarda", nome: "Amuleto de última guarda",
      texto: "Amuleto de última guarda · anula o dano da próxima batalha",
      descricao: "Ao usar, anula todo o dano recebido na próxima batalha.",
      categoria: "relíquia", raridade: "lendario",
      tipo: "uso", mercador: true, preco: 8, aumentoPreco: 2,
      uso: { bloquearDanoProximaBatalha: true }
    },
    {
      id: "oleo_de_lamina", nome: "Óleo de lâmina",
      texto: "Óleo de lâmina · +2 Ataque na próxima batalha",
      descricao: "Ao usar, concede +2 Ataque apenas na próxima batalha.",
      categoria: "consumivel", raridade: "raro",
      tipo: "uso", mercador: true, preco: 7, aumentoPreco: 2,
      uso: { bonusAtaqueProximaBatalha: 2 }
    },
    {
      id: "moeda_sussurrante", nome: "Moeda sussurrante",
      texto: "Moeda sussurrante · +1 gold na próxima recompensa",
      descricao: "Ao usar, acrescenta 1 gold à próxima recompensa positiva em gold.",
      categoria: "consumivel", raridade: "comum",
      tipo: "uso", mercador: true, preco: 4, aumentoPreco: 2,
      uso: { bonusGoldProximaRecompensa: 1 }
    },
    {
      id: "pocao_cura_grande", nome: "Poção de cura grande",
      texto: "Poção de cura grande · +25 Vida",
      descricao: "Ao usar, recupera 25 HP.",
      categoria: "consumivel", raridade: "epico", tipo: "uso",
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
      categoria: "arma", raridade: "raro", tipo: "equipamento", encarece: "arma_melhor",
      aoReceber: { ataque: 1 }
    },
    {
      id: "selo_do_povo", nome: "Selo dos guardiões",
      texto: "Selo dos guardiões · +3 Ataque, +4 Escudo e +25 Vida",
      descricao: "Item lendário: aumenta permanentemente Ataque em 3, Escudo em 4 e Vida em 25.",
      categoria: "relíquia", raridade: "lendario", tipo: "equipamento",
      aoReceber: { ataque: 3, escudo: 4, hpMax: 25, hp: 25 }
    },
    {
      id: "selo_da_recusa", nome: "Lendário · Selo da Recusa",
      texto: "Selo da Recusa · +4 Ataque, +4 Escudo e +20 Vida máxima",
      descricao: "Relíquia lendária recebida ao resistir à Entidade X. Aumenta permanentemente Ataque em 4, Escudo em 4 e Vida máxima em 20.",
      categoria: "relíquia", raridade: "lendario", tipo: "equipamento",
      aoReceber: { ataque: 4, escudo: 4, hpMax: 20, hp: 20 }
    },
    {
      id: "marca_da_entidade_x", nome: "Pacto · Marca da Entidade X",
      texto: "Marca da Entidade X · perde 1 Vida por rodada",
      descricao: "Pacto: a Entidade encerra seus desafios, mas a marca drena 1 Vida a cada rodada até o fim desta run.",
      categoria: "pacto", raridade: "pacto", tipo: "maldição"
    },
    {
      id: "dente_do_abismo", nome: "Dente do Abismo",
      texto: "Dente do Abismo · +5 Ataque, +5 Escudo e +30 Vida",
      descricao: "Pacto: aumenta permanentemente Ataque em 5, Escudo em 5 e Vida em 30. A maldição tira 15 de Honra e 5 habitantes ao recebê-lo.",
      categoria: "pacto", raridade: "pacto", tipo: "equipamento",
      aoReceber: { ataque: 5, escudo: 5, hpMax: 30, hp: 30, honra: -15, habitantes: -5 }
    },
    ...[
      ["faca_cega", "Faca cega", "comum", "ataque", 1, "Corta pão e pouca coisa mais."],
      ["adaga_de_cozinha", "Adaga de cozinha", "comum", "ataque", 1, "Ainda tem cheiro de cebola."],
      ["foice_de_colheita", "Foice de colheita", "comum", "ataque", 1, "Feita para o trigo, aceita outros convites."],
      ["porrete_de_carvalho", "Porrete de carvalho", "comum", "ataque", 1, "Argumento de madeira maciça."],
      ["estilingue_reforcado", "Estilingue reforçado", "comum", "ataque", 1, "As crianças juram que é perigoso."],
      ["espeto_de_ferro", "Espeto de ferro", "comum", "ataque", 1, "Serve para assar e para lembrar."],
      ["tampa_de_panela", "Tampa de panela", "comum", "escudo", 1, "Amassada de orgulho."],
      ["escudo_de_vime", "Escudo de vime", "comum", "escudo", 1, "Trançado com paciência, quebra com pouca."],
      ["peitoral_de_couro_cru", "Peitoral de couro cru", "comum", "escudo", 1, "Ainda tem o cheiro do curtume."],
      ["botas_remendadas", "Botas remendadas", "comum", "escudo", 1, "Pés firmes, nome nenhum."],
      ["luvas_de_trabalho", "Luvas de trabalho", "comum", "escudo", 1, "Calejadas por outras mãos."],
      ["gorro_acolchoado", "Gorro acolchoado", "comum", "escudo", 1, "Não é bonito, mas amortece."],
      ["pao_de_viajante", "Pão de viajante", "comum", "hpMax", 5, "Duro como pedra, quente como promessa."],
      ["espada_de_soldado", "Espada de soldado", "raro", "ataque", 2, "Usada, mas bem cuidada."],
      ["lanca_de_caca", "Lança de caça", "raro", "ataque", 2, "Mantém o perigo a um braço de distância."],
      ["arco_longo", "Arco longo", "raro", "ataque", 2, "Corda nova, madeira velha."],
      ["machado_de_guerra", "Machado de guerra", "raro", "ataque", 3, "Pesa o suficiente para ser levado a sério."],
      ["maca_cravejada", "Maça cravejada", "raro", "ataque", 3, "Espinhos de ferro, argumentos de ferro."],
      ["escudo_de_madeira_ferrada", "Escudo de madeira ferrada", "raro", "escudo", 2, "Madeira boa, ferro melhor."],
      ["elmo_de_guarda", "Elmo de guarda", "raro", "escudo", 2, "Já protegeu cabeças menos teimosas."],
      ["manto_de_la_grossa", "Manto de lã grossa", "raro", "escudo", 2, "Esquenta o corpo e esconde o medo."],
      ["escudo_redondo", "Escudo redondo", "raro", "escudo", 3, "Largo o bastante para esconder um homem e uma desculpa."],
      ["cota_de_malha_velha", "Cota de malha velha", "raro", "escudo", 3, "Pesada, barulhenta, fiel."],
      ["cinto_de_couro_grosso", "Cinto de couro grosso", "raro", "hpMax", 10, "Aperta onde dói menos."],
      ["colar_de_dentes_de_javali", "Colar de dentes de javali", "raro", "hpMax", 12, "A fera já não precisa dele."],
      ["amuleto_de_jaspe", "Amuleto de jaspe", "raro", "hpMax", 15, "Verde como o fim do inverno."],
      ["relicario_do_santo", "Relicário do santo", "raro", "hpMax", 20, "Dentro, algo pequeno e muito antigo."],
      ["montante_do_cavaleiro", "Montante do cavaleiro", "epico", "ataque", 4, "Espada de duas mãos, honra de uma."],
      ["lamina_de_aco_negro", "Lâmina de aço negro", "epico", "ataque", 4, "O fio parece beber a luz."],
      ["alabarda_pesada", "Alabarda pesada", "epico", "ataque", 5, "Feita para derrubar muralhas ou quem as defenda."],
      ["machado_de_cerco", "Machado de cerco", "epico", "ataque", 5, "Pesa mais do que uma decisão difícil."],
      ["escudo_de_aco_polido", "Escudo de aço polido", "epico", "escudo", 4, "Reflete o rosto de quem o encara."],
      ["escudo_do_cruzado", "Escudo do cruzado", "epico", "escudo", 4, "A cruz ainda guarda o sangue de muita estrada."],
      ["armadura_de_placas", "Armadura de placas", "epico", "escudo", 5, "Feita para um homem maior, ou mais assustado."],
      ["muralha_de_bolso", "Muralha de bolso", "epico", "escudo", 5, "Um muro que cabe no braço."],
      ["coracao_de_urso", "Coração de urso", "epico", "hpMax", 35, "Ainda bate quando ninguém olha."]
    ].map(([id, nome, raridade, atributo, valor, texto]) => ({
      id, nome, texto: `${nome} · +${valor} ${atributo === "ataque" ? "Ataque" : atributo === "escudo" ? "Escudo" : "Vida máxima"}`,
      descricao: texto, categoria: atributo === "ataque" ? "arma" : atributo === "escudo" ? "escudo" : "vitalidade",
      raridade, tipo: "equipamento", generico: true, pesoSorteio: { comum: 10, raro: 4, epico: 1 }[raridade],
      encarece: atributo === "ataque" ? "arma_melhor" : atributo === "escudo" ? "escudo_melhor" : undefined,
      aoReceber: atributo === "hpMax" ? { hpMax: valor, hp: valor } : { [atributo]: valor }
    })),
    {
      id: "adaga_amaldicoada", nome: "Adaga amaldiçoada", texto: "Adaga amaldiçoada · vitórias a qualquer custo",
      descricao: "Enquanto estiver com você, vence as batalhas comuns, mas recebe o dano do desfecho de derrota antes da mitigação do escudo.",
      categoria: "arma", raridade: "pacto", tipo: "equipamento", especialSorteavel: true, especial: "vitoria_com_dano_de_derrota", aoReceber: {}
    },
    {
      id: "tomo_do_esquecimento", nome: "Tomo do esquecimento", texto: "Tomo do esquecimento · converte soldados inimigos",
      descricao: "Durante uma batalha, converte dez soldados inimigos em habitantes. Custa 10 de Honra e 10 de Vida. Uso único.",
      categoria: "reliquia", raridade: "epico", tipo: "uso", especialSorteavel: true, uso: { tomoEsquecimento: true, umaVezPorRun: true }
    },
    {
      id: "cajado_da_dor", nome: "Cajado da dor", texto: "Cajado da dor · +20 Vida máxima",
      descricao: "Ao usar, perde metade da Vida atual e aumenta a Vida máxima em 20. Uso único.",
      categoria: "reliquia", raridade: "epico", tipo: "uso", especialSorteavel: true, uso: { cajadoDaDor: true, umaVezPorRun: true }
    },
    {
      id: "fazedora_de_viuvas", nome: "Fazedora de viúvas", texto: "Fazedora de viúvas · +10 Ataque, −10 Escudo",
      descricao: "Arma brutal: aumenta Ataque em 10 e reduz Escudo em 10.", categoria: "arma", raridade: "lendario", tipo: "equipamento",
      especialSorteavel: true, aoReceber: { ataque: 10, escudo: -10 }, encarece: "arma_melhor"
    },
    {
      id: "escudo_do_dragao", nome: "Escudo do dragão", texto: "Escudo do dragão · +10 Escudo, −10 Ataque",
      descricao: "Proteção pesada: aumenta Escudo em 10 e reduz Ataque em 10.", categoria: "escudo", raridade: "lendario", tipo: "equipamento",
      especialSorteavel: true, aoReceber: { escudo: 10, ataque: -10 }, encarece: "escudo_melhor"
    },
    {
      id: "martelo_dos_afogados", nome: "Martelo dos afogados", texto: "Martelo dos afogados · atrai eventos abissais",
      descricao: "Enquanto estiver com você, dobra o peso dos eventos abissais no sorteio.", categoria: "reliquia", raridade: "pacto", tipo: "equipamento", especialSorteavel: true, aoReceber: {}
    },
    {
      id: "bacamarte", nome: "Bacamarte", texto: "Bacamarte · três batalhas sem dano",
      descricao: "Ao usar, anula o dano das próximas três batalhas. Depois, a pólvora explode em sua mão e causa 15 de dano. Uso único.",
      categoria: "arma", raridade: "lendario", tipo: "uso", especialSorteavel: true, uso: { bacamarte: true, umaVezPorRun: true }
    },
    {
      id: "honra_dos_caidos", nome: "Honra dos caídos", texto: "Honra dos caídos · mais seguidores a cada cinco rodadas",
      descricao: "Requer Honra ≤ −50 e o culto ativo. Duplica a taxa de chegada periódica de seguidores: +5 a cada cinco rodadas.",
      categoria: "pacto", raridade: "pacto", tipo: "equipamento", especialSorteavel: true, requisitos: { honraMax: -50, cultoAtivo: true }, aoReceber: {}
    },
    {
      id: "afogados_abencoados", nome: "Afogados abençoados", texto: "Afogados abençoados · dobra seguidores recebidos",
      descricao: "Requer Honra ≤ −90 e o culto ativo. Duplica toda nova chegada de seguidores.",
      categoria: "pacto", raridade: "pacto", tipo: "equipamento", especialSorteavel: true, requisitos: { honraMax: -90, cultoAtivo: true }, aoReceber: {}
    },
    {
      id: "escudo_da_fe", nome: "Escudo da fé", texto: "Escudo da fé · reutiliza itens com intervalo de dez rodadas",
      descricao: "Consumíveis usados não perdem a carga; o efeito tem intervalo de dez rodadas. Itens marcados como uso único por run não são afetados.",
      categoria: "escudo", raridade: "lendario", tipo: "equipamento", especialSorteavel: true, aoReceber: {}
    },
    {
      id: "espada_da_verdade", nome: "Espada da verdade", texto: "Espada da verdade · Honra fixada em zero",
      descricao: "Enquanto estiver com você, a Honra não aumenta nem diminui e permanece em zero. Requer desbloqueio após 200 rodadas consecutivas entre −30 e +30.",
      categoria: "arma", raridade: "lendario", tipo: "equipamento", especialSorteavel: true, bloqueado: true, aoReceber: { honra: 0 }
    },
    {
      id: "lanca_do_heroi", nome: "Lança do Herói", texto: "Lança do Herói · evita dez batalhas",
      descricao: "Requer Honra ≥ +100. Vence e evita as próximas dez batalhas, sem dano nem perda de Honra.",
      categoria: "arma", raridade: "lendario", tipo: "equipamento", especialSorteavel: true, requisitos: { honraMin: 100 }, aoReceber: { lancaHeroiBatalhas: 10 }
    },
    {
      id: "amuleto_de_gigantes", nome: "Amuleto de gigantes", texto: "Amuleto de gigantes · +40 Vida máxima, −40 Vida atual",
      descricao: "Aumenta a Vida máxima em 40 e reduz a Vida atual em 40.", categoria: "reliquia", raridade: "lendario", tipo: "equipamento",
      especialSorteavel: true, aoReceber: { hpMax: 40, hp: -40 }
    },
    {
      id: "cinto_dos_ventos", nome: "Cinto dos ventos", texto: "Cinto dos ventos · +100 Ataque na próxima batalha",
      descricao: "Ao usar, concede +100 Ataque para a próxima batalha. Se outro evento vier antes, você perde o cinto ao correr mais rápido que a luz.",
      categoria: "reliquia", raridade: "lendario", tipo: "uso", especialSorteavel: true, uso: { cintoDosVentos: true, umaVezPorRun: true }
    },
    {
      id: "cao_companheiro", nome: "Cão de guarda", texto: "Cão de guarda · reduz 2 de dano nas batalhas",
      descricao: "Companheiro passivo: reduz em 2 o dano recebido em cada batalha.", categoria: "companheiro", raridade: "comum", tipo: "passivo", aoReceber: {}
    },
    {
      id: "corvo_companheiro", nome: "Corvo da estrada", texto: "Corvo da estrada · +1 gold em recompensas",
      descricao: "Companheiro passivo: acrescenta 1 gold a cada recompensa positiva em moedas.", categoria: "companheiro", raridade: "comum", tipo: "passivo", aoReceber: {}
    },
    {
      id: "gato_companheiro", nome: "Gato do celeiro", texto: "Gato do celeiro · recupera 1 HP por rodada",
      descricao: "Companheiro passivo: recupera 1 HP ao começar cada rodada, até seu máximo.", categoria: "companheiro", raridade: "comum", tipo: "passivo", aoReceber: {}
    }
  ];
})();
