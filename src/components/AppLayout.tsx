import { TopNav } from "./TopNav";
import { Outlet } from "react-router-dom";

export function AppLayout() {
  return (
    <div className="min-h-screen w-full bg-background">
      <TopNav />
      <Outlet />
    </div>
  );
}
