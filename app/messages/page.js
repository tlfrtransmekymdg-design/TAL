"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabaseClient";
import { Lock } from "lucide-react";

export default function MessagesListPage() {
  const supabase = createClient();
  const [conversations, setConversations] = useState([]);
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
    const { data: msgs } = await supabase
      .from("messages")
      .select("*, listings(title, photos)")
      .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
      .order("created_at", { ascending: false });

    const grouped = {};
    for (const m of msgs || []) {
      const other = m.sender_id === user.id ? m.recipient_id : m.sender_id;
      const key = `${m.listing_id}--${other}`;
      if (!grouped[key]) {
        grouped[key] = {
          key,
          listingId: m.listing_id,
          listingTitle: m.listings?.title,
          photo: m.listings?.photos?.[0],
          lastText: m.text,
          lastAt: m.created_at,
        };
      }
    }
    setConversations(Object.values(grouped));
    setLoading(false);
  }

  return (
    <div className="px-4 pt-6 pb-24">
      <h1 className="font-display text-xl text-moss-dark mb-1">Messages</h1>
      <p className="flex items-center gap-1 text-[12px] text-[#8A8477] mb-4">
        <Lock size={11} /> Vos conversations sont privées.
      </p>

      {loading ? (
        <p className="text-sm text-[#B0A996]">Chargement…</p>
      ) : conversations.length === 0 ? (
        <p className="text-sm text-[#B0A996]">Aucune conversation pour l'instant.</p>
      ) : (
        <div className="space-y-2">
          {conversations.map((c) => (
            <Link
              key={c.key}
              href={`/messages/${c.key}`}
              className="flex items-center gap-3 bg-white border border-[#EDE8DB] rounded-2xl p-3"
            >
              <div className="w-12 h-12 rounded-xl bg-[#EFEAE0] overflow-hidden shrink-0">
                {c.photo && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={c.photo} alt="" className="w-full h-full object-cover" />
                )}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-ink truncate">{c.listingTitle}</p>
                <p className="text-[12px] text-[#8A8477] truncate">{c.lastText}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
