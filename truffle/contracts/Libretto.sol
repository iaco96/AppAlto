pragma solidity ^0.5.0;
pragma experimental ABIEncoderV2;

import "./Misure.sol";
import "./Firme.sol";
import "./StringUtils.sol";
import "./Riserve.sol";


contract Libretto {

    struct LibrettoDelleMisure {
        uint data_libretto;
        string codice_lavoro;
        uint numero_libretto; // indica il numero di rigo del libretto
        string descrizione_libretto;
        uint percentuale_avanzamento; // indica la percentuale di un lavoro, va da 0 a 100%
        mapping (uint => string) allegato; // stringa corrisponde all hash in cui si trovano uno o piu allegati
        uint sovrascritto; // indica il numero del libretto che sovrascrive questo rigo di libretto
        uint libretto; // indica di quale libretto si tratta
        uint quanti_allegati; // serve per contenere il numero di allegati inseriti per ogni rigo
    }
    
    
    mapping (uint => LibrettoDelleMisure) private libretti;
    uint private numero_libretti = 1;
    uint private libretto = 1; // indica il numero di libretto inserito, ovviamente il primo libretto ? il numero 1
    uint private numero_totale_libretti = 1; // indica il numero totale di righi di tutti i libretti
    uint[] private righi_max_libretto;
    
    
    mapping(uint => uint) private data;

    function getRighiMaxLibretto(uint _libretto) public returns(uint) {
        return righi_max_libretto[_libretto - 1];
    }
    
    // restituisce il numero di libretto corrente
    function getLibretto() public returns(uint) {
        return libretto;
    }
    
    // a partire da una certa data, restituisce il numero di libretto e se ? terminato o meno
    // ovvero se il DL ha utilizzato la funzione finishLibretto
    function getLibrettoData (uint _data) public returns(uint, uint , bool) {
        require(_data != 0, "Non ? possibile inserire una data nulla");
        bool term;
        for (uint i = 0; i < libretto; i++) {
            if (data[i] == _data) {
                if (i < (libretto - 1)) {
                    term = true;
                }
                else {
                    term = false;
                }
                return (i+1, _data, term);
            }
        }
    }
    
    // se non viene passata una data, si restituisce la lista dei giornali con la data 
    function getLibrettoData() public returns(uint[] memory, uint[] memory) {
        uint[] memory lib = new uint[](libretto);
        uint[] memory date = new uint[](libretto);
        
        uint cont = 0;
        
        for (uint i = 0; i < libretto; i++) {
            lib[cont] = i+1;
            date[cont] = data[i];
            cont++;
        }
        return(lib, date);
    }
    
    
    // a partire dal numero di libretto e dal rigo del libretto, restituisce il rigo complessivo rispetto a tutti i libretti
    function getRigoLibretto(uint _libretto, uint _rigo) public returns(uint) {
        for (uint i = 0; i < numero_totale_libretti; i++) { //########FORSE numero_totale_libretti - 1 ##################
            if (libretti[i].libretto == _libretto && libretti[i].numero_libretto == _rigo) {
                return (i + 1);
            }
        }
    }
    
    // serve al DL per confermare l intenzione di finire di scrivere in quel libretto
    // quindi il contatore che indica il numero del libretto viene incrementato
    // quando viene cambiato il libretto, il numero dei righi del libretto viene riportato a zero, dato che si cambia libretto
    function finishLibretto () public onlyDirettoreLavori {
        // si richiede l inserimento di almento un rigo nel libretto
        require (numero_libretti > 1, "Non è stato ancora inserito un rigo per questo libretto");
        data[libretto - 1] = now;
        righi_max_libretto.push(numero_totale_libretti); // setta il numero di righi max per quel libretto
        libretto++;
        numero_libretti = 1;
    }
    
    
    // a partire dal numero di rigo nel libretto e dal numero del libretto delle misure restituisce il codice del lavoro salvato in quel rigo
    // in questa funzione non serve la funzione getRigoLibretto per la conversione da numero libretto e rigo del libretto al rigo generale
    function findCodice (uint _libretto, uint _rigo) public returns (string memory) {
        uint rigo = getRigoLibretto(_libretto, _rigo);
        return (libretti[rigo - 1].codice_lavoro);
    }
    
    
    
    // controlla che non sia inserito uno stesso lavoro all'interno di righi di uno stesso libretto
    function checkSameCodice(string memory _codice, uint _libretto) public returns(bool) {
        if (_libretto == 1) {
            uint lunghezza = (numero_totale_libretti - 1);
            
            for (uint8 j = 0; j < lunghezza; j++) {
                if (StringUtils.compareStrings(libretti[j].codice_lavoro, _codice)) {
                    return false;
                }
            }
            return true;
        }
        else {
            uint lunghezza = ((numero_totale_libretti - 1) - (righi_max_libretto[_libretto - 2] - 1));
            
            for (uint j = (righi_max_libretto[_libretto - 2] - 1); j < (numero_totale_libretti - 1); j++) {
                if (StringUtils.compareStrings(libretti[j].codice_lavoro, _codice)) {
                    return false;
                }
            }
            return true;
        }
    }
    
    
    // controlla che si vada ad inserire una percentuale maggiore rispetto alla percentuale attuale
    function checkMaggiorePercentuale(string memory _codice, uint _percentuale) public returns(bool) {
        uint perc = m.getPercentuale(_codice);
        if (perc < _percentuale) {
            return true;
        }
        else {
            return false;
        }
    }
    
    function addLibretto (string memory _codice, string memory _descrizione, uint _percentuale, string[] memory _allegato) public onlyDirettoreLavori {
        // per poter aggiungere un nuovo libretto, si richiede che le percentuali dei lavori non siano tutte al 100%
        // si richiede quindi che la variabile che controlla non sia settata a true
        require(!m.getPercentuali(), "Tutte le lavorazioni hanno una percentuale pari al 100%");
        
        // si controlla che non venga inserito un lavoro con un codice già inserito in un rigo di questo libretto
        require (checkSameCodice(_codice, libretto), "E' gia stato inserita una stessa lavorazione in questo libretto");
        
        // si controlla che non venga inserita una lavorazione con una percentuale inferiore alla percentuale attuale di quel lavoro
        require(checkMaggiorePercentuale(_codice, _percentuale), "Non può essere inserita una percentuale inferiore a quella attuale");
        
        // con m.numero_lavori() richiamo la variabile numero_lavori del constratto Misure.sol 
        // come fosse una funzione che mi restituisce il valore di numero_lavori
        for (uint i = 0; i < m.getNumeroLavori(); i++) { 
            
            // va a leggere i valori del lavoro i-esimo e salva in una quintupla i valori di
            // codice del lavoro, nome del lavoro, percentuale di completamento, percentuale completata e costo totale
            (string memory codice_lavoro, string memory n, uint y, uint z, uint k) = m.readLavori(i);
            
            // controlla se il codice del lavoro passato come paramentro alla funzione corrisponde ad un lavoro inserito
            // se si, va ad inserire i dati all interno del libretto
            // inoltre va a modificare la percentuale di completaento di quel lavoro
            // al termine restituisce true
            // se invece il lavro i-esimo non corrisponde al paramentro passato, va a ricercare in modo ricorsivo 
            // un lavoro con quel nome
            // restituisce false se non si ? trovato un lavoro con quel nome
            if (StringUtils.compareStrings(codice_lavoro, _codice)) {
                libretti[numero_totale_libretti - 1].codice_lavoro = _codice;
                libretti[numero_totale_libretti - 1].libretto = libretto;
                libretti[numero_totale_libretti - 1].numero_libretto = numero_libretti;
                libretti[numero_totale_libretti - 1].data_libretto = now;
                libretti[numero_totale_libretti - 1].descrizione_libretto = _descrizione;
                libretti[numero_totale_libretti - 1].sovrascritto = 0; 
                
                for (uint8 i = 0; i < _allegato.length; i++) {
                    libretti[numero_totale_libretti - 1].allegato[i] = _allegato[i];
                }
                
                libretti[numero_totale_libretti - 1].quanti_allegati = _allegato.length;
                require(_percentuale != 0, "Non ? possibile inserire un valore percentuale nullo");
                require(_percentuale <= 100, "Non ? possibile inserire una valore percentuale superiore a 100");
                libretti[numero_totale_libretti - 1].percentuale_avanzamento = _percentuale; 
                numero_libretti++;
                numero_totale_libretti++;
            }
        }
    }
    
    
    // PERMETTE SOLAMENTE DI MODIFICARE IL LIBRETTO PRIMA CHE IL DL ABBIA DECRETATO LA SUA FINE CON LA FUNZIONE finishLibretto
    // lo si fa controllando che il numero del libretto sia coerente con il numero di libretto corrente
    // permette al DL di modificare il libretto dei giornali in caso di errore
    // per questo motivo il libretto contiene un campo sovrascritto in cui si adr? a riportare il rigo che ha sovrasctitto quel rigo
    function updateLibretto (uint _numero, uint _libretto, string memory _codice, string memory _descrizione, uint _percentuale,
    string[] memory _allegato) public onlyDirettoreLavori {
        // per poter aggiungere un nuovo libretto, si richiede che le percentuali dei lavori non siano tutte al 100%
        // si richiede quindi che la variabile che controlla non sia settata a true
        require(!m.getPercentuali(), "Tutte le lavorazioni hanno una percentuale pari al 100%");
        
        // è richiesto che sia modificato solamente un rigo del libretto corrente
        require (_libretto == libretto, "Il libretto inserito è già stato concluso");
        
        // si controlla che non venga inserita una lavorazione con una percentuale inferiore alla percentuale attuale di quel lavoro
        require(checkMaggiorePercentuale(_codice, _percentuale), "Non può essere inserita una percentuale inferiore a quella attuale");
        
        // è richiesta la modifica solamente di un rigo già inserito
        require(_numero < numero_libretti, "Il rigo che stai modificando non è stato inserito in precedenza");
        uint rigo = getRigoLibretto(_libretto, _numero);
        libretti[numero_totale_libretti - 1].libretto = _libretto;
        libretti[numero_totale_libretti - 1].codice_lavoro = _codice;
        libretti[numero_totale_libretti - 1].numero_libretto = numero_libretti;
        libretti[numero_totale_libretti - 1].data_libretto = now;
        libretti[numero_totale_libretti - 1].descrizione_libretto = _descrizione;
        require(_percentuale != 0, "Non ? possibile inserire un valore percentuale nullo");
        require(_percentuale <= 100, "Non ? possbile inserire un valore percentuale superiore a 100");
        libretti[numero_totale_libretti - 1].percentuale_avanzamento = _percentuale; 
        
        for (uint8 i = 0; i < _allegato.length; i++) {
            libretti[numero_totale_libretti - 1].allegato[i] = _allegato[i];
        }
        libretti[numero_totale_libretti - 1].quanti_allegati = _allegato.length;
        libretti[rigo - 1].sovrascritto = numero_libretti;
        numero_libretti++;
        numero_totale_libretti++;
    }
    

    
    function checkLibrettoOk(uint _libretto) public returns(bool) {
        (bool[] memory fir, bool[] memory firis, bool[] memory ris) = i.getRiserve1(_libretto);
        for (uint i = 0; i < fir.length; i++) {
            // fir contiene le firme o le firme con riserva, quindi dev essere per forza a true
            // in caso contrario si restituisce false
            if (!fir[i]) {
                return false;
            }
            // se invece la firma c � si deve andare a controllare se sia una firma con riserva o una normale firma
            else {
                // se la firma � con riserva
                if (firis[i]) {
                    // e non � stata esplicitata la riserva, si restituisce false
                    if (!ris[i]) {
                        return false;
                    }
                }
            }
        } 
        return true;
    }
    
    
    
    
    // serve alla ditta per firmare il libretto senza riserva
    // una volta che la ditta firma il libretto, vuol dire che tutto cio che c ? scritto ? stato confermato, quindi si pu? fare l update del valore
    // _libretto e _rigo_libretto indicano il numero del libretto e il rigo di quel libretto su cui la ditta vuole inserire la firma
    function insertFirmaDittaLibretto (uint _rigo_libretto, uint _libretto) public onlyDittaAppaltatrice {
        require(libretto > _libretto, "Il libretto non ? ancora stato terminato"); // richiede che il libretto sia gia stato concluso
        uint rigo = getRigoLibretto(_libretto, _rigo_libretto);
        
        // si inserisce la firma solo ai righi che non sono sovrascritti da altri, cio? quelli che hanno il campo sovrascr non inizializzato
        require (libretti[rigo - 1].sovrascritto == 0, "Non � possibile firmare un rigo sovrascritto");
        
        // si richiede che il rigo non sia gi� stato firmato
        require(!a.checkFirma(_libretto, _rigo_libretto), "Il rigo � gi� stato firmato");
        
        // si utilizza la setFirme normale, non quella con il polimorfismo per inserire anche una riserva
        a.setFirme(_libretto, _rigo_libretto);
        string memory codice = findCodice(_libretto, _rigo_libretto);
        m.setPercentualeLavoro(codice, libretti[rigo - 1].percentuale_avanzamento); 
        m.updateValore(codice);
        
        // se sono state inserite tutte le firme a tutti i righi con evenutali riserve, allora il libretto è completo
        if (checkLibrettoOk(_libretto)) {
            // si va quindi a controllare che le percentuali di tutti i lavori siano al 100%, in modo da terminare il constratto
            // se tutte sono al 100%
            if (m.checkPercentuali()) {
                // si chiama questa funzione che setta uan variabile a true per indicare che tutte le percentuali sono complete
                m.setPercentuali();
            }
        }
    }
    
    
    // serve alla ditta per inserire la firma con riserva al libretto 
    function insertFirmaRiservaDittaLibretto (uint _rigo_libretto, uint _libretto) public onlyDittaAppaltatrice {
        require(libretto > _libretto, "Il libretto non ? ancora stato terminato"); // richiede che il libretto sia gia stato concluso
        uint rigo = getRigoLibretto(_libretto, _rigo_libretto);
        
        // si inserisce la firma solo ai righi che non sono sovrascritti da altri, cio? quelli che hanno il campo sovrascr non inizializzato
        require (libretti[rigo - 1].sovrascritto == 0, "Non � possibile firmare un rigo sovrascritto");
        
        // si richiede che il rigo non sia gi� stato firmato
        require(!a.checkFirma(_libretto, _rigo_libretto), "Il rigo � gi� stato firmato");
        
        // viene sempre firmata la transazione, ma si mette il campo true per dire che la transazione ? firmata con riserva
        a.setFirme(_libretto, _rigo_libretto, true); 
    }
    
    
   
    // restituisce tutti i righi di un libretto
    function findRighiLibretto (uint _libretto) public returns (uint[] memory) {
        if (_libretto == 1) {
            uint lunghezza = righi_max_libretto[_libretto - 1] - 1;
            
            uint[] memory rigo = new uint[](lunghezza);
            
            uint cont = 0;
            
            for (uint8 j = 0; j < lunghezza; j++) {
                if (checkSovrascritto(j)) {
                    rigo[cont] = libretti[j].numero_libretto;
                    cont++;
                }
            }
            return (rigo);
        }
        else {
            uint lunghezza = righi_max_libretto[_libretto - 1] - righi_max_libretto[_libretto - 2];
            
            uint[] memory rigo = new uint[](lunghezza);
            
            uint cont = 0;
            
            for (uint j = (righi_max_libretto[_libretto - 2] - 1); j < (righi_max_libretto[_libretto - 1] - 1); j++) {
                if (checkSovrascritto(j)) {
                    rigo[cont] = libretti[j].numero_libretto;
                    cont++;
                }
            }
            return (rigo);
        }
    }
    
    
    function checkSovrascritto(uint _rigo) public returns(bool) {
        if (libretti[_rigo].sovrascritto == 0) {
            return true;
        }
        return false;
    }
    
    // per il campo sovrascritti restituisce 0 se quel rigo non ? sovrascritto, mentre il numero del rigo che lo sovrascrive nel caso sia sovrascritto
    function getLibretti1(uint _libretto) public returns(uint[] memory, string[] memory, uint[] memory, uint[] memory) {
        if (_libretto == libretto) {
            if (_libretto == 1) {
                uint lunghezza = (numero_totale_libretti - 1);
                
                uint[] memory date = new uint[](lunghezza);
                string[] memory descriz = new string[](lunghezza);
                uint[] memory sovra = new uint[](lunghezza);
                uint[] memory rigo = new uint[](lunghezza);
                
                uint cont = 0;
                
                for (uint8 j = 0; j < lunghezza; j++) {
                    sovra[cont] = libretti[j].sovrascritto;
                    rigo[cont] = libretti[j].numero_libretto;
                    date[cont] = libretti[j].data_libretto;
                    descriz[cont] = libretti[j].descrizione_libretto;
                    
                    cont++;
                }
                return (date, descriz, sovra, rigo);
            }
            else {
                uint lunghezza = ((numero_totale_libretti - 1) - (righi_max_libretto[_libretto - 2] - 1));
                
                uint[] memory date = new uint[](lunghezza);
                string[] memory descriz = new string[](lunghezza);
                uint[] memory sovra = new uint[](lunghezza);
                uint[] memory rigo = new uint[](lunghezza);
                
                
                uint cont = 0;
                
                for (uint j = (righi_max_libretto[_libretto - 2] - 1); j < (numero_totale_libretti - 1); j++) {
                    sovra[cont] = libretti[j].sovrascritto;
                    rigo[cont] = libretti[j].numero_libretto;
                    date[cont] = libretti[j].data_libretto;
                    descriz[cont] = libretti[j].descrizione_libretto;
                    
                    cont++;
                }
                return (date, descriz, sovra, rigo);
            }
        }
        else if (_libretto < libretto) {
            if (_libretto == 1) {
                uint lunghezza = righi_max_libretto[_libretto - 1] - 1;
                
                uint[] memory date = new uint[](lunghezza);
                string[] memory descriz = new string[](lunghezza);
                uint[] memory sovra = new uint[](lunghezza);
                uint[] memory rigo = new uint[](lunghezza);
                
                uint cont = 0;
                
                for (uint8 j = 0; j < lunghezza; j++) {
                    sovra[cont] = libretti[j].sovrascritto;
                    rigo[cont] = libretti[j].numero_libretto;
                    date[cont] = libretti[j].data_libretto;
                    descriz[cont] = libretti[j].descrizione_libretto;
                    
                    cont++;
                }
                return (date, descriz, sovra, rigo);
            }
            else {
                uint lunghezza = righi_max_libretto[_libretto - 1] - righi_max_libretto[_libretto - 2];
                
                uint[] memory date = new uint[](lunghezza);
                string[] memory descriz = new string[](lunghezza);
                uint[] memory sovra = new uint[](lunghezza);
                uint[] memory rigo = new uint[](lunghezza);
                
                uint cont = 0;
                
                for (uint j = (righi_max_libretto[_libretto - 2] - 1); j < (righi_max_libretto[_libretto - 1] - 1); j++) {
                    sovra[cont] = libretti[j].sovrascritto;
                    rigo[cont] = libretti[j].numero_libretto;
                    date[cont] = libretti[j].data_libretto;
                    descriz[cont] = libretti[j].descrizione_libretto;
                    
                    cont++;
                }
                return (date, descriz, sovra, rigo);
            }
        }
    }
    
    
    function getLibretti2(uint _libretto) public returns(string[] memory, uint[] memory, string[][] memory, uint[] memory) {
        if (_libretto == libretto) {
            if (_libretto == 1) {
                uint lunghezza = (numero_totale_libretti - 1);
                
                string[] memory cod = new string[](lunghezza);
                uint[] memory perc = new uint[](lunghezza);
                string[][] memory all = new string[][](lunghezza);
                
                uint cont = 0;
        
                uint[] memory quanti = new uint[](lunghezza); 
                
                for (uint8 j = 0; j < lunghezza; j++) {
                    quanti[cont] = libretti[j].quanti_allegati;
                    
                    cod[cont] = libretti[j].codice_lavoro;
                    perc[cont] = libretti[j].percentuale_avanzamento;
                    
                    string[] memory temp1 = new string[](quanti[cont]);
                
                    for (uint8 k = 0; k < quanti[cont]; k++) {
                        temp1[k] = libretti[j].allegato[k];
                    }
                        
                    all[cont] = temp1;
                    
                    cont++;
                }
                return (cod, perc, all, quanti);
            }
            else {
                uint lunghezza = ((numero_totale_libretti - 1) - (righi_max_libretto[_libretto - 2] - 1));
                
                string[] memory cod = new string[](lunghezza);
                uint[] memory perc = new uint[](lunghezza);
                string[][] memory all = new string[][](lunghezza);
                
                uint cont = 0;
                
                uint[] memory quanti = new uint[](lunghezza); 
                
                for (uint j = (righi_max_libretto[_libretto - 2] - 1); j < (numero_totale_libretti - 1); j++) {
                    quanti[cont] = libretti[j].quanti_allegati;
                    
                    cod[cont] = libretti[j].codice_lavoro;
                    perc[cont] = libretti[j].percentuale_avanzamento;
                    
                    string[] memory temp1 = new string[](quanti[cont]);
                
                    for (uint8 k = 0; k < quanti[cont]; k++) {
                        temp1[k] = libretti[j].allegato[k];
                    }
                        
                    all[cont] = temp1;
                    
                    cont++;
                }
                return (cod, perc, all, quanti);
            }
        }
        else if (_libretto < libretto) {
            if (_libretto == 1) {
                uint lunghezza = righi_max_libretto[_libretto - 1] - 1;
                
                string[] memory cod = new string[](lunghezza);
                uint[] memory perc = new uint[](lunghezza);
                string[][] memory all = new string[][](lunghezza);
                
                uint cont = 0;
                
                uint[] memory quanti = new uint[](lunghezza); 
                
                for (uint8 j = 0; j < lunghezza; j++) {
                    quanti[cont] = libretti[j].quanti_allegati;
                    
                    cod[cont] = libretti[j].codice_lavoro;
                    perc[cont] = libretti[j].percentuale_avanzamento;
                    
                    string[] memory temp1 = new string[](quanti[cont]);
                
                    for (uint8 k = 0; k < quanti[cont]; k++) {
                        temp1[k] = libretti[j].allegato[k];
                    }
                        
                    all[cont] = temp1;
                    
                    cont++;
                }
                return (cod, perc, all, quanti);
            }
            else {
                uint lunghezza = righi_max_libretto[_libretto - 1] - righi_max_libretto[_libretto - 2];
                
                string[] memory cod = new string[](lunghezza);
                uint[] memory perc = new uint[](lunghezza);
                string[][] memory all = new string[][](lunghezza);
                
                uint cont = 0;
                
                uint[] memory quanti = new uint[](lunghezza); 
                
                for (uint j = (righi_max_libretto[_libretto - 2] - 1); j < (righi_max_libretto[_libretto - 1] - 1); j++) {
                    quanti[cont] = libretti[j].quanti_allegati;
                    
                    cod[cont] = libretti[j].codice_lavoro;
                    perc[cont] = libretti[j].percentuale_avanzamento;
                    
                    string[] memory temp1 = new string[](quanti[cont]);
                
                    for (uint8 k = 0; k < quanti[cont]; k++) {
                        temp1[k] = libretti[j].allegato[k];
                    }
                        
                    all[cont] = temp1;
                    
                    cont++;
                }
                return (cod, perc, all, quanti);
            }
        }
    }
    
    Firme a;
    address private indirizzoFirme;
    
    function setIndirizzoFirme (address _indirizzo) public {
        require(_indirizzo != address(0), "L'indirizzo passato non ? valido");
        indirizzoFirme = _indirizzo;
        a = Firme(indirizzoFirme);
    }
    
    Riserve i;
    address private indirizzoRiserve;
    
    function setIndirizzoRiserve (address _indirizzo) public {
        require(_indirizzo != address(0), "L'indirizzo passato non ? valido");
        indirizzoRiserve = _indirizzo;
        i = Riserve(indirizzoRiserve);
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
    
    modifier onlyDittaAppaltatrice {
        // solo la ditta appaltatrice pu? utilizzare questa funzione
        require(
            m.enableDitta(msg.sender), "Solo la ditta appaltatrice pu? utilizzare questa funzione"
        );
        _; //indica dove deve essere posta la funzione chiamata
    }  
    
    function killLibretto() public {
        selfdestruct(msg.sender);
    }
}
