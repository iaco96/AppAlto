const Web3 = require("web3");
const express = require('express');
const router = express.Router();
const mysql = require('mysql');
const decoder_output = require("../../utility/decoderBloChaOutput");
const bodyParser = require('body-parser');
const auth = require("../../utility/authorization");

router.use(bodyParser.urlencoded({
    extended: true
}));
router.use(bodyParser.json());

router.route('/')
    .get(async function (req, response) { // come quella del giornale
        let token = response.locals.token; 


        let libretti =  null;
        let transaction_params = {from: token.quo_addr, gasPrice: 0, gas: 7000000000};
        libretti = await token.contratti.libretto.methods.getLibrettoData().call(transaction_params,
            function (err, result) {
                if (err) response.status(500).send();
                else return result;
            });
        if (typeof libretti == "undefined") return ;
        let nums_libretti = [];
        let data_rif;
        let date_libretti = [];
        let giorni = [];
        let risposta = [];
        let terminati = false;

        libretti[1].forEach((value) => {
            date_libretti.push(new Date(Math.round(value / 1000000)));
        });
        console.log(date_libretti);
        if (!Number.isNaN(parseInt(req.query.timestamp, 10))) {
            terminati = true;
            data_rif = new Date(parseInt(req.query.timestamp, 10));

            date_libretti.forEach((val, ind) => {
                if (val.getUTCMonth() == data_rif.getUTCMonth() && val.getUTCFullYear() == data_rif.getUTCFullYear()
                    && val.getUTCDate() == data_rif.getUTCDate() && libretti[0][libretti[0].length - 1] != ind + 1) {
                    nums_libretti.push(ind + 1);
                }
            });
        } else if (!Number.isNaN(parseInt(req.query.mese, 10))) {
            date_libretti.forEach((val) => {
                console.log(val.getUTCMonth());
                if (val.getUTCMonth() == req.query.mese) {
                    if (!giorni.includes(val.getUTCDate()))
                        giorni.push(val.getUTCDate());
                }
            });
            console.log(giorni);
            return response.send(giorni);
        } else if (token.user_id.substring(0, 3) == "dir") nums_libretti.push(libretti[0][libretti[0].length - 1]); // passa quello corrente ancora da terminare
        else if(libretti[0].length >1){
            terminati = true; 
            nums_libretti.push(libretti[0][libretti[0].length - 2]); // eventualmente passo l'ultiumo che è stato terminato
        } 
         // controllo che ci sia almeno 1, se non c'è, significa che non c'è niente da mostrare a tutti queli che non sono dir

        console.log(nums_libretti);
        for (let num_libretto of nums_libretti) {
            //function getLibretti1(uint _libretto) public returns(uint[] memory, string[] memory, uint[] memory, uint[] memory)
            console.log(num_libretto);
            let get1 = await token.contratti.libretto.methods.getLibretti1(num_libretto).call(transaction_params,
                function (err, result) {
                    console.log('sto fetchando parte 1 libretto');
                    if (err) {
                        console.log(err);
                        return response.status(500).send();

                    } else return result;
                });
            //function getLibretti2(uint _libretto) public returns(string[] memory, uint[] memory, string[][] memory, uint[] memory) 
            let get2 = await token.contratti.libretto.methods.getLibretti2(num_libretto).call(transaction_params,
                function (err, result) {
                    console.log('sto fetchando parte 2 libretto');
                    if (err) {
                        console.log(err);
                        return response.status(500).send();

                    } else return result;
                });
            let righi = [];
            if (terminati) {
                let get3 = await token.contratti.riserve.methods.getRiserve1(num_libretto).call(transaction_params,
                    function (err, result) {
                        console.log('sto fetchando parte 1 riserve');
                        if (err) {
                            console.log(err);
                            return response.status(500).send();

                        } else return result;
                    });

                let get4 = await token.contratti.riserve.methods.getRiserve2(num_libretto).call(transaction_params,
                    function (err, result) {
                        console.log('sto fetchando parte 2 riserve');
                        if (err) {
                            console.log(err);
                            return response.status(500).send();

                        } else return result;
                    });
               // console.log(get3);
                //console.log(get4);
                //righi = decoder_output.decodeLibretto(get1,get2,get3,get4);
                righi = decoder_output.decodeLibrettoRis(get1, get2, get3, get4);
            } else righi = decoder_output.decodeLibretto(get1, get2);
            let libretto = {"num_libretto": parseInt(num_libretto, 10), "righi": righi, "timestamp" :date_libretti[num_libretto-1].getTime()};
            risposta.push(libretto);
        }
        response.send(risposta);
    })
    .post(async function (req, response) { //function addLibretto (string memory _codice, string memory _descrizione, uint _percentuale, string[] memory _allegato)
        if (!req.body.codLavoro || !req.body.descrizione || !req.body.percentuale) {
            return response.status(400).send();
        }

        let token = response.locals.token; 


        if (token.user_id.substring(0, 3) !== "dir")
            return response.status(403).send();

        let allegati = [];
        let no_allegati=false;
        try {
            if (!req.body.allegati || req.body.allegati.length ==0) {
                allegati.push("Non è presente nessun allegato");
                throw "nessun allegato";
            }
            if (!Array.isArray(req.body.allegati)) {
                if (typeof req.body.allegati != "string") throw "!string";
                allegati.push(req.body.allegati);
                
                
                
            }
            req.body.allegati.forEach(element => {
                if (typeof element != "string") throw "!string";
                if(element=='') throw "!string";
                allegati.push(element);

            });

        } catch (e) {
            console.log(e);
            if (e == "!string") return response.status(400).send();
            if(e == "nessun allegato") no_allegati=true;
        }
        if (Number.isNaN(parseInt(req.body.percentuale, 10)) || parseInt(req.body.percentuale, 10) < 0 || parseInt(req.body.percentuale, 10) > 100
            || typeof req.body.codLavoro != "string" || typeof req.body.descrizione != "string")
            return response.status(400).send();
        let transaction_params = {
            from: Web3.utils.toChecksumAddress(token.quo_addr),
            privateFor: token.privateFor,
            gasPrice: 0,
            gas: 70000000
        };
        if (!req.body.num_libretto && !req.body.num_rigo)
            await token.contratti.libretto.methods.addLibretto(req.body.codLavoro, req.body.descrizione, parseInt(req.body.percentuale, 10), allegati).send(transaction_params)
                .on("error", (err) => {
                    console.log(err);
                    return response.status(500).send();
                })
                .on("receipt", (receipt) => {
                    console.log('sto aggiungendo una misura nel libretto');
                    console.log(receipt.transactionHash);
                    return response.status(201).send();
                });
        //function updateLibretto (uint _numero, uint _libretto, string memory _codice, string memory _descrizione, uint _percentuale,
        //   string[] memory _allegato)
        else if ((!Number.isNaN(parseInt(req.body.num_libretto, 10)) && !Number.isNaN(parseInt(req.body.num_rigo, 10))))
            await token.contratti.libretto.methods.updateLibretto(parseInt(req.body.num_rigo, 10), parseInt(req.body.num_libretto, 10), req.body.codLavoro, req.body.descrizione, parseInt(req.body.percentuale, 10), allegati).send(transaction_params)
                .on("error", (err) => {
                    console.log(err);
                    return response.status(500).send()
                })
                .on("receipt", (receipt) => {
                    console.log('sto modificando una misura nel libretto');
                    console.log(receipt.transactionHash);
                    return response.status(201).send();
                });
        else response.status(400).send();
        //response.send(token.nome);
        // devo rendere visibile sul db gli allegati
        // ci vuole un if per capire se ci sono allegati
        if(no_allegati) return;
        let db = mysql.createConnection({
            host: serv_config.db_address,
            user: serv_config.db_user,
            password: serv_config.db_password,
            database: serv_config.db_name
        });
        const query_visible = "update attachment set visible=1 where saved_name = ? ";
        for(let allegato of allegati){
            
            let saved_name= allegato.split('/').pop();// è l'ultimo nome del path 
            db.query(query_visible, [saved_name], function (err, result) {
                console.log(err);
                if (err) return response.status(500).send();
                
            });
        }
        
    })
    .put(async function (req, response) {
        let token = response.locals.token; 


        if (token.user_id.substring(0, 3) !== "dir")
            return response.status(403).send();

        let transaction_params = {from: token.quo_addr, privateFor: token.privateFor, gasPrice: 0, gas: 7000000};
        /*let libretti = await token.contratti.libretto.methods.getLibrettoData().call(transaction_params,
            function (err, result) {
                console.log(err);
                if (err) response.status(500).send();
                else return result;
            });
        if (libretti[1][libretti[1].length - 1] == 0) return response.status(500).send();*/ //non ricordo perchè c'è, non ha senso
        await token.contratti.libretto.methods.finishLibretto().send(transaction_params)
            .on("error", (err) => {
                console.log(err);
                return response.status(500).send();
            })
            .on("receipt", (receipt) => {
                console.log('sto chiudendo un libretto');
                console.log(receipt.transactionHash);
                return response.status(201).send();
            });

        //response.send('put librettoMisure');
    });


