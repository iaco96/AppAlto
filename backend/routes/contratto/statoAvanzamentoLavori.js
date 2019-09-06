const Web3 = require("web3");
const express = require('express');
const decoder_output = require("../../utility/decoderBloChaOutput");
const bodyParser = require('body-parser');
const router = express.Router();
const auth = require("../../utility/authorization");

router.use(bodyParser.urlencoded({
    extended: true
}));
router.use(bodyParser.json());

router.route('/')
.put(async function (req, response) { //abilita il calcolo automatico del sal, solo dir
    
    let token = response.locals.token; 


    if (token.user_id.substring(0, 3) !== "dir")
        return response.status(403).send();

    let transaction_params = {from: token.quo_addr, privateFor: token.privateFor, gasPrice: 0, gas: 7000000};

    await token.contratti.avanzamento.methods.enableSal()
        .send(transaction_params)
        .on("error", (err) => {
            console.log(err);
            return response.status(500).send();
        })
        .on("receipt", (receipt) => {
            console.log('sto abilitando creando il sal');
            console.log(receipt.transactionHash);
            return response.status(201).send();
        });
    //response.send('put librettoMisure/riserve');
})
.get(async function (req, response) { // come quella del giornale
    let token = response.locals.token; 


    let avanzamenti=[]; // contiene un vettore  con tutti i sal e un vettore con le relative date
    let transaction_params = {from: token.quo_addr, gasPrice: 0, gas: 7000000000};
    avanzamenti = await token.contratti.avanzamento.methods.getSalData().call(transaction_params,
        function (err, result) {
            //console.log('sto fetchando un giornale');
            //console.log(result);
            //console.log(result);
            if (err) response.status(500).send();
            else return result;
        });
    console.log(avanzamenti);
    // response.send(avanzamenti);

    let nums_avanzamenti = [];//vettore che contiene tutti i sal (indici che li identificano) che dovranno essere fetchati nella risposta
    let data_rif; //contiene la data di riferimento in cui si va a cercare un certo sal
    let date_avanzamenti = []; //vettore di date in formato Date di tutti i sal
    let giorni = []; // conterrà i giorni del mese in cui è presente un sal
    let risposta = []; // conterrà un array di sal
    //console.log(libretti);
    avanzamenti[1].forEach((value) => { 
        date_avanzamenti.push(new Date(Math.round(value / 1000000)));
        //console.log(Math.round(value/1000000));
    });
    console.log(date_avanzamenti);
    if (!Number.isNaN(parseInt(req.query.timestamp, 10))) {
        
        data_rif = new Date(parseInt(req.query.timestamp, 10));
        //console.log(data_rif);
        //console.log(req.query.timestamp);
        //console.log(parseInt(req.query.timestamp,10));

        //console.log(new Date(parseInt(req.query.timestamp,10)));
        date_avanzamenti.forEach((val, ind) => {
            //console.log(val);
            //console.log(data_rif);
            if (val.getUTCMonth() == data_rif.getUTCMonth() && val.getUTCFullYear() == data_rif.getUTCFullYear()
                && val.getUTCDate() == data_rif.getUTCDate() && avanzamenti[0][avanzamenti[0].length - 1] != ind + 1) {
                nums_avanzamenti.push(ind + 1);
            } // si potrebbe ottimizzare
        });
    } else if (!Number.isNaN(parseInt(req.query.mese, 10))) {
        date_avanzamenti.forEach((val) => {
            console.log(val.getUTCMonth());
            if (val.getUTCMonth() == req.query.mese) {
                if (!giorni.includes(val.getUTCDate()))
                    giorni.push(val.getUTCDate());
            }
        });
        console.log(giorni);
        return response.send(giorni);
    } else if (avanzamenti[0].length > 1) nums_avanzamenti.push(avanzamenti[0][avanzamenti[0].length - 2]); // mostro l'ultimo sal che è stato fatto
    else return response.send(risposta); // se non è presente nessun sal da mostrare
    //nums_avanzamenti.push(2); // da togliere
    console.log(nums_avanzamenti);
    for (let num_sal of nums_avanzamenti) {
        //function getavanzamenti1(uint _libretto) public returns(uint[] memory, string[] memory, uint[] memory, uint[] memory)
        console.log(num_sal);
        let get1 = await token.contratti.avanzamento.methods.getSal1(num_sal).call(transaction_params,
            function (err, result) {
                console.log('sto fetchando parte 1 sal');
                //console.log(result);
                //console.log(result);
                if (err) {
                    console.log(err);
                    return response.status(500).send();

                } else return result;
            });
        //function getLibretti2(uint _libretto) public returns(string[] memory, uint[] memory, string[][] memory, uint[] memory)
        let get2 = await token.contratti.avanzamento.methods.getSal2(num_sal).call(transaction_params,
            function (err, result) {
                console.log('sto fetchando parte 2 sal');
                //console.log(result);
                //console.log(result);
                if (err) {
                    console.log(err);
                    return response.status(500).send();

                } else return result;
            });
        let sal_righi = [];
        
        console.log(get1);
        console.log(get2);
        sal_righi = decoder_output.decodeSal(get1, get2);
        let avanzamento = {"num_sal": num_sal, "righi": sal_righi[0], "timestamp" : sal_righi[1]};
        risposta.push(avanzamento);
    }
    return response.send(risposta);

});

router.route('/grafico')
    .get(async function (req, response) {
        let token = response.locals.token; 
        let transaction_params = {from: token.quo_addr, privateFor: token.privateFor, gasPrice: 0, gas: 7000000};
        let grafico = null;
        grafico = await token.contratti.avanzamento.methods.getGrafico().call(transaction_params,
            function (err, result) {
                console.log('sto fetchando il grafico del sal');
                //console.log(result);
                //console.log(result);
                if (err) {
                    console.log(err);
                    return response.status(500).send();

                } else return result;
            });
        if(typeof grafico == "undefined") return;
        let risposta=[];
        risposta = decoder_output.decodeGraficoSal(grafico);
        response.send(risposta);
    });

module.exports = router;