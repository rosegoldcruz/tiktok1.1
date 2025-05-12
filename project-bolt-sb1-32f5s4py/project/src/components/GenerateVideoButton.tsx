import React, { useState } from 'react';
import axios from 'axios';

interface Props {
  script: string;
  trendCategory: string;
  filename: string;
}

// One-click video trigger UI, pipes request to backend then allows user download/edit
const GenerateVideoButton: React.FC<Props> = ({ script, trendCategory, filename }) => {
  const [loading, setLoading] = useState(false);
  const [videoPath, setVideoPath] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post('/api/generate-video', { script, trendCategory, filename });
      setVideoPath(res.data.path);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button onClick={handleGenerate} disabled={loading}>
        {loading ? 'Generating...' : 'Generate Video'}
      </button>
      {videoPath && <a href={videoPath} download>Download Video</a>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default GenerateVideoButton;