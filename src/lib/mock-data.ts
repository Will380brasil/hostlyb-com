export type PropertyStatus = "ocupado" | "livre" | "limpeza" | "manutencao";
export type CleaningStatus = "agendado" | "em_andamento" | "concluido" | "cancelado";
export type GuestStatus = "confirmado" | "hospedado" | "checkout";

export interface Property {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  status: PropertyStatus;
  bedrooms: number;
  bathrooms: number;
  max_guests: number;
  wifi_password: string;
  notes?: string;
  income_monthly: number;
  rating: number;
}

export interface Cleaner {
  id: string;
  name: string;
  phone: string;
  email?: string;
  pix_key?: string;
  price_per_cleaning: number;
  rating: number;
  total_cleanings: number;
  is_active: boolean;
  notes?: string;
}

export interface ChecklistItem {
  item: string;
  done: boolean;
}

export interface CleaningJob {
  id: string;
  property_id: string;
  cleaner_id: string;
  scheduled_date: string; // YYYY-MM-DD
  scheduled_time: string; // HH:MM
  status: CleaningStatus;
  checklist: ChecklistItem[];
  payment_status: "pendente" | "pago";
  payment_amount: number;
  notes?: string;
}

export interface Guest {
  id: string;
  property_id: string;
  name: string;
  email?: string;
  phone?: string;
  document?: string;
  checkin_date: string;
  checkout_date: string;
  status: GuestStatus;
  nights: number;
  total_value: number;
  platform: "airbnb" | "booking" | "direto";
  rating?: number;
}

export const properties: Property[] = [
  {
    id: "p1",
    name: "Apt Jardins 201",
    address: "Rua Augusta, 1200",
    city: "São Paulo",
    state: "SP",
    zip_code: "01305-100",
    status: "ocupado",
    bedrooms: 2,
    bathrooms: 1,
    max_guests: 4,
    wifi_password: "jardins2024",
    income_monthly: 6800,
    rating: 4.9,
  },
  {
    id: "p2",
    name: "Studio Ipanema",
    address: "Rua Visconde de Pirajá, 550",
    city: "Rio de Janeiro",
    state: "RJ",
    zip_code: "22410-002",
    status: "limpeza",
    bedrooms: 1,
    bathrooms: 1,
    max_guests: 2,
    wifi_password: "ipanema2024",
    income_monthly: 4500,
    rating: 4.8,
  },
  {
    id: "p3",
    name: "Casa Maresias",
    address: "Rua das Conchas, 45",
    city: "São Sebastião",
    state: "SP",
    zip_code: "11612-000",
    status: "livre",
    bedrooms: 3,
    bathrooms: 2,
    max_guests: 8,
    wifi_password: "praia2024",
    income_monthly: 9200,
    rating: 5.0,
  },
];

export const cleaners: Cleaner[] = [
  {
    id: "c1",
    name: "Ana Costa",
    phone: "5511987654321",
    email: "ana@example.com",
    pix_key: "ana@example.com",
    price_per_cleaning: 120,
    rating: 4.9,
    total_cleanings: 47,
    is_active: true,
  },
  {
    id: "c2",
    name: "Pedro Silva",
    phone: "5521998765432",
    price_per_cleaning: 110,
    rating: 4.7,
    total_cleanings: 32,
    is_active: true,
  },
  {
    id: "c3",
    name: "Mariana Souza",
    phone: "5511976543210",
    price_per_cleaning: 130,
    rating: 5.0,
    total_cleanings: 61,
    is_active: true,
  },
];

const defaultChecklist: ChecklistItem[] = [
  { item: "Sala de estar", done: false },
  { item: "Cozinha completa", done: false },
  { item: "Banheiros", done: false },
  { item: "Quartos", done: false },
  { item: "Troca de roupas de cama", done: false },
  { item: "Reposição de amenities", done: false },
  { item: "Aspiração", done: false },
];

const today = new Date();
const fmt = (d: Date) => d.toISOString().slice(0, 10);
const addDays = (n: number) => {
  const d = new Date(today);
  d.setDate(d.getDate() + n);
  return fmt(d);
};

export const cleaningJobs: CleaningJob[] = [
  {
    id: "j1",
    property_id: "p2",
    cleaner_id: "c1",
    scheduled_date: addDays(0),
    scheduled_time: "11:00",
    status: "em_andamento",
    checklist: defaultChecklist.map((c, i) => ({ ...c, done: i < 3 })),
    payment_status: "pendente",
    payment_amount: 120,
  },
  {
    id: "j2",
    property_id: "p1",
    cleaner_id: "c3",
    scheduled_date: addDays(1),
    scheduled_time: "10:00",
    status: "agendado",
    checklist: defaultChecklist,
    payment_status: "pendente",
    payment_amount: 130,
  },
  {
    id: "j3",
    property_id: "p3",
    cleaner_id: "c2",
    scheduled_date: addDays(3),
    scheduled_time: "14:00",
    status: "agendado",
    checklist: defaultChecklist,
    payment_status: "pendente",
    payment_amount: 110,
  },
];

export const guests: Guest[] = [
  {
    id: "g1",
    property_id: "p1",
    name: "Lucas Mendes",
    email: "lucas@example.com",
    phone: "5511991112233",
    document: "123.456.789-00",
    checkin_date: addDays(-2),
    checkout_date: addDays(1),
    status: "hospedado",
    nights: 3,
    total_value: 960,
    platform: "airbnb",
  },
  {
    id: "g2",
    property_id: "p3",
    name: "Camila Torres",
    phone: "5521987776655",
    checkin_date: addDays(5),
    checkout_date: addDays(9),
    status: "confirmado",
    nights: 4,
    total_value: 2200,
    platform: "booking",
  },
  {
    id: "g3",
    property_id: "p2",
    name: "Rafael Gomes",
    phone: "5511955554444",
    checkin_date: addDays(-5),
    checkout_date: addDays(0),
    status: "checkout",
    nights: 5,
    total_value: 1400,
    platform: "direto",
    rating: 5,
  },
];

export const formatBRL = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export const formatPhone = (raw: string) => {
  const d = raw.replace(/\D/g, "");
  if (d.length === 13) return `+${d.slice(0,2)} (${d.slice(2,4)}) ${d.slice(4,9)}-${d.slice(9)}`;
  return raw;
};

export const fullAddress = (p: Property) =>
  `${p.address}, ${p.city} - ${p.state}, ${p.zip_code}`;

export const getProperty = (id: string) => properties.find((p) => p.id === id);
export const getCleaner = (id: string) => cleaners.find((c) => c.id === id);
