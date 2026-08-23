import { BrowserRouter, Routes, Route } from "react-router";
import Resume from "./pages/Resume";
import JobDescriptions from "./pages/JobDescription";
import Home from "./pages/Home";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/resumes" element={<Resume />} />
        <Route path="/job-descriptions" element={<JobDescriptions />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;