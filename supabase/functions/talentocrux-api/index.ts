import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PATCH, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

function jsonResp(body: any, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function genCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const url = new URL(req.url);
    const pathParts = url.pathname.split("/").filter(Boolean);
    // pathParts[0] = "talentocrux-api", pathParts[1] = action
    const action = pathParts[1] ?? "";

    // ── Register professional ──
    if (action === "register-professional" && req.method === "POST") {
      const body = await req.json();

      // Upload images to storage
      const profId = crypto.randomUUID();
      const uploads: Record<string, string> = {};

      const uploadImage = async (base64: string | null | undefined, bucket: string, folder: string, name: string): Promise<string> => {
        if (!base64) return "";
        try {
          const parts = base64.split(",");
          const mime = parts[0]?.match(/data:(.*?);/)?.[1] ?? "image/jpeg";
          const ext = mime === "image/png" ? "png" : "jpg";
          const buffer = Uint8Array.from(atob(parts[1]), (c) => c.charCodeAt(0));
          const path = `${folder}/${profId}-${name}.${ext}`;
          const { error } = await supabase.storage.from(bucket).upload(path, buffer, { contentType: mime, upsert: true });
          if (error) throw error;
          const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(path);
          return urlData.publicUrl;
        } catch {
          return "";
        }
      };

      const uploadPrivate = async (base64: string | null | undefined, name: string): Promise<string> => {
        if (!base64) return "";
        try {
          const parts = base64.split(",");
          const mime = parts[0]?.match(/data:(.*?);/)?.[1] ?? "image/jpeg";
          const ext = mime === "image/png" ? "png" : "jpg";
          const buffer = Uint8Array.from(atob(parts[1]), (c) => c.charCodeAt(0));
          const path = `dni/${profId}-${name}.${ext}`;
          const { error } = await supabase.storage.from("private-docs").upload(path, buffer, { contentType: mime, upsert: true });
          if (error) throw error;
          return path;
        } catch {
          return "";
        }
      };

      uploads.photo_url = await uploadImage(body.foto, "profile-photos", "profiles", "photo");
      uploads.dni_frente_path = await uploadPrivate(body.dniFrente, "dni-frente");
      uploads.dni_dorso_path = await uploadPrivate(body.dniDorso, "dni-dorso");
      uploads.foto_matricula_path = await uploadPrivate(body.fotoMatricula, "matricula");

      const { error } = await supabase.from("professionals").insert({
        id: profId,
        name: String(body.name ?? ""),
        profession: String(body.profession ?? ""),
        neighborhood: String(body.neighborhood ?? ""),
        schedule: String(body.schedule ?? ""),
        whatsapp: String(body.whatsapp ?? "").replace(/[^0-9]/g, ""),
        description: String(body.description ?? ""),
        category: String(body.category ?? "hogar"),
        photo_url: uploads.photo_url,
        dni_frente_path: uploads.dni_frente_path,
        dni_dorso_path: uploads.dni_dorso_path,
        foto_matricula_path: uploads.foto_matricula_path,
        numero_matricula: String(body.numeroMatricula ?? ""),
        estado: "Pendiente",
        verificado: false,
      });

      if (error) throw new Error(`DB error: ${error.message}`);
      return jsonResp({ success: true });
    }

    // ── Register course ──
    if (action === "register-course" && req.method === "POST") {
      const body = await req.json();
      const { error } = await supabase.from("courses").insert({
        nombre_curso: String(body.nombreCurso ?? ""),
        instructor: String(body.instructor ?? ""),
        whatsapp: String(body.whatsapp ?? "").replace(/[^0-9]/g, ""),
        email: String(body.email ?? ""),
        descripcion: String(body.descripcion ?? ""),
        duracion_horas: String(body.duracionHoras ?? ""),
        precio_ars: Number(body.precioARS ?? 0),
        estado: "Pendiente",
      });
      if (error) throw new Error(`DB error: ${error.message}`);
      return jsonResp({ success: true });
    }

    // ── Register ad ──
    if (action === "register-ad" && req.method === "POST") {
      const body = await req.json();
      let imagenPath = "";

      if (body.imagenUrl) {
        try {
          const parts = String(body.imagenUrl).split(",");
          const mime = parts[0]?.match(/data:(.*?);/)?.[1] ?? "image/jpeg";
          const ext = mime === "image/png" ? "png" : "jpg";
          const buffer = Uint8Array.from(atob(parts[1]), (c) => c.charCodeAt(0));
          const adId = crypto.randomUUID();
          const path = `ads/${adId}.${ext}`;
          const { error: upErr } = await supabase.storage.from("ad-media").upload(path, buffer, { contentType: mime, upsert: true });
          if (upErr) throw upErr;
          const { data: urlData } = supabase.storage.from("ad-media").getPublicUrl(path);
          imagenPath = urlData.publicUrl;
        } catch { imagenPath = ""; }
      }

      const { error } = await supabase.from("ads").insert({
        titulo: String(body.titulo ?? ""),
        descripcion: String(body.descripcion ?? ""),
        link: String(body.link ?? ""),
        link_video: String(body.linkVideo ?? ""),
        imagen_path: imagenPath,
        plan_nombre: String(body.planNombre ?? ""),
        estado: "Pendiente",
      });
      if (error) throw new Error(`DB error: ${error.message}`);
      return jsonResp({ success: true });
    }

    // ── Start contact verification ──
    if (action === "start-verification" && req.method === "POST") {
      const body = await req.json();
      const { data: clData, error: clErr } = await supabase.rpc("create_contact_log", {
        p_professional_id: body.professionalId,
        p_user_name: String(body.name ?? ""),
        p_user_phone: String(body.phone ?? ""),
        p_user_email: String(body.email ?? ""),
      });
      if (clErr) throw new Error(`DB error: ${clErr.message}`);

      const code = genCode();
      const { error: vcErr } = await supabase.rpc("create_verification_code", {
        p_contact_log_id: clData,
        p_phone: String(body.phone ?? ""),
        p_email: String(body.email ?? ""),
        p_code: code,
      });
      if (vcErr) throw new Error(`DB error: ${vcErr.message}`);

      // Send code via email (best effort)
      const emailResp = await supabase.functions.invoke("send-email", {
        body: {
          to: String(body.email ?? ""),
          subject: "Tu código de verificación — TalentoCrux",
          html: `<p>Hola ${String(body.name ?? "")},</p><p>Tu código de verificación es: <strong style="font-size:24px;letter-spacing:4px">${code}</strong></p><p>Este código vence en 10 minutos.</p><p>Si no solicitaste este código, ignorá este mensaje.</p>`,
        },
      }).catch(() => null);

      // Send code via SMS (best effort)
      await supabase.functions.invoke("send-sms", {
        body: {
          to: String(body.phone ?? ""),
          message: `TalentoCrux: tu codigo de verificacion es ${code}. Vence en 10 min.`,
        },
      }).catch(() => null);

      return jsonResp({ success: true, contactLogId: clData });
    }

    // ── Verify code ──
    if (action === "verify-code" && req.method === "POST") {
      const body = await req.json();
      const { data, error } = await supabase.rpc("verify_contact_and_create_token", {
        p_contact_log_id: body.contactLogId,
        p_code: String(body.code ?? ""),
      });
      if (error) throw new Error(`DB error: ${error.message}`);

      if (data && data.length > 0 && data[0].verified) {
        return jsonResp({ success: true, professionalName: data[0].professional_name, whatsapp: data[0].whatsapp });
      }
      return jsonResp({ success: false, error: "Código incorrecto o vencido." }, 400);
    }

    // ── Check review token ──
    if (action === "check-token" && req.method === "POST") {
      const body = await req.json();
      const { data, error } = await supabase.rpc("check_review_token", { p_token: String(body.token ?? "") });
      if (error) throw new Error(`DB error: ${error.message}`);
      if (data && data.length > 0) {
        return jsonResp({ valid: data[0].valid, professionalName: data[0].professional_name, professionalProfession: data[0].professional_profession });
      }
      return jsonResp({ valid: false });
    }

    // ── Submit review ──
    if (action === "submit-review" && req.method === "POST") {
      const body = await req.json();
      const { data, error } = await supabase.rpc("submit_review", {
        p_token: String(body.token ?? ""),
        p_rating: Number(body.rating ?? 0),
        p_comment: String(body.comment ?? ""),
      });
      if (error) throw new Error(error.message);
      return jsonResp({ success: true, reviewId: data });
    }

    return jsonResp({ error: "Acción no válida" }, 404);
  } catch (err) {
    return jsonResp({ error: err.message }, 500);
  }
});
