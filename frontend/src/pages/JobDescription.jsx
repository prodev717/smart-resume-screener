import { useEffect, useState } from "react";

const API_URL = (import.meta.env.VITE_BACKEND_URL || "http://localhost:3000") + "/api/job-descriptions";

function JobDescriptions() {
  const [text, setText] = useState("");
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [editText, setEditText] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // GET all
  const fetchJobs = async () => {
    try {
      const response = await fetch(API_URL);
      const data = await response.json();

      setJobs(data.jobs || []);
    } catch (error) {
      console.error(error);
      setMessage("Failed to fetch job descriptions");
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  // POST
  const createJob = async () => {
    if (!text.trim()) {
      setMessage("Enter a job description first");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create job");
      }

      setMessage("Job description created successfully");
      setText("");

      fetchJobs();
    } catch (error) {
      console.error(error);
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  // GET one
  const getJob = async (id) => {
    try {
      const response = await fetch(`${API_URL}/${id}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch job");
      }

      setSelectedJob(data.job);
      setEditText(
        JSON.stringify(data.job.job_description, null, 2)
      );
    } catch (error) {
      console.error(error);
      setMessage(error.message);
    }
  };

  // PUT
  const updateJob = async () => {
    if (!selectedJob) return;

    try {
      let parsedJob;

      try {
        parsedJob = JSON.parse(editText);
      } catch {
        setMessage("Invalid JSON");
        return;
      }

      const response = await fetch(
        `${API_URL}/${selectedJob.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            job: parsedJob,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update job");
      }

      setSelectedJob(data.job);
      setEditText(
        JSON.stringify(data.job.job_description, null, 2)
      );

      setMessage("Job description updated successfully");

      fetchJobs();
    } catch (error) {
      console.error(error);
      setMessage(error.message);
    }
  };

  // DELETE
  const deleteJob = async (id) => {
    if (!window.confirm("Delete this job description?")) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete job");
      }

      setMessage("Job description deleted");

      if (selectedJob?.id === id) {
        setSelectedJob(null);
        setEditText("");
      }

      fetchJobs();
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
            Role library
          </h1>

          <p className="mt-3 text-sm leading-6 text-[#718087]">
            Turn role context into structured signals your team can screen against.
          </p>
        </div>

        {/* Create */}
        <div className="mb-8 border border-[#e1e4dd] bg-[#fbfbf7] p-6 sm:p-8">
          <h2 className="mb-4 text-lg font-semibold">
            Create Job Description
          </h2>

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste the job description here..."
            rows={8}
            className="w-full resize-none rounded-lg border border-[#d9dfd8] bg-white p-4 text-sm outline-none focus:border-[#9fca4e] focus:ring-2 focus:ring-[#c8f36a]/40"
          />

          <div className="mt-4 flex items-center gap-4">
            <button
              onClick={createJob}
              disabled={loading}
              className="rounded-lg bg-[#15222c] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#273944] disabled:opacity-50"
            >
              {loading ? "Processing..." : "Analyze JD"}
            </button>

            {message && (
              <p className="text-sm text-gray-600">
                {message}
              </p>
            )}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">

          {/* List */}
          <div className="border border-[#e1e4dd] bg-[#fbfbf7] p-6 sm:p-8">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                Saved Job Descriptions
              </h2>

              <button
                onClick={fetchJobs}
                className="text-sm text-gray-500 hover:text-black"
              >
                Refresh
              </button>
            </div>

            {jobs.length === 0 ? (
              <p className="text-sm text-gray-500">
                No job descriptions found.
              </p>
            ) : (
              <div className="space-y-3">
                {jobs.map((item) => {
                  const job = item.job_description;

                  return (
                    <div
                      key={item.id}
                      className="flex items-center justify-between rounded-lg border border-gray-200 p-4"
                    >
                      <div className="min-w-0">
                        <h3 className="truncate font-medium text-gray-900">
                          {job?.title || "Untitled Position"}
                        </h3>

                        <p className="mt-1 text-sm text-gray-500">
                          {job?.company || "Unknown company"}
                        </p>

                        <p className="mt-1 text-xs text-gray-400">
                          ID: {item.id}
                        </p>
                      </div>

                      <div className="ml-4 flex shrink-0 gap-2">
                        <button
                          onClick={() => getJob(item.id)}
                          className="rounded-md border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50"
                        >
                          View
                        </button>

                        <button
                          onClick={() => deleteJob(item.id)}
                          className="rounded-md bg-red-50 px-3 py-1.5 text-sm text-red-600 hover:bg-red-100"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Details / Edit */}
          <div className="border border-[#e1e4dd] bg-[#fbfbf7] p-6 sm:p-8">
            <h2 className="mb-5 text-lg font-semibold">
              Job Details
            </h2>

            {!selectedJob ? (
              <div className="flex h-64 items-center justify-center rounded-lg border border-dashed border-gray-300">
                <p className="text-sm text-gray-400">
                  Select a job description to view it.
                </p>
              </div>
            ) : (
              <>
                <div className="mb-4">
                  <p className="text-xs text-gray-400">
                    Job ID
                  </p>

                  <p className="font-medium text-gray-900">
                    {selectedJob.id}
                  </p>
                </div>

                <textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  rows={18}
                  className="w-full resize-none rounded-lg border border-[#d9dfd8] bg-white p-4 font-mono text-xs outline-none focus:border-[#9fca4e] focus:ring-2 focus:ring-[#c8f36a]/40"
                />

                <button
                  onClick={updateJob}
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

export default JobDescriptions;