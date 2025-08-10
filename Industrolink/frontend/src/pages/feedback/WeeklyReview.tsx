import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare, Star, Send, User, FileText } from 'lucide-react';

interface SupervisorFeedbackItem {
  id: number;
  supervisor: string;
  date: string;
  feedback: string;
  rating: number;
}

const Feedback: React.FC = () => {
  const [feedback, setFeedback] = useState<string>('');
  const [rating, setRating] = useState<number>(0);
  const [supervisorFeedback, setSupervisorFeedback] = useState<SupervisorFeedbackItem[]>([]);
  
  // State for dynamic summary statistics
  const [stats, setStats] = useState({
    totalFeedback: 0,
    averageRating: 0,
    responseRate: 0
    
  });

  // Calculate stats whenever supervisor feedback changes
  useEffect(() => {
    const totalFeedback = supervisorFeedback.length;
    const ratingsWithValues = supervisorFeedback.filter(item => item.rating !== null);
    const averageRating = ratingsWithValues.length > 0 
      ? ratingsWithValues.reduce((sum, item) => sum + item.rating, 0) / ratingsWithValues.length 
      : 0;
    const responseRate = totalFeedback > 0 ? 100 : 0; // Simplified calculation

    setStats({
      totalFeedback,
      averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
      responseRate
    });
  }, [supervisorFeedback]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!feedback.trim()) {
      alert('Please provide feedback before submitting.');
      return;
    }
    if (rating === 0) {
      alert('Please provide a rating before submitting.');
      return;
    }

    console.log('Student feedback submitted:', { feedback, rating });
    
    // Clear form
    setFeedback('');
    setRating(0);
    
    // Show success message
    alert('Feedback submitted successfully!');
  };

  return (
    <div className="space-y-6">
      {/* Feedback Stats - Now Dynamic */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-navy-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Feedback</p>
              <p className="text-2xl font-bold text-navy-700">{stats.totalFeedback}</p>
            </div>
            <MessageSquare className="h-8 w-8 text-navy-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Average Rating</p>
              <div className="flex items-center space-x-1">
                <p className="text-2xl font-bold text-yellow-600">
                  {stats.averageRating > 0 ? stats.averageRating : '--'}
                </p>
                {stats.averageRating > 0 && <Star className="h-5 w-5 text-yellow-500 fill-current" />}
              </div>
            </div>
            <div className="flex space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-4 w-4 ${
                    star <= Math.floor(stats.averageRating) 
                      ? 'text-yellow-500 fill-current' 
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Response Rate</p>
              <p className="text-2xl font-bold text-green-600">{stats.responseRate}%</p>
            </div>
            <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-600 font-bold">✓</span>
            </div>
          </div>
        </div>
      </div>

      {/* Submit Feedback Form */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Submit Feedback</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rate your experience
            </label>
            <div className="flex space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className={`h-8 w-8 ${
                    star <= rating ? 'text-yellow-500 fill-current' : 'text-gray-300'
                  } hover:text-yellow-400 transition-colors`}
                >
                  <Star className="h-full w-full" />
                </button>
              ))}
            </div>
          </div>

          {/* Feedback Text */}
          <div>
            <label htmlFor="feedback" className="block text-sm font-medium text-gray-700 mb-2">
              Your Feedback
            </label>
            <textarea
              id="feedback"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-transparent"
              placeholder="Share your thoughts about your attachment experience..."
              required
            />
          </div>

          <div className="flex space-x-4">
            <Button 
              type="submit" 
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg transition-colors flex items-center space-x-2"
            >
              <Send className="h-4 w-4" />
              <span>Submit Feedback</span>
            </Button>
          </div>
        </form>
      </div>

      {/* Feedback History - Now Conditional */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Feedback History</h2>
        
        {supervisorFeedback.length === 0 ? (
          // Show "No feedback history" when no feedback exists
          <div className="text-center py-12">
            <div className="flex justify-center mb-4">
              <FileText className="h-16 w-16 text-gray-300" />
            </div>
            <h4 className="text-lg font-medium text-gray-500 mb-2">No feedback history</h4>
            <p className="text-gray-400">Feedback from your industry supervisor will appear here once submitted.</p>
          </div>
        ) : (
          // Show feedback history when feedback exists
          <div className="space-y-4">
            {supervisorFeedback.map((item) => (
              <div key={item.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      item.type === 'supervisor' ? 'bg-navy-100' : 'bg-orange-100'
                    }`}>
                      <User className={`h-5 w-5 ${
                        item.type === 'supervisor' ? 'text-navy-600' : 'text-orange-600'
                      }`} />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{item.author}</h4>
                      <p className="text-sm text-gray-500">{item.date}</p>
                    </div>
                  </div>
                  {item.rating && (
                    <div className="flex space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-4 w-4 ${
                            star <= item.rating ? 'text-yellow-500 fill-current' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>
                <p className="text-gray-700 leading-relaxed">{item.content}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Feedback;

