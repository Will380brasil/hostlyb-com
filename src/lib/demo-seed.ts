// In-memory seed data for the /demo sandbox.
// Edits live in React state — never touch the database.

const today = () => new Date();
const addDays = (n: number) => {
  const d = today(); d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
};

export type DemoProperty = {
  id: string; name: string; address: string; city: string;
  bedrooms: number; bathrooms: number; status: "livre" | "ocupado" | "limpeza";
  income_monthly: number; rating: number;
};
export type DemoGuest = {
  id: string; name: string; property_id: string; checkin_date: string; checkout_date: string;
  status: "confirmado" | "hospedado" | "checkout"; total_value: number; platform: string; nights: number;
};
export type DemoCleaning = {
  id: string; property_id: string; cleaner_id: string;
  scheduled_date: string; scheduled_time: string;
  status: "agendado" | "em_andamento" | "concluido"; payment_amount: number;
};
export type DemoCleaner = { id: string; name: string; phone: string; rating: number; total_cleanings: number; };

export const seedProperties: DemoProperty[] = [
  { id: "p1", name: "Loft Vista Mar", address: "Av. Atlântica 1500, ap 1201", city: "Rio de Janeiro", bedrooms: 1, bathrooms: 1, status: "ocupado", income_monthly: 8400, rating: 4.9 },
  { id: "p2", name: "Studio Pinheiros", address: "Rua dos Pinheiros 280, ap 52", city: "São Paulo", bedrooms: 1, bathrooms: 1, status: "limpeza", income_monthly: 6200, rating: 4.8 },
  { id: "p3", name: "Casa Jardim Botânico", address: "Rua Jardim Botânico 800", city: "Rio de Janeiro", bedrooms: 3, bathrooms: 2, status: "livre", income_monthly: 12500, rating: 5.0 },
  { id: "p4", name: "Apto Centro Histórico", address: "Praça da Sé 30, ap 705", city: "São Paulo", bedrooms: 2, bathrooms: 1, status: "livre", income_monthly: 5400, rating: 4.6 },
];

export const seedCleaners: DemoCleaner[] = [
  { id: "c1", name: "Maria Aparecida", phone: "(11) 98765-4321", rating: 5.0, total_cleanings: 124 },
  { id: "c2", name: "Joana Silva",     phone: "(21) 99888-7766", rating: 4.9, total_cleanings: 87 },
];

export const seedGuests: DemoGuest[] = [
  { id: "g1", name: "Carlos Mendes",   property_id: "p1", checkin_date: addDays(-2), checkout_date: addDays(3), status: "hospedado",  total_value: 2400, platform: "airbnb",  nights: 5 },
  { id: "g2", name: "Ana Beatriz",     property_id: "p2", checkin_date: addDays(-5), checkout_date: addDays(-1), status: "checkout",  total_value: 1800, platform: "booking", nights: 4 },
  { id: "g3", name: "Família Tanaka",  property_id: "p3", checkin_date: addDays(7),  checkout_date: addDays(14), status: "confirmado", total_value: 6300, platform: "airbnb",  nights: 7 },
  { id: "g4", name: "Lucas Oliveira",  property_id: "p4", checkin_date: addDays(2),  checkout_date: addDays(5),  status: "confirmado", total_value: 1650, platform: "direct",  nights: 3 },
];

export const seedCleanings: DemoCleaning[] = [
  { id: "cl1", property_id: "p2", cleaner_id: "c1", scheduled_date: addDays(0), scheduled_time: "11:00", status: "em_andamento", payment_amount: 150 },
  { id: "cl2", property_id: "p1", cleaner_id: "c2", scheduled_date: addDays(3), scheduled_time: "12:00", status: "agendado",     payment_amount: 180 },
  { id: "cl3", property_id: "p4", cleaner_id: "c1", scheduled_date: addDays(5), scheduled_time: "10:00", status: "agendado",     payment_amount: 140 },
  { id: "cl4", property_id: "p3", cleaner_id: "c2", scheduled_date: addDays(-3), scheduled_time: "11:00", status: "concluido",   payment_amount: 220 },
];

export function computeKpis(props: DemoProperty[], guests: DemoGuest[], cleanings: DemoCleaning[]) {
  const occupied = props.filter((p) => p.status === "ocupado").length;
  const cleaning = props.filter((p) => p.status === "limpeza").length;
  const free = props.filter((p) => p.status === "livre").length;
  const monthlyRevenue = props.reduce((s, p) => s + p.income_monthly, 0);
  const upcomingCheckins = guests.filter((g) => g.status === "confirmado").length;
  const cleaningsThisWeek = cleanings.filter((c) => {
    const d = new Date(c.scheduled_date).getTime();
    const now = Date.now();
    return d >= now - 86400000 && d <= now + 7 * 86400000;
  }).length;
  return { occupied, cleaning, free, monthlyRevenue, upcomingCheckins, cleaningsThisWeek, totalProps: props.length };
}
