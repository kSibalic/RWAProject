const Chore = require("../models/Chore");
const User = require("../models/User");
const excelJS = require("exceljs");

// @desc    -> Export all chores to Excel
// @route   -> GET /api/reports/export/chores
// @access  -> Private (admin)

const exportChoresReport = async (req, res) => {
    try {
        const chores = await Chore.find().populate("assignedTo", "name email");

        const workbook = new excelJS.Workbook();
        const worksheet = workbook.addWorksheet("Chores Report");

        worksheet.columns = [
            { header: "Chore ID", key: "_id", width: 25 },
            { header: "Title", key: "title", width: 30 },
            { header: "Description", key: "description", width: 50 },
            { header: "Priority", key: "priority", width: 15 },
            { header: "Status", key: "status", width: 20 },
            { header: "Due Date", key: "dueDate", width: 20 },
            { header: "Assigned To", key: "assignedTo", width: 30 },
        ];

        chores.forEach((chore) => {
            const assignedTo = chore.assignedTo.map((user) => `${user.name} (${user.email})`).join(", ");

            worksheet.addRow({
                _id: chore._id,
                title: chore.title,
                description: chore.description,
                priority: chore.priority,
                status: chore.status,
                dueDate: chore.dueDate.toISOString().split("T")[0],
                assignedTo: assignedTo || "Unassigned",
            });
        });

        res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheet.sheet"
        );

        res.setHeader(
            "Content-Disposition",
            'attachment; filename="chore_report.xlsx"'
        );

        return workbook.xlsx.write(res).then(() => { res.end(); });
    } catch (error) {
        res.status(500).json({ message: "Error exporting chores", error: error.message });
    }
};

// @desc    -> Export user-chore export to Excel
// @access  -> GET /api/reports/export/users
// @access  -> Private (admin)

const exportUsersReport = async (req, res) => {
    try {
        const users = await User.find().select("name email _id").lean();
        const userChores = await Chore.find().populate(
            "assignedTo",
            "name email _id"
        );

        const userChoreMap = {};
        users.forEach((user) => {
            userChoreMap[user._id] = {
                name: user.name,
                email: user.email,
                choreCount: 0,
                pendingChores: 0,
                inProgressChores: 0,
                completedChore: 0,
            };
        });

        userChores.forEach((chore) => {
            if (chore.assignedTo) {
                chore.assignedTo.forEach((assignedUser) => {
                    if (userChoreMap[assignedUser._id]) {
                        userChoreMap[assignedUser._id].choreCount += 1;
                        
                        if (chore.status === "Pending") {
                            userChoreMap[assignedUser._id].pendingChores += 1;
                        } else if (chore.status === "In Progress") {
                            userChoreMap[assignedUser._id].inProgressChores += 1;
                        } else if (chore.status === "Completed") {
                            userChoreMap[assignedUser._id].completedChore += 1;   
                        }
                    }
                });
            }
        });

        const workbook = new excelJS.Workbook();
        const worksheet = workbook.addWorksheet("User Chore Report");

        worksheet.columns = [
            { header: "User Name", key: "name", width: 30 },
            { header: "Email", key: "email", width: 40 },
            { header: "Total Assigned Chores", key: "choreCount", width: 20 },
            { header: "Pending Chores", key: "pendingChores", width: 20 },
            { header: "In Progress Chores", key: "inProgressChores", width: 20 },
            { header: "Completed Chores", key: "completedChores", width: 20 },
        ];

        Object.values(userChoreMap).forEach((user) => { worksheet.addRow(user); });

        res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );
        res.setHeader(
            "Content-Disposition",
            'attachment; filename="users_report.xlsx"'
        );

        return workbook.xlsx.write(res).then(() => {
            res.end();
        });
    } catch (error) {
        res.status(500).json({ message: "Error exporting users", error: error.message });
    }
};

module.exports = {
    exportChoresReport,
    exportUsersReport,
};