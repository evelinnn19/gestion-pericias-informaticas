const supabase = require("../../config/supabaseClient");

exports.getAll = async (req, res) => {
    const { data, error } = await supabase.from("tipodelito").select("*");
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
};
