import dbConnect from "../../../utils/dbConnect";
import {PrmContactModel} from "../../../models/PrmContact";
import {getSession} from "next-auth/client";
import {ssr404, ssrRedirect} from "../../../utils/apiConstants";
import {PrmUserModel} from "../../../models/PrmUser";
import cleanForJSON from "../../../utils/cleanForJSON";
import {DatedObj, PrmContactObj} from "../../../utils/types";
import DarkWrapper from "../../../components/DarkWrapper";
import Container from "../../../components/Container";
import KeyboardButton from "../../../components/KeyboardButton";

export default function ContactPage({thisContact}: {thisContact: DatedObj<PrmContactObj>}) {
    return (
        <DarkWrapper>
            <Container width="4xl" padding={8}>
                <h1 className="text-5xl my-12">{thisContact.name}</h1>
                <div className="flex items-center my-4">
                    {thisContact.tags.map(tag => (
                        <p className="mr-4 font-courier font-bold opacity-75">#{tag}</p>
                    ))}
                </div>
                <p className="whitespace-pre-wrap font-courier opacity-50 my-4">{thisContact.description}</p>
                <div className="flex fixed top-0 left-4 h-16">
                    <KeyboardButton keyName="Escape" label="Home" keyLabel="Esc" onClick={() => null}/>
                    <KeyboardButton keyName="e" keyLabel="E" label="Edit" onClick={() => null}/>
                    <KeyboardButton keyName="Delete" keyLabel="Del" label="Delete" onClick={() => null}/>
                    <KeyboardButton keyName="n" keyLabel="N" label="New note" onClick={() => null}/>
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

        const thisContact = await PrmContactModel.findOne({
            prmUserId: thisUser._id,
            _id: params.prmContactId,
        });

        if (!thisContact) return ssr404;

        return {props: {thisContact: cleanForJSON(thisContact)}};
    } catch (e) {
        console.log(e);
        return ssr404;
    }
}