const mongoose = require("mongoose");
const User = require("../model/User.model");

exports.ensureUserIndexes = async () => {
  const coll = mongoose.connection.collection("users");

  try {
    await coll.dropIndex("phone_1");
  } catch {
    // index may not exist
  }

  await coll.updateMany(
    { $or: [{ phone: "" }, { phone: null }] },
    { $unset: { phone: "" } }
  );

  await User.syncIndexes();
};
