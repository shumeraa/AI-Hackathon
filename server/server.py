from flask import Flask, request, jsonify
import os
import tempfile
from openai import OpenAI
import requests
from dotenv import load_dotenv
import base64
from prompts import SYSTEM_PROMPT_1, SYSTEM_PROMPT_2, SYSTEM_PROMPT_3
import os
import getpass
import requests
from dotenv import load_dotenv
import sounddevice as sd
import wavio
import tempfile
from openai import OpenAI
from flask_cors import CORS
import re

app = Flask(__name__)
CORS(app)
load_dotenv()

# Load API keys from environment variables
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
IBM_API_KEY = os.getenv("IBM_API_KEY")
PROJECT_KEY = os.getenv("PROJECT_KEY")

# Configure OpenAI API
client = OpenAI(api_key=OPENAI_API_KEY)

# Map prompt_id to the corresponding system prompt
system_prompts = {
    "1": [SYSTEM_PROMPT_1, "onyx"],
    "2": [SYSTEM_PROMPT_2, "nova"],
    "3": [SYSTEM_PROMPT_3, "fable"],
}


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

    # Get the prompt ID from the request
    prompt_id = request.form.get("prompt_id", "1")  # Default to '1' if not provided

    voice = system_prompts[prompt_id][1]
    system_prompt = system_prompts[prompt_id][0]

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
{system_prompt}
<|system|>
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

        temp_audio_file = r".\response_audio.mp3"

        # Generate TTS audio from the generated text
        with client.audio.speech.with_streaming_response.create(
            model="tts-1",
            voice=voice,
            input=generated_text,
        ) as response:
            response.stream_to_file(temp_audio_file)

        with open(temp_audio_file, "rb") as f:
            audio_data = f.read()

        # Base64 encode the audio data
        audio_base64 = base64.b64encode(audio_data).decode("utf-8")

        advice_response, sources = get_advice(transcribed_text)

        print(advice_response)

        # Return the generated text and the audio data
        return jsonify({"transcription": transcribed_text, "response": generated_text, "audio": audio_base64, "advice_response": advice_response, "sources": sources}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    finally:
        pass
        # Remove the temporary audio files
        if temp_audio_file is not None:
            os.remove(temp_audio_file)

def get_advice(transcribed_text):
    # Load environment variables from .env file
    load_dotenv()

    # Get the IBM Cloud API key
    api_key = os.getenv('IBM_API_KEY')

    def get_credentials():
        return {
            "url" : "https://us-south.ml.cloud.ibm.com",
            "apikey" : api_key
        }

    def get_bearer_token():
        url = "https://iam.cloud.ibm.com/identity/token"
        headers = {"Content-Type": "application/x-www-form-urlencoded"}
        data = f"grant_type=urn:ibm:params:oauth:grant-type:apikey&apikey={credentials['apikey']}"

        response = requests.post(url, headers=headers, data=data)
        return response.json().get("access_token")

    credentials = get_credentials()

    from ibm_watsonx_ai import APIClient

    client = APIClient(credentials)

    space_id = "782a1780-68d6-47d7-a1bb-e2a1e9fc0334"
    client.set.default_space(space_id)

    promoted_assets = {}
    promoted_assets["vector_index_id"] = client.spaces.promote("26aa9a26-7338-42d7-b79b-feb0c1c001fb", "bcc8344b-55d3-4764-acf0-7d40998edc87", "782a1780-68d6-47d7-a1bb-e2a1e9fc0334")

    import base64
    encoded_credentials = {
        "url": credentials.get("url"),
        "apikey": base64.b64encode(credentials.get("apikey").encode("ascii")).decode("utf-8")
    }

    ai_params = {"encoded_credentials": encoded_credentials, "space_id": space_id, "promoted_assets": promoted_assets}

    def my_deployable_chain_function( params=ai_params ):
        import subprocess
        import base64
        from ibm_watsonx_ai.foundation_models import Model
        from ibm_watsonx_ai import APIClient
        
        encoded_credentials = params["encoded_credentials"]
        wml_credentials = {
            "url": encoded_credentials.get("url"),
            "apikey": base64.b64decode(encoded_credentials.get("apikey")).decode("ascii")
        }

        client = APIClient(wml_credentials)
        space_id = "782a1780-68d6-47d7-a1bb-e2a1e9fc0334"
        client.set.default_space(space_id)
        
        vector_index_details = client.data_assets.get_details(params["promoted_assets"]["vector_index_id"])
        vector_index_properties = vector_index_details["entity"]["vector_index"]

        import gzip
        import json
        import chromadb
        import random
        import string
        from ibm_watsonx_ai.foundation_models import Embeddings
        from ibm_watsonx_ai.foundation_models.utils.enums import EmbeddingTypes

        emb = Embeddings(
            model_id=vector_index_properties["settings"]["embedding_model_id"],
            credentials=wml_credentials,
            space_id=space_id,
            params={
                "truncate_input_tokens": 512
            }
        )

        vector_index_id = params["promoted_assets"]["vector_index_id"]
        vector_index_details = client.data_assets.get_details(vector_index_id)
        vector_index_properties = vector_index_details["entity"]["vector_index"]

        def hydrate_chromadb():
            data = client.data_assets.get_content(vector_index_id)
            content = gzip.decompress(data)
            stringified_vectors = str(content, "utf-8")
            vectors = json.loads(stringified_vectors)
            
            chroma_client = chromadb.Client()
            
            # make sure collection is empty if it already existed
            collection_name = "my_collection"
            try:
                collection = chroma_client.delete_collection(name=collection_name)
            except:
                pass
            collection = chroma_client.create_collection(name=collection_name)
            
            vector_embeddings = []
            vector_documents = []
            vector_metadatas = []
            vector_ids = []
            
            for vector in vectors:
                vector_embeddings.append(vector["embedding"])
                vector_documents.append(vector["content"])
                metadata = vector["metadata"]
                lines = metadata["loc"]["lines"]
                clean_metadata = {}
                clean_metadata["asset_id"] = metadata["asset_id"]
                clean_metadata["asset_name"] = metadata["asset_name"]
                clean_metadata["url"] = metadata["url"]
                clean_metadata["from"] = lines["from"]
                clean_metadata["to"] = lines["to"]
                vector_metadatas.append(clean_metadata)
                asset_id = vector["metadata"]["asset_id"]
                random_string = ''.join(random.choices(string.ascii_uppercase + string.digits, k=10))
                id = "{}:{}-{}-{}".format(asset_id, lines["from"], lines["to"], random_string)
                vector_ids.append(id)

            collection.add(
                embeddings=vector_embeddings,
                documents=vector_documents,
                metadatas=vector_metadatas,
                ids=vector_ids
            )
            return collection
        
        chroma_collection = hydrate_chromadb()

        def proximity_search( question ):
            query_vectors = emb.embed_query(question)
            query_result = chroma_collection.query(
                query_embeddings=query_vectors,
                n_results=vector_index_properties["settings"]["top_k"],
                include=["documents", "metadatas", "distances"]
            )
            
            documents = list(reversed(query_result["documents"][0]))
            metadatas = reversed(query_result["metadatas"][0])
            distances = reversed(query_result["distances"][0])
            results = []
            for metadata, distance in zip(metadatas, distances):
                results.append({
                    "metadata": metadata,
                    "score": distance
                })

            return {
                "results": results,
                "documents": documents
            }

        def format_input(messages, documents):
            grounding = "\n".join(documents)
            system = f"""<|system|>
                         The input is from a medical professional in training to a victim of a natural disaster. Do not directly answer the input, but provide advice based on documents about how the medical professional (input) can improve. Be extremely direct and even harsh and critical at the medical proffesional. Create exactly three bullet points, each with a suggestion and a newline after each for formatting. Do not ask for additional information. Limit each suggestion to 15 words. Perform semantic analysis on the input and highlight any strong emotions that the medical professional may be protraying. Add newlines after each period. Example (Do not repeat this example but write answers in a similar style but more specifically about the topic from key words from the input): 1. The <noun similar to medical proffesional> can <verb> the conversation by <verb> specific issues the <similar terms to victim> is facing and <further suggestion>.

                """
            messages_section = []

            for index,value in enumerate(messages, start=0):
                content = value["content"]
                user_template = f"""<|user|>
    {content}
    """
                assistant_template = f"""<|assistant|>
    {content}
    """
                grounded_user_template = f"""<|user|>
    [Document]
    {grounding}
    [End]
    {content}
    """

                formatted_entry = user_template if value["role"] == "user" else assistant_template
                if (index == len(messages)-1):
                    formatted_entry = grounded_user_template
                
                messages_section.append(formatted_entry)

            messages_section = "".join(messages_section)
            prompt = f"""{system}{messages_section}<|assistant|> Only output a short list. You only give advice relating closely to the topics they stated and nothing else. This list is advice related to helping the medical proffesional effectively talking to a victim who's goal is to overcome a natural disaster. Provide advice that improves what the medical proffesional said. Do not ask any questions back, you only give advice about what the medical professional can improve on when talking to the victim. You must give three sugesstions on how to be a better volunteer and nothing else.
    """
            return prompt
        
        def inference_model( messages, documents, access_token ):
            prompt = format_input(messages, documents)
            model_id = "ibm/granite-13b-chat-v2"
            parameters = {
                "decoding_method": "greedy",
                "max_new_tokens": 900,
                "repetition_penalty": 1.05,
            }
            inference_credentials = {
                "url": wml_credentials.get("url"),
                "token": access_token
            }
            model = Model(
                model_id = model_id,
                params = parameters,
                credentials = inference_credentials,
                space_id = params["space_id"]
            )

            # Generate grounded response
            generated_response = model.generate_text(prompt=prompt, guardrails=False)
            print(generated_response)

            return generated_response

        def execute( payload ):
            messages = payload.get("input_data")[0].get("values")[0]
            access_token = payload.get("input_data")[0].get("values")[1][0]
    
            # Proximity search
            search_result = proximity_search(messages[-1].get("content"))
            
            # Grounded inferencing
            generated_response = inference_model(messages, search_result["documents"], access_token)
            
            execute_response = {
                "predictions": [{"fields": ["Proximity search result", "Generated response"],
                                "values": [search_result["results"], generated_response]
                                }]
            }
            return execute_response

        return execute

    # Record audio from the microphone
    # duration = 10  # Duration in seconds
    # fs = 16000  # Sampling frequency
    # print("Recording...")
    # audio_data = sd.rec(int(duration * fs), samplerate=fs, channels=1, dtype='float32')
    # sd.wait()  # Wait until recording is finished
    # print("Recording finished.")

    # Initialize deployable chain function locally

    local_function = my_deployable_chain_function()
    messages = []
    # Chose to retain the history
    retain_history = False
    if (retain_history == False):
        messages = []

    local_question = transcribed_text

    messages.append({ "role" : "user", "content": local_question })

    func_result = local_function({"input_data": [{"fields": [ "Search" "access_token"],
                                                                "values": [messages, [get_bearer_token()]]
                                                                }
                                                                ]
                                                })

    response = func_result["predictions"][0]["values"][1]
    messages.append({"role": "assistant", "content": response })

    message = func_result['predictions'][0]['values'][1]  # "Generated response" field
    sources = []
    unique_titles = set()

    for entry in func_result['predictions'][0]['values'][0]:
        title = entry['metadata']['asset_name']
        if title not in unique_titles:
            unique_titles.add(title)
            sources.append(title)

    sources = [source[:-4] for source in sources]

    # Display the message and sources
    # print("AI Message:")
    # print(message)
    # print("\nSources:")
    # for source in sources:
    #     print(source[:-4])

    return message, sources


if __name__ == "__main__":
    app.run(debug=True)
