import { TopNav } from "./TopNav";
import { Outlet } from "react-router-dom";
import { BackgroundGradientAnimation } from "./ui/background-gradient-animation";

export function AppLayout() {
  return (
    <div className="relative min-h-screen w-full bg-background">
      <BackgroundGradientAnimation />
      <TopNav />
      <Outlet />
    </div>
  );
}
