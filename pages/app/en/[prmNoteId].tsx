import {getSession} from "next-auth/client";
import {ssr404, ssrRedirect} from "../../../utils/apiConstants";
import dbConnect from "../../../utils/dbConnect";
import {PrmUserModel} from "../../../models/PrmUser";
import cleanForJSON from "../../../utils/cleanForJSON";
import {DatedObj, PrmContactObj, PrmNoteObj, PrmUserObj} from "../../../utils/types";
import {PrmNoteModel} from "../../../models/PrmNote";
import mongoose from "mongoose";
import DarkWrapper from "../../../components/DarkWrapper";
import SEO from "../../../components/SEO";
import Container from "../../../components/Container";
import KeyboardButton from "../../../components/KeyboardButton";
import NoteEditor from "../../../components/NoteEditor";

export default function EditContact({thisUser, thisNoteWithContact}: {thisUser: DatedObj<PrmUserObj>, thisNoteWithContact: DatedObj<PrmNoteObj & {contactsArr: DatedObj<PrmContactObj>[]}>}) {
    return (
        <DarkWrapper>
            <SEO title="Edit contact"/>
            <Container width="4xl" className="py-12" padding={8}>
                <p className="mb-12 text-5xl opacity-25">Edit note</p>
                <NoteEditor thisUser={thisUser} thisNoteWithContact={thisNoteWithContact}/>
                <div className="flex fixed top-0 left-4 h-16">
                    <KeyboardButton keyName="esc" label="Back" keyLabel="Esc" href={`/app/c/${thisNoteWithContact.contactsArr[0]._id}`}/>
                </div>
            </Container>
        </DarkWrapper>
    );
}

export const getServerSideProps = async ({req, params}) => {
    const session = await getSession({req});
    if (!session) return ssrRedirect("/");

    try {
        await dbConnect();

        const thisUser = await PrmUserModel.findOne({email: session.user.email});

        if (!thisUser) return ssrRedirect("/auth/newaccount");

        const thisNoteWithContact = await PrmNoteModel.aggregate([
            {
                $match: {
                    _id: mongoose.Types.ObjectId(params.prmNoteId),
                }
            },
            {
                $lookup: {
                    from: "prm_contacts",
                    foreignField: "_id",
                    localField: "prmContactId",
                    as: "contactsArr",
                },
            },
        ]);

        if (!(thisNoteWithContact && thisNoteWithContact.length && thisNoteWithContact[0].contactsArr.length)) return ssr404;

        if (thisNoteWithContact[0].contactsArr[0].prmUserId.toString() !== thisUser._id.toString()) return ssr404;

        return {props: {thisUser: cleanForJSON(thisUser), thisNoteWithContact: cleanForJSON(thisNoteWithContact[0])}};
    } catch (e) {
        console.log(e);
        return ssr404;
    }
}