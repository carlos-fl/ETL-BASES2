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
    static cleanAndWrapInQuotes(columns) {
        return columns.map((col) => `'${col.replace(/'/g, "")}'`);
    }

    static cleanColumnName = (col) => {
        // Quitar el alias si existe (parte después de 'AS')
        const aliasSplit = col.split(' AS ');
        let withoutAlias = aliasSplit[0];
    
        // Verificar si es una función agregada (como COUNT, SUM, AVG, etc.)
        if (withoutAlias.includes('COUNT') || withoutAlias.includes('SUM') || withoutAlias.includes('AVG')) {
            // Eliminar el prefijo de la tabla dentro de la función agregada
            const openParenIndex = withoutAlias.indexOf('(');
            const closeParenIndex = withoutAlias.indexOf(')');
            
            if (openParenIndex !== -1 && closeParenIndex !== -1) {
                let innerExpression = withoutAlias.slice(openParenIndex + 1, closeParenIndex);
                // Quitar el prefijo de tabla si existe en el interior de la función
                innerExpression = innerExpression.replace(/^.*\./, '');  // Eliminar cualquier prefijo de tabla
                return `${innerExpression}`;
            }
        }
        
        // Si no es una función agregada, quitar el prefijo de la tabla
        let dotIndex = withoutAlias.indexOf('.');
        return dotIndex !== -1 ? withoutAlias.slice(dotIndex + 1) : withoutAlias;
    };
    


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
                    let cleanColumns =  columnTableMappings[table].map((col) => `${this.cleanColumnName(col)}'`);
                    let quotationCols = this.cleanAndWrapInQuotes(cleanColumns);
                    let result = await connectionPool.request().query(`SELECT COLUMN_NAME AS columnName,
                        DATA_TYPE AS dataType, CHARACTER_MAXIMUM_LENGTH AS length, NUMERIC_PRECISION AS precision 
                        FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='${table}' AND COLUMN_NAME IN (${quotationCols.join(",")});`);
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
        const replacedText = sqlCommand.replace(/\n/g, ' ');
        const fieldsRegex = /SELECT.*FROM/gi;
        const fieldsMatch = replacedText.match(fieldsRegex);
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

    static async connection(req, res) {
        try {
          const { user, password, server, dataBase, sqlCommand, table, method } = req.body;
      
          // Validación de los datos requeridos
          if (!user || !password || !server || !dataBase || !method) {
            return res.status(400).json({ message: "Faltan datos en el body" });
          }
      
          if (method === "table" && !table) {
            return res.status(400).json({ message: "Falta el nombre de la tabla para el método 'table'" });
          }
      
          if (method === "sqlCommand" && !sqlCommand) {
            return res.status(400).json({ message: "Falta el comando SQL para el método 'sqlCommand'" });
          }
      
          if (method === "table") {
            const pool = await connect(user, password, server, dataBase);
            connectionPool = pool;
            const queryResult = await DataFlow.getTableMetadata(table);
            console.log("Resultado de las tablas obtenidas:", queryResult);
            pool.close();
            return res.status(200).json({
              message: `Información de la tabla ${table}`,
              testQueryResult: queryResult,
            });
          } else if (method === "sqlCommand") {
            // Conexión a la base de datos
            const pool = await connect(user, password, server, dataBase);
            connectionPool = pool;
      
            // Parsear el comando SQL para obtener información de tablas y columnas
            const queryTables = DataFlow.parseSQLQuery(sqlCommand);
      
            let  columnTableMappings = { };
            columnTableMappings[queryTables.tableName] = queryTables.fields
            .filter ((columnName) =>  columnName.includes(`${queryTables.tableName}.`))
            .map ((fieldName) =>  `'${fieldName.slice(fieldName.indexOf(".")+1)}'` )
      
            queryTables.joinedTables.forEach((table) => {
              columnTableMappings[table] = queryTables.fields
                .filter((columnName) => columnName.includes(`${table}.`))
                .map((fieldName) => {
                    const isAggregateFunction = /COUNT|SUM|AVG|/i.test(fieldName);
                    if (isAggregateFunction) {
                        return `'${fieldName}'`; // Mantener la función completa
                    }
                    // Procesar normalmente si no es función
                    const columnName = fieldName.slice(fieldName.indexOf(".") + 1);
                    return `'${columnName}'`;
                        });
                    });
      
            // Obtener metadatos de todas las tablas relacionadas
            const queryResult = {
              source: await DataFlow.getMultipleTablesMetadata(columnTableMappings),
            };
            
            pool.close();
            return res.status(200).json({
              message: "Conexión exitosa",
              testQueryResult: queryResult,
            });
          }
        } catch (error) {
          console.log("Error de conexión: ", error);
          return res.status(400).json({ message: "Sucedió un error durante la conexión" });
        }
      }
      
      


    static async  getTableNames(req,res){
        try {
            const { user, password, server, dataBase } = req.body;
            const pool = await connect(user,password,server,dataBase);
            connectionPool = pool;
            var queryResult = await pool.request().query(`SELECT table_name 
                FROM INFORMATION_SCHEMA.TABLES WHERE table_type = 'BASE TABLE' AND 
                table_name != 'sysdiagrams' AND DB_NAME() = '${dataBase}' ; `);
            res.status(200).json({message: 'Se obtuvieron las tablas de la base de datos', 
                testQueryResult: queryResult})
        } catch (error) {
            console.log(error);
        }
    }

    static async getDestinationMetadata (req, res){
        try {
            const { user, password, server, dataBase, tableName } = req.body;
            const pool = await connect(user,password,server,dataBase);
            connectionPool = pool;
            let formatedData = await DataFlow.getTableMetadata(tableName);
            pool.close();
            res.status(200).json({message: 'Se obtuvieron las columnas de la tabla de destino', 
                testQueryResult: formatedData});
        } catch (error) {
            console.log(error);
            console.log(`Error al obtener las columnas de la tabla ${tableName}`)
        }
    }


}