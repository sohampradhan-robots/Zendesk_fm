const prisma = require("../db/db");

// POST /fm — Create
const createFm = async (req, res) => {
    const {
        customer,
        site,
        time_zone,
        name_of_tug,
        vehicle_type,
        hosted_env,
        local_ip,
        wireguard_ip,
        mule_version,
        fm_version,
        dashboard,
        primary_temp,
    } = req.body;

    if (!name_of_tug) {
        return res.status(400).json({
            success: false,
            message: "name_of_tug is required",
        });
    }

    try {
        const record = await prisma.fmDetails.create({
            data: {
                customer,
                site,
                time_zone,
                name_of_tug,
                vehicle_type,
                hosted_env,
                local_ip,
                wireguard_ip,
                mule_version,
                fm_version,
                dashboard,
                primary_temp: primary_temp !== undefined ? Number(primary_temp) : undefined,
            },
        });

        res.status(201).json({
            success: true,
            data: record,
            message: "FM record created successfully",
        });
    } catch (err) {
        console.error(err);
        // P2002 = Unique constraint violation
        if (err.code === "P2002") {
            return res.status(409).json({
                success: false,
                message: "Duplicate: name_of_tug already exists",
            });
        }
        res.status(500).json({
            success: false,
            message: err.message,
        });
    }
};

// GET /fm — Read All
const getAllFm = async (req, res) => {
    try {
        const records = await prisma.fmDetails.findMany({
            orderBy: { name_of_tug: "asc" },
        });

        res.status(200).json({
            success: true,
            data: records,
            message: "Success",
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message,
        });
    }
};

// GET /fm/:id — Read One by ID
const getFmById = async (req, res) => {
    try {
        const record = await prisma.fmDetails.findUnique({
            where: { id: Number(req.params.id) },
        });

        if (!record) {
            return res.status(404).json({
                success: false,
                message: "FM record not found",
            });
        }

        res.status(200).json({
            success: true,
            data: record,
            message: "Success",
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message,
        });
    }
};

// PUT /fm/:id — Update by ID
const updateFm = async (req, res) => {
    const {
        customer, site, time_zone, name_of_tug, vehicle_type,
        hosted_env, local_ip, wireguard_ip,
        mule_version, fm_version, dashboard, primary_temp,
    } = req.body;

    const id = Number(req.params.id);

    // Snapshot previous state for undo support
    let previousRecord;
    try {
        previousRecord = await prisma.fmDetails.findUnique({ where: { id } });
        if (!previousRecord) {
            return res.status(404).json({
                success: false,
                message: "FM record not found",
            });
        }
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message,
        });
    }

    try {
        const record = await prisma.fmDetails.update({
            where: { id },
            data: {
                customer,
                site,
                time_zone,
                name_of_tug,
                vehicle_type,
                hosted_env,
                local_ip,
                wireguard_ip,
                mule_version,
                fm_version,
                dashboard,
                primary_temp: primary_temp !== undefined ? Number(primary_temp) : undefined,
                updated_at: new Date(),
            },
        });

        res.status(200).json({
            success: true,
            data: record,
            previous: previousRecord,  // client can use this to undo
            message: "FM record updated successfully",
        });
    } catch (err) {
        console.error(err);
        if (err.code === "P2002") {
            return res.status(409).json({
                success: false,
                message: "Duplicate: name_of_tug already exists",
            });
        }
        res.status(500).json({
            success: false,
            message: err.message,
        });
    }
};

// PUT /fm/:id/undo — Undo last update (restore previous snapshot)
const undoFm = async (req, res) => {
    // caller sends back the `previous` object returned by updateFm
    const {
        customer, site, time_zone, name_of_tug, vehicle_type,
        hosted_env, local_ip, wireguard_ip,
        mule_version, fm_version, dashboard, primary_temp,
    } = req.body;

    const id = Number(req.params.id);

    try {
        const record = await prisma.fmDetails.update({
            where: { id },
            data: {
                customer,
                site,
                time_zone,
                name_of_tug,
                vehicle_type,
                hosted_env,
                local_ip,
                wireguard_ip,
                mule_version,
                fm_version,
                dashboard,
                primary_temp: primary_temp !== undefined ? Number(primary_temp) : undefined,
                updated_at: new Date(),
            },
        });

        res.status(200).json({
            success: true,
            data: record,
            message: "Undo successful",
        });
    } catch (err) {
        // P2025 = Record to update not found
        if (err.code === "P2025") {
            return res.status(404).json({
                success: false,
                message: "FM record not found",
            });
        }
        res.status(500).json({
            success: false,
            message: err.message,
        });
    }
};

// DELETE /fm/:id — Delete by ID
const deleteFm = async (req, res) => {
    const id = Number(req.params.id);

    try {
        const record = await prisma.fmDetails.delete({
            where: { id },
        });

        res.status(200).json({
            success: true,
            data: record,
            message: "FM record deleted successfully",
        });
    } catch (err) {
        // P2025 = Record to delete not found
        if (err.code === "P2025") {
            return res.status(404).json({
                success: false,
                message: "FM record not found",
            });
        }
        res.status(500).json({
            success: false,
            message: err.message,
        });
    }
};

module.exports = { createFm, getAllFm, getFmById, updateFm, undoFm, deleteFm };
