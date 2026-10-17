// O app instalado (PWA) no iPhone: nome, barra de status e as telas de abertura geradas a partir do
// glifo da marca (public/splash). Vale no site inteiro e nos layouts do painel e do login, que
// substituem o appleWebApp do layout raiz: é neles que a equipe adiciona o painel à tela de início.

import type { Metadata } from "next"

/** As telas de abertura por aparelho: largura e altura em pontos e a densidade da tela. */
const SPLASH_SIZES: [number, number, number][] = [
  [440, 956, 3], // 16 Pro Max, 17 Pro Max
  [430, 932, 3], // 14 Pro Max, 15 Plus, 15 Pro Max, 16 Plus
  [428, 926, 3], // 12 Pro Max, 13 Pro Max, 14 Plus
  [420, 912, 3], // Air
  [402, 874, 3], // 16 Pro, 17, 17 Pro
  [393, 852, 3], // 14 Pro, 15, 15 Pro, 16
  [390, 844, 3], // 12, 13, 14
  [375, 812, 3], // X, XS, 11 Pro, 12 mini, 13 mini
  [414, 896, 3], // XS Max, 11 Pro Max
  [414, 896, 2], // XR, 11
  [375, 667, 2], // 8, SE (2ª e 3ª geração)
  [320, 568, 2], // SE (1ª geração)
]

export const APPLE_WEB_APP: NonNullable<Metadata["appleWebApp"]> = {
  capable: true,
  statusBarStyle: "black-translucent",
  title: "Saymon Cell",
  startupImage: SPLASH_SIZES.map(([width, height, ratio]) => ({
    url: `/splash/splash-${width * ratio}x${height * ratio}.png`,
    media: `(device-width: ${width}px) and (device-height: ${height}px) and (-webkit-device-pixel-ratio: ${ratio})`,
  })),
}

/** A cor da barra do navegador e do app instalado: o preto do palco. */
export const PWA_THEME_COLOR = "#0a0908"
