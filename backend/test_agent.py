from app.agents.extraction_agent import extract_invoice_fields

sample = """
Invoice Number: INV-1023
Vendor: Amazon
Invoice Date: 2026-07-15
Total Amount: $249.99
"""

print(extract_invoice_fields(sample))