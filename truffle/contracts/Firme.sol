pragma solidity ^0.5.0;

import "./StringUtils.sol";
import "./Misure.sol";

contract Firme {
    
    struct Controfirma {
        uint numero_documento; // indica il numero del documento, ad esempio il libretto nr.1 oppure il registro nr.2...
        uint numero_rigo; // indica il rigo del documento
        bool riserva; // questo campo va compilato solo nel caso del libretto per dire che si ha una firma con riserva
    }
    
    mapping (uint => Controfirma) private firme;
    uint private numero_firme = 1;
    
    
    function getFirme() public returns(uint[] memory, uint[] memory) {
        uint[] memory doc = new uint[](numero_firme - 1);
        uint[] memory rig = new uint[](numero_firme - 1);
        
        uint cont = 0;
        
        for (uint i = 0; i < (numero_firme - 1); i++) {
            doc[cont] = firme[i].numero_documento;
            rig[cont] = firme[i].numero_rigo;
            
            cont++;
        }
        
        return(doc, rig);
    }
    
    // serve per vedere se in un certo rigo del libretto � stata posta una firma
    function checkFirma (uint _documento, uint _rigo) public returns(bool) {
        for (uint i = 0; i < (numero_firme - 1); i++) {
            if (firme[i].numero_documento == _documento && firme[i].numero_rigo == _rigo) {
                if (firme[i].numero_rigo != 0) {
                    return true;
                }
                else {
                    return false;
                }
            }
        }
    }
    
    // serve per vedere se in un certo rigo del libretto � stata posta una firma con riserva
    function checkRiserva (uint _documento, uint _numero_rigo) public returns(bool) {
        for (uint i = 0; i < (numero_firme - 1); i++) {
            if (firme[i].numero_documento == _documento && firme[i].numero_rigo == _numero_rigo) {
                return (firme[i].riserva);
            }
        }
    }
    
    
    // setta la firma 
    function setFirme(uint _documento, uint _numero_rigo) public {
        firme[numero_firme - 1].numero_documento = _documento;
        firme[numero_firme - 1].numero_rigo = _numero_rigo; 
        numero_firme++;
    }
    
    //setta la firma con riserva per la ditta, infatti ? l unico attore che puo invocarla
    function setFirme(uint _documento, uint _numero_rigo, bool _riserva) public {
        firme[numero_firme - 1].numero_documento = _documento;
        firme[numero_firme - 1].numero_rigo = _numero_rigo; 
        firme[numero_firme - 1].riserva = _riserva;
        numero_firme++;
    }


    Misure m;
    address private indirizzoMisure;
    
    function setIndirizzoMisure (address _indirizzo) public {
        require(_indirizzo != address(0), "L'indirizzo passato non ? valido");
        indirizzoMisure = _indirizzo;
        m = Misure(indirizzoMisure);
    }

    
   function killFirme() public {
        selfdestruct(msg.sender);
    }
}
