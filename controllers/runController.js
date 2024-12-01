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
          // get data in origin database
          //SELECT o.* FROM origin o WHERE o.id NOT IN (SELECT d.id FROM destination d);
          const idOrigin = Object.keys(etl.source).find((key) =>
            key.includes("ID")
          );
          // get id in destination table
          const queryToGetPrimaryKeyInDestinationTable = `SELECT COLUMN_NAME
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE OBJECTPROPERTY(OBJECT_ID(CONSTRAINT_SCHEMA + '.' + CONSTRAINT_NAME), 'IsPrimaryKey') = 1
  AND TABLE_NAME = '${etl.destination.destinoTable}'`;
          const destinationPrimaryKeyObj = await connectionPool.request().query(queryToGetPrimaryKeyInDestinationTable)[0];
          const destinationPrimaryKey = Object.keys(destinationPrimaryKeyObj)[0]
          const queryToGetRecordsWithNoDuplicates = `WHERE ${idOrigin} NOT IN (SELECT ${destinationPrimaryKey} from ${etl.destination.destinoTable})`;
          const result = await connectionPool
            .request()
            .query(destination.query);
          const dataToInsert = result.recordset;
          // insert data into table
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
              valuesToInsert.push(value);
            });
            const finalValues = valuesToInsert.join(); // carlos,flores,20

            const query = `insert into ${etl.destination.destinoTable} (${fields}) values (${finalValues})`;
            // insert data
            await connectionPool.request().query(query);
          });
        });
      });
      res.status(200).json({ msg: "succes", status: 200 });
    } catch (err) {
      console.log(err);
    }
  }
}
