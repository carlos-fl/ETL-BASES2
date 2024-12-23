import { connect } from "../database/connection.js";

export class Run {
  /**
   *
   * @param {Array} list
   */
  static sortBlocks(list) {
    return list.sort((a, b) => a.order - b.order);
  }

  static async runProject(req, res) {
    try {
      const controlBlocks = req.body.blocks;
      const orderedControlBlocks = Run.sortBlocks(controlBlocks);

      orderedControlBlocks.forEach((block) => {
        const etls = block.etls;
        etls.forEach(async (etl) => {
          // connection to database
          let pool = await connect(
            etl.connectionParams.user,
            etl.connectionParams.password,
            etl.connectionParams.server,
            etl.connectionParams.dataBase
          );
          let connectionPool = pool;

          const destination = etl.destination; // destination query: select genero as genero from candidatos
          const finalQuery = `SELECT DISTINCT TOP (5) ${destination.query.slice(6)};`;          
          const result = await connectionPool
            .request()
            .query(finalQuery);
          const dataToInsert = result.recordset;
          // insert data into table
          pool.close();
          pool = await connect(
            etl.destination.connection.userName,
            etl.destination.connection.password,
            etl.destination.connection.serverName,
            etl.destination.connection.dbName
          );
          connectionPool = pool;

          dataToInsert.forEach(async (record) => {
            // record example: {nombre: 'carlos', apellido: 'flores', edad: 20}
            const columns = Object.keys(record); // [nombre, apellido, edad]
            const fields = columns.join(); // nombre,apellido,edad
            const valuesToInsert = []; // after for each: [carlos, flores, 20]
            columns.forEach((column) => {
              const value = record[column];
              if (typeof value === "string"){
                //cleaning
                const stringValue = String(value).trim();
                const cleanValue = stringValue.replace(/'/g, '');
                valuesToInsert.push(`'${cleanValue}'`);
              }else{
                value === null ? valuesToInsert.push(0):valuesToInsert.push(value);
              }
              // valuesToInsert.push(value);
            });
            const finalValues = valuesToInsert.join(); // carlos,flores,20
            var query = "";
            if (etl.destination.destinoTable==="Hechos_Respuestas"){
              query = `INSERT INTO ${etl.destination.destinoTable} (ID_Estado,ID_Candidato,ID_Encuesta,ID_Patrocinador,Respuestas)  values (${finalValues});`
            }else{
              query = `insert into ${etl.destination.destinoTable} (${fields}) values (${finalValues});`;
            }
            // insert data
            console.log(query);
            await connectionPool.request().query(query);
            pool.close();
          });
        });
      });
      res.status(200).json({ msg: "succes", status: 200 });
    } catch (err) {
      console.log(err);
    }
  }
}
