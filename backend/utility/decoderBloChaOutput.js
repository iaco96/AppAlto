var exports = module.exports = {}
exports.decodeLavori = function(get1){
    let risposta=[];
    Object.keys(get1).forEach(index => {   
        Object.keys(get1[index]).forEach(ind =>{
            if (index==0)
                risposta[ind] = { codLavoro : get1[index][ind]};
            else if(index==1)
                risposta[ind].nomeLavoro = get1[index][ind];
            else risposta[ind].costoLavoro = parseInt(get1[index][ind],10);
        })
    });
    return risposta;
}

exports.decodeGiornale = function(get1,get2,get3){

    let risposta=[]
    Object.keys(get1).forEach(ind0 => {
        get1[ind0].forEach((ele1,ind1) =>{
            //console.log(ele1);
            if(!Array.isArray(ele1)) return 0 ;
            ele1.forEach((ele2,ind2) =>{
            if (ind0 == 0){
                if(!risposta[ind1]) risposta.push({});
                
            
                if(!risposta[ind1].personale ){
                    risposta[ind1].personale = [];
                    risposta[ind1].attrezzatura = [];
                }
    
    
                if(!risposta[ind1].personale[ind2])
                risposta[ind1].personale.push({quantita : parseInt(ele2,10)});
    
                
            }
            if (ind0 == 1)
                risposta[ind1].personale[ind2].qualita= ele2;
            if (ind0 == 2)
                risposta[ind1].personale[ind2].ore= parseInt(ele2,10);
    
            });
    
        });
    });
    
    //console.log(JSON.stringify(risposta));
    
    Object.keys(get2).forEach(ind0 => {
        get2[ind0].forEach((ele1,ind1) =>{
            //console.log(ele1);
            if(!Array.isArray(ele1)) return 0 ;
            ele1.forEach((ele2,ind2) =>{
            if (ind0 == 0){
                //if(!risposta[ind1]) risposta.push({});
                
                //console.log(risposta);
                if(!risposta[ind1].attrezzatura )
                    risposta[ind1].attrezzatura = [];
    
                //console.log(risposta[ind1].personale);
    
                if(!risposta[ind1].attrezzatura[ind2])
                risposta[ind1].attrezzatura.push({nomeAtt : ele2});
    
                //console.log(risposta[ind1].personale);
                //console.log(risposta);
            }
            if (ind0 == 1)
                risposta[ind1].attrezzatura[ind2].quantitaAtt= parseInt(ele2,10);
    
            });
    
        });
    });
    //console.log(JSON.stringify(risposta));
    
    Object.keys(get3).forEach(ind0 => {
        get3[ind0].forEach((ele1,ind1) =>{
           // console.log(ele1);
            
        if (ind0 == 0){
            risposta[ind1].timestamp= Math.round(parseInt(ele1,10)/1000000);
    
            //console.log(risposta[ind1].personale);
            //console.log(risposta);
        }
        if (ind0 == 1)
            risposta[ind1].descrizione= ele1;
        if(ind0 == 2)
            risposta[ind1].sovrascritto= parseInt(ele1,10);
        if(ind0 == 3)  risposta[ind1].num_rigo= parseInt(ele1,10);
        });
    
        
    });
    return risposta;
}


exports.decodeLibretto = function(get1,get2){ // solo per il libretto corrente, non considera la parte delle riserve
    let risposta=[]
    Object.keys(get1).forEach(ind0 => {
        //console.log(get1);
       // console.log(get1[ind0]);
        get1[ind0].forEach((ele1,ind1) =>{
            //console.log(ele1);
            //if(!Array.isArray(ele1)) return 0 ;
            if (ind0 == 0){
                if(!risposta[ind1]) risposta.push({});
                risposta[ind1] = {"timestamp" : Math.round(parseInt(ele1,10)/1000000)}
                        
            }
            if (ind0 == 1)
                risposta[ind1].descrizione= ele1;
            if (ind0 == 2)
                risposta[ind1].sovrascritto= parseInt(ele1,10);
                if (ind0 == 3)
                risposta[ind1].num_rigo= parseInt(ele1,10);
        });
    });

    //console.log(JSON.stringify(risposta));
    Object.keys(get2).forEach(ind0 => {
        //console.log(get1);
        //console.log(get2[ind0]);
        get2[ind0].forEach((ele1,ind1) =>{
           // console.log(ele1);
            //if(!Array.isArray(ele1)) return 0 ;
            if (ind0 == 0){
                //if(!risposta[ind1]) risposta.push({});
                risposta[ind1].codLavoro = ele1;
                        
            }
            if (ind0 == 1)
                risposta[ind1].percentuale= parseInt(ele1,10);
            if (ind0 == 2){
                //console.log(ele1);
                risposta[ind1].allegati= ele1;
            }
                
            
        });
    });

    //console.log(JSON.stringify(risposta));
    return risposta;

}

