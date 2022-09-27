var Multicall = artifacts.require("./Multicall.sol");
var Multicall2 = artifacts.require("./Multicall2.sol");

module.exports = function(deployer) {
  deployer.deploy(Multicall);
  deployer.deploy(Multicall2);
};
