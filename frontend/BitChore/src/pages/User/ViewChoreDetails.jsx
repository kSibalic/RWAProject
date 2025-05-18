import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import moment from 'moment';
import AvatarGroup from '../../components/AvatarGroup';
import { LuSquareArrowOutUpRight } from 'react-icons/lu';

const ViewChoreDetails = () => {

    const { id } = useParams();
    const [chore, setChore] = useState(null);

    const getStatusTagColor = (status) => {
        switch(status) {
            case "In Progress":
                return "text-[#C499F3] bg-[#C499F3]/20 border border-[#C499F3]/30";

            case "Completed":
                return "text-[#33186B] bg-[#33186B]/10 border border-[#33186B]/20";

            default:
                return "text-[#F2AFEF] bg-[#F2AFEF]/30 border border-[#F2AFEF]/40";
        }
    };

    const getChoreDetailsByID = async() => {
        try {
            const response = await axiosInstance.get(API_PATHS.CHORES.GET_CHORE_BY_ID(id));

            if(response.data) {
                const choreInfo = response.data;
                setChore(choreInfo);
            }
        } catch(error) {
            console.error("Error fetching users: ", error);
        }
    };

    const updateTodoChecklist = async(index) => {
        const todoChecklist = [...chore?.todoChecklist];
        const choreId = id;

        if(todoChecklist && todoChecklist[index]) {
            todoChecklist[index].completed = !todoChecklist[index].completed;

            try {
                const response = await axiosInstance.put(API_PATHS.CHORES.UPDATE_TODO_CHECKLIST(choreId), { todoChecklist });

                if (response.status === 200) {
                    setChore(response.data?.chore || chore);
                } else {
                    todoChecklist[index].completed = !todoChecklist[index].completed;
                }
            } catch {
                todoChecklist[index].completed = !todoChecklist[index].completed;
            }
        }
    }; 

    const handleLinkClick = (link) => {
        if(!/^https?:\/\//i.test(link)) {
             link = "https://" + link;
        }

        window.open(link, "_blank");
    };

    useEffect(() => {
        if (id) {
            getChoreDetailsByID();
        }
        return () => {};
    }, [id]);

    return (
        <DashboardLayout activeMenu='My Chores'>
            <div className="mt-5">
                {chore && (
                    <div className="grid grid-cols-1 md:grid-cols-4 mt-4">
                        <div className="form-card col-span-3">
                            <div className="flex items-center justify-between">
                                <h2 className="text-sm md:text-xl font-medium text-primary">{chore?.title}</h2>

                                <div
                                    className={`text-[11px] md:text-[13px] font-medium ${getStatusTagColor(chore?.status)} px-4 py-0.5 rounded`}
                                >
                                    {chore?.status}
                                </div>
                            </div>

                            <div className="mt-4">
                                <InfoBox label="Description" value={chore?.description} />
                            </div>

                            <div className="grid grid-cols-12 gap-4 mt-4">
                                <div className="col-span-6 md:col-span-4">
                                    <InfoBox label="Priority" value={chore?.priority} />
                                </div>
                                <div className="col-span-6 md:col-span-4">
                                    <InfoBox 
                                        label="Due Date" 
                                        value={ chore?.dueDate ? moment(chore?.dueDate).format("Do MMM YYYY") : "N/A" }
                                    />
                                </div>
                                <div className="col-span-6 md:col-span-4">
                                    <label className="text-xs font-medium text-slate-500">Assigned To</label>

                                    <AvatarGroup
                                        avatars={ chore?.assignedTo?.map((item) => item?.profileImageUrl) || [] }
                                        maxVisible={5}
                                    />
                                </div>
                            </div>

                            <div className="mt-2">
                                <label className="text-xs font-medium text-slate-500">To Do Checklist</label>

                                {chore?.todoChecklist?.map((item, index) => (
                                    <TodoCheckList
                                        key={`todo_${index}`}
                                        text={item.text}
                                        isChecked={item?.completed}
                                        onChange={() => updateTodoChecklist(index)}
                                    />
                                ))}
                            </div>

                            {chore?.attachments?.length > 0 && (
                                <div className="mt-2">
                                    <label className="text-xs font-medium text-slate-500">Attachments</label>

                                    {chore?.attachments?.map((link, index) => (
                                        <Attachment
                                            key={`link_${index}`}
                                            link={link}
                                            index={index}
                                            onClick={() => handleLinkClick(link)}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div> 
                )}
            </div>
        </DashboardLayout>
    );
};

export default ViewChoreDetails;

const InfoBox = ({ label, value }) => {
    return (
        <>
            <label className="text-xs font-medium text-slate-500">{label}</label>

            <p className="text-[12px] md:text-[13px] font-medium text-gray-700 mt-0.5">{value}</p>
        </>
    );
};

const TodoCheckList = ({ text, isChecked, onChange }) => {
    return <div className="flex items-center gap-3 p-3">
        <input 
            type="checkbox"
            checked={isChecked}
            onChange={onChange}
            className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded-sm outline-none cursor-pointer"
        />

        <p className="text-[13px] text-gray-800">{text}</p>
    </div>
};

const Attachment = ({ link, index, onClick }) => {
    return <div
        className="flex justify-between bg-gray-50 border border-gray-100 px-3 py-2 rounded-md mb-3 mt-2 cursor-pointer"
        onClick={onClick}
    >
        <div className="flex-1 flex items-center gap-3">
            <span className="text-xs text-gray-400 font-semibold mr-2">
                {index < 9 ? `0${index + 1}` : index + 1}
            </span>

            <p className="text-xs text-black">{link}</p>
        </div>

        <LuSquareArrowOutUpRight className="text-gray-400" />
    </div>
};