import React from "react";
import moment from 'moment';

const ChoreListTable = ({tableData}) => {

    const getStatusBadgeColor = (status) => {
        switch (status) {
            case 'Completed': 
                return 'bg-[#33186B]/10 text-[#33186B] border border-[#33186B]/20';
            case 'Pending': 
                return 'bg-[#F2AFEF]/30 text-[#F2AFEF] border border-[#F2AFEF]/40';
            case 'In Progress': 
                return 'bg-[#C499F3]/20 text-[#C499F3] border border-[#C499F3]/30';
            default: 
                return 'bg-gray-100 text-gray-500 border border-gray-200';
    }

    };

    const getPriorityBadgeColor = (priority) => {
        switch (priority) {
            case 'High': return 'bg-red-100 text-red-500 border border-red-200';
            case 'Medium': return 'bg-orange-100 text-orange-500 border border-orange-200';
            case 'Low': return 'bg-yellow-100 text-yellow-500 border border-yellow-200';
            default: return 'bg-gray-100 text-gray-500 border border-gray-200';
        }
    }

    return (
        <div className="overflow-x-auto p-0 rounded-lg mt-3">
            <table className="min-w-full">
                <thead>
                    <tr className="text-left">
                        <th className="py-3 px-4 text-gray-800 font-medium text-[13px]">Name</th>
                        <th className="py-3 px-4 text-gray-800 font-medium text-[13px]">Status</th>
                        <th className="py-3 px-4 text-gray-800 font-medium text-[13px]">Priority</th>
                        <th className="py-3 px-4 text-gray-800 font-medium text-[13px] hidden md:table-cell">Created On</th>
                    </tr>
                </thead>
                <tbody>
                    {tableData.map((chore) => (
                        <tr key={chore._id} className="border-t border-gray-200">
                            <td className="my-3 mx-4 text-gray-700 text-[13px] line-clamp-1 overflow-hidden">{chore.title}</td>
                            <td className="py-4 px-4">
                                <span className={`px-2 py-1 text-xs rounded inline-block ${getStatusBadgeColor(chore.status)}`}>{chore.status}</span>
                            </td>
                            <td className="py-4 px-4">
                                <span className={`px-2 py-1 text-xs rounded inline-block ${getPriorityBadgeColor(chore.priority)}`}>{chore.priority}</span>
                            </td>
                            <td className="py-4 px-4 text-gray-700 text-[13px] text-nowrap hidden md:table-cell">{chore.createdAt ? moment(chore.createdAt).format('Do MMM YYYY') : 'N/A'}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

export default ChoreListTable