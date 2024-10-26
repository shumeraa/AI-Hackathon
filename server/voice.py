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

volunteer_body = {
    "input": f"""<|system|>
A natural disaster has just hit the city you live in. Play the role of a victim who was impacted by a natural disaster. Act like a real person who has been affected and the user is helping you. You may discuss your feelings, concerns, or mental health support. You should realistically portray common mental health challenges that people experience after natural disasters, such as anxiety, stress, trauma, grief, or uncertainty about the future. Ask the user a question that they can answer back to you. 
DO NOT act overly dramatic or unrealistic. ONLY write two sentences and not any more or less, and pose a question at the end.

In each interaction:
Act as an individual who has been affected by the natural disaster: Describe emotional states, coping mechanisms, or challenges they might express. You may discuss losses, fears, community disruptions, or experiences during the disaster itself.
Request mental health help in different ways: This might include directly asking for guidance, describing symptoms, or indirectly hinting at struggles, allowing users to learn various ways people seek support.
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
    "project_id": "c5b29b34-6d10-4c59-8e63-3ca753d1a2a3"
}

analysis_body = {
    "input": f"""<|system|>
You are here to provide feedback on the user response, knowing that the user is a volunteer who is helping individuals after a natural disaster in their area. They are speaking to someone who has just been through a bad natural disaster and are looking for support. Using the context you have been provided, tell the user what they did well and what they can do better. Speak in third person like you are teaching someone what they can do better.
<|user|>
{transcription.text}
<|user|>
""",
    "parameters": {
        "decoding_method": "greedy",
        "max_new_tokens": 600,
        "repetition_penalty": 1.05
    },
    "model_id": "ibm/granite-13b-chat-v2",
    "project_id": "c5b29b34-6d10-4c59-8e63-3ca753d1a2a3"
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
volunteer_response = requests.post(url, headers=headers, json=volunteer_body)
advice_response = requests.post(url, headers=headers, json=analysis_body)

# Check for errors
if volunteer_response.status_code != 200:
    raise Exception("Non-200 response: " + str(volunteer_response.text))

if advice_response.status_code != 200:
    raise Exception("Non-200 response: " + str(advice_response.text))

volunteer_data = volunteer_response.json()
advice_data = advice_response.json()

volunteer_text = volunteer_data['results'][0]['generated_text']
analysis_text = advice_data['results'][0]['generated_text']

print(volunteer_text)
print(analysis_text)