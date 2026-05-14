import * as XLSX from "xlsx";

const COLUMN_ALIASES: Record<string, string> = {
  // name (guests)
  "nome do hospede": "name", "nome do hóspede": "name", "nome": "name", "guest name": "name", "nom": "name", "nom du client": "name",
  // email
  "email": "email", "e-mail": "email", "courriel": "email",
  // phone
  "telefone": "phone", "phone": "phone", "telephone": "phone", "téléphone": "phone", "tel": "phone",
  // property
  "imovel": "property_name", "imóvel": "property_name", "property": "property_name", "bien": "property_name", "appartement": "property_name", "logement": "property_name",
  // dates
  "check-in": "checkin_date", "checkin": "checkin_date", "check in": "checkin_date", "data checkin": "checkin_date", "data check-in": "checkin_date", "arrivee": "checkin_date", "arrivée": "checkin_date",
  "check-out": "checkout_date", "checkout": "checkout_date", "check out": "checkout_date", "data checkout": "checkout_date", "data check-out": "checkout_date", "depart": "checkout_date", "départ": "checkout_date",
  // value
  "valor total": "total_value", "valor": "total_value", "total": "total_value", "montant": "total_value", "prix": "total_value",
  // platform/status/notes
  "plataforma": "platform", "platform": "platform", "source": "platform", "canal": "platform",
  "status": "status", "statut": "status", "état": "status", "etat": "status",
  "notas": "notes", "notes": "notes", "observacoes": "notes", "observações": "notes", "remarques": "notes",
  // properties
  "nome do imovel": "name", "nome do imóvel": "name", "property name": "name", "nom du bien": "name",
  "endereco": "address", "endereço": "address", "address": "address", "adresse": "address", "rua": "address",
  "cidade": "city", "city": "city", "ville": "city",
  "estado": "state", "region": "state", "région": "state",
  "cep": "zip_code", "zip": "zip_code", "code postal": "zip_code", "postal code": "zip_code", "codigo postal": "zip_code",
  "quartos": "bedrooms", "bedrooms": "bedrooms", "chambres": "bedrooms",
  "banheiros": "bathrooms", "bathrooms": "bathrooms", "salles de bain": "bathrooms",
  "capacidade maxima": "max_guests", "capacidade máxima": "max_guests", "max guests": "max_guests", "capacite": "max_guests", "capacité": "max_guests", "hospedes": "max_guests", "hóspedes": "max_guests",
  "senha wifi": "wifi_password", "wifi": "wifi_password", "wifi password": "wifi_password",
  // financial
  "tipo": "type", "type": "type",
  "valor *": "amount", "amount": "amount",
  "data": "date", "date": "date",
  "categoria": "category", "category": "category", "catégorie": "category",
  "metodo": "payment_method", "método": "payment_method", "method": "payment_method", "méthode": "payment_method", "pagamento": "payment_method",
  "descricao": "description", "descrição": "description", "description": "description",
};

