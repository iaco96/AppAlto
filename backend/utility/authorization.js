const jwt = require('jsonwebtoken');
const randomString = require('./random_string');
const getToken = require('./get_token');

module.exports.verify = function (token) { // controlla che il token sia valido e dia firmato correttamente con la key che passiamo che generiamo al momento in cui si effettua il login
    // la key viene usata solo per firmare il token, cel'ha solo il server ed è legata ad uno specifico token jwt

    try {
        // con decode si prende il payload della token
        // nel nostro caso è solo l'id del token all'interno dell'oggetto globale che li contiene tutti

        const data = jwt.decode(token);
        // verifica che il token non sia scaduto eventualmente lancia eccezione
        //controlla che la firma sia corretta, la chiave cerca di recuperarla dall'ogetto globale specificato sopra
        if (typeof tokens[data.token_id] === "undefined") return false;
       /* console.log("token da verificare");
        console.log("-------"+token+"------- per verificare che non ci siano spazi indesiderati");
        console.log("token id estratto dal token inviato");
        console.log(data.token_id);
        console.log("token in ram");
        console.log("-------"+tokens[data.token_id].jwt+"------- per verificare che non ci siano spazi indesiderati");
        console.log("private key");
        console.log(tokens[data.token_id].jwt_key)*/
        jwt.verify(token, tokens[data.token_id].jwt_key);
        return true;
    } catch (err) {
        console.log(err);
        try {
            const data = jwt.decode(token);
            delete tokens[data.token_id];
        } catch (err2) {
        }
        return false;
    }
};

module.exports.getTokenAssociated = function (token) { //a partire dal token
    try { 
        // ne decodificchiamo il payload
        const data = jwt.decode(token);
        //andiamo a prendere nella variabile globale il token corretto a partire dall'id specificato nel payload

        return tokens[data.token_id];
    } catch (err) {
        console.log(err);
        return undefined;
    }
};

module.exports.generateToken = async function ( username,NumToken, res) {
    // si va a costruire il token con tutte le informazioni e i contratti instanziati per la connessione alla blockchainb
    let token_db = await getToken.getToken(username);
    //si crea il payload jwt che verra firmato e restituito all'utente
    let jwt_payload = {
        //questo token id verrà usato per mappare il token all'interno della variabile globale
        token_id: "idtoken" + NumToken
        
    };
    console.log(NumToken);
    //viene creata una chiave privata per ogni token con cui firmare il payload, per essere sicuro che arrivi dal server quel token
    let privateKey = randomString(128);
    // si firma il payload e vi si accoda la firma per creare il jsonwebtoken
    //che impostiamo di scadenza a 3 ore
    await jwt.sign(jwt_payload, privateKey, {expiresIn: '3h'}, async function (err, token) {
        if (err) {
            console.log(err);
            return res.status(500).send();
        } else {
            console.log(token_db.user_id);
            if (token_db.user_id.substring(0, 3) != "rup") { // mettiamo il controllo sulla variabile che segna se il contratto di apparlo risulta tutto stabilito, eventualmente non permette il login
                let transaction_params = {from: token_db.quo_addr, gasPrice: 0, gas: 7000000000};
                //console.log("effettuo il controllo");
                let esci = await token_db.contratti.misure.methods.getInserimenti().call(transaction_params,
                    function (err, result) {
                        //console.log('sto fetchando un giornale');
                        //console.log(result);
                        //console.log(result);
                        if (err) res.send({status: "!ok"});
                        else return result;
                    });
                // console.log(esci);
                if (!esci) return res.status(302).send(); // contratti non finiti allora avviene un redirect temporaneo al
                // momento del login
            }
            //se va a buon fine la creazione di questo token
            // si accodano altri campi al token precendetemente creato per la connessione alla blockchain
            // ci si salva il token
            token_db.jwt = token;
            // la sua chiave, necessaria per i verify
            token_db.jwt_key = privateKey;
            // e viene salvato tutto nella variabile globale appunto nell'indice token_id, creato sopra e che si troverà nel payload del jwt
            tokens[jwt_payload.token_id] = token_db;
            //viene inviato il token
            res.cookie("token", token, {httpOnly:true});
            //res.setHeader('Set-Cookie', 'token=' + token + '; HttpOnly');
            res.send({token: token, nome : token_db.nome, cognome : token_db.cognome, ruolo : token_db.user_id.substring(0,3)}); // invio la risposta
            
            
        }
    });
};

