const User = require("../models/User");

/** Grandfather existing accounts so login is not blocked after schema upgrade. */
async function migrateLegacyUsers() {
  const result = await User.updateMany(
    {
      $or: [
        { emailVerified: { $exists: false } },
        { tokenVersion: { $exists: false } },
      ],
    },
    {
      $set: {
        emailVerified: true,
        emailVerifiedAt: new Date(),
        tokenVersion: 0,
        failedLoginAttempts: 0,
      },
    }
  );

  if (result.modifiedCount > 0) {
    console.log(`Auth migration: updated ${result.modifiedCount} legacy user(s)`);
  }
}

module.exports = { migrateLegacyUsers };
