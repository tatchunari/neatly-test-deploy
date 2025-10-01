import Sidebar from "./Sidebar";
import MobileNavbar from "./MobileNavbar";
import { Toaster } from "sonner";

export type LayoutProps = {
  children?: React.ReactNode;
};

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="flex md:flex-row flex-col overflow-hidden min-h-screen transition-all">
      {/* Show MobileNavbar only on mobile */}
      <div className="md:hidden">
        <MobileNavbar />
      </div>

      {/* Show Sidebar only on desktop */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      <Toaster position="top-right" />
      {children}
    </div>
  );
}
