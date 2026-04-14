require("dotenv").config();

const express    = require("express");
const cors       = require("cors");
const morgan     = require("morgan");

const authRoutes = require("./routes/authRoutes");
const fmRoutes   = require("./routes/fmRoutes");

const app  = express();
const PORT = process.env.PORT || 3000;

// =========================
//  Global Middleware
// =========================
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// =========================
//  Health Check
// =========================
app.get("/", (req, res) => {
    res.send("FM API is running...");
});

// =========================
//  Routes
// =========================
app.use("/",    authRoutes);   // POST /register, POST /login
app.use("/fm",  fmRoutes);     // GET/POST/PUT/DELETE /fm

// =========================
//  Start Server
// =========================
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
