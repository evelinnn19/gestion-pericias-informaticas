const supabase = require("../config/supabaseClient");

exports.getAll = async (req, res) => {
    const { data, error } = await supabase.from("Oficio_Dispositivo").select("*");
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
};

exports.create = async (req, res) => {
    const { data, error } = await supabase.from("Oficio_Dispositivo").insert([req.body]).select();
    if (error) return res.status(500).json({ error: error.message });
    res.status(201).json(data);
};

exports.remove = async (req, res) => {
    const { data, error } = await supabase.from("Oficio_Dispositivo").delete().eq("idOficio", req.params.idOficio).eq("idDispositivo", req.params.idDispositivo).select();
    if (error) return res.status(500).json({ error: error.message });
    res.json({ message: "Deleted successfully", data });
};

