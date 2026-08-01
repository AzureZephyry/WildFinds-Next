"use client";

import { useEffect, useState } from "react";
import NavigationDrawer from "@/shared/layout/NavigationDrawer";
import SiteHeader from "@/shared/layout/SiteHeader";

export default function ApplicationShell({ children }: { children: React.ReactNode }) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const toggleDrawer = () => {
    setIsDrawerOpen((previousValue) => !previousValue);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
  };

  useEffect(() => {
    document.body.classList.toggle("drawer-open", isDrawerOpen);

    return () => {
      document.body.classList.remove("drawer-open");
    };
  }, [isDrawerOpen]);

  return (
    <div>
      <SiteHeader onMenuToggle={toggleDrawer} isDrawerOpen={isDrawerOpen} />
      <NavigationDrawer isOpen={isDrawerOpen} onClose={closeDrawer} />
      <main className="page-layout">{children}</main>
    </div>
  );
}
