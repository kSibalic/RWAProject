const express = require("express");
const { protect, adminOnly } = require("../middlewares/authMiddleware");
const { exportUsersReport, exportChoresReport } = require("../controllers/reportController");

const router = express.Router();

router.get("/export/chores", protect, adminOnly, exportChoresReport);
router.get("/export/users", protect, adminOnly, exportUsersReport);

module.exports = router;
