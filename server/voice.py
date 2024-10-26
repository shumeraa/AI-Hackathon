import os
import sounddevice as sd
import numpy as np
import tempfile
import wavio
from pathlib import Path
from openai import OpenAI
from dotenv import load_dotenv
import requests

def get_auth_token(api_key):
    import requests
    
    auth_url = "https://iam.cloud.ibm.com/identity/token"
    
    headers = {
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept": "application/json"
    }
    
    data = {
        "grant_type": "urn:ibm:params:oauth:grant-type:apikey",
        "apikey": api_key
    }

    response = requests.post(auth_url, headers=headers, data=data, verify=False)
    
    if response.status_code == 200:
        return response.json().get("access_token")
    else:
        raise Exception("Failed to get authentication token")

# Load environment variables from .env file
load_dotenv()

# Record audio from the microphone
duration = 5  # Duration in seconds
fs = 16000  # Sampling frequency
print("Recording...")
audio_data = sd.rec(int(duration * fs), samplerate=fs, channels=1, dtype='float32')
sd.wait()  # Wait until recording is finished
print("Recording finished.")

# Save the recorded audio to a temporary WAV file
with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as temp_file:
    wavio.write(temp_file.name, audio_data, fs, sampwidth=3)
    audio_path = temp_file.name

# Get the API key from environment variables
api_key = os.getenv('OPENAI_API_KEY')

# Get the client of OpenAI
client = OpenAI(api_key=api_key)

file_path = Path(audio_path)

# Open the audio file
with open(audio_path, "rb") as audio_file:
    # Transcribe the audio
    transcription = client.audio.transcriptions.create(
        model="whisper-1",
        file=audio_file
    )

# Print the transcription
print("Transcription:", transcription.text)

# Remove the temporary audio file
os.remove(audio_path)

# Prepare the request for the chatbot
url = "https://us-south.ml.cloud.ibm.com/ml/v1/text/generation?version=2023-05-29"

body = {
    "input": f"""<|system|>
You are a mental health training chatbot designed to help users learn effective responses to individuals affected by natural disasters. In this training, you will adopt the role of someone impacted by a natural disaster, discussing their feelings, concerns, or seeking mental health support. You should realistically portray common mental health challenges that people experience after natural disasters, such as anxiety, stress, trauma, grief, or uncertainty about the future.

In each interaction:

    Embody the voice of an affected individual: Describe emotional states, coping mechanisms, or challenges they might express. You may discuss losses, fears, community disruptions, or experiences during the disaster itself.
    Request mental health help in different ways: This might include directly asking for guidance, describing symptoms, or indirectly hinting at struggles, allowing users to learn various ways people seek support.
    Provide information with sourced responses: When giving mental health advice or insights, reference only from the provided documents, ensuring your responses are well-supported. Always phrase responses with sensitivity and understanding of the impact of traumatic experiences.

The goal is to train users in empathetic and informed response strategies for mental health support, focused on individuals affected by natural disasters. At the end, please provide sources based on your advice.
<|user|>
{transcription.text}
<|user|>
Hello
<|user|>""",
    "parameters": {
        "decoding_method": "greedy",
        "max_new_tokens": 900,
        "repetition_penalty": 1.05
    },
    "model_id": "ibm/granite-13b-chat-v2",
    "project_id": "bcc8344b-55d3-4764-acf0-7d40998edc87"
}

api_key = os.getenv('IBM_API_KEY')

# Set the headers for the request
ibm_access_token = get_auth_token(api_key)
headers = {
    "Accept": "application/json",
    "Content-Type": "application/json",
    "Authorization": f"Bearer {ibm_access_token}"  # Use f-string to include the token
}

# Make the POST request to the API
response = requests.post(url, headers=headers, json=body)

# Check for errors
if response.status_code != 200:
    raise Exception("Non-200 response: " + str(response.text))

data = response.json()

generated_text = data['results'][0]['generated_text']
print(generated_text)