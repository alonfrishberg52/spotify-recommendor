import openai
import os

# Replace with your actual API key
openai.api_key = os.environ.get('OPENAI_API_KEY')   

# Retrieve the list of models
try:
    models = openai.Model.list()
    print("Available Models:")
    for model in models['data']:
        print(model['id'])
except Exception as e:
    print(f"Error: {e}")
