# Artes dos oito novos eventos nórdicos

Produção de 6 de novembro de 2026 pelo gerador de imagens integrado (`image_gen`). As imagens usam referências visuais do projeto e as referências de personagem enviadas pelo usuário; não houve geração pela API ou pelo CLI.

## Referência e arquivos finais

Thor, em `assets/eventos-especiais/norte-thor.webp`, define o traço e a cor deste conjunto. As primeiras propostas mais amareladas não são os arquivos integrados. Os finais preservam a proporção e a transparência, usam WebP com qualidade 90 e têm maior lado de 800 px.

| Entidade | Arquivo em `assets/eventos-especiais/` | Composição final |
| --- | --- | --- |
| Baldr | `norte-baldr.webp` | Barba, cabelo comprido, torso à mostra, capa e bastão com ramo, conforme a gravura enviada. |
| Frigg | `norte-frigg.webp` | Cabelos soltos, vestido drapeado, capa e roca alta, conforme a gravura enviada. |
| Heimdall | `norte-heimdall.webp` | Elmo com chifres curvos, couraça decorada, malha, capa e chifre de sopro, conforme a estatueta enviada. |
| Freyr | `norte-freyr.webp` | Busto com túnica, manto e feixe de espigas. |
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
- **Freyr:** homem adulto de rosto arredondado, barba curta, túnica simples e manto sobre um ombro; segurar espigas na altura do peito, sem paisagem ou coroa.
- **Jormungand:** substituir o busto de serpente pela composição circular da referência; a cabeça morde a cauda no topo, e a árvore ocupa o centro. Preservar transparência também entre galhos, raízes e corpo; omitir fundo cinza e logotipo.
- **Fenrir:** refazer de frente como lobo selvagem, com focinho longo, nariz canino, olhos fundos, orelhas erguidas e pescoço peludo. Obter a expressão sinistra com olhar fixo e sombras, sem sobrancelhas, bochechas ou sorriso humanos.
- **Hrym:** usar o gigante central do quadrinho para corpo largo, barriga volumosa, barba, elmo pontudo, peles e braçadeiras. Adaptar para busto com machado e omitir as outras personagens, balões, nuvens e cores da referência.
- **Níðhöggr:** substituir o dragão com raiz na boca pela silhueta da referência escura enviada: crânio estreito, chifres alongados, espinhos, corpo esguio, garras e asas parcialmente dobradas. Usar mais massas pretas, sem brilho verde, cenário, caveiras ou assinatura.

## Conferência

Os dados de resolução, tamanho, pixels transparentes e mediana dos tons claros estão em [ARTES-NORDICAS-VALIDACAO.json](ARTES-NORDICAS-VALIDACAO.json). A mediana considera apenas pixels claros e opacos, excluindo a maior parte dos acentos dourados; ela ajuda na comparação, mas não substitui a revisão visual. Não houve ajuste programático de cor, apenas redução proporcional e conversão para WebP.

## Checklist

- [x] Gerar e revisar as oito entidades, incorporando as referências e correções do usuário.
- [x] Comparar a cor com Thor e validar formato, proporção, resolução e transparência dos oito arquivos finais.
- [x] Substituir as imagens provisórias nas oito cartas e atualizar os textos alternativos.
- [x] Executar 39 testes relacionados ao catálogo, às conquistas e aos herdeiros, além do lint e da conferência de diferenças; todos passaram.
- [ ] Produzir os retratos dos herdeiros, um por vez, na próxima etapa definida pelo usuário.
- [ ] Conferir visualmente as cartas no navegador e no celular.

Resultado: oito artes próprias salvas no projeto e associadas aos eventos nórdicos. A validação de arquivos consta no relatório; a conferência visual dentro do jogo e as artes dos herdeiros permanecem pendentes.
