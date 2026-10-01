import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PATCH, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const VALID_TABLES = ["Profesionales", "Cursos", "Anuncios", "PlanesPublicidad"];

async function getAirtableConfig() {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const { data, error } = await supabase
    .from("app_secrets")
    .select("key, value")
    .in("key", ["airtable_token", "airtable_base_id"]);

  if (error) throw new Error(`Failed to read secrets: ${error.message}`);

  const token = data.find((r: any) => r.key === "airtable_token")?.value;
  const baseId = data.find((r: any) => r.key === "airtable_base_id")?.value;

  if (!token) throw new Error("Airtable token not configured");
  if (!baseId) throw new Error("Airtable base ID not configured");

  return { token, baseId };
}

function jsonResp(body: any, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function extractPhotoUrl(field: any): string {
  if (!field) return "";
  if (Array.isArray(field) && field.length > 0) return field[0]?.url ?? "";
  if (typeof field === "string") return field;
  if (typeof field === "object" && field.url) return field.url;
  return "";
}

// Remove null/undefined values from a fields object before sending to Airtable
function sanitizeFields(fields: Record<string, any>): Record<string, any> {
  const clean: Record<string, any> = {};
  for (const [key, value] of Object.entries(fields)) {
    if (value === null || value === undefined) continue;
    clean[key] = value;
  }
  return clean;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { token, baseId } = await getAirtableConfig();
    const url = new URL(req.url);
    const pathParts = url.pathname.split("/").filter(Boolean);
    const table = pathParts[1] ?? "Profesionales";
    const recordId = pathParts[2] ?? null;

    if (!VALID_TABLES.includes(table)) {
      return jsonResp({ error: `Invalid table: ${table}` }, 400);
    }

    const airtableUrl = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(table)}`;
    const authHeaders = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    // GET
    if (req.method === "GET") {
      const estado = url.searchParams.get("estado");
      let fetchUrl = airtableUrl;
      if (estado) {
        fetchUrl += `?filterByFormula=${encodeURIComponent(`{Estado} = '${estado}'`)}`;
      }

      const resp = await fetch(fetchUrl, { headers: authHeaders });
      if (!resp.ok) {
        const errText = await resp.text();
        return jsonResp({ error: `Airtable error: ${resp.status}`, detail: errText }, resp.status);
      }
      const data = await resp.json();
      let records: any[] = data.records || [];

      if (table === "Profesionales") {
        records = records.map((r: any) => {
          const f = r.fields || {};
          return {
            id: r.id,
            name: f["Nombre"] ?? "",
            profession: f["Profesion"] ?? f["Profesión"] ?? "",
            category: f["Categoria"] ?? f["Categoría"] ?? "hogar",
            neighborhood: f["Barrio"] ?? "",
            rating: typeof f["Rating"] === "number" ? f["Rating"] : 0,
            reviews: typeof f["Reviews"] === "number" ? f["Reviews"] : 0,
            schedule: f["Horarios"] ?? "",
            whatsapp: String(f["WhatsApp"] ?? "").replace(/[^0-9]/g, ""),
            photo: extractPhotoUrl(f["Foto"]),
            description: f["Descripcion"] ?? f["Descripción"] ?? "",
            verificado: Boolean(f["Verificado"] ?? false),
          };
        });
      } else if (table === "Cursos") {
        records = records.map((r: any) => {
          const f = r.fields || {};
          return {
            id: r.id,
            nombreCurso: f["NombreCurso"] ?? "",
            instructor: f["Instructor"] ?? "",
            whatsapp: String(f["Whatsapp"] ?? "").replace(/[^0-9]/g, ""),
            email: f["Email"] ?? "",
            descripcion: f["Descripcion"] ?? "",
            duracionHoras: f["DuracionHoras"] ?? "",
            precioARS: f["PrecioARS"] ?? 0,
            clicksContacto: f["ClicksContacto"] ?? 0,
          };
        });
      } else if (table === "Anuncios") {
        records = records.map((r: any) => {
          const f = r.fields || {};
          return {
            id: r.id,
            titulo: f["Titulo"] ?? f["Título"] ?? "",
            descripcion: f["Descripcion"] ?? "",
            imagenUrl: extractPhotoUrl(f["Imagen"]),
            link: f["Link"] ?? "",
            linkVideo: f["LinkVideo"] ?? "",
            clicksContacto: f["ClicksContacto"] ?? 0,
          };
        });
      } else if (table === "PlanesPublicidad") {
        records = records.map((r: any) => {
          const f = r.fields || {};
          return {
            id: r.id,
            nombre: f["Nombre"] ?? "",
            precioARS: f["PrecioARS"] ?? 0,
            descripcion: f["Descripcion"] ?? "",
            duracionDias: f["DuracionDias"] ?? 0,
          };
        });
      }

      return jsonResp({ records });
    }

    // POST
    if (req.method === "POST") {
      const body = await req.json();
      const fields: Record<string, any> = {};

      if (table === "Profesionales") {
        fields["Nombre"] = String(body.name ?? "");
        fields["Profesion"] = String(body.profession ?? "");
        fields["Barrio"] = String(body.neighborhood ?? "");
        fields["Horarios"] = String(body.schedule ?? "");
        fields["WhatsApp"] = String(body.whatsapp ?? "");
        fields["Estado"] = "Pendiente";
        if (body.description) fields["Descripcion"] = String(body.description);

        // Images sent as base64 data URL strings directly to Airtable
        if (body.foto) fields["Foto"] = String(body.foto);
        if (body.dniFrente) fields["DniFrente"] = String(body.dniFrente);
        if (body.dniDorso) fields["DniDorso"] = String(body.dniDorso);
        if (body.numeroMatricula) fields["NumeroMatricula"] = String(body.numeroMatricula);
        if (body.fotoMatricula) fields["FotoMatricula"] = String(body.fotoMatricula);
      } else if (table === "Cursos") {
        fields["Instructor"] = String(body.instructor ?? "");
        fields["Whatsapp"] = String(body.whatsapp ?? "");
        fields["Email"] = String(body.email ?? "");
        fields["NombreCurso"] = String(body.nombreCurso ?? "");
        fields["Descripcion"] = String(body.descripcion ?? "");
        fields["DuracionHoras"] = String(body.duracionHoras ?? "");
        fields["PrecioARS"] = Number(body.precioARS ?? 0);
        fields["Estado"] = "Pendiente";
      } else if (table === "Anuncios") {
        fields["Titulo"] = String(body.titulo ?? "");
        fields["Descripcion"] = String(body.descripcion ?? "");
        fields["Link"] = String(body.link ?? "");
        // Plan sent as plain string (plan name), not as array or object
        if (body.planNombre) fields["Plan"] = String(body.planNombre);
        // Image sent as base64 data URL string directly
        if (body.imagenUrl) fields["Imagen"] = String(body.imagenUrl);
        if (body.linkVideo) fields["LinkVideo"] = String(body.linkVideo);
        fields["Estado"] = "Pendiente";
      }

      const cleanFields = sanitizeFields(fields);

      const resp = await fetch(airtableUrl, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({ records: [{ fields: cleanFields }] }),
      });

      if (!resp.ok) {
        const errText = await resp.text();
        return jsonResp({ error: `Airtable error: ${resp.status}`, detail: errText }, resp.status);
      }
      const data = await resp.json();
      return jsonResp({ success: true, record: data.records?.[0] });
    }

    // PATCH
    if (req.method === "PATCH") {
      if (!recordId) return jsonResp({ error: "Record ID required for PATCH" }, 400);

      const body = await req.json();
      const fields: Record<string, any> = {};

      if (body.incrementClicks) {
        const getResp = await fetch(`${airtableUrl}/${recordId}`, { headers: authHeaders });
        if (!getResp.ok) {
          const errText = await getResp.text();
          return jsonResp({ error: `Airtable fetch error: ${getResp.status}`, detail: errText }, getResp.status);
        }
        const existing = await getResp.json();
        const current = (existing.fields?.["ClicksContacto"] ?? 0);
        fields["ClicksContacto"] = Number(current) + 1;
      }

      if (body.fields) Object.assign(fields, body.fields);

      const cleanFields = sanitizeFields(fields);

      const patchResp = await fetch(`${airtableUrl}/${recordId}`, {
        method: "PATCH",
        headers: authHeaders,
        body: JSON.stringify({ fields: cleanFields }),
      });

      if (!patchResp.ok) {
        const errText = await patchResp.text();
        return jsonResp({ error: `Airtable error: ${patchResp.status}`, detail: errText }, patchResp.status);
      }
      const data = await patchResp.json();
      return jsonResp({ success: true, record: data });
    }

    return jsonResp({ error: "Method not allowed" }, 405);
  } catch (err) {
    return jsonResp({ error: err.message }, 500);
  }
});
