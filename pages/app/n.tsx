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
import NoteEditor from "../../components/NoteEditor";

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
                <NoteEditor thisUser={thisUser} thisContact={thisContact}/>
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