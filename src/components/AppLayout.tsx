import { TopNav } from "./TopNav";
import { Outlet } from "react-router-dom";
import { BackgroundGradientAnimation } from "./BackgroundGradientAnimation";

export function AppLayout() {
  return (
    <div className="relative min-h-screen w-full">
      <BackgroundGradientAnimation containerClassName="fixed inset-0 -z-10" interactive={false} />
      <div className="relative z-0">
        <TopNav />
        <Outlet />
      </div>
    </div>
  );
}
