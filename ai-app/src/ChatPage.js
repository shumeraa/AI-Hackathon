import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import Elma from './assets/elma.png';
import AudioPlayer from './components/AudioPlayer';
import ChatBotMessage from './components/ChatBotMessage';
import UserMessage from './components/UserMessage';

function ChatPage() {
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [feedbackMessage, setFeedbackMessage] = useState("Click on one of the feedback buttons under your messages to see AI feedback!");
  const [messages, setMessages] = useState([
    { who: 'LLM', text: 'Hi I am Elma! I could really use some help right now.', audioSrc: null }
  ]);

  const handleShowFeedback = (message) => {
    setFeedbackMessage(message);
  };

  const handleMicClick = async () => {
    if (!isRecording) {
      setIsRecording(true);
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          const recorder = new MediaRecorder(stream);
          setMediaRecorder(recorder);
          recorder.start();

          const chunks = [];
          recorder.ondataavailable = (e) => {
            if (e.data.size > 0) {
              chunks.push(e.data);
            }
          };

          recorder.onstop = async () => {
            const blob = new Blob(chunks, { type: 'audio/webm; codecs=opus' });
            const userAudioUrl = URL.createObjectURL(blob);
            const formData = new FormData();
            formData.append('file', blob, 'recording.webm');
            formData.append('prompt_id', '2');

            try {
              const response = await axios.post('http://localhost:5000/process_audio', formData);
              const { transcription, response: backendText, audio: audioBase64 } = response.data;
              const audioBlob = base64ToBlob(audioBase64, 'audio/wav');
              const audioUrl = URL.createObjectURL(audioBlob);

              setMessages(prevMessages => [
                ...prevMessages,
                { who: 'user', text: transcription, audioSrc: userAudioUrl, feedback: "Though your response demonstrates empathy, your response could have been more specific to their situation and detailed." },
                { who: 'LLM', text: backendText, audioSrc: audioUrl }
              ]);

              playAudio(audioUrl);
            } catch (error) {
              console.error('Error uploading audio:', error);
            }
            stream.getTracks().forEach(track => track.stop());
          };

          recorder.onerror = (event) => {
            console.error('Recorder error:', event.error);
          };

        } catch (error) {
          console.error('Error accessing microphone:', error);
          setIsRecording(false);
        }
      } else {
        alert('Your browser does not support audio recording.');
      }
    } else {
      setIsRecording(false);
      if (mediaRecorder) {
        mediaRecorder.stop();
      }
    }
  };

  const base64ToBlob = (base64, contentType) => {
    const byteCharacters = atob(base64);
    const byteArrays = [];
    const sliceSize = 512;

    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      const slice = byteCharacters.slice(offset, offset + sliceSize);
      const byteNumbers = Array.from(slice).map(char => char.charCodeAt(0));
      byteArrays.push(new Uint8Array(byteNumbers));
    }
    return new Blob(byteArrays, { type: contentType });
  };

  const playAudio = (audioUrl) => {
    const audio = new Audio(audioUrl);
    audio.play();
  };

  return (
    <div className="fade-in-top">
      <div className="absolute gradientText text-2xl p-2">
        BeHeal
      </div>
      {/* Parent Div */}
      <div className="h-screen bg-primaryPurple text-white flex">

        {/* Chat Section */}
        <div className="mt-4 flex flex-col w-3/4 py-8 pl-4 pr-16 ">
          <div className="mx-auto flex-col items-center mb-6">
            <img
              src={Elma}
              alt="Elma Earthquake"
              className="w-16 h-16 mx-auto rounded-full"
            />
            <div className="text-2xl">Elma Earthquake</div>
          </div>

          <div className="flex flex-col space-y-4">
            {messages.map((message, index) =>
              message.who === 'LLM' ? (
                <ChatBotMessage
                  key={index}
                  message={message.text}
                  audioSrc={message.audioSrc}
                />
              ) : (
                <UserMessage
                  key={index}
                  message={message.text}
                  feedback={message.feedback}
                  onShowFeedback={() => handleShowFeedback(message.feedback)}
                />
              )
            )}
          </div>
          <div className="mt-auto">
            <div className="flex items-center mt-4 space-x-4">
              <input
                type="text"
                placeholder="Message Elma..."
                className="bg-secondaryPurple w-full p-4 rounded-full focus:outline-none"
              />
              <button onClick={handleMicClick} className="bg-secondaryPurple p-3 rounded-full">
                {isRecording ? '⏹️' : '🎤'}
              </button>
            </div>
          </div>
        </div>

        {/* Feedback Section */}
        <div className="w-1/4 bg-secondaryPurple p-6 flex my-2 flex-col rounded-lg sticky top-0 left fade-in-top-2" 
          style={{ position: "fixed", height: "97%", left: "73%", width: "26%"}} >
          <h2 className="text-xl font-bold my-4">Your AI Feedback</h2>          

          <div className="text-sm space-y-2">
            <div className="flex items-start space-x-2">
              <span className="w-2 h-2 bg-white rounded-full mt-2 flex-shrink-0"></span>
              <p>{feedbackMessage}</p>
            </div>
            <p className="text-xs text-purple-400 ml-4">
              Source will appear here
            </p>
          </div>

          <button className="bg-red-600 text-white py-2 mt-auto rounded-full">
            End Conversation
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChatPage;
