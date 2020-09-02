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

const getMachines = async (where) => {
  return await client
    .query({
      operationName: "machine",
      query: `query machine($where: machine_bool_exp, $limit: Int, $order_by: [machine_order_by!]) {
        machine(where: $where, limit: $limit, order_by: $order_by) {
          id
          name
          url
          status
          last_activity
          notes
        }
      }`,
      variables: { where },
    })
    .then((res) => {
      if (res.data && res.data.machine && res.data.machine.length) {
        return res.data.machine;
      }
      return null;
    });
};

const getSetting = async (name, type = "value") => {
  let variables = {
    where: { name: { _eq: name } },
  };
  return await client
    .query({
      operationName: "setting",
      query: `query setting($order_by: [setting_order_by!], $where: setting_bool_exp){
        setting(order_by: $order_by, where: $where) {
          id
          name
        value
        int
        float
        timestamp
        }
      }`,
      variables,
    })
    .then((res) => {
      if (res.data && res.data.setting && res.data.setting.length) {
        return res.data.setting[0][type];
      }
      return null;
    });
};

module.exports = {
  getUser,
  loginUserResponse,
  getMachines,
  getSetting,
};
