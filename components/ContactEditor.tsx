import {useRef, useState} from "react";
import BigInput from "./BigInput";
import TextInput from "react-autocomplete-input";
import {useRouter} from "next/router";
import axios from "axios";
import Cursor from "./Cursor";
import {DatedObj, PrmContactObj, PrmUserObj} from "../utils/types";

export default function ContactEditor({thisUser, thisContact}: {thisUser: DatedObj<PrmUserObj>, thisContact?: DatedObj<PrmContactObj>}) {
    const router = useRouter();
    const [name, setName] = useState<string>(thisContact ? thisContact.name : "");
    const [tags, setTags] = useState<string>(thisContact ? ("#" + thisContact.tags.join(" #")) : "");
    const [links, setLinks] = useState<string>(thisContact ? thisContact.description : "");
    const tagsRef = useRef(null);
    const nameRef = useRef(null);
    const linksRef = useRef(null);
    const [focused, setFocused] = useState<"name" | "tags" | "links">("name");
    const [isLoading, setIsLoading] = useState<boolean>(false);

    function onSubmit() {
        if (!name) return;

        setIsLoading(true);

        let postData = {
            name: name,
            tags: tags,
            description: links,
        }

        if (thisContact) postData["id"] = thisContact._id;

        axios.post("/api/contact", postData).then(res => {
            console.log(res);
            setIsLoading(false);
            router.push(`/app/c/${res.data.data._id || thisContact._id}`);
        }).catch(e => {
            console.log(e);
            setIsLoading(false);
        });
    }

    return (
        <>
            <div className="grid" style={{gridTemplateColumns: "36px 1fr"}}>
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
                    options={{"#": thisUser.contactTags.filter(d => !tags.includes(d))}}
                    trigger={["#"]}
                    Component="input"
                    className={"bg-gray-900 w-full focus:outline-none text-xl font-courier " + ((focused === "tags") ? "" : "opacity-75")}
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
                <div className="grid text-xl font-courier">
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
        </>
    );
}