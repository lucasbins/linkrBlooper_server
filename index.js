const express = require('express');
const app = express();
const mysql = require('mysql');
const cors = require('cors');

app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
    user: 'u343108560_sistemabins',
    host: 'sql500.main-hosting.eu',
    password: 'Binsgato@123',
    database: 'u343108560_sistemabins'
});

/* 
Banco: u343108560_sistemabins
user: u343108560_sistemabins
pass: Binsgato@123
link: 127.0.0.1:3306 

    user: 'admin',
    host: 'localhost',
    password: '5LNXG6rKN4Nsa5n',
    database: 'LINKR'
*/

//-------------------------- STORES ------------------------------
//-------------- BUSCA PAGINADA ----------------------------------
app.get('/getPageStores', (req, res) => {
    let sql = 'SELECT * FROM stores';
    let where = ''
    let and = ' AND '

    let { page, size, params } = req.query;
    if(params){
        where = ' WHERE '
        let param = JSON.parse(params)
        if(param.pontoTroca){
            where = where + `PONTOTROCA = ${param.pontoTroca}`
            if(param.cidade || param.estado)
                where = where + and
        }
        if( param.cidade){
            where = where + `CIDADE = '${param.cidade}'`
            if(param.estado)
                where = where + and
        }
        if( param.estado){
            where = where + `ESTADO = '${param.estado}'`
        }
    }

    if (!page) {
        page = 1;
    }
    if (!size) {
        size = 10;
    }

    const inicio = (page - 1) * size;
    if(where.length > 7)
        sql = sql + where

    let rows = 0
    db.query(sql, (err,result) => {
        rows = result.length
    })
    
    const limita = sql + ` LIMIT ${inicio},${size}`
    
    db.query(limita, (err, result) => {
        if (err) {
            console.log(err)
        } else {
            res.send({
                page,
                size,
                rows,
                Info: result,
            });
        }
    })
})
//----------- BUSCA ESTADOS -------------------------
app.get('/getStates', (req, res) => {
    const sql = 'SELECT DISTINCT ESTADO FROM STORES ORDER BY ESTADO;'

    db.query(sql, (err, result) => {
        if (err) {
            console.log(err)
        } else {
            res.send(result)
        }
    })
})
//---------- BUSCA CIDADES --------------------------
app.get('/getCities', (req, res) => {
    const uf = req.query.uf
    const sql = `SELECT DISTINCT CIDADE, ESTADO FROM STORES WHERE ESTADO = '${uf}' ORDER BY CIDADE;`

    db.query(sql, (err, result) => {
        if (err) {
            console.log(err)
        } else {
            res.send(result)
        }
    })
})

