import React, { useEffect, useState } from "react";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import { LuFileSpreadsheet } from "react-icons/lu";
import ChoreStatusTabs from "../../components/ChoreStatusTabs";
import ChoreCard from "../../components/Cards/ChoreCard";
import toast from "react-hot-toast";

const ManageChores = () => {

    const [allChores, setAllChores] = useState([]);

    const [tabs, setTabs] = useState([]);
    const [filterStatus, setFilterStatus] = useState("All");

    const navigate = useNavigate();

    const getAllChores = async () => {
        try {
            const response = await axiosInstance.get(API_PATHS.CHORES.GET_ALL_CHORES, {
                params: {
                    status: filterStatus === "All" ? "" : filterStatus,
                },
            });

            setAllChores(response.data?.chores?.length > 0 ? response.data.chores : []);

            const statusSummary = response.data?.statusSummary || {};

            const statusArray = [
                { label: "All", count: statusSummary.all || 0 },
                { label: "Pending", count: statusSummary.pendingChores || 0 },
                { label: "In Progress", count: statusSummary.inProgressChores || 0 },
                { label: "Completed", count: statusSummary.completedChores || 0 },
            ];

            setTabs(statusArray);
        } catch (error) {
            console.error("Error fetching users: ", error);
        }
    };

    const handleClick = (choreData) => {
        navigate(`/admin/create-chore`, { state: { choreId: choreData._id }});
    };

    const handleDownloadReport = async () => {
        try {
            const response = await axiosInstance.get(API_PATHS.REPORTS.EXPORT_CHORES, {
                responseType: "blob",
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", "chore_details.xlsx");
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch(error) {
            console.error("Error downloading chores details: ", error);
            toast.error("Failed to download chore details. Please try again!");
        }
    };

    useEffect(() => {
        getAllChores(filterStatus);
        return () => {};
    }, [filterStatus]);

    return (
    <DashboardLayout activeMenu="Manage Chores">
        <div className="my-5">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <h2 className="text-xl font-medium text-primary">My Chores</h2>

            {tabs?.[0]?.count > 0 && (
                <div className="flex items-center gap-3">
                    <ChoreStatusTabs
                        tabs={tabs}
                        activeTab={filterStatus}
                        setActiveTab={setFilterStatus}
                    />
                    <button className="hidden lg:flex download-btn" onClick={handleDownloadReport}>
                        <LuFileSpreadsheet className="text-lg" /> Download Report
                    </button>
                </div>
            )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                {allChores?.map((item, index) => (
                    <ChoreCard 
                        key={item._id}
                        title={item.title}
                        description={item.description}
                        priority={item.priority}
                        status={item.status}
                        progress={item.progress}
                        createdAt={item.createdAt}
                        dueDate={item.dueDate}
                        assignedTo={item.assignedTo?.map((item) => item.profileImageUrl)}
                        attachmentCount={item.attachments?.length || 0}
                        completedTodoCount={item.completedTodoCount || 0}
                        todoChecklist={item.todoChecklist || []}
                        onClick={() => {
                            handleClick(item);
                        }}
                    />
                ))}
            </div>
        </div> 
    </DashboardLayout>
    );
};

export default ManageChores;