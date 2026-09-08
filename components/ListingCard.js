"use client";
import Link from "next/link";
import { Star, MapPin } from "lucide-react";

export default function ListingCard({ listing }) {
  const boosted =
    listing.boosted_until && new Date(listing.boosted_until) > new Date();
  const photo = listing.photos?.[0];

  return (
    <Link
      href={`/annonce/${listing.id}`}
      className="block bg-white rounded-2xl overflow-hidden border border-[#EDE8DB] relative"
    >
      <div className="aspect-square bg-[#EFEAE0] relative">
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photo} alt={listing.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[#B9B2A0] text-sm">
            Pas de photo
          </div>
        )}
        {boosted && (
          <span className="absolute top-2 left-2 bg-clay text-white text-[10px] font-medium px-2 py-1 rounded-full flex items-center gap-1">
            <Star size={11} fill="white" /> En avant
          </span>
        )}
      </div>
      <div className="p-3">
        <p className="font-display text-[15px] leading-snug text-ink line-clamp-2">
          {listing.title}
        </p>
        <p className="text-clay font-semibold mt-1">{listing.price} €</p>
        <div className="flex items-center gap-1 text-[11px] text-[#928C7D] mt-1">
          <MapPin size={11} />
          <span>{listing.city}</span>
        </div>
      </div>
    </Link>
  );
}
