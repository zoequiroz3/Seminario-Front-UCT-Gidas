import { Outlet } from "react-router-dom";
import Navbar from "@/components/Sidebar";

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <Navbar />
      <div className="max-w-6xl mx-auto p-6">
        <Outlet />
      </div>
    </div>
  );
}
