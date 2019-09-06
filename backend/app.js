const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const auth = require('./utility/authorization');
const {SHA512} = require("sha2");
const mysql = require('mysql');
const cors = require('cors');
const path = require('path');
const busboy = require('connect-busboy');
var cookieParser = require('cookie-parser');

const app = express();

app.use(busboy( { limits: { fileSize: 16777216, files: 1 }}));
app.use(cors());
global.serv_config = require('./utility/server_config');

global.tokens = {};

let progNumToken = 0;

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
app.use(busboy( { limits: { fileSize: 16777216 }}));
app.use(cookieParser());

app.route("/login").post(async function (req, res) {
    // andare a costruire il token a partire dal db, poi restituire solo l'indice del token
    const username = req.body.username;
    const password = req.body.password;

    if (username && password && /^[a-zA-Z0-9.\-_]+$/.test(username)) { // testiamo la stringa per evitare caratteri strani e SQLi
        const hashed_password = SHA512(password).toString('hex');
        let db = await mysql.createConnection({
            host: serv_config.db_address,
            user: serv_config.db_user,
            password: serv_config.db_password,
            database: serv_config.db_name
        });
        const sql_user = "SELECT users.user_id, users.nome, users.cognome FROM users " +
            "WHERE users.user_id = ? AND users.password = ?";
        let response = null;
        // si va vedere se c'è un match tra il db e le credenziali passate
        response = await db.query(sql_user, [username, hashed_password], function (err, response) {
            console.log("callback query");
            if (err) {
                res.status(500).send({status: "db down"});
                return null;
            }
            if (response == undefined) return;
            if (response.length == 0) return res.status(401).send({status: "bad_credentials"});
            //a partire dallo username cerca se ci siano dei token a lui associati, se ci sono li assegna alla variabile token_found
            let token_found = Object.keys(tokens).findIndex(x => tokens[x].user_id === username); // torna -1 se non trova niente
            if (token_found >= 0) {
                //se ha trovato un token che matcha con lo user_id
                //in questo modo prendi l'id del token associato allo user_id, che fa da indice sulla variabile globale
                let id = Object.keys(tokens)[token_found];
                // controlla che il token sia definito, che jwt sia definito , e la chiave per firmare il jwt sia definita
                if (tokens[id] != undefined && tokens[id].jwt != undefined && tokens[id].jwt_key != undefined) {
                    // verify verifica che il token sia valido e non scaduto
                    jwt.verify(tokens[id].jwt, tokens[id].jwt_key, (err, authorizedData) => {
                        if (err) {
                            // se è scaduto o non è valido per qualche altro motivo, lo si cancella dalla variabile globale
                            delete tokens[id];
                            //se ne genera uno nuovo
                            auth.generateToken(username,progNumToken++, res);
                        } else {
                            // altrimenti si manda il token già salvato
                            res.setHeader('Set-Cookie', 'token=' + tokens[id].jwt + '; HttpOnly');
                            return res.send({token: tokens[id].jwt, nome : tokens[id].nome, cognome : tokens[id].cognome, ruolo : tokens[id].user_id.substring(0,3)});
                        }
                    });
                }// se il token non è salvato nella variabile globale lo rigenera
                else auth.generateToken(username,progNumToken++, res);
            }// se non lo ha trovato lo genera
            else  auth.generateToken(username,progNumToken++, res);


        });
    } // inseriti caratteri strani, contro sql injection
    else return res.status(401).send();

});


app.use('/*', function (req, res, next) { // middleware, viene usato ad ogni chiamata per ogni rotta, che il server riceve (/*)
    let token = undefined;
    //console.log(req.cookies['token']);
    //console.log(req.headers.authorization);

    if(typeof req.cookies['token'] != "undefined"){
        console.log("prendo il cookie");
        token = req.cookies['token'];
    } // cerca se definito il cookie con il token dentro
        
    else if (req.headers.authorization) { //oppure
        // va a prendere  il vettore di autorizzazione, composto da Bearer e token
        // in questo modo parsa tutti gli spazi lo split
        const authVector = req.headers.authorization.split(/\s+/);
        if (authVector[0] === "Bearer")
            token = authVector[1];
    }
    //console.log(token);
    if (typeof token !== "undefined") {
        // controlla che sia tutto corretto e poi procede
        if (auth.verify(token)){
            //va a recuperare il token nell'oggetto globale a partire dal valore del token che contiene l'indice di dove si trova in quell'oggetto globale
            res.locals.token = auth.getTokenAssociated(token);
            if (!token) return res.status(500).send();
            next();
        }
            
        else res.status(401).json();
    } else res.status(401).json();
});

const appalto = require('./routes/appalto');
const contratto = require('./routes/contratto');
const attach = require('./routes/allegati');
const check_notify = require('./routes/check');

app.use('/appalto', appalto);
app.use('/contratto', contratto);
app.use('/allegati', attach);
app.use('/check', check_notify);

app.use(express.static(path.join(__dirname, 'public')));

app.route('/info')
.get(function (req, response){
    let token = response.locals.token; 
    return response.send({nome : token.nome, cognome : token.cognome, ruolo : token.user_id.substring(0,3)});
});

app.listen(3000, function () {
    console.log('AppAlto listening on port 3000!');
});