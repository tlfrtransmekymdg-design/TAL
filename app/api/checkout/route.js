import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/lib/supabaseServer";
import { BOOST_PRICE_CENTS } from "@/lib/categories";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(req) {
  const { listingId } = await req.json();
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Non connecté." }, { status: 401 });
  }

  const { data: listing } = await supabase
    .from("listings")
    .select("*")
    .eq("id", listingId)
    .single();

  if (!listing || listing.seller_id !== user.id) {
    return NextResponse.json({ error: "Annonce introuvable." }, { status: 404 });
  }

  const origin = req.headers.get("origin");

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "eur",
          unit_amount: BOOST_PRICE_CENTS,
          product_data: {
            name: `Mise en avant — ${listing.title}`,
          },
        },
        quantity: 1,
      },
    ],
    metadata: {
      listing_id: listingId,
      user_id: user.id,
    },
    success_url: `${origin}/annonce/${listingId}?boost=success`,
    cancel_url: `${origin}/annonce/${listingId}?boost=cancelled`,
  });

  return NextResponse.json({ url: session.url });
}
