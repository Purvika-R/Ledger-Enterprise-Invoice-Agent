// Mirrors the business rules in backend/app/agents/validation_agent.py so the
// Human Review panel can give live pass/fail feedback as a reviewer edits a
// field, without calling back into the LangGraph pipeline. The backend
// remains the source of truth for the field_validation an invoice ships
// with; this is only used to decide when a *correction* is complete.

export type FieldValidationResult = {
  valid: boolean;
  message: string;
};

const VALID_CURRENCIES = new Set([
  "INR", "USD", "EUR", "GBP", "AUD", "CAD", "JPY", "CNY", "SGD", "AED",
]);

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function validateInvoiceNumber(value: any): FieldValidationResult {
  const invoiceNumber = String(value ?? "").trim();

  if (!invoiceNumber) {
    return { valid: false, message: "Invoice number is missing." };
  }

  return { valid: true, message: "Invoice number present." };
}

export function validateVendor(value: any): FieldValidationResult {
  const vendor = String(value ?? "").trim();

  if (!vendor || vendor.length < 2) {
    return { valid: false, message: "Vendor name is missing or too short." };
  }

  return { valid: true, message: "Vendor name present." };
}

export function validateInvoiceDate(value: any): FieldValidationResult {
  const rawDate = String(value ?? "").trim();

  if (!DATE_PATTERN.test(rawDate)) {
    return {
      valid: false,
      message: `Invoice date '${rawDate || "(empty)"}' is not in YYYY-MM-DD format.`,
    };
  }

  const [year, month, day] = rawDate.split("-").map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));

  const isRealDate =
    parsed.getUTCFullYear() === year &&
    parsed.getUTCMonth() === month - 1 &&
    parsed.getUTCDate() === day;

  if (!isRealDate) {
    return {
      valid: false,
      message: `Invoice date '${rawDate}' is not a real calendar date.`,
    };
  }

  return { valid: true, message: "Invoice date is valid." };
}

export function validateCurrency(value: any): FieldValidationResult {
  const currency = String(value ?? "").trim().toUpperCase();

  if (!VALID_CURRENCIES.has(currency)) {
    return {
      valid: false,
      message: `Currency '${currency || "(empty)"}' is not a recognized ISO code.`,
    };
  }

  return { valid: true, message: "Currency code is valid." };
}

export function validateTotalAmount(value: any): {
  result: FieldValidationResult;
  numericValue: number | null;
} {
  const totalValue = Number(value);

  if (value === "" || value === null || value === undefined || Number.isNaN(totalValue)) {
    return {
      result: { valid: false, message: "Total amount is missing or not numeric." },
      numericValue: null,
    };
  }

  if (totalValue <= 0) {
    return {
      result: { valid: false, message: "Total amount must be greater than zero." },
      numericValue: totalValue,
    };
  }

  return {
    result: { valid: true, message: "Total amount is valid." },
    numericValue: totalValue,
  };
}

export function validateLineItems(
  lineItems: any[],
  totalValue: number | null
): FieldValidationResult {
  if (!lineItems || lineItems.length === 0) {
    return { valid: false, message: "No line items were extracted." };
  }

  let lineSum = 0;

  for (const item of lineItems) {
    const amount = Number(item.amount);

    if (
      item.amount === "" ||
      item.amount === null ||
      item.amount === undefined ||
      Number.isNaN(amount)
    ) {
      return {
        valid: false,
        message: "One or more line items has a non-numeric amount.",
      };
    }

    lineSum += amount;
  }

  if (totalValue === null) {
    return {
      valid: true,
      message: `${lineItems.length} line item(s) extracted.`,
    };
  }

  // Allow small rounding/OCR tolerance: 2% of the total, or 1 unit, whichever is larger.
  const tolerance = Math.max(1, totalValue * 0.02);

  if (Math.abs(lineSum - totalValue) > tolerance) {
    return {
      valid: false,
      message: `Line items sum to ${lineSum.toFixed(2)}, which does not match the total amount of ${totalValue.toFixed(2)}.`,
    };
  }

  return { valid: true, message: "Line items sum matches total amount." };
}

export function validateHeaderAndLineItems(
  header: any,
  lineItems: any[]
): Record<string, FieldValidationResult> {
  const { result: totalAmountResult, numericValue } = validateTotalAmount(
    header?.total_amount
  );

  return {
    invoice_number: validateInvoiceNumber(header?.invoice_number),
    vendor: validateVendor(header?.vendor),
    invoice_date: validateInvoiceDate(header?.invoice_date),
    currency: validateCurrency(header?.currency),
    total_amount: totalAmountResult,
    line_items: validateLineItems(lineItems, numericValue),
  };
}