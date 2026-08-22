import { useState } from 'react';

function App() {
  const [file, setFile] = useState(null);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!file) {
      alert('Please select a file');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setLoading(true);

    try {
      const response = await fetch('http://localhost:3000/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      setText(data.text);
    } catch (error) {
      console.error(error);
      alert('Failed to upload file');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-12">
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Smart Resume Screener
          </h1>

          <p className="mt-2 text-gray-500">
            Upload a resume to extract its contents.
          </p>
        </div>

        {/* Upload Card */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">
            Upload Resume
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Supported formats: PDF and TXT
          </p>

          {/* File Input */}
          <label
            htmlFor="resume"
            className="mt-6 flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 px-6 py-10 transition hover:border-gray-400 hover:bg-gray-100"
          >
            <div className="text-center">
              <p className="text-sm font-medium text-gray-700">
                Click to select a resume
              </p>

              <p className="mt-1 text-xs text-gray-500">
                PDF or TXT
              </p>
            </div>

            <input
              id="resume"
              type="file"
              accept=".pdf,.txt"
              className="hidden"
              onChange={(e) => {
                setFile(e.target.files?.[0] || null);
                setText('');
              }}
            />
          </label>

          {/* Selected File */}
          {file && (
            <div className="mt-4 flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3">
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-800">
                  {file.name}
                </p>

                <p className="text-xs text-gray-500">
                  {(file.size / 1024).toFixed(1)} KB
                </p>
              </div>

              <button
                onClick={handleUpload}
                disabled={loading}
                className="ml-4 rounded-lg bg-black px-5 py-2 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'Upload'}
              </button>
            </div>
          )}
        </div>

        {/* Extracted Text */}
        {text && (
          <div className="mt-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Extracted Text
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Text extracted from the uploaded resume.
              </p>
            </div>

            <pre className="max-h-[500px] overflow-auto whitespace-pre-wrap rounded-lg bg-gray-50 p-4 font-mono text-sm leading-6 text-gray-700">
              {text}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;