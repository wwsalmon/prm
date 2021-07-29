import DarkWrapper from "../../components/DarkWrapper";
import Container from "../../components/Container";
import {useEffect, useRef, useState} from "react";
import BigInput from "../../components/BigInput";
import TextInput from "react-autocomplete-input";
import {useRouter} from "next/router";
import Mousetrap from "mousetrap";
import {GetServerSideProps} from "next";
import {getSession} from "next-auth/client";
import axios from "axios";

const Cursor = ({match, className}: {match: boolean, className?: string}) => (
    <span className={"text-2xl text-white whitespace-pre-wrap -mt-1 " + (match ? "" : "opacity-75 ") + (className || "")}>&gt;  </span>
);

export default function C({}: {}) {
    const router = useRouter();
    const [name, setName] = useState<string>("");
    const [tags, setTags] = useState<string>("");
    const [links, setLinks] = useState<string>("");
    const tagsRef = useRef(null);
    const nameRef = useRef(null);
    const linksRef = useRef(null);
    const [focused, setFocused] = useState<"name" | "tags" | "links">("name");
    const [isLoading, setIsLoading] = useState<boolean>(false);

    useEffect(() => {
        const goHome = () => {
            router.push("/app");
        }

        Mousetrap.bind("esc", goHome);

        return () => Mousetrap.unbind("Escape", goHome);
    }, []);

    function onSubmit() {
        if (!name) return;

        setIsLoading(true);

        axios.post("/api/contact", {
            name: name,
            tags: tags,
            description: links,
        }).then(res => {
            console.log(res);
            setIsLoading(false);
            router.push(`/c/${res.data.data._id}`);
        }).catch(e => {
            console.log(e);
            setIsLoading(false);
        });
    }

    return (
        <DarkWrapper>
            <Container width="4xl" className="py-12" padding={8}>
                <div className="grid" style={{gridTemplateColumns: "36px 1fr"}}>
                    <Cursor match={true} className="font-bold"/>
                    <p className="text-2xl font-courier font-bold">New contact</p>
                    <Cursor match={focused === "name"}/>
                    <BigInput
                        value={name}
                        setValue={setName}
                        placeholder="Name"
                        onKeyDown={e => {
                            if ((e.key === "Enter" || e.key === "ArrowDown") && tagsRef.current) {
                                tagsRef.current.refInput.current.focus();
                            } else if (e.key === "Escape") {
                                router.push("/app");
                            }
                        }}
                        autoFocus={true}
                        ref={nameRef}
                        onFocus={() => setFocused("name")}
                        className={"" + ((focused === "name") ? "" : "opacity-75")}
                    />
                    <Cursor match={focused === "tags"}/>
                    <TextInput
                        options={{"#": ["friend", "work", "school"].filter(d => !tags.includes(d))}}
                        trigger={["#"]}
                        Component="input"
                        className={"bg-gray-900 w-full focus:outline-none text-2xl font-courier " + ((focused === "tags") ? "" : "opacity-75")}
                        placeholder="Tags"
                        value={tags}
                        onChange={value => setTags(value)}
                        ref={tagsRef}
                        onKeyDown={e => {
                            if (e.key === "Enter") {
                                e.preventDefault();
                                linksRef.current && linksRef.current.focus();
                            } else if (e.key === "ArrowUp") {
                                nameRef.current && nameRef.current.focus();
                            } else if (e.key === "Escape") {
                                router.push("/app");
                            }
                        }}
                        onFocus={() => setFocused("tags")}
                    />
                    <Cursor match={focused === "links"}/>
                    <div className="grid text-2xl font-courier">
                        <textarea
                            className={"w-full bg-gray-900 text-white resize-none overflow-hidden focus:outline-none "  + ((focused === "links") ? "" : "opacity-75")}
                            ref={linksRef}
                            value={links}
                            onChange={e => setLinks(e.target.value)}
                            style={{gridArea: "1 / 1 / 2 / 2"}}
                            placeholder="Links"
                            onKeyDown={e => {
                                if (e.ctrlKey && e.key === "Enter") {
                                    linksRef.current.blur();
                                    onSubmit();
                                } else if (e.key === "Escape") {
                                    router.push("/app");
                                }
                            }}
                            onFocus={() => setFocused("links")}
                            rows={1}
                        />
                        <div style={{gridArea: "1 / 1 / 2 / 2"}} className="invisible whitespace-pre-wrap"><span>{links} </span></div>
                    </div>
                </div>
                {isLoading && (
                    <p className="ml-9 opacity-75 mt-4">Saving...</p>
                )}
                {(focused === "links" && !isLoading) && (
                    <p className="ml-9 opacity-75 mt-4">{name ? "Ctrl + Enter to save" : "Missing name"}</p>
                )}
            </Container>
        </DarkWrapper>
    );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
    const session = await getSession(context);

    if (!session) return {redirect: {permanent: false, destination: "/"}};

    return {props: {}};
}