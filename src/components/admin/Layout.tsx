import Sidebar from "./Sidebar";
import MobileNavbar from "./MobileNavbar";
import { Toaster } from "sonner";

export type LayoutProps = {
  children?: React.ReactNode;
};

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="flex md:flex-row flex-col min-h-screen transition-all">
      {/* Mobile Navbar */}
      <div className="md:hidden">
        <MobileNavbar />
      </div>

      {/* Fixed Sidebar on desktop */}
      <div className="hidden md:block fixed left-0 top-0 h-screen w-64">
        <Sidebar />
      </div>

      {/* Main content */}
      <main className="flex-1 md:ml-70">
        <Toaster position="top-right" />
        {children}
      </main>
    </div>
  );
}
