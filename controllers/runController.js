import { connect } from "../database/connection.js"

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

      const controlBlocks = req.body.blocks
      const orderedControlBlocks = Run.sortBlocks(controlBlocks)
  
      
     
      orderedControlBlocks.forEach(async (block) => {
        const etls = block.etls
        let connectionPool
        let queryToInsertData = ''
        etls.forEach(async (etl) => {
          // connection to database
          let pool = await connect(etl.connectionParams.user ,etl.connectionParams.password ,etl.connectionParams.server, etl.connectionParams.dataBase);
          connectionPool = pool;


          const destination = etl.destination
          const query = `SELECT TOP (500) ${destination.query.slice(6)}`;
          const result = await connectionPool.request().query(query);
          const dataToInsert = result.recordset
          console.log(dataToInsert);
          pool.close();
          // insert data into table
          pool = await connect(etl.destination.connection.userName, etl.destination.connection.password, etl.destination.connection.serverName, etl.destination.connection.dbName)
          connectionPool = pool
//query:"SELECT ID_ENCUESTA AS ID_Ciclo, CICLO AS anio FROM ENCUESTAS"
          dataToInsert.forEach(async (record) => {
            // record example: {nombre: 'carlos', apellido: 'flores', edad: 20}
            const columns = Object.keys(record) // [nombre, apellido, edad]
            const fields = columns.join() // nombre,apellido,edad
            const valuesToInsert = [] // after for each: [carlos, flores, 20]
            columns.forEach(column => {
              const value = record[column]
              if (typeof value === "string"){
                //cleaning
                const stringValue = String(value).trim();
                const cleanValue = stringValue.replace(/'/g, '');
                valuesToInsert.push(`'${cleanValue}'`);
              }else{
                value === null ? valuesToInsert.push(0):valuesToInsert.push(value);
              }
            })
            const finalValues = valuesToInsert.join() // carlos,flores,20

            const query = `insert into ${etl.destination.destinoTable} (${fields}) values (${finalValues});`
            console.log(query);
            queryToInsertData = query + queryToInsertData + ','
          })
          
        })
        // insert data
        console.log('MY query', queryToInsertData)
      })
      res.status(200).json({ msg: 'succes', status: 200 })
    } catch(err) {
      console.log('error', err)
    }
  } 
}

