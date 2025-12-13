// =====================================================
// TIPOS DO BANCO DE DADOS - SAYMON CELL
// Seguindo princípios SOLID: Interface Segregation
// =====================================================

export type UserRole = "admin" | "technician" | "attendant"

export type ServiceOrderStatus =
  | "lead"
  | "awaiting_device"
  | "in_analysis"
  | "awaiting_approval"
  | "in_repair"
  | "ready"
  | "delivered"
  | "cancelled"

export type LeadStatus = "pending" | "contacted" | "converted" | "rejected"

export type DeliveryType = "store" | "delivery"

export type TransactionType = "income" | "expense" | "withdrawal" | "deposit"

export type ProductCategory = "accessory" | "part" | "service" | "other"

// Entidades do banco
export interface Profile {
  id: string
  full_name: string
  role: UserRole
  phone: string | null
  commission_rate: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Customer {
  id: string
  name: string
  phone: string
  email: string | null
  address: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface DeviceBrand {
  id: string
  name: string
  is_active: boolean
  created_at: string
}

export interface DeviceModel {
  id: string
  brand_id: string
  name: string
  is_active: boolean
  created_at: string
}

export interface ProblemType {
  id: string
  name: string
  description: string | null
  estimated_price: number | null
  is_active: boolean
  created_at: string
}

export interface EntryChecklist {
  screen_condition: "ok" | "cracked" | "broken" | null
  turns_on: boolean | null
  touch_works: boolean | null
  cameras_work: boolean | null
  buttons_work: boolean | null
  charging_port_ok: boolean | null
  speakers_ok: boolean | null
  microphone_ok: boolean | null
  physical_damage: string | null
  accessories_received: string | null
  notes: string | null
}

export interface ServiceOrder {
  id: string
  order_number: number
  customer_id: string
  technician_id: string | null
  device_brand: string
  device_model: string
  device_password: string | null
  device_imei: string | null
  device_color: string | null
  problem_description: string
  problem_type_id: string | null
  diagnosis: string | null
  status: ServiceOrderStatus
  entry_checklist: EntryChecklist
  estimated_price: number | null
  final_price: number | null
  parts_cost: number
  delivery_type: DeliveryType
  delivery_address: string | null
  received_at: string | null
  approved_at: string | null
  completed_at: string | null
  delivered_at: string | null
  notes: string | null
  created_at: string
  updated_at: string
  // Relacionamentos
  customer?: Customer
  technician?: Profile
  problem_type?: ProblemType
}

export interface ServiceOrderHistory {
  id: string
  service_order_id: string
  user_id: string | null
  previous_status: string | null
  new_status: string
  notes: string | null
  created_at: string
}

export interface Product {
  id: string
  barcode: string | null
  name: string
  description: string | null
  category: ProductCategory
  purchase_price: number
  sale_price: number
  stock_quantity: number
  min_stock: number
  is_active: boolean
  image_url: string | null
  show_in_store: boolean
  created_at: string
  updated_at: string
}

export interface PaymentMethod {
  id: string
  name: string
  fee_percentage: number
  is_active: boolean
  created_at: string
}

export interface Sale {
  id: string
  sale_number: number
  customer_id: string | null
  service_order_id: string | null
  user_id: string
  subtotal: number
  discount: number
  total: number
  payment_method_id: string | null
  payment_fee: number
  net_total: number
  notes: string | null
  created_at: string
  // Relacionamentos
  customer?: Customer
  service_order?: ServiceOrder
  payment_method?: PaymentMethod
  items?: SaleItem[]
}

export interface SaleItem {
  id: string
  sale_id: string
  product_id: string | null
  description: string
  quantity: number
  unit_price: number
  total_price: number
  created_at: string
  // Relacionamentos
  product?: Product
}

export interface ExpenseCategory {
  id: string
  name: string
  color: string
  is_active: boolean
  created_at: string
}

export interface CashTransaction {
  id: string
  type: TransactionType
  category_id: string | null
  sale_id: string | null
  description: string
  amount: number
  user_id: string
  notes: string | null
  due_date: string | null
  paid_at: string | null
  is_paid: boolean
  created_at: string
  // Relacionamentos
  category?: ExpenseCategory
  sale?: Sale
  user?: Profile
}

export interface Lead {
  id: string
  customer_name: string
  customer_phone: string
  device_brand: string
  device_model: string
  device_password: string | null
  problem_type: string
  problem_description: string | null
  delivery_type: DeliveryType
  delivery_address: string | null
  status: LeadStatus
  converted_order_id: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

// DTOs para criação/atualização
export interface CreateLeadDTO {
  customer_name: string
  customer_phone: string
  device_brand: string
  device_model: string
  device_password?: string
  problem_type: string
  problem_description?: string
  delivery_type: DeliveryType
  delivery_address?: string
}

export interface CreateServiceOrderDTO {
  customer_id: string
  device_brand: string
  device_model: string
  device_password?: string
  device_imei?: string
  device_color?: string
  problem_description: string
  problem_type_id?: string
  delivery_type: DeliveryType
  delivery_address?: string
  estimated_price?: number
}

export interface UpdateServiceOrderDTO {
  technician_id?: string
  diagnosis?: string
  status?: ServiceOrderStatus
  entry_checklist?: EntryChecklist
  estimated_price?: number
  final_price?: number
  parts_cost?: number
  notes?: string
}

export interface CartItem {
  product: Product
  quantity: number
}
