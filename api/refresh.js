const { verify } = require("jsonwebtoken");
const cookie = require('cookie')
const { getUser, loginUserResponse } = require("./lib/common");
const refreshToken = async (req, res) => {
  if(!req.headers || !req.headers.cookie){
    return res.status(401).json({ message: "You have to login!" });
  }
  const cookies = req.headers.cookie ? cookie.parse(req.headers.cookie) : {}
  const refresh_token = cookies.refresh_token;
  if (!refresh_token) {
    return res.status(401).json({ message: "You have to login!" });
  }

  let refreshTokenData;
  try {
    refreshTokenData = verify(refresh_token, process.env.JWT_KEY);
  } catch (e) {
    return res.status(401).json({ message: `Invalid token!` });
  }

  if (!refreshTokenData || !refreshTokenData.userId) {
    return res.status(401).json({ message: `Invalid refresh token!` });
  }
  const user = await getUser({ id: { _eq: refreshTokenData.userId } });
  if (!user) {
    return res.status(401).json({ message: `The refresh token user is not valid anymore!` });
  }
  const userToken = loginUserResponse(user);

  return res.json({
    jwt_token: userToken.jwt_token,
    jwt_expires_in: userToken.jwt_expires_in,
  });
};

module.exports = refreshToken;
