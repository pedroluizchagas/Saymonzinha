# Endereço dos produtos: o nome mais um trecho do código, sem campo no banco

A página de cada produto da loja virtual fica em `/loja/<nome>-<trecho do código>`, por exemplo `/loja/capinha-transparente-iphone-15-3f2a9c1d`, com os 8 primeiros caracteres do código. O nome deixa o link legível no WhatsApp e no Google, e o trecho do código do produto o identifica sem um campo novo no banco. Quando o nome muda, o link antigo continua valendo: a página acha o produto pelo trecho do código e redireciona para o endereço com o nome novo. Até o lançamento, a loja virtual nova responde em `/nova-loja`, no mesmo formato.

## Alternativas descartadas

- **Um campo de endereço no banco**: links mais limpos, mas pede migração, um campo a mais no painel e uma regra para nomes repetidos.
- **Só o código do produto**: sem migração, mas o link fica ilegível para quem o recebe.
