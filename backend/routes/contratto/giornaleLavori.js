const Web3 = require("web3");
const express = require('express');
const router = express.Router();
const decoder_output = require("../../utility/decoderBloChaOutput");
const auth = require("../../utility/authorization");

const bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({
    extended: true
}));
router.use(bodyParser.json());


router.route('/') //getGiornaleData()
    .get(async function (req, response) {
        let token = response.locals.token; 


        let giornali = null; // mi serve per controllare che venga valorizzato
        let transaction_params = {from: token.quo_addr, gasPrice: 0, gas: 7000000000};
        giornali = await token.contratti.giornale.methods.getGiornaleData().call(transaction_params,
            function (err, result) {
                //console.log('sto fetchando un giornale');
                //console.log(result);
                //console.log(result);
                if (err) return null;
                else return result;
            });
        if(typeof giornali == "undefined")  return  response.status(500).send();
        let nums_giorn = []; //contiene i numeri dei giornali che si trovano in un certo giorno
        let data_rif; // la data di riferimento per valutare in che giorno fetchare il giornale
        let date_giorn = []; //le date dei giornali in formato Date
        let giorni = []; // vettore con i giorni in cui è presente un giornale di un determinato mese
        //console.log(giornali);
        giornali[1].forEach((value) => {
            date_giorn.push(new Date(Math.round(value / 1000000)));
            //console.log(Math.round(value/1000000));
        });
        //console.log(date_giorn);
        //console.log(req.query.timestamp);
        if (!Number.isNaN(parseInt(req.query.timestamp, 10))) {
            data_rif = new Date(parseInt(req.query.timestamp, 10));
            //console.log(data_rif);
            //console.log(req.query.timestamp);
            //console.log(parseInt(req.query.timestamp,10));

            console.log(new Date(parseInt(req.query.timestamp, 10)));
            date_giorn.forEach((val, ind) => {
                //console.log(val);
                //console.log(data_rif);
                if (val.getUTCMonth() == data_rif.getUTCMonth() && val.getUTCFullYear() == data_rif.getUTCFullYear()
                    && val.getUTCDate() == data_rif.getUTCDate() && giornali[0][giornali[0].length - 1] != ind + 1) { // non si deve visualizzare quello corrente che ancora non è concluso

                    nums_giorn.push(ind + 1);
                }
            });
        } else if (!Number.isNaN(parseInt(req.query.mese, 10))) {
            date_giorn.forEach((val) => {
                console.log(val.getUTCMonth());
                if (val.getUTCMonth() == req.query.mese) {
                    if (!giorni.includes(val.getUTCDate()))
                        giorni.push(val.getUTCDate());
                }
            });
            console.log(giorni);
            return response.send(giorni);
        } else if (token.user_id.substring(0, 3) === "dir") nums_giorn.push(giornali[0][giornali[0].length - 1]); // passa quello corrente ancora da terminare
        else if(giornali[0].length >1) nums_giorn.push(giornali[0][giornali[0].length - 2]); // eventualmente passo l'ultiumo che è stato terminato
        let risposta = [];
        //console.log(nums_giorn);

        for (let num_giorn of nums_giorn) {
            //console.log(num_giorn);
            let get1 = await token.contratti.giornale.methods.get1(num_giorn).call(transaction_params,
                function (err, result) {
                    console.log('sto fetchando parte 1 giornale');
                    //console.log(result);
                    //console.log(result);
                    if (err) {
                        response.status(500).send();
                        console.log(err);
                    } else return result;
                });
            //console.log(get1);
            let get2 = await token.contratti.giornale.methods.get2(num_giorn).call(transaction_params,
                function (err, result) {
                    console.log('sto fetchando parte 2 giornale');
                    //console.log(result);
                    //console.log(result);
                    if (err) {
                        response.status(500).send();
                        console.log(err);
                    } else return result;
                });
            //console.log(get2);
            let get3 = await token.contratti.giornale.methods.get3(num_giorn).call(transaction_params,
                function (err, result) {
                    console.log('sto fetchando parte 3 giornale');
                    //console.log(result);
                    //console.log(result);
                    if (err) {
                        response.status(500).send();
                        console.log(err);
                    } else return result;
                });
            //console.log(get3);
            let righi = decoder_output.decodeGiornale(get1, get2, get3);

            let giornale = {"num_giorn": parseInt(num_giorn,10), "righi": righi, "timestamp" : date_giorn[num_giorn-1].getTime()};
            //console.log(giornale);
            console.log(JSON.stringify(risposta));
            risposta.push(giornale);
        }
        return response.send(risposta);

    })
    .post(async function (req, response) { // only lo user che è direttore dei lavori insertGiornale(uint[] memory _quantita, string[] memory _qualita, uint[] memory _ore,string memory _descrizione, string[] memory _attrezzature, uint[] memory _quantita_attr)
        if (!req.body.personale || !req.body.attrezzatura || !req.body.descrizione) {
            return response.status(400).send();
        }

        let token = response.locals.token; 


        if (token.user_id.substring(0, 3) !== "dir")
            return response.status(403).send();

        let quant_person = [];
        let tipo_person = [];
        let ore_person = [];
        let attrez = [];
        let quant_attrez = [];
        let esci = false;
        try {
            req.body.personale.forEach(element => {
                if (!element.quantita || !element.ore || !element.qualita) throw "break";
                if (Number.isNaN(parseInt(element.quantita, 10)) || Number.isNaN(parseInt(element.ore, 10))) throw "break";
                quant_person.push(parseInt(element.quantita));
                tipo_person.push(element.qualita);
                ore_person.push(parseInt(element.ore));

            });

        } catch (e) {
            esci = true;
        }

        if (esci) return response.status(400).send();
        try {
            req.body.attrezzatura.forEach(element => {
                if (!element.nomeAtt || !element.quantitaAtt) throw "break";
                if (!parseInt(element.quantitaAtt)) throw "break";
                attrez.push(element.nomeAtt);
                quant_attrez.push(parseInt(element.quantitaAtt));
            });
        } catch (e) {
            esci = true;
        }

        if (esci) return response.status(400).send();
        else if (!quant_person.length || //controllo solo che quantita personale sia un vettore diverso da 0 elementi, poichè faccio i controlli sopra, non può capitare che i vettori abbiano un numero di elementi differenti e quindi basta controllare uno dei tre
            !req.body.descrizione.length || !attrez.length) //stesso discorso per le attrezzature
            return response.status(400).send();

        let transaction_params = {
            from: Web3.utils.toChecksumAddress(token.quo_addr),
            privateFor: token.privateFor,
            gasPrice: 0,
            gas: 70000000
        };
        console.log(req.body.num_giorn);
        console.log(req.body.rigo);
        if (!req.body.num_giorn && !req.body.rigo)
            await token.contratti.giornale.methods.insertGiornale(quant_person, tipo_person, ore_person, req.body.descrizione, attrez, quant_attrez).send(transaction_params)
                .on("error", (err) => {
                    console.log(err);
                    return response.status(500).send();
                })
                .on("receipt", (receipt) => {
                    console.log('sto aggiungendo un rigo al giornale');
                    console.log(receipt.transactionHash);
                    return response.status(204).send(); 
                });

        else if ((!Number.isNaN(parseInt(req.body.num_giorn, 10)) && !Number.isNaN(parseInt(req.body.rigo, 10))))
            await token.contratti.giornale.methods.updateGiornale(quant_person, tipo_person, ore_person, req.body.descrizione, attrez, quant_attrez, req.body.rigo, req.body.num_giorn).send(transaction_params)
                .on("error", (err) => {
                    console.log(err);
                    return response.status(500).send();
                })
                .on("receipt", (receipt) => {
                    console.log('sto modificando un rigo al giornale');
                    console.log(receipt.transactionHash);
                    return response.status(204).send(); 
                });
        else response.status(400).send();


    })
    .put(function (req, response) {
        let token = response.locals.token; 


        if (token.user_id.substring(0, 3) !== "dir")
            return response.status(403).send();

        let transaction_params = {from: token.quo_addr, privateFor: token.privateFor, gasPrice: 0, gas: 7000000};
        token.contratti.giornale.methods.finishGiornale().send(transaction_params)
            .on("error", (err) => {
                console.log(err);
                return response.status(500).send();
            })
            .on("receipt", (receipt) => {
                console.log('sto chiudendo un giornale');
                console.log(receipt.transactionHash);
                return response.status(204).send();
            });

    });

module.exports = router;