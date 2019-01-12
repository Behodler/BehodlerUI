var Migrations = artifacts.require("./Migrations.sol");

module.exports = function(deployer) {
  deployer.deploy(Migrations);
  //Dai address: 0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359
};
