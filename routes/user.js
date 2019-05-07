const router = require('koa-router')()
const {
    login,
    register
} = require('../controller/user')
const {
    SuccessModel,
    ErrorModel
} = require('../model/resModel')

//前缀
router.prefix('/api/user')

router.post('/login', async function (ctx, next) {
    const {
        userName,
        password
    } = ctx.request.body

    const data = await login(userName, password)
    console.log('data',data)
    if (data.id) {
        //设置session
        ctx.session.userId = data.id
        ctx.session.userName = data.username
        ctx.body = new SuccessModel({
            userName: userName,
            type: data.type
        }, '登录成功')
        return
    }
    ctx.body = new ErrorModel('登录失败')
})

router.post('/register', async function (ctx, next) {
    const postData = ctx.request.body

    const userId = await register(postData)
    if (userId) {
        ctx.body = new SuccessModel('注册成功')
        return
    }
    ctx.body = new ErrorModel('注册失败')
})
// router.get('/session-test', async (ctx,next) => {
//     if(ctx.session.viewCount == null){
//         ctx.session.viewCount = 0
//     }
//     ctx.session.viewCount++

//     ctx.body ={
//         errno: 0,
//         viewCount:ctx.session.viewCount
//     }
// })

// router.get('/login-test', async (ctx, next) => {
//     console.log('session', ctx.session.userId)

//     if (ctx.session.userId) {
//         console.log('成功')
//         ctx.body = {
//             errno: 0,
//             message: '登陆成功'
//         }
//         return
//     }

//     ctx.body = {
//         errno: -1,
//         message: '登陆失败'
//     }
// })

module.exports = router