# Revisão de 11 de novembro de 2026

O controlador agora permite acionar controles durante a digitação sem consumir o clique. A seleção de herdeiro também funciona no primeiro toque; no celular, as informações ficam visíveis no próprio retrato. O botão de texto automático pausa e retoma a digitação imediatamente, guarda a preferência no navegador e permite concluir a leitura por interação.

Escolhas bloqueadas por recursos usam um único botão desabilitado com o motivo escrito. Requisitos de Honra continuam filtrando as opções narrativas; não entram na lista de bloqueios de recursos. A ordem sorteada permanece, e opções comuns que se tornam elegíveis durante a carta voltam a funcionar, inclusive em salvamentos anteriores.

As construções aparecem sobre fundo preto, com nome e benefício. Selecionar uma obra abre seus detalhes e a ação com o custo original. O painel de construções existentes usa a mesma apresentação compacta. Nenhum custo ou efeito mudou.

A interface de combate ganhou ajuda pelo símbolo “?”, sem moldura. Os ícones de espada acompanham o texto da escolha; derrotas mostram o dano recebido sem repetir toda a decomposição numérica. As consequências usam números maiores, enquanto os indicadores numéricos antigos de Vida e Honra deixaram de aparecer. O impacto visual no retrato permanece.

Crônicas ordenam os registros pela rodada e distinguem acontecimento, escolha e consequência. A tela de morte destaca retrato, nome e causa; mantém o histórico recolhido e a confirmação de gravação do legado. O efeito de presságio deixou de repetir uma mensagem acima do herdeiro. Bênçãos mostram a divindade e os valores aplicados; o toque abre os detalhes.

O chamado do culto aparece como texto de tensão seguido de “Continuar”, preservando a transição existente. Apenas Baltazar, identificado pelo ID `herdeiro_culto`, recebe a escolha “Aceitar a vontade do seu mestre” no encontro `lider_culto`. Outros herdeiros mantêm as opções desse encontro.

A Mão do Destino revela as chances dos testes de d20, duelos e testes de sorte. Para dados, a leitura informa a probabilidade por rolagem, considerando quantidade de dados, seleção da maior face, Dado viciado e resultados naturais. Usa os cálculos existentes, não consome aleatoriedade e não exibe percentuais para escolhas determinísticas. As rerrolagens já concedidas pela habilidade permanecem.

Chefes aguardam a rodada 26, após a primeira estação. O filtro cobre o baralho, a agenda e a recusa fatal à Entidade; confrontos adiados permanecem na agenda. O debug continua permitindo abrir chefes para teste. Vida, Defesa, dano e recompensas dos chefes não mudaram.

Não encontrei a fórmula proporcional de dano citada no pedido, nem nos documentos nem nas revisões consultadas do Git. O código atual soma Ataque à rolagem, não ao dano por acerto no chefe. A proporção `0.2` encontrada pertence ao escalonamento da Defesa inimiga. Mantive esses cálculos; um teste confirma que acrescentar 16 ao Ataque não acrescenta 16 ao dano fixo do chefe. Uma alteração adicional depende da fórmula anterior.

O Barão, o líder do culto e o Abissal receberam bustos próprios. A revisão do líder tem olhos arregalados e sorriso com dentes, conforme o pedido posterior. Os arquivos usam WebP, qualidade 90, maior lado de 800 px e transparência; os PNGs permanecem como fonte. A Entidade não mudou. O usuário adiou os retratos dos herdeiros: as propostas ficam somente em `docs/previas/herdeiros-adiados/`, sem uso pela interface.

| Arquivos | Alterações |
| --- | --- |
| `js/main.js`, `js/ui.js` | Interação, leitura, escolhas, construções, combate, bênçãos, crônicas e morte. |
| `js/engine.js`, `js/state.js` | Elegibilidade, probabilidades e progressão de chefes. |
| `js/events-bosses.js` | Referências das artes e consumo da agenda do confronto com a Entidade. |
| `css/style.css`, `index.html` | Composição, controles, responsividade e versão dos recursos. |
| `tests/refinamento.test.cjs`, `tests/herdeiros-prioritarios.test.cjs` | Regressões e atualização de expectativas antigas; Escudo da Bruxa permanece −1. |
| `assets/chefes/`, `assets/prompts/refinamento-elenco.json` | PNGs, WebPs e prompts do gerador integrado `image_gen`. |
| `docs/ARTES-ELENCO-VALIDACAO.json`, `docs/MEMORIA-ILUSTRACOES.md` | Validação das artes e decisões posteriores do usuário. |

Validação: 62 testes passaram nos arquivos de interface, controlador, posturas, herdeiros prioritários e refinamento. ESLint passou. Prettier passou nos arquivos alterados; a verificação global ainda aponta 25 arquivos anteriores fora do padrão, que esta revisão não reformatou. O diff não tem erros de espaços.

No Edge, a conferência em 1440, 768 e 390 px não encontrou imagens quebradas, erros de JavaScript ou rolagem horizontal. Cliques reais pelo navegador confirmaram a escolha e a seleção de herdeiro no primeiro gesto. As capturas também cobrem construções e morte. Dados das artes confirmam alfa transparente e resolução dos chefes. A direção visual consultada foi True-black flat, semente 1328677956; a paleta e a tipografia existentes prevaleceram, assim como as molduras e animações próprias das cartas do jogo.

- [x] Examinar código, documentação e histórico relacionado ao balanceamento.
- [x] Corrigir cliques, controle de texto e apresentação dos bloqueios.
- [x] Ampliar a leitura de probabilidades e limitar encontros precoces com chefes.
- [x] Refinar as interfaces e integrar as artes dos chefes, preservando a Entidade.
- [x] Executar testes, lint e conferência visual no navegador.
- [ ] Alterar o dano proporcional: falta localizar a fórmula anterior.
- [ ] Retomar e aprovar as artes dos herdeiros, adiadas pelo usuário; testar em aparelho móvel físico.

Resultado: correções funcionais e interfaces revistas, com 62 testes aprovados. A fórmula de dano e os retratos dos herdeiros permanecem pendentes; a conferência móvel usou emulação no navegador.
