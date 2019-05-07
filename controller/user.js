const { exec,escape } = require('../db/mysql')
const xss = require('xss')

const { genPassword } = require('../utils/cryp')
const login = async (username,password) => {
    //生成加密密码
    // password = genPassword(password)
    // console.log('pass is',password)

    //对特殊字符添加转义字符 防止登录的sql注入
    password = escape(password)
    const sql = `select * from users where username='${username}' and password=${password}`
    const rows = await exec(sql)
    return rows[0] || {}
}

const register = async (regData) => {
    const userName = xss(regData.userName)
    const realName = xss(regData.realName)
    const password = xss(regData.password)
    const type = regData.type

    const sql = `insert into users (username,realname,password,type) 
    values ('${userName}','${realName}','${password}','${type}')`

    const insertData = await exec(sql)
    return insertData.insertId
}

module.exports = {
    login,
    register
}