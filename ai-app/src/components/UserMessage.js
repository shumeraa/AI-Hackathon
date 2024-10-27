import React from 'react';

function UserMessage({ message, feedback, onShowFeedback}) {
  return (
    <div className="relative flex flex-col space-y-2">
      {/* User Message */}
      <div className="flex justify-end">
        <div className="bg-secondaryPurple px-4 py-2 rounded-full">
          {message}
        </div>
      </div>
      
      {/* Feedback Button */}
      <div className="flex justify-end">
        <button
          onClick={() => onShowFeedback(feedback)}
          className="text-blue-400 bg-tertiaryPurple px-3 py-1 text-xs rounded-[25px] hover:bg-quaternaryPurple transition-colors"
        >
          Feedback
        </button>
      </div>
    </div>
  );
}

export default UserMessage;
