import DarkWrapper from "../../../components/DarkWrapper";
import Container from "../../../components/Container";
import {GetServerSideProps} from "next";
import {getSession} from "next-auth/client";
import {ssr404, ssrRedirect} from "../../../utils/apiConstants";
import dbConnect from "../../../utils/dbConnect";
import {PrmUserModel} from "../../../models/PrmUser";
import cleanForJSON from "../../../utils/cleanForJSON";
import {DatedObj, PrmUserObj} from "../../../utils/types";
import SEO from "../../../components/SEO";
import ContactEditor from "../../../components/ContactEditor";

export default function C({thisUser}: {thisUser: DatedObj<PrmUserObj>}) {
    return (
        <DarkWrapper>
            <SEO title="New contact"/>
            <Container width="4xl" className="py-12" padding={8}>
                <p className="mb-12 text-5xl opacity-25">New contact</p>
                <ContactEditor thisUser={thisUser}/>
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