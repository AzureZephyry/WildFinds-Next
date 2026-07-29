import Link from "next/link";
import type { DrawerProps } from "@/types/layout";

const navigationItems = [
  { href: "/", label: "Home" },
  { href: "/about#about", label: "About WildFinds" },
  { href: "/about#how-it-works", label: "How It Works" },
  { href: "/about#team", label: "Developers / Team" },
];

export default function Drawer({ isOpen, onClose }: DrawerProps) {
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
