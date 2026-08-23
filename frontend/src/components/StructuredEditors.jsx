const inputClass = "w-full rounded-lg border border-[#d9dfd8] bg-white px-3 py-2.5 text-sm text-[#33434b] outline-none focus:border-[#9fca4e] focus:ring-2 focus:ring-[#c8f36a]/40";
const labelClass = "mb-1.5 block text-[11px] font-bold uppercase tracking-[0.12em] text-[#82908e]";

function Field({ label, value, onChange, multiline = false }) {
  const Component = multiline ? "textarea" : "input";
  return <label className="block"><span className={labelClass}>{label}</span><Component value={value || ""} onChange={(event) => onChange(event.target.value)} rows={multiline ? 4 : undefined} className={`${inputClass} ${multiline ? "resize-none" : ""}`} /></label>;
}

function ListField({ label, values, onChange, placeholder }) {
  return <label className="block"><span className={labelClass}>{label}</span><input value={(values || []).join(", ")} onChange={(event) => onChange(event.target.value.split(",").map((item) => item.trim()).filter(Boolean))} placeholder={placeholder} className={inputClass} /><span className="mt-1 block text-[11px] text-[#9aa49e]">Separate items with commas</span></label>;
}

function SectionTitle({ children }) {
  return <h3 className="border-b border-[#e5e8e1] pb-2 text-xs font-extrabold uppercase tracking-[0.15em] text-[#52636a]">{children}</h3>;
}

function ResumeEditor({ resume, onChange }) {
  const update = (field, value) => onChange({ ...resume, [field]: value });
  const updateNested = (field, index, key, value) => onChange({ ...resume, [field]: resume[field].map((item, itemIndex) => itemIndex === index ? { ...item, [key]: value } : item) });
  return <div className="space-y-7">
    <div><SectionTitle>Profile</SectionTitle><div className="mt-4 grid gap-4 sm:grid-cols-2"><Field label="Name" value={resume.name} onChange={(value) => update("name", value)} /><Field label="Email" value={resume.email} onChange={(value) => update("email", value)} /><Field label="Phone" value={resume.phone} onChange={(value) => update("phone", value)} /><Field label="Location" value={resume.location} onChange={(value) => update("location", value)} /></div><div className="mt-4"><Field label="Summary" value={resume.summary} onChange={(value) => update("summary", value)} multiline /></div></div>
    <div><SectionTitle>Skills & links</SectionTitle><div className="mt-4 grid gap-4 sm:grid-cols-2"><ListField label="Skills" values={resume.skills} onChange={(value) => update("skills", value)} placeholder="React, SQL, Communication" /><ListField label="Certifications" values={resume.certifications} onChange={(value) => update("certifications", value)} placeholder="Certification names" /><ListField label="Achievements" values={resume.achievements} onChange={(value) => update("achievements", value)} placeholder="Notable achievements" /><ListField label="Links" values={resume.links} onChange={(value) => update("links", value)} placeholder="https://..." /></div></div>
    <div><SectionTitle>Education</SectionTitle><div className="mt-4 space-y-4">{(resume.education || []).map((item, index) => <div key={index} className="rounded-xl border border-[#e1e4dd] bg-white p-4"><p className="mb-3 text-xs font-bold text-[#15222c]">Education {index + 1}</p><div className="grid gap-3 sm:grid-cols-2"><Field label="Degree" value={item.degree} onChange={(value) => updateNested("education", index, "degree", value)} /><Field label="Institution" value={item.institution} onChange={(value) => updateNested("education", index, "institution", value)} /><Field label="Field" value={item.field} onChange={(value) => updateNested("education", index, "field", value)} /><Field label="Start year" value={item.start_year} onChange={(value) => updateNested("education", index, "start_year", value)} /><Field label="End year" value={item.end_year} onChange={(value) => updateNested("education", index, "end_year", value)} /></div></div>)}</div></div>
    <div><SectionTitle>Experience</SectionTitle><div className="mt-4 space-y-4">{(resume.experience || []).map((item, index) => <div key={index} className="rounded-xl border border-[#e1e4dd] bg-white p-4"><p className="mb-3 text-xs font-bold text-[#15222c]">Experience {index + 1}</p><div className="grid gap-3 sm:grid-cols-2"><Field label="Company" value={item.company} onChange={(value) => updateNested("experience", index, "company", value)} /><Field label="Role" value={item.role} onChange={(value) => updateNested("experience", index, "role", value)} /><Field label="Start date" value={item.start_date} onChange={(value) => updateNested("experience", index, "start_date", value)} /><Field label="End date" value={item.end_date} onChange={(value) => updateNested("experience", index, "end_date", value)} /></div><div className="mt-3"><Field label="Description" value={item.description} onChange={(value) => updateNested("experience", index, "description", value)} multiline /></div></div>)}</div></div>
    <div><SectionTitle>Projects</SectionTitle><div className="mt-4 space-y-4">{(resume.projects || []).map((item, index) => <div key={index} className="rounded-xl border border-[#e1e4dd] bg-white p-4"><p className="mb-3 text-xs font-bold text-[#15222c]">Project {index + 1}</p><Field label="Name" value={item.name} onChange={(value) => updateNested("projects", index, "name", value)} /><div className="mt-3"><Field label="Description" value={item.description} onChange={(value) => updateNested("projects", index, "description", value)} multiline /></div><div className="mt-3"><ListField label="Technologies" values={item.technologies} onChange={(value) => updateNested("projects", index, "technologies", value)} placeholder="JavaScript, PostgreSQL" /></div></div>)}</div></div>
  </div>;
}

const jobScalarFields = [["title", "Title"], ["company", "Company"], ["location", "Location"], ["employment_type", "Employment type"], ["work_mode", "Work mode"], ["experience_required", "Experience required"], ["salary", "Salary"], ["application_deadline", "Application deadline"], ["application_url", "Application URL"]];
const jobListFields = [["responsibilities", "Responsibilities"], ["required_skills", "Required skills"], ["preferred_skills", "Preferred skills"], ["required_qualifications", "Required qualifications"], ["preferred_qualifications", "Preferred qualifications"], ["education", "Education"], ["certifications", "Certifications"], ["soft_skills", "Soft skills"], ["benefits", "Benefits"], ["keywords", "Keywords"]];

function JobEditor({ job, onChange }) {
  const update = (field, value) => onChange({ ...job, [field]: value });
  return <div className="space-y-7"><div><SectionTitle>Role details</SectionTitle><div className="mt-4 grid gap-4 sm:grid-cols-2">{jobScalarFields.map(([field, label]) => <Field key={field} label={label} value={job[field]} onChange={(value) => update(field, value)} />)}</div><div className="mt-4"><Field label="Summary" value={job.summary} onChange={(value) => update("summary", value)} multiline /></div></div><div><SectionTitle>Role signals</SectionTitle><div className="mt-4 grid gap-4 sm:grid-cols-2">{jobListFields.map(([field, label]) => <ListField key={field} label={label} values={job[field]} onChange={(value) => update(field, value)} placeholder={`${label}...`} />)}</div></div></div>;
}

export { ResumeEditor, JobEditor };