router.route('/riserve')
    .post(async function (req, response) { // fa inserire la firma su un rigo del libretto delle misure alla fitta
        console.log(req.body.riserva);
        console.log(req.body.num_rigo);
        console.log(req.body.num_libretto);

        if (typeof req.body.riserva === "undefined" || !req.body.num_rigo || !req.body.num_libretto) //riserva lo valuto con typeof, perchè essendo bool, se mi ritorna false e lo nego, va atrue e mi da errore
            return response.status(400).send();

        if (Number.isNaN(parseInt(req.body.num_rigo, 10)) || Number.isNaN(parseInt(req.body.num_libretto, 10)))
            return response.status(400).send();

        if (!(typeof req.body.riserva === "boolean"))
            return response.status(400).send();

            let token = response.locals.token; 


        if (token.user_id.substring(0, 3) !== "dit")
            return response.status(403).send();

        let transaction_params = {from: token.quo_addr, privateFor: token.privateFor, gasPrice: 0, gas: 7000000};
        //insertFirmaDittaLibretto (uint _rigo_libretto, uint _libretto)
        console.log("rigo");
            console.log(req.body.num_rigo);
            console.log("num libretto");
            console.log(req.body.num_libretto);
        if (req.body.riserva) {//se riserva è true si vuole firmare con riserva
            console.log("qui ci arrivo , riserva true");
            
            await token.contratti.libretto.methods.insertFirmaRiservaDittaLibretto(parseInt(req.body.num_rigo, 10), parseInt(req.body.num_libretto, 10)).send(transaction_params)
                .on("error", (err) => {
                    console.log(err);
                    return response.status(500).send();
                })
                .on("receipt", (receipt) => {
                    console.log('sto firmando con riserva (Ditta) un rigo del libretto');
                    console.log(receipt.transactionHash);
                    return response.status(201).send();
                });
        } else await token.contratti.libretto.methods.insertFirmaDittaLibretto(parseInt(req.body.num_rigo, 10), parseInt(req.body.num_libretto, 10)).send(transaction_params)
            .on("error", (err) => {
                console.log(err);
                return response.status(500).send();
            })
            .on("receipt", (receipt) => {
                console.log('sto firmando senza riserva (Ditta) un rigo del libretto');
                console.log(receipt.transactionHash);
                return response.status(201).send();
            });
    })
    .put(async function (req, response) { // fa inserire la riserva da parte del direttore dei lavori su uno specifico rigo di un libretto
        // function insertRiserva (string memory _descrizione, uint _percentuale, uint _rigo, uint _libretto)
        if (!req.body.percentuale_riserva || !req.body.descrizione_riserva || !req.body.num_rigo || !req.body.num_libretto)
            return response.status(400).send();

        if (Number.isNaN(parseInt(req.body.num_rigo, 10)) || Number.isNaN(parseInt(req.body.num_libretto, 10)) || Number.isNaN(parseInt(req.body.percentuale_riserva, 10)))
            return response.status(400).send();
        if (parseInt(req.body.percentuale_riserva, 10) < 0 || parseInt(req.body.percentuale_riserva, 10) > 100)
            return response.status(400).send();

            let token = response.locals.token; 


        if (token.user_id.substring(0, 3) !== "dir")
            return response.status(403).send();

        let transaction_params = {from: token.quo_addr, privateFor: token.privateFor, gasPrice: 0, gas: 7000000};

        await token.contratti.riserve.methods.insertRiserva(req.body.descrizione_riserva, parseInt(req.body.percentuale_riserva, 10), parseInt(req.body.num_rigo, 10), parseInt(req.body.num_libretto, 10))
            .send(transaction_params)
            .on("error", (err) => {
                console.log(err);
                return response.status(500).send();
            })
            .on("receipt", (receipt) => {
                console.log('sto inserendo la riserva(DL) su di un rigo del libretto');
                console.log(receipt.transactionHash);
                return response.status(201).send();
            });
        //response.send('put librettoMisure/riserve');
    });


module.exports = router;