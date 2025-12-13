"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  FileText,
  User,
  Smartphone,
  Wrench,
  Truck,
} from "lucide-react"
import { createLead } from "@/lib/actions/lead-actions"
import type { CreateLeadDTO, DeliveryType } from "@/types/database"
import { cn } from "@/lib/utils"

const DEVICE_BRANDS = [
  "Apple",
  "Samsung",
  "Motorola",
  "Xiaomi",
  "LG",
  "Asus",
  "Huawei",
  "Nokia",
  "OnePlus",
  "Realme",
  "Outro",
]

const PROBLEM_TYPES = [
  "Troca de Tela",
  "Substituição de Bateria",
  "Troca de Conector de Carga",
  "Reparo de Placa",
  "Troca de Alto-falante",
  "Troca de Câmera",
  "Troca de Microfone",
  "Formatação",
  "Remoção de Conta Google",
  "Troca de Botões",
  "Reparo de TouchID/FaceID",
  "Outros Reparos",
]

interface FormData {
  customer_name: string
  customer_phone: string
  device_brand: string
  device_model: string
  device_password: string
  problem_type: string
  problem_description: string
  delivery_type: DeliveryType
  delivery_address: string
}

const INITIAL_FORM_DATA: FormData = {
  customer_name: "",
  customer_phone: "",
  device_brand: "",
  device_model: "",
  device_password: "",
  problem_type: "",
  problem_description: "",
  delivery_type: "store",
  delivery_address: "",
}

const STEPS = [
  { id: 1, title: "Seus Dados", icon: User },
  { id: 2, title: "Aparelho", icon: Smartphone },
  { id: 3, title: "Problema", icon: Wrench },
  { id: 4, title: "Entrega", icon: Truck },
]

