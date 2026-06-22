const supabase = require("../config/supabaseClient");

exports.getAll = async (req, res) => {
    const { data, error } = await supabase.from("oficio_perito").select("*");
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
};

exports.create = async (req, res) => {
    const { data, error } = await supabase.from("oficio_perito").insert([req.body]).select();
    if (error) return res.status(500).json({ error: error.message });
    res.status(201).json(data);
};

exports.remove = async (req, res) => {
    const { data, error } = await supabase.from("oficio_perito").delete().eq("idOficio", req.params.idOficio).eq("idPerito", req.params.idPerito).select();
    if (error) return res.status(500).json({ error: error.message });
    res.json({ message: "Deleted successfully", data });
};

