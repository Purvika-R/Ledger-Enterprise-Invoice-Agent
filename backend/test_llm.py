from app.core.llm import llm

print("Testing LLM...")

response = llm.invoke("Reply with exactly: Hello")

print(response.content)