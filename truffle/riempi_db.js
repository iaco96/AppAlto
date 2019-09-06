var mysql = require('mysql');

var connectionDB = mysql.createConnection({
    host     : 'localhost',
    user     : 'server',
    password : 'Server11',
    database: "IdsDB"
  });

var misure_json = require('./build/contracts/Misure.json');
var avanza_json = require('./build/contracts/Avanzamento.json');
var firme_json = require('./build/contracts/Firme.json');
var giorn_json = require('./build/contracts/Giornale.json');
var lib_json = require('./build/contracts/Libretto.json');
var reg_json = require('./build/contracts/Registro.json');
var ris_json = require('./build/contracts/Riserve.json');

//var sql = "select user_id from users";
var values = [{nome : misure_json.contractName, abi:  JSON.stringify(misure_json.abi), indirizzo :misure_json.networks[10].address},
                {nome : avanza_json.contractName, abi:  JSON.stringify(avanza_json.abi), indirizzo :avanza_json.networks[10].address},
                {nome : firme_json.contractName, abi:  JSON.stringify(firme_json.abi), indirizzo :firme_json.networks[10].address},
                {nome : giorn_json.contractName, abi:  JSON.stringify(giorn_json.abi), indirizzo :giorn_json.networks[10].address},
                {nome : lib_json.contractName, abi:  JSON.stringify(lib_json.abi), indirizzo :lib_json.networks[10].address},
                {nome : reg_json.contractName, abi:  JSON.stringify(reg_json.abi), indirizzo :reg_json.networks[10].address},
                {nome : ris_json.contractName, abi:  JSON.stringify(ris_json.abi), indirizzo :ris_json.networks[10].address}];
console.log(misure_json.networks[10].address);
//console.log(mysql.format(sql,values[0]));
var upd = "update contratto set indirizzo = ? , abi = ? where id = ?";
var ins = "insert into contratto set indirizzo = ?, abi = ?, nome = ?";
connectionDB.connect( function(err) {
    if(err) throw err;
    let id=1;
    values.forEach(element => {
        console.log(element.indirizzo);
        console.log(element.nome);
        connectionDB.query(upd,[element.indirizzo,element.abi, id]);
        //if (element.nome == "Riserve") connectionDB.query(ins,[element.indirizzo,element.abi, element.nome]);
        id= id+1;
    });
    connectionDB.end();
});

//riempire la tabella di collegamento 