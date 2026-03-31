from google import genai
from google.genai import types
import os
from dotenv import load_dotenv

load_dotenv()

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

for model_name in ["gemini-1.5-flash", "gemini-2.0-flash", "gemini-2.5-flash"]:
    try:
        response = client.models.generate_content(
            model=model_name,
            contents="Return a JSON object with a single key 'greeting' and value 'hello world'",
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
            )
        )
        print(f"[{model_name}] SUCCESS: {response.text.strip()}")
    except Exception as e:
        print(f"[{model_name}] ERROR: {type(e).__name__} - {str(e)[:100]}")
