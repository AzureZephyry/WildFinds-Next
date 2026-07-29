import type { HeaderProps } from "@/types/layout";

export default function Header({ onMenuToggle, isDrawerOpen }: HeaderProps) {
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

        <div className="site-header__subtitle">
          <p className="site-note">
            Search for lost items, browse found items, and help return belongings to their owners.
          </p>
        </div>
      </div>
    </header>
  );
}
