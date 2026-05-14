import * as XLSX from "xlsx";

function build(filename: string, sheetName: string, headers: string[], examples: (string | number)[][]) {
  const ws = XLSX.utils.aoa_to_sheet([headers, ...examples]);
  ws["!cols"] = headers.map(() => ({ wch: 24 }));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, filename);
}

export function downloadGuestTemplate() {
  build(
    "hostlyb-modelo-hospedes.xlsx",
    "Hóspedes",
    [
      "Nome do Hóspede *",
      "Email",
      "Telefone",
      "Imóvel *",
      "Check-in * (DD/MM/AAAA)",
      "Check-out * (DD/MM/AAAA)",
      "Valor Total",
      "Plataforma",
      "Status",
      "Notas",
    ],
    [
      ["Jean Dupont", "jean@email.com", "+33612345678", "Apt Paris 12", "15/06/2025", "20/06/2025", 650, "airbnb", "confirmado", "Chegada às 15h"],
    ],
  );
}

export function downloadPropertyTemplate() {
  build(
    "hostlyb-modelo-imoveis.xlsx",
    "Imóveis",
    [
      "Nome do Imóvel *",
      "Endereço *",
      "Cidade",
      "Estado",
      "CEP",
      "Quartos",
      "Banheiros",
      "Capacidade máxima",
      "Senha WiFi",
      "Observações",
    ],
    [
      ["Apt Marais 3B", "Rue de Bretagne, 45", "Paris", "Île-de-France", "75003", 2, 1, 4, "WiFi_2024", "Imóvel com varanda"],
    ],
  );
}

export function downloadFinancialTemplate() {
  build(
    "hostlyb-modelo-financeiro.xlsx",
    "Financeiro",
    [
      "Tipo * (entrada/saida)",
      "Valor *",
      "Data * (DD/MM/AAAA)",
      "Categoria *",
      "Status",
      "Imóvel",
      "Descrição",
      "Método",
    ],
    [
      ["entrada", 850, "10/05/2025", "Receita Airbnb", "pago", "Apt Marais 3B", "Reserva 5 noites", "pix"],
      ["saida", 120, "11/05/2025", "Limpeza", "pago", "Apt Marais 3B", "Faxina pós checkout", "dinheiro"],
    ],
  );
}
