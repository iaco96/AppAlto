const Web3 = require("web3");
module.exports = {
  networks: {
     vagrant: {
      host: "localhost",     
      port: 22000,            
      //websockets: true,
      network_id: "*",      
      gasPrice: 0,
      gas: 7000000,
      type: "quorum" }
    
    }
    
  }
