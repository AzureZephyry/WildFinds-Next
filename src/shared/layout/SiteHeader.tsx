"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { HeaderProps } from "@/shared/layout/layoutModels";
import { useAuth } from "@/core/authentication/components/AuthenticationProvider";

export default function SiteHeader({ onMenuToggle, isDrawerOpen }: HeaderProps) {
  const router = useRouter();
  const { session, isLoading, signOut } = useAuth();
  const [logoutError, setLogoutError] = useState<string | null>(null);
  const userEmail = session?.user?.email ?? null;

  const handleLogout = async () => {
    setLogoutError(null);

    const { error } = await signOut();

    if (error) {
      console.error("[WildFinds] Logout failed", error);
      setLogoutError(error.message || "Unable to log out. Please try again.");
      return;
    }

    router.replace("/");
    router.refresh();
  };

  return (
    <header className="site-header">
      <div className="site-header__content">
        <div className="site-header__top">
          <button
            id="menuToggle"
            className="menu-toggle"
            aria-label="Open navigation menu"
            aria-controls="drawer"
            aria-expanded={isDrawerOpen}
            type="button"
            onClick={onMenuToggle}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>

          <div className="site-header__brand">
            <p className="eyebrow">WildFinds</p>
            <h1>Lost &amp; Found for CIT-U</h1>
          </div>
        </div>

        <div className="site-header__actions">
          {isLoading ? null : userEmail ? (
            <div className="header-user">
              <span className="header-user__email">{userEmail}</span>
              <button type="button" className="header-link" onClick={handleLogout}>
                Logout
              </button>
            </div>
          ) : (
            <div className="header-auth-links">
              <Link href="/login" className="header-link">
                Login
              </Link>
              <Link href="/signup" className="header-link header-link--primary">
                Sign Up
              </Link>
            </div>
          )}
          {logoutError ? <p className="validation-message">{logoutError}</p> : null}
        </div>

        <div className="site-header__subtitle">
          <p className="site-note">
            Search for lost items, browse found items, and help return belongings to their owners.
          </p>
        </div>
      </div>
    </header>
  );
}
