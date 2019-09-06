const auth = require("../utility/authorization");
var express = require('express');
const path = require('path');
const rnd = require('../utility/random_string');
const fs = require('fs');
const serv_config = require('../utility/server_config');
const mysql = require('mysql');

var router = express.Router();

router.route('/')
    .put(function (req, res) {
        try {
            let token = res.locals.token;
            if (!token) return res.status(401).send();

            req.pipe(req.busboy);
            let localUrl;
            let relativeUrl;
            let name;
            //fs.mkdirSync('../public/allegati/',{recursive : true});
            fs.mkdirSync(path.join(__dirname, "..", "public", "allegati","libretto"),{recursive : true});
            do {
                name = rnd(32);
                relativeUrl = path.join("allegati", "libretto", name);
                localUrl = path.join(__dirname, "..", "public", relativeUrl);
            } while (fs.existsSync(localUrl));

            req.busboy.on('file', function (fieldname, file, filename) {
                if (!/^.*\.(txt|TXT|jpg|JPG|png|PNG|gif|GIF|doc|DOC|pdf|PDF)$/.test(filename) && filename.length > 50)
                    return res.status(401).send();
                let data_format= filename.split('.').pop();
                let stream = fs.createWriteStream(localUrl+'.'+data_format);
                file.pipe(stream);
                stream.on('close', function () {

                    let db = mysql.createConnection({
                        host: serv_config.db_address,
                        user: serv_config.db_user,
                        password: serv_config.db_password,
                        database: serv_config.db_name
                    });

                    const query = "INSERT INTO attachment (saved_name, original_name, user) " +
                        "VALUES ( ? , ? , ? ); ";

                    db.query(query, [name+'.'+data_format, filename, token.user_id], function (err, response) {
                        console.log(err);
                        if (err) return res.status(500).send();
                        res.send({path : relativeUrl+'.'+data_format});
                    });
                });
            });
        } catch (err) {
            res.status(400).send();
        }
    })
    .get(function (req, res) {
        try {
            let token = res.locals.token;
            let db = mysql.createConnection({
                host: serv_config.db_address,
                user: serv_config.db_user,
                password: serv_config.db_password,
                database: serv_config.db_name
            });

            const query = "SELECT * FROM attachment WHERE user = ? ";

            if (!/^[a-zA-Z0-9.\-_]+$/.test(token.user_id))
                return res.send({status: "bad request"});

            db.query(query, token.user_id, function (err, response) {
                if (err) return res.status(500).send();
                if (!response) res.status(404).send();

                let attachments = [];

                response.forEach(function (value) {
                    let item = {};
                    item.nome_file = value.original_name;
                    item.nome_server = value.saved_name;
                    item.timestamp = value.date;

                    attachments.push(item);
                });

                res.send(attachments);
            });
        } catch (err) {
            res.status(400).send();
        }
    });

router.route('/libretto/:name')
    .get(function (req, res, next) {
        try {
            let token = res.locals.token;
            if (!token) return res.status(401).send();

            let db = mysql.createConnection({
                host: serv_config.db_address,
                user: serv_config.db_user,
                password: serv_config.db_password,
                database: serv_config.db_name
            });

            if (!/^[a-zA-Z0-9.]+$/.test(req.params.name))
                return res.status(400).send();

            const query = "SELECT * FROM attachment WHERE saved_name = ? ";

            db.query(query, req.params.name, function (err, response) {
                if (err) return res.status(500).send();

                if (response && response.length > 0 && (response[0].visible || response[0].user === token.user_id)) return next();
                else return res.status(400).send();
            });
        } catch (err) {
            res.status(400).send();
        }
    });

module.exports = router;