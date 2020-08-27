const { getMachines } = require("./lib/common");

const keepMachineAwake = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(403).send("Forbidden!");
  }

  if(!req.headers || !req.headers.key){
    return res.status(401).json({ message: "Not authorized!" });
  }

  if(!req.headers.path){
    return res.status(503).json({ message: "you should include the pathin the request!" });
  }

  const activeMachines = await getMachines({ status: { _eq: "ACTIVE" } });
  if (!activeMachines) {
    return res.status(200).send({ message: `No active machines found!` });
  }

  activeMachines.forEach((machine) => {
    fetch(`${machine.url}${req.headers.path}`)
      .then((res) => { console.log(res.text()); return true})
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
