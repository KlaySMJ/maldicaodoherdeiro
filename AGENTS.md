# Instruções do projeto

Antes de criar, editar ou revisar qualquer texto do projeto — incluindo diálogos, eventos, opções, interface, documentação e mensagens — leia `SKILL.md` por inteiro e siga a skill `anti-ai-slop-writing` nele definida. Consulte também a lista de termos proibidos indicada pela skill quando esse arquivo estiver disponível. Aplique as regras sem mencioná-las no texto produzido.

Antes de criar, editar, converter ou avaliar ilustrações deste projeto, leia `docs/MEMORIA-ILUSTRACOES.md` por inteiro e siga as referências e decisões nela registradas. Consulte-a novamente sempre que uma alteração visual depender dessas regras.

Por orientação atual, as artes de cartas de evento devem usar WebP com qualidade 90 e maior lado de 800 px, preservando proporções e transparência. Retratos dos herdeiros continuam nas variantes PNG/SVG atuais; arquivos com referências dinâmicas não são órfãos.

## Entrega de planos

Todo plano criado ou executado neste projeto deve terminar com uma checklist item a item, marcando o que foi concluído e o que ficou pendente, seguida de um resumo curto do resultado e das validações. Destaque claramente qualquer decisão em aberto ou verificação manual que ainda não foi feita.

## Git

Quando o usuário pedir para adicionar ou commitar mudanças, prepare todo o repositório em uma única chamada de `git add --all`. O alias local `git addall` também deve adicionar todos os arquivos rastreados e novos, respeitando o `.gitignore`.
