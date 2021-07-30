import dbConnect from "../../../utils/dbConnect";
import {PrmContactModel} from "../../../models/PrmContact";
import {getSession} from "next-auth/client";
import {ssr404, ssrRedirect} from "../../../utils/apiConstants";
import {PrmUserModel} from "../../../models/PrmUser";
import cleanForJSON from "../../../utils/cleanForJSON";
import {DatedObj, PrmContactObj, PrmNoteObj} from "../../../utils/types";
import DarkWrapper from "../../../components/DarkWrapper";
import Container from "../../../components/Container";
import KeyboardButton from "../../../components/KeyboardButton";
import * as mongoose from "mongoose";
import {addMinutes, format} from "date-fns";
import SEO from "../../../components/SEO";
import {useEffect, useState} from "react";
import Mousetrap from "mousetrap";
import axios from "axios";
import Modal from "../../../components/Modal";
import Cursor from "../../../components/Cursor";
import BigInput from "../../../components/BigInput";
import {useRouter} from "next/router";

export default function ContactPage({thisContact}: {thisContact: DatedObj<PrmContactObj> & {notesArr: DatedObj<PrmNoteObj>[]}}) {
    const router = useRouter();
    const [selectedIndex, setSelectedIndex] = useState<number>(-1);
    const [deleteOpen, setDeleteOpen] = useState<boolean>(false);
    const [deleteLoading, setDeleteLoading] = useState<boolean>(false);
    const [deleteInput, setDeleteInput] = useState<"y" | "n" | "">("");
    const [notes, setNotes] = useState<DatedObj<PrmNoteObj>[]>(thisContact.notesArr);

    useEffect(() => {
        const goDown = () => !deleteOpen && setSelectedIndex(Math.min(notes.length - 1, selectedIndex + 1));
        const goUp = () => !deleteOpen && setSelectedIndex(Math.max(-1, selectedIndex - 1));

        Mousetrap.bind("down", goDown);
        Mousetrap.bind("up", goUp);

        return () => {
            Mousetrap.unbind("down", goDown);
            Mousetrap.unbind("up", goUp);
        }
    }, [selectedIndex, deleteOpen]);

    function onDelete() {
        setDeleteLoading(true);

        if (selectedIndex > -1) {
            axios.delete("/api/note", {
                data: {
                    id: notes[selectedIndex]._id,
                }
            }).then(() => {
                let newNotes = [...notes];
                newNotes.splice(selectedIndex, 1);
                setSelectedIndex(selectedIndex - 1);
                setNotes(newNotes);
                setDeleteInput("");
                setDeleteLoading(false);
                setDeleteOpen(false);
            }).catch(e => {
                setDeleteLoading(false);
                console.log(e);
            });
        } else {
            axios.delete("/api/contact", {
                data: {
                    id: thisContact._id,
                }
            }).then(() => {
                router.push("/app");
            }).catch(e => {
                setDeleteLoading(false);
                console.log(e);
            })
        }
    }

    return (
        <DarkWrapper>
            <SEO title={thisContact.name}/>
            <Container width="4xl" padding={8}>
                <div className="relative">
                    <h1 className="text-5xl my-12">{thisContact.name}</h1>
                    {selectedIndex === -1 && (
                        <div className="h-3 w-3 bg-blue-900 rounded-full absolute -left-8 top-4"/>
                    )}
                </div>
                <div className="flex items-center my-4">
                    {thisContact.tags.map(tag => (
                        <p key={tag} className="mr-4 font-courier font-bold opacity-75">#{tag}</p>
                    ))}
                </div>
                <p className="whitespace-pre-wrap font-courier opacity-50 my-4">{thisContact.description}</p>
                {notes.sort((a, b) => +new Date(b.date) - +new Date(a.date)).map((note, i) => (
                    <div key={note._id} className="my-8 relative">
                        {selectedIndex === i && (
                            <div className="w-3 h-3 bg-blue-900 rounded-full absolute -left-8 top-2"/>
                        )}
                        <div className="flex items-center mb-2">
                            <p>{format(addMinutes(new Date(note.date), new Date().getTimezoneOffset()), "MMMM d, yyyy")}</p>
                            {note.tags.map(tag => (
                                <div key={note._id + tag} className="opacity-50 ml-2"><span>#{tag}</span></div>
                            ))}
                        </div>
                        <p className="whitespace-pre-wrap leading-6 opacity-50 font-courier">{note.description}</p>
                    </div>
                ))}
                <Modal isOpen={deleteOpen} setIsOpen={(d: boolean) => !deleteLoading && setDeleteOpen(d)}>
                    <p>Are you sure you want to delete this {selectedIndex > -1 ? "note" : "contact"}? (y/n)</p>
                    {deleteLoading ? (
                        <p className="my-4">Loading...</p>
                    ) : (
                        <div className="grid my-4" style={{gridTemplateColumns: "36px 1fr"}}>
                            <Cursor match={true}/>
                            <BigInput value={deleteInput} setValue={(d: string) => {
                                const inputLowercase = d.toLowerCase();
                                if (inputLowercase !== "y" && inputLowercase !== "n" && inputLowercase !== "") return;
                                setDeleteInput(inputLowercase);
                            }} placeholder="y/n" onKeyDown={e => {
                                if (e.key === "Enter") {
                                    if (deleteInput === "y") onDelete();
                                    else if (deleteInput === "n") {
                                        setDeleteInput("");
                                        setDeleteOpen(false);
                                    }
                                }
                            }} autoFocus={true}/>
                        </div>
                    )}
                </Modal>
                <div className="flex fixed top-0 left-4 h-16">
                    <KeyboardButton keyName="esc" label="Back" keyLabel="Esc" href="/app/g"/>
                    <KeyboardButton
                        keyName="e"
                        keyLabel="E"
                        label={`Edit ${selectedIndex > -1 ? "note" : ""}`}
                        href={`/app/e${selectedIndex > -1 ? "n" : "c"}/${selectedIndex > -1 ? notes[selectedIndex]._id : thisContact._id}`}
                    />
                    <KeyboardButton keyName="del" keyLabel="Del" label={`Delete ${selectedIndex > -1 ? "note" : ""}`} onClick={() => setDeleteOpen(true)}/>
                    <KeyboardButton keyName="n" keyLabel="N" label="New note" href={`/app/n?contactId=${thisContact._id}`}/>
                </div>
            </Container>
        </DarkWrapper>
    )
}

export const getServerSideProps = async ({req, params}) => {
    const session = await getSession({req});
    if (!session) return ssrRedirect("/");

    try {
        await dbConnect();

        const thisUser = await PrmUserModel.findOne({email: session.user.email});

        if (!thisUser) return ssrRedirect("/auth/newaccount");

        const thisContact = await PrmContactModel.aggregate([
            {
                $match: {
                    prmUserId: mongoose.Types.ObjectId(thisUser._id),
                    _id: mongoose.Types.ObjectId(params.prmContactId),
                }
            },
            {
                $lookup: {
                    from: "prm_notes",
                    foreignField: "prmContactId",
                    localField: "_id",
                    as: "notesArr",
                },
            },
        ]);

        if (!(thisContact && thisContact.length)) return ssr404;

        return {props: {thisContact: cleanForJSON(thisContact[0])}};
    } catch (e) {
        console.log(e);
        return ssr404;
    }
}