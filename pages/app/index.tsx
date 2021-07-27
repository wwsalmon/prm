import DarkWrapper from "../../components/DarkWrapper";
import Link from "next/link";
import {useEffect} from "react";
import {useRouter} from "next/router";
import Mousetrap from "mousetrap";
import {GetServerSideProps} from "next";
import {getSession} from "next-auth/client";

const ScreenThird = ({letter, label, href}: {letter: string, label: string, href: string}) => (
    <Link href={href}>
        <a className="w-1/3 flex items-center justify-center hover:bg-blue-900 h-full">
            <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-lg border-2 border-white flex items-center text-center">
                    <span className="font-bold w-full text-2xl">{letter}</span>
                </div>
                <p className="font-courier mt-4">{label}</p>
            </div>
        </a>
    </Link>
)

export default function AppHome() {
    const router = useRouter();

    useEffect(() => {
        const goToC = e => {
            e.preventDefault();
            router.push("/app/c");
        };
        const goToN = e => {
            e.preventDefault();
            router.push("/app/n");
        }
        const goToG = e => {
            e.preventDefault();
            router.push("/app/g");
        }

        Mousetrap.bind("c", goToC);
        Mousetrap.bind("n", goToN);
        Mousetrap.bind("g", goToG);

        return () => {
            Mousetrap.unbind("c", goToC);
            Mousetrap.unbind("n", goToN);
            Mousetrap.unbind("g", goToG);
        }
    }, []);

    return (
        <DarkWrapper className="flex">
            <div className="flex w-full">
                <ScreenThird letter="C" label="New contact" href="/app/c"/>
                <ScreenThird letter="N" label="New note" href="/app/n"/>
                <ScreenThird letter="G" label="Go to contact" href="/app/g"/>
            </div>
        </DarkWrapper>
    );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
    const session = await getSession(context);

    if (!session) return {redirect: {permanent: false, destination: "/"}};

    return {props: {}};
}