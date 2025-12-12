// /app/api/skool-webhook/route.ts
export async function POST(req: Request) {
    try {
      // Get the raw text first
      const text = await req.text();
      
      // Parse URL-encoded data
      const params = new URLSearchParams(text);
      const data: any = {};
      
      // Convert to object
      params.forEach((value, key) => {
        data[key] = value;
      });
      
      console.log("🔥 Webhook from Zapier/Skool:", data);
      
      // Process your data here
      // save to DB, send email, etc.
      
      return new Response(JSON.stringify({ success: true }), { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
      
    } catch (error) {
      console.error("Webhook error:", error);
      return new Response(JSON.stringify({ success: false, error: String(error) }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }