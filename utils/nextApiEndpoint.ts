import {NextApiHandler, NextApiRequest, NextApiResponse} from "next";
import {getSession} from "next-auth/client";
import dbConnect from "./dbConnect";
import {Session} from "next-auth";
import {res403, res405, res500} from "./apiConstants";
import {PrmUserModel} from "../models/PrmUser";
import {DatedObj, PrmUserObj} from "./types";

export type MethodFunction = (req: NextApiRequest, res: NextApiResponse, session: Session, thisUser?: DatedObj<PrmUserObj>) => any;

export default function nextApiEndpoint(
    getFunction: MethodFunction,
    postFunction: MethodFunction,
    deleteFunction: MethodFunction,
): NextApiHandler {
    const handler: NextApiHandler = async (req, res) => {
        const session = await getSession({req});

        if (!session) return res403(res);

        try {
            await dbConnect();

            const thisUser = await PrmUserModel.findOne({email: session.user.email});
            if (!thisUser) return res500(res, new Error("User not found"));

            switch (req.method) {
                case "GET": {
                    return await getFunction(req, res, session, thisUser);
                }
                case "POST": {
                    return await postFunction(req, res, session, thisUser);
                }
                case "DELETE": {
                    return await deleteFunction(req, res, session, thisUser);
                }
                default: {
                    return res405(res);
                }
            }
        } catch (e) {
            console.log(e);

            return res500(res, e);
        }
    }

    return handler;
}