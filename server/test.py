import requests
import base64

# The URL of the Flask app
url = 'http://localhost:5000/process_audio'

# Path to your audio file
audio_file_path = r'C:\Users\shume\Documents\GitHub\AI-Hackathon\server\Recording.mp3'

# Open the audio file in binary mode
with open(audio_file_path, 'rb') as f:
    files = {'file': f}
    # Send a POST request with the file
    response = requests.post(url, files=files)

# Check if the request was successful
if response.status_code == 200:
    # Get the JSON response
    data = response.json()
    
    # Print the text response
    print("Text response:", data.get('response'))

    # Get the base64-encoded audio data
    audio_base64 = data.get('audio')

    # Decode the audio data
    audio_data = base64.b64decode(audio_base64)

    # Save the audio data to a file
    with open('response_audio.mp3', 'wb') as audio_file:
        audio_file.write(audio_data)

    print("Audio file saved as response_audio.mp3")
else:
    print("Request failed with status code:", response.status_code)
    print(response.text)
