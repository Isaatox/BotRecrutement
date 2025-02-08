const { Client } = require('pg');

const connection = new Client({
    user: 'hlsuser',
    host: '54.37.65.65',
    database: 'sitehls',
    password: 'hryNrBAyUN8vuW',
    port: 5432,
});

connection.connect(err => {
    try {
        console.log(`Connexion PostgreSQL réussi`);

    } catch (error) {
        console.log(`MYSQL : ` + error);
    }
});

setInterval(function () {
    connection.query(`SELECT 1`)
}, 10 * 60000);

module.exports = connection;