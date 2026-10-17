import { Header } from "@/components/layout/header"
import { HeroSection } from "@/components/sections/hero-section"
import { HowItWorksSection } from "@/components/sections/how-it-works-section"
import { ServicesSection } from "@/components/sections/services-section"
import { ProductsSection } from "@/components/sections/products-section"
import { AuthoritySection } from "@/components/sections/authority-section"
import { LocationSection } from "@/components/sections/location-section"
import { GuaranteeSection } from "@/components/sections/guarantee-section"
import { Footer } from "@/components/layout/footer"
import { WhatsAppButton } from "@/components/ui/whatsapp-button"
import { getFeaturedProducts } from "@/lib/actions/store-actions"
import {
  RedesignPrototype,
  RedesignSwitcher,
  isPrototypeEnabled,
  redesignVariant,
} from "@/components/prototype/redesign/redesign-prototype"

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ variant?: string | string[] }>
}) {
  // PROTÓTIPO do redesign: ?variant=A|B|C (só em dev ou preview da Vercel)
  const prototype = isPrototypeEnabled()
  const variant = prototype ? redesignVariant((await searchParams).variant) : null
  if (variant) {
    const products = await getFeaturedProducts(4).catch(() => [])
    return <RedesignPrototype variant={variant} products={products} />
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Header />
      <HeroSection />
      <HowItWorksSection />
      <ServicesSection />
      <ProductsSection />
      <AuthoritySection />
      <LocationSection />
      <GuaranteeSection />
      <Footer />
      <WhatsAppButton />
      {prototype && <RedesignSwitcher />}
    </main>
  )
}
