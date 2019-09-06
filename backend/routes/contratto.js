
var express = require('express');
var router = express.Router();
// caricamento delle altre rotte
var gl = require('./contratto/giornaleLavori');
var lm = require('./contratto/librettoMisure');
var rc = require('./contratto/registroContabilita');
var sal = require('./contratto/statoAvanzamentoLavori');

router.use('/giornaleLavori',gl);
router.use('/librettoMisure',lm);
router.use('/registroContabilita',rc);
router.use('/statoAvanzamentoLavori',sal);



router.route('/controfirma')
    .get(function(req, res) {
        res.send('get controfirma');
    });



module.exports = router;