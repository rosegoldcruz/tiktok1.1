```typescript
import React, { useState } from 'react';
import { Star, MessageSquare, Send } from 'lucide-react';
import { motion } from 'framer-motion';
import { FeedbackCollector } from '../../lib/optimization/FeedbackCollector';

interface FeedbackFormProps {
  contentId: string;
  userId: string;
  onSubmit?: () => void;
}

const FeedbackForm: React.FC<FeedbackFormProps> = ({ contentId, userId, onSubmit }) => {
  const [feedbackType, setFeedbackType] = useState<'quality' | 'accuracy' | 'usefulness'>('quality');
  const [rating, setRating] = useState(0);
  const [comments, setComments] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const feedbackCollector = new FeedbackCollector();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await feedbackCollector.submitFeedback({
        contentId,
        userId,
        feedbackType,
        rating,
        comments
      });

      setRating(0);
      setComments('');
      onSubmit?.();
    } catch (error) {
      console.error('Error submitting feedback:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Feedback Type</label>
        <div className="flex space-x-4">
          {['quality', 'accuracy', 'usefulness'].map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setFeedbackType(type as any)}
              className={`px-4 py-2 rounded-lg text-sm ${
                feedbackType === type
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Rating</label>
        <div className="flex space-x-2">
          {[1, 2, 3, 4, 5].map((value) => (
            <motion.button
              key={value}
              type="button"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setRating(value)}
              className={`p-2 rounded-full ${
                value <= rating
                  ? 'text-yellow-400'
                  : 'text-gray-600'
              }`}
            >
              <Star
                size={24}
                fill={value <= rating ? 'currentColor' : 'none'}
              />
            </motion.button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Comments
          <span className="text-gray-400 text-xs ml-2">(optional)</span>
        </label>
        <div className="relative">
          <textarea
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            className="w-full bg-gray-800 text-white rounded-lg border border-gray-700 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={4}
            placeholder="Share your thoughts..."
          />
          <div className="absolute bottom-2 right-2 text-gray-400 text-xs">
            <MessageSquare size={14} className="inline mr-1" />
            {comments.length} / 500
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={!rating || submitting}
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          {submitting ? (
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white mr-2" />
          ) : (
            <Send size={16} className="mr-2" />
          )}
          Submit Feedback
        </button>
      </div>
    </form>
  );
};

export default FeedbackForm;
```