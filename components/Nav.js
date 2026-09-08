"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, PlusCircle, MessageCircle, Heart, User } from "lucide-react";

const ITEMS = [
  { href: "/", label: "Fil", icon: Home },
  { href: "/favoris", label: "Favoris", icon: Heart },
  { href: "/vendre", label: "Vendre", icon: PlusCircle, accent: true },
  { href: "/messages", label: "Messages", icon: MessageCircle },
  { href: "/profil", label: "Profil", icon: User },
];

export default function Nav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-[#E7E1D2] flex items-stretch z-40">
      {ITEMS.map(({ href, label, icon: Icon, accent }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className="flex-1 flex flex-col items-center justify-center gap-1 py-2.5 text-[11px]"
          >
            <span
              className={`rounded-full p-1.5 ${
                accent
                  ? "bg-clay text-white"
                  : active
                  ? "bg-moss/10 text-moss-dark"
                  : "text-[#8A8477]"
              }`}
            >
              <Icon size={accent ? 20 : 18} strokeWidth={active ? 2.4 : 2} />
            </span>
            <span className={active ? "text-moss-dark font-medium" : "text-[#8A8477]"}>
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
