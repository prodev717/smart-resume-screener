import { useEffect, useState } from "react";
import { NavLink } from "react-router";
import { Icon } from "../components/AppShell";

const API_BASE = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
const initialData = { resumes: 0, jobs: 0, screenings: 0, average: 0 };

function StatCard({ label, value, detail, accent, icon }) {
  return <div className="border border-[#e1e4dd] bg-[#fbfbf7] p-5 shadow-[0_4px_16px_rgba(21,34,44,0.025)] sm:p-6"><div className="flex items-start justify-between"><p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#82908e]">{label}</p><span className={`flex h-9 w-9 items-center justify-center rounded-xl ${accent}`}><Icon name={icon} size={17} /></span></div><p className="mt-7 text-4xl font-extrabold tracking-[-0.06em] text-[#15222c]">{value}</p><p className="mt-2 text-xs font-medium text-[#81908b]">{detail}</p></div>;
}

function HealthRow({ label, status }) {
  const healthy = status === "ok";
  return <div className="flex items-center justify-between border-b border-[#e5e8e1] py-4 last:border-0"><div className="flex items-center gap-3"><span className={`h-2.5 w-2.5 rounded-full ${healthy ? "bg-[#9ed53e]" : "bg-[#ed997f]"}`} /><span className="text-sm font-semibold text-[#33434b]">{label}</span></div><span className={`text-[11px] font-bold uppercase tracking-[0.12em] ${healthy ? "text-[#719d27]" : "text-[#c05c4d]"}`}>{healthy ? "Healthy" : "Unavailable"}</span></div>;
}

function Home() {
  const [data, setData] = useState(initialData);
  const [health, setHealth] = useState({ server: "unknown", database: "unknown", gemini: "unknown" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      const [resumes, jobs, screenings, healthResponse] = await Promise.allSettled([
        fetch(`${API_BASE}/api/resumes`).then((response) => response.json()),
        fetch(`${API_BASE}/api/job-descriptions`).then((response) => response.json()),
        fetch(`${API_BASE}/api/screenings`).then((response) => response.json()),
        fetch(`${API_BASE}/health`).then((response) => response.json()),
      ]);
      const screeningRows = screenings.status === "fulfilled" ? screenings.value.screenings || [] : [];
      const scores = screeningRows.map((screening) => Number(screening.score)).filter(Number.isFinite);
      setData({
        resumes: resumes.status === "fulfilled" ? resumes.value.count ?? resumes.value.resumes?.length ?? 0 : 0,
        jobs: jobs.status === "fulfilled" ? jobs.value.count ?? jobs.value.jobs?.length ?? 0 : 0,
        screenings: screenings.status === "fulfilled" ? screenings.value.count ?? screeningRows.length : 0,
        average: scores.length ? scores.reduce((sum, score) => sum + score, 0) / scores.length : 0,
      });
      if (healthResponse.status === "fulfilled") {
        setHealth({
          server: healthResponse.value.checks?.server?.status || "error",
          database: healthResponse.value.checks?.database?.status || "error",
          gemini: healthResponse.value.checks?.gemini?.status || "error",
        });
      } else {
        setHealth({ server: "error", database: "error", gemini: "error" });
      }
      setLoading(false);
    };
    loadDashboard();
  }, []);

  return <div className="mx-auto max-w-[1240px]">
    <section className="flex flex-col justify-between gap-6 border-b border-[#dfe3dc] pb-8 sm:flex-row sm:items-end"><div><p className="mb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-[#7c9e3b]">Overview</p><h1 className="text-4xl font-extrabold tracking-[-0.06em] text-[#15222c] sm:text-5xl">Good morning, hiring team.</h1><p className="mt-3 max-w-xl text-sm leading-6 text-[#718087]">A clear view of your talent pipeline, from first upload to final shortlist.</p></div><NavLink to="/resumes" className="inline-flex items-center justify-center gap-2 self-start rounded-xl bg-[#c8f36a] px-4 py-3 text-sm font-bold text-[#15222c] transition hover:bg-[#b9e85a] sm:self-auto">Add resumes <Icon name="arrow" size={16} /></NavLink></section>
    <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><StatCard label="Total resumes" value={loading ? "--" : data.resumes} detail="Candidates in your library" accent="bg-[#e2f5b7] text-[#6e982e]" icon="file" /><StatCard label="Job descriptions" value={loading ? "--" : data.jobs} detail="Roles ready for matching" accent="bg-[#dcebf4] text-[#4c819d]" icon="briefcase" /><StatCard label="Screenings" value={loading ? "--" : data.screenings} detail="AI-powered evaluations" accent="bg-[#f5e3c5] text-[#ae7940]" icon="spark" /><StatCard label="Average score" value={loading ? "--" : data.average ? `${data.average.toFixed(1)}/10` : "--"} detail="Across completed screenings" accent="bg-[#f2d9dc] text-[#ad5d69]" icon="grid" /></section>
    <section className="mt-8 grid gap-5 lg:grid-cols-[1.35fr_1fr]"><div className="border border-[#e1e4dd] bg-[#15222c] p-6 text-white sm:p-8"><div className="flex items-center justify-between"><div><p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#a2bd71]">Your pipeline</p><h2 className="mt-2 text-2xl font-extrabold tracking-[-0.04em]">Move from data to decisions.</h2></div><span className="rounded-full border border-white/15 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[#becac4]">Live workspace</span></div><p className="mt-5 max-w-md text-sm leading-6 text-[#aab9b4]">Upload candidate resumes, add the role context, and let HireLens surface the strongest matches.</p><div className="mt-8 flex flex-wrap gap-3"><NavLink to="/resumes" className="rounded-lg bg-white px-4 py-2.5 text-xs font-bold text-[#15222c] hover:bg-[#e7eedf]">Review resumes</NavLink><NavLink to="/screenings" className="rounded-lg border border-white/20 px-4 py-2.5 text-xs font-bold text-white hover:bg-white/10">Run a screening</NavLink></div></div>
      <div className="border border-[#e1e4dd] bg-[#fbfbf7] p-6 sm:p-8"><div className="flex items-center justify-between"><div><p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#82908e]">Platform health</p><h2 className="mt-2 text-2xl font-extrabold tracking-[-0.04em]">Everything in sync.</h2></div><span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#e2f5b7] text-[#719d27]"><span className="h-2.5 w-2.5 rounded-full bg-current" /></span></div><div className="mt-5"><HealthRow label="Application server" status={health.server} /><HealthRow label="PostgreSQL database" status={health.database} /><HealthRow label="Gemini AI" status={health.gemini} /></div></div></section>
  </div>;
}

export default Home;