// backend/model/SupportMessage.model.js
const mongoose = require("mongoose");

const supportMessageSchema = new mongoose.Schema(
  {
    user:    { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false },
    name:    { type: String, default: "" },
    email:   { type: String, default: "" },
    topic:   { type: String, default: "" },
    message: { type: String, required: true },
    status:  { type: String, enum: ["Open", "In Progress", "Resolved"], default: "Open" },
    adminNote: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SupportMessage", supportMessageSchema);