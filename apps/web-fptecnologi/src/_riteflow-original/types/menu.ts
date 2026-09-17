// types/menu.ts
export type MenuChild = {
  title: string;
  link: string;
};

export type MenuColumn = {
  heading: string;
  items: MenuChild[];
};

export type MenuItem = {
  title: string;
  link: string;
  type?: "submenu" | "mega";
  items?: MenuChild[];          // for submenu
  columns?: MenuColumn[];      // for mega menu with headings
};
