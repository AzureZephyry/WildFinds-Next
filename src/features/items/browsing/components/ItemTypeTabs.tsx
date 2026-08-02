interface ItemTypeTabsProps {
  activeTab: "lost" | "found";
  onTabChange: (tab: "lost" | "found") => void;
}

export default function ItemTypeTabs({ activeTab, onTabChange }: ItemTypeTabsProps) {
  return (
    <div className="tab-controls" role="tablist" aria-label="Lost and found categories">
      <button
        className={`tab-button ${activeTab === "lost" ? "active" : ""}`}
        type="button"
        role="tab"
        aria-selected={activeTab === "lost"}
        onClick={() => onTabChange("lost")}
      >
        Lost Items
      </button>
      <button
        className={`tab-button ${activeTab === "found" ? "active" : ""}`}
        type="button"
        role="tab"
        aria-selected={activeTab === "found"}
        onClick={() => onTabChange("found")}
      >
        Found Items
      </button>
    </div>
  );
}
