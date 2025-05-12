const Chore = require("../models/Chore");
const User = require("../models/User");
const bcrypt = require("bcryptjs");

// @desc -> Get all users (admin)
// @route -> GET /api/users/
// @access -> Private (admin)
const getUsers = async (req, res) => {
    try {
        const users = await User.find({ role: 'member' }).select("-password");

        const usersWithChoreCounts = await Promise.all(users.map(async (user) => {
            const pendingChores = await Chore.countDocuments({ 
                assignedTo: user._id, 
                status: "Pending", 
            });
            const inProgressChores = await Chore.countDocuments({ 
                assignedTo: user._id,
                status: "In Progress",
            });
            const completedChores = await Chore.countDocuments({ 
                assignedTo: user._id, 
                status: "Completed", 
            });

            return {
                ...user._doc,   // Include all existing user data
                pendingChores,
                inProgressChores,
                completedChores,
            };
        }));

        res.json(usersWithChoreCounts);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc -> Get user by ID
// @route -> GET /api/users/:id
// @access -> Private
const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select("-password");
        
        if (!user) {
            return res.status(404).json({ message: "user not found" });
        }

        res.json(user);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

module.exports = { getUsers, getUserById };