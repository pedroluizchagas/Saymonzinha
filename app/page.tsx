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

export default function HomePage() {
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
    </main>
  )
}
