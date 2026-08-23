import { useState } from "react";
import { NavLink } from "react-router";

const navigation = [
  { label: "Overview", to: "/", icon: "grid" },
  { label: "Resumes", to: "/resumes", icon: "file" },
  { label: "Job descriptions", to: "/job-descriptions", icon: "briefcase" },
  { label: "Screenings", to: "/screenings", icon: "spark" },
];

function Icon({ name, size = 18 }) {
  const paths = {
    grid: <><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></>,
    file: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6M8 13h8M8 17h5" /></>,
    briefcase: <><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18M10 12v2h4v-2" /></>,
    spark: <><path d="m12 3-1.7 5.3L5 10l5.3 1.7L12 17l1.7-5.3L19 10l-5.3-1.7z" /><path d="m19 16-.7 2.3L16 19l2.3.7L19 22l.7-2.3L22 19l-2.3-.7z" /></>,
    menu: <><path d="M4 6h16M4 12h16M4 18h16" /></>,
    close: <><path d="m6 6 12 12M18 6 6 18" /></>,
    arrow: <><path d="M5 12h14M13 6l6 6-6 6" /></>,
  };
  return <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>;
}

function AppShell({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className="min-h-screen bg-[#f6f5ef] text-[#15222c]">
      {sidebarOpen && <button aria-label="Close navigation" className="fixed inset-0 z-30 bg-[#15222c]/35 lg:hidden" onClick={() => setSidebarOpen(false)} />}
      <aside className={`fixed inset-y-0 left-0 z-40 flex w-[264px] flex-col border-r border-[#dfe3dc] bg-[#fbfbf7] px-5 py-6 transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex items-center justify-between px-2"><NavLink to="/" className="flex items-center gap-3" onClick={() => setSidebarOpen(false)}><span className="flex h-9 w-9 items-center justify-center rounded-[11px] bg-[#c8f36a] text-sm font-black tracking-tighter text-[#15222c]">HL</span><span className="text-[19px] font-extrabold tracking-[-0.04em]">HireLens</span></NavLink><button aria-label="Close navigation" className="rounded-lg p-2 text-[#71808a] hover:bg-[#eef1e9] lg:hidden" onClick={() => setSidebarOpen(false)}><Icon name="close" /></button></div>
        <div className="mt-12 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-[#8c9794]">Workspace</div>
        <nav className="mt-3 space-y-1">{navigation.map((item) => <NavLink key={item.to} to={item.to} end={item.to === "/"} onClick={() => setSidebarOpen(false)} className={({ isActive }) => `group flex items-center gap-3 rounded-xl px-3 py-3 text-[13px] font-semibold transition ${isActive ? "bg-[#15222c] text-white shadow-[0_5px_12px_rgba(21,34,44,0.14)]" : "text-[#66747a] hover:bg-[#eef1e9] hover:text-[#15222c]"}`}><Icon name={item.icon} size={17} />{item.label}</NavLink>)}</nav>
        <div className="mt-auto rounded-2xl bg-[#edf3e7] p-4"><div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg bg-white text-[#66747a]"><Icon name="spark" size={16} /></div><p className="text-sm font-bold">AI-assisted hiring</p><p className="mt-1 text-xs leading-5 text-[#708078]">Find signal in every application with less busywork.</p></div>
      </aside>
      <main className="min-h-screen lg:pl-[264px]"><header className="flex h-[76px] items-center justify-between border-b border-[#e1e4dd] bg-[#f6f5ef]/90 px-5 backdrop-blur sm:px-8 lg:px-11"><button aria-label="Open navigation" className="rounded-lg p-2 text-[#53636a] hover:bg-white lg:hidden" onClick={() => setSidebarOpen(true)}><Icon name="menu" /></button><div className="hidden text-xs font-bold uppercase tracking-[0.16em] text-[#87918d] lg:block">Talent intelligence / 2026</div><div className="ml-auto flex items-center gap-3 text-xs font-semibold text-[#66747a]"><span className="h-2 w-2 rounded-full bg-[#9ed53e]" /> All systems operational</div></header><div className="px-5 py-8 sm:px-8 lg:px-11 lg:py-10">{children}</div></main>
    </div>
  );
}

export { Icon };
export default AppShell;