const STRONG_PASSWORD_RE =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;

const STRONG_PASSWORD_MSG =
  "Password must be at least 8 characters and include uppercase, lowercase, a number, and a special character.";

exports.isStrongPassword = (password) => STRONG_PASSWORD_RE.test(password);

exports.strongPasswordMessage = () => STRONG_PASSWORD_MSG;
