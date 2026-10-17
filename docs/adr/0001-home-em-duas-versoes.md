# Home em duas versões: Desdobra no desktop, Raio-X em celular e tablet

A home pública tem duas implementações completas com o mesmo conteúdo. A Desdobra (o site dentro de um celular dobrável) atende telas grandes com mouse ou trackpad, e a Raio-X (o celular que se desmonta em camadas) atende telas de toque ou com menos de 1024px. A escolha veio depois de comparar as três variantes do protótipo nos aparelhos. Quem decide a versão é o navegador, porque o iPad se identifica como Mac e uma escolha feita só pelo servidor o mandaria para a versão de desktop. O servidor faz um palpite (pista do aparelho e cookie da visita anterior) para mandar uma versão só, e o navegador corrige antes de mostrar a página.

## Alternativas descartadas

- **Uma página responsiva só**: não comporta os dois conceitos escolhidos.
- **As duas versões na mesma página, com o CSS escondendo uma**: a versão escondida continuava ouvindo o scroll e interferia na outra, e o HTML saía com dois h1 e todo o conteúdo repetido.
- **Decidir só no servidor, pelo user agent**: o iPad receberia a versão de desktop.
- **Recarregar a página quando o servidor erra a versão**: rápida localmente, mas em produção paga duas vezes a resposta do servidor. Medido no iPad na primeira visita, a mediana ficou em 5,0 s, contra 3,6 s trocando no navegador.
- **Baixar a outra versão só na hora da troca**: o código chegava só depois do JavaScript principal, e o iPad ficava de 1,5 a 2,5 s a mais com a página oculta. As duas versões vêm no mesmo pacote, o que custa cerca de 15 KB com gzip.

## Consequências

O conteúdo das duas versões sai de uma fonte só, para que nunca diverjam; uma seção ou um texto novo entra nas duas ao mesmo tempo.
