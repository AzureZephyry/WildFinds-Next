"use client";

import { useEffect, useState } from "react";
import Drawer from "@/components/Drawer";
import Header from "@/components/Header";

export default function LayoutClient({ children }: { children: React.ReactNode }) {
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
      <Header onMenuToggle={toggleDrawer} isDrawerOpen={isDrawerOpen} />
      <Drawer isOpen={isDrawerOpen} onClose={closeDrawer} />
      <main className="page-layout">{children}</main>
    </div>
  );
}
