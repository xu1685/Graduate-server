//获取环境参数
const env = process.env.NODE_ENV

let MYSQL_CONF
let REDIS_CONF

if(env === 'dev'){
    MYSQL_CONF = {
        host: 'localhost',
        user:'root',
        password: 'xxzj19970610nv',
        port: '3306',
        database: 'volume'
    }

    REDIS_CONF = {
        port: 6379,
        host: '127.0.0.1'
    }
}

if(env === 'production'){
    MYSQL_CONF = {
        host: 'localhost',
        user:'root',
        password: 'xxzj19970610nv',
        port: '3306',
        database: 'volume'
    }

    REDIS_CONF = {
        port: 6379,
        host: '127.0.0.1'
    }
}

module.exports = {
    MYSQL_CONF,
    REDIS_CONF
}