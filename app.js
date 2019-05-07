const Koa = require('koa')
const app = new Koa()
const views = require('koa-views')
const json = require('koa-json')
const onerror = require('koa-onerror')
const bodyparser = require('koa-bodyparser')
const logger = require('koa-logger')
const session = require('koa-generic-session')
const redisStore = require('koa-redis')
const path = require('path')
const fs = require('fs')
const morgan = require('koa-morgan')

const teacher = require('./routes/teacher')
const student = require('./routes/student')
const user = require('./routes/user')
const { REDIS_CONF } = require('./config/db')

// error handler
onerror(app)

// middlewares
app.use(bodyparser({
  enableTypes:['json', 'form', 'text']
}))
app.use(json())
app.use(logger())
app.use(require('koa-static')(__dirname + '/public'))

app.use(views(__dirname + '/views', {
  extension: 'pug'
}))

// logger
app.use(async (ctx, next) => {
  const start = new Date()
  await next()
  const ms = new Date() - start
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`)
})

//session配置
app.keys = ['DHudkU8*_D#']
app.use(session({
  //配置cookie
  cookie:{
    path: '/',
    httpOnly: true,
    maxAge: 24*60*60*1000
  },
  //配置redis
  store: redisStore({
    // all: '127.0.0.1:6379' //写死本地redis的地址和接口
    all: `${REDIS_CONF.host}:${REDIS_CONF.port}`
  })
}))

// routes
app.use(teacher.routes(), teacher.allowedMethods())
app.use(student.routes(), student.allowedMethods())
app.use(user.routes(), user.allowedMethods())

// error-handling
app.on('error', (err, ctx) => {
  console.error('server error', err, ctx)
});

module.exports = app
