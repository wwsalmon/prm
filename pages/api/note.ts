import {NextApiHandler} from "next";
import nextApiEndpoint from "../../utils/nextApiEndpoint";
import {res200, res400, res403, res500} from "../../utils/apiConstants";
import {PrmNoteModel} from "../../models/PrmNote";
import {PrmContactModel} from "../../models/PrmContact";
import splitTags from "../../utils/splitTags";
import {PrmUserModel} from "../../models/PrmUser";
import * as mongoose from "mongoose";

const handler: NextApiHandler = nextApiEndpoint(
    async function getFunction(req, res, session, thisUser) {

    },
    async function postFunction(req, res, session, thisUser) {
        // if id, then update, else create new
        if (req.body.id) {
            if (!(req.body.tags || req.body.description || req.body.date)) return res400(res);

            const thisNoteWithContact = await PrmNoteModel.aggregate([
                {
                    $match: {
                        _id: mongoose.Types.ObjectId(req.body.id),
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

            if (!(thisNoteWithContact && thisNoteWithContact.length && thisNoteWithContact[0].contactsArr.length)) return res500(res, new Error("Invalid note ID"));

            if (thisNoteWithContact[0].contactsArr[0].prmUserId.toString() !== thisUser._id.toString()) return res403(res);

            let updateDoc = {};

            if (req.body.date) updateDoc["date"] = new Date(req.body.date);
            if (req.body.description) updateDoc["description"] = req.body.description;
            if (req.body.tags) {
                const tags = splitTags(req.body.tags);

                if (tags.length) {
                    await PrmUserModel.updateOne({email: session.user.email}, {
                        $addToSet: {noteTags: {$each: tags}}
                    });
                }

                updateDoc["tags"] = tags;
            } else {
                updateDoc["tags"] = [];
            }

            await PrmNoteModel.updateOne({_id: req.body.id}, updateDoc);

            return res200(res, {});
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
    async function deleteFunction(req, res, session, thisUser) {
        if (!req.body.id) return res400(res);

        const thisNoteWithContact = await PrmNoteModel.aggregate([
            {
                $match: {
                    _id: mongoose.Types.ObjectId(req.body.id),
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

        if (!(thisNoteWithContact && thisNoteWithContact.length && thisNoteWithContact[0].contactsArr.length)) return res500(res, new Error("Invalid note ID"));

        if (thisNoteWithContact[0].contactsArr[0].prmUserId.toString() !== thisUser._id.toString()) return res403(res);

        await PrmNoteModel.deleteOne({_id: req.body.id});

        return res200(res, {});
    },
);

export default handler;