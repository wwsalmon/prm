import mongoose, {Model} from "mongoose";
import {DatedObj, PrmUserObj} from "../utils/types";

const PrmUserSchema = new mongoose.Schema({
    email: { required: true, type: String },
    name: { required: true, type: String },
    image: { required: true, type: String },
    contactTags: [{ required: true, type: String }],
    noteTags: [{ required: true, type: String }],
}, {
    timestamps: true,
});

export const PrmUserModel: Model<DatedObj<PrmUserObj>> = mongoose.models.prm_user || mongoose.model("prm_user", PrmUserSchema);