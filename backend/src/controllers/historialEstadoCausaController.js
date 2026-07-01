const supabase = require("../config/supabaseClient");

exports.getAll = async (req, res) => {
    const { data, error } = await supabase.from("historialestadocausa").select("*");
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
};

exports.getById = async (req, res) => {
    const { id } = req.params;
    const { data, error } = await supabase.from("historialestadocausa").select("*").eq("idHistorial", id).single();
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
};

exports.create = async (req, res) => {
    const { data, error } = await supabase.from("historialestadocausa").insert([req.body]).select();
    if (error) return res.status(500).json({ error: error.message });
    res.status(201).json(data);
};

exports.update = async (req, res) => {
    const { id } = req.params;
    const { data, error } = await supabase.from("historialestadocausa").update(req.body).eq("idHistorial", id).select();
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
};

exports.remove = async (req, res) => {
    const { id } = req.params;
    const { data, error } = await supabase.from("historialestadocausa").delete().eq("idHistorial", id).select();
    if (error) return res.status(500).json({ error: error.message });
    res.json({ message: "Deleted successfully", data });
};

