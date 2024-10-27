import React from 'react';
import AudioPlayer from './AudioPlayer';

function ChatBotMessage({ message, audioSrc, imageSrc}) {
  return (
    <div className="flex flex-col space-y-2">
      <div className="flex items-center space-x-2">
        <img
          src={imageSrc}
          alt="Chat Avatar"
          className="w-10 h-10 rounded-lg"
          style={{ filter: 'brightness(0.6)' }} 
        />
        <div className="bg-secondaryPurple px-4 py-2 rounded-[25px]">
          {message}
        </div>
      </div>
      {audioSrc && <AudioPlayer src={audioSrc} />}
    </div>
  );
}

export default ChatBotMessage;