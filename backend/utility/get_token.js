const mysql = require('mysql');
const Web3 = require("web3");

var exports = module.exports = {}

exports.getToken= function (user){

return new Promise(function(resolve,reject){

    let connectionDB =mysql.createConnection({
        host: global.serv_config.db_address,
        user: global.serv_config.db_user,
        password: global.serv_config.db_password,
        database: global.serv_config.db_name
    });
    
    let token ={};
    var sql_user ="select users.user_id, users.nome, users.cognome, users.url_nodo, users.quorum_address,contratto.nome as contratto ,contratto.indirizzo ,contratto.abi from users join user_contr on users.user_id = user_contr.user_id join contratto on contratto.id = user_contr.id_contr where users.user_id = ?"; 
    // server per estrarre dal db gli utenti che fanno parte dello stesso progetto dello user fornito (quey annidata), da cui si ricavano  le chiavi pubbliche per il private for
    var sql_privatefor ="select users.pub_key from (select self.user_id from user_contr join user_contr as self on user_contr.id_contr = self.id_contr where user_contr.user_id = ? and  user_contr.user_id != self.user_id limit 2) as user_pk join users on users.user_id = user_pk.user_id";
    connectionDB.connect( function(error) {
        if(error) throw error;
        connectionDB.query(sql_user, user,function (err, res) {
            if (err)  reject(err);
            if(res) { //controllare se il risultato non sia vuoto
            token = {
                user_id : res[0].user_id,
                nome : res[0].nome,
                cognome :res[0].cognome,
                prov_http : new Web3(new Web3.providers.HttpProvider(res[0].url_nodo)),
                quo_addr : res[0].quorum_address,
                contratti : {}
            };
            //console.log(token);
            res.forEach(element => {
                
                /*console.log(element.contratto.toLowerCase());
                console.log(JSON.parse(element.abi));
                console.log(element.indirizzo);*/
                token.contratti[element.contratto.toLowerCase()] = new token.prov_http.eth.Contract(JSON.parse(element.abi),element.indirizzo,{from : element.quorum_address});
            });
            connectionDB.query(sql_privatefor, user,function (err, res) { //aggiungere controlli se res = 1 e se res esiste
                if (err)  reject(err);

                token.privateFor=[];
                if(res) {
                res.forEach(element => {
                
                    /*console.log(element.contratto.toLowerCase());
                    console.log(JSON.parse(element.abi));
                    console.log(element.indirizzo);*/
                    
                    token.privateFor.push(element.pub_key);
                });
                }
                connectionDB.end();
                resolve(token);
            });


            
            
        }
        });
    
    });

});
};
//console.log(token);

