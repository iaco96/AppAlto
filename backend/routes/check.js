const Web3 = require("web3");
const express = require('express');
const router = express.Router();
const decoder_output = require("../utility/decoderBloChaOutput");
const bodyParser = require('body-parser');
const auth = require("../utility/authorization");

router.use(bodyParser.urlencoded({
    extended: true
}));
router.use(bodyParser.json());

router.route('/')
    .get(async function (req, response) { // come quella del giornale
        let token = response.locals.token; 
        console.log(token.nome);
        let transaction_params = {from: token.quo_addr, privateFor: token.privateFor, gasPrice: 0, gas: 7000000};
        let risposta={};
        
        if (token.user_id.substring(0, 3) == "dir"){
            risposta.libretti = []; // conterrà tutti i libretti in cui ci sono righi in cui inserire la riserva da parte del direttore
            // faccio il controllo sul giornale per vedere se oggi è stato terminato il giornale, controllo sulla getGiornale data se il penultimo giornale ha come data quella odierna
            // in caso contrario c'è da inserire il giornale dei lavori
            giornali = await token.contratti.giornale.methods.getGiornaleData().call(transaction_params,
                function (err, result) {
                    //console.log('sto fetchando un giornale');
                    //console.log(result);
                    console.log(result);
                    if (err) return null;
                    else return result;
                });
            if(typeof giornali == "undefined")  return  response.status(500).send();

            let last_giorn = new Date(Math.round(parseInt(giornali[1][giornali[1].length-2],10)/ 1000000)); // prendo la data dell'ultimo giornale terminato

            let oggi = new Date();
            console.log(oggi);
            console.log(last_giorn);
            if (oggi.getUTCMonth() == last_giorn.getUTCMonth() && oggi.getUTCFullYear() == last_giorn.getUTCFullYear()
                    && oggi.getUTCDate() == last_giorn.getUTCDate())  // non si deve visualizzare quello corrente che ancora non è concluso
                    risposta.giornale = true; // significa già compilato
            else risposta.giornale = false; // da compilare
            
            // vado a controllare i libretti che devono ancora aver inserita la riserva
            let libretti_time = null;
            libretti_time = await token.contratti.libretto.methods.getLibrettoData().call(transaction_params,
                function (err, result) {
                    if (err) response.status(500).send();
                    else return result;
                });

            if (typeof libretti_time == "undefined") return;
            //console.log(libretti_time);
            libretti_time[0].pop();  //rimuove l'ultimo elemento di questo array
            let libretti = libretti_time[0];
            //console.log(libretti);
            for(let num_libretto of libretti){ // per ogni libretto terminato fetcho le riserve e controllo che sia firmato con riserva e che la riserva non sia ancora inserita
                let get1 = null;
                console.log(num_libretto);
                get1 = await token.contratti.riserve.methods.getRiserve1(parseInt(num_libretto,10)).call(transaction_params,
                    function (err, result) {
                        console.log('sto fetchando parte 1 riserve');
                        if (err) {
                            console.log(err);
                            return response.status(500).send();

                        } else return result;
                    });
                if (typeof get1 == "undefined") return;
                let firme_lib = decoder_output.decodeFirmeRiserva(get1);
                //console.log(get1);
                //console.log(firme_lib);
                for (let firma of firme_lib ) {
                    if(firma.firmato_riserva && !firma.riserva_dir){
                    // se trovo anche solo un rigo che rispetta quelle caratteristiche, inserisco nella risposta il numero del libretto 
                        risposta.libretti.push({"num_libretto":parseInt(num_libretto,10),"timestamp":Math.round(parseInt(libretti_time[1][num_libretto-1],10)/1000000)});
                        // poi esco dal for, perchè così non ciclo per gli altri righi
                        break;
                    }
                }
            }
            // vado a controllare se con i registri di contabilità già creati si è superata la soglia
            // perchè in quel caso il dir deve abilitare il calcolo del sal, finchè non verrà calcolato il sal, non si potrà andare 
            // avanti nel calcolo dei registro di contabilità successivi da parte del rup, va anche nel rup tale informazione
            let soglia_superata = null;
            soglia_superata = await token.contratti.misure.methods.getSuperata().call(transaction_params,
                function (err, result) {
                    if (err) response.status(500).send();
                    else return result;
                });

            if (typeof soglia_superata == "undefined") return;
            risposta.soglia_superata = soglia_superata;
            // ritorno anche il numero di sal da compilare in caso soglia superata sia true
            if(soglia_superata) {
                let num_sal = null;
                num_sal = await token.contratti.avanzamento.methods.getSal().call(transaction_params,
                    function (err, result) {
                        if (err) response.status(500).send();
                        else return result;
                    });
                if (typeof num_sal == "undefined") return;
                risposta.num_sal = parseInt(num_sal,10);
            } 
            // contratti terminati ------------------------
            let lavori_terminati = await token.contratti.misure.methods.getPercentuali().call({from: token.quo_addr})
            .then(function (result, err) { // non so se è il modo corretto di intercettare anche l'errore, vedere le api javascript
                console.log('sto fetchando la percentuale dela lavoro');
                console.log(result);
                if (err) {
                    console.log(err);
                    return response.status(500).send();
                }
                return result;
            });
            console.log(risposta);
            risposta.lavori_terminati = lavori_terminati;
            console.log(risposta);

                
            return response.send(risposta);

        }
// -------------------------------------------
        if (token.user_id.substring(0, 3) == "rup"){
            // controllo se gli inserimenti sono finiti prima di tutto, perchè eventualmente il controllo sull'enable registro non lo faccio
            let inser_terminati = null;
            inser_terminati = await token.contratti.misure.methods.getInserimenti().call(transaction_params,
                function (err, result) {
                    //console.log('sto fetchando un giornale');
                    //console.log(result);
                    //console.log(result);
                    if (err) response.status(500).send();
                    else return result;
                });
                console.log("inser_terminati");
                console.log(inser_terminati);
            if (typeof inser_terminati == "undefined") return;
            //se gli inserimenti non sono terminati invia questa info come risposta e anche se soglia è inserita e i lavori se sono inseriti
            risposta.inser_terminati = inser_terminati ;

            //-------- controllo contratti finiti
                /// contratto terminato -------------------------------------------
            let lavori_terminati = await token.contratti.misure.methods.getPercentuali().call({from: token.quo_addr})
            .then(function (result, err) { // non so se è il modo corretto di intercettare anche l'errore, vedere le api javascript
                console.log('sto fetchando la percentuale dela lavoro');
                console.log(result);
                if (err) {
                    console.log(err);
                    return response.status(500).send();
                }
                return result;
            });
            console.log(risposta);
            risposta.lavori_terminati = lavori_terminati;
            console.log(risposta);





            ///---- fine controllo
            if(!inser_terminati) {
                // recupero il numero di lavori, se è 0 da frontend va segnalata la cosa
                let num_lavori = null;
                num_lavori = await token.contratti.misure.methods.getNumeroLavori().call({from: token.quo_addr})
                .then(function (result, err) { // non so se è il modo corretto di intercettare anche l'errore, vedere le api javascript
                    console.log('sto fetchando i lavori');
                    //console.log(result);
                    if (err) {
                        console.log(err);
                        return response.status(500).send();
                    }
                    return result;
                });
                console.log("num_lavori");
                console.log(num_lavori);
                if (typeof num_lavori == "undefined") return;
                risposta.num_lavori = parseInt(num_lavori,10);
                // recupero la soglia, se è 0 va segnalato da frontend
                let soglia = null;
                soglia = await token.contratti.misure.methods.getSoglia().call({from: token.quo_addr})
                .then(function (result, err) { // non so se è il modo corretto di intercettare anche l'errore, vedere le api javascript
                    console.log('sto fetchando la soglia');
                    //console.log(result);
                    if (err) {
                        console.log(err);
                        return response.status(500).send();
                    }
                    return result;
                });
                console.log("soglia");
                console.log(soglia);
                if (typeof soglia == "undefined") return;
                risposta.soglia = parseInt(soglia,10);
                // invioo la risposta così
                return response.send(risposta);
            }
            // se gli inserimenti sono terminati, significa che devo controllare se il rup ha qualche registro da abilitare e quanti ne ha da abilitare, faccio ritornare
            // una lista di libretti controllati con checklibrettiOK, andando prima a recuperare a che numero di registro siamo arrivati, così lo uso come indice di inizio per il ciclo
            risposta.registri_da_compilare = [];
            let num_reg_corrente = null; // numero di registro corrente, ancora da abilitare
                num_reg_corrente = await token.contratti.registro.methods.getRegistro().call({from: token.quo_addr})
                .then(function (result, err) { // non so se è il modo corretto di intercettare anche l'errore, vedere le api javascript
                    console.log('sto fetchando il numero di registro corrente');
                    //console.log(result);
                    if (err) {
                        console.log(err);
                        return response.status(500).send();
                    }
                    return result;
                });
            
            if (typeof num_reg_corrente == "undefined") return;
            console.log(num_reg_corrente);
            // vado a prendere i libretti
            let libretti_time = null;
            libretti_time = await token.contratti.libretto.methods.getLibrettoData().call(transaction_params,
            function (err, result) {
                if (err) response.status(500).send();
                else return result;
            });

            if (typeof libretti_time == "undefined") return;
            if (libretti_time[0].lenght ==1){ // ancora nessun libretto è terminato
                return response.send(risposta);
            }
            libretti_time[0].pop();  //rimuove l'ultimo elemento di questo array
            let libretti = libretti_time[0];  // tolgo l'ultimo libretto che so essere non terminato
            console.log(libretti);
            console.log(libretti.slice(num_reg_corrente-1));
            for(let num_libretto of libretti.slice(num_reg_corrente-1)){ // per ogni libretto terminato faccio checkLibrettoOk per sapere se il libretto sia pronto per il calcolo del registro contabilità parto dal numero di registro corrente, questo trick per ridurre il numero di cicli si potrebbe usare anche negli altri for, da ottimizzare
                let librettoOK = null;
                librettoOK = await token.contratti.libretto.methods.checkLibrettoOk(num_libretto).call(transaction_params,
                    function (err, result) {
                        console.log('sto verificando il libretto');
                        if (err) {
                            console.log(err);
                            return response.status(500).send();

                        } else return result;
                    });
                if (typeof librettoOK == "undefined") return;
                // Controllo se librettoOK è true
                if(!librettoOK) break;
                // se arriva qui significa che il libretto è pronto per essere compilato
                risposta.registri_da_compilare.push({"num_libretto" : parseInt(num_libretto,10), "timestamp":Math.round(parseInt(libretti_time[1][num_libretto-1],10)/1000000)});
            }

            // parte del sal, blocca gli enable registro eventualmente
            let soglia_superata = null;
            soglia_superata = await token.contratti.misure.methods.getSuperata().call(transaction_params,
                function (err, result) {
                    if (err) response.status(500).send();
                    else return result;
                });
                console.log(soglia_superata);
            if (typeof soglia_superata == "undefined") return;
            risposta.soglia_superata = soglia_superata;
            
            return response.send(risposta);

        }
//_----------------------------------------------------------
        if (token.user_id.substring(0, 3) == "dit"){
            risposta.libretti = []; // conterrà tutti i libretti in cui ci sono righi in cui inserire la riserva da parte del direttore
            // vado a controllare i libretti che devono ancora aver inserita la firma della ditta
            let libretti_time = null;
            libretti_time = await token.contratti.libretto.methods.getLibrettoData().call(transaction_params,
                function (err, result) {
                    if (err) response.status(500).send();
                    else return result;
                });

            if (typeof libretti_time == "undefined") return;
            libretti_time[0].pop();  //rimuove l'ultimo elemento di questo array
            let libretti = libretti_time[0];
            for(let num_libretto of libretti){ // per ogni libretto terminato fetcho le riserve e controllo che sia firmato con riserva e che la riserva non sia ancora inserita
                let get1 = null;
                get1 = await token.contratti.riserve.methods.getRiserve1(num_libretto).call(transaction_params,
                    function (err, result) {
                        console.log('sto fetchando parte 1 riserve');
                        if (err) {
                            console.log(err);
                            return response.status(500).send();

                        } else return result;
                    });
                if (typeof get1 == "undefined") return;
                let righi_lib = decoder_output.decodeFirmeRiserva(get1);
                console.log(righi_lib);
                for (let rigo of righi_lib ) {
                    if(!rigo.firmato){ // controllo sul rigo se ha firmato
                    // se trovo anche solo un rigo che rispetta quelle caratteristiche, inserisco nella risposta il numero del libretto 
                    risposta.libretti.push({"num_libretto":parseInt(num_libretto,10),"timestamp":Math.round(parseInt(libretti_time[1][num_libretto-1],10)/1000000)});
                        // poi esco dal for, perchè così non ciclo per gli altri righi
                        break;
                    }
                }

            }
            console.log("bla,bla-----------------------");
            // aggiungo per ogni attore nella risposta il campo che dice se il contratto risulta terminato con tutti i lavori con percentuali al 100%
            // getPercentuali()
            let lavori_terminati = await token.contratti.misure.methods.getPercentuali().call({from: token.quo_addr})
            .then(function (result, err) { // non so se è il modo corretto di intercettare anche l'errore, vedere le api javascript
                console.log('sto fetchando la percentuale dela lavoro');
                console.log(result);
                if (err) {
                    console.log(err);
                    return response.status(500).send();
                }
                return result;
            });
            console.log(risposta);
            risposta.lavori_terminati = lavori_terminati;
            console.log(risposta);
            return response.send(risposta);
        }
    });

module.exports = router;