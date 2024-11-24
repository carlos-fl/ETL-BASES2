import { connect } from "../database/connection.js";
import sql from "mssql";
let connectionPool;
export class DataFlow {

    static redirectToBoard(req,res){
        res.render('dataFlow');
    }

    static format_metadata(recordset){
        let formattedData = {source: {} };
        recordset.forEach(register => {
            formattedData.source[register.columnName] = {
                dataType: register.dataType,
                length: register.length,
                precision: register.precision
            }
        });
        return formattedData;
    }


    static async getTableMetadata(tableName){
        try {
            console.log('------------------------------------ ', connectionPool)
            let result = await connectionPool.request().query(`EXEC SP_get_table_metadata '${tableName}';`);
            let formatedData = this.format_metadata(result.recordset);
            return formatedData;
        } catch (error) {
            console.log(error);
        }
    }

    static parseSQLQuery(sqlCommand){
        const result = {
            tableName: null,
            fields: [],
            joinedTables: []
        };
        const fieldsRegex = /SELECT\s+(.*?)\s+FROM/i;
        const fieldsMatch = sqlCommand.match(fieldsRegex);
        if (fieldsMatch && fieldsMatch[1]){
            result.fields = fieldsMatch[1].split(",").map((field) => field.trim());
        }

        const fromRegex = /FROM\s+([^\s;]+)/i;
        const fromMatch = query.match(fromRegex);
        if (fromMatch && fromMatch[1]) {
            result.tableName = fromMatch[1].trim();
        }

        const joinRegex = /JOIN\s+([^\s]+)\s+/gi;
        let joinMatch;
        while ((joinMatch = joinRegex.exec(query)) !== null) {
            result.joinedTables.push(joinMatch[1].trim());
        }

        return result;

    }

    static async connection(req,res){
        try {
            const { user, password, server, dataBase, sqlCommand, table, method  } = req.body;
            var queryResult;
            if (method==='table'){
                queryResult = await DataFlow.getTableMetadata(table);
                res.status(200).json({message: `Informacion de la tabla ${table}`, testQueryResult: queryResult});
            }else{
                // invocar funcion para extraer campos y tablas del sqlCommand
                let queryTables = DataFlow.parseSQLQuery(sqlCommand);
                // extraer la metadata de cada tabla
                queryResult = await DataFlow.getTableMetadata(queryTables);
                res.status(200).json({message: 'conexion exitosa', testQueryResult: queryResult});
            }
        } catch (error) {
            console.log("Error de conexión: ", error);
            res.status(400).json({message: 'Sucedió un error durante la conexión'})
        }
    }


    static async  getTableNames(req,res){
        try {
            const { user, password, server, dataBase } = req.body;
            const pool = await connect(user,password,server,dataBase);
            connectionPool = pool;
            var queryResult = await pool.request().query(`SELECT table_name 
                FROM INFORMATION_SCHEMA.TABLES WHERE table_type = 'BASE TABLE' AND 
                table_name != 'sysdiagrams'; `);
            res.status(200).json({message: 'Se obtuvieron las tablas de la base de datos', 
                testQueryResult: queryResult})
        } catch (error) {
            console.log(error);
        }
    }


}