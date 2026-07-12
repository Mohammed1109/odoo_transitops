import React, { useEffect } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import Footer from "./Footer";
import { SidebarProvider, useSidebar } from "../contexts/SidebarContext";

export default function MainLayout({ children }: any) {
  const [ready, setReady] = React.useState(false);

  useEffect(() => {
    setTimeout(() => setReady(true), 10);
  }, []);

  // Wrap children with provider here
  return (
    <SidebarProvider>
      <InnerLayout ready={ready}>{children}</InnerLayout>
    </SidebarProvider>
  );
}
type InnerLayoutProps = Readonly<{
  children: React.ReactNode;
  ready: boolean;
}>;
/** InnerLayout consumes the context (no circular import) */
function InnerLayout({ children, ready }: InnerLayoutProps) {
  const { sidebarOpen, setSidebarOpen } = useSidebar();

  return (
    <div className="flex bg-gray-100 min-h-screen overflow-hidden">
      {/* Sidebar */}
      <Sidebar onToggle={setSidebarOpen} externalToggle={sidebarOpen} />

      {/* MAIN AREA */}
      <div className="flex-1 relative">
        {/* Header */}
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        {/* MAIN CONTENT WRAPPER THAT MOVES WITH SIDEBAR */}
        <main
          className={`
            pt-20 pb-20 px-6 
            ${ready ? "transition-all duration-300" : ""}
            ${sidebarOpen ? "ml-64" : "ml-0"}
          `}
        >
          {children}
        </main>

        {/* Footer */}
        <Footer sidebarOpen={sidebarOpen} />
      </div>
    </div>
  );
}
