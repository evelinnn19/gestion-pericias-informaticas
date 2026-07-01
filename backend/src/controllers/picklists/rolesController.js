const supabase = require("../../config/supabaseClient");

exports.getAll = async (req, res) => {
    try {
        const { data, error } = await supabase.from("roles").select("*");

        if (error) {
            // Esto ataja los errores propios de la base de datos (ej. tabla no existe)
            return res.status(400).json({ error: error.message });
        }

        res.status(200).json(data);
    } catch (err) {
        // Esto ataja errores inesperados del servidor o de red
        console.error("Error inesperado en getAll Roles:", err);
        res.status(500).json({ error: "Error interno del servidor" });
    }
};