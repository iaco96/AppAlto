pragma solidity ^0.5.0;
pragma experimental ABIEncoderV2;

import "./Misure.sol";
import "./Registro.sol";
import "./Giornale.sol";
import "./Libretto.sol";
import "./Riserve.sol";
import "./Firme.sol";


contract Avanzamento {
    
    // il sal viene emesso ad ogni raggiungimento della rata di acconto
    // quindi si ha che il sal riassume i lavori con le relative percentuali e costi che hanno fatto in modo di raggiungere quell acconto
    // quindi in generale un sal potr? essere formato anche da piu registri di contabilita
    // infatti non ? detto che un unico registro riesca a maturare il valore da raggiungere per poter superare la rata di acconto prefissata
    
    // per questo devono essere fatti i controlli tra i vari registri di contabilit? in modo da non prendere ripetizioni di uno stesso lavoro
    // se si hanno ripetizioni, ovviamente si deve andare a prendere il lavoro piu aggiornato, cio? quello che ha una percentuale di avanzamento maggiore
    
    // ho una soglia monetaria o percentuale
    // quando dopo l emissione di un nuovo registro di contabilit? mi accorgo che ? stata superata questa soglia, si ha uno stato di avanzamento
    // quindi viene data la possibilit? al DL di emettere il SAL 
    
    struct StatoAvanzamentoLavori {
        uint data_sal;
        string codice_lavoro;
        string nome_lavoro; 
        uint percentuale_totale; // percentuale del lavoro
        uint percentuale_i; // percentuale del lavoro i esimo sul totale
        uint percentuale_raggiunta; // percentuale raggiunta sul 100%
        uint costo_i; // costo del lavoto i esimo
        uint costo_raggiunto; // costo del lavoro raggiunto con la percentuale raggiunta
        uint numero_rigo;
        uint sal; // indica il numero del sal
    }
    
    mapping (uint => StatoAvanzamentoLavori) private avanzamenti;
    uint private numero_avanzamenti = 1; // per indicare i righi del sal
    uint private sal = 1;
    uint private numero_totale_avanzamenti = 1;
    uint[] private righi_max_sal;
    
    mapping(uint => uint) private data;
    
    
    function getSal() public returns(uint) {
        return sal;
    }
    
    // a partire da una certa data, restituisce il numero di sal 
    function getSalData (uint _data) public returns(uint, uint) {
        require (_data != 0, "Non ? possibile passare una data nulla");
        for (uint i = 0; i < (sal - 1); i++) {
            if (data[i] == _data) {
                return (i, _data);
            }
        }
    }
    
    // se non viene passata una data, si restituisce la lista dei sal con la data 
    function getSalData() public returns(uint[] memory, uint[] memory) {
        uint[] memory sa = new uint[](sal);
        uint[] memory date = new uint[](sal);
        
        uint cont = 0;
        
        for (uint i = 0; i < (sal - 1); i++) {
            sa[cont] = i+1;
            date[cont] = data[i];
            cont++;
        }
        return(sa, date);
    }
    
    
    
    // calcola il costo di avanzamento, dato dalla somma dei costi di tutti i valori nel sal
    function countCostoSal (uint _sal) private returns(uint) {
        uint somma = 0;
        // se il numero del sal non ? il primo allora bisogna considerare come righi solamente quelli che vanno dal numero di righi
        // del sal precedente + 1, cio? dal primo rigo del sal voluto, fino all ultimo rigo del sal voluto
        if (_sal != 1) {
            for (uint i = (righi_max_sal[_sal - 2] - 1); i < (righi_max_sal[_sal - 1] - 1); i++) {
                somma += avanzamenti[i].costo_raggiunto;
            }
        }
        // se invece il sal considerato ? il primo allora si va dal primo rigo fino al ultimo del sal
        else {
            for (uint i = 0; i < (righi_max_sal[_sal - 1] - 1); i++) {
                somma += avanzamenti[i].costo_raggiunto;
            }
        }
        return somma;
    }


    // serve al DL per abilitare il sal
    function enableSal() public onlyDirettoreLavori {
        // si richiede che la rata di acconto sia stata superata
        require(m.getSuperata(), "Non � ancora stata superata la soglia");
        
        
        // devono essere controllate le misurazioni da inserire
        // parto dal registro che ha fatto superare la soglia e prendo da questo tutte le misurazioni dato che sono le piu aggiornate
        // si inseriscono all interno di una struttura che serve per contenere i codici dei lavori distinti
        // se il codice non si trova dentro la struttura allora lo si inserisce e poi si inserisce nel sal quel rigo del registro.
        // se invece si ha gia quel codice allora sicuramente ? piu aggiornato di lui dato che proviene da un registro piu recente
        // si procede cosi fino ad arrivare al primo registro delle contabilit?
        // ? quindi sicuro che si vanno ad inserire tutte le misurazioni che hanno prodotto un avanzamento
        
        (string[] memory codice, uint[] memory perc_tot, uint[] memory perc_i, uint[] memory perc_ragg, 
        uint[] memory costo_ragg) = findMisurazioni();
        
        string[] memory nome = new string[](codice.length);
        uint[] memory costo_i = new uint[](codice.length);
        uint j = 0;
        for (uint i = 0; i < codice.length; i++) {
            nome[j] = m.findNomeLavoro(codice[i]);
            costo_i[i] = m.findCostoLavoro(codice[i]);
            j++;
        }
        
        for (uint i = 0; i < codice.length; i++) {
            insertSal(codice[i], nome[i], perc_tot[i], perc_i[i], perc_ragg[i], costo_i[i], costo_ragg[i]);
        }
        data[sal - 1] = now;
        righi_max_sal.push(numero_totale_avanzamenti);
        sal++;
        numero_avanzamenti = 1;
        m.setNonSuperata();
    }
    
    
    // serve per trovare i dati relativi ai registri da inserire nel sal
    function findMisurazioni () private returns(string[] memory, uint[] memory, uint[] memory, uint[] memory, uint[] memory) {
        uint j = 0;
        (string[] memory codici, uint[] memory righi, uint[] memory registri) = r.findRegistri();
        
        uint[] memory perc_totali = new uint[](codici.length);
        uint[] memory perc_iesime = new uint[](codici.length);
        uint[] memory perc_raggiunte = new uint[](codici.length);
        uint[] memory costi_raggiunti = new uint[](codici.length);
        
        for (uint i = 0; i < codici.length; i++) {
            (uint perc_tot, uint perc_i, uint perc_ragg, uint costo_ragg) = r.findContenuto(registri[i], righi[i]); 
            perc_totali[j] = perc_tot;
            perc_iesime[j] = perc_i;
            perc_raggiunte[j] = perc_ragg;
            costi_raggiunti[j] = costo_ragg;
            j++;
        }
        return (codici, perc_totali, perc_iesime, perc_raggiunte, costi_raggiunti);
    }
    
    
    function insertSal (string memory _codice, string memory _nome, uint _perc_tot, uint _perc_i, uint _perc_ragg, uint _costo_i, uint _costo_ragg) public {
        avanzamenti[numero_totale_avanzamenti - 1].data_sal = now;
        avanzamenti[numero_totale_avanzamenti - 1].codice_lavoro = _codice;
        avanzamenti[numero_totale_avanzamenti - 1].nome_lavoro = _nome;
        avanzamenti[numero_totale_avanzamenti - 1].percentuale_totale = _perc_tot;
        avanzamenti[numero_totale_avanzamenti - 1].percentuale_i = _perc_i;
        avanzamenti[numero_totale_avanzamenti - 1].percentuale_raggiunta = _perc_ragg;
        avanzamenti[numero_totale_avanzamenti - 1].costo_i = _costo_i;
        avanzamenti[numero_totale_avanzamenti - 1].costo_raggiunto = _costo_ragg;
        avanzamenti[numero_totale_avanzamenti - 1].sal = sal;
        avanzamenti[numero_totale_avanzamenti - 1].numero_rigo = numero_avanzamenti;
        numero_avanzamenti++;
        numero_totale_avanzamenti++;
    }
    
    
    
    function getSal1 (uint _sal) public returns(uint[] memory, uint[] memory, uint[] memory, uint[] memory) {
        if (_sal == 1) {
            uint lunghezza = righi_max_sal[_sal - 1] - 1;
            
            uint[] memory perc_tot = new uint[](lunghezza);
            uint[] memory perc_i = new uint[](lunghezza);
            uint[] memory perc_ragg = new uint[](lunghezza);
            uint[] memory costo_ragg = new uint[](lunghezza);
            
            uint cont = 0;
            
            for (uint8 j = 0; j < lunghezza; j++) {
                perc_tot[cont] = avanzamenti[j].percentuale_totale;
                perc_i[cont] = avanzamenti[j].percentuale_i;
                perc_ragg[cont] = avanzamenti[j].percentuale_raggiunta;
                costo_ragg[cont] = avanzamenti[j].costo_raggiunto;
                
                cont++;
            }
            return (perc_tot, perc_i, perc_ragg, costo_ragg);
        }
        else {
            uint lunghezza = righi_max_sal[_sal - 1] - righi_max_sal[_sal - 2];
            
            uint[] memory perc_tot = new uint[](lunghezza);
            uint[] memory perc_i = new uint[](lunghezza);
            uint[] memory perc_ragg = new uint[](lunghezza);
            uint[] memory costo_ragg = new uint[](lunghezza);
            
            uint cont = 0;
            
            for (uint j = (righi_max_sal[_sal - 2] - 1); j < (righi_max_sal[_sal - 1] - 1); j++) {
                perc_tot[cont] = avanzamenti[j].percentuale_totale;
                perc_i[cont] = avanzamenti[j].percentuale_i;
                perc_ragg[cont] = avanzamenti[j].percentuale_raggiunta;
                costo_ragg[cont] = avanzamenti[j].costo_raggiunto;
                
                cont++;
            }
            return (perc_tot, perc_i, perc_ragg, costo_ragg);
        }
    }
    
    function getSal2 (uint _sal) public returns (string[] memory, uint[] memory, string[] memory, uint[] memory) {
        if (_sal == 1) {
            uint lunghezza = righi_max_sal[_sal - 1] - 1;
            
            uint[] memory date = new uint[](lunghezza);
            string[] memory code = new string[](lunghezza);
            string[] memory name = new string[](lunghezza);
            uint[] memory costo_i = new uint[](lunghezza);
            
            uint cont = 0;
            
            for (uint8 j = 0; j < lunghezza; j++) {
                code[cont] = avanzamenti[j].codice_lavoro;
                date[cont] = avanzamenti[j].data_sal;
                name[cont] = avanzamenti[j].nome_lavoro;
                costo_i[cont] = avanzamenti[j].costo_i;
                
                cont++;
            }
            return (code, date, name, costo_i);
        }
        else {
            uint lunghezza = righi_max_sal[_sal - 1] - righi_max_sal[_sal - 2];
            
            uint[] memory date = new uint[](lunghezza);
            string[] memory code = new string[](lunghezza);
            string[] memory name = new string[](lunghezza);
            uint[] memory costo_i = new uint[](lunghezza);
            
            uint cont = 0;
            
            for (uint j = (righi_max_sal[_sal - 2] - 1); j < (righi_max_sal[_sal - 1] - 1); j++) {
                code[cont] = avanzamenti[j].codice_lavoro;
                date[cont] = avanzamenti[j].data_sal;
                name[cont] = avanzamenti[j].nome_lavoro;
                costo_i[cont] = avanzamenti[j].costo_i;
                
                cont++;
            }
            return (code, date, name, costo_i);
        }
    }
    
    
    // funzione che serve per restituire i dati necessari (data sal, numero sal, valore monetario sal) a formare il grafico dell andamento delle lavorazioni
    function getGrafico () public returns(uint[] memory, uint[] memory, uint[] memory) {
        uint[] memory date = new uint[](sal - 1);
        uint[] memory sa = new uint[](sal - 1);
        uint[] memory val = new uint[](sal - 1);
        
        uint cont = 0;
        
        for (uint i = 0; i < (sal - 1) ; i++) { 
            date[cont] = data[i];
            sa[cont] = i+1;
            val[cont] = countCostoSal(i+1);
            cont++;
        }
        return(date, sa, val);
    }

    
    Misure m;
    address private indirizzoMisure;
    
    function setIndirizzoMisure (address _indirizzo) public {
        require(_indirizzo != address(0), "L'indirizzo passato non ? valido");
        indirizzoMisure = _indirizzo;
        m = Misure(indirizzoMisure);
    }
    
    Giornale g;
    address private indirizzoGiornale;
    
    function setIndirizzoGiornale(address _indirizzo) public {
        require(_indirizzo != address(0), "L'indirizzo passato non ? valido");
        indirizzoGiornale = _indirizzo;
        g = Giornale(indirizzoGiornale);
    }
    
    Libretto l;
    address private indirizzoLibretto;
    
    function setIndirizzoLibretto (address _indirizzo) public {
        require(_indirizzo != address(0), "L'indirizzo passato non ? valido");
        indirizzoLibretto = _indirizzo;
        l = Libretto(indirizzoLibretto);
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
    
    Registro r;
    address private indirizzoRegistro;
    
    function setIndirizzoRegistro (address _indirizzo) public {
        require(_indirizzo != address(0), "L'indirizzo passato non ? valido");
        indirizzoRegistro = _indirizzo;
        r = Registro(indirizzoRegistro);
    }
    
    
    modifier onlyDirettoreLavori {
        // solo il Direttore dei Lavori pu? utilizzare questa funzione
        require(
            m.enableDL(msg.sender), "Solo il Direttore dei Lavori pu? utilizzare questa funzione"
        );
        _; //indica dove deve essere posta la funzione chiamata
    }
    
    function killAvanzamento() public {
        g.killGiornale();
        l.killLibretto();
        i.killRiserve();
        a.killFirme();
        r.killRegistro();
        m.killMisure();
        selfdestruct(msg.sender);
    }
}
