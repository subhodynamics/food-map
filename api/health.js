export async function checkHealth({ supabaseUrl, supabaseKey } = {}) {
  const timestamp = new Date().toISOString();
  const url = supabaseUrl?.trim();
  const key = supabaseKey?.trim();

  if (!url || !key) {
    return {
      statusCode: 200,
      payload: {
        status: "ok",
        service: "onspot",
        database: "not_configured",
        timestamp
      }
    };
  }

  try {
    const response = await fetch(
      `${url.replace(/\/$/, "")}/rest/v1/outlets?select=id&status=eq.approved&limit=1`,
      {
        method: "GET",
        headers: {
          apikey: key,
          Authorization: `Bearer ${key}`
        },
        signal: AbortSignal.timeout(5000)
      }
    );

    if (!response.ok) {
      return {
        statusCode: 503,
        payload: {
          status: "degraded",
          service: "onspot",
          database: `error_${response.status}`,
          timestamp
        }
      };
    }

    return {
      statusCode: 200,
      payload: {
        status: "ok",
        service: "onspot",
        database: "connected",
        timestamp
      }
    };
  } catch (error) {
    return {
      statusCode: 503,
      payload: {
        status: "degraded",
        service: "onspot",
        database: error?.name === "TimeoutError" ? "timeout" : "unreachable",
        timestamp
      }
    };
  }
}

export default async function handler(req, res) {
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.setHeader("Allow", "GET, HEAD");
    res.status(405).json({ status: "error", message: "Method not allowed" });
    return;
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey =
    process.env.VITE_SUPABASE_ANON_KEY ||
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

  const { statusCode, payload } = await checkHealth({ supabaseUrl, supabaseKey });

  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store, max-age=0");

  if (req.method === "HEAD") {
    res.status(statusCode).end();
    return;
  }

  res.status(statusCode).json(payload);
}
