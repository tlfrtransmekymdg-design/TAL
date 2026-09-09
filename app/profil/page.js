"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabaseClient";
import ListingCard from "@/components/ListingCard";
import { User, LogOut } from "lucide-react";

export default function ProfilPage() {
  const supabase = createClient();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [mine, setMine] = useState([]);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) {
        router.push("/connexion");
        return;
      }
      setUser(data.user);
      const { data: p } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", data.user.id)
        .single();
      setProfile(p);
      const { data: listings } = await supabase
        .from("listings")
        .select("*")
        .eq("seller_id", data.user.id)
        .order("created_at", { ascending: false });
      setMine(listings || []);
    });
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/connexion");
  }

  if (!user) return null;

  return (
    <div className="px-4 pt-6 pb-24">
      <div className="flex items-center gap-3">
        <div className="w-14 h-14 rounded-full bg-moss/10 flex items-center justify-center text-moss-dark">
          <User size={24} />
        </div>
        <div>
          <p className="font-display text-lg text-ink">{profile?.pseudo || "Mon profil"}</p>
          <p className="text-[12px] text-[#8A8477]">{user.email}</p>
        </div>
      </div>

      <button
        onClick={handleLogout}
        className="mt-4 flex items-center gap-1.5 text-[13px] text-[#8A8477] border border-[#E7E1D2] rounded-full px-3 py-1.5"
      >
        <LogOut size={13} /> Se déconnecter
      </button>

      <h2 className="font-display text-lg text-ink mt-8 mb-3">Mes annonces</h2>
      {mine.length === 0 ? (
        <p className="text-sm text-[#B0A996]">Vous n'avez pas encore publié d'annonce.</p>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {mine.map((l) => (
            <ListingCard key={l.id} listing={l} />
          ))}
        </div>
      )}
    </div>
  );
}
