"use client";
import React, { useState } from "react";
import clsx from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { menuData } from "@riteflow/data/menuData";
import type { MenuItem } from "@riteflow/types/menu";
import { ChevronDown } from "lucide-react";
type NavigationProps = {
  className?: string;
  compact?: boolean;
  setMobileOpen?: (v: boolean) => void;
};

const Navigation: React.FC<NavigationProps> = ({
  className,
  compact = false,
  setMobileOpen,
}) => {
  const pathname = usePathname();
  const linkClass = compact ? "lg:py-5" : "lg:py-[35px]";

  // ✅ Track open dropdown only on mobile
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    if (typeof window !== "undefined" && window.innerWidth > 1024) return;
    setOpenIndex(openIndex === index ? null : index);
  };

  // ✅ Helper: Check if a link matches current pathname exactly
  const isLinkActive = (link: string): boolean => {
    if (link === "/") return pathname === "/";
    // Only match exact paths - don't match parent paths for child pages
    return pathname === link;
  };

  // ✅ Check if a menu item is active
  const isMenuItemActive = (item: MenuItem): boolean => {
    // For direct links (no children), check if the link matches exactly
    if (item.link && item.link !== "#" && !item.type && isLinkActive(item.link)) {
      return true;
    }
    // For submenu - check if any child item is active
    if (item.type === "submenu" && item.items) {
      return item.items.some(sub => isLinkActive(sub.link));
    }
    // For mega menu - check if any child item in any column is active
    if (item.type === "mega" && item.columns) {
      return item.columns.some(col => col.items.some(inner => isLinkActive(inner.link)));
    }
    return false;
  };

  return (
    <ul
      className={clsx(
        "",
        className
      )}
      data-lenis-prevent
    >
      {menuData.map((item: MenuItem, index: number) => (
        <NavItem
          key={index}
          item={item}
          linkClass={linkClass}
          index={index}
          openIndex={openIndex}
          toggle={toggle}
          setMobileOpen={setMobileOpen}
          isActive={isMenuItemActive(item)}
          isLinkActive={isLinkActive}
        />
      ))}

      {/* Mobile Sign-up */}
      <li className="inline-block lg:hidden !w-auto ">
        <Link href="/sign-up" className="button-primary inline-flex items-center justify-center px-[22px] py-3 text-white font-medium text-sm leading-normal rounded-[10px] relative z-1 overflow-hidden tracking-[0.1px]">
            Buy Template
        </Link>
      </li>
    </ul>
  );
};

export default Navigation;

type NavItemProps = {
  item: MenuItem;
  linkClass: string;
  index: number;
  openIndex: number | null;
  toggle: (i: number) => void;
  setMobileOpen?: (v: boolean) => void;
  isActive: boolean;
  isLinkActive: (link: string) => boolean;
};

function NavItem({
  item,
  linkClass,
  index,
  openIndex,
  toggle,
  setMobileOpen,
  isActive,
  isLinkActive,
}: NavItemProps) {

  const [isDesktop, setIsDesktop] = React.useState(false);
  React.useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth > 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const isOpen = openIndex === index;
  const hasSubmenu = item.type === "submenu";
  const isMega = item.type === "mega";
  const closeMobile = () => setMobileOpen?.(false);
  
  // State to track which column is open in mega menu (for mobile)
  const [openColumnIndex, setOpenColumnIndex] = React.useState<number | null>(null);
  
  const toggleColumn = (colIndex: number) => {
    if (typeof window !== "undefined" && window.innerWidth > 1024) return;
    setOpenColumnIndex(openColumnIndex === colIndex ? null : colIndex);
  };

  
  return (
    <li className={clsx("relative", linkClass, isOpen && "active", isActive && "menu-active")}>
      {/* Parent item */}
      {hasSubmenu || isMega ? (
        <button
          className={clsx(
            "flex items-center justify-between w-full lg:w-auto gap-2 cursor-pointer"
          )}
          onClick={() => toggle(index)}
        >
          <span className={clsx("text-[#fbfbfbcc]", isActive && "!text-primary")}>{item.title}</span>
          <ChevronDown
            size={16}
            className={clsx("transition-transform", isOpen && "rotate-180")}
          />
        </button>
      ) : (
        <Link 
          href={item.link} 
          onClick={closeMobile}
          className={clsx(isActive && "active")}
        >
          {item.title}
        </Link>
      )}

      {/* ✅ Submenu */}
      {hasSubmenu && item.items && (
        <div 
          className={clsx(
            "grid transition-all duration-300 ease-in-out overflow-hidden",
            isDesktop ? "grid-rows-[1fr] opacity-100" : (isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0")
          )}
        >
          {/* Changed mt-4 to conditional: isOpen ? "mt-4" : "mt-0" */}
          <ul className={clsx("sub-menu min-h-0 transition-all duration-300", isOpen ? "mt-4" : "mt-0")}>
            {item.items.map((sub, i) => {
              const subActive = isLinkActive(sub.link);
              return (
                <li key={i} className={clsx(subActive && "active")}>
                  <Link 
                    href={sub.link} 
                    onClick={closeMobile}
                    className={clsx(subActive && "active", "text-[#fbfbfbcc]")}
                  >
                    {sub.title}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* ✅ Mega Menu */}
      {isMega && item.columns && (
        <div 
          className={clsx(
            "grid transition-all duration-300 ease-in-out overflow-hidden",
            isDesktop ? "grid-rows-[1fr] opacity-100" : (isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0")
          )}
        >
          {/* Changed mt-4 to conditional: isOpen ? "mt-4" : "mt-0" */}
          <div className={clsx("mega-menu min-h-0 transition-all duration-300", isOpen ? "mt-5" : "!mt-0")}>
            {item.columns.map((col, colIndex) => {
              const isColumnOpen = openColumnIndex === colIndex;
              return (
                <React.Fragment key={colIndex}>
                  {colIndex > 0 && (
                    <div className="w-[1px] verticle-gradient-bg hidden lg:block"></div>
                  )}
                  <div className={clsx("megamenu-item", isColumnOpen && "active")}>
                    <button 
                      className="flex items-center justify-between gap-3 mb-5 cursor-pointer w-full megamenu-item-toogle text-base lg:text-lg !leading-none tracking-[0.3px] font-medium font-dmSans text-[#fbfbfbcc]"
                      onClick={() => toggleColumn(colIndex)}
                    >
                      {col.heading}
                      <ChevronDown
                        size={16}
                        className={clsx("transition-transform text-white block lg:hidden", isColumnOpen && "rotate-0")}
                      />
                    </button>
                    <div 
                      className={clsx(
                        "grid transition-all duration-300 ease-in-out overflow-hidden",
                        isDesktop ? "grid-rows-[1fr] opacity-100" : (isColumnOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0")
                      )}
                    >

<ul className={clsx("mega-menu-list min-h-0 transition-all duration-300", isColumnOpen ? "pt-4" : "!pt-0")}>
  {col.items.map((inner, idx) => {
    const innerActive = isLinkActive(inner.link);
    return (
      <li key={idx} className={clsx(innerActive && "active", "pb-2 last:pb-0")}>
        <Link 
          href={inner.link} 
          onClick={closeMobile}
          className={clsx(innerActive && "active", "block")}
        >
          {inner.title}
        </Link>
      </li>
    );
  })}
</ul>

                    </div>
                  </div>
                </React.Fragment>
              );
            })}
          </div>
        </div>
      )}
    </li>
  );

}