exports.decodeLibrettoRis = function(get1,get2,get3,get4){ // solo per i libretti terminati, considera la parte delle riserve
    let risposta=[];
    console.log(get1);
    console.log(get2);
    console.log(get3);
    console.log(get4);
    Object.keys(get1).forEach(ind0 => {
        get1[ind0].forEach((ele1,ind1) =>{
            if (ind0 == 0){
                if(!risposta[ind1]) risposta.push({});
                risposta[ind1] = {"timestamp" : Math.round(parseInt(ele1,10)/1000000)}             
            }
            if (ind0 == 1)
                risposta[ind1].descrizione= ele1;
            if (ind0 == 2)
                risposta[ind1].sovrascritto= parseInt(ele1,10);
                if (ind0 == 3)
                risposta[ind1].num_rigo= parseInt(ele1,10);
        });
    });

Object.keys(get2).forEach(ind0 => {
    get2[ind0].forEach((ele1,ind1) =>{
        console.log("ind0");
        console.log(ind0);
        console.log("ind1");
        console.log(ind1);
        if (ind0 == 0){
            risposta[ind1].codLavoro = ele1;                        
        }
        if (ind0 == 1)
            risposta[ind1].percentuale= parseFloat(ele1,10);
        if (ind0 == 2){
            //console.log(ele1);
            risposta[ind1].allegati= ele1;
        }                         
    });
});

Object.keys(get3).forEach(ind0 => {
    //console.log(get1);
    //console.log(get3[ind0]);
    get3[ind0].forEach((ele1,ind1) =>{
        //console.log(ele1);
        //if(!Array.isArray(ele1)) return 0 ;
        if (ind0 == 0){
            //if(!risposta[ind1]) risposta.push({});
            risposta[ind1].firmato = ele1;                      
        }
        if (ind0 == 1)
            risposta[ind1].firmato_riserva= ele1;
        if (ind0 == 2){
            //console.log(ele1);
            risposta[ind1].riserva_dir= ele1;
        }
    });
});
Object.keys(get4).forEach(ind0 => {
    //console.log(get1);
    //console.log(get4[ind0]);
    get4[ind0].forEach((ele1,ind1) =>{
        console.log(ele1);
        //if(!Array.isArray(ele1)) return 0 ;
        if (ind0 == 1)
            risposta[ind1].percentuale_riserva= parseInt(ele1,10);
        if (ind0 == 2){
            //console.log(ele1);
            risposta[ind1].descrizione_riserva= ele1;
        }
    });
            
});
return risposta;
}

exports.decodeRegistro = function(get1,get2,get3){
   let risposta=[]
  
   for(let index in get3[0]){ // devo ricostruire quelle strutture, senza i righi vuoti
    if(get3[0][index] == ''){
      for(let ind0 in get1){ // scorro tutti gli array presenti nella struttura e da quelli cancello l'elemento all'indice con value di codLavoro vuoto
          get1[ind0].splice(index,1);   
      }
      for(let ind1 in get2){
        get2[ind1].splice(index,1);
      }
      for(let ind2 in get3){
        get3[ind2].splice(index,1);
      }
    }
  }
  

    
Object.keys(get1).forEach(ind0 => {
    //console.log(get1);
   // console.log(get1[ind0]);
    get1[ind0].forEach((ele1,ind1) =>{
        //console.log(ele1);
        //if(!Array.isArray(ele1)) return 0 ;
        //console.log(ind0,ind1);
        if (ind0 == 0){
            if(get3[ind0][ind1] == '') return;// se il codice lavoro del rigo è null allora skippo quel rigo perchè è sovrascritto
            risposta.push({"codLavoro" : get3[ind0][ind1]});
            //risposta[ind1].codLavoro = get3[ind0][ind1]; 
            risposta[ind1].percentuale_raggiunta_lavoro= parseInt(ele1,10);

            //risposta.push({"percentuale_raggiunta_lavoro" : parseInt(ele1,10)});
        }
            
                     
        if (ind0 == 1){
            if(typeof risposta[ind1] == 'undefined') return;
            risposta[ind1].percentuale_lavoro_sul_totale= parseInt(ele1,10);
            risposta[ind1].nomeLavoro= get3[ind0][ind1];
        }
            
        if (ind0 == 2){
            if(typeof risposta[ind1] == 'undefined') return;
            risposta[ind1].percentuale_lavoro_sul_totale_raggiunta= parseInt(ele1,10);
            risposta.num_rigo=parseInt(get2[ind0][ind1],10);
        }
            
        if (ind0 == 3){
            if(typeof risposta[ind1] == 'undefined') return;
            risposta[ind1].costo_raggiunto= parseInt(ele1,10);
            risposta[ind1].costoLavoro= parseInt(get2[ind0][ind1],10);

        }
            
    });
});

    return [risposta,Math.round(parseInt(get2[0][0],10)/1000000)];    
}

