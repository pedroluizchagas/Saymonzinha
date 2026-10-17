// Conteúdo da home: fonte única para a Desdobra e a Raio-X (ver docs/adr/0001).

export const WHATSAPP_NUMBER = "5537988023341"
export const WHATSAPP_DISPLAY = "(37) 98802-3341"
export const INSTAGRAM_URL = "https://instagram.com/saymoncell037"
export const MAPS_URL =
  "https://www.google.com/maps/search/?api=1&query=Av.+Anhanguera%2C+1286%2C+Jardim+dos+Candid%C3%A9s%2C+Divin%C3%B3polis+-+MG"

export const PHONE_URL = `tel:+${WHATSAPP_NUMBER}`

/** Linha acima do título criativo de cada versão: diz o que a loja faz e onde (h1 das duas). */
export const HEADLINE_KICKER = "Assistência técnica de celulares em Divinópolis"

/** Ressalva que acompanha toda promessa de busca e entrega. */
export const PICKUP_NOTE = "Busca e entrega: consulte disponibilidade e valor para sua região."

export const PARKING_NOTE = "Ponto estratégico de Divinópolis, com fácil acesso e estacionamento."

export function whatsappLink(message = "Olá Saymon Cell, vi o site e gostaria de um orçamento.") {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
}

export const ADDRESS = {
  street: "Av. Anhanguera, 1286",
  unit: "Loja 02",
  district: "Jardim dos Candidés",
  city: "Divinópolis - MG",
  zip: "35502-297",
}

export const HOURS = [
  { days: "Segunda a sexta", time: "8h às 18h" },
  { days: "Sábado", time: "8h às 12h" },
]

export type Service = {
  key: string
  tag: string
  title: string
  description: string
  problem: string
}

export const SERVICES: Service[] = [
  {
    key: "tela",
    tag: "Tela",
    title: "Troca de tela e vidro",
    description: "Qualidade original para você voltar a ver tudo com clareza.",
    problem: "Troca de Tela",
  },
  {
    key: "bateria",
    tag: "Energia",
    title: "Bateria nova",
    description: "Chega de viver preso ao carregador. Bateria nova, vida nova.",
    problem: "Substituição de Bateria",
  },
  {
    key: "conector",
    tag: "Carga",
    title: "Conector de carga",
    description: "Seu celular não carrega? Nós resolvemos rapidamente.",
    problem: "Troca de Conector de Carga",
  },
  {
    key: "banho",
    tag: "Resgate",
    title: "Banho químico",
    description: "Recuperação de aparelhos que caíram na água.",
    problem: "Banho Químico",
  },
  {
    key: "placa",
    tag: "Placa",
    title: "Reparo em placa",
    description: "Soluções técnicas avançadas para problemas complexos.",
    problem: "Reparo de Placa",
  },
  {
    key: "software",
    tag: "Sistema",
    title: "Formatação e software",
    description: "Formatação, remoção de conta Google e problemas de software.",
    problem: "Formatação",
  },
]

export const STEPS = [
  { title: "Contato", description: "Você chama no WhatsApp e explica o problema do aparelho." },
  {
    title: "Busca",
    description: "Vamos até você, em casa ou no trabalho, retirar o celular (consulte disponibilidade e valor para sua região).",
  },
  { title: "Reparo", description: "Diagnóstico e conserto no nosso laboratório." },
  { title: "Entrega", description: "Devolvemos o smartphone funcionando, com garantia." },
]

export const GUARANTEES = [
  { title: "Garantia no serviço", description: "Todo reparo acompanha garantia." },
  { title: "Agilidade", description: "Você não pode ficar sem celular. Reparamos o mais rápido possível." },
  { title: "Pagamento facilitado", description: "Pix, dinheiro e cartões de crédito e débito." },
  { title: "Atendimento transparente", description: "Cada cliente tratado com respeito e transparência." },
]

export const STATS = [
  { value: "10", label: "Anos de história" },
  { value: "2.500+", label: "Celulares recuperados" },
  { value: "1", label: "Ano na nova sede" },
]

/** Rótulos e títulos das seções, os mesmos nas duas versões (ver docs/adr/0001). */
export const SECTIONS = {
  region: "Assistência técnica · Divinópolis, MG",
  steps: { label: "Como funciona", title: `Do defeito à solução em ${STEPS.length} passos` },
  why: { label: "Por que a Saymon Cell", title: "10 anos cuidando do que conecta você" },
  brands: { label: "Marcas que atendemos" },
  store: { label: "Loja", title: "Acessórios" },
  visit: { label: "Onde estamos", contact: "WhatsApp e telefone" },
  call: { label: "Chamada recebida · sobre o seu conserto", message: "Olá Saymon Cell! Vim pelo site e quero consertar meu celular." },
}

// Menu das duas versões. As âncoras são as mesmas do cabeçalho e do rodapé da loja.
export const MENU = [
  { label: "Serviços", href: "#servicos" },
  { label: "Como funciona", href: "#como-funciona" },
  { label: "Loja", href: "/loja" },
  { label: "Localização", href: "#localizacao" },
]

/** O menu fora da home (na loja virtual): as âncoras levam à home, e "Loja" à loja virtual. */
export function siteMenu(storePath: string) {
  return MENU.map((item) => ({
    ...item,
    href: item.href.startsWith("#") ? `/${item.href}` : item.href === "/loja" ? storePath : item.href,
  }))
}

export const BRANDS = ["Apple", "Samsung", "Motorola", "Xiaomi", "LG", "Asus", "Huawei", "Realme", "OnePlus", "Nokia"]

export const STORE_CATEGORIES = ["Capinhas", "Carregadores", "Caixinhas de som JBL", "Fones bluetooth"]
