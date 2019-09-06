import {Attrezzature} from './Attrezzature';
import {Personale } from './Personale';

export class rigoGiornale{
    sovrascritto: number;
    timestamp: number;
    num_rigo: number;
    personale: Personale[];
    attrezzatura: Attrezzature[];
    descrizione: string;

}