export function PreQuoteForm() {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM_DATA)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitResult, setSubmitResult] = useState<{ success: boolean; message: string } | null>(null)

  const updateField = <K extends keyof FormData>(field: K, value: FormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, "")
    if (numbers.length <= 2) return numbers
    if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`
    if (numbers.length <= 11) return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`
  }

  const canProceed = () => {
    switch (step) {
      case 1:
        return formData.customer_name.trim().length >= 2 && formData.customer_phone.replace(/\D/g, "").length >= 10
      case 2:
        return formData.device_brand && formData.device_model.trim().length >= 2
      case 3:
        return formData.problem_type
      case 4:
        return formData.delivery_type === "store" || formData.delivery_address.trim().length >= 5
      default:
        return false
    }
  }

  const handleNext = () => {
    if (step < 4 && canProceed()) {
      setStep(step + 1)
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const handleSubmit = async () => {
    if (!canProceed()) return

    setIsSubmitting(true)
    setSubmitResult(null)

    const leadData: CreateLeadDTO = {
      customer_name: formData.customer_name.trim(),
      customer_phone: formData.customer_phone.replace(/\D/g, ""),
      device_brand: formData.device_brand,
      device_model: formData.device_model.trim(),
      device_password: formData.device_password || undefined,
      problem_type: formData.problem_type,
      problem_description: formData.problem_description || undefined,
      delivery_type: formData.delivery_type,
      delivery_address: formData.delivery_type === "delivery" ? formData.delivery_address : undefined,
    }

    const result = await createLead(leadData)
    setSubmitResult(result)
    setIsSubmitting(false)

    if (result.success) {
      // Abrir WhatsApp com mensagem personalizada
      const whatsappMessage = encodeURIComponent(
        `Olá Saymon Cell! Acabei de enviar um pré-orçamento pelo site.\n\n` +
          `*Nome:* ${formData.customer_name}\n` +
          `*Aparelho:* ${formData.device_brand} ${formData.device_model}\n` +
          `*Problema:* ${formData.problem_type}\n` +
          `*Entrega:* ${formData.delivery_type === "store" ? "Vou levar na loja" : "Quero delivery"}\n\n` +
          `Aguardo o contato!`,
      )
      window.open(`https://wa.me/5537988023341?text=${whatsappMessage}`, "_blank")
    }
  }

  const resetForm = () => {
    setFormData(INITIAL_FORM_DATA)
    setStep(1)
    setSubmitResult(null)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="text-lg px-8 py-6">
          <FileText className="w-5 h-5 mr-2" />
          Abrir Pré-Orçamento Rápido
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto bg-card border-border">
        {submitResult?.success ? (
          <SuccessScreen onClose={resetForm} />
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl text-foreground">Pré-Orçamento Rápido</DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Preencha os dados e receba seu orçamento em minutos!
              </DialogDescription>
            </DialogHeader>

            {/* Progress Steps */}
            <div className="flex items-center justify-between mb-6 px-2">
              {STEPS.map((s, index) => (
                <div key={s.id} className="flex items-center">
                  <div
                    className={cn(
                      "flex flex-col items-center",
                      step >= s.id ? "text-primary" : "text-muted-foreground",
                    )}
                  >
                    <div
                      className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors",
                        step >= s.id ? "border-primary bg-primary/10" : "border-muted",
                      )}
                    >
                      {step > s.id ? <CheckCircle2 className="w-5 h-5" /> : <s.icon className="w-5 h-5" />}
                    </div>
                    <span className="text-xs mt-1 hidden sm:block">{s.title}</span>
                  </div>
                  {index < STEPS.length - 1 && (
                    <div className={cn("w-8 sm:w-12 h-0.5 mx-1", step > s.id ? "bg-primary" : "bg-muted")} />
                  )}
                </div>
              ))}
            </div>

            {/* Form Steps */}
            <div className="min-h-[200px]">
              {step === 1 && (
                <StepCustomerData formData={formData} updateField={updateField} formatPhone={formatPhone} />
              )}
              {step === 2 && <StepDeviceData formData={formData} updateField={updateField} />}
              {step === 3 && <StepProblem formData={formData} updateField={updateField} />}
              {step === 4 && <StepDelivery formData={formData} updateField={updateField} />}
            </div>

            {submitResult && !submitResult.success && (
              <p className="text-sm text-destructive text-center">{submitResult.message}</p>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between gap-4 mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                disabled={step === 1 || isSubmitting}
                className="flex-1 bg-transparent"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Voltar
              </Button>

              {step < 4 ? (
                <Button
                  type="button"
                  onClick={handleNext}
                  disabled={!canProceed()}
                  className="flex-1"
                >
                  Próximo
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!canProceed() || isSubmitting}
                  className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    "Enviar Orçamento"
                  )}
                </Button>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

// Step 1: Customer Data
function StepCustomerData({
  formData,
  updateField,
  formatPhone,
}: {
  formData: FormData
  updateField: <K extends keyof FormData>(field: K, value: FormData[K]) => void
  formatPhone: (value: string) => string
}) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="customer_name" className="text-foreground">
          Nome Completo *
        </Label>
        <Input
          id="customer_name"
          placeholder="Digite seu nome"
          value={formData.customer_name}
          onChange={(e) => updateField("customer_name", e.target.value)}
          className="bg-background border-input"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="customer_phone" className="text-foreground">
          WhatsApp *
        </Label>
        <Input
          id="customer_phone"
          type="tel"
          placeholder="(37) 99999-9999"
          value={formData.customer_phone}
          onChange={(e) => updateField("customer_phone", formatPhone(e.target.value))}
          className="bg-background border-input"
        />
        <p className="text-xs text-muted-foreground">Usaremos este número para enviar atualizações sobre seu reparo.</p>
      </div>
    </div>
  )
}

// Step 2: Device Data
function StepDeviceData({
  formData,
  updateField,
}: {
  formData: FormData
  updateField: <K extends keyof FormData>(field: K, value: FormData[K]) => void
}) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="device_brand" className="text-foreground">
          Marca do Aparelho *
        </Label>
        <Select value={formData.device_brand} onValueChange={(value) => updateField("device_brand", value)}>
          <SelectTrigger className="bg-background border-input">
            <SelectValue placeholder="Selecione a marca" />
          </SelectTrigger>
          <SelectContent>
            {DEVICE_BRANDS.map((brand) => (
              <SelectItem key={brand} value={brand}>
                {brand}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="device_model" className="text-foreground">
          Modelo *
        </Label>
        <Input
          id="device_model"
          placeholder="Ex: iPhone 14, Galaxy S23..."
          value={formData.device_model}
          onChange={(e) => updateField("device_model", e.target.value)}
          className="bg-background border-input"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="device_password" className="text-foreground">
          Senha de Desbloqueio (opcional)
        </Label>
        <Input
          id="device_password"
          placeholder="PIN, padrão ou senha"
          value={formData.device_password}
          onChange={(e) => updateField("device_password", e.target.value)}
          className="bg-background border-input"
        />
        <p className="text-xs text-muted-foreground">
          A senha pode ser necessária para testar o aparelho após o reparo.
        </p>
      </div>
    </div>
  )
}

// Step 3: Problem
function StepProblem({
  formData,
  updateField,
}: {
  formData: FormData
  updateField: <K extends keyof FormData>(field: K, value: FormData[K]) => void
}) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="problem_type" className="text-foreground">
          Tipo de Problema *
        </Label>
        <Select value={formData.problem_type} onValueChange={(value) => updateField("problem_type", value)}>
          <SelectTrigger className="bg-background border-input">
            <SelectValue placeholder="Selecione o problema" />
          </SelectTrigger>
          <SelectContent>
            {PROBLEM_TYPES.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="problem_description" className="text-foreground">
          Descreva o Problema (opcional)
        </Label>
        <Textarea
          id="problem_description"
          placeholder="Conte mais detalhes sobre o que aconteceu..."
          value={formData.problem_description}
          onChange={(e) => updateField("problem_description", e.target.value)}
          rows={4}
          className="bg-background border-input resize-none"
        />
      </div>
    </div>
  )
}

// Step 4: Delivery
function StepDelivery({
  formData,
  updateField,
}: {
  formData: FormData
  updateField: <K extends keyof FormData>(field: K, value: FormData[K]) => void
}) {
  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <Label className="text-foreground">Como deseja entregar o aparelho? *</Label>
        <RadioGroup
          value={formData.delivery_type}
          onValueChange={(value) => updateField("delivery_type", value as DeliveryType)}
          className="space-y-3"
        >
          <div className="flex items-center space-x-3 p-4 border border-input rounded-lg hover:border-primary/50 transition-colors cursor-pointer">
            <RadioGroupItem value="store" id="store" />
            <Label htmlFor="store" className="flex-1 cursor-pointer">
              <span className="font-medium text-foreground">Vou levar na loja</span>
              <p className="text-xs text-muted-foreground mt-1">Av. Anhanguera, 1286 - Jardim dos Candidés</p>
            </Label>
          </div>
          <div className="flex items-center space-x-3 p-4 border border-input rounded-lg hover:border-primary/50 transition-colors cursor-pointer">
            <RadioGroupItem value="delivery" id="delivery" />
            <Label htmlFor="delivery" className="flex-1 cursor-pointer">
              <span className="font-medium text-foreground">Quero que busquem (Delivery)</span>
              <p className="text-xs text-muted-foreground mt-1">Buscamos e entregamos na sua casa*</p>
            </Label>
          </div>
        </RadioGroup>
      </div>

      {formData.delivery_type === "delivery" && (
        <div className="space-y-2 animate-in slide-in-from-top-2">
          <Label htmlFor="delivery_address" className="text-foreground">
            Endereço para Busca *
          </Label>
          <Textarea
            id="delivery_address"
            placeholder="Rua, número, bairro, ponto de referência..."
            value={formData.delivery_address}
            onChange={(e) => updateField("delivery_address", e.target.value)}
            rows={3}
            className="bg-background border-input resize-none"
          />
          <p className="text-xs text-muted-foreground">* Consulte disponibilidade e valor do frete para sua região.</p>
        </div>
      )}
    </div>
  )
}

// Success Screen
function SuccessScreen({ onClose }: { onClose: () => void }) {
  return (
    <div className="text-center py-8">
      <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
        <CheckCircle2 className="w-8 h-8 text-accent" />
      </div>
      <h3 className="text-xl font-semibold text-foreground mb-2">Orçamento Enviado!</h3>
      <p className="text-muted-foreground mb-6">
        Recebemos seu pré-orçamento. Entraremos em contato pelo WhatsApp em breve para passar o valor e agendar o
        serviço.
      </p>
      <Button onClick={onClose}>
        Fechar
      </Button>
    </div>
  )
}
