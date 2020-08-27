const fetch = require("node-fetch");
const { getMachines } = require("./lib/common");

async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}

const keepMachineAwake = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(403).send("Forbidden!");
  }

  if (
    !req.headers ||
    !req.headers.key ||
    req.headers.key !== process.env.APP_KEY
  ) {
    return res.status(401).json({ message: "Not authorized!" });
  }

  if (!req.body.payload.path) {
    return res
      .status(503)
      .json({ message: "you should include the path in the request body!" });
  }

  const activeMachines = await getMachines({ status: { _eq: "ACTIVE" } });
  if (!activeMachines) {
    return res.status(200).send({ message: `No active machines found!` });
  }

  asyncForEach(activeMachines, async (machine) => {
    await fetch(`${machine.url}${req.body.payload.path}`)
      .catch((error) => {
        console.log(error);
      });
  });

  // success
  return res.json({
    machines: activeMachines.length,
    done: true,
  });
};

module.exports = keepMachineAwake;
