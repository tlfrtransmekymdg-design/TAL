import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createServiceClient } from "@/lib/supabaseServer";
import { BOOST_DAYS } from "@/lib/categories";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Stripe a besoin du corps brut (non parsé) pour vérifier la signature.
export const config = { api: { bodyParser: false } };

export async function POST(req) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return NextResponse.json({ error: `Webhook invalide: ${err.message}` }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const listingId = session.metadata?.listing_id;

    if (listingId) {
      const supabase = createServiceClient();
      const now = new Date();
      const until = new Date(now.getTime() + BOOST_DAYS * 24 * 60 * 60 * 1000);

      await supabase
        .from("listings")
        .update({
          boosted_at: now.toISOString(),
          boosted_until: until.toISOString(),
        })
        .eq("id", listingId);
    }
  }

  return NextResponse.json({ received: true });
}
