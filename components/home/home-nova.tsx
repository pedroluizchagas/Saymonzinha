// Home nova: a Desdobra no desktop e a Raio-X em celular e tablet (ver docs/adr/0001).
// O conteúdo das duas vem de ./shared/content.ts.

import {
  DESKTOP_MIN_WIDTH,
  PRESENTATION_COOKIE,
  PRESENTATION_COOKIE_ATTRIBUTES,
  SWAP_STYLE_ID,
  TOUCH_QUERY,
  type HomeVersion,
} from "@/lib/home-presentation"
import type { Product } from "@/types/database"
import { scFontVariables } from "./fonts"
import { HomePresentation } from "./home-presentation"
import "./sc-system.css"

const RELOAD_FLAG = "home-versao-recarregou"

// Roda antes da primeira pintura: aplica a regra da tela e grava o cookie. Se o servidor mandou a
// versão errada (o iPad na primeira visita), esconde a página e recarrega uma vez, já com o cookie,
// para o servidor mandar a certa. Sem cookie ou sem recarga, o navegador troca a versão sozinho;
// em qualquer caso a página reaparece em no máximo 3 s.
function swapScript(serverVersion: HomeVersion) {
  const cookie = `${PRESENTATION_COOKIE}=`
  return `(function(){try{
var v=matchMedia(${JSON.stringify(TOUCH_QUERY)}).matches||innerWidth<${DESKTOP_MIN_WIDTH}?"raio-x":"desdobra";
document.cookie=${JSON.stringify(cookie)}+v+${JSON.stringify(`; ${PRESENTATION_COOKIE_ATTRIBUTES}`)}+(location.protocol==="https:"?"; Secure":"");
if(v===${JSON.stringify(serverVersion)})return;
var s=document.createElement("style");s.id=${JSON.stringify(SWAP_STYLE_ID)};s.textContent=".home-nova{visibility:hidden}";
document.head.appendChild(s);setTimeout(function(){s.remove()},3000);
if(document.cookie.indexOf(${JSON.stringify(cookie)}+v)>=0&&!sessionStorage.getItem(${JSON.stringify(RELOAD_FLAG)})){
sessionStorage.setItem(${JSON.stringify(RELOAD_FLAG)},"1");location.replace(location.href)}
}catch(e){}})()`
}

export function HomeNova({ version, products }: { version: HomeVersion; products: Product[] }) {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: swapScript(version) }} />
      <div className={`home-nova ${scFontVariables}`}>
        <HomePresentation initialVersion={version} products={products} />
      </div>
    </>
  )
}
