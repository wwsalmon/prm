import {NextApiHandler} from "next";
import nextApiEndpoint from "../../utils/nextApiEndpoint";
import splitTags from "../../utils/splitTags";
import {res200, res400, res403, res500} from "../../utils/apiConstants";
import {PrmContactModel} from "../../models/PrmContact";
import {PrmUserModel} from "../../models/PrmUser";
import {PrmUserObj} from "../../utils/types";

const handler: NextApiHandler = nextApiEndpoint(
    async function getFunction(req, res, session, thisUser) {
        if (req.query.searchString) {
            const contacts = await PrmContactModel.find({
                prmUserId: thisUser._id,
                name: {$regex: req.query.searchString.toString()},
            });

            return res200(res, {data: contacts});
        }
    },
    async function postFunction(req, res, session, thisUser) {
        // if id, then update, else create new
        if (req.body.id) {
            if (!(req.body.name || req.body.tags || req.body.description)) return res400(res);

            const thisContact = await PrmContactModel.findOne({_id: req.body.id});
            if (thisContact.prmUserId.toString() !== thisUser._id.toString()) return res403(res);

            let updateDoc = {};

            if (req.body.name) updateDoc["name"] = req.body.name;
            if (req.body.description) updateDoc["description"] = req.body.description;
            if (req.body.tags) {
                const tags = splitTags(req.body.tags);

                if (tags.length) {
                    await PrmUserModel.updateOne({email: session.user.email}, {
                        $addToSet: {contactTags: {$each: tags}}
                    });
                }

                updateDoc["tags"] = tags;
            }

            const newContact = await PrmContactModel.updateOne({_id: req.body.id}, updateDoc);

            return res200(res, {data: newContact});
        } else {
            if (!(req.body.name && req.body.tags && req.body.description)) return res400(res);

            const tags = splitTags(req.body.tags);

            if (tags.length) {
                await PrmUserModel.updateOne({email: session.user.email}, {
                    $addToSet: {contactTags: {$each: tags}}
                });
            }

            const thisContact = await PrmContactModel.create({
                prmUserId: thisUser._id,
                name: req.body.name,
                description: req.body.description,
                tags: tags,
            });

            return res200(res, {data: thisContact});
        }
    },
    async function deleteFunction(req, res, session) {

    }
);

export default handler;