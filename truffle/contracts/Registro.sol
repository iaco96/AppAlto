pragma solidity ^0.5.0;
pragma experimental ABIEncoderV2;

import "./Misure.sol";
import "./StringUtils.sol";
import "./Libretto.sol";

contract Registro {
    
    struct RegistroDiContabilita {
        uint data_registro;
        uint numero_libretto; // ? il numero del libretto corrispondente
        uint rigo_libretto; // ? il rigo del libretto corrispondente
        string codice_lavoro;
        string nome_lavoro; 
        uint percentuale_totale; // percentuale del lavoro
        uint percentuale_i; // percentuale del lavoro i esimo sul totale
        uint percentuale_raggiunta; // percentuale raggiunta sul 100%
        uint costo_i; // costo del lavoto i esimo
        uint costo_raggiunto; // costo del lavoro raggiunto con la percentuale raggiunta
    }
    
    mapping (uint => RegistroDiContabilita) private registri;
    uint private numero_totale_registri = 1; // indica il numero totale di righi di tutti i registri
    uint[] private righi_max_registro;
    uint private registro = 1;
    
    mapping(uint => uint) private data;
    
    
    function getRegistro() public returns(uint) {
        return registro;
    }
    
    // a partire da una certa data, restituisce il numero di registro 
    function getRegistroData (uint _data) public returns(uint, uint) {
        for (uint i = 0; i < (registro - 1); i++) {
            if (data[i] == _data) {
                return (i, _data);
            }
        }
    }
    
    // se non viene passata una data, si restituisce la lista dei registri con la data 
    function getRegistroData() public returns(uint[] memory, uint[] memory) {
        uint[] memory reg = new uint[](registro);
        uint[] memory date = new uint[](registro);
        
        uint cont = 0;
        
        for (uint i = 0; i < (registro - 1); i++) {
            reg[cont] = i+1;
            date[cont] = data[i];
            cont++;
        }
        return(reg, date);
    }
    
    
    // controlla se un certo libretto � completo
    function checkLibretto() private returns(bool) {
        if (l.checkLibrettoOk(registro)) {
            return true;
        }
        return false;
    }
    
    // serve per contenere il codice del lavoro con il rigo e numero di registro in cui ? stato inserito nel registro, in modo poi da poterlo utilizzare
    struct Collocazione {
        string codice;
        uint numero; // indica il numero del libretto
        uint rigo;
        uint id;
    }
    
    mapping (string => Collocazione) private mapping_collocazione;
    string[] private collocazione;
    
    
    // cerca se dentro collocazione esiste gi? il codice del lavoro che si vuole inserire
    function esiste(string memory _codice) private returns (bool) {
        // se la lunghezza di collocazione ? nulla allora sicuramente non c ? quel codice, perche ? un array vuoto
        if (collocazione.length == 0) {
            return false;
        }
        // altrimenti si cerca e si controlla se il codice ? contenuto all interno della struttura.
        // attraverso la mapping_collocazione[_codice] si restituisce il riferimento ad un istanza della struct Collocazione 
        // con l id si accede al numero identificativo di quell istanza che ci serve poi per trovare il codice corrispondente
        // infatti passando questo intero a collocazione andiamo ad ottenere il codice che si trova in quell elem dell array
        return (StringUtils.compareStrings(collocazione[mapping_collocazione[_codice].id], _codice));
    }
    
    // serve per aggiungere la collocazione di un codice
    function addCollocazione(string memory _codice, uint _rigo, uint _numero) private {
        // se non esiste gia un istanza con quel codice allora la si va ad inserire
        if (!esiste(_codice)) {
            Collocazione memory coll = Collocazione(_codice, _numero, _rigo, collocazione.length);
            mapping_collocazione[_codice] = coll;
            collocazione.push(_codice);
        }
        // altrimenti si fa un update del valore del registro e del rigo precedenti, dato che ho una collocazione piu aggiornata
        else {
            updateCollocazione(_codice, _numero, _rigo);
        }
    }
    
    
    // fa un update del registro e del rigo 
    function updateCollocazione (string memory _codice, uint _numero, uint _rigo) private {
        mapping_collocazione[_codice].numero = _numero;
        mapping_collocazione[_codice].rigo = _rigo;
    }
    
    
    // serve per restituire i vari codici di lavoro con la relativa collocazione, ovvero rigo e registro
    function findRegistri() public returns(string[] memory, uint[] memory, uint[] memory) {
        uint lunghezza = collocazione.length;
        string[] memory codici = new string[](lunghezza);
        uint[] memory righi = new uint[](lunghezza);
        uint[] memory regi = new uint[](lunghezza);
        uint j = 0;
        for (uint i = 0; i < lunghezza; i++) {
            codici[j] = mapping_collocazione[collocazione[i]].codice;
            righi[j] = mapping_collocazione[collocazione[i]].rigo;
            regi[j] = mapping_collocazione[collocazione[i]].numero;
            j++;
        }
        return (codici, righi, regi);
    }
    
    
    // restituisce il contenuto di un rigo di un registro 
    function findContenuto (uint _registro, uint _rigo) public returns(uint, uint, uint, uint) {
        if (_registro == 1) {
            uint lunghezza = righi_max_registro[_registro - 1] - 1;
            
            for (uint8 j = 0; j < lunghezza; j++) {
                if (registri[j].numero_libretto == _registro && registri[j].rigo_libretto == _rigo) {
                    return (registri[j].percentuale_totale, registri[j].percentuale_i, registri[j].percentuale_raggiunta, 
                    registri[j].costo_raggiunto);
                }
            }
        }
        else {
            for (uint j = (righi_max_registro[_registro - 2] - 1); j < (righi_max_registro[_registro - 1] - 1); j++) {
                if (registri[j].numero_libretto == _registro && registri[j].rigo_libretto == _rigo) {
                    return (registri[j].percentuale_totale, registri[j].percentuale_i, registri[j].percentuale_raggiunta, 
                    registri[j].costo_raggiunto);
                }
            }
        }
    }
    
    
    
    
    // fa l inserimento nel registro dei righi
    function insertRegistro (uint _libretto, uint _rigo_libretto) private {
        registri[numero_totale_registri - 1].data_registro = now;
        registri[numero_totale_registri - 1].numero_libretto = _libretto;
        registri[numero_totale_registri - 1].rigo_libretto = _rigo_libretto;
        string memory codice_lavoro = l.findCodice(_libretto, _rigo_libretto);
        registri[numero_totale_registri - 1].codice_lavoro = codice_lavoro;
        registri[numero_totale_registri - 1].nome_lavoro = m.findNomeLavoro(codice_lavoro);
        uint num_lavoro = m.findNumeroLavoro(codice_lavoro);
        (string memory x, string memory y, uint perc_compl, uint z, uint cost_tot) = m.readLavori(num_lavoro);
        registri[numero_totale_registri - 1].percentuale_totale = perc_compl; 
        registri[numero_totale_registri - 1].percentuale_i = m.countPercentualeLavoro(codice_lavoro); 
        registri[numero_totale_registri - 1].percentuale_raggiunta = m.countPercentualeRaggiunta(codice_lavoro); 
        registri[numero_totale_registri - 1].costo_i = cost_tot; 
        registri[numero_totale_registri - 1].costo_raggiunto = m.countCostoRaggiunto(codice_lavoro); 
    
        addCollocazione(codice_lavoro, _rigo_libretto, _libretto);
    }
    
    
    // si permette di elaborare il registro di contabilit? solo se il libretto corrispondete ? completo
    // ovvero: 
    // - si ? passati a compilare il successivo libretto, cioe ? stata chiamata la funzione finishLibretto
    // - tutti i righi siano stati firmati
    // - se firmati con riserva, sia stata completata la riserva
    
    // serve al rup per attivare il registro di contabilit?
    // inserisce all interno della struct i dati che servono per il modello del registro
    function enableRegistroContabilita () public onlyRup {
        // richiede che la soglia non sia stata gia superata
        // infatti in questo caso deve prima essere emanato il sal relativo a quella soglia
        // prima di poter procedere all'inserimento di un nuovo registro
        require(!m.getSuperata(), "Si deve prima emanare un SAL prima di procedere alla compilazione di un nuovo registro");
        
        // la checkLibretto restituisce false se il libretto che dev essere inserito non � completo, quindi si controlla che sia true
        require(checkLibretto(), "Nessun libretto � ancora completo per poter essere inserito in un registro");
        
        uint[] memory righi = l.findRighiLibretto(registro);
        
        // per ogni valore da inserire all interno del libretto si chiama in modo cicliclo la insertRegistro
        for (uint i = 0; i < righi.length ; i++) {
            insertRegistro(registro, righi[i]);
            numero_totale_registri++;
        }
        // una volta che tutti i righi di quel registro sono stati inseriti, si puo passare al registro successivo
        // quindi si salva il numero di righi di quel registro
        // si incrementa il registro
        // si riporta ad uno il numero di righi del nuovo registro
        data[registro - 1] = now;
        righi_max_registro.push(numero_totale_registri);
        registro++; 
        
        
        if (checkSoglia()) {
            m.setSuperata();
        }
    }
    
   
    
    // serve per controllare che il nuovo valore raggiunto abbia superato la soglia
    // restituisce il numero di soglia che si ? superata
    function checkSoglia () private returns(bool) {
        uint tot = countCostoRegistro();
        
        // se il totale calcolato con i registri fino ad ora ha superato la soglia, moltiplicata per il numero della soglia allora restituisce true
        // il numero_soglia ? un valore che parte da 1 e viene incrementato ad ogni raggiungimento di una soglia
        // nell ipotesi che la soglia da superare sia sempre uno stesso valore, allora va moltiplicato per il numero di soglia
        // quindi se la soglia ? di 100, per la seconda 100*2 = 200, cio? quando si supera il valore di 200 allora restituisce true
        
        // potrebbe accadere che con il nuovo registro di contabilit? si vanno a superare anche 2 o piu soglie, quindi deve essere controllato
        bool sup = false;
        
        while(checkSuperata(tot)) {
            // se il totale raggiunto sommando tutti i costi dei righi dei registri completi supera la soglia corrente 
            // si va a controllare innanzitutto se il totale abbia superato anche la soglia successiva
            // se la soglia successiva non ? superata 
            sup = true;
        }
        return sup;
    }
    
    
    // controlla se il totale calcolato sommando tutti i costi dei registri supera la soglia passata
    function checkSuperata(uint _tot) public returns(bool) {
        if (_tot >= (m.getSoglia() * m.getNumeroAcconto())) {
            m.updateNumeroAcconto();
            return true;
        }
        return false;
    }    
    
     
    // serve per contare il costo raggiunto con quel registro, quindi calcola il costo raggiunto con tutti i registri
    function countCostoRegistro () private returns(uint) {
        uint somma = 0;
        
        for (uint i = 0; i < (numero_totale_registri - 1); i++) {
            somma += registri[i].costo_raggiunto;
        }
        return somma;
    }
    
    
    function getRegistri1 (uint _registro) public returns(uint[] memory, uint[] memory, uint[] memory, uint[] memory) {
        if (_registro == 1) {
            uint lunghezza = righi_max_registro[_registro - 1] - 1;
            
            uint[] memory perc_tot = new uint[](lunghezza);
            uint[] memory perc_i = new uint[](lunghezza);
            uint[] memory perc_ragg = new uint[](lunghezza);
            uint[] memory costo_ragg = new uint[](lunghezza);
            
            uint cont = 0;
            
            for (uint8 j = 0; j < lunghezza; j++) {
                perc_tot[cont] = registri[j].percentuale_totale;
                perc_i[cont] = registri[j].percentuale_i;
                perc_ragg[cont] = registri[j].percentuale_raggiunta;
                costo_ragg[cont] = registri[j].costo_raggiunto;
                
                cont++;
            }
            return (perc_tot, perc_i, perc_ragg, costo_ragg);
        }
        else {
            uint lunghezza = righi_max_registro[_registro - 1] - righi_max_registro[_registro - 2];
            
            uint[] memory perc_tot = new uint[](lunghezza);
            uint[] memory perc_i = new uint[](lunghezza);
            uint[] memory perc_ragg = new uint[](lunghezza);
            uint[] memory costo_ragg = new uint[](lunghezza);
            
            uint cont = 0;
            
            for (uint j = (righi_max_registro[_registro - 2] - 1); j < (righi_max_registro[_registro - 1] - 1); j++) {
                perc_tot[cont] = registri[j].percentuale_totale;
                perc_i[cont] = registri[j].percentuale_i;
                perc_ragg[cont] = registri[j].percentuale_raggiunta;
                costo_ragg[cont] = registri[j].costo_raggiunto;
                
                cont++;
            }
            return (perc_tot, perc_i, perc_ragg, costo_ragg);
        }
    }
    
    function getRegistri2 (uint _registro) public returns(uint[] memory, uint[] memory, uint[] memory, uint[] memory) {
        if (_registro == 1) {
            uint lunghezza = righi_max_registro[_registro - 1] - 1;
            
            uint[] memory date = new uint[](lunghezza);
            uint[] memory regi = new uint[](lunghezza);
            uint[] memory righi = new uint[](lunghezza);
            uint[] memory costo_i = new uint[](lunghezza);
            
            uint cont = 0;
            
            for (uint8 j = 0; j < lunghezza; j++) {
                date[cont] = registri[j].data_registro;
                regi[cont] = registri[j].numero_libretto;
                righi[cont] = registri[j].rigo_libretto;
                costo_i[cont] = registri[j].costo_i;
                
                cont++;
            }
            return (date, regi, righi, costo_i);
        }
        else {
            uint lunghezza = righi_max_registro[_registro - 1] - righi_max_registro[_registro - 2];
            
            uint[] memory date = new uint[](lunghezza);
            uint[] memory regi = new uint[](lunghezza);
            uint[] memory righi = new uint[](lunghezza);
            uint[] memory costo_i = new uint[](lunghezza);
            
            uint cont = 0;
            
            for (uint j = (righi_max_registro[_registro - 2] - 1); j < (righi_max_registro[_registro - 1] - 1); j++) {
                date[cont] = registri[j].data_registro;
                regi[cont] = registri[j].numero_libretto;
                righi[cont] = registri[j].rigo_libretto;
                costo_i[cont] = registri[j].costo_i;
                
                cont++;
            }
            return (date, regi, righi, costo_i);
        }
    }
    
    function getRegistri3 (uint _registro) public returns(string[] memory, string[] memory) {
        if (_registro == 1) {
            uint lunghezza = righi_max_registro[_registro - 1] - 1;
            
            string[] memory code = new string[](lunghezza);
            string[] memory name = new string[](lunghezza);
            
            uint cont = 0;
            
            for (uint8 j = 0; j < lunghezza; j++) {
                code[cont] = registri[j].codice_lavoro;
                name[cont] = registri[j].nome_lavoro;
                
                cont++;
            }
            return (code, name);
        }
        else {
            uint lunghezza = righi_max_registro[_registro - 1] - righi_max_registro[_registro - 2];
            
            string[] memory code = new string[](lunghezza);
            string[] memory name = new string[](lunghezza);
            
            uint cont = 0;
            
            for (uint j = (righi_max_registro[_registro - 2] - 1); j < (righi_max_registro[_registro - 1] - 1); j++) {
                code[cont] = registri[j].codice_lavoro;
                name[cont] = registri[j].nome_lavoro;
                
                cont++;
            }
            return (code, name);
        }
    }
    
    
    Libretto l;
    address private indirizzoLibretto;
    
    function setIndirizzoLibretto (address _indirizzo) public {
        require(_indirizzo != address(0), "L'indirizzo passato non ? valido");
        indirizzoLibretto = _indirizzo;
        l = Libretto(indirizzoLibretto);
    }
    
    Misure m;
    address private indirizzoMisure;
    
    function setIndirizzoMisure (address _indirizzo) public {
        require(_indirizzo != address(0), "L'indirizzo passato non ? valido");
        indirizzoMisure = _indirizzo;
        m = Misure(indirizzoMisure);
    }
    
    
    modifier onlyDirettoreLavori {
        // solo il Direttore dei Lavori pu? utilizzare questa funzione
        require(
            m.enableDL(msg.sender), "Solo il Direttore dei Lavori pu? utilizzare questa funzione"
        );
        _; //indica dove deve essere posta la funzione chiamata
    } 
    
    modifier onlyRup {
        // solo il rup pu? utilizzare questa funzione
        require(
            m.enableRUP(msg.sender), "Solo il RUP pu? utilizzare questa funzione"
        );
        _; //indica dove deve essere posta la funzione chiamata
    }
    
    function killRegistro() public {
        selfdestruct(msg.sender);
    }
}
