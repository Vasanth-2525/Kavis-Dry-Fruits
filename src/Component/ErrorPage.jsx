import React from 'react';
import { useNavigate } from 'react-router-dom';

const ErrorPage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex justify-center items-center h-screen bg-green4 font-sans text-center">
      <div className="p-8 max-w-md">
        <h1 className="text-9xl font-bold text-primary mb-0 leading-none">404</h1>
        <h2 className="text-3xl text-gray-700 mt-4 mb-6">Oops! Page not Found</h2>
        <p className="text-gray-600 text-lg mb-8">
          The page you are looking for cannot be<br />
          found take a break before trying again
        </p>
        <button
          className="px-6 py-3 bg-green1 text-white rounded-md hover:bg-primary transition-colors"
          onClick={() => navigate('/')}
        >
          Go To Home Page
        </button>
      </div>
    </div>
  );
};

export default ErrorPage;