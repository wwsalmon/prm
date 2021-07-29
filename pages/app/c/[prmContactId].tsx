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

export default function ContactPage({thisContact}: {thisContact: DatedObj<PrmContactObj> & {notesArr: DatedObj<PrmNoteObj>[]}}) {
    return (
        <DarkWrapper>
            <Container width="4xl" padding={8}>
                <h1 className="text-5xl my-12">{thisContact.name}</h1>
                <div className="flex items-center my-4">
                    {thisContact.tags.map(tag => (
                        <p key={tag} className="mr-4 font-courier font-bold opacity-75">#{tag}</p>
                    ))}
                </div>
                <p className="whitespace-pre-wrap font-courier opacity-50 my-4">{thisContact.description}</p>
                {thisContact.notesArr.map(note => (
                    <div key={note._id} className="my-8">
                        <div className="flex items-center mb-2">
                            <p>{format(addMinutes(new Date(note.date), new Date().getTimezoneOffset()), "MMMM d, yyyy")}</p>
                            {note.tags.map(tag => (
                                <div key={note._id + tag} className="opacity-50 ml-2"><span>#{tag}</span></div>
                            ))}
                        </div>
                        <p className="whitespace-pre-wrap font-courier">{note.description}</p>
                    </div>
                ))}
                <div className="flex fixed top-0 left-4 h-16">
                    <KeyboardButton keyName="Esc" label="Home" keyLabel="Esc" href="/app"/>
                    <KeyboardButton keyName="e" keyLabel="E" label="Edit" onClick={() => null}/>
                    <KeyboardButton keyName="Delete" keyLabel="Del" label="Delete" onClick={() => null}/>
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