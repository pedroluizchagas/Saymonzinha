# Documentos de domínio

Como as skills de engenharia devem usar a documentação de domínio deste repositório ao explorar o código.

## Antes de explorar, leia

- **`GLOSSARY.md`** na raiz: o vocabulário da loja (pedido de orçamento, ordem de serviço, busca e entrega, painel...).
- **`docs/adr/`**: leia os ADRs que tocam a área em que você vai trabalhar.

Se algum desses arquivos não existir, **siga em silêncio**. Não aponte a falta nem sugira criá-los de antemão. A skill `/domain-modeling` (usada pelo `/grill-with-docs` e pelo `/improve-codebase-architecture`) cria esses arquivos quando um termo ou uma decisão é de fato resolvido.

## Estrutura

Contexto único:

```
/
├── GLOSSARY.md
├── docs/adr/
│   └── 0001-home-em-duas-versoes.md
├── app/
├── components/
└── lib/
```

Se um dia surgir um `GLOSSARY-MAP.md` na raiz, o repositório passou a ter vários contextos: ele aponta um `GLOSSARY.md` por contexto, e cada contexto pode ter o seu `docs/adr/`.

## Use o vocabulário do glossário

Quando o que você escreve nomeia um conceito do domínio (título de issue, proposta de refatoração, hipótese, nome de teste), use o termo como o `GLOSSARY.md` define. Não troque por sinônimos que o glossário manda evitar.

Se o conceito ainda não estiver no glossário, isso é um sinal: ou você está inventando uma linguagem que o projeto não usa (reconsidere), ou há uma lacuna de verdade (anote para o `/domain-modeling`).

## Aponte conflitos com ADRs

Se o que você propõe contradiz um ADR existente, diga isso explicitamente em vez de passar por cima:

> _Contradiz o ADR-0001 (home em duas versões), mas vale reabrir porque…_
