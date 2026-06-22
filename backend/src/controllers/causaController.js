const supabase = require("../config/supabaseClient");

exports.getAll = async (req, res) => {
    const { data, error } = await supabase.from("causa").select("*");
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
};

exports.getById = async (req, res) => {
    const { id } = req.params;
    const { data, error } = await supabase.from("causa").select("*").eq("idCausa", id).single();
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
};

exports.create = async (req, res) => {
    const { data, error } = await supabase.from("causa").insert([req.body]).select();
    if (error) return res.status(500).json({ error: error.message });
    res.status(201).json(data);
};

exports.update = async (req, res) => {
    const { id } = req.params;
    const { data, error } = await supabase.from("causa").update(req.body).eq("idCausa", id).select();
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
};

exports.remove = async (req, res) => {
    const { id } = req.params;
    const { data, error } = await supabase.from("causa").delete().eq("idCausa", id).select();
    if (error) return res.status(500).json({ error: error.message });
    res.json({ message: "Deleted successfully", data });
};

