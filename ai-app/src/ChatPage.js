import React, { useState, useRef, useEffect } from 'react';
import logo from './logo.svg';
import Button from './components/Button.js';
import AudioPlayer from './components/AudioPlayer';
import Sally from './assets/sally.png';

function ChatPage() {
  const handleSend = () => {
    // Placeholder function 
  };


  // Set Component A (Response) position
  const componentARef = useRef(null);
  const [componentAPosition, setComponentAPosition] = useState(0);
  
  useEffect(() => {
    if (componentARef.current) {
      const rect = componentARef.current.getBoundingClientRect();
      setComponentAPosition(rect.top);
    }
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
            <div className="flex items-center space-x-2">
              <img
                src={Sally}
                alt="Sally Earthquake"
                className="w-10 h-10 rounded-full"
              />
              <div className="bg-secondaryPurple px-4 py-2 rounded-full">
                hello :( my house was destroyed
              </div>
            </div>
            <AudioPlayer src="/path-to-audio-file.mp3" />

            {/* Component A: Response Message */}
            <div className="flex justify-end">
              <div
                ref={componentARef}
                className="bg-secondaryPurple px-4 py-2 rounded-full"
              >
                I am sorry about that
              </div>
            </div>

            {/* Component B: Feedback Message */}
            <div
              className="absolute bg-secondaryPurple p-4 rounded-lg mr-4"
              style={{
                left: '75%', // Adjust this value as needed
                top: `${componentAPosition}px`,
              }}
            >
              <div className="flex items-start space-x-2">
                <span className="w-2 h-2 bg-white rounded-full mt-1 "></span>
                <p className="text-sm">
                  Though your response demonstrates empathy, your response could have been more specific to their situation and detailed.
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <img
                src={Sally}
                alt="Sally Earthquake"
                className="w-10 h-10 rounded-full"
              />
              <div className="bg-secondaryPurple px-4 py-2 rounded-full">
                hello :( my house was destroyed blah blah blah blah blah blah blah
              </div>
            </div>            
            <AudioPlayer src="/path-to-audio-file.mp3" />

            <div className="flex justify-end">
              <div className="bg-secondaryPurple px-4 py-2 rounded-full">
                I am sorry about that
              </div>
            </div>
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

          <button className="bg-red-600 text-white py-2 mt-auto rounded-full">
            End Conversation
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChatPage;