export interface HeaderProps {
  onMenuToggle: () => void;
  isDrawerOpen: boolean;
}

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface NavigationItem {
  href: string;
  label: string;
}
