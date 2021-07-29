import {NextApiRequest, NextApiResponse} from "next";
import {getSession} from "next-auth/client";
import dbConnect from "../../../utils/dbConnect";
import {PrmUserModel} from "../../../models/PrmUser";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    switch (req.method) {
        case "POST":
            const session = await getSession({req});
            if (!session) return res.status(403);

            if (!(req.body.username)) {
                return res.status(406);
            }

            try {
                await dbConnect();

                await PrmUserModel.create({
                    email: session.user.email,
                    name: session.user.name,
                    image: session.user.image,
                    contactTags: [],
                    noteTags: [],
                });

                return res.status(200).json({message: "Object created"});
            } catch (e) {
                return res.status(500).json({message: e});
            }
        default:
            return res.status(405);
    }
}