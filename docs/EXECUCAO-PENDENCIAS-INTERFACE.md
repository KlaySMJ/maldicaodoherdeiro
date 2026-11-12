# Correções da interface e do mapa

Data: 12 de novembro de 2026. Base Git: `2f39e3c`, com alterações locais.

Executei as correções levantadas na [auditoria](AUDITORIA-INTERFACE-E-CONSTRUCOES.md). Durante a execução, o autor pediu a retirada da lista de obras e dos textos inferiores mostrados na captura; o mapa atual conserva somente o cenário e o painel da construção selecionada.

## Mapa e construções

O cenário usa SVG em preto e marfim. Construções ainda não erguidas aparecem em contorno; as existentes ganham corpo, caminhos e partes adicionais ao evoluir. Uma obra danificada mostra rachaduras; a interrupção completa mostra ruínas. O inverno traz neve e árvores sem folhas, o outono deixa folhas pelo chão, a primavera mostra brotos e o verão mantém os campos. Enfeites e destroços aparecem somente enquanto a marca do save está vigente.

Os edifícios recebem clique, toque e teclado. Ao selecionar uma obra, o painel apresenta efeito atual, caminho definitivo e ações válidas. No celular, o jogador move o mapa dentro de sua própria área, mantendo os nomes legíveis; a página não ganha rolagem horizontal. Redesenhar a interface conserva a posição consultada.

A falta de Gold pertence à melhoria ou ao reparo pago. A alternativa comunitária continua utilizável sem saldo; bloqueios comuns, como espera ou fase de combate, aparecem uma vez. Obras danificadas priorizam reparação. As histórias dos artesãos permanecem no painel durante o trabalho; a lista inferior, o aviso de conclusão e o rodapé foram retirados.

## Controles e ajuda

Botões, escolhas, posturas e campos voltaram a usar as cores da base existente. A ajuda perdeu a seta decorativa e os títulos repetidos. O tutorial geral passou a explicar o mapa e a espera dos trabalhos; seu acesso durante uma batalha abre a ajuda de combate.

Escolhas bloqueadas usam um único componente consultável. O motivo fica legível antes da abertura; clique, hover, toque ou teclado permitem consultar a explicação sem executar a escolha. Honra e flags narrativas continuam ocultas. A velocidade escolhida também permanece válida na sessão quando o navegador impede a gravação.

## Informações de combate e encerramento

| Correção | Resultado verificado |
| --- | --- |
| Proteção do cão na prévia | A tela prevê 14 de dano e 106 de Vida; a confirmação aplica esses valores e consome a intervenção uma vez. |
| Penalidade adicional dos javalis | O golpe informa 20 de dano; o saldo mostra a perda total de 24 de Vida, incluindo a penalidade. |
| Troféu do Barão | A tela final apresenta o Estandarte fora do histórico recolhido e explica seu encontro em outra crônica. |
| Falha ao salvar o legado | O encerramento condiciona o desbloqueio à gravação; não anuncia que o item já pertence ao próximo herdeiro. |

## Arquivos e verificação

`js/sistemas-ui.js` concentra o desenho e a consulta das obras. `css/mapa-vila.css` substitui as regras antigas do mapa; `css/interface.css` recupera as cores dos controles. `js/ui.js`, `js/main.js` e o filtro de requisitos em `js/engine.js` tratam os demais ajustes. A versão dos recursos em `index.html` mudou para `20261112-75`.

Os 55 testes direcionados passaram, incluindo seis regressões novas. O lint passou em `js`, `tests` e no roteiro de navegador; o Prettier passou nos arquivos alterados. O Edge verificou 1366 × 768 e 390 × 844 nos controles, além de cenários do mapa em 1440, 768 e 390 px. Conferiu níveis, danos, estações, consulta por teclado e toque, pagamento único e ausência da lista inferior. O roteiro também verificou fila após recarga, oferta persistida do mercador, especialização e vínculo, origem de bônus, vitória contra o Barão e apresentação dos encerramentos. A preferência de movimento reduzido desativou as duas animações de fundo.

As capturas de cartas curtas e longas e do mapa usaram uma largura CSS equivalente a zoom de 150% em 1440 px, sem rolagem horizontal da página. Isso não representa uma verificação em celular físico. O inspetor genérico da skill terminou com `CDP timeout: Page.enable`; o roteiro próprio do projeto abriu o Edge e gerou as capturas.

A suíte completa inicial executou 281 testes: 267 passaram e 14 falharam. Atualizei a expectativa antiga de bloqueio para o novo componente; esse teste passou na rodada direcionada. As outras 13 falhas também ocorreram com os fontes de `HEAD`, carregados por um leitor isolado, sem substituir os arquivos de trabalho. Elas envolvem catálogo, expectativas de conquistas e regras anteriores de combate ou traços. A suíte completa continua com pendências; esses resultados não constituem aprovação global.

Os relatórios atualizados estão em [interface](AUDITORIA-INTERFACE-VALIDACAO.json) e [cenários determinísticos](AUDITORIA-PLANO-VALIDACAO.json). As capturas e logs ficam em `.taste-skill/qa/sistemas/`; as prévias selecionadas estão em [computador](previas/mapa-vila-desktop.png) e [celular](previas/mapa-vila-mobile.png).

Não executei novas simulações aleatórias. O balanceamento em partidas completas e a fórmula proporcional anterior não receberam alterações sem referência. Os retratos adiados permanecem como estavam.

## Checklist da execução

- [x] Refazer o cenário com níveis, danos, estações e marcas temporárias.
- [x] Retirar a lista e o rodapé indicados pelo autor, mantendo seleção nas construções.
- [x] Corrigir controles, requisitos e tutoriais.
- [x] Corrigir prévia do cão, saldo de Vida, troféus e preferência sem armazenamento.
- [x] Executar testes direcionados, lint, formatação e conferência no Edge.
- [ ] Avaliar partidas completas, testar em aparelho físico e observar animações por períodos mais longos.
- [ ] Resolver as 13 falhas anteriores e localizar a fórmula proporcional antes de rever esse cálculo; as artes dos herdeiros seguem adiadas.

Resultado: correções de implementação entregues, com 55 testes direcionados aprovados e os cenários de navegador descritos acima. Permanecem abertas as verificações manuais e as pendências anteriores listadas na checklist.
