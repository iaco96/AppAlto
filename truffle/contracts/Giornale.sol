pragma solidity ^0.5.0;
pragma experimental ABIEncoderV2;

import "./Misure.sol";

contract Giornale {

    struct GiornaleDeiLavori {
        uint data_giornale;
        mapping (uint => uint) quantita_personale;
        mapping (uint => string) qualita_personale;
        mapping (uint => uint) ore_presenza_personale;
        uint quanto_personale; // serve a contenere il numero di personale inserito per ogni rigo
        string descrizione_giornale;
        mapping (uint => string) attrezzature_utilizzate;
        mapping (uint => uint) quantita_attrezzatura;
        uint quante_attrezzature; // serve per contenere il numero di attrezzature inserite per ogni rigo
        uint sovrascritto; // indica il numero del rigo del giornale che sovrascrive questo rigo di giornale
        uint8 giornale; // indica il numero del giornale
        uint numero_giornale; // indica il rigo di quel giornale
    }
    
    mapping (uint => GiornaleDeiLavori) private giornali;
    uint private numero_rigo = 1;
    uint8 private giornale = 1; 
    uint private numero_totale_giornali = 1; // in realt? ? il numero totale di righi di tutti i giornali
    uint[] private righi_max; // serve per contenere il numero massimo di righi che si ha per ogni numero di giornale
    
    mapping(uint => uint) private data;


    // a partire dal numero di giornale e dal rigo del giornale, restituisce il rigo complessivo rispetto a tutti i giornali
    function getRigoGiornale(uint _giornale, uint _rigo) public returns(uint) {
        for (uint i = 0; i < (numero_totale_giornali - 1); i++) {
            if (giornali[i].giornale == _giornale && giornali[i].numero_giornale == _rigo) {
                return (i + 1);
            }
        }
    }


    // a partire da una certa data, restituisce il numero di giornale e se ? terminato o meno
    // ovvero se il DL ha utilizzato la funzione finishGiornale
    function getGiornaleData (uint _data) public returns(uint, uint , bool) {
        require (_data != 0, "Non ? possibile inserire una data nulla");
        bool term;
        for (uint i = 0; i < giornale; i++) {
            if (data[i] == _data) {
                if (i < (giornale - 1)) {
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
    function getGiornaleData() public returns(uint[] memory, uint[] memory) {
        
        uint[] memory gio = new uint[](giornale);
        uint[] memory date = new uint[](giornale);
        
        uint cont = 0;
        
        for (uint i = 0; i < giornale; i++) {
            gio[cont] = i+1;
            date[cont] = data[i];
            cont++;
        }
        return(gio, date);
    }
    

    // serve per incrementare il numero di giornale, cio? quando si conclude l immissione di dati in quella giornata
    // si invrementa il numero del giornale e si riporta a uno il numero di righi di quel giornale
    // quindi il prossimo rigo che verr? inserito sar? il rigo numero 1 di un nuovo giornale
    function finishGiornale () public onlyDirettoreLavori{ 
        // controlla che sia stato inserito almeno un rigo per quel giornale prima di poterlo terminare
        require (numero_rigo > 1, "Non sono stati inseriti righi in questo giornale");
        righi_max.push(numero_totale_giornali); // setta il numero di righi max per quel giornale
        numero_rigo = 1;
        giornale++;
    }
    

    // PUO ESSERE FATTA SOLO PRIMA CHE IL DL ABBIA TERMINATO QUEL GIORNALE, CIOE SIA STATA CHIAMATA LA FUNZIONE finishGiornale    
    // serve per modificare il rigo di un GiornaleDeiLavori
    // il numero del nuovo rigo sar? inserito nel campo sovrascritto del vecchio rigo
    function updateGiornale (uint[] memory _quantita, string[] memory _qualita, uint[] memory _ore,
    string memory _descrizione, string[] memory _attrezzature, uint[] memory _quantita_attr, uint _numero,
    uint _numero_documento) public onlyDirettoreLavori { 
        // si richiede che il giornale inserito sia quello corrente
        require(_numero_documento == giornale, "Il giornale inserito non � quello corrente");
        // si richiede che il rigo inserito sia stato gi� inserito
        require(_numero < numero_rigo, "Il numero di rigo inserito non � ancora stato esplicitato");
        
        // non puo essere fatto l update giornale se il DL ha gia concluso quel giornale con il finishGiornale
        // quindi viene fatto il controllo che il numero di quel giornale corrisponde al numero attuale del giornale
        GiornaleDeiLavori storage g = giornali[numero_totale_giornali - 1];
        uint rigo = getRigoGiornale(_numero_documento, _numero);
        
        g.giornale = giornale;
        g.data_giornale = now;
        g.descrizione_giornale = _descrizione;
        g.numero_giornale = numero_rigo;
        g.sovrascritto = 0;
        giornali[rigo - 1].sovrascritto = numero_rigo; // setta il rigo che viene sovrascritto con il rigo che lo sovrascrive
        
        // controlla che la quantita_personale inserita, la qualita_personale e le ore_presenza_personale siano uguali
        // in modo che non possano essere inseriti dati in piu o in meno di quelli richiesti
        // ad esempio non si possono inserire delle ore per un personale insesistente
        require(_quantita.length == _qualita.length, "Non ? stato inserito uno stesso numero di valori per il personale");
        require(_quantita.length == _ore.length, "Non ? stato inserito uno stesso numero di valori per il personale");
        require(_qualita.length == _ore.length, "Non ? stato inserito uno stesso numero di valori per il personale");
        
        // stesso discorso per le attrezzature_utilizzate e la quantita_attrezzatura
        require(_attrezzature.length == _quantita_attr.length, "Non ? stato inserito uno stesso numero di valori per le attrezzature");
        
        // sono necessari cicli for per inserire all interno del mapping
        // ho fatto 2 cicli for perche la lunghezza dei vari array potrebbe essere diversa
        // per il discorso dei require sopra, alcuni assegnamenti possono essere fatti in un ciclo unico
        for (uint8 i = 0; i < _quantita.length; i++) {
            require(_quantita[i] != 0, "Non ? possibile inserire un numero di operai nulli");
            g.quantita_personale[i] = _quantita[i];
            g.qualita_personale[i] = _qualita[i];
            require(_ore[i] != 0, "Non ? possibile inserire un numero di ore di lavoro nulle");
            g.ore_presenza_personale[i] = _ore[i];
        }
        for (uint8 i = 0; i < _attrezzature.length; i++) {
            g.attrezzature_utilizzate[i] = _attrezzature[i];
            require(_quantita_attr[i] != 0, "Non ? possibile inserire un numero di attrezzature nullo");
            g.quantita_attrezzatura[i] = _quantita_attr[i];
        }
        g.quanto_personale = _quantita.length;
        g.quante_attrezzature = _attrezzature.length;
        numero_rigo++;
        numero_totale_giornali++;
    }

    
    // serve al DL per inserire il giornale
    function insertGiornale(uint[] memory _quantita, string[] memory _qualita, uint[] memory _ore,
    string memory _descrizione, string[] memory _attrezzature, uint[] memory _quantita_attr) public onlyDirettoreLavori { 
        GiornaleDeiLavori storage g = giornali[numero_totale_giornali - 1];
        g.data_giornale = now;
        g.descrizione_giornale = _descrizione;
        g.sovrascritto = 0; 
        g.numero_giornale = numero_rigo;
        g.giornale = giornale; // setta il numero del giornale che si sta scrivendo
        
        // controlla che la quantita_personale inserita, la qualita_personale e le ore_presenza_personale siano uguali
        // in modo che non possano essere inseriti dati in piu o in meno di quelli richiesti
        // ad esempio non si possono inserire delle ore per un personale insesistente
        require(_quantita.length == _qualita.length, "Non ? stato inserito uno stesso numero di valori per il personale");
        require(_quantita.length == _ore.length, "Non ? stato inserito uno stesso numero di valori per il personale");
        require(_qualita.length == _ore.length, "Non ? stato inserito uno stesso numero di valori per il personale");
        
        // stesso discorso per le attrezzature_utilizzate e la quantita_attrezzatura
        require(_attrezzature.length == _quantita_attr.length, "Non ? stato inserito uno stesso numero di valori per le attrezzature");
        
        // sono necessari cicli for per inserire all interno del mapping
        // ho fatto 2 cicli for perche la lunghezza dei vari array potrebbe essere diversa
        // per il discorso dei require sopra, alcuni assegnamenti possono essere fatti in un ciclo unico
        for (uint8 i = 0; i < _quantita.length; i++) {
            require(_quantita[i] != 0, "Non ? possibile inserire un numero di operai nulli");
            g.quantita_personale[i] = _quantita[i]; 
            g.qualita_personale[i] = _qualita[i]; 
            require(_ore[i] != 0, "Non ? possibile inserire un numero di ore di lavoro nullo");
            g.ore_presenza_personale[i] = _ore[i];     
        }
        for (uint8 i = 0; i < _attrezzature.length; i++) {
            g.attrezzature_utilizzate[i] = _attrezzature[i];
            require(_quantita_attr[i] != 0, "Non ? possibile inserire un numero di attrezzature nullo");
            g.quantita_attrezzatura[i] = _quantita_attr[i];   
        }
        g.quanto_personale = _quantita.length;
        g.quante_attrezzature = _attrezzature.length;
        numero_rigo++;
        numero_totale_giornali++;
        
        // se la data per quel giornale ? a 0 significa che ancora non ? stato scritto nulla per quel giornale, quindi viene instanziata
        if (data[giornale - 1] == 0) {
            data[giornale - 1] = now;
        }
    }
    
    
    function get1(uint _giornale) public returns(uint[][] memory, string[][] memory, uint[][] memory, uint[] memory) {
        if (_giornale == giornale) {
            if (_giornale == 1) {
                uint lunghezza = (numero_totale_giornali - 1);
                
                uint[][] memory quantita_perso = new uint[][](lunghezza);
                string[][] memory qualita_perso = new string[][](lunghezza);
                uint[][] memory ore = new uint[][](lunghezza);
                uint[] memory quanto = new uint[](lunghezza); 
                
                uint cont = 0;
                
                for (uint8 j = 0; j < lunghezza; j++) {
                    quanto[cont] = giornali[j].quanto_personale;
                    
                    
                    uint[] memory temp1 = new uint[](quanto[cont]);
                    string[] memory temp2 = new string[](quanto[cont]);
                    uint[] memory temp3 = new uint[](quanto[cont]);
                    
                    for (uint8 k = 0; k < quanto[cont]; k++) {
                        temp1[k] = giornali[j].quantita_personale[k];
                        temp2[k] = giornali[j].qualita_personale[k];
                        temp3[k] = giornali[j].ore_presenza_personale[k];
                    }
                    
                    quantita_perso[cont] = temp1;
                    qualita_perso[cont] = temp2;
                    ore[cont] = temp3;
                    
                    cont++;
                }
                return (quantita_perso, qualita_perso, ore, quanto);
            }
            else {
                uint lunghezza = ((numero_totale_giornali - 1) - (righi_max[_giornale - 2] - 1));
                
                uint[][] memory quantita_perso = new uint[][](lunghezza);
                string[][] memory qualita_perso = new string[][](lunghezza);
                uint[][] memory ore = new uint[][](lunghezza);
                uint[] memory quanto = new uint[](lunghezza); 
                
                uint cont = 0;
                
                for (uint j = (righi_max[_giornale - 2] - 1); j < (numero_totale_giornali - 1); j++) {
                    quanto[cont] = giornali[j].quanto_personale;
                    
                    uint[] memory temp1 = new uint[](quanto[cont]);
                    string[] memory temp2 = new string[](quanto[cont]);
                    uint[] memory temp3 = new uint[](quanto[cont]);
                    
                    for (uint8 k = 0; k < quanto[cont]; k++) {
                        temp1[k] = giornali[j].quantita_personale[k];
                        temp2[k] = giornali[j].qualita_personale[k];
                        temp3[k] = giornali[j].ore_presenza_personale[k];
                    }
                    
                    quantita_perso[cont] = temp1;
                    qualita_perso[cont] = temp2;
                    ore[cont] = temp3;
                    
                    cont++;
                }  
                return (quantita_perso, qualita_perso, ore, quanto);
            }
        }
        else if (_giornale < giornale) {
            if (_giornale == 1) {
                uint lunghezza = righi_max[_giornale - 1] - 1;
                
                uint[][] memory quantita_perso = new uint[][](lunghezza);
                string[][] memory qualita_perso = new string[][](lunghezza);
                uint[][] memory ore = new uint[][](lunghezza);
                uint[] memory quanto = new uint[](lunghezza); 
                
                uint cont = 0;
                
                for (uint8 j = 0; j < lunghezza; j++) {
                    quanto[cont] = giornali[j].quanto_personale;
                    
                    uint[] memory temp1 = new uint[](quanto[cont]);
                    string[] memory temp2 = new string[](quanto[cont]);
                    uint[] memory temp3 = new uint[](quanto[cont]);
                    
                    for (uint8 k = 0; k < quanto[cont]; k++) {
                        temp1[k] = giornali[j].quantita_personale[k];
                        temp2[k] = giornali[j].qualita_personale[k];
                        temp3[k] = giornali[j].ore_presenza_personale[k];
                    }
                    
                    quantita_perso[cont] = temp1;
                    qualita_perso[cont] = temp2;
                    ore[cont] = temp3;
                    
                    cont++;
                }
                return (quantita_perso, qualita_perso, ore, quanto);
            }
            else {
                uint lunghezza = righi_max[_giornale - 1] - righi_max[_giornale - 2];
                
                uint[][] memory quantita_perso = new uint[][](lunghezza);
                string[][] memory qualita_perso = new string[][](lunghezza);
                uint[][] memory ore = new uint[][](lunghezza);
                uint[] memory quanto = new uint[](lunghezza); 
                
                uint cont = 0;
                
                for (uint j = (righi_max[_giornale - 2] - 1); j < (righi_max[_giornale - 1] - 1); j++) {
                    quanto[cont] = giornali[j].quanto_personale;
                    
                    uint[] memory temp1 = new uint[](quanto[cont]);
                    string[] memory temp2 = new string[](quanto[cont]);
                    uint[] memory temp3 = new uint[](quanto[cont]);
                    
                    for (uint8 k = 0; k < quanto[cont]; k++) {
                        temp1[k] = giornali[j].quantita_personale[k];
                        temp2[k] = giornali[j].qualita_personale[k];
                        temp3[k] = giornali[j].ore_presenza_personale[k];
                    }
                    
                    quantita_perso[cont] = temp1;
                    qualita_perso[cont] = temp2;
                    ore[cont] = temp3;
                    
                    cont++;
                }
                return (quantita_perso, qualita_perso, ore, quanto);
            }
        }
    }
    
    
    function get2(uint _giornale) public returns(string[][] memory, uint[][] memory, uint[] memory) {
        if (_giornale == giornale) {
            if (_giornale == 1) {
                uint lunghezza = (numero_totale_giornali - 1);
                
                string[][] memory attrezz = new string[][](lunghezza);
                uint[][] memory quantita_att = new uint[][](lunghezza);
                uint[] memory quante = new uint[](lunghezza);
                
                uint cont = 0;
                
                for (uint8 j = 0; j < lunghezza; j++) {
                    quante[cont] = giornali[j].quante_attrezzature;
                    
                    string[] memory temp1 = new string[](quante[cont]);
                    uint[] memory temp2 = new uint[](quante[cont]);
                    
                    for (uint8 k = 0; k < quante[cont]; k++) {
                        temp1[k] = giornali[j].attrezzature_utilizzate[k];
                        temp2[k] = giornali[j].quantita_attrezzatura[k];
                    }
                    
                    attrezz[cont] = temp1;
                    quantita_att[cont] = temp2;
                    
                    cont++;
                }
                return (attrezz, quantita_att, quante);
            }
            else {
                uint lunghezza = ((numero_totale_giornali - 1) - (righi_max[_giornale - 2] - 1));
                
                string[][] memory attrezz = new string[][](lunghezza);
                uint[][] memory quantita_att = new uint[][](lunghezza);
                uint[] memory quante = new uint[](lunghezza);
                
                uint cont = 0;
                
                for (uint j = (righi_max[_giornale - 2] - 1); j < (numero_totale_giornali - 1); j++) {
                    quante[cont] = giornali[j].quante_attrezzature;
                    
                    string[] memory temp1 = new string[](quante[cont]);
                    uint[] memory temp2 = new uint[](quante[cont]);
                    
                    for (uint8 k = 0; k < quante[cont]; k++) {
                        temp1[k] = giornali[j].attrezzature_utilizzate[k];
                        temp2[k] = giornali[j].quantita_attrezzatura[k];
                    }
                    
                    attrezz[cont] = temp1;
                    quantita_att[cont] = temp2;
                    
                    cont++;
                }
                return (attrezz, quantita_att, quante);
            }
        }
        else if (_giornale < giornale) {
            if (_giornale == 1) {
                uint lunghezza = righi_max[_giornale - 1] - 1;
                
                string[][] memory attrezz = new string[][](lunghezza);
                uint[][] memory quantita_att = new uint[][](lunghezza);
                uint[] memory quante = new uint[](lunghezza);
                
                uint cont = 0;
                
                for (uint8 j = 0; j < lunghezza; j++) {
                    quante[cont] = giornali[j].quante_attrezzature;
                    
                    string[] memory temp1 = new string[](quante[cont]);
                    uint[] memory temp2 = new uint[](quante[cont]);
                    
                    for (uint8 k = 0; k < quante[cont]; k++) {
                        temp1[k] = giornali[j].attrezzature_utilizzate[k];
                        temp2[k] = giornali[j].quantita_attrezzatura[k];
                    }
                    
                    attrezz[cont] = temp1;
                    quantita_att[cont] = temp2;
                    
                    cont++;
                }
                return (attrezz, quantita_att, quante);
            }
            else {
                uint lunghezza = righi_max[_giornale - 1] - righi_max[_giornale - 2];
                
                string[][] memory attrezz = new string[][](lunghezza);
                uint[][] memory quantita_att = new uint[][](lunghezza);
                uint[] memory quante = new uint[](lunghezza);
                
                uint cont = 0;
                
                for (uint j = (righi_max[_giornale - 2] - 1); j < (righi_max[_giornale - 1] - 1); j++) {
                    quante[cont] = giornali[j].quante_attrezzature;
                    
                    string[] memory temp1 = new string[](quante[cont]);
                    uint[] memory temp2 = new uint[](quante[cont]);
                    
                    for (uint8 k = 0; k < quante[cont]; k++) {
                        temp1[k] = giornali[j].attrezzature_utilizzate[k];
                        temp2[k] = giornali[j].quantita_attrezzatura[k];
                    }
                    
                    attrezz[cont] = temp1;
                    quantita_att[cont] = temp2;
                    
                    cont++;
                }
                return (attrezz, quantita_att, quante);
            }
        }
    }
    
    
    function get3(uint _giornale) public returns(uint[] memory, string[] memory, uint[] memory, uint[] memory) {
        if (_giornale == giornale) {
            if (_giornale == 1) {
                uint lunghezza = (numero_totale_giornali - 1);
                
                uint[] memory date = new uint[](lunghezza);
                string[] memory descriz = new string[](lunghezza);
                uint[] memory sovra = new uint[](lunghezza);
                uint[] memory rigo = new uint[](lunghezza);
                
                uint cont = 0;
                
                for (uint8 j = 0; j < lunghezza; j++) {
                    sovra[cont] = giornali[j].sovrascritto;
                    rigo[cont] = giornali[j].numero_giornale;
                    date[cont] = giornali[j].data_giornale;
                    descriz[cont] = giornali[j].descrizione_giornale;
                    
                    
                    cont++;
                }
                return (date, descriz, sovra, rigo);
            }
            else {
                uint lunghezza = ((numero_totale_giornali - 1) - (righi_max[_giornale - 2] - 1));
                
                uint[] memory date = new uint[](lunghezza);
                string[] memory descriz = new string[](lunghezza);
                uint[] memory sovra = new uint[](lunghezza);
                uint[] memory rigo = new uint[](lunghezza);
                
                uint cont = 0;
                
                for (uint j = (righi_max[_giornale - 2] - 1); j < (numero_totale_giornali - 1); j++) {
                    date[cont] = giornali[j].data_giornale;
                    descriz[cont] = giornali[j].descrizione_giornale;
                    sovra[cont] = giornali[j].sovrascritto;
                    rigo[cont] = giornali[j].numero_giornale;
                    
                    cont++;
                }
                return (date, descriz, sovra, rigo);
            }
        }
        else if (_giornale < giornale) {
            if (_giornale == 1) {
                uint lunghezza = righi_max[_giornale - 1] - 1;
                
                uint[] memory date = new uint[](lunghezza);
                string[] memory descriz = new string[](lunghezza);
                uint[] memory sovra = new uint[](lunghezza);
                uint[] memory rigo = new uint[](lunghezza);
                
                uint cont = 0;
                
                for (uint8 j = 0; j < lunghezza; j++) {
                    date[cont] = giornali[j].data_giornale;
                    descriz[cont] = giornali[j].descrizione_giornale;
                    sovra[cont] = giornali[j].sovrascritto;
                    rigo[cont] = giornali[j].numero_giornale;
                    
                    cont++;
                }
                return (date, descriz, sovra, rigo);
            }
            else {
                uint lunghezza = righi_max[_giornale - 1] - righi_max[_giornale - 2];
                
                uint[] memory date = new uint[](lunghezza);
                string[] memory descriz = new string[](lunghezza);
                uint[] memory sovra = new uint[](lunghezza);
                uint[] memory rigo = new uint[](lunghezza);
                
                uint cont = 0;
                
                for (uint j = (righi_max[_giornale - 2] - 1); j < (righi_max[_giornale - 1] - 1); j++) {
                    date[cont] = giornali[j].data_giornale;
                    descriz[cont] = giornali[j].descrizione_giornale;
                    sovra[cont] = giornali[j].sovrascritto;
                    rigo[cont] = giornali[j].numero_giornale;
                    
                    cont++;
                }
                return (date, descriz, sovra, rigo);
            }
        }
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
    
    function killGiornale() public {
        selfdestruct(msg.sender);
    }
}
