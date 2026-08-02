import Link from "next/link";
import { useAuth } from "@/core/authentication/components/AuthenticationProvider";
import type { DrawerProps } from "@/shared/layout/layoutModels";

const navigationItems = [
  { href: "/", label: "Home" },
  { href: "/history", label: "History" },
  { href: "/about#about", label: "About WildFinds" },
  { href: "/about#how-it-works", label: "How It Works" },
  { href: "/about#team", label: "Developers / Team" },
];

export default function NavigationDrawer({ isOpen, onClose }: DrawerProps) {
  const { session, isLoading } = useAuth();

  return (
    <>
      <div
        id="drawerBackdrop"
        className="drawer-backdrop"
        data-close-menu
        style={{ display: isOpen ? "block" : "none" }}
        onClick={onClose}
      />
      <nav id="drawer" className={`drawer${isOpen ? " open" : ""}`} aria-hidden={!isOpen}>
        <div className="drawer-card">
          <div className="drawer-header">
            <p className="drawer-title">Navigation</p>
            <button
              id="drawerClose"
              className="drawer-close"
              type="button"
              aria-label="Close navigation menu"
              onClick={onClose}
            >
              ×
            </button>
          </div>
          <ul className="drawer-list">
            {!isLoading && session ? (
              <li>
                <Link href="/my-reports" onClick={onClose}>
                  My Reports
                </Link>
              </li>
            ) : null}
            {navigationItems.map((item) => (
              <li key={item.href}>
                <Link href={item.href} onClick={onClose}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </>
  );
}
