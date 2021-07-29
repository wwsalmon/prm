import DarkWrapper from "../../components/DarkWrapper";
import Container from "../../components/Container";
import Cursor from "../../components/Cursor";
import {useRef, useState} from "react";
import {GetServerSideProps} from "next";
import {getSession} from "next-auth/client";
import {ssr404, ssrRedirect} from "../../utils/apiConstants";
import dbConnect from "../../utils/dbConnect";
import {PrmUserModel} from "../../models/PrmUser";
import cleanForJSON from "../../utils/cleanForJSON";
import {DatedObj, PrmUserObj} from "../../utils/types";
import TextInput from "react-autocomplete-input";
import {useRouter} from "next/router";
import AsyncSelect from "react-select/async";
import axios from "axios";

export default function N({thisUser}: {thisUser: DatedObj<PrmUserObj>}) {
    const router = useRouter();
    const [focused, setFocused] = useState<"contact" | "tags" | "description" | "date">("contact");
    const [tags, setTags] = useState<string>("");
    const [description, setDescription] = useState<string>("");

    const contactRef = useRef(null);
    const tagsRef = useRef(null);
    const descriptionRef = useRef(null);
    const dateRef = useRef(null);

    return (
        <DarkWrapper>
            <Container width="4xl" padding={8}>
                <h1 className="text-5xl my-12 opacity-25">
                    New note
                </h1>
                <div className="grid" style={{gridTemplateColumns: "36px 1fr"}}>
                    <Cursor match={focused === "contact"}/>
                    <AsyncSelect
                        cacheOptions={true}
                        loadOptions={(inputValue, callback) => {
                            axios.get(`/api/contact?searchString=${inputValue}`).then(res => {
                                const selectOptions = res.data.data.map(d => ({label: d.name, value: d._id}));
                                callback(selectOptions);
                            });
                        }}
                        styles={{
                            control: () => ({
                                backgroundColor: "rgb(17, 24, 39)",
                                fontFamily: "Courier Prime",
                                fontSize: 24,
                                lineHeight: "32px",
                                opacity: (focused === "contact") ? 1.0 : 0.75,
                            }),
                            valueContainer: () => ({
                                padding: 0,
                            }),
                            dropdownIndicator: () => ({
                                display: "none",
                            }),
                            loadingIndicator: () => ({
                                display: "none",
                            }),
                            indicatorsContainer: () => ({
                                display: "none",
                            }),
                            placeholder: (provided) => ({
                                ...provided,
                                top: 0,
                                transform: "none",
                                color: "#ffffff",
                                opacity: 0.5,
                                margin: 0,
                            }),
                            input: (provided) => ({
                                color: "#ffffff",
                            }),
                            menu: (provided) => ({
                                ...provided,
                                backgroundColor: "#394152",
                            }),
                            option: (provided, {isFocused}) => {
                                let newProvided = {...provided};
                                newProvided.backgroundColor = isFocused ? "rgb(30, 58, 138)" : "transparent";

                                return newProvided;
                            },
                            singleValue: (provided) => ({
                                ...provided,
                                color: "#ffffff",
                                top: 0,
                                transform: "none",
                                margin: 0,
                            }),
                        }}
                        onKeyDown={e => {
                            if (e.key === "Enter") {
                                setFocused("tags");
                                tagsRef.current && tagsRef.current.refInput.current.focus();
                            }
                        }}
                        autoFocus={true}
                        onFocus={() => setFocused("contact")}
                    />
                    <Cursor match={focused === "tags"}/>
                    <TextInput
                        options={{"#": thisUser.noteTags.filter(d => !tags.includes(d))}}
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
                                descriptionRef.current && descriptionRef.current.focus();
                            } else if (e.key === "ArrowUp") {
                                contactRef.current && contactRef.current.focus();
                            } else if (e.key === "Escape") {
                                router.push("/app");
                            }
                        }}
                        onFocus={() => setFocused("tags")}
                    />
                    <Cursor match={focused === "description"}/>
                    <div className="grid text-2xl font-courier">
                        <textarea
                            className={"w-full bg-gray-900 text-white resize-none overflow-hidden focus:outline-none "  + ((focused === "description") ? "" : "opacity-75")}
                            ref={descriptionRef}
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            style={{gridArea: "1 / 1 / 2 / 2"}}
                            placeholder="Description"
                            onKeyDown={e => {
                                if (e.ctrlKey && e.key === "Enter") {
                                    console.log("ctrl + enter");
                                } else if (e.key === "Escape") {
                                    router.push("/app");
                                }
                            }}
                            onFocus={() => setFocused("description")}
                            rows={1}
                        />
                        <div style={{gridArea: "1 / 1 / 2 / 2"}} className="invisible whitespace-pre-wrap"><span>{description} </span></div>
                    </div>
                    <Cursor match={focused === "date"}/>
                    <input type="text" ref={dateRef}/>
                </div>
            </Container>
        </DarkWrapper>
    );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
    const session = await getSession(context);

    if (!session) return ssrRedirect("/");

    try {
        await dbConnect();

        const thisUser = await PrmUserModel.findOne({email: session.user.email});

        if (!thisUser) return ssrRedirect("/auth/newaccount");

        return {props: {thisUser: cleanForJSON(thisUser)}};
    } catch (e) {
        console.log(e);
        return ssr404;
    }
}