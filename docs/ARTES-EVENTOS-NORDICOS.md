# Artes dos oito novos eventos nórdicos

Produção de 6 de novembro de 2026 pelo gerador de imagens integrado (`image_gen`). As imagens usam referências visuais do projeto e as referências de personagem enviadas pelo usuário; não houve geração pela API ou pelo CLI.

## Referência e arquivos finais

Thor, em `assets/eventos-especiais/norte-thor.webp`, define o traço e a cor deste conjunto. As primeiras propostas mais amareladas não são os arquivos integrados. Os finais preservam a proporção e a transparência, usam WebP com qualidade 90 e têm maior lado de 800 px.

| Entidade | Arquivo em `assets/eventos-especiais/` | Composição final |
| --- | --- | --- |
| Baldr | `norte-baldr.webp` | Barba, cabelo comprido, torso à mostra, capa e bastão com ramo, conforme a gravura enviada. |
| Frigg | `norte-frigg.webp` | Cabelos soltos, vestido drapeado, capa e roca alta, conforme a gravura enviada. |
| Heimdall | `norte-heimdall.webp` | Elmo com chifres curvos, couraça decorada, malha, capa e chifre de sopro, conforme a estatueta enviada. |
| Freyr | `norte-freyr.webp` | Busto esguio, torso à mostra, cabelo longo, barba em duas tranças, coroa de folhas e manto; sem espigas, conforme a nova referência enviada. |
| Jormungand | `norte-jormungand.webp` | Serpente circular mordendo a cauda e envolvendo uma árvore, conforme a referência enviada. |
| Fenrir | `norte-fenrir.webp` | Lobo visto de frente, olhar sinistro, focinho comprido e corrente rompida; sem anatomia humanoide. |
| Hrym | `norte-hrym.webp` | Gigante de corpo robusto, barba volumosa, elmo, peles e machado, conforme a figura central do quadrinho enviado. |
| Níðhöggr | `norte-nidhogg.webp` | Dragão de cabeça estreita, chifres longos, espinhos, garras e asas de membrana, conforme a última referência enviada. |

## Diretrizes dos prompts finais

Instrução comum de estilo e saída, aplicada a cada imagem:

> Create one standalone game event illustration. Use the existing Thor card as the primary drawing and color reference: bold irregular black ink contours, expressive simplified forms, flat pale ivory fills, solid black shadows and economical diagonal woodcut hatching. Match Thor's light areas near RGB 247/230/201. No overall yellow, orange, brown or sepia wash; gold only in a small clasp or eye. Preserve a readable silhouette, complete subject and clear margins. Genuine alpha-transparent background, no rectangle, page, scenery, frame, text, logo or watermark. No photorealism, painterly gradients, 3D or anime.

Complementos de personagem e composição usados na revisão final:

- **Baldr:** preservar o rosto masculino maduro, cabelo longo ondulado, barba cheia, torso à mostra, capa presa ao pescoço e bastão com folhas da versão baseada na gravura. Refazer acabamento e cor com Thor, retirando a tonalidade escura e amarelada da proposta anterior.
- **Frigg:** usar a gravura enviada para vestido de cintura alta, capa, cabelos soltos e roca alta junto à cabeça; converter a figura sentada em busto e omitir trono, animais e demais figuras.
- **Heimdall:** seguir o figurino da estatueta, incluindo elmo de chifres curvos, couraça gravada, ombreiras, malha e capa; levantar o chifre junto à boca, mantendo mão e chifres dentro do recorte. Omitir base, placa, espada e galo.
- **Freyr:** substituir o rosto arredondado e a barba curta pela nova referência: rosto anguloso, cabelo longo solto, barba comprida em duas tranças e coroa de folhas. Manter torso à mostra e manto, com corpo um pouco mais esguio, ombros menos largos e braços menos volumosos. O usuário pediu retirar as espigas; omitir também o javali, a moldura vegetal, o disco solar e as inscrições da referência. Thor continua como referência de traço e cor.
- **Jormungand:** substituir o busto de serpente pela composição circular da referência; a cabeça morde a cauda no topo, e a árvore ocupa o centro. Preservar transparência também entre galhos, raízes e corpo; omitir fundo cinza e logotipo.
- **Fenrir:** refazer de frente como lobo selvagem, com focinho longo, nariz canino, olhos fundos, orelhas erguidas e pescoço peludo. Obter a expressão sinistra com olhar fixo e sombras, sem sobrancelhas, bochechas ou sorriso humanos.
- **Hrym:** usar o gigante central do quadrinho para corpo largo, barriga volumosa, barba, elmo pontudo, peles e braçadeiras. Adaptar para busto com machado e omitir as outras personagens, balões, nuvens e cores da referência.
- **Níðhöggr:** substituir o dragão com raiz na boca pela silhueta da referência escura enviada: crânio estreito, chifres alongados, espinhos, corpo esguio, garras e asas parcialmente dobradas. Usar mais massas pretas, sem brilho verde, cenário, caveiras ou assinatura.

