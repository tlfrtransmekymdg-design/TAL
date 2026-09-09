"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabaseClient";
import ListingCard from "@/components/ListingCard";

export default function FavorisPage() {
  const supabase = createClient();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }
    const { data: favs } = await supabase
      .from("favorites")
      .select("listing_id")
      .eq("user_id", user.id);
    const ids = (favs || []).map((f) => f.listing_id);
    if (ids.length) {
      const { data } = await supabase.from("listings").select("*").in("id", ids);
      setListings(data || []);
    }
    setLoading(false);
  }

  return (
    <div className="px-4 pt-6 pb-24">
      <h1 className="font-display text-xl text-moss-dark mb-4">Mes favoris</h1>
      {loading ? (
        <p className="text-sm text-[#B0A996]">Chargement…</p>
      ) : listings.length === 0 ? (
        <p className="text-sm text-[#B0A996]">
          Ajoutez des annonces en favoris pour les retrouver ici.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {listings.map((l) => (
            <ListingCard key={l.id} listing={l} />
          ))}
        </div>
      )}
    </div>
  );
}
