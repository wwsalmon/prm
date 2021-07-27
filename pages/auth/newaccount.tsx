import {GetServerSideProps} from "next";
import {getSession, signIn, useSession} from "next-auth/client";
import axios from "axios";
import {useRouter} from "next/router";
import {useState} from "react";
import SEO from "../../components/SEO";
import Skeleton from "react-loading-skeleton";
import SpinnerButton from "../../components/SpinnerButton";
import {PrmUserModel} from "../../models/PrmUser";
import dbConnect from "../../utils/dbConnect";

export default function NewAccount() {
    return <></>;
}

export const getServerSideProps: GetServerSideProps = async (context) => {
    const session = await getSession(context);

    if (!session) return {redirect: {permanent: false, destination: "/auth/signin"}};

    try {
        await dbConnect();

        const thisUser = await PrmUserModel.findOne({email: session.user.email});

        if (!thisUser) {
            await PrmUserModel.create({
                email: session.user.email,
                image: session.user.image,
                name: session.user.name,
            });
        }

        return {redirect: {permanent: false, destination: "/app"}};
    } catch (e) {
        console.log(e);
        return {notFound: true};
    }
};