var Misure = artifacts.require("./Misure.sol")
var StringUtils = artifacts.require("./StringUtils.sol");

var private_accounts = [
  "QfeDAys9MPDs2XHExtc84jKGHxZg/aj52DTh0vtA3Xc=",
  "1iTZde/ndBHvzhcl7V68x44Vx7pl8nwx9LqnM/AfJUg="
];


module.exports = function(deployer) {
  deployer.deploy(StringUtils, {privateFor: private_accounts});
  

};


