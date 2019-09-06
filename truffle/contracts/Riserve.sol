pragma solidity ^0.5.0;
pragma experimental ABIEncoderV2;

import "./Libretto.sol";
import "./Misure.sol";
import "./Firme.sol";

contract Riserve {
    
    struct Riserva {
        uint percentuale_riserva;
        string descrizione_riserva;
    }
    
    mapping (uint => Riserva) private riserve;
    
    
    // restituisce 6 campi:
    // - uint array per il numero di rigo
    // - bool array per la firma/firma con riserva o no
    // - bool array per la firma con riserva o no
    // - bool array per la riserva o no
    // - uint array per la percentuale_riserva
    // - string array per la descrizione_riserva
    function getRiserve1(uint _libretto) public returns(bool[] memory, bool[] memory, bool[] memory) {
        require (_libretto < l.getLibretto(), "Il libretto non � ancora stato terminato");
        if (_libretto == 1) {
            uint lunghezza = (l.getRighiMaxLibretto(_libretto) - 1);
            
            bool[] memory fir = new bool[](lunghezza);
            bool[] memory firis = new bool[](lunghezza);
            bool[] memory ris = new bool[](lunghezza);
            
            uint cont = 0;
            
            for (uint8 j = 0; j < lunghezza; j++) {
                if (l.checkSovrascritto(j)) {
                    fir[cont] = a.checkFirma(_libretto, j+1);
                    firis[cont] = a.checkRiserva(_libretto, j+1);
                    
                    if (riserve[j].percentuale_riserva == 0) {
                        ris[cont] = false;
                    }
                    else {
                        ris[cont] = true;
                    }
                    
                    cont++;
                }
                else {
                    fir[cont] = true;
                    firis[cont] = true;
                    ris[cont] = true;
                    cont++;
                }
            }
            return (fir, firis, ris);
        }
        else {
            uint lunghezza = (l.getRighiMaxLibretto(_libretto) - l.getRighiMaxLibretto(_libretto - 1));
            
            bool[] memory fir = new bool[](lunghezza);
            bool[] memory firis = new bool[](lunghezza);
            bool[] memory ris = new bool[](lunghezza);
            
            uint cont = 0;
            
            for (uint j = (l.getRighiMaxLibretto(_libretto - 1) - 1); j < (l.getRighiMaxLibretto(_libretto) - 1); j++) {
                if (l.checkSovrascritto(j)) {
                    fir[cont] = a.checkFirma(_libretto, cont+1);
                    firis[cont] = a.checkRiserva(_libretto, cont+1);
                    
                    if (riserve[j].percentuale_riserva == 0) {
                        ris[cont] = false;
                    }
                    else {
                        ris[cont] = true;
                    }
                    
                    cont++;
                }
                else {
                    fir[cont] = true;
                    firis[cont] = true;
                    ris[cont] = true;
                    cont++;
                }
            }
            return (fir, firis, ris);
        }
    }
    
    
    function getRiserve2(uint _libretto) public returns(uint[] memory, uint[] memory, string[] memory) {
        require (_libretto < l.getLibretto(), "Il libretto non � ancora stato terminato");
        if (_libretto == 1) {
            uint lunghezza = (l.getRighiMaxLibretto(_libretto) - 1);
            
            uint[] memory rig = new uint[](lunghezza);
            uint[] memory perc = new uint[](lunghezza);
            string[] memory desc = new string[](lunghezza);
            
            uint cont = 0;
            
            for (uint8 j = 0; j < lunghezza; j++) {
                if (l.checkSovrascritto(j)) {
                    rig[cont] = j+1;
                    perc[cont] = riserve[j].percentuale_riserva;
                    desc[cont] = riserve[j].descrizione_riserva;
                    
                    cont++;
                }
                else {
                    cont++;
                }
            }
            return (rig, perc, desc);
        }
        else {
            uint lunghezza = (l.getRighiMaxLibretto(_libretto) - l.getRighiMaxLibretto(_libretto - 1));
            
            uint[] memory rig = new uint[](lunghezza);
            uint[] memory perc = new uint[](lunghezza);
            string[] memory desc = new string[](lunghezza);
            
            uint cont = 0;
            
            for (uint j = (l.getRighiMaxLibretto(_libretto - 1) - 1); j < (l.getRighiMaxLibretto(_libretto) - 1); j++) {
                if (l.checkSovrascritto(j)) {
                    rig[cont] = j+1;
                    perc[cont] = riserve[j].percentuale_riserva;
                    desc[cont] = riserve[j].descrizione_riserva;
                    
                    cont++;
                }
                else {
                    cont++;
                }
            }
            return (rig, perc, desc);
        }
    }
    
    
    // il DL inserisce una riserva su una misurazione, e in automatico viene modificata la percentuale di completaento del lavoro
    // _numero indica il numero del rigo del libretto, ovvero il numero totale di rigo, non il singolo rigo di quel libretto
    function insertRiserva (string memory _descrizione, uint _percentuale, uint _rigo, uint _libretto)
    public onlyDirettoreLavori {
        // con il require si richiede che la ditta abbia espresso la volonta di firmare con una certa riserva
        // e richiede anche che la percentuale non sia gia stata cambiata
        require (a.checkRiserva(_libretto, _rigo), "Non si ha una firma con riserva per questo rigo"); 
        
        uint rigo = l.getRigoLibretto(_libretto, _rigo);
        require (riserve[rigo - 1].percentuale_riserva == 0, "La riserva ? gi? stata esplicitata in precedenza");
        riserve[rigo - 1].descrizione_riserva = _descrizione;
        require(_percentuale <= 100, "Non ? possibile inserire un valore percentuale superiore a 100");
        riserve[rigo - 1].percentuale_riserva = _percentuale;
        string memory codice = l.findCodice(_libretto, _rigo);
        m.setPercentualeLavoro(codice, _percentuale); 
        m.updateValore(codice);
        
        // se sono state inserite tutte le firme a tutti i righi con evenutali riserve, allora il libretto è completo
        if (l.checkLibrettoOk(_libretto)) {
            // si va quindi a controllare che le percentuali di tutti i lavori siano al 100%, in modo da terminare il constratto
            // se tutte sono al 100%
            if (m.checkPercentuali()) {
                // si chiama questa funzione che setta uan variabile a true per indicare che tutte le percentuali sono complete
                m.setPercentuali();
            }
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
    
    Firme a;
    address private indirizzoFirme;
    
    function setIndirizzoFirme (address _indirizzo) public {
        require(_indirizzo != address(0), "L'indirizzo passato non ? valido");
        indirizzoFirme = _indirizzo;
        a = Firme(indirizzoFirme);
    }
    
    modifier onlyDirettoreLavori {
        // solo il Direttore dei Lavori pu? utilizzare questa funzione
        require(
            m.enableDL(msg.sender), "Solo il Direttore dei Lavori pu? utilizzare questa funzione"
        );
        _; //indica dove deve essere posta la funzione chiamata
    } 
    
    function killRiserve() public {
        selfdestruct(msg.sender);
    }
}
