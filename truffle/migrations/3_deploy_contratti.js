var Giornale = artifacts.require("./Giornale.sol");
var Firme = artifacts.require("./Firme.sol");
var Libretto = artifacts.require("./Libretto.sol");
var Registro = artifacts.require("./Registro.sol");
var Avanzamento = artifacts.require("./Avanzamento.sol");
var Misure = artifacts.require("./Misure.sol");
var StringUtils = artifacts.require("./StringUtils.sol");
var Riserve = artifacts.require("./Riserve.sol");




var private_accounts = [
  "QfeDAys9MPDs2XHExtc84jKGHxZg/aj52DTh0vtA3Xc=",
  "1iTZde/ndBHvzhcl7V68x44Vx7pl8nwx9LqnM/AfJUg="
];


module.exports =  function(deployer) {
// scrivendo i deployer uno sotto l'altro si ha la sicurezza che siano eseguiti sequenzialmente secondo i doc di truffle https://www.trufflesuite.com/docs/truffle/getting-started/running-migrations
  deployer.link(StringUtils, [Misure,Firme,Libretto,Registro,Avanzamento]);
  deployer.deploy(Misure, {privateFor: private_accounts});
  deployer.deploy(Firme, {privateFor: private_accounts}).then(instance => {
    console.log("setto indirizzo misure su firme");
    instance.setIndirizzoMisure(Misure.address, {privateFor: private_accounts}).then((result,err) => {
      console.log(result.trasactionHash);
      if(err)
      console.log(err);
    });
  });

  let lib_inst;
  deployer.deploy(Libretto, {privateFor: private_accounts, gas:8000000, gasPrice : 0}).then((instance,err) => {
    console.log(err);
    //console.log(instance);
    console.log("setto indirizzo misure su libretto");
    lib_inst = instance;
    instance.setIndirizzoMisure(Misure.address, {privateFor: private_accounts}).then((result,err) => {
      if(err)
      return console.log(err);
      console.log(result.trasactionHash);
      
    });
    console.log("setto indirizzo firme su libretto");
    instance.setIndirizzoFirme(Firme.address, {privateFor: private_accounts}).then((result,err) => {
      if(err)
      return console.log(err);
      console.log(result.trasactionHash);
      
    });
  });

  deployer.deploy(Riserve, {privateFor: private_accounts, gas:8000000, gasPrice : 0}).then((instance,err) => {
    console.log(err);
    //console.log(instance);
    console.log("setto indirizzo riserve su libretto");
    lib_inst.setIndirizzoRiserve(Riserve.address, {privateFor: private_accounts}).then((result,err) => {
      if(err)
      return console.log(err);
      console.log(result.trasactionHash);
      
    });
    console.log("setto indirizzo misure su riserve");
    instance.setIndirizzoMisure(Misure.address, {privateFor: private_accounts}).then((result,err) => {
      if(err)
      return console.log(err);
      console.log(result.trasactionHash);
      
    });
    console.log("setto indirizzo firme su riserve");
    instance.setIndirizzoFirme(Firme.address, {privateFor: private_accounts}).then((result,err) => {
      if(err)
      return console.log(err);
      console.log(result.trasactionHash);
      
    });
    console.log("setto indirizzo libretto su riserve");
    instance.setIndirizzoLibretto(Libretto.address, {privateFor: private_accounts}).then((result,err) => {
      if(err)
      return console.log(err);
      console.log(result.trasactionHash);
      
    });
  });


  deployer.deploy(Registro, {privateFor: private_accounts}).then(instance => {
    
    console.log("setto indirizzo misure su registro");
    instance.setIndirizzoMisure(Misure.address, {privateFor: private_accounts}).then((result,err) => {
      if(err)
        return console.log(err);
      console.log(result.trasactionHash);
      
    });

    console.log("setto indirizzo libretto su registro ");
    
    instance.setIndirizzoLibretto(Libretto.address, {privateFor: private_accounts}).then((result,err) => {
      if(err)
      return console.log(err);
      console.log(result.trasactionHash);
      
    });
  });
  
 deployer.deploy(Avanzamento, {privateFor: private_accounts}).then(instance => {
  console.log("setto indirizzo misure su avanzamento");
  
  instance.setIndirizzoMisure(Misure.address, {privateFor: private_accounts}).then((result,err) => {
    if(err)
     return console.log(err);
    console.log(result.trasactionHash);
    
  });
  console.log("setto indirizzo registro su avanzamento");
  instance.setIndirizzoRegistro(Registro.address, {privateFor: private_accounts}).then((result,err) => {
    if(err)
      return console.log(err);
    console.log(result.trasactionHash); 
  });
  instance.setIndirizzoLibretto(Libretto.address, {privateFor: private_accounts}).then((result,err) => {
    if(err)
    return console.log(err);
    console.log(result.trasactionHash);  
  });
  instance.setIndirizzoFirme(Firme.address, {privateFor: private_accounts}).then((result,err) => {
    if(err)
    return console.log(err);
    console.log(result.trasactionHash);
  });
  instance.setIndirizzoRiserve(Riserve.address, {privateFor: private_accounts}).then((result,err) => {
    if(err)
    return console.log(err);
    console.log(result.trasactionHash); 
  });
});


}; 


