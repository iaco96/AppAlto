pragma solidity ^0.5.0;
pragma experimental ABIEncoderV2;

import "./StringUtils.sol";

contract Misure {
    
    struct Lavoro {
        string codice_lavoro; 
        string nome_lavoro;
        uint percentuale_completamento; // rappresenta la percentuale di completamento per quel lavoro con un range 0 -> 100
        uint percentuale_controllata; // rappresenta la percentuale che ? gia stata inserita nel calcolo del valore raggiunto
        uint costo_totale; // rappresenta il costo del lavoro al 100% del completamento di quel lavoro
    }
    
    mapping (uint => Lavoro) private lavori;
    uint private numero_lavori = 0;
    
    
    function getPercentuale(string memory _codice) public returns(uint) {
        for (uint i = 0; i < numero_lavori; i++) {
            if (StringUtils.compareStrings(lavori[i].codice_lavoro, _codice)) {
                return lavori[i].percentuale_completamento;
            }
        }
    }
    
    // controlla se tutte le percentuale_completamento sono al 100%, in tal caso restituisce true, altrimenti false
    function checkPercentuali() public returns(bool) {
        for (uint i = 0; i < numero_lavori; i++) {
            if (lavori[i].percentuale_completamento != 100) {
                return false;
            }
        }
        return true;
    }
    
    bool private percentuali_complete = false;
    
    function setPercentuali() public {
        percentuali_complete = true;
    }
    
    function getPercentuali() public returns(bool) {
        return percentuali_complete;
    }
    
    // serve per separare la fase di inserimento delle lavorazioni nel contratto dalla fase di gestione del contratto
    modifier onlyFaseUno() {
        require(inserimenti_terminati == false, "Non ? possibile utilizzare questa funzione in questa fase del contratto");
        _; //indica dove deve essere posta la funzione chiamata
    }

    // serve per tener traccia di quando il RUP termina gli inserimenti della rata di acconto, quindi inizia il contratto
    bool private inserimenti_terminati = false;
    
    // restituisce se gli insrimenti sono terminati o meno
    function getInserimenti() public returns(bool) {
        return inserimenti_terminati;
    }
    
    // viene chiamata alla terminazione degli inserimenti della rata di acconto per poter settare la variabile a true
    function finishInserimenti() public onlyFaseUno onlyRup {
        require(numero_lavori > 0, "Si deve inserire almeno un lavoro prima di poter terminare gli inserimenti");
        require(soglia > 0, "Si deve inserire una soglia prima di poter terminare gli inserimenti");
        inserimenti_terminati = true;
    }
    


    function getNumeroLavori() public returns(uint) {
        return numero_lavori;
    }
    
    function getLavori() public returns(string[] memory, string[] memory, uint[] memory) {
        string[] memory code = new string[](numero_lavori);
        string[] memory name = new string[](numero_lavori);
        uint[] memory cos = new uint[](numero_lavori);
        
        uint cont = 0;
        
        for (uint i = 0; i < numero_lavori; i++) { 
            code[cont] = lavori[i].codice_lavoro;
            name[cont] = lavori[i].nome_lavoro;
            cos[cont] = lavori[i].costo_totale;
            cont++;
        }
        
        return(code, name, cos);
    }
    
    
    uint private soglia = 0;
    uint private numero_acconto = 1;
    
    bool private soglia_superata;
    
    // setta a true che la soglia è stata superata con un certo registro
    function setSuperata() public {
        soglia_superata = true;
    }
    
    function getSuperata() public returns(bool) {
        return soglia_superata;
    }
    
    function setNonSuperata() public {
        soglia_superata = false;
    }
    
    
    function getNumeroAcconto () public returns(uint) {
        return(numero_acconto);
    }
    
    function updateNumeroAcconto() public returns(uint) {
        numero_acconto++;
    }
    
    function getSoglia() public returns(uint) {
        return(soglia);
    }
    
    function updateSoglia (uint _soglia) public onlyFaseUno onlyRup {
        soglia = _soglia;
    }
    
    function addLavoro (string memory _codice, string memory _nome, uint _costo) public onlyFaseUno onlyRup {
        
        for (uint i = 0; i < numero_lavori; i++) {
            //controllo per impedire di inserire un lavoro precedentemente inserito
            require(
                !StringUtils.compareStrings(lavori[i].codice_lavoro, _codice), "Il codice del lavoro inserito ? stato gi? precedentemente inserito"
            );
        }
        lavori[numero_lavori].codice_lavoro = _codice;
        lavori[numero_lavori].nome_lavoro = _nome;
        lavori[numero_lavori].costo_totale = _costo; 
        //suppongo che la percentuale di completamento sia 0 all'aggiunta di un lavoro
        lavori[numero_lavori].percentuale_completamento = 0;
        lavori[numero_lavori].percentuale_controllata = 0;
        numero_lavori++;
    }
    
    
    // controlla che il codice passato sia stato gi? inserito
    function checkLavoroInserito(string memory _codice) public returns(bool) {
        for (uint i = 0; i < numero_lavori; i++) {
            if (StringUtils.compareStrings(lavori[i].codice_lavoro, _codice)) {
                return true;
            }
        }
        return false;
    }
    
    function updateLavoro (string memory _codice, string memory _nome, uint _costo) public onlyFaseUno onlyRup {
        
        //controllare che il codice inserito corrisponda ad uno di quelli gia inseriti
        require(checkLavoroInserito(_codice), "Il codice del lavoro non ? ancora stato inserito");
        
        // poi a partire dal codice restituisce l'indice di inserimento per andare a sovrascriverlo
        uint numero = findNumeroLavoro(_codice);
        
        lavori[numero].codice_lavoro = _codice;
        lavori[numero].nome_lavoro = _nome;
        lavori[numero].costo_totale = _costo; 
        //suppongo che la percentuale di completamento sia 0 all'aggiunta di un lavoro
        lavori[numero].percentuale_completamento = 0;
        lavori[numero].percentuale_controllata = 0;
    }
    
    
    //serve per ricavare il nome del lavoro partendo dal codice del lavoro
    function findNomeLavoro (string memory _codice) public returns (string memory) {
        for (uint i = 0; i < numero_lavori; i++) {
            if (StringUtils.compareStrings(lavori[i].codice_lavoro, _codice)) {
                return lavori[i].nome_lavoro;
            }
        }
    } 
    
    // serve per ricavare il numero del lavoro partendo dal codice del lavoro
    function findNumeroLavoro (string memory _codice) public returns (uint) {
        for (uint i = 0; i < numero_lavori; i++) {
            if (StringUtils.compareStrings(lavori[i].codice_lavoro, _codice)) {
                return i;
            }
        }
    }
    
    
    // serve per ricavare il costo del lavoro partendo dal codice del lavoro
    function findCostoLavoro (string memory _codice) public returns (uint) {
        for (uint i = 0; i < numero_lavori; i++) {
            if (StringUtils.compareStrings(lavori[i].codice_lavoro, _codice)) {
                return lavori[i].costo_totale;
            }
        }
    }
    
    function readLavori (uint i) public returns (string memory, string memory, uint, uint, uint) {
        return (lavori[i].codice_lavoro, lavori[i].nome_lavoro, lavori[i].percentuale_completamento, lavori[i].percentuale_controllata, lavori[i].costo_totale);
    }
    
    // serve per settare la percentuale_completamento con la nuova percentuale
    function setPercentualeLavoro(string memory _codice, uint _percentuale) public {
        uint i = findNumeroLavoro(_codice);
        lavori[i].percentuale_completamento = _percentuale; 
    }
    
    // setta la percentuale_controllata come la percentuale_completamento
    function setUgualePercentuale(string memory _codice) private {
        uint i = findNumeroLavoro(_codice);
        lavori[i].percentuale_controllata = lavori[i].percentuale_completamento;
    }
    
    // calcola l importo totale dei lavori andando a sommare il costo di ogni lavoro
    function countCostoTotale () public returns(uint) { 
        uint somma = 0;
        for (uint i = 0; i < numero_lavori; i++) {
            somma += lavori[i].costo_totale;
        }
        return somma;
    }
    
    // calcola la percentuale del singolo lavoro sul totale 
    function countPercentualeLavoro (string memory _codice) public returns(uint) {
        uint costo = countCostoTotale();
        uint percentuale;
        uint i = findNumeroLavoro(_codice);
        
        return percentuale = ((lavori[i].costo_totale * 100) / costo); 
    }
    
    // calcola il costo raggiunto sul costo totale del singolo lavoro
    function countCostoRaggiunto (string memory _codice) public returns(uint) { 
        uint costo_raggiunto;
        uint i = findNumeroLavoro(_codice);
        
        return costo_raggiunto = ((lavori[i].costo_totale) * (lavori[i].percentuale_completamento)) / 100;
    }
    
    
    // calcola la percentuale raggiunta di quel lavoro sui lavori totali
    function countPercentualeRaggiunta (string memory _codice) public returns(uint) {
        uint percentuale_lavoro_i = countPercentualeLavoro(_codice);
        uint i = findNumeroLavoro(_codice);
        
        return (percentuale_lavoro_i * lavori[i].percentuale_completamento) / 100; 
    }
    
    // calcola la percentuale raggiunta di quel lavoro sulla percentuale totale di tutti i lavori
    // si prende la percentuale di avanzamento di un lavoro sottratta alla percentuale gia controllata, si moltiplica per la sua percentuale relativa al lavoro totale
    // e si divide per 100, in questo modo si ottiene il nuovo valore d avanzamento
    function countValore(string memory _codice) private returns (uint) { 
        uint i = findNumeroLavoro(_codice);
        uint percentuale_lavoro_i = countPercentualeLavoro(_codice);
        
        uint valore = (percentuale_lavoro_i * (lavori[i].percentuale_completamento - lavori[i].percentuale_controllata)) / 100;
        return valore;
    }
    
    uint private totale_rimanente;
    
    uint private valore_raggiunto;
    
    function getValoreTotale() public returns (uint, uint) {
        return(valore_raggiunto, totale_rimanente);
    }
    
     // va a modificare il valore raggiunto e il totale con la nuova percentuale inserita
    // va a chiamare la funz setUgualePercentuale per far corrispondere 
    // la percentuale di completamento con quella che ? gia stata inserita nel calcolo di valore_raggiunto
    function updateValore(string memory _codice) public {
        uint val = countValore(_codice);
        valore_raggiunto += val;    
        totale_rimanente -= val;
        setUgualePercentuale(_codice);
    }
   
   
    enum ruoli {rup, ditta, direttore_lavori}
    
    address private ditta;
    address private direttore_lavori;
    address private rup;
    
    mapping(address => ruoli) private accounts;
    
    
    function enableDL(address _indirizzo) public returns(bool) {
        require(_indirizzo != address(0), "L'indirizzo passato non ? valido");
        if (accounts[_indirizzo] == ruoli.direttore_lavori) {
            return true;
        }
        else {
            return false;
        }
    }
    
    function enableRUP(address _indirizzo) public returns(bool) {
        require(_indirizzo != address(0), "L'indirizzo passato non ? valido");
        if (accounts[_indirizzo] == ruoli.rup) {
            return true;
        }
        else {
            return false;
        }
    }
    
    function enableDitta(address _indirizzo) public returns(bool) {
        require(_indirizzo != address(0), "L'indirizzo passato non ? valido");
        if (accounts[_indirizzo] == ruoli.ditta) {
            return true;
        }
        else {
            return false;
        }
    }
    
    modifier onlyRup {
        // solo il rup pu? utilizzare questa funzione
        require(
            enableRUP(msg.sender), "Solo il RUP pu? utilizzare questa funzione"
        );
        _; //indica dove deve essere posta la funzione chiamata
    }
    
    constructor () public {
        rup = msg.sender;
       
        //MODIFICA ACCOUNT DI DITTA E DIRETTORE IN BASE ALL ACCOUNT DEL NODO UTILIZZATO
        ditta = 0xcA843569e3427144cEad5e4d5999a3D0cCF92B8e;
        direttore_lavori = 0x0fBDc686b912d7722dc86510934589E0AAf3b55A;
        
        accounts[direttore_lavori] = ruoli.direttore_lavori; 
        accounts[ditta] = ruoli.ditta;
        accounts[rup] = ruoli.rup;
        
        
        totale_rimanente = 100;
        valore_raggiunto = 0;
    }    
    
    
    function killMisure() public {
        selfdestruct(msg.sender);
    }
    
    
}
