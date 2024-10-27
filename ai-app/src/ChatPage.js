import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import Avatar from './assets/elma.png';
import AudioPlayer from './components/AudioPlayer';
import ChatBotMessage from './components/ChatBotMessage';
import UserMessage from './components/UserMessage';
import styles from './components/AudioPlayer.module.css';

import socialSupportPdf from './files/Seeking Social Support by PFA (2018).pdf';
import parentSupportPdf from './files/Parenting After a Natural Disaster by Hafstad et. al (2011).pdf';
import copingSupportPdf from './files/Coping with Disaster by Ready.gov (2024).pdf';
import friendSupportPdf from './files/How To Help A Friend Who Has Been Impacted by a natural disaster by Headspace.pdf'
import emotionalSupportPdf from './files/Recovering emotionally from disaster by The APA (2013).pdf'
import survivorSupportPdf from './files/Tips for Survivors of a Disaster or Other Traumatic Event by SAMHSA.pdf'

function ChatPage() {
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [feedbackMessage, setFeedbackMessage] = useState("Click on one of the feedback buttons under your messages to see AI feedback!");
  const [messages, setMessages] = useState([
    { who: 'LLM', text: 'Hi I am Elma! I could really use some help right now.', audioSrc: null }
  ]);
  const [advice_response, setAdviceResponse] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [sources, setSources] = useState("");

  const sourceLinks = {
    'Seeking Social Support by PFA (2018)': socialSupportPdf,
    'Parenting After a Natural Disaster by Hafstad et. al (2011)': parentSupportPdf,
    'Coping with Disaster by Ready.gov (2024)': copingSupportPdf,
    'How To Help A Friend Who Has Been Impacted by a natural disaster by Headspace': friendSupportPdf,
    'Recovering emotionally from disaster by The APA (2013)': emotionalSupportPdf,
    'Tips for Survivors of a Disaster or Other Traumatic Event by SAMHSA': survivorSupportPdf
  };

  const handleShowFeedback = (messageFeedback) => {
    const formattedSuggestions = messageFeedback
      .split(/(?=\d+\.\s)/)
      .filter(suggestion => suggestion.trim().match(/^\d+\./));
    setSuggestions(formattedSuggestions);
    setFeedbackMessage(messageFeedback);
  };

  const renderSuggestions = () => (
    <div className="w-full sm-0">
      {suggestions.map((suggestion, index) => (
        <p key={index} className="text-white text-md mb-2">
          {suggestion.trim()}
        </p>
      ))}
    </div>
  );

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
              const { transcription, response: backendText, audio: audioBase64, advice_response: advice_response, sources: sources } = response.data;
              const audioBlob = base64ToBlob(audioBase64, 'audio/wav');
              const audioUrl = URL.createObjectURL(audioBlob);

              console.log(advice_response)

              setAdviceResponse(advice_response);

              setMessages(prevMessages => [
                ...prevMessages,
                { who: 'user', text: transcription, audioSrc: userAudioUrl, feedback: advice_response, sources: sources },
                { who: 'LLM', text: backendText, audioSrc: audioUrl }
              ]);

              setSources(prevSources => {
                const newSources = Array.isArray(sources) ? sources : [sources]; // Ensure sources is an array
                return [...new Set([...prevSources, ...newSources])]; // Combine old and new sources, removing duplicates
              });

              console.log(sources);

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

  const renderSources = () => {
    if(!sources) {
      return null;
    }
    return sources.map((source, index) => (
      <div key={index} className="text-xs text-purple-400 ml-4">
        <a href={sourceLinks[source]} target="_blank" rel="noopener noreferrer">
          {source}
        </a>
      </div>
    ));
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
              src={Avatar}
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
                  imageSrc={Avatar}
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
            <div className="flex justify-center items-center mt-4 space-x-4">
              <div className={`${styles.bars} ${isRecording ? styles.barsPlaying : ''}`}>
                <div className={styles.bar}></div>
                <div className={styles.bar}></div>
                <div className={styles.bar}></div>
                <div className={styles.bar}></div>
              </div>
              <button onClick={handleMicClick} className="bg-quaternaryPurple p-3 rounded-full">
                {isRecording ? '⏹️' : '🎙️'}
              </button>
              <div className={`${styles.bars} ${isRecording ? styles.barsPlaying : ''}`}>
                <div className={styles.bar}></div>
                <div className={styles.bar}></div>
                <div className={styles.bar}></div>
                <div className={styles.bar}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Feedback Section */}
        <div className="w-1/4 bg-secondaryPurple p-6 flex my-2 flex-col rounded-lg sticky top-0 left fade-in-top-2" 
          style={{ position: "fixed", height: "97%", left: "73%", width: "26%"}} >
          <h2 className="text-xl font-bold my-4">Your AI Feedback</h2>          

          <div className="text-sm space-y-2">
          {/* <div className="flex items-start space-x-2">
            <p>{feedbackMessage}</p>
          </div> */}
          {renderSuggestions()}
            <p className="text-xs text-purple-400 ">
            <div class="text-xs text-purple-400" id="sources-container"></div>

            <div>
              {renderSources()}
            </div>
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
