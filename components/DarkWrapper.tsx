import {ReactNode} from "react";

export default function DarkWrapper({children, className}: { children: ReactNode, className?: string }) {
    return (
        <div className={"w-full bg-gray-900 text-white " + (className || "")} style={{minHeight: "calc(100vh - 64px)"}}>
            {children}
        </div>
    );
}