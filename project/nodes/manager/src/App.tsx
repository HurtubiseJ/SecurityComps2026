import { Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import DocsApp from "./pages/Docs";

export default function App() {
  return (
    <Routes>
        <Route path="/" element={<Dashboard/>} />
        <Route path="/docs" element={<DocsApp />} />
    </Routes>
  );
}


