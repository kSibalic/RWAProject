import React, { use, useContext, useEffect, useState } from "react";
import { useUserAuth } from '../../hooks/useUserAuth';
import { UserContext } from "../../context/userContext";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import moment from 'moment';
import InfoCard from "../../components/Cards/InfoCard";
import { addThousandsSeparator } from "../../utils/helper";
import { LuArrowRight } from "react-icons/lu";
import ChoreListTable from "../../components/ChoreListTable";
import CustomPieChart from "../../components/Charts/CustomPieChart";
import CustomBarChart from "../../components/Charts/CustomBarChart";

const COLORS = ["#F2AFEF", "#C499F3", "#33186B"];

const UserDashboard = () => {
    useUserAuth();

    const { user } = useContext(UserContext);

    const navigate = useNavigate();

    const [dashboardData, setDashboardData] = useState(null);
    const [pieChartData, setPieChartData] = useState([]);
    const [barChartData, setBarChartData] = useState([]);

    // Chart Data
    const prepareChartData = (data) => {
        const choreDistribution = data?.choreDistribution || null;
        const chorePriorityLevels = data?.chorePriorityLevels || null;

        const choreDistributionData = [
            { status: "Pending", count: choreDistribution?.Pending || 0 },
            { status: "In Progress", count: choreDistribution?.InProgress || 0 },
            { status: "Completed", count: choreDistribution?.Completed || 0 },
        ];

        setPieChartData(choreDistributionData);

        const PriorityLevelData = [
            { priority: "Low", count: chorePriorityLevels?.Low || 0 },
            { priority: "Medium", count: chorePriorityLevels?.Medium || 0 },
            { priority: "High", count: chorePriorityLevels?.High || 0 },
        ];

        setBarChartData(PriorityLevelData);
    };

    const getDashboardData = async () => {
        try {
            const response = await axiosInstance.get(
                API_PATHS.CHORES.GET_USER_DASHBOARD_DATA
            );
            if (response.data) {
                setDashboardData(response.data);
                prepareChartData(response.data?.charts || null);
            }
        } catch (error) {
            console.error("Error fetching users: ", error);
        }
    };

    const onSeeMore = () => {
        navigate('/admin/chores')
    }

    useEffect(() => {
        getDashboardData();

        return () => {};
    }, []);

    return (
        <DashboardLayout activeMenu="Dashboard">
            <div className="card my-5">
                <div>
                    <div className="col-span-3">
                        <h2 className="text-xl md:text-2xl">Good Morning, {user?.name}!</h2>
                        <p className="text-xs md:text-[13px] text-gray-400 mt-1.5">
                            {moment().format("dddd Do MMM YYYY")}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mt-5">
                    <InfoCard
                        label="Total Chores"
                        value = {addThousandsSeparator(
                            dashboardData?.charts?.choreDistribution?.All || 0
                        )}
                        color="bg-primary"
                    />

                    <InfoCard
                        label="Pending Chores"
                        value = {addThousandsSeparator(
                            dashboardData?.charts?.choreDistribution?.Pending || 0
                        )}
                        color="bg-primary/75"
                    />

                    <InfoCard
                        label="In Progress Chores"
                        value = {addThousandsSeparator(
                            dashboardData?.charts?.choreDistribution?.InProgress || 0
                        )}
                        color="bg-primary/50"
                    />

                    <InfoCard
                        label="Completed Chores"
                        value = {addThousandsSeparator(
                            dashboardData?.charts?.choreDistribution?.Completed || 0
                        )}
                        color="bg-primary/25"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-4 md:my-6">

                <div>
                    <div className="card">
                        <div className="flex items-center justify-between">
                            <h5 className="font-medium">Chore Distribution</h5>
                        </div>

                        <CustomPieChart
                            data={pieChartData}
                            colors={COLORS}
                        />
                    </div>
                </div>

                <div>
                    <div className="card">
                        <div className="flex items-center justify-between">
                            <h5 className="font-medium">Chore Priority Levels</h5>
                        </div>

                        <CustomBarChart
                            data={barChartData}
                        />
                    </div>
                </div>

                <div className="md:col-span-2">
                    <div className="card">
                        <div className="flex items-center justify-between">
                            <h5 className="text-lg">Recent Chores</h5>

                            <button className="card-btn" onClick={onSeeMore}>
                                See All<LuArrowRight className="text-base" />
                            </button>
                        </div>

                        <ChoreListTable tableData={dashboardData?.recentChores || []} />
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default UserDashboard;