//------ BUSCA LOJAS -------------------
app.get('/getStores', (req, res) => {
    const sqlBusca = 'SELECT * FROM stores';

    db.query(sqlBusca, (err, result) => {
        if (err) {
            console.log(err)
        } else {
            res.send(result)
        }
    })
})
//------- INSERE NOVA LOJA ------------
app.post('/store', (req, res) => {
    const params = montaParametros(req.body.params);
    
    const sql = 'INSERT INTO STORES (NOMESOCIAL, NOMEFANTASIA, LOGRADOURO, NUMERO, COMPLEMENTO, BAIRRO, CIDADE, ESTADO, CEP, TELEFONE, WHATSAPP, INSTAGRAM, FACEBOOK, PONTOTROCA) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)'

    db.query(sql, [  
        params.NOMESOCIAL,
        params.NOMEFANTASIA,
        params.LOGRADOURO,
        params.NUMERO,
        params.COMPLEMENTO,
        params.BAIRRO,
        params.CIDADE,
        params.ESTADO,
        params.CEP,
        params.TELEFONE,
        params.WHATSAPP,
        params.INSTAGRAM,
        params.FACEBOOK,
        params.PONTOTROCA] ,
    (err, result) => {
        if (err) {
            console.log(err);
        } else {
            console.log('Loja Adicionada')
            res.send('Loja Adicionada!');
        }
    });
})
//------- ALTERA LOJA -------------------
app.post('/updateStore', (req, res) => {

    const params = montaParametros(req.body.params);
    const sql = 'UPDATE STORES SET NOMESOCIAL = ?, NOMEFANTASIA = ? , LOGRADOURO = ?, NUMERO = ? , COMPLEMENTO = ?, BAIRRO = ?, CIDADE = ?, ESTADO = ?, CEP = ?,TELEFONE = ?, WHATSAPP = ?, INSTAGRAM = ?, FACEBOOK = ?, PONTOTROCA = ? WHERE ID = ?'

    db.query(sql, [  
        params.NOMESOCIAL,
        params.NOMEFANTASIA,
        params.LOGRADOURO,
        params.NUMERO,
        params.COMPLEMENTO,
        params.BAIRRO,
        params.CIDADE,
        params.ESTADO,
        params.CEP,
        params.TELEFONE,
        params.WHATSAPP,
        params.INSTAGRAM,
        params.FACEBOOK,
        params.PONTOTROCA,
        params.ID
    ] ,
    (err, result) => {
        if (err) {
            console.log(err);
        } else {
            console.log('Loja Alterada')
            res.send('Loja Alterada!');
        }
    });
});
//------ DELETA LOJA -----------------
app.post('/deleteStore', (req, res) => {
    const idStore = req.body.idStore
    const sql = 'DELETE FROM STORES WHERE ID = ?';

    db.query(sql, [idStore], (err) => {
        if (err) {
            console.log(err);
        } else {
            console.log('Loja Apagada')
            res.send('Loja Apagada');
        };
    });
});

//------------------------- LOGIN -------------------------

app.post('/signin', (req, res) => {
    const login = req.body.email;
    const pass = req.body.password;

    const sql = 'SELECT id, nome, email, role FROM users WHERE email = ? AND passwrd = ?';

    db.query(sql, [login, pass],
        (err, result) => {
            if (err) {
                res.send({ err: err });
            }
            if (result.length > 0) {
                const user = JSON.stringify(result)
                let token = Buffer.from(user).toString('base64')
                res.send(token);
            } else {
                res.send({ message: "Senha ou usuario invalido" });
            }
        })
})

app.listen(3001, () => {
    console.log('run server in port 3001')
});


const montaParametros = (parametros) => {
    if(parametros.NOMESOCIAL === null || parametros.NOMESOCIAL === undefined)
        parametros.NOMESOCIAL = null
    if(parametros.NOMEFANTASIA === null || parametros.NOMEFANTASIA === undefined)
        parametros.NOMEFANTASIA = null
    if(parametros.LOGRADOURO === null || parametros.LOGRADOURO === undefined)
        parametros.LOGRADOURO = null
    if(parametros.NUMERO === null || parametros.NUMERO === undefined)
        parametros.NUMERO = null
    if(parametros.COMPLEMENTO === null || parametros.COMPLEMENTO === undefined)
        parametros.COMPLEMENTO = null
    if(parametros.BAIRRO === null || parametros.BAIRRO === undefined)
        parametros.BAIRRO = null
    if(parametros.CIDADE === null || parametros.CIDADE === undefined)
        parametros.CIDADE = null
    if(parametros.ESTADO === null || parametros.ESTADO === undefined)
        parametros.ESTADO = null
    if(parametros.CEP === null || parametros.CEP === undefined)
        parametros.CEP = null
    if(parametros.TELEFONE === null || parametros.TELEFONE === undefined)
        parametros.TELEFONE = null
    if(parametros.WHATSAPP === null || parametros.WHATSAPP === undefined)
        parametros.WHATSAPP = null
    if(parametros.INSTAGRAM === null || parametros.INSTAGRAM === undefined)
        parametros.INSTAGRAM = null
    if(parametros.FACEBOOK === null || parametros.FACEBOOK === undefined)
        parametros.FACEBOOK = null
    if(parametros.PONTOTROCA === null || parametros.PONTOTROCA === undefined)
        parametros.PONTOTROCA = false

    return parametros
}
