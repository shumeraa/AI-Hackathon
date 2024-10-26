import React, { useState, useRef, useEffect } from 'react';
import logo from './logo.svg';
import Button from './components/Button.js';
import AudioPlayer from './components/AudioPlayer';
import Sally from './assets/sally.png';
import ChatBotMessage from './components/ChatBotMessage.js';
import UserMessage from './components/UserMessage.js';

function ChatPage() {
  const handleSend = () => {
    // Placeholder function 
  };

  const [feedbackMessage, setFeedbackMessage] = useState("Click on one of the feedback buttons under your messages to see AI feedback!");

  const handleShowFeedback = (message, source) => {
    setFeedbackMessage(message);
  };

  useEffect(() => {
  }, []);

  return (
    <div>
      <div className="absolute gradientText text-2xl p-2">
        BeHeal
      </div>
      {/* Parent Div */}
      <div className="h-screen bg-primaryPurple text-white flex">

        {/* Chat Section */}
        <div className="mt-4 flex flex-col w-3/4 p-8">
          <div className="mx-auto flex-col items-center space-x-4 mb-6">
            <img
              src={Sally}
              alt="Sally Earthquake"
              className="w-16 h-16 mx-auto rounded-full"
            />
            <div className="text-2xl">Sally Earthquake</div>
          </div>

          <div className="flex flex-col space-y-4"> 
            <ChatBotMessage
              message="hello :( my house was destroyed lol"
              audioSrc="/path-to-audio-file.mp3"
            />

            <UserMessage
              message="I am sorry about that"
              feedback="Though your response demonstrates empathy, your response could have been more specific to their situation and detailed."
              onShowFeedback={handleShowFeedback}
            />

                        
            <ChatBotMessage
              message="hello :( my house was destroyed lol blah blah blah blah blah"
              audioSrc="/path-to-audio-file.mp3"
            />

            <UserMessage
              message="I am sorry about that"
              feedback="Though your response demonstrates empathy, your response could have been more specific to their situation and detailed. LOL"
              onShowFeedback={handleShowFeedback}
            />

          </div>

          <div className="flex items-center mt-auto space-x-4">
            <input
              type="text"
              placeholder="Message Sally..."
              className="bg-secondaryPurple w-full p-4 rounded-full focus:outline-none"
            />
            <button onClick={handleSend} className="bg-secondaryPurple p-3 rounded-full">
              🎤
            </button>
          </div>
        </div>

        {/* Feedback Section */}
        <div className="w-1/4 bg-secondaryPurple p-6 flex flex-col rounded-lg m-4">
          <h2 className="text-xl font-bold my-4">Your AI Feedback</h2>          

          <div className="text-sm space-y-2">
            <div className="flex items-start space-x-2">
              <span className="w-2 h-2 bg-white rounded-full mt-2 flex-shrink-0"></span>
              <p>
                {feedbackMessage}
              </p>
            </div>
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