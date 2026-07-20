from app.graph import graph

result = graph.invoke(
    {
        "image_path": "uploads/invoice1.png",
        "ocr_text": "",
        "header_fields": {},
        "line_items": [],
        "vendor_memory": {},
        "confidence": 0.0,
        "validation_errors": [],
        "final_json": {},
    }
)

print("\nFinal Output:\n")
print(result["final_json"])