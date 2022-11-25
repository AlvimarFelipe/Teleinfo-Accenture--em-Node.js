import { Request, Response } from 'express';
import sequelize, { Op, QueryTypes } from 'sequelize';
import { sequelizes } from '../instances/mysql';
import { Atendimento } from '../models/atendimento';
  



export const data1 = async (req: Request, res: Response)=>{

        let ano1 = req.query.ano;
        let mes1 = req.query.mes;

        let ano2 = req.query.ano2;
        let mes2 = req.query.mes2;   
     
        // SUBSTRING(data, 9,2) AS data

        let consulta1g1 = await sequelizes.query('select SUBSTRING(data, 9,2) AS data ,count(idAtendimento) AS total ,idAtendimento  FROM atendimento where data like ' +`"${ ano1+'-'+mes1}%"`+ 'group by data;', {
            type: QueryTypes.SELECT
          });
        
          let consulta2g1 = await sequelizes.query('select SUBSTRING(data, 9,2) AS data ,count(idAtendimento) AS total ,idAtendimento  FROM atendimento where data like ' +`"${ano2+'-'+mes2}%"`+ 'group by data;', {
            type: QueryTypes.SELECT
          });
 

    res.json({ 
        consulta1g1,
        consulta2g1,
        data_graf1: [ano1,mes1,ano2,mes2],
    });


};

export const data2 = async (req: Request, res: Response)=>{

    let ano = req.query.ano;
    let mes = req.query.mes;

    const records1 = await sequelizes.query('SELECT  count(a.idAtendimento) AS id , a.data FROM atendimento a INNER JOIN trabalho t ON  t.id = a.trabalho_ID where t.Tempo_medio <= 2400  && a.data LIKE '+`"${ano+'-'+mes}%"`+' group by a.data order by a.data;', {
        type: QueryTypes.SELECT
      });
  
    const records2 = await sequelizes.query('SELECT  count(a.idAtendimento) AS id FROM atendimento a INNER JOIN trabalho t ON  t.id = a.trabalho_ID where (Tempo_medio > 2400  && Tempo_medio <= 12000)  &&  a.data LIKE '+`"${ano+'-'+mes}%"`+' group by a.data order by a.data;', {
        type: QueryTypes.SELECT
      });
  
    const records3 = await sequelizes.query('SELECT  count(a.idAtendimento) AS id FROM atendimento a INNER JOIN trabalho t ON  t.id = a.trabalho_ID where Tempo_medio > 12000 && a.data LIKE '+`"${ano+'-'+mes}%"`+' group by a.data order by a.data;', {
        type: QueryTypes.SELECT
      });

    res.json({
        records1,
        records2,
        records3
    });

};


export const data3 = async (req: Request, res: Response)=>{

  let ano = req.query.ano;
  let mes = req.query.mes;
  var data= ano+'-'+mes;

  var madrugadas=[]
  var manhas=[]
  var tardes=[]
  var noites=[]
  
  var dificuldade=["t.Tempo_medio <= 2400","(Tempo_medio > 2400  && Tempo_medio <= 12000) ","Tempo_medio > 12000"];

  
  for(let i =0;i<dificuldade.length;i++){

    //madrugada
    const madrugada = await sequelizes.query('select  count(a.idAtendimento), a.data ,a.Hora_inicio from atendimento a inner join trabalho t on  t.id = a.trabalho_ID  where  ('+`"${dificuldade[i]}"`+' && a.data like '+`"${data}%"`+')  &&  (a.Hora_inicio >= "00:00:01" && a.Hora_inicio < "06:00:00") group by a.data order by a.Hora_inicio;', {
      type: QueryTypes.SELECT
    });
    madrugadas.push(madrugada)

    //manha
    const manha = await sequelizes.query('select  count(a.idAtendimento), a.data ,a.Hora_inicio from atendimento a inner join trabalho t on  t.id = a.trabalho_ID where ('+`"${dificuldade[i]}"`+' && a.data like '+`"${data}%"`+') && (a.Hora_inicio >= "06:00:00" && a.Hora_inicio < "12:00:00") group by a.data order by a.Hora_inicio;', {
        type: QueryTypes.SELECT
      });
    manhas.push(manha)


    // tarde
    const tarde = await sequelizes.query('select  count(a.idAtendimento), a.data ,a.Hora_inicio from atendimento a inner join trabalho t on  t.id = a.trabalho_ID where ('+`"${dificuldade[i]}"`+' && a.data like '+`"${data}%"`+') && (a.Hora_inicio >= "12:00:00" && a.Hora_inicio < "18:00:00") group by a.Hora_inicio order by a.Hora_inicio;        ', {
      type: QueryTypes.SELECT
    });
    tardes.push(tarde)


    //noite

    const noite = await sequelizes.query('select  count(a.idAtendimento), a.data ,a.Hora_inicio from atendimento a inner join trabalho t on  t.id = a.trabalho_ID where ('+`"${dificuldade[i]}"`+' && a.data like '+`"${data}%"`+') && (a.Hora_inicio >= "18:00:00" && a.Hora_inicio < "23:59:59")  group by a.Hora_inicio order by a.Hora_inicio;', {
      type: QueryTypes.SELECT
    });
    noites.push(noite)
    
  }

  res.json({
    madrugadas,
    manhas,
    tardes,
    noites

  });


};
