// data/menuData.ts
import type { MenuItem } from "@riteflow/types/menu";

export const menuData: MenuItem[] = [
  {
    title: "Home",
    link: "#",
    type: "submenu",
    items: [
      { title: "Home v1", link: "/home-v1" },
      { title: "Home v2", link: "/home-v2" },
    ],
  },
  {
    title: "About",
    link: "/about",
  },
  {
    title: "Features",
    link: "/features",
  },
  {
    title: "Pricing",
    link: "/pricing",
  },
  {
    title: "All Pages",
    link: "#",
    type: "mega",
    columns: [
      {
        heading: "Company",
        items: [
          { title: "Contact", link: "/contact" },
          { title: "Get a Demo", link: "/get-demo" },
          { title: "Join Wishlist", link: "/join-wishlist" },
          { title: "Use Cases", link: "/use-cases" },
          { title: "Use Case Details", link: "/use-cases/financial-forecasting" },
        ],
      },
      {
        heading: "Resources",
        items: [
          { title: "Blog", link: "/blog" },
          { title: "Blog Details", link: "/blog/how-ai-is-transforming" },
          { title: "Integration", link: "/integration" },
          { title: "Integration Details", link: "/integration/taskpilot" },
          { title: "Integration Category", link: "/integration-category" },
        ],
      },
      {
        heading: "Legal",
        items: [
          { title: "Ai Policy", link: "/ai-policy" },
          { title: "Error", link: "/error" },
          { title: "Password Protected", link: "/password-protected" },
          { title: "Security & Privacy", link: "/security-and-privacy" }
        ],
      },
    ],
  },
];
