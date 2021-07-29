import mongoose, {Model, Schema} from "mongoose";
import {DatedObj, PrmContactObj} from "../utils/types";

const PrmContactSchema = new Schema({
    prmUserId: {required: true, type: mongoose.Types.ObjectId},
    name: { required: true, type: String },
    tags: [{ required: true, type: String }],
    description: { required: false, type: String },
}, {
    timestamps: true,
});

export const PrmContactModel: Model<DatedObj<PrmContactObj>> = mongoose.models.prm_contact || mongoose.model("prm_contact", PrmContactSchema);