"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Loader2, Search, UserPlus, Smartphone, AlertTriangle } from "lucide-react"
import { createServiceOrder } from "@/lib/actions/service-order-actions"
import { createCustomer, searchCustomers } from "@/lib/actions/customer-actions"
import type { ProblemType, Lead, DeliveryType, EntryChecklist, Customer } from "@/types/database"
import { createClient } from "@/lib/supabase/client"

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

interface NewOrderFormProps {
  problemTypes: ProblemType[]
  leadData?: Lead | null
}

export function NewOrderForm({ problemTypes, leadData }: NewOrderFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Customer state
  const [customerSearch, setCustomerSearch] = useState("")
  const [searchResults, setSearchResults] = useState<Customer[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [showNewCustomerForm, setShowNewCustomerForm] = useState(false)
  const [newCustomer, setNewCustomer] = useState({ name: "", phone: "", email: "" })

  // Order state
  const [deviceBrand, setDeviceBrand] = useState(leadData?.device_brand || "")
  const [deviceModel, setDeviceModel] = useState(leadData?.device_model || "")
  const [devicePassword, setDevicePassword] = useState(leadData?.device_password || "")
  const [deviceImei, setDeviceImei] = useState("")
  const [deviceColor, setDeviceColor] = useState("")
  const [problemTypeId, setProblemTypeId] = useState("")
  const [problemDescription, setProblemDescription] = useState(
    leadData
      ? `${leadData.problem_type}${leadData.problem_description ? ` - ${leadData.problem_description}` : ""}`
      : "",
  )
  const [deliveryType, setDeliveryType] = useState<DeliveryType>(leadData?.delivery_type || "store")
  const [deliveryAddress, setDeliveryAddress] = useState(leadData?.delivery_address || "")
  const [estimatedPrice, setEstimatedPrice] = useState("")

  // Entry checklist
  const [checklist, setChecklist] = useState<Partial<EntryChecklist>>({
    turns_on: null,
    touch_works: null,
    cameras_work: null,
    buttons_work: null,
    charging_port_ok: null,
    speakers_ok: null,
    microphone_ok: null,
    physical_damage: "",
    accessories_received: "",
    notes: "",
  })

  // Se vier de um lead, criar cliente automaticamente
  useEffect(() => {
    if (leadData) {
      setNewCustomer({
        name: leadData.customer_name,
        phone: leadData.customer_phone,
        email: "",
      })
      setShowNewCustomerForm(true)
    }
  }, [leadData])

  // Search customers
  useEffect(() => {
    const search = async () => {
      if (customerSearch.length >= 2) {
        const results = await searchCustomers(customerSearch)
        setSearchResults(results as Customer[])
      } else {
        setSearchResults([])
      }
    }
    const debounce = setTimeout(search, 300)
    return () => clearTimeout(debounce)
  }, [customerSearch])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      let customerId = selectedCustomer?.id

      // Criar cliente se necessário
      if (!customerId && showNewCustomerForm) {
        const customerResult = await createCustomer({
          name: newCustomer.name,
          phone: newCustomer.phone,
          email: newCustomer.email || undefined,
        })

        if (!customerResult.success) {
          setError(customerResult.message)
          setIsSubmitting(false)
          return
        }

        customerId = customerResult.data?.id
      }

      if (!customerId) {
        setError("Selecione ou cadastre um cliente")
        setIsSubmitting(false)
        return
      }

      // Criar ordem de serviço
      const orderResult = await createServiceOrder({
        customer_id: customerId,
        device_brand: deviceBrand,
        device_model: deviceModel,
        device_password: devicePassword || undefined,
        device_imei: deviceImei || undefined,
        device_color: deviceColor || undefined,
        problem_description: problemDescription,
        problem_type_id: problemTypeId || undefined,
        delivery_type: deliveryType,
        delivery_address: deliveryType === "delivery" ? deliveryAddress : undefined,
        estimated_price: estimatedPrice ? Number.parseFloat(estimatedPrice) : undefined,
      })

      if (!orderResult.success) {
        setError(orderResult.message)
        setIsSubmitting(false)
        return
      }

      // Se era um lead, marcar como convertido
      if (leadData) {
        const supabase = createClient()
        await supabase
          .from("leads")
          .update({ status: "converted", converted_order_id: orderResult.data?.id })
          .eq("id", leadData.id)
      }

      router.push("/admin/orders")
    } catch {
      setError("Erro inesperado ao criar ordem de serviço")
      setIsSubmitting(false)
    }
  }

  const updateChecklist = (key: keyof EntryChecklist, value: boolean | string | null) => {
    setChecklist((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
      {/* Cliente */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg text-foreground flex items-center gap-2">
            <Search className="w-5 h-5" />
            Cliente
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!showNewCustomerForm ? (
            <>
              <div className="space-y-2">
                <Label className="text-foreground">Buscar Cliente</Label>
                <Input
                  placeholder="Digite o nome ou telefone..."
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                  className="bg-background border-input"
                />
              </div>

              {searchResults.length > 0 && (
                <div className="border border-border rounded-lg divide-y divide-border">
                  {searchResults.map((customer) => (
                    <button
                      key={customer.id}
                      type="button"
                      onClick={() => {
                        setSelectedCustomer(customer)
                        setSearchResults([])
                        setCustomerSearch("")
                      }}
                      className="w-full p-3 text-left hover:bg-secondary/50 transition-colors"
                    >
                      <p className="font-medium text-foreground">{customer.name}</p>
                      <p className="text-sm text-muted-foreground">{customer.phone}</p>
                    </button>
                  ))}
                </div>
              )}

              {selectedCustomer && (
                <div className="p-4 bg-secondary/30 rounded-lg">
                  <p className="font-medium text-foreground">{selectedCustomer.name}</p>
                  <p className="text-sm text-muted-foreground">{selectedCustomer.phone}</p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedCustomer(null)}
                    className="mt-2 text-destructive"
                  >
                    Remover seleção
                  </Button>
                </div>
              )}

              <Button
                type="button"
                variant="outline"
                onClick={() => setShowNewCustomerForm(true)}
                className="w-full bg-transparent"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Cadastrar Novo Cliente
              </Button>
            </>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-foreground">Nome *</Label>
                  <Input
                    value={newCustomer.name}
                    onChange={(e) => setNewCustomer((prev) => ({ ...prev, name: e.target.value }))}
                    className="bg-background border-input"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-foreground">Telefone *</Label>
                  <Input
                    value={newCustomer.phone}
                    onChange={(e) => setNewCustomer((prev) => ({ ...prev, phone: e.target.value }))}
                    className="bg-background border-input"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">Email</Label>
                <Input
                  type="email"
                  value={newCustomer.email}
                  onChange={(e) => setNewCustomer((prev) => ({ ...prev, email: e.target.value }))}
                  className="bg-background border-input"
                />
              </div>
              {!leadData && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowNewCustomerForm(false)}
                  className="text-muted-foreground"
                >
                  Voltar para busca
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Aparelho */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg text-foreground flex items-center gap-2">
            <Smartphone className="w-5 h-5" />
            Dados do Aparelho
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-foreground">Marca *</Label>
              <Select value={deviceBrand} onValueChange={setDeviceBrand} required>
                <SelectTrigger className="bg-background border-input">
                  <SelectValue placeholder="Selecione" />
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
              <Label className="text-foreground">Modelo *</Label>
              <Input
                value={deviceModel}
                onChange={(e) => setDeviceModel(e.target.value)}
                placeholder="Ex: iPhone 14 Pro"
                className="bg-background border-input"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-foreground">Cor</Label>
              <Input
                value={deviceColor}
                onChange={(e) => setDeviceColor(e.target.value)}
                placeholder="Ex: Preto"
                className="bg-background border-input"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">IMEI</Label>
              <Input
                value={deviceImei}
                onChange={(e) => setDeviceImei(e.target.value)}
                placeholder="Opcional"
                className="bg-background border-input"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">Senha</Label>
              <Input
                value={devicePassword}
                onChange={(e) => setDevicePassword(e.target.value)}
                placeholder="PIN/Padrão"
                className="bg-background border-input"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-foreground">Tipo de Problema</Label>
            <Select value={problemTypeId} onValueChange={setProblemTypeId}>
              <SelectTrigger className="bg-background border-input">
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                {problemTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id}>
                    {type.name} {type.estimated_price && `- R$ ${type.estimated_price.toFixed(2)}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-foreground">Descrição do Problema *</Label>
            <Textarea
              value={problemDescription}
              onChange={(e) => setProblemDescription(e.target.value)}
              placeholder="Descreva o defeito relatado pelo cliente..."
              rows={3}
              className="bg-background border-input resize-none"
              required
            />
          </div>
        </CardContent>
      </Card>

      {/* Checklist de Entrada */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg text-foreground flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-500" />
            Checklist de Entrada
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Marque o estado do aparelho na entrada para evitar problemas futuros.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { key: "turns_on", label: "Liga?" },
              { key: "touch_works", label: "Touch OK?" },
              { key: "cameras_work", label: "Câmeras OK?" },
              { key: "buttons_work", label: "Botões OK?" },
              { key: "charging_port_ok", label: "Carrega?" },
              { key: "speakers_ok", label: "Som OK?" },
              { key: "microphone_ok", label: "Mic OK?" },
            ].map((item) => (
              <div key={item.key} className="flex items-center space-x-2">
                <Checkbox
                  id={item.key}
                  checked={checklist[item.key as keyof EntryChecklist] === true}
                  onCheckedChange={(checked) =>
                    updateChecklist(item.key as keyof EntryChecklist, checked === true ? true : false)
                  }
                />
                <Label htmlFor={item.key} className="text-sm text-foreground cursor-pointer">
                  {item.label}
                </Label>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <Label className="text-foreground">Danos físicos visíveis</Label>
            <Textarea
              value={(checklist.physical_damage as string) || ""}
              onChange={(e) => updateChecklist("physical_damage", e.target.value)}
              placeholder="Ex: Arranhões na traseira, vidro trincado..."
              rows={2}
              className="bg-background border-input resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-foreground">Acessórios recebidos</Label>
            <Input
              value={(checklist.accessories_received as string) || ""}
              onChange={(e) => updateChecklist("accessories_received", e.target.value)}
              placeholder="Ex: Carregador, capinha..."
              className="bg-background border-input"
            />
          </div>
        </CardContent>
      </Card>

      {/* Entrega e Valor */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg text-foreground">Entrega e Valor Estimado</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <Label className="text-foreground">Tipo de Entrega</Label>
            <RadioGroup
              value={deliveryType}
              onValueChange={(value) => setDeliveryType(value as DeliveryType)}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="store" id="store" />
                <Label htmlFor="store" className="cursor-pointer text-foreground">
                  Na loja
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="delivery" id="delivery" />
                <Label htmlFor="delivery" className="cursor-pointer text-foreground">
                  Delivery
                </Label>
              </div>
            </RadioGroup>
          </div>

          {deliveryType === "delivery" && (
            <div className="space-y-2">
              <Label className="text-foreground">Endereço para entrega</Label>
              <Textarea
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                placeholder="Endereço completo..."
                rows={2}
                className="bg-background border-input resize-none"
              />
            </div>
          )}

          <div className="space-y-2 max-w-xs">
            <Label className="text-foreground">Valor Estimado (R$)</Label>
            <Input
              type="number"
              step="0.01"
              value={estimatedPrice}
              onChange={(e) => setEstimatedPrice(e.target.value)}
              placeholder="0,00"
              className="bg-background border-input"
            />
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      <div className="flex gap-4">
        <Button type="button" variant="outline" onClick={() => router.back()} className="bg-transparent">
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Criando...
            </>
          ) : (
            "Criar Ordem de Serviço"
          )}
        </Button>
      </div>
    </form>
  )
}
