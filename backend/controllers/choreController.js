const Chore = require("../models/Chore");

// @desc    -> Get all chores (admin: all; user: only assigned)
// @route   -> GET /api/chores/
// @access  -> Private
const getChores = async (req, res) => {
    try {
        const { status } = req.query;
        let filter = {};

        if (status) {
            filter.status = status;
        }

        let chores;

        if(req.user.role === "admin") {
            chores = await Chore.find(filter).populate("assignedTo", "name email profileImageUrl");
        } else {
            chores = await Chore.find({ ...filter, assignedTo: req.user._id }).populate("assignedTo", "name email profileImageUrl");
        }

        chores = await Promise.all(
            chores.map(async (chore) => {
                const completedCount = chore.todoChecklist.filter((item) => item.completed).length;
                
                return { ...chore._doc, completedTodoCount: completedCount };
            })
        );

        const allChores = await Chore.countDocuments(
            req.user.role === "admin" ? {} : { assignedTo: req.user._id }
        );

        const pendingChores = await Chore.countDocuments({
            ...filter,
            status: "pending",
            ...(req.user.role !== "admin" && { assignedTo: req.user._id }),
        });

        const inProgressChores = await Chore.countDocuments({
            ...filter,
            status: "In Progress",
            ...(req.user.role !== "admin" && { assignedTo: req.user._id }),
        });

        const completedChores = await Chore.countDocuments({
            ...filter,
            status: "Completed",
            ...(req.user.role !== "admin" && { assignedTo: req.user._id }),
        });

        res.json({
            chores,
            statusSummary: {
                all: allChores,
                pendingChores,
                inProgressChores,
                completedChores,
            },
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc    -> Get chore by ID
// @route   -> GET /api/chores/:id
// @access  -> Private
const getChoreById = async (req, res) => {
    try {
        const chore = await Chore.findById(req.params.id).populate("assignedTo", "name email profileImageUrl");

        if (!chore) {
            res.status(404).json({ message: "Chore not found!" });
        }

        res.json(chore);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc    -> Create new chore (admin)
// @route   -> POST /api/chores/
// @access  -> Private (admin)
const createChore = async (req, res) => {
    try {
        const {
            title,
            description,
            priority,
            dueDate,
            assignedTo,
            attachments,
            todoChecklist,
        } = req.body;

        if (!Array.isArray(assignedTo)) {
            return res.status(400).json({ message: "assignedTo must be an array of user IDs!" });
        }

        const chore = await Chore.create({
            title,
            description,
            priority,
            dueDate,
            assignedTo,
            createdBy: req.user._id,
            todoChecklist,
            attachments,
        });

        res.status(201).json({ message: "Chore created successfully!", chore });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc    -> Update chore details
// @route   -> PUT /api/chores/:id
// @access  -> Private
const updateChore = async (req, res) => {
    try {
        const chore = await Chore.findById(req.params.id);

        if (!chore) {
            return res.status(404).json({ message: "Chore not found!" });
        }

        chore.title = req.body.title || chore.title;
        chore.description = req.body.description || chore.description;
        chore.priority = req.body.priority || chore.priority;
        chore.dueDate = req.body.dueDate || chore.dueDate;
        chore.todoChecklist = req.body.todoChecklist || chore.todoChecklist;
        chore.attachments = req.body.attachments || chore.attachments;

        if (req.body.assignedTo) {
            if (!Array.isArray(req.body.assignedTo)) {
                return res.status(400).json({ message: "assignedTo must be an array of user IDs!" });
            }
            chore.assignedTo = req.body.assignedTo;
        }

        const updatedChore = await chore.save();
        res.json({ message: "Chore updated successfully!", updatedChore });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc    -> Delete chore (admin)
// @route   -> DELETE /api/chores/:id
// @access  -> Private (admin)
const deleteChore = async (req, res) => {
    try {
        const chore = await Chore.findById(req.params.id);

        if (!chore) {
            return res.status(404).json({ message: "Chore not found!" });
        }

        await chore.deleteOne();
        res.json({ message: "Chore deleted successfully!" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc    -> Update chore status
// @route   -> PUT /api/chores/:id/status
// @access  -> Private
const updateChoreStatus = async (req, res) => {
    try {
        const chore = await Chore.findById(req.params.id);

        if(!chore) {
            return res.status(404).json({ message: "Chore not found!" });
        }

        const isAssigned = chore.assignedTo.some(
            (userId) => userId.toString() === req.user._id.toString()
        );

        if (!isAssigned && req.user.role !== "admin") {
            return res.status(403).json({ message: "Not authorized!" });
        }

        chore.status = req.body.status || chore.status;

        if (chore.status === "Completed") {
            chore.todoChecklist.forEach((item) => (item.completed = true));
            chore.progress = 100;
        }

        await chore.save();
        res.json({ message: "Chore status updated!" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc    -> Update chore checklist
// @route   -> PUT /api/chores/:id/todo
// @access  -> Private
const updateChoreChecklist = async (req, res) => {
    try {
        const { todoChecklist } = req.body;
        const chore = await Chore.findById(req.params.id);

        if (!chore) {
            return res.status(404).json({ message: "Chore not found!" });
        }

        if (!chore.assignedTo.includes(req.user._id) && req.user.role !== "admin") {
            return res.status(403).json({ message: "Not authorized to update checklist!" });
        }

        chore.todoChecklist = todoChecklist;

        const completedCount = chore.todoChecklist.filter((item) => item.completed).length;
        const totalItems = chore.todoChecklist.length;
        
        chore.progress = totalItems > 0 ? Math.round((completedCount / totalItems) * 100) : 0;

        if (chore.progress === 100) {
            chore.status = "Completed";
        } else if (chore.progress > 0) {
            chore.status = "In Progress";
        } else {
            chore.status = "Pending";
        }

        await chore.save();

        const updateChore = await Chore.findById(req.params.id).populate("assignedTo", "name email profileImageUrl");

        res.json({ message: "Chore checklist updated!", chore:updateChore });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc    -> Dashboard data (admin)
// @route   -> GET /api/chores/dashboard-data
// @access  -> Private
const getDashboardData = async (req, res) => {
    try {
        const totalChores = await Chore.countDocuments();
        const pendingChores = await Chore.countDocuments({ status: "Pending" });
        const completedChores = await Chore.countDocuments({ status: "Completed" });
        const overdueChores = await Chore.countDocuments({
            status: { $ne: "Completed" },
            dueDate: { $lt: new Date() },
        });

        const choreStatuses = ["Pending", "In Progress", "Completed"];
        const choreDistributionRaw = await Chore.aggregate([
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 },
                },
            },
        ]);

        const choreDistribution = choreStatuses.reduce((acc, status) => {
            const formattedKey = status.replace(/\s+/g, "");
            acc[formattedKey] = choreDistributionRaw.find((item) => item._id === status)?.count || 0;
            
            return acc;
        }, {});
        choreDistribution["All"] = totalChores;

        const chorePriorities = ["Low", "Medium", "High"];
        const chorePriorityLevelsRaw = await Chore.aggregate([
            {
                $group: {
                    _id: "$priority",
                    count: { $sum: 1 },
                },
            },
        ]);
        
        const chorePriorityLevels = chorePriorities.reduce((acc, priority) => {
            acc[priority] = chorePriorityLevelsRaw.find((item) => item._id === priority)?.count || 0;

            return acc;
        }, {});

        const recentChores = await Chore.find()
        .sort({ createdAt: -1 })
        .limit(10)
        .select("title status priority dueDate createdAt");

        res.status(200).json({
            statistics: {
                totalChores,
                pendingChores,
                completedChores,
                overdueChores,
            },
            charts: {
                choreDistribution,
                chorePriorityLevels,
            },
            recentChores,
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc    ->  Dashboard data (user)
// @route   ->  PUT /api/chores/:id
// @access  ->  Private
const getUserDashboardData = async (req, res) => {
    try {
        const userId = req.user._id;

        const totalChores = await Chore.countDocuments({ assignedTo: userId });
        const pendingChores = await Chore.countDocuments({ assignedTo: userId, status: "Pending" });
        const completedChores = await Chore.countDocuments({ assignedTo: userId, status: "Completed" });
        const overdueChores = await Chore.countDocuments({ 
            assignedTo: userId,
            status: { $ne: "Completed" },
            dueDate: { $lt: new Date() },
        });

        const choreStatuses = ["Pending", "In Progress", "Complted"];
        const choreDistributionRaw = await Chore.aggregate([
            { $match: { assignedTo: userId }},
            { $group: { _id: "$status", count: { $sum: 1 }}},
        ]);

        const choreDistribution = choreStatuses.reduce((acc, status) => {
            const formattedKey = status.replace(/\s+/g, "");
            acc[formattedKey] = choreDistributionRaw.find((item) => item._id === status)?.count || 0;
            
            return acc;
        }, {});

        choreDistribution["All"] = totalChores;

        const chorePriorities = ["Low", "Medium", "High"];
        const chorePriorityLevelsRaw = await Chore.aggregate([
            { $match: { assignedTo: userId }},
            { $group: { _id: "$priority", count: { $sum: 1 }}},
        ]);

        const chorePriorityLevels = chorePriorities.reduce((acc, priority) => {
            acc[priority] = chorePriorityLevelsRaw.find((item) => item._id === priority)?.count || 0;

            return acc;
        }, {});

        const recentChores = await Chore.find({ assignedTo: userId }).sort({ createdAt: -1 }).limit(10).select("title status priority dueDate createdAt");

        res.status(200).json({
            statistics: {
                totalChores,
                pendingChores,
                completedChores,
                overdueChores,
            },
            charts: {
                choreDistribution,
                chorePriorityLevels,
            },
            recentChores,
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

module.exports = {
    getChores,
    getChoreById,
    createChore,
    updateChore,
    deleteChore,
    updateChoreStatus,
    updateChoreChecklist,
    getDashboardData,
    getUserDashboardData,
};