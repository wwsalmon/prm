import mongoose, {Model} from "mongoose";
import {DatedObj, PrmNoteObj} from "../utils/types";

const PrmNoteSchema = new mongoose.Schema({
    prmContactId: { required: true, type: mongoose.Types.ObjectId },
    description: { required: false, type: String },
    tags: [{ required: true, type: String }],
    date: [{ required: true, type: Date }],
}, {
    timestamps: true,
});

export const PrmNoteModel: Model<DatedObj<PrmNoteObj>> = mongoose.models.prm_note || mongoose.model("prm_note", PrmNoteSchema);