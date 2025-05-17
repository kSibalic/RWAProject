import React, { useEffect, useState } from 'react'
import DashboardLayout from '../../components/layouts/DashboardLayout'
import { PRIORITY_DATA } from '../../utils/data';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import toast from "react-hot-toast";
import { useLocation, useNavigate } from 'react-router-dom';
import moment from 'moment';
import { LuTrash2 } from 'react-icons/lu';
import SelectDropdown from '../../components/Inputs/SelectDropdown';
import SelectUsers from '../../components/Inputs/SelectUsers';
import TodoListInput from '../../components/Inputs/TodoListInput';
import AddAttachmentsInput from '../../components/Inputs/AddAttachmentsInput';
import DeleteAlert from '../../components/DeleteAlert';
import Modal from '../../components/Modal';

const CreateChore = () => {

    const location = useLocation();
    const { choreId } = location.state || {};
    const navigate = useNavigate();

    const [choreData, setChoreData] = useState({
        title: "",
        description: "",
        priority: "Low",
        dueDate: null,
        assignedTo: [],
        todoChecklist: [],
        attachments: [],
    });

    const [currentChore, setCurrentChore] = useState(null);

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const [openDeleteAlert, setOpenDeleteAlert] = useState(false);

    const handleValueChange = (key, value) => {
        setChoreData((prevData) => ({ ...prevData, [key]: value }));
    };

    const clearData = () => {
        setChoreData({
            title: "",
            description: "",
            priority: "Low",
            dueDate: null,
            assignedTo: [],
            todoChecklist: [],
            attachments: []
        });
    };

    const createChore = async () => {
        setLoading(true);
        setError("");

        try {
            const todolist = choreData.todoChecklist?.map((item) => ({
                text: item,
                completed: false,
            }));

            const payload = {
                ...choreData,
                dueDate: choreData.dueDate ? new Date(choreData.dueDate).toISOString() : null,
                todoChecklist: todolist,
            };

            const response = await axiosInstance.post(API_PATHS.CHORES.CREATE_CHORE, payload);

            toast.success("Chore Created Successfully!");
            clearData();
            } catch (err) {
                console.error("Error while creating Chore:", err.response?.data || err.message);
                toast.error("Something went wrong while creating the chore.");
                setError("Server error occurred.");
            } finally {
                setLoading(false);
            }
    };

    const updateChore = async () => {
        setLoading(true);

        try {
            const todoList = choreData.todoChecklist?.map((item) => {
                const prevTodoChecklist = currentChore?.todoChecklist || [];
                const matchedChore = prevTodoChecklist.find((chore) => chore.text == item);

                return {
                    text: item,
                    completed: matchedChore ? matchedChore.completed : false,
                };
            });

            const response = await axiosInstance.put(API_PATHS.CHORES.UPDATE_CHORE(choreId), {
                ...choreData,
                dueDate: new Date(choreData.dueDate).toISOString(),
                todoChecklist: todoList,
            });

            toast.success("Chore Updated Successfully");
        } catch(error) {
            console.error("Error updating chore: ", error);
            setLoading(false);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        setError(null);

        if (!choreData.title.trim()) {
            setError("Title field if empty. Title is required!");
            return;
        }

        if (!choreData.description.trim()) {
            setError("Description field is empty. Description is required!");
            return;
        }

        if (!choreData.dueDate) {
            setError("Due date is not selected. Due date is required!");
            return;
        }

        if (choreData.assignedTo?.length === 0) {
            setError("Chore is not assigned to any members. Chores will not solve themselves!");
            return;
        }

        if (choreData.todoChecklist?.length === 0) {
            setError("There are no chores to do. Add at least one chore!");
            return;
        }

        if (choreId) {
            updateChore();
            return;
        }

        createChore();
    };

    const getChoreDetailsByID = async () => {
        try {
            const response = await axiosInstance.get(API_PATHS.CHORES.GET_CHORE_BY_ID(choreId));

            if(response.data) {
                const choreInfo = response.data;
                setCurrentChore(choreInfo);

                setChoreData((prevState) => ({
                    title: choreInfo.title,
                    description: choreInfo.description,
                    priority: choreInfo.priority,
                    dueDate: choreInfo.dueDate ? moment(choreInfo.dueDate).format("YYYY-MM-DD") : null,
                    assignedTo: choreInfo?.assignedTo?.map((item) => item?._id) || [],
                    todoChecklist: choreInfo?.todoChecklist?.map((item) => item?.text) || [],
                    attachments: choreInfo?.attachments || [],
                }));
            }
        } catch (error) {
            console.error("Error fetching users: ", error);
        }
    };

    const deleteChore = async () => {
        try {
            await axiosInstance.delete(API_PATHS.CHORES.DELETE_CHORE(choreId));

            setOpenDeleteAlert(false);
            toast.success("Chore Deleted Successfully!");
            navigate('/admin/chores');
        } catch(error) {
            console.error("Error deleting chore: ", error.response?.data?.message || error.message);
        }
    };


    useEffect(() => {
        if(choreId) {
            getChoreDetailsByID(choreId);
        }

        return () => {};
    }, [choreId]);

    return (
        <DashboardLayout activeMenu="Create Chore">
            <div className="mt-5">
                <div className="grid grid-cols-1 md:grid-cols-4 mt-4">
                    <div className="form-card col-span-3">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl md:text-xl font-medium text-primary">
                                {choreId ? "Update Chore" : "Create Chore"}
                            </h2>

                            {choreId && (
                                <button
                                    className="flex items-center gap-1.5 text-[13px] font-medium text-rose-500 bg-rose-50 rounded px-2 py-1 border border-rose-100 hover:border-rose-300 cursor-pointer"
                                    onClick={() => setOpenDeleteAlert(true)}
                                >
                                    <LuTrash2 className="text-base" /> Delete
                                </button>
                            )}
                        </div>

                        <div className="mt-4">
                            <label className="text-xs font-medium text-slate-600">Chore Title</label>

                            <input
                                placeholder="Provide Chore Title, e.g. Create App UI"
                                className="form-input"
                                value={choreData.title}
                                onChange={({ target }) =>
                                    handleValueChange("title", target.value)
                                }
                            />
                        </div>

                        <div className="mt-3">
                            <label className="text-xs font-medium text-slate-600">Description</label>

                            <textarea
                                placeholder="Provide Chore Description"
                                className="form-input"
                                rows={4}
                                value={choreData.description}
                                onChange={({ target }) =>
                                    handleValueChange("description", target.value)
                                }
                            />
                        </div>

                        <div className="grid grid-cols-12 gap-4 mt-2">
                            <div className="col-span-6 md:col-span-4">
                                <label className="text-xs font-medium text-slate-600">Priority</label>

                                <SelectDropdown
                                    options={PRIORITY_DATA}
                                    value={choreData.priority}
                                    onChange={(value) => handleValueChange("priority", value)}
                                    placeholder="Choose Chore Priority"
                                />
                            </div>

                            <div className="col-span-6 md:col-span-4"> 
                                <label className="text-xs font-medium text-slate-600">Due Date</label>

                                <input 
                                    placeholder="Create App UI"
                                    className="form-input"
                                    value={choreData.dueDate}
                                    onChange={({ target }) =>
                                        handleValueChange("dueDate", target.value)
                                    }
                                    type="date"
                                />
                            </div>

                            <div className="col-span-12 md:col-span-3">
                                <label className="text-xs font-medium text-slate-600">
                                    Assign Chore To
                                </label>

                                <SelectUsers
                                    selectedUsers={choreData.assignedTo}
                                    setSelectedUsers={(value) => {
                                        handleValueChange("assignedTo", value);
                                    }}
                                />
                            </div>
                        </div>

                        <div className="mt-3">
                            <label className="text-xs font-medium text-slate-600">To Do Checklist</label>

                            <TodoListInput 
                                todoList={choreData?.todoChecklist}
                                setTodoList={ (value) => handleValueChange("todoChecklist", value) }
                            />
                        </div>

                        <div className="mt-3">
                            <label className="text-xs font-medium text-slate-600">Add Attachments</label>

                            <AddAttachmentsInput
                                attachments={choreData?.attachments}
                                setAttachments={(value) => handleValueChange("attachments", value) }
                            />
                        </div>

                        {error && (
                            <p className="text-xs font-medium text-red-500 mt-5">{error}</p>
                        )}

                        <div className="flex justify-end mt-7">
                            <button
                                className="add-btn"
                                onClick={handleSubmit}
                                disabled={loading}
                            >
                                {choreId ? "UPDATE CHORE" : "CREATE CHORE"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <Modal
                isOpen={openDeleteAlert}
                onClose={() => setOpenDeleteAlert(false)}
                title="Delete Chore"
            >
                <DeleteAlert
                    content="Are you sure you want to delete this chore?"
                    onDelete={() => deleteChore()}
                />
            </Modal>
        </DashboardLayout>
    );
};

export default CreateChore;