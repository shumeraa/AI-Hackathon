from flask import Flask, request, jsonify
import os
import tempfile
from openai import OpenAI
import requests
from dotenv import load_dotenv
import base64
import time

app = Flask(__name__)
load_dotenv()

# Load API keys from environment variables
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
IBM_API_KEY = os.getenv("IBM_API_KEY")
PROJECT_KEY = os.getenv("PROJECT_KEY")

# Configure OpenAI API
client = OpenAI(api_key=OPENAI_API_KEY)


def get_ibm_auth_token(api_key):
    auth_url = "https://iam.cloud.ibm.com/identity/token"
    headers = {
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept": "application/json",
    }
    data = {"grant_type": "urn:ibm:params:oauth:grant-type:apikey", "apikey": api_key}
    response = requests.post(auth_url, headers=headers, data=data)
    response.raise_for_status()
    return response.json().get("access_token")


@app.route("/process_audio", methods=["POST"])
def process_audio():
    if "file" not in request.files:
        return jsonify({"error": "No audio file provided"}), 400
    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "Empty filename"}), 400

    # Save the uploaded audio file to a temporary file
    with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as temp_file:
        file.save(temp_file.name)
        audio_path = temp_file.name

    temp_audio_file = None

    try:
        # Transcribe the audio using OpenAI's Whisper API
        with open(audio_path, "rb") as audio_file:
            transcription = client.audio.transcriptions.create(
                model="whisper-1", file=audio_file
            )
        transcribed_text = transcription.text

        # Prepare the request for IBM Granite model
        url = (
            "https://us-south.ml.cloud.ibm.com/ml/v1/text/generation?version=2023-05-29"
        )
        body = {
            "input": f"""<|system|>
You are a young adult man, with a pet who you love. A hurricane has just hit the city you live in. Play the role of this man who was impacted by the hurricane. Act like a real person who has been affected. You may discuss your feelings, concerns, or mental health support. You should realistically portray common mental health challenges that people experience after natural disasters, such as anxiety, stress, trauma, grief, or uncertainty about the future. Ask the user a question that they can answer back to you. Do not go into too much detail.
DO NOT act overly dramatic or unrealistic. ONLY write TWO sentences and not any more or less, and pose a question at the end about how to feel better.

In each interaction:
Act as this man who has been affected by the hurricane: Describe emotional states, coping mechanisms, or challenges they might express. You may discuss losses, fears, community disruptions, or experiences during the disaster itself.
Request mental health help in different ways: This might include directly asking for guidance, describing symptoms, or indirectly hinting at struggles, allowing users to learn various ways people seek support.
<|user|>
{transcribed_text}
<|user|>""",
            "parameters": {
                "decoding_method": "greedy",
                "max_new_tokens": 900,
                "repetition_penalty": 1.05,
            },
            "model_id": "ibm/granite-13b-chat-v2",
            "project_id": PROJECT_KEY,
        }

        # Get IBM access token
        ibm_access_token = get_ibm_auth_token(IBM_API_KEY)
        headers = {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "Authorization": f"Bearer {ibm_access_token}",
        }

        # Send the request to IBM's Granite model
        response = requests.post(url, headers=headers, json=body)
        response.raise_for_status()
        data = response.json()
        generated_text = data["results"][0]["generated_text"]

        temp_audio_file = (
            r"C:\Users\shume\Documents\GitHub\AI-Hackathon\server\response_audio.mp3"
        )

        # Generate TTS audio from the generated text
        with client.audio.speech.with_streaming_response.create(
            model="tts-1",
            voice="onyx",
            input=generated_text,
        ) as response:
            response.stream_to_file(temp_audio_file)

        with open(temp_audio_file, "rb") as f:
            audio_data = f.read()

        # Base64 encode the audio data
        audio_base64 = base64.b64encode(audio_data).decode("utf-8")

        # Return the generated text and the audio data
        return jsonify({"response": generated_text, "audio": audio_base64}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    finally:
        pass
        # Remove the temporary audio files
        if temp_audio_file is not None:
            os.remove(temp_audio_file)


if __name__ == "__main__":
    app.run(debug=True)
