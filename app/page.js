"use client";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabaseClient";
import CategoryChips from "@/components/CategoryChips";
import ListingCard from "@/components/ListingCard";
import { Search, Leaf } from "lucide-react";

export default function FeedPage() {
  const supabase = createClient();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    let ignore = false;
    async function load() {
      setLoading(true);
      const { data } = await supabase
        .from("listings")
        .select("*")
        .eq("status", "active")
        .order("created_at", { ascending: false });
      if (!ignore) {
        setListings(data || []);
        setLoading(false);
      }
    }
    load();
    return () => {
      ignore = true;
    };
  }, []);

  const filtered = useMemo(() => {
    let list = listings;
    if (category) list = list.filter((l) => l.category === category);
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter((l) => l.title.toLowerCase().includes(q));
    }
    // Annonces boostées en premier (dans la limite de leur catégorie), triées par date de boost
    const now = new Date();
    return [...list].sort((a, b) => {
      const aBoost = a.boosted_until && new Date(a.boosted_until) > now;
      const bBoost = b.boosted_until && new Date(b.boosted_until) > now;
      if (aBoost && bBoost) return new Date(b.boosted_at) - new Date(a.boosted_at);
      if (aBoost) return -1;
      if (bBoost) return 1;
      return 0;
    });
  }, [listings, category, query]);

  return (
    <div>
      <header className="px-4 pt-6 pb-2">
        <div className="flex items-center gap-2">
          <Leaf className="text-moss-dark" size={22} />
          <h1 className="font-display text-2xl text-moss-dark">Béb Eco</h1>
        </div>
        <p className="text-[13px] text-[#8A8477] mt-1">
          Articles d'occasion pour bébé entre particuliers. Les annonces sont
          visibles par tous. Vos messages restent privés, seuls vous et votre
          interlocuteur peuvent les lire.
        </p>
        <div className="mt-3 relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#B0A996]"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher une annonce..."
            className="w-full bg-white border border-[#E7E1D2] rounded-full py-2.5 pl-9 pr-4 text-sm outline-none focus:border-moss"
          />
        </div>
      </header>

      <CategoryChips active={category} onChange={setCategory} />

      <main className="px-4 py-3">
        {loading ? (
          <p className="text-center text-sm text-[#B0A996] py-10">Chargement…</p>
        ) : filtered.length === 0 ? (
          <p className="text-center text-sm text-[#B0A996] py-10">
            Aucune annonce ici pour l'instant.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filtered.map((l) => (
              <ListingCard key={l.id} listing={l} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
