const router = require('koa-router')()
const {
  SuccessModel,
  ErrorModel
} = require('../model/resModel')
const loginCheck = require('../middleware/loginCheck')
const {
    getScore,
    getTest,
    getTestList,
    getTestPage,
    postAnswer,
    getTestState
  } = require('../controller/student')
  
  router.prefix('/api/student')

  router.get('/testList', async (ctx, next) => {
    if (ctx.session.userId == null) {
      //未登录
      ctx.body = new ErrorModel('未登录')
      return
    }
    let stuId = ctx.session.userId
    //登录之后
    //强制只能访问自己的博客
    const Data = await getTestList(stuId)
    ctx.body = new SuccessModel(Data)
  
  })

  router.get('/testState', async (ctx, next) => {
    if (ctx.session.userId == null) {
      //未登录
      ctx.body = new ErrorModel('未登录')
      return
    }
    let stuId = ctx.session.userId
    //登录之后
    //强制只能访问自己的博客
    const Data = await getTestState(stuId)
    ctx.body = new SuccessModel(Data)
  
  })

  router.post('/testPage', async (ctx, next) => {
    if (ctx.session.userId == null) {
      //未登录
      ctx.body = new ErrorModel('未登录')
      return
    }
    ctx.request.body.stuId = ctx.session.userId
    const Data = await getTestPage(ctx.request.body)
    ctx.body = new SuccessModel(Data)
  
  })

  router.post('/postAnswer', async (ctx, next) => {
    if (ctx.session.userId == null) {
      //未登录
      ctx.body = new ErrorModel('未登录')
      return
    }
    const Data = await postAnswer(ctx.request.body)
    if(Data){
      ctx.body = new SuccessModel(Data)
    }else{
      ctx.body = new ErrorModel('上传答案失败')

    }
  
  })

  router.get('/score', async (ctx, next) => {
    const testId = ctx.query.testId || ''
    if (ctx.session.userId == null) {
      //未登录
      ctx.body = new ErrorModel('未登录')
      return
    }
    let stuId = ctx.session.userId
  
    //登录之后
    //强制只能访问自己的博客
    const Data = await getScore(stuId, testId)
    ctx.body = new SuccessModel(Data)
  
  })

  router.get('/test', async (ctx, next) => {
    const testId = ctx.query.testId || ''
    if (ctx.session.userId == null) {
      //未登录
      ctx.body = new ErrorModel('未登录')
      return
    }
    let stuId = ctx.session.userId
  
    //登录之后
    //强制只能访问自己的博客
    const Data = await getTest(stuId, testId)
    ctx.body = new SuccessModel(Data)
  
  })
  module.exports = router