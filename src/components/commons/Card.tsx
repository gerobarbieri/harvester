import type { FC } from "react";
import { Link } from "react-router";

const Card: FC<{ children: React.ReactNode; to?: string }> = ({ children, to }) => {
    const content = (
        <div className={`
            bg-white rounded-xl shadow-sm p-5 
            transition-all duration-300 ease-in-out mt-6
            ${to ? 'hover:shadow-lg hover:ring-2 hover:ring-green-700/50 hover:-translate-y-1 cursor-pointer' : ''}
        `}>
            {children}
        </div>
    )
    return to ? <Link to={to}>{content}</Link> : content;
};

export default Card;