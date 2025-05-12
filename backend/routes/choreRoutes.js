const express = require("express");
const { protect, adminOnly } = require("../middlewares/authMiddleware");
const { getDashboardData, getUserDashboardData, getChores, getChoreById, createChore, updateChore, deleteChore, updateChoreChecklist, updateChoreStatus } = require("../controllers/choreController");

const router = express.Router();

// Chore Management Routes
router.get("/dashboard-data", protect, getDashboardData);
router.get("/user-dashboard-data", protect, getUserDashboardData);
router.get("/", protect, getChores);
router.get("/:id", protect, getChoreById);
router.post("/", protect, adminOnly, createChore);
router.put("/:id", protect, updateChore);
router.delete("/:id", protect, adminOnly, deleteChore);
router.put("/:id/status", protect, updateChoreStatus);
router.put("/:id/todo", protect, updateChoreChecklist);

module.exports = router;