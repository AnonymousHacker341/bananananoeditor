import React from 'react';

export const Spinner: React.FC = () => {
  return (
    <div className="flex justify-center items-center space-x-2">
      <div className="w-3 h-3 bg-white rounded-full animate-bounce [animation-delay:-0.3s]"></div>
      <div className="w-3 h-3 bg-white rounded-full animate-bounce [animation-delay:-0.15s]"></div>
      <div className="w-3 h-3 bg-white rounded-full animate-bounce"></div>
    </div>
  );
};
