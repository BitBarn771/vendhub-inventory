type CsvRow = Record<string, string>;

export class CsvValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CsvValidationError";
  }
}

const FORMAT_A = /^\d{2}\/\d{2}\/\d{4}$/;
const FORMAT_B = /^\d{4}-\d{2}-\d{2}$/;

function isValidDateFlexible(date: string): boolean {
  if (!date) return false;
  
  if (FORMAT_A.test(date)) {
    const [month, day, year] = date.split("/");
    const dateObj = new Date(`${year}-${month}-${day}`);
    return dateObj.toString() !== "Invalid Date";
  }
  if (FORMAT_B.test(date)) {
    const dateObj = new Date(date);
    return dateObj.toString() !== "Invalid Date";
  }
  return false;
}

export function validateCsvFormat(rows: CsvRow[]): void {
  if (!rows.length) {
    throw new CsvValidationError("CSV file is empty");
  }

  const firstRow = rows[0];
  const isFormatA = "Location_ID" in firstRow;
  const isFormatB = "Site_Code" in firstRow;

  if (!isFormatA && !isFormatB) {
    throw new CsvValidationError(
      "Invalid CSV format. Must be either Format A (Location_ID) or Format B (Site_Code)"
    );
  }

  const requiredFields = isFormatA
    ? ["Location_ID", "Product_Name", "Scancode", "Trans_Date"]
    : ["Site_Code", "Item_Description", "UPC", "Sale_Date"];
  const dateField = isFormatA ? "Trans_Date" : "Sale_Date";

  for (const row of rows) {
    for (const field of requiredFields) {
      if (!row[field]) {
        throw new CsvValidationError(`Missing required field: ${field}`);
      }
    }
    const date = row[dateField];
    if (!isValidDateFlexible(date)) {
      throw new CsvValidationError(
        `Invalid date format in ${dateField}: ${date}. Expected MM/DD/YYYY or YYYY-MM-DD`
      );
    }
  }
}

export function detectDuplicates(rows: CsvRow[]): CsvRow[] {
  const seen = new Set<string>();
  const duplicates: CsvRow[] = [];

  for (const row of rows) {
    const key = `${row.Location_ID || row.Site_Code}-${
      row.Scancode || row.UPC
    }-${row.Trans_Date || row.Sale_Date}`;

    if (seen.has(key)) {
      duplicates.push(row);
    } else {
      seen.add(key);
    }
  }

  return duplicates;
}
