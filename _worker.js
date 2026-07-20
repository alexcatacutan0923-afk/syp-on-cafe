const GAS_URL = "https://script.google.com/macros/s/AKfycbw8-313J5vT0eanrWTt52lGuzOO_AXs4jZxjuXz8Z5ic7gZS_vnZaUl7HxJQBYgpIs/exec";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname.startsWith('/api/v3')) {
      try {
        const payload = request.method === 'POST' ? await request.json() : Object.fromEntries(url.searchParams);
        const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
        const upstreamUrl = `${GAS_URL}?action=v3api&payload=${encodeURIComponent(encoded)}&_=${Date.now()}`;
        const upstream = await fetch(upstreamUrl, { redirect: 'follow' });
        const text = await upstream.text();
        let data;
        try { data = JSON.parse(text); }
        catch (_) { return json({success:false,message:'Apps Script returned HTML instead of JSON. Add the V3 doGet route and redeploy.'},502); }
        return json(data, upstream.ok ? 200 : 502);
      } catch (error) {
        return json({success:false,message:'V3 service unavailable: '+(error?.message||'unknown error')},502);
      }
    }
    return env.ASSETS.fetch(request);
  }
};
function json(data,status=200){return new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json;charset=UTF-8','cache-control':'no-store','x-content-type-options':'nosniff'}})}
