interface SpreadsheetImportProps {
  onClose: () => void;
}

export function SpreadsheetImport({ onClose }: SpreadsheetImportProps) {
  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-card border border-border rounded-2xl p-6 max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold mb-2">Importar planilha</h2>
        <p className="text-sm text-muted-foreground mb-4">
          A importação por planilha está temporariamente indisponível.
        </p>
        <button
          type="button"
          onClick={onClose}
          className="w-full rounded-md bg-primary text-primary-foreground py-2 text-sm font-medium"
        >
          Fechar
        </button>
      </div>
    </div>
  );
}
