import React from 'react';

const Button = ({ text, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="my-20 block mx-auto bg-secondaryPurple text-white h-12 px-8 rounded-full shadow-md hover:bg-tertiaryPurple focus:outline-none flex items-center justify-center"
    >
      {text}
    </button>
  );
};

export default Button;