const express        = require("express");
const router         = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const {
    createFm,
    getAllFm,
    getFmById,
    updateFm,
    undoFm,
    deleteFm,
} = require("../controllers/fmController");

router.post(  "/",          authMiddleware, createFm);   // Create
router.get(   "/",          authMiddleware, getAllFm);    // Read All
router.get(   "/:id",       authMiddleware, getFmById);   // Read One by ID
router.put(   "/:id",       authMiddleware, updateFm);    // Update by ID  (returns `previous` for undo)
router.put(   "/:id/undo",  authMiddleware, undoFm);      // Undo last update
router.delete("/:id",       authMiddleware, deleteFm);    // Delete by ID

module.exports = router;
