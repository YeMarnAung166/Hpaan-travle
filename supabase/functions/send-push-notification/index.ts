import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import webPush from "https://esm.sh/web-push@3";

const VAPID_PRIVATE_KEY = Deno.env.get("VAPID_PRIVATE_KEY");
const VAPID_PUBLIC_KEY = Deno.env.get("VITE_VAPID_PUBLIC_KEY");
const VAPID_SUBJECT = "mailto:yemarnaung166@gmail.com";

if (!VAPID_PRIVATE_KEY || !VAPID_PUBLIC_KEY) {
  console.error("Missing VAPID keys - set VAPID_PRIVATE_KEY and VITE_VAPID_PUBLIC_KEY secrets");
}

webPush.setVapidDetails(
  VAPID_SUBJECT,
  VAPID_PUBLIC_KEY!,
  VAPID_PRIVATE_KEY!,
);

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return new Response("Unauthorized", { status: 401 });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  const { title, message, url } = body;
  if (!title || !message) {
    return new Response("Missing required fields: title, message", { status: 400 });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const { data: subscriptions, error } = await supabase
    .from("push_subscriptions")
    .select("*");

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!subscriptions || subscriptions.length === 0) {
    return new Response(JSON.stringify({ sent: 0, failed: 0, total: 0 }), {
      headers: { "Content-Type": "application/json" },
    });
  }

  const payload = JSON.stringify({
    title,
    body: message,
    icon: "/pwa-192x192.png",
    badge: "/pwa-192x192.png",
    url: url || "/",
  });

  const results = await Promise.allSettled(
    subscriptions.map((sub) =>
      webPush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: { p256dh: sub.p256dh, auth: sub.auth },
        },
        payload,
      ),
    ),
  );

  const sent = results.filter((r) => r.status === "fulfilled").length;
  const failed = results.filter((r) => r.status === "rejected").length;

  return new Response(
    JSON.stringify({ sent, failed, total: subscriptions.length }),
    { headers: { "Content-Type": "application/json" } },
  );
});
