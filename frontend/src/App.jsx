import { BrowserRouter, Routes, Route } from "react-router";
import Resume from "./pages/Resume";
import Home from "./pages/Home";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/resumes" element={<Resume />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;