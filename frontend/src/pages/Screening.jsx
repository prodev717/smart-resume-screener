import { useEffect, useState } from "react";

const API_BASE = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
const SCREENING_API = API_BASE + "/api/screenings";
const RESUME_API = API_BASE + "/api/resumes";
const JD_API = API_BASE + "/api/job-descriptions";

function Screenings() {
  const [screenings, setScreenings] = useState([]);
  const [resumes, setResumes] = useState([]);
  const [jobs, setJobs] = useState([]);

  const [resumeId, setResumeId] = useState("");
  const [jdId, setJdId] = useState("");

  const [selectedScreening, setSelectedScreening] = useState(null);
  const [editScore, setEditScore] = useState("");
  const [editReason, setEditReason] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Fetch resumes and job descriptions
  useEffect(() => {
    fetchResumes();
    fetchJobs();
    fetchScreenings();
  }, []);

  const fetchResumes = async () => {
    try {
      const response = await fetch(RESUME_API);
      const data = await response.json();

      setResumes(data.resumes || []);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchJobs = async () => {
    try {
      const response = await fetch(JD_API);
      const data = await response.json();

      setJobs(data.jobs || []);
    } catch (error) {
      console.error(error);
    }
  };

  // GET screenings with optional filters
  const fetchScreenings = async () => {
    try {
      const params = new URLSearchParams();

      if (resumeId) {
        params.append("resume_id", resumeId);
      }

      if (jdId) {
        params.append("jd_id", jdId);
      }

      const url = params.toString()
        ? `${SCREENING_API}?${params.toString()}`
        : SCREENING_API;

      const response = await fetch(url);
      const data = await response.json();

      setScreenings(data.screenings || []);
    } catch (error) {
      console.error(error);
      setMessage("Failed to fetch screenings");
    }
  };

  // POST - AI screening
  const createScreening = async () => {
    if (!resumeId || !jdId) {
      setMessage("Select a resume and job description");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const response = await fetch(SCREENING_API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          resume_id: Number(resumeId),
          jd_id: Number(jdId),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Screening failed");
      }

      setMessage("AI screening completed successfully");

      setSelectedScreening(data.screening);

      fetchScreenings();
    } catch (error) {
      console.error(error);
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  // GET one screening
  const viewScreening = async (id) => {
    try {
      const response = await fetch(`${SCREENING_API}/${id}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch screening");
      }

      setSelectedScreening(data.screening);
      setEditScore(data.screening.score);
      setEditReason(data.screening.reason);
    } catch (error) {
      console.error(error);
      setMessage(error.message);
    }
  };

  // PUT
  const updateScreening = async () => {
    if (!selectedScreening) return;

    try {
      const response = await fetch(
        `${SCREENING_API}/${selectedScreening.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            score: Number(editScore),
            reason: editReason,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update screening");
      }

      setSelectedScreening(data.screening);
      setMessage("Screening updated successfully");

      fetchScreenings();
    } catch (error) {
      console.error(error);
      setMessage(error.message);
    }
  };

  // DELETE
  const deleteScreening = async (id) => {
    if (!window.confirm("Delete this screening?")) {
      return;
    }

    try {
      const response = await fetch(`${SCREENING_API}/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete screening");
      }

      setMessage("Screening deleted");

      if (selectedScreening?.id === id) {
        setSelectedScreening(null);
      }

      fetchScreenings();
    } catch (error) {
      console.error(error);
      setMessage(error.message);
    }
  };

  return (
    <div className="mx-auto max-w-[1240px]">
      <div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-extrabold tracking-[-0.06em] text-[#15222c] sm:text-5xl">
            Screening workspace
          </h1>

          <p className="mt-3 text-sm leading-6 text-[#718087]">
            Compare resumes against job descriptions using AI.
          </p>
        </div>

        {/* Create Screening */}
        <div className="mb-8 border border-[#e1e4dd] bg-[#fbfbf7] p-6 sm:p-8">
          <h2 className="mb-5 text-lg font-semibold">
            Start Screening
          </h2>

          <div className="grid gap-4 md:grid-cols-2">

            {/* Resume */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Resume
              </label>

              <select
                value={resumeId}
                onChange={(e) => setResumeId(e.target.value)}
                              className="w-full rounded-lg border border-[#d9dfd8] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#9fca4e] focus:ring-2 focus:ring-[#c8f36a]/40"
              >
                <option value="">Select a resume</option>

                {resumes.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.resume?.name || `Resume #${item.id}`}
                  </option>
                ))}
              </select>
            </div>

            {/* Job Description */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Job Description
              </label>

              <select
                value={jdId}
                onChange={(e) => setJdId(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-black"
              >
                <option value="">
                  Select a job description
                </option>

                {jobs.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.job_description?.title ||
                      `Job Description #${item.id}`}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={createScreening}
            disabled={loading}
              className="mt-5 rounded-lg bg-[#15222c] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#273944] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Screening..." : "Run AI Screening"}
          </button>

          {message && (
            <p className="mt-4 text-sm text-gray-600">
              {message}
            </p>
          )}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">

          {/* Screening List */}
            <div className="border border-[#e1e4dd] bg-[#fbfbf7] p-6 sm:p-8">

            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                Screening Results
              </h2>

              <button
                onClick={fetchScreenings}
                className="text-sm text-gray-500 hover:text-black"
              >
                Refresh
              </button>
            </div>

            {/* Filters */}
            <div className="mb-5 grid gap-3 sm:grid-cols-2">

              <select
                value={resumeId}
                onChange={(e) => {
                  setResumeId(e.target.value);
                  setTimeout(fetchScreenings, 0);
                }}
                              className="rounded-lg border border-[#d9dfd8] bg-white px-3 py-2 text-sm"
              >
                <option value="">All resumes</option>

                {resumes.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.resume?.name || `Resume #${item.id}`}
                  </option>
                ))}
              </select>

              <select
                value={jdId}
                onChange={(e) => {
                  setJdId(e.target.value);
                  setTimeout(fetchScreenings, 0);
                }}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
              >
                <option value="">All jobs</option>

                {jobs.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.job_description?.title ||
                      `JD #${item.id}`}
                  </option>
                ))}
              </select>
            </div>

            {screenings.length === 0 ? (
              <p className="text-sm text-gray-500">
                No screening results found.
              </p>
            ) : (
              <div className="space-y-3">
                {screenings.map((screening) => {

                  const resume = resumes.find(
                    (r) => r.id === screening.resume_id
                  );

                  const job = jobs.find(
                    (j) => j.id === screening.jd_id
                  );

                  return (
                    <div
                      key={screening.id}
                      className="rounded-lg border border-gray-200 p-4"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-gray-900">
                            {resume?.resume?.name ||
                              `Resume #${screening.resume_id}`}
                          </p>

                          <p className="text-sm text-gray-500">
                            {job?.job_description?.title ||
                              `JD #${screening.jd_id}`}
                          </p>
                        </div>

                        <div className="rounded-full bg-gray-100 px-3 py-1 text-sm font-semibold">
                          {screening.score}/10
                        </div>
                      </div>

                      <p className="mt-3 line-clamp-2 text-sm text-gray-600">
                        {screening.reason}
                      </p>

                      <div className="mt-4 flex gap-2">
                        <button
                          onClick={() =>
                            viewScreening(screening.id)
                          }
                          className="rounded-md border border-[#d9dfd8] px-3 py-1.5 text-xs font-bold text-[#52636a] hover:bg-[#edf3e7]"
                        >
                          View
                        </button>

                        <button
                          onClick={() =>
                            deleteScreening(screening.id)
                          }
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

          {/* Details */}
          <div className="border border-[#e1e4dd] bg-[#fbfbf7] p-6 sm:p-8">
            <h2 className="mb-5 text-lg font-semibold">
              Screening Details
            </h2>

            {!selectedScreening ? (
              <div className="flex h-64 items-center justify-center rounded-lg border border-dashed border-[#cfd8ce] bg-white">
                <p className="text-sm text-gray-400">
                  Select a screening result to view it.
                </p>
              </div>
            ) : (
              <div>
                <div className="mb-5 grid grid-cols-2 gap-4">
                  <div className="rounded-lg bg-[#edf3e7] p-4">
                    <p className="text-xs text-gray-400">
                      Resume ID
                    </p>

                    <p className="mt-1 font-semibold">
                      {selectedScreening.resume_id}
                    </p>
                  </div>

                  <div className="rounded-lg bg-[#edf3e7] p-4">
                    <p className="text-xs text-gray-400">
                      Job ID
                    </p>

                    <p className="mt-1 font-semibold">
                      {selectedScreening.jd_id}
                    </p>
                  </div>
                </div>

                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Score
                </label>

                <input
                  type="number"
                  min="1"
                  max="10"
                  value={editScore}
                  onChange={(e) =>
                    setEditScore(e.target.value)
                  }
                  className="mb-4 w-full rounded-lg border border-[#d9dfd8] bg-white px-3 py-2.5 outline-none focus:border-[#9fca4e] focus:ring-2 focus:ring-[#c8f36a]/40"
                />

                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Reason
                </label>

                <textarea
                  value={editReason}
                  onChange={(e) =>
                    setEditReason(e.target.value)
                  }
                  rows={8}
                  className="w-full resize-none rounded-lg border border-[#d9dfd8] bg-white p-4 text-sm outline-none focus:border-[#9fca4e] focus:ring-2 focus:ring-[#c8f36a]/40"
                />

                <button
                  onClick={updateScreening}
                  className="mt-4 w-full rounded-lg bg-[#15222c] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#273944]"
                >
                  Update Screening
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Screenings;