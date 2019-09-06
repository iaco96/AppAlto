export class check{
    libretti:{
        num_libretto:number,
        timestamp:number
    }[];
    giornale:boolean;
    inser_terminati:boolean;
    lavori_terminati: boolean;
    num_lavori:number;
    soglia:number;
    registri_da_compilare:{
        num_libretto:number,
        timestamp:number
    }[];
    soglia_superata: boolean;
    num_sal:number;
}