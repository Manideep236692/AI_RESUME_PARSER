import React from 'react';

const LoadingSpinner = ({ size = 'md', fullScreen = false }) => {
  const sizeClasses = {
    sm: 'w-6 h-6 border-2',
    md: 'w-10 h-10 border-3',
    lg: 'w-16 h-16 border-4'
  };

  const spinner = (
    <div className={`loading-spinner ${sizeClasses[size]}`}></div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-50 bg-opacity-75 z-50">
        {spinner}
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center p-8">
      {spinner}
    </div>
  );
};

export default LoadingSpinner;
