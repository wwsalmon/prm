import mongoose, {Document, Model} from "mongoose";
import {PrmUserObj} from "../utils/types";

const PrmUserSchema = new mongoose.Schema({
    email: { required: true, type: String },
    name: { required: true, type: String },
    image: { required: true, type: String },
}, {
    timestamps: true,
});

export const PrmUserModel: Model<Document<PrmUserObj>> = mongoose.models.prm_user || mongoose.model("prm_user", PrmUserSchema);