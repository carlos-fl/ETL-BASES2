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
            let result = await connectionPool.request().query(`SELECT COLUMN_NAME AS columnName,
                DATA_TYPE AS dataType, CHARACTER_MAXIMUM_LENGTH AS length, NUMERIC_PRECISION AS precision 
                FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='${tableName}';`);
            let formatedData = this.format_metadata(result.recordset);
            return formatedData;
        } catch (error) {
            console.log(error);
        }
    }

    static async getMultipleTablesMetadata (columnTableMappings){
        try {
            let source = { };
            for (let table in columnTableMappings){
                if (columnTableMappings[table].length > 0){
                    let result = await connectionPool.request().query(`SELECT COLUMN_NAME AS columnName,
                        DATA_TYPE AS dataType, CHARACTER_MAXIMUM_LENGTH AS length, NUMERIC_PRECISION AS precision 
                        FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='${table}' AND COLUMN_NAME IN (${columnTableMappings[table].join(",")});`);
                    let formatedData = this.format_metadata(result.recordset);
                    source = { ...source, ...JSON.parse(JSON.stringify(formatedData.source)) };
                }
            }
            return source;
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
        // const fieldsRegex = /SELECT\s+(.*?)\s+FROM/i;
        const fieldsRegex = /SELECT.*FROM/gi;
        const fieldsMatch = sqlCommand.match(fieldsRegex);
        if (fieldsMatch && fieldsMatch[0]){
            // remove SELECT and FROM
            const fieldArray = fieldsMatch[0].slice(7,-5);
            result.fields = fieldArray.split(",").map((field) => field.trim());
        }

        const fromRegex = /FROM\s+([^\s;]+)/gi;
        const fromMatch = sqlCommand.match(fromRegex);
        if (fromMatch && fromMatch[0]) {
            const mainTable = fromMatch[0].slice(4);
            result.tableName = mainTable.trim();
        }

        const joinRegex = /JOIN\s+([^\s]+)\s+/gi;
        let joinMatch;
        while ((joinMatch = joinRegex.exec(sqlCommand)) !== null) {
            result.joinedTables.push(joinMatch[1].trim());
        }

        return result;

    }

    static async connection(req,res){
        try {
            const { user, password, server, dataBase, sqlCommand, table, method  } = req.body;
            if (method==='table'){
                let queryResult = await DataFlow.getTableMetadata(table);
                res.status(200).json({message: `Informacion de la tabla ${table}`, testQueryResult: queryResult});
            }else{
                const pool = await connect(user,password,server,dataBase);
                connectionPool = pool;
                // invocar funcion para extraer campos y tablas del sqlCommand
                let queryTables = DataFlow.parseSQLQuery(sqlCommand);
                // extraer la metadata de cada tabla
                let columnTableMappings = { };
                
                columnTableMappings[queryTables.tableName] = queryTables.fields
                .filter ((columnName) =>  columnName.includes(`${queryTables.tableName}.`) )
                .map ((fieldName) =>  `'${fieldName.slice(fieldName.indexOf(".")+1)}'` )

                queryTables.joinedTables.forEach((table) => {
                    columnTableMappings[table] = queryTables.fields
                    .filter ((columnName) =>  columnName.includes(`${table}.`) )
                    .map ((fieldName) =>  `'${fieldName.slice(fieldName.indexOf(".")+1)}'` )
                })
                
                let queryResult = { };
                queryResult["source"] = await DataFlow.getMultipleTablesMetadata(columnTableMappings);
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