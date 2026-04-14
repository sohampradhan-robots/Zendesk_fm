const bcrypt = require("bcrypt");
const jwt    = require("jsonwebtoken");
const prisma = require("../db/db");

// POST /register
const register = async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({
            success: false,
            message: "Username and password are required",
        });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: { username, password: hashedPassword },
            select: { id: true, username: true },
        });

        res.status(201).json({
            success: true,
            data: user,
            message: "User created successfully",
        });
    } catch (err) {
        // P2002 = Unique constraint violation
        if (err.code === "P2002") {
            return res.status(409).json({
                success: false,
                message: "Username already exists",
            });
        }
        res.status(500).json({
            success: false,
            message: err.message,
        });
    }
};

// POST /login
const login = async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({
            success: false,
            message: "Username and password are required",
        });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { username },
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User not found",
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid password",
            });
        }

        const token = jwt.sign(
            { username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        res.status(200).json({
            success: true,
            data: { token },
            message: "Login successful",
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message,
        });
    }
};

module.exports = { register, login };
