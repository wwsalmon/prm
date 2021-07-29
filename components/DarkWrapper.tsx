import {ReactNode, useEffect} from "react";
import {useRouter} from "next/router";
import Mousetrap from "mousetrap";

export default function DarkWrapper({children, className}: { children: ReactNode, className?: string }) {
    const router = useRouter();

    useEffect(() => {
        const goHome = () => {
            router.push("/app");
        }

        const goBack = () => router.back();

        Mousetrap.bind("backspace", goBack);

        if (router.route.substr(0, 5) === "/app/") Mousetrap.bind("esc", goHome);

        return () => {
            Mousetrap.unbind("backspace", goBack);
            Mousetrap.unbind("esc", goHome);
        }
    }, []);

    return (
        <div className={"w-full bg-gray-900 text-white py-1 " + (className || "")} style={{minHeight: "calc(100vh - 64px)"}}>
            {children}
        </div>
    );
}