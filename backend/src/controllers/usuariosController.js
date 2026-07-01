const supabase = require("../config/supabaseClient");

exports.getAll = async (req, res) => {
    const { data, error } = await supabase.from("usuarios").select("*");
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
};

/**
 * GET /api/usuarios/peritos
 * Devuelve la lista de usuarios cuyo rol sea "perito".
 * Hace JOIN con la tabla roles para filtrar por descripcion.
 */
exports.getPeritos = async (req, res) => {
    try {
        // Obtener el idrol correspondiente a 'perito'
        const { data: rolData, error: rolError } = await supabase
            .from("roles")
            .select("idrol")
            .ilike("descripcion", "perito")
            .single();

        if (rolError || !rolData) {
            return res.json([]); // Rol no encontrado, devolver lista vacía
        }

        const { data, error } = await supabase
            .from("usuarios")
            .select("idusuario, nombre, apellido, correo, dni")
            .eq("idrol", rolData.idrol)
            .order("apellido", { ascending: true });

        if (error) return res.status(500).json({ error: error.message });
        res.json(data);
    } catch (err) {
        console.error("[getPeritos] Error:", err);
        res.status(500).json({ error: "Error interno del servidor" });
    }
};

exports.getById = async (req, res) => {
    const { id } = req.params;
    const { data, error } = await supabase.from("usuarios").select("*").eq("idusuario", id).single();
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
};

exports.create = async (req, res) => {
    const { data, error } = await supabase.from("usuarios").insert([req.body]).select();
    if (error) return res.status(500).json({ error: error.message });
    res.status(201).json(data);
};

exports.update = async (req, res) => {
    const { id } = req.params;
    const { data, error } = await supabase.from("usuarios").update(req.body).eq("idusuario", id).select();
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
};

exports.remove = async (req, res) => {
    const { id } = req.params;
    const { data, error } = await supabase.from("usuarios").delete().eq("idusuario", id).select();
    if (error) return res.status(500).json({ error: error.message });
    res.json({ message: "Deleted successfully", data });
};

/**
 * GET /api/usuarios/perfil?correo=xxx
 *
 * El frontend autentica directamente con Supabase Auth (tiene la ANON_KEY correcta).
 * Una vez autenticado, llama a este endpoint con el correo del usuario para obtener
 * su perfil y rol desde la tabla publica "usuarios".
 *
 * RAZON DEL DISENIO: signInWithPassword() falla cuando se usa con la service role key
 * del backend. La autenticacion debe hacerse desde el cliente (frontend) con la anon key.
 */
exports.getPerfil = async (req, res) => {
    const correo = req.query.correo?.trim().toLowerCase();

    console.log("=== [GET /api/usuarios/perfil] ===");
    console.log("Correo recibido:", correo);

    if (!correo) {
        return res.status(400).json({ error: "El parametro 'correo' es requerido" });
    }

    try {
        // 1. Buscar el usuario en la tabla publica por correo
        const { data: userData, error: userError } = await supabase
            .from("usuarios")
            .select("*")
            .eq("correo", correo)
            .single();

        console.log("  [usuarios] data:", JSON.stringify(userData));
        console.log("  [usuarios] error:", JSON.stringify(userError));

        if (userError || !userData) {
            console.error("Usuario no encontrado para correo:", correo);
            return res.status(404).json({
                error: "Usuario no encontrado en la base de datos",
                detail: userError?.message
            });
        }

        // 2. Buscar la descripcion del rol (columna idrol, en minusculas como devuelve Postgres)
        console.log("  idrol del usuario:", userData.idrol);

        const { data: roleData, error: roleError } = await supabase
            .from("roles")
            .select("descripcion")
            .eq("idrol", userData.idrol)
            .single();

        console.log("  [roles] data:", JSON.stringify(roleData));
        console.log("  [roles] error:", JSON.stringify(roleError));

        // 3. Devolver perfil y rol al frontend
        res.json({
            message: "Perfil obtenido exitosamente",
            user: userData,
            role: roleData?.descripcion ?? "Sin Rol"
        });

    } catch (err) {
        console.error("Error inesperado en getPerfil:", err);
        res.status(500).json({ error: "Error interno del servidor" });
    }
};
