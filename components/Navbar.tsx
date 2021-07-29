import {signOut, useSession} from "next-auth/client";
import Button from "./Button";
import Container from "./Container";
import {useRouter} from "next/router";
import Link from "next/link";
import KeyboardButton from "./KeyboardButton";

export default function Navbar() {
    const [session, loading] = useSession();
    const router = useRouter();

    return (
        <div className="w-full sticky top-0 bg-gray-900 text-white">
            <Container className="flex items-center h-16" width="full">
                {["/app/c", "/app/g", "/app/n"].includes(router.route) && (
                    <KeyboardButton href="/app" keyName="Escape" keyLabel="Esc" label="Back" navbar={true}/>
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