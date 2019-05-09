const router = require('koa-router')()
const {
  SuccessModel,
  ErrorModel
} = require('../model/resModel')
const loginCheck = require('../middleware/loginCheck')

const {
  getList,
  getPaper,
  deletePaper,
  createPaper,
  createTest,
  dispatch,
  createQue,
  deleteQue,
  updateQue,
  testList,
  scoreList,
  allQue,
  allTags,
  updatePaper,
  deletePaperQue,
  classList,
  classDetail,
  createClass
  // updateBlog,
  // delBlog
} = require('../controller/teacher')

router.prefix('/api/teacher')

router.get('/paperList', async (ctx, next) => {
  const keyword = ctx.query.keyword || ''
  if (ctx.session.userId == null) {
    //未登录
    ctx.body = new ErrorModel('未登录')
    return
  }
  let authorId = ctx.session.userId
  //登录之后
  //强制只能访问自己的博客

  ctx.body = new SuccessModel(await getList(authorId, keyword))

})

router.post('/paperList/paper', async (ctx, next) => {
  if (ctx.session.userId == null) {
    //未登录
    ctx.body = new ErrorModel('未登录')
    return
  }
  let paperId = ctx.request.body.paperId
  //选择确定的test之后可以吧testid传入然后返回试卷
  const paperData = await getPaper(paperId)
  ctx.body = new SuccessModel(paperData)
})

router.post('/paperList/paperDelete', async (ctx, next) => {
  if (ctx.session.userId == null) {
    //未登录
    ctx.body = new ErrorModel('未登录')
    return
  }
  let paperId = ctx.request.body.paperId
  let authorId = ctx.session.userId

  const paperData = await deletePaper(paperId, authorId)
  if (paperData.deleteData.affectedRows) {
    ctx.body = new SuccessModel(paperData)
  } else {
    ctx.body = new ErrorModel('删除失败')
  }
})

router.post('/createPaper', async (ctx, next) => {
  if (ctx.session.userId == null) {
    //未登录
    ctx.body = new ErrorModel('未登录')
    return
  }
  ctx.request.body.authorId = ctx.session.userId
  const data = await createPaper(ctx.request.body)
  ctx.body = new SuccessModel(data)
})

router.post('/createTest', async (ctx, next) => {
  if (ctx.session.userId == null) {
    //未登录
    ctx.body = new ErrorModel('未登录')
    return
  }
  ctx.request.body.authorId = ctx.session.userId
  const data = await createTest(ctx.request.body)
  ctx.body = new SuccessModel(data)
})

router.post('/updatePaper', async (ctx, next) => {
  if (ctx.session.userId == null) {
    //未登录
    ctx.body = new ErrorModel('未登录')
    return
  }
  ctx.request.body.authorId = ctx.session.userId

  const data = await updatePaper(ctx.request.body)
  ctx.body = new SuccessModel(data)
  if (data.updateData) {
    ctx.body = new SuccessModel(data)
  } else {
    ctx.body = new ErrorModel('更新失败')
  }
})
router.post('/deletePaperQue', async (ctx, next) => {
  if (ctx.session.userId == null) {
    //未登录
    ctx.body = new ErrorModel('未登录')
    return
  }
  ctx.request.body.authorId = ctx.session.userId

  const data = await deletePaperQue(ctx.request.body)
  ctx.body = new SuccessModel(data)
  if (data.updateData) {
    ctx.body = new SuccessModel(data)
  } else {
    ctx.body = new ErrorModel('更新失败')
  }
})

router.post('/dispatch', async (ctx, next) => {
  if (ctx.session.userId == null) {
    //未登录
    ctx.body = new ErrorModel('未登录')
    return
  }
  ctx.request.body.authorId = ctx.session.userId
  const data = await dispatch(ctx.request.body)
  if (!data.errno) {
    ctx.body = new SuccessModel(data)
  } else {
    ctx.body = new ErrorModel('下发失败')
  }
})
router.post('/allQue', async (ctx, next) => {
  if (ctx.session.userId == null) {
    //未登录
    ctx.body = new ErrorModel('未登录')
    return
  }
  ctx.request.body.authorId = ctx.session.userId
  const data = await allQue(ctx.request.body)
  ctx.body = new SuccessModel(data)
})

router.post('/allTags', async (ctx, next) => {
  if (ctx.session.userId == null) {
    //未登录
    ctx.body = new ErrorModel('未登录')
    return
  }
  ctx.request.body.authorId = ctx.session.userId
  const data = await allTags(ctx.request.body)
  ctx.body = new SuccessModel(data)
})

router.post('/createQue', async (ctx, next) => {
  if (ctx.session.userId == null) {
    //未登录
    ctx.body = new ErrorModel('未登录')
    return
  }
  ctx.request.body.authorId = ctx.session.userId
  const data = await createQue(ctx.request.body)
  ctx.body = new SuccessModel(data)
})

router.post('/deleteQue', async (ctx, next) => {
  if (ctx.session.userId == null) {
    //未登录
    ctx.body = new ErrorModel('未登录')
    return
  }
  ctx.request.body.authorId = ctx.session.userId
  const data = await deleteQue(ctx.request.body)
  ctx.body = new SuccessModel(data)
})

router.post('/updateQue', async (ctx, next) => {
  // if(type)
  if (ctx.session.userId == null) {
    //未登录
    ctx.body = new ErrorModel('未登录')
    return
  }
  ctx.request.body.authorId = ctx.session.userId

  const data = await updateQue(ctx.request.body)
  if (data.updateData) {
    ctx.body = new SuccessModel(data)
  } else {
    ctx.body = new ErrorModel('更新题目失败')
  }
})

router.get('/testList', async (ctx, next) => {
  const keyword = ctx.query.keyword || ''
  if (ctx.session.userId == null) {
    //未登录
    ctx.body = new ErrorModel('未登录')
    return
  }
  let authorId = ctx.session.userId
  //登录之后
  //强制只能访问自己的博客
  const listData = await testList(authorId, keyword)
  console.log(listData.length,'testdata')
  ctx.body = new SuccessModel(listData)
})

router.post('/createClass', async (ctx, next) => {
  if (ctx.session.userId == null) {
    //未登录
    ctx.body = new ErrorModel('未登录')
    return
  }
  ctx.request.body.authorId = ctx.session.userId
  const data = await createClass(ctx.request.body)
  ctx.body = new SuccessModel(data)
})

router.get('/classList', async (ctx, next) => {
  // const classId = ctx.query.classId || ''
  if (ctx.session.userId == null) {
    //未登录
    ctx.body = new ErrorModel('未登录')
    return
  }
  let authorId = ctx.session.userId
  const listData = await classList(authorId)
  ctx.body = new SuccessModel(listData)
})

router.post('/classDetail', async (ctx, next) => {
  const classId = ctx.request.body.classId|| ''
  if (ctx.session.userId == null) {
    //未登录
    ctx.body = new ErrorModel('未登录')
    return
  }
  let authorId = ctx.session.userId
  const listData = await classDetail(authorId,classId)
  // console.log(listData,'listdata')
  ctx.body = new SuccessModel(listData)
})

router.get('/scoreList', async (ctx, next) => {
  const testId = ctx.query.testId || ''
  if (ctx.session.userId == null) {
    //未登录
    ctx.body = new ErrorModel('未登录')
    return
  }
  let teacherId = ctx.session.userId

  //登录之后
  //强制只能访问自己的博客
  const listData = await scoreList(teacherId, testId)
  ctx.body = new SuccessModel(listData)

})

module.exports = router