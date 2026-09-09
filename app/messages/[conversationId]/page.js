"use client";
import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabaseClient";
import { ArrowLeft, Lock, Send } from "lucide-react";

export default function ThreadPage() {
  const { conversationId } = useParams();
  const [listingId, otherId] = conversationId.split("--");
  const router = useRouter();
  const supabase = createClient();

  const [user, setUser] = useState(null);
  const [listing, setListing] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.push("/connexion");
        return;
      }
      setUser(data.user);
      load(data.user.id);
    });
  }, []);

  async function load(userId) {
    const { data: l } = await supabase.from("listings").select("*").eq("id", listingId).single();
    setListing(l);

    const { data: msgs } = await supabase
      .from("messages")
      .select("*")
      .eq("listing_id", listingId)
      .or(
        `and(sender_id.eq.${userId},recipient_id.eq.${otherId}),and(sender_id.eq.${otherId},recipient_id.eq.${userId})`
      )
      .order("created_at", { ascending: true });
    setMessages(msgs || []);
    setTimeout(() => bottomRef.current?.scrollIntoView(), 50);
  }

  async function handleSend(e) {
    e.preventDefault();
    if (!text.trim()) return;
    const { error } = await supabase.from("messages").insert({
      listing_id: listingId,
      sender_id: user.id,
      recipient_id: otherId,
      text: text.trim(),
    });
    if (!error) {
      setText("");
      load(user.id);
    }
  }

  if (!user) return null;

  return (
    <div className="flex flex-col h-screen pb-16">
      <header className="flex items-center gap-3 px-4 py-3 border-b border-[#EDE8DB]">
        <button onClick={() => router.push("/messages")}>
          <ArrowLeft size={18} />
        </button>
        <div className="min-w-0">
          <p className="text-sm font-medium text-ink truncate">{listing?.title}</p>
          <p className="flex items-center gap-1 text-[11px] text-[#8A8477]">
            <Lock size={10} /> Conversation privée, visible uniquement par vous deux.
          </p>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
        {messages.map((m) => {
          const mine = m.sender_id === user.id;
          return (
            <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${
                  mine ? "bg-moss-dark text-white" : "bg-white border border-[#EDE8DB] text-ink"
                }`}
              >
                {m.text}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend} className="flex items-center gap-2 px-4 py-3 border-t border-[#EDE8DB]">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Écrire un message…"
          className="flex-1 bg-[#F5F2EA] rounded-full px-4 py-2.5 text-sm outline-none"
        />
        <button type="submit" className="bg-moss-dark text-white rounded-full p-2.5">
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}
