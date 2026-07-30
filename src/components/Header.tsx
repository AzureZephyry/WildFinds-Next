"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { HeaderProps } from "@/types/layout";
import { supabase } from "@/lib/supabase/client";

export default function Header({ onMenuToggle, isDrawerOpen }: HeaderProps) {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const client = supabase;

    if (!client) {
      setIsLoading(false);
      return;
    }

    let active = true;

    const syncSession = async () => {
      const {
        data: { session },
      } = await client.auth.getSession();

      if (!active) {
        return;
      }

      setUserEmail(session?.user?.email ?? null);
      setIsLoading(false);
    };

    void syncSession();

    const { data: authListener } = client.auth.onAuthStateChange((_event, session) => {
      if (!active) {
        return;
      }

      setUserEmail(session?.user?.email ?? null);
      setIsLoading(false);
    });

    return () => {
      active = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    if (!supabase) {
      return;
    }

    await supabase.auth.signOut();
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