exports.decodeFirmeRiserva = function(get1){
    risposta = [];
    Object.keys(get1).forEach(ind0 => {
        //console.log(get1);
        //console.log(get1[ind0]);
        get1[ind0].forEach((ele1,ind1) =>{
            //console.log(ele1);
            //if(!Array.isArray(ele1)) return 0 ;
            if (ind0 == 0){
                if(!risposta[ind1]) risposta.push({firmato : ele1});
                else // non ci dovrebbe andare mai, lo lascio per sicurezza
                risposta[ind1].firmato = ele1;                      
            }
            if (ind0 == 1)
                risposta[ind1].firmato_riserva= ele1;
            if (ind0 == 2){
                //console.log(ele1);
                risposta[ind1].riserva_dir= ele1;
            }
        });
    });
    return risposta;

}

exports.decodeSal = function(get1,get2){
    for(let index in get2[0]){ // devo ricostruire quelle strutture, senza i righi vuoti
        if(get2[0][index] == ''){
          for(let ind0 in get1){ // scorro tutti gli array presenti nella struttura e da quelli cancello l'elemento all'indice con value di codLavoro vuoto
              get1[ind0].splice(index,1);   
          }
          for(let ind1 in get2){
            get2[ind1].splice(index,1);
          }
        }
      }
    let risposta=[]
    Object.keys(get1).forEach(ind0 => {
        //console.log(get1);
       // console.log(get1[ind0]);
        get1[ind0].forEach((ele1,ind1) =>{
            //console.log(ele1);
            //if(!Array.isArray(ele1)) return 0 ;
            console.log(ind0,ind1);
            if (ind0 == 0){
                if(get2[ind0][ind1] == '') return;// se il codice lavoro del rigo è null allora skippo quel rigo perchè è sovrascritto
                risposta.push({"codLavoro" : get2[ind0][ind1]});
                //risposta[ind1].codLavoro = get3[ind0][ind1]; 
                risposta[ind1].percentuale_raggiunta_lavoro= parseInt(ele1,10);
    
                //risposta.push({"percentuale_raggiunta_lavoro" : parseInt(ele1,10)});
            }
                
                         
            if (ind0 == 1){
                if(typeof risposta[ind1] == 'undefined') return;
                risposta[ind1].percentuale_lavoro_sul_totale= parseInt(ele1,10);
                //timestamp= get2[ind0][ind1];
            }
                
            if (ind0 == 2){
                if(typeof risposta[ind1] == 'undefined') return;
                risposta[ind1].percentuale_lavoro_sul_totale_raggiunta= parseInt(ele1,10);
                risposta[ind1].nomeLavoro=get2[ind0][ind1];
            }
                
            if (ind0 == 3){
                if(typeof risposta[ind1] == 'undefined') return;
                risposta[ind1].costo_raggiunto= parseInt(ele1,10);
                risposta[ind1].costoLavoro= parseInt(get2[ind0][ind1],10);
    
            }
                
        });
    });
    return [risposta,Math.round(parseInt(get2[1][0],10)/1000000)];

}

exports.decodeGraficoSal = function(get1){
    let risposta=[];
    //{"timestamp" : , "numeri_sal" : , "val_monetario":};
    Object.keys(get1).forEach(ind0 => {
        //console.log(get1);
        console.log(get1[ind0]);
        get1[ind0].forEach((ele1,ind1) =>{
            console.log(ele1);
            //if(!Array.isArray(ele1)) return 0 ;
            if (ind0 == 0){
                risposta.push({timestamp:Math.round(parseInt(ele1,10)/1000000)});
            }
                
                         
            if (ind0 == 1)
                risposta[ind1].numeri_sal = parseInt(ele1,10);
            if (ind0 == 2)
                risposta[ind1].val_monetario = parseInt(ele1,10);

        });
    });
    
    
    return risposta;

}