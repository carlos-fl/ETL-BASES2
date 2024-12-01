import sql from "mssql";

export async function connect (user,password,server,dataBase){
    const sqlConfig = {
        user: user,
        password: password,
        database: dataBase,
        server: server,
        //60000
        pool: {
            max: 10,
            min: 0,
            idleTimeoutMillis: 100000
            //30000
        },
        options: {
            requestTimeout: 1000000,
            encrypt: false,
            trustServerCertificate: true 
        }
    }
    
    try {
        const pool = await sql.connect(sqlConfig);
        // const result = await pool.request().query("SELECT GETDATE()");
        // console.log(result);
        return pool;
    } catch (err) {
        console.log(err);
    }
}

