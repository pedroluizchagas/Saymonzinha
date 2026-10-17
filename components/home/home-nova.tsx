// Home nova: a Desdobra no desktop e a Raio-X em celular e tablet (ver docs/adr/0001).
// O conteúdo das duas vem de ./shared/content.ts.

import {
  DESKTOP_MIN_WIDTH,
  LITE_MAX_CORES,
  LITE_MAX_MEMORY_GB,
  PRESENTATION_COOKIE,
  PRESENTATION_COOKIE_ATTRIBUTES,
  REDUCED_MOTION_QUERY,
  SWAP_STYLE_ID,
  TOUCH_QUERY,
  type Presentation,
} from "@/lib/home-presentation"
import type { Product } from "@/types/database"
import "./sc-system.css"
import { scFontVariables } from "./fonts"
import { HomePresentation } from "./home-presentation"

// Roda antes da primeira pintura e aplica as mesmas regras de lib/home-presentation: a versão pela
// tela e o modo leve por menos movimento ou aparelho fraco. Grava o cookie. Se o servidor mandou
// outra coisa (o iPad na primeira visita), esconde a página até o navegador montar a certa, por no
// máximo 3 s. (Recarregar a página foi testado e é mais lento em produção: paga a resposta do
// servidor duas vezes.)
function swapScript(server: Presentation) {
  const json = JSON.stringify
  return `(function(){try{
var t=matchMedia(${json(TOUCH_QUERY)}).matches,v=t||innerWidth<${DESKTOP_MIN_WIDTH}?"raio-x":"desdobra";
var m=navigator.deviceMemory,c=navigator.hardwareConcurrency;
var l=${server.lite}||matchMedia(${json(REDUCED_MOTION_QUERY)}).matches||(t&&m!==undefined&&(m<=${LITE_MAX_MEMORY_GB}||(c!==undefined&&c<=${LITE_MAX_CORES})));
document.cookie=${json(`${PRESENTATION_COOKIE}=`)}+v+(l?".leve":"")+${json(`; ${PRESENTATION_COOKIE_ATTRIBUTES}`)}+(location.protocol==="https:"?"; Secure":"");
if(v===${json(server.version)}&&l===${server.lite})return;
var s=document.createElement("style");s.id=${json(SWAP_STYLE_ID)};s.textContent=".home-nova{visibility:hidden}";
document.head.appendChild(s);setTimeout(function(){s.remove()},3000)
}catch(e){}})()`
}

export function HomeNova({ presentation, products }: { presentation: Presentation; products: Product[] }) {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: swapScript(presentation) }} />
      <div className={`home-nova ${scFontVariables}`}>
        <HomePresentation initial={presentation} products={products} />
      </div>
    </>
  )
}
