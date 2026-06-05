const { OAuth2Client } = require("google-auth-library");

exports.verifyGoogleToken = async (credential) => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    throw new Error("Google login is not configured on the server (GOOGLE_CLIENT_ID missing)");
  }

  const client = new OAuth2Client(clientId);
  const ticket = await client.verifyIdToken({
    idToken: credential,
    audience: clientId,
  });

  const payload = ticket.getPayload();
  if (!payload?.email) {
    throw new Error("Google account did not return an email address");
  }

  return {
    googleId: payload.sub,
    email: payload.email.toLowerCase(),
    name: payload.name || payload.email.split("@")[0],
    picture: payload.picture || "",
    emailVerified: Boolean(payload.email_verified),
  };
};