## Revisão de Freyr

A nova referência enviada pelo usuário substituiu a aparência anterior de Freyr. O gerador integrado produziu a primeira versão com cabelo longo, duas tranças na barba, coroa de folhas e torso à mostra, sem espigas. Uma edição posterior, também pelo gerador integrado, reduziu o volume do corpo conforme o pedido de deixá-lo mais esguio. A versão final ocupa o mesmo caminho `assets/eventos-especiais/norte-freyr.webp` usado pela carta `bencao_freyr`.

Prompt da edição final:

> Use case: precise-object-edit. Edit target: the supplied Freyr game portrait. Make this SAME character a little more slender: reduce shoulder breadth and the bulk of the upper arms and chest by roughly 15–20%, creating a lean athletic torso rather than a bulky muscular one. This is a modest anatomy revision, not a different character. Keep the identical angular face, nose, expression, three-quarter gaze, long flowing hair, two narrow beard braids, oak-leaf wreath, bare chest, cloak placement, small gold clasp, black ink contours, warm ivory fill and woodcut hatching. Do not stretch the entire image or merely shrink the full figure: adjust torso and upper-arm anatomy while preserving the head and facial proportions. Preserve the bust framing and complete silhouette with transparent margins; do not crop leaves or hair. No wheat, grain, sheaf, staff, weapon, boar, background, frame, text or watermark. Genuine alpha-transparent background. Preserve the project's existing restrained palette and drawing style.

O arquivo final tem 800 × 731 px, WebP em qualidade 90 e 248.856 pixels totalmente transparentes. A conversão preserva a proporção do PNG gerado; não houve alteração programática de cor ou anatomia. O relatório de validação registra os novos dados de Freyr e o critério usado na mediana dos tons claros desta revisão.

## Conferência

Os dados de resolução, tamanho, pixels transparentes e mediana dos tons claros estão em [ARTES-NORDICAS-VALIDACAO.json](ARTES-NORDICAS-VALIDACAO.json). A mediana considera apenas pixels claros e opacos, excluindo a maior parte dos acentos dourados; ela ajuda na comparação, mas não substitui a revisão visual. Não houve ajuste programático de cor, apenas redução proporcional e conversão para WebP.

## Checklist

- [x] Gerar e revisar as oito entidades, incorporando as referências e correções do usuário.
- [x] Comparar a cor com Thor e validar formato, proporção, resolução e transparência dos oito arquivos finais.
- [x] Substituir as imagens provisórias nas oito cartas e atualizar os textos alternativos.
- [x] Redesenhar Freyr pela nova referência, retirar as espigas e reduzir o volume do corpo; conferir o WebP final e sua transparência.
- [x] Executar 39 testes relacionados ao catálogo, às conquistas e aos herdeiros, além do lint e da conferência de diferenças; todos passaram.
- [ ] Produzir os retratos dos herdeiros, um por vez, na próxima etapa definida pelo usuário.
- [ ] Conferir visualmente as cartas no navegador e no celular.

Resultado: oito artes próprias salvas no projeto e associadas aos eventos nórdicos. A validação de arquivos consta no relatório; a conferência visual dentro do jogo e as artes dos herdeiros permanecem pendentes.
