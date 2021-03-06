import {ReactNode, useEffect} from "react";
import {useRouter} from "next/router";
import Mousetrap from "mousetrap";

export default function DarkWrapper({children, className}: { children: ReactNode, className?: string }) {
    const router = useRouter();

    return (
        <div className={"w-full bg-gray-900 text-white py-1 " + (className || "")} style={{minHeight: "calc(100vh - 64px)"}}>
            {children}
        </div>
    );
}