function normalize(h: string): string {
  return String(h)
    .toLowerCase()
    .trim()
    .replace(/\*/g, "")
    .replace(/\(.*?\)/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function parseDateValue(value: unknown): string | null {
  if (value === null || value === undefined || value === "") return null;
  // Excel serial date
  if (typeof value === "number" && value > 10000 && value < 80000) {
    const d = XLSX.SSF.parse_date_code(value);
    if (d) return `${d.y}-${String(d.m).padStart(2, "0")}-${String(d.d).padStart(2, "0")}`;
  }
  const s = String(value).trim();
  const dmy = s.match(/^(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{2,4})$/);
  if (dmy) {
    const [, d, m, y] = dmy;
    const yr = y.length === 2 ? `20${y}` : y;
    const dt = new Date(`${yr}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`);
    return isNaN(dt.getTime()) ? null : `${yr}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  const dt = new Date(s);
  return isNaN(dt.getTime()) ? null : dt.toISOString().split("T")[0];
}

function mapRow(headers: string[], row: unknown[]): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  headers.forEach((h, i) => {
    const key = COLUMN_ALIASES[normalize(h)];
    if (key && row[i] !== undefined && row[i] !== null && row[i] !== "") {
      out[key] = row[i];
    }
  });
  return out;
}

export type ImportType = "guests" | "properties" | "financial" | "unknown";

export interface ParsedSpreadsheet {
  type: ImportType;
  rows: Record<string, unknown>[];
  errors: string[];
  totalRows: number;
  validRows: number;
}

export function parseSpreadsheet(file: File): Promise<ParsedSpreadsheet> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const wb = XLSX.read(data, { type: "array", cellDates: false });
        const sheet = wb.Sheets[wb.SheetNames[0]];
        const raw = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, defval: "", blankrows: false });
        if (raw.length < 2) {
          resolve({ type: "unknown", rows: [], errors: ["Planilha vazia."], totalRows: 0, validRows: 0 });
          return;
        }
        const headers = (raw[0] as unknown[]).map(String);
        const dataRows = raw.slice(1);
        const mapped = headers.map((h) => COLUMN_ALIASES[normalize(h)]);

        let type: ImportType = "unknown";
        if (mapped.includes("checkin_date") || mapped.includes("checkout_date")) type = "guests";
        else if (mapped.includes("type") && (mapped.includes("amount") || mapped.includes("category"))) type = "financial";
        else if (mapped.includes("address") || mapped.includes("bedrooms")) type = "properties";

        const errors: string[] = [];
        const rows: Record<string, unknown>[] = [];

        dataRows.forEach((r, i) => {
          const rowNum = i + 2;
          const m = mapRow(headers, r as unknown[]);

          if (type === "guests") {
            if (!m.name) return errors.push(`Linha ${rowNum}: nome obrigatório`);
            if (!m.checkin_date) return errors.push(`Linha ${rowNum}: check-in obrigatório`);
            if (!m.checkout_date) return errors.push(`Linha ${rowNum}: check-out obrigatório`);
            const ci = parseDateValue(m.checkin_date);
            const co = parseDateValue(m.checkout_date);
            if (!ci) return errors.push(`Linha ${rowNum}: check-in inválido (use DD/MM/AAAA)`);
            if (!co) return errors.push(`Linha ${rowNum}: check-out inválido (use DD/MM/AAAA)`);
            if (co <= ci) return errors.push(`Linha ${rowNum}: check-out deve ser após check-in`);
            m.checkin_date = ci;
            m.checkout_date = co;
            const plat = String(m.platform || "direto").toLowerCase();
            m.platform = ["airbnb", "booking", "vrbo", "expedia", "agoda", "hotels", "tripadvisor", "trivago", "homeaway", "direto", "outro"].includes(plat) ? plat : "outro";
            const st = String(m.status || "confirmado").toLowerCase();
            m.status = ["confirmado", "hospedado", "checkout", "cancelado"].includes(st) ? st : "confirmado";
            if (m.total_value !== undefined) {
              const v = parseFloat(String(m.total_value).replace(",", "."));
              m.total_value = isNaN(v) ? 0 : v;
            }
          } else if (type === "properties") {
            if (!m.name) return errors.push(`Linha ${rowNum}: nome do imóvel obrigatório`);
            if (!m.address) return errors.push(`Linha ${rowNum}: endereço obrigatório`);
            ["bedrooms", "bathrooms", "max_guests"].forEach((k) => {
              if (m[k] !== undefined) {
                const n = parseInt(String(m[k]));
                m[k] = isNaN(n) ? undefined : n;
              }
            });
          } else if (type === "financial") {
            const t = String(m.type || "").toLowerCase();
            const norm = t === "income" ? "entrada" : t === "expense" ? "saida" : t;
            if (!["entrada", "saida"].includes(norm)) return errors.push(`Linha ${rowNum}: tipo deve ser "entrada" ou "saida"`);
            m.type = norm;
            const raw = m.amount ?? m.total_value;
            const amt = parseFloat(String(raw).replace(",", "."));
            if (!raw || isNaN(amt) || amt <= 0) return errors.push(`Linha ${rowNum}: valor inválido`);
            m.amount = amt;
            const d = parseDateValue(m.date);
            if (!d) return errors.push(`Linha ${rowNum}: data inválida`);
            m.date = d;
            if (!m.category) m.category = "outros";
            if (!m.status) m.status = "pago";
          } else {
            return errors.push(`Linha ${rowNum}: colunas não reconhecidas`);
          }

          rows.push(m);
        });

        resolve({ type, rows, errors, totalRows: dataRows.length, validRows: rows.length });
      } catch {
        reject(new Error("Erro ao ler a planilha. Use .xlsx, .xls ou .csv válido."));
      }
    };
    reader.onerror = () => reject(new Error("Erro ao ler o arquivo"));
    reader.readAsArrayBuffer(file);
  });
}
