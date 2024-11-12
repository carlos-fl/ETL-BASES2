import { connect } from "../database/connection.js";

export class DataFlow {
    static redirectToBoard(req,res){
        res.render('dataFlow');
    }

    static async connection(req,res){
        try {
            const { user, password, server, dataBase, sqlCommand  } = req.body;
            const pool = await connect(user,password,server,dataBase);
            // const queryResult = await pool.request().query('SELECT GETDATE()');
            const queryResult = await pool.request().query(sqlCommand);
            res.status(200).json({message: 'conexion exitosa', testQueryResult: queryResult.recordset.columns});
        } catch (error) {
            console.log("Error de conexión: ", error);
            res.status(400).json({message: 'Sucedió un error durante la conexión'})
        }
    }


}