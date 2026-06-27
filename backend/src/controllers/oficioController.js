const supabase = require("../config/supabaseClient");

exports.getAll = async (req, res) => {
    const { data, error } = await supabase.from("oficio").select("*");
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
};

exports.getById = async (req, res) => {
    const { id } = req.params;
    const { data, error } = await supabase.from("oficio").select("*").eq("idoficio", id).single();
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
};

exports.create = async (req, res) => {
    const { data, error } = await supabase.from("oficio").insert([req.body]).select();
    if (error) return res.status(500).json({ error: error.message });
    res.status(201).json(data);
};

exports.update = async (req, res) => {
    const { id } = req.params;
    const { data, error } = await supabase.from("oficio").update(req.body).eq("idoficio", id).select();
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
};

exports.remove = async (req, res) => {
    const { id } = req.params;
    const { data, error } = await supabase.from("oficio").delete().eq("idoficio", id).select();
    if (error) return res.status(500).json({ error: error.message });
    res.json({ message: "Deleted successfully", data });
};

/**
 * GET /api/oficio/listado
 * Devuelve oficios enriquecidos con datos de causa, tipodelito, estadocausa y peritos.
 * Soporta filtros simultáneos via query params:
 *   - idperito     : filtra por perito asignado (id de usuario)
 *   - iddelito     : filtra por tipo de delito
 *   - idestadocausa: filtra por estado de causa
 *   - busqueda     : búsqueda libre sobre nrointerno, nrolegajo, caratula
 *   - narcomenudeo : "true" para filtrar solo causas de narcomenudeo (future use)
 */
exports.getListado = async (req, res) => {
    try {
        const { idperito, iddelito, idestadocausa, busqueda } = req.query;

        // 1. Construir la consulta base sobre oficio con JOINs a causa y sus relaciones
        let query = supabase
            .from("oficio")
            .select(`
                idoficio,
                nrointerno,
                prioridad,
                fechahoraapertura,
                fiscalsolicitante,
                descripciontareaoficio,
                causa!inner(
                    idcausa,
                    nrolegajo,
                    caratula,
                    fechaingreso,
                    idestadocausa,
                    iddelito,
                    estadocausa(idestadocausa, descripcion),
                    tipodelito(iddelito, descripcion)
                ),
                oficio_perito(
                    idperito,
                    usuarios(idusuario, nombre, apellido)
                )
            `);

        // 2. Aplicar filtros sobre la causa
        if (iddelito) {
            query = query.eq("causa.iddelito", parseInt(iddelito));
        }
        if (idestadocausa) {
            query = query.eq("causa.idestadocausa", parseInt(idestadocausa));
        }

        const { data: oficios, error } = await query;
        if (error) return res.status(500).json({ error: error.message });

        // 3. Filtrado post-query: perito y búsqueda libre
        let resultado = oficios || [];

        if (idperito) {
            const peritoId = parseInt(idperito);
            resultado = resultado.filter((o) =>
                o.oficio_perito?.some((op) => op.idperito === peritoId)
            );
        }

        if (busqueda) {
            const term = busqueda.toLowerCase();
            resultado = resultado.filter((o) => {
                const en_nrointerno = o.nrointerno?.toLowerCase().includes(term);
                const en_legajo = o.causa?.nrolegajo?.toLowerCase().includes(term);
                const en_caratula = o.causa?.caratula?.toLowerCase().includes(term);
                const en_fiscal = o.fiscalsolicitante?.toLowerCase().includes(term);
                return en_nrointerno || en_legajo || en_caratula || en_fiscal;
            });
        }

        res.json(resultado);
    } catch (err) {
        console.error("[getListado] Error:", err);
        res.status(500).json({ error: "Error interno del servidor" });
    }
};
