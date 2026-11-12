(function () {
  "use strict";
  const J = window.Jogo;
  const animais = ["cao_companheiro", "corvo_companheiro", "gato_companheiro"];
  const cadeias = ["farinha_nova", "cancao_que_corre", "prisioneiro_volta", "capela"];
  const marcas = {
    barao: "barao_derrotado",
    culto: "lider_culto_derrotado",
    entidade: "entidade_derrotada",
    abissal: "senhor_do_abismo_derrotado",
  };
  const trofeus = {
    barao: "estandarte_do_barao",
    culto: "relicario_do_silencio",
    entidade: "selo_da_recusa",
    abissal: "lamina_da_lagoa",
  };
  const posse = (run, id) => run.inventario.includes(id) || run.itensConquistados.includes(id);
  const obras = {
    ponte: ["Ponte", "+1 Gold na renda regular com 20 habitantes"],
    moinho: ["Moinho", "+1 Vida por dia"],
    capela: ["Capela", "+1 Escudo ao construir (ganho permanente)"],
    forja: ["Forja", "Desconto de 2 Gold na arma melhorada"],
    muralha: ["Muralha", "Evita 2 de dano de combate"],
    mercado_coberto: ["Mercado coberto", "+1 Gold a cada 5 dias"],
    cisterna_comunitaria: ["Cisterna comunitária", "+1 Habitante a cada 3 dias após a construção"],
    entreposto_comercial: ["Entreposto comercial", "+1 Gold a cada 2 dias após a construção"],
    torre_vigia: ["Torre de vigia", "Evita 3 de dano de combate"],
    enfermaria_ervateira: ["Enfermaria da ervateira", "+1 Vida por dia abaixo de 60 Vida"],
    praca_forca: ["Praça da Forca", "+1 Gold a cada 6 dias; −1 Honra e +2 Seguidores com culto a cada 10"],
    celeiro: ["Celeiro", "Reduz pela metade as perdas de habitantes na fome e seca"],
  };
  const historiasObras = {
    ponte: "Os carpinteiros descem até os pilares. A correnteza expôs as juntas que precisam de reforço.",
    moinho:
      "O moleiro desmonta uma engrenagem gasta. Os aprendizes se revezam para manter a farinha chegando às casas.",
    capela:
      "Os pedreiros encontram uma parede úmida junto ao abrigo. O padre cede o pátio aos trabalhadores.",
    forja:
      "O ferreiro apaga um dos fornos e marca onde assentará a nova bancada. Seus ajudantes recolhem o ferro aproveitável.",
    muralha:
      "Os guardas mostram as pedras soltas. Os moradores trazem argamassa enquanto os pedreiros sobem nos andaimes.",
    mercado_coberto:
      "Os vendedores afastam as bancas. Sob as telhas, os carpinteiros marcam os apoios do novo corredor.",
    cisterna_comunitaria:
      "Os moradores guardam água em barris enquanto os pedreiros trabalham no reservatório.",
    entreposto_comercial:
      "Os carroceiros descarregam no pátio. Há espaço para novos depósitos, mas será preciso refazer os apoios.",
    torre_vigia:
      "A sentinela desce para mostrar a escada aos carpinteiros. Outro guarda assume a ronda no chão.",
    enfermaria_ervateira:
      "A ervateira transfere as camas para uma sala seca. Os moradores limpam o espaço onde os artesãos vão trabalhar.",
    praca_forca:
      "Os trabalhadores isolam o piso da praça. Alguns moradores ajudam em silêncio; outros evitam passar por ali.",
    celeiro:
      "O responsável pelo grão afasta os sacos das paredes. Os carpinteiros procuram frestas e madeira apodrecida.",
  };
  function vila(run) {
    const v = (run.vila ||= { obras: {}, marcas: [] });
    for (const id of run.construcoes)
      if (Object.hasOwn(obras, id) && !Object.hasOwn(v.obras, id))
        v.obras[id] = { nivel: 1, rodada: run.rodada, dano: 0, caminho: null, projeto: null };
    // A escolha anterior permanece; carregar não concede melhorias.
    if (v.obras.moinho && run.sistemas?.especializacao) {
      v.obras.moinho.caminho = run.sistemas.especializacao;
    }
    return v;
  }
  function vilaValida(v, run) {
    if (
      !Array.isArray(run.construcoes) ||
      !v ||
      !v.obras ||
      typeof v.obras !== "object" ||
      Array.isArray(v.obras) ||
      !Array.isArray(v.marcas) ||
      (v.relato !== undefined && (typeof v.relato !== "string" || v.relato.length > 1000))
    )
      return false;
    return (
      Object.entries(v.obras).every(
        ([id, o]) =>
          Object.hasOwn(obras, id) &&
          run.construcoes.includes(id) &&
          o &&
          [1, 2, 3].includes(o.nivel) &&
          [0, 1, 2].includes(o.dano) &&
          Number.isSafeInteger(o.rodada) &&
          o.rodada >= 1 &&
          o.rodada <= run.rodada &&
          [
            null,
            ...(id === "moinho"
              ? ["comunitario", "comercial"]
              : id === "ponte"
                ? ["comercio", "guarda"]
                : []),
          ].includes(o.caminho) &&
          (id !== "ponte" || o.nivel === 3 || o.caminho === null) &&
          (id !== "moinho" || o.caminho === (run.sistemas?.especializacao || null)) &&
          (o.projeto === null ||
            (o.projeto &&
              (o.projeto.tipo !== "melhorar" || (o.nivel < 3 && o.dano === 0)) &&
              (o.projeto.tipo !== "reparar" || o.dano > 0) &&
              ["melhorar", "reparar"].includes(o.projeto.tipo) &&
              Number.isSafeInteger(o.projeto.inicio) &&
              o.projeto.inicio >= 1 &&
              o.projeto.inicio <= run.rodada)),
      ) &&
      v.marcas.every(
        (m) =>
          m &&
          ["festa", "destrocos"].includes(m.tipo) &&
          Number.isSafeInteger(m.fim) &&
          m.fim >= 1 &&
          m.fim <= run.rodada + 5,
      )
    );
  }
  function ativa(run, id) {
    return run.construcoes.includes(id) && (run.vila?.obras?.[id]?.dano || 0) < 2;
  }
  function nivelObra(run, id) {
    if (!ativa(run, id)) return 0;
    const o = run.vila?.obras?.[id];
    return Math.max(1, (o?.nivel || 1) - (o?.dano || 0));
  }
  function bonusObras(run, tipo, rodada = run.rodada) {
    const n = (id) => Math.max(0, nivelObra(run, id) - 1);
    if (tipo === "cura")
      return n("moinho") + n("capela") + (run.atributos.hp < 60 ? n("enfermaria_ervateira") : 0);
    if (tipo === "defesa")
      return (
        n("muralha") +
        n("torre_vigia") +
        n("celeiro") +
        (ativa(run, "ponte") && run.vila?.obras.ponte?.caminho === "guarda" ? 2 : 0)
      );
    if (tipo === "desconto") return n("forja");
    if (tipo === "habitantes") return rodada % 3 === 0 ? n("cisterna_comunitaria") : 0;
    if (tipo === "renda")
      return (
        (rodada % 5 === 0 ? n("mercado_coberto") : 0) +
        (rodada % 2 === 0 ? n("entreposto_comercial") : 0) +
        (rodada % 6 === 0 ? n("praca_forca") : 0) +
        (rodada % 3 === 0 && run.atributos.habitantes >= 20 ? n("ponte") : 0) +
        (rodada % 3 === 0 && ativa(run, "ponte") && run.vila?.obras.ponte?.caminho === "comercio" ? 1 : 0)
      );
    return 0;
  }
  function custoObra(o) {
    return o.nivel === 1 ? 6 : 10;
  }
  function faltaObra(run, id, acao) {
    const o = vila(run).obras[id];
    if (!o) return "A construção aparece em encontros da vila; ainda não foi erguida.";
    if (run.status !== "ativa" || run.fase !== "escolha" || run.encontroLeste)
      return "Retome uma carta comum antes de iniciar uma obra.";
    if (acao === "concluir")
      return !o.projeto
        ? "Nenhum trabalho em andamento."
        : o.projeto.tipo === "melhorar" && o.dano
          ? "O ataque interrompeu os trabalhos. Organize um reparo."
          : run.rodada - o.projeto.inicio < 3
            ? `Faltam ${3 - run.rodada + o.projeto.inicio} dias de trabalho.`
            : "";
    if (o.projeto) return "Conclua o trabalho em andamento.";
    if (acao === "reparar" || acao === "mutirao")
      return !o.dano
        ? "Esta obra não precisa de reparo."
        : acao === "reparar" && run.atributos.gold < 4
          ? `Faltam ${4 - run.atributos.gold} Gold.`
          : "";
    if (o.dano) return "Repare os danos antes de melhorar.";
    if (o.nivel >= 3) return "Esta obra já chegou ao nível 3.";
    if (run.rodada - o.rodada < 6) return `Faltam ${6 - run.rodada + o.rodada} dias para melhorar.`;
    if (acao === "melhorar" && run.atributos.gold < custoObra(o))
      return `Faltam ${custoObra(o) - run.atributos.gold} Gold.`;
    return "";
  }
  function executarObra(run, id, acao, caminho = null) {
    if (
      !Object.hasOwn(obras, id) ||
      !["melhorar", "historia", "reparar", "mutirao", "concluir"].includes(acao) ||
      faltaObra(run, id, acao)
    )
      return false;
    const o = vila(run).obras[id];
    if (acao === "historia" || acao === "mutirao") {
      o.projeto = { tipo: acao === "historia" ? "melhorar" : "reparar", inicio: run.rodada };
      vila(run).relato =
        `${historiasObras[id]} O trabalho fica pronto em três dias; volte ao mapa para concluí-lo.`;
      return true;
    }
    const melhorar = acao === "melhorar" || (acao === "concluir" && o.projeto.tipo === "melhorar");
    if (melhorar && o.nivel === 2 && ["ponte", "moinho"].includes(id)) {
      if (!(id === "ponte" ? ["comercio", "guarda"] : ["comunitario", "comercial"]).includes(caminho))
        return false;
      if (o.caminho && o.caminho !== caminho) return false;
      o.caminho = caminho;
      if (id === "moinho") {
        estado(run).especializacao = caminho;
        if (!estado(run).concluidas.includes("moinho_especializacao"))
          estado(run).concluidas.push("moinho_especializacao");
        delete estado(run).esperas.moinho_especializacao;
      }
    }
    if (acao === "melhorar") run.atributos.gold -= custoObra(o);
    if (acao === "reparar") run.atributos.gold -= 4;
    if (melhorar) o.nivel++;
    else o.dano = 0;
    o.rodada = run.rodada;
    o.projeto = null;
    vila(run).relato =
      `Obra concluída: ${obras[id][0]}. ${melhorar ? `Agora está no nível ${o.nivel}.` : "Os benefícios voltam a funcionar."}`;
    return true;
  }
  function danificar(run) {
    const v = vila(run);
    const id = Object.keys(obras).find((id) => v.obras[id] && v.obras[id].dano < 2);
    if (!id) return null;
    v.obras[id].dano++;
    v.obras[id].projeto = null;
    v.relato = `${obras[id][0]} sofreu danos. Os trabalhos em andamento pararam; o mapa oferece reparo com Gold ou ajuda dos moradores.`;
    v.marcas = [
      ...v.marcas.filter((m) => m.tipo !== "destrocos"),
      { tipo: "destrocos", fim: run.rodada + 5 },
    ];
    return id;
  }
  function estado(run) {
    return (run.sistemas ||= {
      esperas: {},
      concluidas: [],
      ultimaContinuacao: 0,
      especializacao: null,
      vinculos: {},
      obtidos: {},
      variantes: {},
      estacaoVista: `${J.anoDaRodada(run.rodada)}:${run.estacao}`,
      transicao: null,
      intervencao: null,
    });
  }
  function valido(s, rodada) {
    const objeto = (v) => v && typeof v === "object" && !Array.isArray(v);
    const marco = (v) => Number.isSafeInteger(v) && v >= 1 && v <= rodada;
    return (
      objeto(s) &&
      objeto(s.esperas) &&
      Object.entries(s.esperas).every(([id, v]) => piloto.includes(id) && marco(v)) &&
      Array.isArray(s.concluidas) &&
      s.concluidas.every((id) => piloto.includes(id)) &&
      Number.isSafeInteger(s.ultimaContinuacao) &&
      s.ultimaContinuacao >= 0 &&
      s.ultimaContinuacao <= rodada &&
      [null, "comunitario", "comercial"].includes(s.especializacao) &&
      objeto(s.vinculos) &&
      Object.entries(s.vinculos).every(
        ([id, v]) => animais.includes(id) && ["recusado", "ativo", "usado"].includes(v),
      ) &&
      objeto(s.obtidos) &&
      Object.entries(s.obtidos).every(([id, v]) => [...animais, "moinho"].includes(id) && marco(v)) &&
      objeto(s.variantes) &&
      Object.entries(s.variantes).every(
        ([id, v]) =>
          Object.hasOwn(lotes, id) &&
          objeto(v) &&
          marco(v.rodada) &&
          J.estacoes.includes(v.estacao) &&
          Number.isSafeInteger(v.habitantes) &&
          v.habitantes >= 0 &&
          Number.isSafeInteger(v.gold) &&
          v.gold >= 0 &&
          typeof v.obra === "boolean",
      ) &&
      typeof s.estacaoVista === "string" &&
      (s.transicao === null || typeof s.transicao === "string") &&
      (s.intervencao === null || typeof s.intervencao === "string")
    );
  }
  const novos = [
    {
      id: "estandarte_do_barao",
      nome: "Estandarte do Barão",
      descricao:
        "Permite dispensar uma cobrança militar numa carta de soldados. O estandarte é entregue nessa decisão.",
      tipo: "passivo",
      aoReceber: {},
      guardarAposReceber: true,
    },
    {
      id: "relicario_do_silencio",
      nome: "Relicário do silêncio",
      descricao:
        "Permite recusar a cobrança da chama, a obra de ossos ou a oferenda do cálice no pântano sem perder recursos. Entregue o relicário nessa decisão; não recebe a recompensa da oferenda.",
      tipo: "passivo",
      aoReceber: {},
      guardarAposReceber: true,
    },
    {
      id: "lamina_da_lagoa",
      nome: "Lâmina da lagoa",
      descricao:
        "Concede +6 Ataque e cobra 10 de Vida ao recebê-la. A ferida pode matar; a arma permanece nesta crônica.",
      tipo: "equipamento",
      aoReceber: { ataque: 6, hp: -10 },
    },
  ];
  J.itens.push(...novos.map((i) => ({ ...i, texto: i.nome, categoria: "relíquia", raridade: "lendario" })));
  Object.assign(
    J.itens.find((i) => i.id === "pocao_cura_grande"),
    { mercador: true, preco: 8, aumentoPreco: 2 },
  );
  function carta(id, titulo, texto, informacoes, opcoes, requisitos = {}) {
    return {
      id,
      titulo,
      texto,
      informacoes,
      opcoes,
      requisitos,
      tipo: "encontro",
      peso: 1,
      oncePerRun: true,
      sistemaContinuacao: true,
      imagem: "assets/vila.webp",
      imagemAlt: "Casas e caminhos da vila",
    };
  }
  J.registrarEventos(
    carta(
      "moinho_especializacao",
      "O destino da farinha",
      "O moinho voltou a trabalhar. Agora os padeiros discutem o destino da produção.",
      "A função escolhida vale até o fim da crônica. O moinho mantém a cura original de 1 Vida por dia.",
      [
        {
          id: "comunitario",
          texto: "Reservar farinha para as casas · 3 Gold; +1 Vida por dia.",
          requisitos: { goldMin: 3 },
          efeitos: { gold: -3 },
          sistemaEspecializacao: "comunitario",
          resultado: "Uma parte da farinha passa a abastecer as famílias.",
        },
        {
          id: "comercial",
          texto: "Vender a produção · 3 Gold; +1 Gold a cada 5 dias.",
          requisitos: { goldMin: 3 },
          efeitos: { gold: -3 },
          sistemaEspecializacao: "comercial",
          resultado: "O moleiro separa sacos para as caravanas.",
        },
        {
          id: "recusar",
          texto: "Manter o moinho como está.",
          resultado: "Cada família continua levando seu próprio grão.",
        },
      ],
    ),
  );
  const cenas = {
    cao_companheiro: [
      "O cão não recua",
      "Durante a ronda, seu cão se coloca entre você e um javali.",
      "O vínculo reduz em 8 o primeiro dano de combate de pelo menos 12 pontos, depois das proteções. Uma intervenção por crônica; a redução passiva de 2 continua.",
    ],
    corvo_companheiro: [
      "O caminho do corvo",
      "O corvo deixa uma moeda diante da sua porta e espera que você o siga.",
      "O vínculo abre uma busca de suprimentos na carroça atolada ou no livro das rações. Uma busca por crônica, com ganho de 4 Gold; a passiva original continua.",
    ],
    gato_companheiro: [
      "O gato à cabeceira",
      "O gato passa a noite junto dos doentes e volta para sua cama ao amanhecer.",
      "Com o vínculo, recupera mais 1 Vida por dia enquanto sua Vida estiver abaixo da metade. A cura original continua.",
    ],
  };
  for (const id of animais) {
    const [titulo, texto, informacoes] = cenas[id];
    J.registrarEventos(
      carta(
        `vinculo_${id}`,
        titulo,
        texto,
        informacoes,
        [
          {
            id: "aceitar",
            texto: "Cuidar do companheiro e fortalecer o vínculo.",
            sistemaVinculo: id,
            resultado: "O animal passa a reconhecer seus gestos e permanece ao seu lado.",
          },
          {
            id: "recusar",
            texto: "Continuar com os cuidados habituais.",
            sistemaRecusaVinculo: id,
            resultado: "O companheiro mantém os hábitos que já tinha.",
          },
        ],
        { itensPermanentes: [id] },
      ),
    );
  }
  for (const chefe of ["barao", "abissal"]) {
    const item = J.itens.find((i) => i.id === trofeus[chefe]);
    J.registrarEventos(
      carta(
        `heranca_${chefe}`,
        chefe === "barao" ? "A bandeira recolhida" : "O ferro sob a água",
        chefe === "barao"
          ? "Um soldado traz a bandeira do Barão que sua linhagem derrotou."
          : "Um pescador encontra uma lâmina onde seu antepassado enfrentou o senhor da lagoa.",
        `${item.descricao} O troféu anterior permite este encontro; o item só entra em sua posse se você aceitar.`,
        [
          {
            id: "aceitar",
            texto: `Receber ${item.nome}${chefe === "abissal" ? " · perde 10 Vida" : ""}.`,
            itens: [item.id],
            resultado: "O objeto passa às mãos do novo herdeiro.",
          },
          {
            id: "recusar",
            texto: "Deixar o objeto com quem o encontrou.",
            resultado: "A notícia da vitória permanece, mesmo sem o troféu.",
          },
        ],
        { flagsLegado: [marcas[chefe]] },
      ),
    );
  }
  const piloto = [
    ...cadeias,
    "moinho_especializacao",
    ...animais.map((id) => `vinculo_${id}`),
    "heranca_barao",
    "heranca_abissal",
  ];
  function elegivel(run, id) {
    const e = J.eventoPorId(id),
      s = estado(run);
    if (!e || s.concluidas.includes(id) || !J.engine.cumpre(e.requisitos, run)) return false;
    if (id === "moinho_especializacao") return ativa(run, "moinho") && !s.especializacao;
    return !run.flags[`${id}_visto`];
  }
  function atualizar(run) {
    const s = estado(run);
    vila(run);
    for (const id of animais) if (posse(run, id) && !s.obtidos[id]) s.obtidos[id] = run.rodada;
    if (run.construcoes.includes("moinho") && !s.obtidos.moinho) s.obtidos.moinho = run.rodada;
    for (const id of piloto) {
      if (!elegivel(run, id)) {
        delete s.esperas[id];
        continue;
      }
      if (!s.esperas[id]) s.esperas[id] = run.rodada;
    }
  }
  function filtrar(run, candidatos) {
    atualizar(run);
    const s = estado(run);
    let lista = candidatos.filter(
      (e) =>
        !piloto.includes(e.id) ||
        (elegivel(run, e.id) && run.rodada - s.esperas[e.id] >= 6 && run.rodada - s.ultimaContinuacao > 1),
    );
    if (
      lista.some(
        (e) => e.forcarSorteioQuandoElegivel || (e.intervaloRodadas && run.rodada % e.intervaloRodadas === 0),
      )
    )
      return lista;
    const vencidas = lista
      .filter((e) => piloto.includes(e.id) && run.rodada - s.esperas[e.id] >= 12)
      .sort((a, b) => s.esperas[a.id] - s.esperas[b.id] || piloto.indexOf(a.id) - piloto.indexOf(b.id));
    if (vencidas.length) lista = [vencidas[0]];
    return lista;
  }
  function peso(run, evento) {
    const inicio = estado(run).esperas[evento.id];
    return inicio ? 1 + Math.max(0, run.rodada - inicio - 6) : 1;
  }
  // O lote sazonal compartilha as oito cartas do lote da vila.
  const lotes = {
    ponte_partida: {
      estacao: "primavera",
      obra: "ponte",
      recurso: "tábuas para a travessia",
      verbo: "Reforçar a travessia com as reservas da ponte",
    },
    poco_duas_aldeias: {
      estacao: "primavera",
      obra: "cisterna_comunitaria",
      recurso: "água para as duas aldeias",
      verbo: "Abastecer as aldeias pela cisterna",
    },
    seca: {
      estacao: "verao",
      obra: "cisterna_comunitaria",
      recurso: "água para as casas",
      verbo: "Abrir a cisterna aos moradores",
    },
    cisterna_rachada: {
      estacao: "verao",
      obra: "ponte",
      recurso: "água trazida pela estrada",
      verbo: "Trazer água pela ponte da vila",
    },
    colheita: {
      estacao: "outono",
      obra: "moinho",
      recurso: "farinha para as casas",
      verbo: "Distribuir a farinha do moinho",
    },
    livro_das_racoes: {
      estacao: "outono",
      obra: "moinho",
      recurso: "sacos de farinha contados",
      verbo: "Conferir os estoques com o moleiro",
    },
    enfermaria_sem_lenha: {
      estacao: "inverno",
      obra: "celeiro",
      recurso: "mantimentos para os doentes",
      verbo: "Abastecer os doentes pelo celeiro",
    },
    ultima_vigilia: {
      estacao: "inverno",
      obra: "celeiro",
      recurso: "mantimentos para a vigília",
      verbo: "Abrir o celeiro durante a vigília",
    },
  };
  function opcoes(run, evento, base) {
    let extra = null;
    const lote = lotes[evento.id],
      s = estado(run);
    if (lote) {
      const v =
        s.variantes[evento.id]?.rodada === run.rodada
          ? s.variantes[evento.id]
          : {
              estacao: run.estacao,
              habitantes: run.atributos.habitantes,
              gold: run.atributos.gold,
              obra: ativa(run, lote.obra),
            };
      const sazonal = v.estacao === lote.estacao;
      if (v.obra)
        extra = {
          texto: `${lote.verbo} · ${sazonal ? "+5" : "+3"} habitantes.`,
          efeitos: { habitantes: sazonal ? 5 : 3 },
        };
      else if (v.habitantes >= 60 && v.gold >= 2)
        extra = {
          texto: `Organizar um mutirão para obter ${lote.recurso} · 2 Gold.`,
          requisitos: { habitantesMin: 60, goldMin: 2 },
          efeitos: { gold: -2, habitantes: sazonal ? 5 : 3, honra: 1 },
        };
      else if (v.habitantes <= 25)
        extra = {
          texto: `Negociar ajuda para as poucas casas · +${sazonal ? 4 : 2} habitantes.`,
          requisitos: { habitantesMax: 25 },
          efeitos: { habitantes: sazonal ? 4 : 2 },
        };
      else
        extra = {
          texto: `Organizar turnos para obter ${lote.recurso} · 2 Vida; +3 habitantes.`,
          efeitos: { hp: -2, habitantes: 3 },
        };
      extra = {
        id: "sistema_vila",
        resultado: `A vila reúne ${lote.recurso}${sazonal ? "; a estação favorece o trabalho" : ""}.`,
        ...extra,
      };
      if (evento.id === "colheita" && ativa(run, "moinho") && s.especializacao === "comercial")
        extra = {
          id: "sistema_vila",
          texto: "Vender a farinha pela rota do moinho comercial · +5 Gold.",
          efeitos: { gold: 5 },
          resultado: "O moleiro vende o excedente aos compradores da estrada.",
        };
    }
    if (
      ["carroca_atolada", "livro_das_racoes"].includes(evento.id) &&
      posse(run, "corvo_companheiro") &&
      s.vinculos.corvo_companheiro === "ativo"
    )
      extra = {
        id: "busca_corvo",
        texto: "Seguir o corvo até os suprimentos · +4 Gold; encerra a ajuda do vínculo.",
        efeitos: { gold: 4 },
        sistemaUsaVinculo: "corvo_companheiro",
        resultado: "O corvo encontra um saco esquecido. Sua passiva de moedas continua ativa.",
      };
    if (
      ["saqueadores", "desertores", "barao", "volta_do_barao"].includes(evento.id) &&
      run.inventario.includes("estandarte_do_barao")
    )
      extra = {
        id: "usar_estandarte",
        texto: "Entregar o estandarte e dispensar a cobrança.",
        consumirItens: ["estandarte_do_barao"],
        resultado: "Os soldados reconhecem a bandeira e deixam a vila em paz.",
      };
    if (
      ["templo_de_ossos", "tributo_da_chama", "calice_no_pantano"].includes(evento.id) &&
      run.inventario.includes("relicario_do_silencio")
    )
      extra = {
        id: "usar_relicario",
        texto: "Quebrar o relicário e recusar a oferenda, sem receber sua recompensa.",
        consumirItens: ["relicario_do_silencio"],
        resultado:
          "O relicário abafa o chamado. Ninguém precisa pagar por esta recusa; o objeto oferecido fica onde estava.",
      };
    if (["mercador_sem_sombra", "espirito_da_floresta"].includes(evento.id) && posse(run, "selo_da_recusa"))
      extra = {
        id: "mostrar_selo",
        texto: "Mostrar o Selo da Recusa e seguir sem acordo.",
        resultado: "A figura reconhece o selo e não insiste.",
      };
    return extra ? [...base.slice(0, 3), extra] : base;
  }
  function resolver(contexto) {
    const { run, evento, opcao, resultado } = contexto,
      s = estado(run);
    if (piloto.includes(evento.id)) {
      if (!s.concluidas.includes(evento.id)) s.concluidas.push(evento.id);
      delete s.esperas[evento.id];
      s.ultimaContinuacao = run.rodada;
    }
    if (opcao.sistemaEspecializacao) s.especializacao = opcao.sistemaEspecializacao;
    if (opcao.sistemaVinculo) s.vinculos[opcao.sistemaVinculo] = "ativo";
    if (opcao.sistemaRecusaVinculo) s.vinculos[opcao.sistemaRecusaVinculo] = "recusado";
    if (opcao.sistemaUsaVinculo) s.vinculos[opcao.sistemaUsaVinculo] = "usado";
    if (evento.bossId && resultado.combate?.venceu) {
      const id = trofeus[evento.bossId],
        item = J.itens.find((i) => i.id === id);
      if (evento.bossId === "culto" && !posse(run, id)) J.engine.concederItem(run, id);
      if (["barao", "abissal"].includes(evento.bossId))
        resultado.texto += ` Troféu: ${item.nome}. A vitória permite um encontro de obtenção numa próxima crônica; o próximo herdeiro não começa com o item.`;
      else if (evento.bossId === "culto")
        resultado.texto += ` Você recebe ${item.nome}. Os moradores voltam a circular junto ao antigo altar; os efeitos do culto já ativos permanecem.`;
    }
    if (resultado.combate && !resultado.combate.venceu && ["saqueadores", "desertores"].includes(evento.id)) {
      const id = danificar(run);
      if (id)
        resultado.texto +=
          " A retirada danifica a construção: " + obras[id][0] + ". Consulte o mapa para reparar.";
    }
    if (evento.id === "colheita" && (opcao.efeitos?.honra || 0) > 0)
      vila(run).marcas = [
        ...vila(run).marcas.filter((m) => m.tipo !== "festa"),
        { tipo: "festa", fim: run.rodada + 5 },
      ];
    atualizar(run);
  }
  function rodada(run) {
    const s = estado(run);
    vila(run).marcas = vila(run).marcas.filter((m) => m.fim >= run.rodada);
    const chave = `${J.anoDaRodada(run.rodada)}:${run.estacao}`;
    s.transicao =
      chave !== s.estacaoVista
        ? {
            primavera: "As chuvas abrem os caminhos da primavera.",
            verao: "O verão seca a terra junto às casas.",
            outono: "O outono traz os carros de grão.",
            inverno: "O inverno fecha as portas mais cedo.",
          }[run.estacao]
        : null;
    s.estacaoVista = chave;
    J.engine.aplicarEfeitos(run, {
      hp:
        (ativa(run, "moinho") && s.especializacao === "comunitario" ? 1 : 0) +
        bonusObras(run, "cura") +
        (posse(run, "gato_companheiro") &&
        s.vinculos.gato_companheiro === "ativo" &&
        run.atributos.hp * 2 < run.hpMax
          ? 1
          : 0),
    });
  }
  function renda(run) {
    return ativa(run, "moinho") && estado(run).especializacao === "comercial" && run.rodada % 5 === 0 ? 1 : 0;
  }
  function pesoMercador(run, item) {
    if (run.atributos.hp * 2 < run.hpMax && (item.uso?.efeitos?.hp || item.aoReceber?.hp)) return 3;
    if (
      run.atributos.escudo <= 3 &&
      (item.uso?.bonusEscudoProximaBatalha || item.uso?.bloquearDanoProximaBatalha)
    )
      return 2;
    return 1;
  }
  function mercador(run, itens, aleatorio = Math.random) {
    let valor = aleatorio() * itens.reduce((s, i) => s + pesoMercador(run, i), 0);
    return itens.find((i) => (valor -= pesoMercador(run, i)) < 0) || itens.at(-1);
  }
  function proteger(run, dano, consumir = false) {
    const s = estado(run);
    if (dano < 12 || !posse(run, "cao_companheiro") || s.vinculos.cao_companheiro !== "ativo") return dano;
    if (consumir) {
      s.vinculos.cao_companheiro = "usado";
      s.intervencao =
        "O cão intercepta o golpe: 8 de dano evitados. Seu vínculo não tem outra intervenção nesta crônica.";
    }
    return Math.max(0, dano - 8);
  }
  function fontes(run, atributo) {
    const valor = atributo === "hp" ? run.hpMax : run.atributos[atributo];
    const conhecidos = [];
    for (const e of run.efeitosTemporarios || [])
      if (e.aplicado && e.atributo === atributo)
        conhecidos.push({
          nome: `Efeito temporário até o dia ${e.fimRodada}`,
          valor: e.valorAplicado ?? e.valor,
        });
    for (const [nome, e] of [
      ["Favor do Norte", run.efeitoDivino],
      ["Passiva nórdica", run.passivaNordica],
      ["Presságio", run.pressagios?.efeito],
    ]) {
      const v = e?.modificadoresAplicados?.[atributo];
      if (v) conhecidos.push({ nome, valor: v });
    }
    const permanente = valor - conhecidos.reduce((s, e) => s + e.valor, 0);
    const linhas = [
      `${atributo === "hp" ? "Vida máxima" : atributo}: ${valor}. Permanente acumulado: ${permanente} (inclui equipamentos já aplicados).`,
      ...conhecidos.map((e) => `${e.nome}: ${e.valor > 0 ? "+" : ""}${e.valor}.`),
    ];
    if (
      atributo === "ataque" &&
      run.fase === "combate" &&
      !run.combatePendente?.ehTesteDados &&
      !run.combatePendente?.ehDueloDados
    ) {
      const p = J.engine.perfilCombate(run);
      linhas.push(
        `Ataque no combate: ${p.ataque}; postura ${p.postura.nome}. Preparo de Ataque: ${run.efeitosPreparados.bonusAtaqueProximaBatalha || 0}.`,
      );
    }
    if (atributo === "escudo")
      linhas.push(
        `Preparo: ${run.efeitosPreparados.bonusEscudoProximaBatalha || 0}. Reduções de dano: cão ${posse(run, "cao_companheiro") ? 2 : 0}, muralha ${ativa(run, "muralha") ? 2 : 0}, torre ${ativa(run, "torre_vigia") ? 3 : 0}; melhorias das obras ${bonusObras(run, "defesa")}. Margem, postura e Escudo entram antes dessas reduções.`,
      );
    if (atributo === "hp")
      linhas.push(
        `Cura diária: moinho ${ativa(run, "moinho") ? 1 : 0}; gato ${run.inventario.includes("gato_companheiro") ? 1 : 0}; especialização comunitária ${ativa(run, "moinho") && estado(run).especializacao === "comunitario" ? 1 : 0}. Melhorias das obras: +${bonusObras(run, "cura")}. Enfermaria ativa: +${ativa(run, "enfermaria_ervateira") && run.atributos.hp < 60 ? 1 : 0}; vínculo do gato: +1 abaixo da metade. Maldições de cura aplicam sua redução depois.`,
      );
    if (atributo === "gold")
      linhas.push(
        `Próxima renda: ${J.engine.preverRenda(run).total}. Moinho comercial: +1 a cada 5 dias quando especializado.`,
      );
    return linhas.join(" ");
  }
  function abrirCarta(run, evento) {
    const s = estado(run),
      lote = lotes[evento.id];
    if (lote)
      s.variantes[evento.id] = {
        rodada: run.rodada,
        estacao: run.estacao,
        habitantes: run.atributos.habitantes,
        gold: run.atributos.gold,
        obra: ativa(run, lote.obra),
      };
  }
  function descricaoVinculo(run, id) {
    const valor = estado(run).vinculos[id];
    if (valor === "recusado") return "Vínculo recusado; a habilidade original permanece.";
    if (valor === "usado") return "Ajuda do vínculo já utilizada; a habilidade original permanece.";
    if (valor !== "ativo") return "Aguardando encontro de vínculo.";
    return {
      cao_companheiro:
        "Vínculo: reduz em 8 o primeiro golpe de combate com pelo menos 12 de dano após as proteções. Uma intervenção disponível.",
      corvo_companheiro:
        "Vínculo: uma busca de suprimentos na carroça atolada ou no livro das rações, por 4 Gold.",
      gato_companheiro: "Vínculo: +1 de cura diária enquanto sua Vida estiver abaixo da metade.",
    }[id];
  }
  J.sistemas = {
    obras,
    historiasObras,
    vila,
    vilaValida,
    ativa,
    nivelObra,
    bonusObras,
    custoObra,
    faltaObra,
    executarObra,
    danificar,
    estado,
    valido,
    atualizar,
    filtrar,
    peso,
    opcoes,
    resolver,
    rodada,
    renda,
    mercador,
    pesoMercador,
    proteger,
    fontes,
    abrirCarta,
    descricaoVinculo,
    animais,
    cadeias,
    piloto,
    lotes,
  };
})();
