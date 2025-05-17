import React from "react";

const Progress = ({ progress, status }) => {
    const getColor = () => {
        switch(status) {
            case 'In Progress':
                return 'text-[#C499F3] bg-[#C499F3]/20 border border-[#C499F3]/30';

            case 'Completed':
                return 'text-[#33186B] bg-[#33186B]/10 border border-[#33186B]/20';

            default:
                return 'text-[#F2AFEF] bg-[#F2AFEF]/30 border border-[#F2AFEF]/40';
        }
    }

    return (
        <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div className={`${getColor()} h-1.5 rounded-full text-center text-xs font-medium`} style={{width: `${progress}%`}}>
            </div>
        </div>
    )
};

export default Progress;