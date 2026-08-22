import { useState } from 'react';

function App() {
  const [files, setFiles] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files || []);

    setFiles(selectedFiles);
    setResults([]);
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      alert('Please select at least one file');
      return;
    }

    const formData = new FormData();

    files.forEach((file) => {
      formData.append('files', file);
    });

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

      setResults(data.resumes);
    } catch (error) {
      console.error(error);
      alert('Failed to upload files');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-12">
      <div className="mx-auto max-w-5xl">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Smart Resume Screener
          </h1>

          <p className="mt-2 text-gray-500">
            Upload multiple resumes and extract structured candidate information.
          </p>
        </div>

        {/* Upload Card */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">

          <h2 className="text-lg font-semibold text-gray-900">
            Upload Resumes
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Select multiple PDF or TXT resumes.
          </p>

          {/* File Input */}
          <label
            htmlFor="resumes"
            className="mt-6 flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 px-6 py-10 transition hover:border-gray-400 hover:bg-gray-100"
          >
            <div className="text-center">
              <p className="text-sm font-medium text-gray-700">
                Click to select resumes
              </p>

              <p className="mt-1 text-xs text-gray-500">
                PDF or TXT files
              </p>
            </div>

            <input
              id="resumes"
              type="file"
              accept=".pdf,.txt"
              multiple
              className="hidden"
              onChange={handleFileChange}
            />
          </label>

          {/* Selected Files */}
          {files.length > 0 && (
            <div className="mt-6">

              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900">
                  Selected Resumes
                </h3>

                <span className="text-sm text-gray-500">
                  {files.length} file{files.length !== 1 ? 's' : ''}
                </span>
              </div>

              <div className="space-y-2">
                {files.map((file, index) => (
                  <div
                    key={`${file.name}-${index}`}
                    className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-gray-800">
                        {file.name}
                      </p>

                      <p className="text-xs text-gray-500">
                        {(file.size / 1024).toFixed(1)} KB
                      </p>
                    </div>

                    <span className="ml-4 rounded-full bg-gray-200 px-2.5 py-1 text-xs font-medium text-gray-600">
                      {file.type === 'application/pdf' ? 'PDF' : 'TXT'}
                    </span>
                  </div>
                ))}
              </div>

              {/* Upload Button */}
              <button
                onClick={handleUpload}
                disabled={loading}
                className="mt-5 w-full rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading
                  ? `Processing ${files.length} resume${files.length !== 1 ? 's' : ''}...`
                  : `Process ${files.length} Resume${files.length !== 1 ? 's' : ''}`}
              </button>
            </div>
          )}
        </div>

        {/* Results */}
        {results.length > 0 && (
          <div className="mt-8">

            <div className="mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Processed Candidates
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                {results.filter((result) => !result.ignored && !result.error).length}{' '}
                valid resume
                {results.filter((result) => !result.ignored && !result.error).length !== 1
                  ? 's'
                  : ''}{' '}
                extracted.
              </p>
            </div>

            <div className="space-y-6">

              {results.map((result, index) => {
                const candidate = result.candidate;

                return (
                  <div
                    key={`${result.filename}-${index}`}
                    className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
                  >

                    {/* Candidate Header */}
                    <div className="mb-6 flex items-start justify-between border-b border-gray-100 pb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {candidate?.name || result.filename}
                        </h3>

                        <p className="mt-1 text-sm text-gray-500">
                          {result.filename}
                        </p>
                      </div>

                      {result.ignored ? (
                        <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-700">
                          Ignored
                        </span>
                      ) : result.error ? (
                        <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700">
                          Failed
                        </span>
                      ) : (
                        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                          Processed
                        </span>
                      )}
                    </div>

                    {/* Error / Ignored */}
                    {result.ignored && (
                      <p className="text-sm text-yellow-700">
                        {result.reason}
                      </p>
                    )}

                    {result.error && (
                      <p className="text-sm text-red-600">
                        {result.error}
                      </p>
                    )}

                    {/* Candidate Data */}
                    {candidate && !result.error && !result.ignored && (
                      <div className="space-y-6">

                        {/* Basic Information */}
                        <div>
                          <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
                            Contact Information
                          </h4>

                          <div className="grid gap-3 sm:grid-cols-2">
                            <div className="rounded-lg bg-gray-50 p-3">
                              <p className="text-xs text-gray-500">Email</p>
                              <p className="mt-1 text-sm text-gray-800">
                                {candidate.email || 'Not provided'}
                              </p>
                            </div>

                            <div className="rounded-lg bg-gray-50 p-3">
                              <p className="text-xs text-gray-500">Phone</p>
                              <p className="mt-1 text-sm text-gray-800">
                                {candidate.phone || 'Not provided'}
                              </p>
                            </div>

                            <div className="rounded-lg bg-gray-50 p-3 sm:col-span-2">
                              <p className="text-xs text-gray-500">Location</p>
                              <p className="mt-1 text-sm text-gray-800">
                                {candidate.location || 'Not provided'}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Summary */}
                        {candidate.summary && (
                          <div>
                            <h4 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500">
                              Summary
                            </h4>

                            <p className="text-sm leading-6 text-gray-700">
                              {candidate.summary}
                            </p>
                          </div>
                        )}

                        {/* Skills */}
                        <div>
                          <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
                            Skills
                          </h4>

                          <div className="flex flex-wrap gap-2">
                            {candidate.skills?.length > 0 ? (
                              candidate.skills.map((skill, skillIndex) => (
                                <span
                                  key={skillIndex}
                                  className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700"
                                >
                                  {skill}
                                </span>
                              ))
                            ) : (
                              <p className="text-sm text-gray-500">
                                No skills extracted
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Education */}
                        <div>
                          <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
                            Education
                          </h4>

                          <div className="space-y-3">
                            {candidate.education?.length > 0 ? (
                              candidate.education.map((education, eduIndex) => (
                                <div
                                  key={eduIndex}
                                  className="rounded-lg bg-gray-50 p-4"
                                >
                                  <p className="font-medium text-gray-800">
                                    {education.degree}
                                  </p>

                                  <p className="mt-1 text-sm text-gray-600">
                                    {education.institution}
                                  </p>

                                  {education.field && (
                                    <p className="mt-1 text-xs text-gray-500">
                                      {education.field}
                                    </p>
                                  )}

                                  <p className="mt-1 text-xs text-gray-500">
                                    {education.start_year || ''}
                                    {education.start_year &&
                                    education.end_year
                                      ? ' - '
                                      : ''}
                                    {education.end_year || ''}
                                  </p>
                                </div>
                              ))
                            ) : (
                              <p className="text-sm text-gray-500">
                                No education information extracted
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Experience */}
                        <div>
                          <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
                            Experience
                          </h4>

                          <div className="space-y-3">
                            {candidate.experience?.length > 0 ? (
                              candidate.experience.map((experience, expIndex) => (
                                <div
                                  key={expIndex}
                                  className="rounded-lg bg-gray-50 p-4"
                                >
                                  <p className="font-medium text-gray-800">
                                    {experience.role}
                                  </p>

                                  <p className="mt-1 text-sm text-gray-600">
                                    {experience.company}
                                  </p>

                                  <p className="mt-1 text-xs text-gray-500">
                                    {experience.start_date || ''}
                                    {experience.start_date &&
                                    experience.end_date
                                      ? ' - '
                                      : ''}
                                    {experience.end_date || ''}
                                  </p>

                                  {experience.description && (
                                    <p className="mt-3 text-sm leading-6 text-gray-600">
                                      {experience.description}
                                    </p>
                                  )}
                                </div>
                              ))
                            ) : (
                              <p className="text-sm text-gray-500">
                                No experience information extracted
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Projects */}
                        <div>
                          <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
                            Projects
                          </h4>

                          <div className="space-y-3">
                            {candidate.projects?.length > 0 ? (
                              candidate.projects.map((project, projectIndex) => (
                                <div
                                  key={projectIndex}
                                  className="rounded-lg bg-gray-50 p-4"
                                >
                                  <p className="font-medium text-gray-800">
                                    {project.name}
                                  </p>

                                  {project.description && (
                                    <p className="mt-2 text-sm leading-6 text-gray-600">
                                      {project.description}
                                    </p>
                                  )}

                                  {project.technologies?.length > 0 && (
                                    <div className="mt-3 flex flex-wrap gap-2">
                                      {project.technologies.map(
                                        (technology, techIndex) => (
                                          <span
                                            key={techIndex}
                                            className="rounded-md bg-white px-2 py-1 text-xs text-gray-600 ring-1 ring-gray-200"
                                          >
                                            {technology}
                                          </span>
                                        )
                                      )}
                                    </div>
                                  )}
                                </div>
                              ))
                            ) : (
                              <p className="text-sm text-gray-500">
                                No projects extracted
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Certifications & Achievements */}
                        <div className="grid gap-6 sm:grid-cols-2">

                          <div>
                            <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
                              Certifications
                            </h4>

                            {candidate.certifications?.length > 0 ? (
                              <ul className="space-y-2">
                                {candidate.certifications.map(
                                  (certification, certIndex) => (
                                    <li
                                      key={certIndex}
                                      className="text-sm text-gray-700"
                                    >
                                      • {certification}
                                    </li>
                                  )
                                )}
                              </ul>
                            ) : (
                              <p className="text-sm text-gray-500">
                                None
                              </p>
                            )}
                          </div>

                          <div>
                            <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
                              Achievements
                            </h4>

                            {candidate.achievements?.length > 0 ? (
                              <ul className="space-y-2">
                                {candidate.achievements.map(
                                  (achievement, achievementIndex) => (
                                    <li
                                      key={achievementIndex}
                                      className="text-sm text-gray-700"
                                    >
                                      • {achievement}
                                    </li>
                                  )
                                )}
                              </ul>
                            ) : (
                              <p className="text-sm text-gray-500">
                                None
                              </p>
                            )}
                          </div>

                        </div>

                        {/* Links */}
                        {candidate.links?.length > 0 && (
                          <div>
                            <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
                              Links
                            </h4>

                            <div className="space-y-1">
                              {candidate.links.map((link, linkIndex) => (
                                <p
                                  key={linkIndex}
                                  className="break-all text-sm text-blue-600"
                                >
                                  {link}
                                </p>
                              ))}
                            </div>
                          </div>
                        )}

                      </div>
                    )}
                  </div>
                );
              })}

            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;