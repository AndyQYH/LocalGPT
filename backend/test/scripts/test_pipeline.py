from retrieval.embedder import NVIDIAEmbedders
from retrieval.vector import MilvusVectorClient
from retrieval.retriever import Retriever
from vectorstore.vectorstore_updater import update_vectorstore
from llm.llm_client import LLMClient

import os

# === CONFIGURATION ===
TEST_FILE = f"C:\Users\AndyQin\Desktop\Azure Local\LLM\test\Azure Stack HCI Datasheet.pdf"  # Change to a .pptx or .png to test other parsers
COLLECTION_NAME = "test_collection"
MODEL_NAME = "llama3.1:8b"
MODEL_TYPE = "OLLAMA"

# === STEP 1: Load and Ingest File into Vector Store ===
print("[1] Initializing embedder and vector client...")
embedder = NVIDIAEmbedders(name="ollama", type="snowflake-arctic-embed2")
vector_client = MilvusVectorClient(collection_name=COLLECTION_NAME)

print("[2] Updating vector store with document:", os.path.basename(TEST_FILE))
update_vectorstore(TEST_FILE, vector_client, embedder, config_name="test_config")

# === STEP 2: Query the Vector Store ===
query = "What is shown in the visual content of the document?"
retriever = Retriever(embedder=embedder, vector_client=vector_client)

print("[3] Querying vector store with:", query)
retrieved_docs, source_metadata = retriever.get_relevant_docs(query)
print("\n--- Retrieved Context ---\n")
print(retrieved_docs)

# === STEP 3: Feed Context into LLM ===
llm_client = LLMClient(model_name=MODEL_NAME, model_type=MODEL_TYPE, is_response_generator=True)
system_prompt = "You are a document analysis assistant. Answer based on the context provided."

print("\n[4] Sending context to LLM...")
response_stream = llm_client.chat_with_prompt(system_prompt, retrieved_docs + f"\n\nUser Question: {query}")

print("\n--- LLM Response ---\n")
for chunk in response_stream:
    print(chunk, end="")

print("\n\n[Done]")
