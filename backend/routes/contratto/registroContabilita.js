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
    .put(async function (req, response) { //abilita il calcolo automatico del registro di contabilità, va fatto ad ogni terminazione del libretto?
        
        let token = response.locals.token; 


        if (token.user_id.substring(0, 3) !== "rup")
            return response.status(403).send();

        let transaction_params = {from: token.quo_addr, privateFor: token.privateFor, gasPrice: 0, gas: 7000000};

        await token.contratti.registro.methods.enableRegistroContabilita()
            .send(transaction_params)
            .on("error", (err) => {
                console.log(err);
                return response.status(500).send();
            })
            .on("receipt", (receipt) => {
                console.log('sto abilitandoil registro contabilità');
                console.log(receipt.transactionHash);
                return response.status(201).send();
            });
        //response.send('put librettoMisure/riserve');
    })
    .get(async function (req, response) { // come quella del giornale
        let token = response.locals.token; 


        let registri;
        //response.send(registri);
        let transaction_params = {from: token.quo_addr, gasPrice: 0, gas: 7000000000};
        registri = await token.contratti.registro.methods.getRegistroData().call(transaction_params,
            function (err, result) {
                //console.log('sto fetchando un giornale');
                //console.log(result);
                //console.log(result);
                if (err) response.status(500).send();
                else return result;
            });
        console.log(registri);
        // response.send(registri);

        let nums_registri = [];
        let data_rif;
        let date_registri = [];
        let giorni = [];
        let risposta = [];
        //console.log(libretti);
        registri[1].forEach((value) => {
            date_registri.push(new Date(Math.round(value / 1000000)));
            //console.log(Math.round(value/1000000));
        });
        console.log(date_registri);
        if (!Number.isNaN(parseInt(req.query.timestamp, 10))) {
            
            data_rif = new Date(parseInt(req.query.timestamp, 10));
            //console.log(data_rif);
            //console.log(req.query.timestamp);
            //console.log(parseInt(req.query.timestamp,10));

            //console.log(new Date(parseInt(req.query.timestamp,10)));
            date_registri.forEach((val, ind) => {
                //console.log(val);
                //console.log(data_rif);
                if (val.getUTCMonth() == data_rif.getUTCMonth() && val.getUTCFullYear() == data_rif.getUTCFullYear()
                    && val.getUTCDate() == data_rif.getUTCDate() && registri[0][registri[0].length - 1] != ind + 1) {
                    nums_registri.push(ind + 1);
                }
            });
        } else if (!Number.isNaN(parseInt(req.query.mese, 10))) {
            date_registri.forEach((val) => {
                console.log(val.getUTCMonth());
                if (val.getUTCMonth() == req.query.mese) {
                    if (!giorni.includes(val.getUTCDate()))
                        giorni.push(val.getUTCDate());
                }
            });
            console.log(giorni);
            return response.send(giorni);
        } else if (registri[0].length > 1) nums_registri.push(registri[0][registri[0].length - 2]);
        else return response.send(risposta); // se non c'è nessun registro da mostrare
        //nums_registri.push(2); // da togliere
        console.log(nums_registri);
        for (let num_registro of nums_registri) {
            //function getregistri1(uint _libretto) public returns(uint[] memory, string[] memory, uint[] memory, uint[] memory)
            console.log(num_registro);
            let get1 = await token.contratti.registro.methods.getRegistri1(num_registro).call(transaction_params,
                function (err, result) {
                    console.log('sto fetchando parte 1 registro');
                    //console.log(result);
                    //console.log(result);
                    if (err) {
                        console.log(err);
                        return response.status(500).send();

                    } else return result;
                });
            //function getLibretti2(uint _libretto) public returns(string[] memory, uint[] memory, string[][] memory, uint[] memory)
            let get2 = await token.contratti.registro.methods.getRegistri2(num_registro).call(transaction_params,
                function (err, result) {
                    console.log('sto fetchando parte 2 registro');
                    //console.log(result);
                    //console.log(result);
                    if (err) {
                        console.log(err);
                        return response.status(500).send();

                    } else return result;
                });
            let reg_righi = [];
            let get3 = await token.contratti.registro.methods.getRegistri3(num_registro).call(transaction_params,
                function (err, result) {
                    console.log('sto fetchando parte 3 registro');
                    //console.log(result);
                    //console.log(result);
                    if (err) {
                        console.log(err);
                        return response.status(500).send();

                    } else return result;
                });
            console.log(get1);
            console.log(get2);
            console.log(get3);
            reg_righi = decoder_output.decodeRegistro(get1, get2, get3); // torna un vettore
            let registro = {"num_registro": parseInt(num_registro,10), "righi": reg_righi[0], "timestamp" : reg_righi[1] };
            risposta.push(registro);
        }
        return response.send(risposta);

    });


module.exports = router;