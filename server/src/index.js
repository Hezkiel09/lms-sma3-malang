const express = require("express");
const supabase = require("./config/supabase");

const app = express();
app.use(express.json());

// test endpoint dulu
app.get("/api/health", async (req, res) => {
    try {
        const { data, error } = await supabase.from("users").select("*");
        if (error) throw error;
        res.status(200).json({ message: "Server is healthy", data });
    } catch (error) {
        res.status(500).json({ message: "Server is unhealthy", error: error.message });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});