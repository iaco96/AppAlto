
var Giornale = artifacts.require("./Giornale.sol");
var Firme = artifacts.require("./Firme.sol");
var Libretto = artifacts.require("./Libretto.sol");
var Registro = artifacts.require("./Registro.sol");
var Avanzamento = artifacts.require("./Avanzamento.sol");
var Misure = artifacts.require("./Misure.sol");

var private_accounts = [
  "QfeDAys9MPDs2XHExtc84jKGHxZg/aj52DTh0vtA3Xc=",
  "1iTZde/ndBHvzhcl7V68x44Vx7pl8nwx9LqnM/AfJUg="
];
const fs = require('fs');
var contratti=[];
module.exports =  function(deployer) {
// scrivendo i deployer uno sotto l'altro si ha la sicurezza che siano eseguiti sequenzialmente secondo i doc di truffle https://www.trufflesuite.com/docs/truffle/getting-started/running-migrations

   deployer.deploy(Giornale, {privateFor: private_accounts}).then(instance => {
    console.log("setto indirizzo misure su giornale");
    instance.setIndirizzoMisure(Misure.address, {privateFor: private_accounts}).then(result => {
      console.log(result);
    });
    Avanzamento.deployed().then(instance =>{
      instance.setindirizzoGiornale(Giornale.address,{privateFor: private_accounts});
    });
  });
  
  

}; 


