import mongoose from "mongoose";

const blacklistTokenSchema = mongoose.Schema({
    token: {
        type: String,
        required: true,
        unique: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 3600,
    },
})

const blacklistTokenModel = mongoose.model("blacklistToken", blacklistTokenSchema);

export default blacklistTokenModel;