import {NextApiHandler} from "next";
import nextApiEndpoint from "../../utils/nextApiEndpoint";
import {res200, res400, res403, res500} from "../../utils/apiConstants";
import {PrmNoteModel} from "../../models/PrmNote";
import {PrmContactModel} from "../../models/PrmContact";
import splitTags from "../../utils/splitTags";
import {PrmUserModel} from "../../models/PrmUser";

const handler: NextApiHandler = nextApiEndpoint(
    async function getFunction(req, res, session, thisUser) {

    },
    async function postFunction(req, res, session, thisUser) {
        // if id, then update, else create new
        if (req.body.id) {
            if (!(req.body.tags || req.body.description || req.body.date)) return res400(res);
        } else {
            if (!(req.body.contactId && req.body.date)) return res400(res);

            const thisContact = await PrmContactModel.findOne({_id: req.body.contactId});

            if (!thisContact) return res500(res, new Error("No contact found for given ID"));

            if (thisContact.prmUserId.toString() !== thisUser._id.toString()) return res403(res);

            let tags = [];

            if (req.body.tags) {
                tags = splitTags(req.body.tags);

                if (tags.length) {
                    await PrmUserModel.updateOne({email: session.user.email}, {
                        $addToSet: {noteTags: {$each: tags}}
                    });
                }
            }

            const thisNote = await PrmNoteModel.create({
                prmContactId: req.body.contactId,
                date: new Date(req.body.date),
                tags: tags,
                description: req.body.description || "",
            });

            return res200(res, {data: thisNote});
        }
    },
    async function deleteFunction(req, res, session) {

    },
);

export default handler;