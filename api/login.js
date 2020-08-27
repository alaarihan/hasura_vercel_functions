const { compare } = require("bcrypt");
const cookie = require('cookie')
const { getUser, loginUserResponse } = require("./lib/common");

const login = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(403).send('Forbidden!');
  }
  const { email, password } = req.body.input;

  const user = await getUser({ email: { _eq: email } });
  if (!user) {
    return res
      .status(401)
      .send({ message: `No account found for this email: ${email}` });
  }

  const passwordValid = await compare(password, user.password);
  if (!passwordValid) {
    return res.status(401).send({ message: "Invalid email or password!" });
  }

  const userToken = loginUserResponse(user);

  if (userToken && userToken.refresh_token) {
    res.setHeader('Set-Cookie', cookie.serialize('refresh_token', String(userToken.refresh_token), {
      httpOnly: true,
      secure: true,
      maxAge: 60 * 60 * 24 * 30 // 1 month
    }));
  }
  // success
  return res.json({
    jwt_token: userToken.jwt_token,
    jwt_expires_in: userToken.jwt_expires_in,
  });
};

module.exports = login;
