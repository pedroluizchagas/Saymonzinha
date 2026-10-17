# Issue tracker: GitHub

As issues e as specs deste repositório ficam nas issues do GitHub. Use o `gh` para todas as operações. O repositório é público: tudo o que entra numa issue fica visível para qualquer pessoa.

## Convenções

- **Criar uma issue**: `gh issue create --title "..." --body "..."`. Use heredoc para corpos com várias linhas.
- **Ler uma issue**: `gh issue view <número> --comments`, filtrando os comentários com `jq` e buscando também os rótulos.
- **Listar issues**: `gh issue list --state open --json number,title,body,labels,comments --jq '[.[] | {number, title, body, labels: [.labels[].name], comments: [.comments[].body]}]'`, com os filtros `--label` e `--state` adequados.
- **Comentar numa issue**: `gh issue comment <número> --body "..."`
- **Aplicar / remover rótulos**: `gh issue edit <número> --add-label "..."` / `--remove-label "..."`
- **Fechar**: `gh issue close <número> --comment "..."`

O `gh` descobre o repositório pelo `git remote -v` quando roda dentro do clone.

## Pull requests como pedidos

**PRs as a request surface: no.** _(Mude para `yes` se este repositório tratar PRs externos como pedidos de funcionalidade; o `/triage` lê esta marca.)_

Com `yes`, os PRs passam pelos mesmos rótulos e estados das issues, com os equivalentes `gh pr`:

- **Ler um PR**: `gh pr view <número> --comments` e `gh pr diff <número>` para o diff.
- **Listar PRs externos para triagem**: `gh pr list --state open --json number,title,body,labels,author,authorAssociation,comments`, mantendo só `authorAssociation` igual a `CONTRIBUTOR`, `FIRST_TIME_CONTRIBUTOR` ou `NONE` (sem `OWNER`/`MEMBER`/`COLLABORATOR`).
- **Comentar / rotular / fechar**: `gh pr comment`, `gh pr edit --add-label`/`--remove-label`, `gh pr close`.

O GitHub usa a mesma numeração para issues e PRs, então um `#42` pode ser qualquer um dos dois: resolva com `gh pr view 42` e, se falhar, `gh issue view 42`.

## Quando uma skill disser "publique no issue tracker"

Crie uma issue no GitHub.

## Quando uma skill disser "busque o ticket"

Rode `gh issue view <número> --comments`.

## Operações do wayfinding

Usadas pelo `/wayfinder`. O **mapa** é uma issue só, com issues **filhas** como tickets.

- **Mapa**: uma issue com o rótulo `wayfinder:map`, com o corpo em Notes / Decisions-so-far / Fog. `gh issue create --label wayfinder:map`.
- **Ticket filho**: uma issue ligada ao mapa como sub-issue do GitHub (`gh api` no endpoint de sub-issues). Onde não houver sub-issues, acrescente a filha numa lista de tarefas no corpo do mapa e ponha `Part of #<mapa>` no topo do corpo da filha. Rótulos: `wayfinder:<tipo>` (`research`/`prototype`/`grilling`/`task`). Quem pega o ticket passa a ser o responsável por ele.
- **Bloqueio**: as **dependências nativas de issues** do GitHub, que aparecem na interface. Para criar uma aresta: `gh api --method POST repos/<dono>/<repo>/issues/<filha>/dependencies/blocked_by -F issue_id=<id-do-bloqueador>`, onde `<id-do-bloqueador>` é o **id de banco** numérico (`gh api repos/<dono>/<repo>/issues/<n> --jq .id`), _não_ o `#número` nem o `node_id`. O GitHub informa `issue_dependencies_summary.blocked_by` (só bloqueadores abertos, o bloqueio vigente). Onde não houver dependências, use uma linha `Blocked by: #<n>, #<n>` no topo do corpo da filha. Um ticket fica livre quando todos os bloqueadores estão fechados.
- **Fronteira**: liste as filhas abertas do mapa (`gh issue list --state open`, restrito às sub-issues ou à lista de tarefas do mapa) e descarte as que têm bloqueador aberto (`issue_dependencies_summary.blocked_by > 0`, ou uma issue aberta na linha `Blocked by`) ou responsável; vale a primeira na ordem do mapa.
- **Pegar**: `gh issue edit <n> --add-assignee @me`, a primeira escrita da sessão.
- **Resolver**: `gh issue comment <n> --body "<resposta>"`, depois `gh issue close <n>`, depois acrescente um ponteiro de contexto (resumo + link) em Decisions-so-far no mapa.
