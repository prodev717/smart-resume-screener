import { useEffect, useState } from "react";
import { ResumeEditor } from "../components/StructuredEditors";

const API_URL = (import.meta.env.VITE_BACKEND_URL || "http://localhost:3000") + "/api/resumes";

function Resume() {
  const [resumes, setResumes] = useState([]);
  const [files, setFiles] = useState([]);
  const [selectedResume, setSelectedResume] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Fetch all resumes
  const fetchResumes = async () => {
    try {
      const response = await fetch(API_URL);
      const data = await response.json();

      setResumes(data.resumes || []);
    } catch (error) {
      console.error(error);
      setMessage("Failed to fetch resumes");
    }
  };

  useEffect(() => {
    fetchResumes();
  }, []);

  // Upload resumes
  const handleUpload = async () => {
    if (files.length === 0) {
      setMessage("Select at least one file");
      return;
    }

    const formData = new FormData();

    files.forEach((file) => {
      formData.append("files", file);
    });

    try {
      setLoading(true);
      setMessage("");

      const response = await fetch(API_URL, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Upload failed");
      }

      setMessage(`${data.resumes.length} file(s) processed`);
      setFiles([]);

      // Reset file input
      document.getElementById("fileInput").value = "";

      fetchResumes();
    } catch (error) {
      console.error(error);
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Delete resume
  const handleDelete = async (id) => {
    if (!confirm("Delete this resume?")) return;

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete resume");
      }

      setMessage("Resume deleted");

      if (selectedResume?.id === id) {
        setSelectedResume(null);
      }

      fetchResumes();
    } catch (error) {
      console.error(error);
      setMessage(error.message);
    }
  };

  // Select a resume
  const handleView = async (id) => {
    try {
      const response = await fetch(`${API_URL}/${id}`);
      const data = await response.json();

      setSelectedResume(data.resume);
    } catch (error) {
      console.error(error);
      setMessage("Failed to load resume");
    }
  };

  // Update resume
  const handleUpdate = async () => {
    if (!selectedResume) return;

    try {
      const response = await fetch(
        `${API_URL}/${selectedResume.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            resume: selectedResume.resume,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Update failed");
      }

      setSelectedResume(data.resume);
      setMessage("Resume updated");

      fetchResumes();
    } catch (error) {
      console.error(error);
      setMessage(error.message);
    }
  };

  return (
    <div className="mx-auto max-w-[1240px]">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-extrabold tracking-[-0.06em] text-[#15222c] sm:text-5xl">
            Resume library
          </h1>

          <p className="mt-3 text-sm leading-6 text-[#718087]">
            Upload, review, and keep your candidate data ready for matching.
          </p>
        </div>

        {/* Upload */}
        <div className="mb-8 border border-[#e1e4dd] bg-[#fbfbf7] p-6 sm:p-8">
          <h2 className="mb-4 text-lg font-semibold">
            Upload Resumes
          </h2>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <input
              id="fileInput"
              type="file"
              multiple
              accept=".pdf,.txt"
              onChange={(e) => setFiles(Array.from(e.target.files))}
              className="block w-full rounded-lg border border-[#d9dfd8] bg-white p-2.5 text-sm file:mr-4 file:rounded-md file:border-0 file:bg-[#edf3e7] file:px-3 file:py-2 file:text-xs file:font-bold"
            />

            <button
              onClick={handleUpload}
              disabled={loading}
              className="rounded-lg bg-[#15222c] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#273944] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Processing..." : "Upload"}
            </button>
          </div>

          {files.length > 0 && (
            <p className="mt-3 text-sm text-gray-500">
              {files.length} file(s) selected
            </p>
          )}

          <label className="mt-3 block text-sm text-gray-500">
            You can upload up to 20 resumes at a time.
          </label>

          {message && (
            <p className="mt-4 rounded-lg bg-gray-50 p-3 text-sm text-gray-600">
              {message}
            </p>
          )}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Resume List */}
          <div className="border border-[#e1e4dd] bg-[#fbfbf7] p-6 sm:p-8">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                Resumes
              </h2>

              <button
                onClick={fetchResumes}
                className="text-sm text-gray-500 hover:text-black"
              >
                Refresh
              </button>
            </div>

            {resumes.length === 0 ? (
              <p className="text-sm text-gray-500">
                No resumes found.
              </p>
            ) : (
              <div className="space-y-3">
                {resumes.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-lg border border-gray-200 p-4"
                  >
                    <div>
                      <p className="font-medium text-gray-900">
                        {item.resume?.name || "Unnamed Candidate"}
                      </p>

                      <p className="text-sm text-gray-500">
                        {item.resume?.email || "No email"}
                      </p>

                      <p className="mt-1 text-xs text-gray-400">
                        ID: {item.id}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleView(item.id)}
                        className="rounded-md border px-3 py-1.5 text-sm hover:bg-gray-50"
                      >
                        View
                      </button>

                      <button
                        onClick={() => handleDelete(item.id)}
                        className="rounded-md bg-red-50 px-3 py-1.5 text-sm text-red-600 hover:bg-red-100"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Resume Editor */}
          <div className="border border-[#e1e4dd] bg-[#fbfbf7] p-6 sm:p-8">
            <h2 className="mb-4 text-lg font-semibold">
              Resume Details
            </h2>

            {!selectedResume ? (
              <p className="text-sm text-gray-500">
                Select a resume to view or edit it.
              </p>
            ) : (
              <>
                <div className="mb-4 rounded-lg bg-gray-50 p-3">
                  <p className="text-xs text-gray-400">
                    Resume ID
                  </p>

                  <p className="font-medium">
                    {selectedResume.id}
                  </p>
                </div>

                <ResumeEditor
                  resume={selectedResume.resume}
                  onChange={(resume) =>
                    setSelectedResume({ ...selectedResume, resume })
                  }
                />

                <button
                  onClick={handleUpdate}
                  className="mt-4 w-full rounded-lg bg-[#15222c] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#273944]"
                >
                  Save Changes
                </button>
              </>
            )}
          </div>
        </div>
    </div>
  );
}

export default Resume;