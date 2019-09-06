const Web3 = require("web3");
const express = require('express');
const decoder_output = require("../utility/decoderBloChaOutput");
const auth = require('../utility/authorization');
var get_token = require("../utility/get_token");
//console.log(token);
var obj_response = { //test
    status: "ok"
};

var router = express.Router();

const bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({
    extended: true
}));
router.use(bodyParser.json());

router.route('/')
    .put(async function (req, response) { // termina
        let token = response.locals.token; 
 
        let transaction_params = {from: token.quo_addr, privateFor: token.privateFor, gasPrice: 0, gas: 7000000};
        await token.contratti.misure.methods.finishInserimenti().send(transaction_params,
            function (err, receipt) {
                console.log('sto chiudendo il contratto');
                console.log(receipt);
            }).on("error", () => {
            return response.status(500).send();
        }).on("receipt", () => {
            return response.status(201).send();
        });
    });


router.route('/lavoro')
    .get(async function (req, response) {
        let token = response.locals.token; 
 
        //if (!token) return response.send({status: "bad token"});
        
        console.log(token.nome);
        //let lavori=[];
        let lavori = await token.contratti.misure.methods.getLavori().call({from: token.quo_addr})
            .then(function (result, err) { // non so se è il modo corretto di intercettare anche l'errore, vedere le api javascript
                console.log('sto fetchando i lavori');
                //console.log(result);
                if (err) {
                    console.log(err);
                    return response.status(500).send();
                }
                return result;
            });
        console.log(lavori);
        if (lavori.lenght == 0) return;
        let risposta = decoder_output.decodeLavori(lavori);
        

        // se percentuali è true mando indietro per ogni lavoro anche la percentuale corrente

        for(let ind_lavoro in risposta){
            let percentuale_compl = await token.contratti.misure.methods.getPercentuale(risposta[ind_lavoro].codLavoro).call({from: token.quo_addr})
            .then(function (result, err) { // non so se è il modo corretto di intercettare anche l'errore, vedere le api javascript
                console.log('sto fetchando la percentuale dela lavoro');
                console.log(result);
                if (err) {
                    console.log(err);
                    return response.status(500).send();
                }
                return result;
            });
            risposta[ind_lavoro].perc_completamento = parseInt(percentuale_compl,10);
        }
        return response.send(risposta);

    })
    .post(async function (req, response) {
        if (!req.body || !req.body.codLavoro || !req.body.nomeLavoro || !parseInt(req.body.costoLavoro, 10))
            return response.status(400).send();

            let token = response.locals.token; 
 
        

        let transaction_params = {from: token.quo_addr, privateFor: token.privateFor, gasPrice: 0, gas: 7000000};
        await token.contratti.misure.methods.addLavoro(req.body.codLavoro, req.body.nomeLavoro, parseInt(req.body.costoLavoro, 10)).send(transaction_params,
            function (err, receipt) {
                console.log('sto aggiungendo un lavoro');
                console.log(receipt);
            }).on("error", () => {
            return response.status(500).send()
        }).on("receipt", () => {
            return response.status(201).send();
        });

    })
    .put(async function (req, response) {
        if (!req.body.codLavoro || !req.body.nomeLavoro || !parseInt(req.body.costoLavoro, 10))
            return response.status(400).send();

            let token = response.locals.token; 
 

        let transaction_params = {from: token.quo_addr, privateFor: token.privateFor, gasPrice: 0, gas: 7000000};
        await token.contratti.misure.methods.updateLavoro(req.body.codLavoro, req.body.nomeLavoro, parseInt(req.body.costoLavoro, 10)).send(transaction_params,
            function (err, receipt) {
                console.log('sto modificando un lavoro');
                console.log(receipt);
            }).on("error", () => {
            return response.status(500).send()
        }).on("receipt", () => {
            return response.status(201).send();
        });
    });

router.route('/soglia')
    .get(async function (req, response) {
        let token = response.locals.token; 
        
        token.contratti.misure.methods.getSoglia().call({from: token.quo_addr},
            function (err, result) { // non so se è il modo corretto di intercettare anche l'errore, vedere le api javascript
                console.log('sto fetchando la soglia');
                //console.log(result);
                if (err) {
                    console.log(err);
                    return response.status(500).send();
                }
                let risposta = {soglia: result};
                //Object.keys prende le chiavi di un oggetto e le fa diventare un array di

                return response.send(risposta);
            });

    })
    .post(async function (req, response) {
        if (!parseInt(req.body.soglia, 10))
            return response.status(400).send();
        let token = response.locals.token; 

        let transaction_params = {from: token.quo_addr, privateFor: token.privateFor, gasPrice: 0, gas: 7000000};
        await token.contratti.misure.methods.updateSoglia(parseInt(req.body.soglia, 10)).send(transaction_params,
            function (err, receipt) {
                console.log('sto minando la transazione');
                console.log(receipt);
                //console.log(result);
                if (err) return response.status(500).send();
                return response.status(201).send();
            });

    });

router.route('/terminaContratto')
.post(async function (req, response) {
    let token = response.locals.token; 

    let transaction_params = {from: token.quo_addr, privateFor: token.privateFor, gasPrice: 0, gas: 7000000};
    await token.contratti.avanzamento.methods.killAvanzamento().send(transaction_params,
        function (err, receipt) {
            console.log('sto chiudendo il contratto definitivamente');
            console.log(receipt);
            //console.log(result);
            if (err) return response.status(500).send();
            return response.status(201).send();
        });

});

module.exports = router;