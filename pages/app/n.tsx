import DarkWrapper from "../../components/DarkWrapper";
import Container from "../../components/Container";
import Cursor from "../../components/Cursor";
import {useEffect, useRef, useState} from "react";
import {GetServerSideProps} from "next";
import {getSession} from "next-auth/client";
import {ssr404, ssrRedirect} from "../../utils/apiConstants";
import dbConnect from "../../utils/dbConnect";
import {PrmUserModel} from "../../models/PrmUser";
import cleanForJSON from "../../utils/cleanForJSON";
import {DatedObj, PrmContactObj, PrmUserObj} from "../../utils/types";
import TextInput from "react-autocomplete-input";
import {useRouter} from "next/router";
import AsyncSelect from "react-select/async";
import axios from "axios";
import {format} from "date-fns";
import {PrmContactModel} from "../../models/PrmContact";
import SEO from "../../components/SEO";

export default function N({thisUser, thisContact}: {thisUser: DatedObj<PrmUserObj>, thisContact?: DatedObj<PrmContactObj>}) {
    const router = useRouter();
    const [focused, setFocused] = useState<"contact" | "tags" | "description" | "date">(thisContact ? "tags" : "contact");
    const [tags, setTags] = useState<string>("");
    const [selectedContact, setSelectedContact] = useState<{label: string, value: string}>(thisContact ? {label: thisContact.name, value: thisContact._id} : null);
    const [description, setDescription] = useState<string>("");
    const [date, setDate] = useState<string>(format(new Date(), "yyyy-MM-dd"));
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const contactRef = useRef(null);
    const tagsRef = useRef(null);
    const descriptionRef = useRef(null);
    const dateRef = useRef(null);

    function onSubmit() {
        if (!selectedContact) return;

        setIsLoading(true);

        axios.post("/api/note", {
            contactId: selectedContact.value,
            tags: tags,
            description: description,
            date: date,
        }).then(() => {
            setIsLoading(false);
            router.push(`/app/c/${selectedContact.value}`);
        }).catch(e => {
            console.log(e);
            setIsLoading(false);
        });
    }

    useEffect(() => {
        if (thisContact && tagsRef.current) tagsRef.current.refInput.current.focus();
    }, [tagsRef.current]);

    return (
        <DarkWrapper>
            <SEO title="New note"/>
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
                                fontSize: 20,
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
                            } else if (e.key === "Escape") {
                                router.push("/app");
                            }
                        }}
                        autoFocus={!thisContact}
                        onFocus={() => setFocused("contact")}
                        value={selectedContact}
                        onChange={(newValue) => setSelectedContact(newValue)}
                    />
                    <Cursor match={focused === "tags"}/>
                    <TextInput
                        options={{"#": thisUser.noteTags.filter(d => !tags.includes(d))}}
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
                                if (e.shiftKey) contactRef.current && contactRef.current.focus();
                                else descriptionRef.current && descriptionRef.current.focus();
                            } else if (e.key === "ArrowUp") {
                                contactRef.current && contactRef.current.focus();
                            } else if (e.key === "Escape") {
                                router.push("/app");
                            }
                        }}
                        onFocus={() => setFocused("tags")}
                    />
                    <Cursor match={focused === "description"}/>
                    <div className="grid text-xl font-courier">
                        <textarea
                            className={"w-full bg-gray-900 text-white resize-none overflow-hidden focus:outline-none "  + ((focused === "description") ? "" : "opacity-75")}
                            ref={descriptionRef}
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            style={{gridArea: "1 / 1 / 2 / 2"}}
                            placeholder="Description"
                            onKeyDown={e => {
                                if (e.key === "Enter") {
                                    if (e.ctrlKey) dateRef.current && dateRef.current.focus();
                                    if (e.shiftKey) tagsRef.current && tagsRef.current.refInput.current.focus();
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
                    <input
                        type="date"
                        ref={dateRef}
                        className={`bg-gray-900 focus:outline-none font-courier text-xl text-white ${focused === "date" ? "" : "opacity-75"}`}
                        onFocus={() => setFocused("date")}
                        value={date}
                        onChange={e => setDate(e.target.value)}
                        onKeyDown={e => {
                            if (e.key === "Enter") {
                                if (e.ctrlKey && !isLoading) {
                                    dateRef.current && dateRef.current.blur();
                                    onSubmit();
                                }
                                if (e.shiftKey) {
                                    e.preventDefault();
                                    descriptionRef.current && descriptionRef.current.focus();
                                }
                            } else if (e.key === "Escape") {
                                router.push("/app");
                            }
                        }}
                    />
                </div>
                {isLoading && (
                    <p className="ml-9 opacity-75 mt-4">Saving...</p>
                )}
                {(focused === "date" && !isLoading) && (
                    <p className="ml-9 opacity-75 mt-4">{selectedContact ? "Ctrl + Enter to save" : "Missing contact"}</p>
                )}
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

        const {contactId} = context.query;

        let thisContact = null;

        if (contactId) {
            thisContact = await PrmContactModel.findOne({_id: contactId.toString()});

            if (!thisContact || (thisContact.prmUserId.toString() !== thisUser._id.toString())) thisContact = null;
        }

        return {props: {thisUser: cleanForJSON(thisUser), thisContact: cleanForJSON(thisContact)}};
    } catch (e) {
        console.log(e);
        return ssr404;
    }
}