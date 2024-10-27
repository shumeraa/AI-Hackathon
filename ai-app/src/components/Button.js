import React from 'react';
import { Link } from 'react-router-dom';

const Button = ({ text, link }) => {
  return (
    <Link
      to={link}
      className="my-8 block mx-auto bg-secondaryPurple text-white h-12 px-8 rounded-full shadow-md hover:bg-tertiaryPurple focus:outline-none flex items-center justify-center"
    >
      {text}
    </Link>
  );
};

export default Button;