import { NavLink } from "react-router";

function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-6">
      <div className="w-full max-w-2xl text-center">
        <div className="mb-6 inline-flex rounded-full bg-black px-4 py-2 text-sm font-medium text-white">
          Smart Resume Screener
        </div>

        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
          Welcome to the Resume Screener
        </h1>

        <p className="mx-auto mt-5 max-w-xl text-lg leading-8 text-gray-600">
          Upload resumes, extract candidate information using AI,
          and manage your resume data in one place.
        </p>

        <div className="mt-8">
          <NavLink
            to="/resumes"
            className="inline-flex items-center rounded-lg bg-black px-6 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
          >
            Go to Resume Manager
            <span className="ml-2">→</span>
          </NavLink>
          <NavLink
            to="/job-descriptions"
            className="ml-4 inline-flex items-center rounded-lg bg-gray-100 px-6 py-3 text-sm font-semibold text-gray-900 transition hover:bg-gray-200"
          >
            Go to Job Description Manager
            <span className="ml-2">→</span>
          </NavLink>
        </div>
      </div>
    </div>
  );
}

export default Home;