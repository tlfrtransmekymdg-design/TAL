"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabaseClient";
import { CATEGORIES, BOOST_PRICE_CENTS, BOOST_SLOTS_PER_CATEGORY } from "@/lib/categories";
import { ArrowLeft, MapPin, Star, Pencil, Trash2, Heart } from "lucide-react";

export default function DetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const [listing, setListing] = useState(null);
  const [user, setUser] = useState(null);
  const [photoIdx, setPhotoIdx] = useState(0);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [slotsLeft, setSlotsLeft] = useState(null);
  const [boostLoading, setBoostLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, []);

  useEffect(() => {
    load();
    // Si on revient de Stripe Checkout avec succès, on notifie
    if (searchParams.get("boost") === "success") {
      // le webhook met à jour la base ; on recharge après un court délai
      setTimeout(load, 1500);
    }
  }, [id]);

  async function load() {
    const { data } = await supabase.from("listings").select("*").eq("id", id).single();
    setListing(data);
    if (data) {
      const { count } = await supabase
        .from("listings")
        .select("id", { count: "exact", head: true })
        .eq("category", data.category)
        .gt("boosted_until", new Date().toISOString());
      setSlotsLeft(Math.max(0, BOOST_SLOTS_PER_CATEGORY - (count || 0)));
    }
  }

  async function handleDelete() {
    await supabase.from("listings").delete().eq("id", id);
    router.push("/profil");
  }

  async function handleContact() {
    if (!user) {
      router.push("/connexion");
      return;
    }
    const { data: existing } = await supabase
      .from("messages")
      .select("id")
      .eq("listing_id", id)
      .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
      .limit(1);
    router.push(`/messages/${id}--${listing.seller_id}`);
  }

  async function handleBoost() {
    setBoostLoading(true);
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ listingId: id }),
    });
    const { url, error } = await res.json();
    if (url) window.location.href = url;
    else {
      alert(error || "Impossible de lancer le paiement.");
      setBoostLoading(false);
    }
  }

  if (!listing) {
    return <p className="text-center text-sm text-[#B0A996] py-20">Chargement…</p>;
  }

  const cat = CATEGORIES.find((c) => c.id === listing.category);
  const isMine = user && user.id === listing.seller_id;
  const boosted = listing.boosted_until && new Date(listing.boosted_until) > new Date();
  const photos = listing.photos?.length ? listing.photos : [];

  return (
    <div className="pb-24">
      <div className="relative aspect-square bg-[#EFEAE0]">
        {photos.length > 0 ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photos[photoIdx]} alt={listing.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[#B9B2A0]">
            Pas de photo
          </div>
        )}
        <button
          onClick={() => router.back()}
          className="absolute top-4 left-4 bg-white/90 rounded-full p-2"
        >
          <ArrowLeft size={18} />
        </button>
        {boosted && (
          <span className="absolute top-4 right-4 bg-clay text-white text-[11px] font-medium px-2.5 py-1 rounded-full flex items-center gap-1">
            <Star size={12} fill="white" /> Annonce mise en avant
          </span>
        )}
        {photos.length > 1 && (
          <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
            {photos.map((_, i) => (
              <button
                key={i}
                onClick={() => setPhotoIdx(i)}
                className={`w-1.5 h-1.5 rounded-full ${i === photoIdx ? "bg-white" : "bg-white/50"}`}
              />
            ))}
          </div>
        )}
      </div>

      <div className="px-4 pt-4">
        <span className="text-[11px] text-moss-dark bg-moss/10 px-2 py-1 rounded-full">
          {cat?.label}
        </span>
        <h1 className="font-display text-xl mt-2 text-ink">{listing.title}</h1>
        <p className="text-clay font-semibold text-lg mt-1">{listing.price} €</p>
        <div className="flex items-center gap-1 text-[13px] text-[#8A8477] mt-1">
          <MapPin size={13} />
          {listing.city} · {listing.condition}
        </div>

        <p className="text-sm text-ink mt-4 leading-relaxed">{listing.description}</p>
        <p className="text-[12px] text-[#8A8477] mt-4">Vendu par {listing.seller_pseudo || "un membre Béb Eco"}</p>

        {isMine ? (
          <div className="mt-6 space-y-2">
            {!boosted && (
              <div className="bg-white border border-[#E7E1D2] rounded-2xl p-4">
                <p className="text-sm font-medium text-ink">
                  Mettre en avant — {(BOOST_PRICE_CENTS / 100).toFixed(2)} €
                </p>
                <p className="text-[12px] text-[#8A8477] mt-1">
                  Votre annonce apparaît parmi les 2 à 100 premières de sa catégorie pendant 7 jours.
                </p>
                {slotsLeft === 0 ? (
                  <p className="text-[12px] text-clay mt-2">
                    Toutes les places sont prises pour cette catégorie actuellement.
                  </p>
                ) : (
                  <button
                    onClick={handleBoost}
                    disabled={boostLoading}
                    className="mt-3 w-full bg-clay text-white rounded-full py-2.5 text-sm font-medium disabled:opacity-60"
                  >
                    {boostLoading ? "Redirection…" : "Mettre en avant"}
                  </button>
                )}
              </div>
            )}
            {boosted && (
              <div className="bg-moss/10 border border-moss/20 rounded-2xl p-4 text-sm text-moss-dark">
                En avant jusqu'au{" "}
                {new Date(listing.boosted_until).toLocaleDateString("fr-FR")}
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={() =>
