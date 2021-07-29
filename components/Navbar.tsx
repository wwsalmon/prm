import {signOut, useSession} from "next-auth/client";
import Button from "./Button";
import Container from "./Container";
import {useRouter} from "next/router";
import Link from "next/link";

export default function Navbar() {
    const [session, loading] = useSession();
    const router = useRouter();

    return (
        <div className="w-full sticky top-0 bg-gray-900 text-white">
            <Container className="flex items-center h-16" width="full" padding={8}>
                {router.route.substr(0, 5) === "/app/" && (
                    <Link href="/app">
                        <a className="flex items-center h-full -mx-8 px-8 hover:bg-blue-900">
                            <div className="w-10 h-10 border border-white rounded text-xs flex items-center justify-center">
                                <span>Esc</span>
                            </div>
                            <p className="ml-4 font-courier">Back</p>
                        </a>
                    </Link>
                )}
                <div className="ml-auto flex items-center">
                    {session ? (
                        <>
                            <Button onClick={signOut} className="mr-4">Sign out</Button>
                            <img
                                src={session.user.image}
                                alt={`Profile picture of ${session.user.name}`}
                                className="w-8 h-8 rounded-full"
                            />
                        </>
                    ) : (
                        <Button href="/auth/signin">Sign in</Button>
                    )}
                </div>
            </Container>
        </div>
    );
}