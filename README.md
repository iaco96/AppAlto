# AppAlto

Progetto per i corsi di Ingegneria del Software e Sicurezza Informatica riguardante l'implementazione di un applicazione web che permetta di automatizzare al meglio il processo di gestione di un contratto d'appalto edilizio.

Durante lo svolgimento del progetto sono stati utilizzati:
- Blockchain Quorum 
- Smart contract implementati con Solidity 5.0
- Truffle 5.0.17 per il deploy degli smart contract su Quorum
- NodeJS per il server
- Express come framework per il server
- Angular 7 per il frontend
- Bootstrap per la parte grafica del frontend


## Installazione

Si richiede l'installazione di:
- Virtual Box dal sito uffciale
- Vagrant dal sito ufficiale
- NodeJS dal sito ufficiale
- Truffle con il comando da terminale: 'npm install -g truffle@5.0.17'
- Angular con il comando da terminale: 'npm install -g @angular/cli'

Dopo aver scaricato il repository, all'interno di ogni directory eseguire i comandi seguenti:
- Blockchain: 
aprire un terminale e all'interno della cartella blockchain/quorum-examples-master digitare in sequenza i comandi:
  - 'vagrant up'
  - 'vagrant ssh'
  - 'cd quorum-examples/7nodes'
  - 'sudo ./raft-init.sh'
  - 'sudo ./raft-start.sh'
 

## Studenti: Roberto Broccoletti, Paolo Di Massimo, Luca Luzi, Davide Manco, Iacopo Pacifici
