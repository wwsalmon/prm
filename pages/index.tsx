import DarkWrapper from "../components/DarkWrapper";
import {GetServerSideProps} from "next";
import {getSession, signIn} from "next-auth/client";

export default function Home() {
    return (
        <DarkWrapper className="flex items-center justify-center">
            <button
                className="border border-white flex items-center p-4 rounded-lg -mt-8 hover:bg-blue-900 hover:border-transparent"
                onClick={() => signIn("google")}
            >
                Sign in
            </button>
        </DarkWrapper>
    );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
    const session = await getSession(context);

    if (session) return {redirect: {permanent: false, destination: "/app"}};

    return {props: {}};
}