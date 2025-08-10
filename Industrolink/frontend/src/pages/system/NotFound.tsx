import React from 'react';
import { Link } from 'react-router-dom';

const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
        <div className="text-6xl mb-4">🔍</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Page Not Found</h1>
        <p className="text-gray-600 mb-6">
          The page you're looking for doesn't exist. Please check the URL and try again.
        </p>
        <div className="space-y-3">
          <Link
            to="/dashboard"
            className="block w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
          >
            Go to Dashboard
          </Link>
          <button
            onClick={() => window.history.back()}
            className="block w-full bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound; 