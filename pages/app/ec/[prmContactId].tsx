import {getSession} from "next-auth/client";
import {ssr404, ssrRedirect} from "../../../utils/apiConstants";
import dbConnect from "../../../utils/dbConnect";
import {PrmUserModel} from "../../../models/PrmUser";
import {PrmContactModel} from "../../../models/PrmContact";
import cleanForJSON from "../../../utils/cleanForJSON";
import DarkWrapper from "../../../components/DarkWrapper";
import SEO from "../../../components/SEO";
import Container from "../../../components/Container";
import ContactEditor from "../../../components/ContactEditor";
import {DatedObj, PrmContactObj, PrmUserObj} from "../../../utils/types";
import KeyboardButton from "../../../components/KeyboardButton";

export default function C({thisUser, thisContact}: {thisUser: DatedObj<PrmUserObj>, thisContact: DatedObj<PrmContactObj>}) {
    return (
        <DarkWrapper>
            <SEO title="Edit contact"/>
            <Container width="4xl" className="py-12" padding={8}>
                <p className="mb-12 text-5xl opacity-25">Edit contact</p>
                <ContactEditor thisUser={thisUser} thisContact={thisContact}/>
                <div className="flex fixed top-0 left-4 h-16">
                    <KeyboardButton keyName="esc" label="Back" keyLabel="Esc" href={`/app/c/${thisContact._id}`}/>
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

        const thisContact = await PrmContactModel.findOne({_id: params.prmContactId});

        if (!thisContact) return ssr404;

        return {props: {thisUser: cleanForJSON(thisUser), thisContact: cleanForJSON(thisContact)}};
    } catch (e) {
        console.log(e);
        return ssr404;
    }
}