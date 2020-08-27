const { sign } = require("jsonwebtoken");
const client = require("./client");
const getUser = async (where) => {
  return await client
    .query({
      operationName: "user",
      query: `query user($where: user_bool_exp) {
          user(where: $where) {
          id
          email
          password
          role
          }
      }`,
      variables: { where },
    })
    .then((res) => {
      if (res.data && res.data.user && res.data.user.length) {
        return res.data.user[0];
      }
      return null;
    });
};
const loginUserResponse = (user) => {
  let response = {
    jwt_token: sign(
      {
        userId: user.id,
        "https://hasura.io/jwt/claims": {
          "x-hasura-allowed-roles": [user.role],
          "x-hasura-default-role": user.role,
          "x-hasura-user-id": user.id.toString(),
        },
      },
      process.env.JWT_KEY,
      { expiresIn: "6m" }
    ),
    refresh_token: sign(
      {
        userId: user.id,
      },
      process.env.JWT_KEY,
      { expiresIn: "30d" }
    ),
    jwt_expires_in: 5 * 60 * 1000,
  };
  return response;
};

module.exports = {
  getUser,
  loginUserResponse,
};
