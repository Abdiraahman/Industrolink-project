import React from 'react';

const FeedbackManagement: React.FC = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Feedback Management</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold">All Feedback</h2>
          <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
            Create Feedback
          </button>
        </div>
        <div className="space-y-4">
          <div className="border rounded p-4">
            <h3 className="font-semibold">Sample Feedback</h3>
            <p className="text-gray-600">This is a sample feedback entry for demonstration</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedbackManagement; 