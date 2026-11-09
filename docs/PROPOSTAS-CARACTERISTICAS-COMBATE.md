# Características de combate

As 26 propostas selecionadas foram implementadas. O sorteio escolhe uma característica compatível no início da luta e a preserva nas rerrolagens e ao carregar. As seis anteriores continuam disponíveis. Confrontos com derrota obrigatória mantêm suas regras.

| Característica | Combates | Regra implementada |
| --- | --- | --- |
| Exausto | Comuns e chefes | −4 de dano base. |
| Saqueador | Comuns e chefes | A primeira derrota custa até 2 Gold, uma vez por luta. |
| Duelista | Comuns e chefes | −2 Defesa contra postura defensiva; +4 de dano base contra agressiva. |
| Covarde | Comuns e chefes | +2 Defesa contra postura defensiva; −2 contra agressiva. |
| Vingativo | Chefes | Após receber um acerto, acrescenta 4 ao próximo contra-ataque. Não acumula; proteções também consomem a retaliação. |
| Oportunista | Comuns e chefes | +4 de dano base ao vencer por 6 pontos ou mais. |
| Berserker | Chefes | +6 de dano base com metade da Vida ou menos. |
| Metódico | Chefes | Causa 25% menos dano base e recebe 25% menos dano por acerto, arredondando para cima. |
| Distraído | Comuns e chefes | Pague 1 Gold antes de rolar para reduzir a Defesa inimiga em 3 até o fim da luta, uma vez. |
| Perseguidor | Comuns e chefes | Ignora 3 de Escudo na postura defensiva; preserva a redução de dano da postura. |
| Agourento | Comuns e chefes | +6 de dano base se o dado escolhido do herdeiro terminar em 1 e houver derrota. |
| Marcado | Comuns e chefes | Vencer com um 20 no dado escolhido concede +2 Gold. Nos chefes, vale qualquer acerto confirmado com 20; paga apenas na vitória final. |
| Tenaz | Chefes | Sobrevive ao primeiro golpe fatal com 1 de Vida, uma vez por luta. |
| Sentinela | Chefes | Recebe metade do dano no primeiro acerto, arredondando para cima. |
| Impaciente | Chefes | Cada turno sem receber dano dá −1 Defesa e +2 de dano base, até 3 vezes. Um acerto reinicia o efeito. |
| Concentrado | Chefes | +6 de dano base até sofrer o primeiro acerto. |
| Encurralado | Chefes | +3 Defesa abaixo de um quarto da Vida máxima. |
| Sanguinário | Comuns e chefes | +4 de dano base contra herdeiros com um quarto da Vida máxima ou menos. |
| Piedoso | Comuns e chefes | Um golpe fatal deixa 1 de Vida e encerra a luta como derrota. Outras consequências continuam valendo. Não aparece em confrontos letais. |
| Temerário | Comuns e chefes | Ambos recebem um dado extra. O inimigo usa o maior, mesmo sob desvantagem; demais efeitos de desvantagem continuam valendo. |
| Hesitante | Chefes | −3 Defesa no primeiro turno. |
| Adaptável | Chefes | +2 Defesa se o herdeiro repetir a postura do turno anterior. Não acumula. |
| Resiliente | Chefes | Recebe metade do dano quando o herdeiro vence por até 2 pontos, arredondando para cima. |
| Frágil | Chefes | Recebe +10 de dano quando o herdeiro vence por 6 pontos ou mais. |
| Generoso | Comuns e chefes | Vencer recupera 8 de Vida, respeitando a Vida máxima. |
| Colecionador | Comuns e chefes | Vencer concede um item comum ou raro adicional, anunciado antes da luta. |

Os ajustes de dano base entram antes da margem de derrota, da postura, do Escudo e das demais proteções. Os efeitos não se acumulam entre características: cada inimigo recebe apenas uma.

O nome permite consultar o resumo por hover, foco de teclado ou seleção por clique e toque. Distraído oferece um botão separado para o pagamento. Colecionador anuncia o item antes da rolagem. Os chefes informam a sobrevivência de Tenaz antes de abrir outro turno.

A Mão do Destino calcula as chances com os estados da característica, a postura e os preparos atuais. Considera o uso das rerrolagens gratuitas e uma proteção preparada; não pressupõe troca de postura nem novos consumíveis em turnos futuros.

Instável permanece excluído. Sugestões que não constam nesta tabela não fazem parte desta entrega.

- [x] Registrar todas as escolhas, incluindo Resiliente, Frágil, Generoso e Colecionador.
- [x] Definir valores e restringir as características exclusivas de chefes.
- [x] Implementar efeitos, recompensas, resumos e ação de distração.
- [x] Validar chances, persistência e transições com testes automatizados.
- [ ] Conferir hover, toque e layout no navegador.
- [ ] Avaliar o equilíbrio em partidas completas.

Resultado: conjunto selecionado implementado. Testes automatizados cobrem o catálogo, modificadores, turnos, recompensas, saves e probabilidades conhecidas. Conferência visual e avaliação do equilíbrio permanecem pendentes.
