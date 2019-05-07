const xss = require('xss')
const {
    exec
} = require('../db/mysql')


const getTestList = async (stuId) => {
    let sql = `SELECT a.testId, a.paperId,a.classId,a.authorId,a.average,a.testName,b.paperName,c.className FROM test a 
    left JOIN paper b ON a.paperId = b.paperId 
    left join class c on a.classId=c.classId
    WHERE FIND_IN_SET( a.testId,(SELECT testIdarr FROM stutest where stuId=${stuId}))`
    let testList = (await exec(sql))
    return testList
}

const getScore = async (stuId, testId) => {
    let sql = `select * from stutest where stuId=${stuId} and testIdarr like '%${testId}%' `
    let testData = (await exec(sql))[0];
    // console.log(testData,'data')
    let testIdarr = testData.testIdarr.split(',')
    let answerIdarr = testData.answerIdarr.split(',')
    //testId，answerId都是唯一的  派发的时候也应该注意到这一点（填充到stutest和test表格）
    let index = testIdarr.indexOf(testId)
    let answerId = answerIdarr[index] //根据顺序找到对应的answerid
    // console.log('answerId',answerId)

    //取出学生answer
    sql = `select * from answer where answerId=${answerId} and testId=${testId}`
    let answerData = (await exec(sql))[0];
    let stuAnswerIdarr = answerData.content.split(','); //这是一个字符串数组
    let paperId =  answerData.paperId;
    // console.log('stuAnswerIdarr',stuAnswerIdarr)

    
    //取出正确answer
    sql = `SELECT answer from questions where FIND_IN_SET(queId,(SELECT questionIdarr FROM paper WHERE paperId=${paperId}))`
    let rightAnswer = await exec(sql);
    // console.log('rightAnswer',rightAnswer);//由answerid得到对应卷子的题目信息
    let count = 0;
    for(let i=0;i<rightAnswer.length;i++){
        if(stuAnswerIdarr[i] == rightAnswer[i].answer){
            count++
        }
    }
    sql = `update answer set score='${count}' where answerId=${answerId}`
    const dispacthData = await exec(sql)
    if (dispacthData.affectedRows > 0) {
        return {
            testId: testId,
            stuId: stuId,
            score: count
        }
    }
    return false
}

const getTest = async (stuId,testId) => {
    let sql = `SELECT * from test where testId=${testId}`
    let testData = (await exec(sql))[0]
    // console.log('testData',testData)
    let paperId = testData.paperId;

    sql = `SELECT * from questions where FIND_IN_SET(queId,(SELECT questionIdarr FROM paper WHERE paperId=${paperId}))`
    let queData = await exec(sql);
    // console.log('queData',queData);//由answerid得到对应卷子的题目信息sql = `SELECT * FROM questions WHERE FIND_IN_SET(queId,(SELECT questionIdarr FROM paper WHERE paperId=${paperId}))`
    return queData
}

const getTestState = async (stuId) => {
    let sql = `SELECT * from stutest where stuId=${stuId}`
    let stuData = (await exec(sql))[0]
    let testIdarr = stuData.testIdarr.split(',').filter(function (x) {
        return x != ''
    });
    if(!stuData.answerIdarr){
        stuData.answerIdarr = ''
    }
    let answerIdarr = stuData.answerIdarr.split(',');
    let stateArr = []
    for(let i=0;i<testIdarr.length;i++){
        if(answerIdarr[i]>0){
           stateArr[i] = 1
        }else{
           stateArr[i] = 0
        }
    }
    // console.log(stateArr,'stateArr')
   return stateArr
}

const getTestPage = async (postData) => {
    let stuId = postData.stuId
    let testId = postData.testId
    let sql = `SELECT * from test where testId=${testId}`
    let testData = (await exec(sql))[0]
    // console.log('testData',testData)
    let paperId = testData.paperId;

    sql = `SELECT * from questions where FIND_IN_SET(queId,(SELECT questionIdarr FROM paper WHERE paperId=${paperId}))`
    let queData = await exec(sql);
    // console.log('queData',queData);
    //由answerid得到对应卷子的题目信息
    // sql = `SELECT * FROM questions WHERE FIND_IN_SET(queId,(SELECT questionIdarr FROM paper WHERE paperId=${paperId}))`
    let pageData = {
        stuId:stuId,
        paperId:paperId,
        queData: queData
    }
    return pageData
}

const postAnswer = async (postData) => {
    let stuId = postData.stuId
    let testId = postData.testId
    let paperId = postData.paperId
    let content = postData.content

    let sql = `INSERT into answer (stuId,testId,paperId,content) values (${stuId},${testId},${paperId},'${content}')`
    let data = await exec(sql)

    let answerId = data.insertId
    sql = `select * from stutest where stuId=${stuId}`
    let stuTestData = (await exec(sql))[0]
    let testIdarr = stuTestData.testIdarr.split(',').filter(function (x) {
        return x != ''
    })
    if(!stuTestData.answerIdarr){
        stuTestData.answerIdarr = ''
    }
    let answerIdarr = stuTestData.answerIdarr.split(',').filter(function (x) {
        return x != ''
    })
    let index = testIdarr.indexOf(testId)
    answerIdarr[index] = answerId
    for(let i=0;i<testIdarr.length;i++){
        if(!answerIdarr[i]){
            answerIdarr[i] = -1
        }
    }
    answerIdarr = answerIdarr.join(',')

    sql = `update stutest set answerIdarr='${answerIdarr}' where stuId=${stuId} `
    let updateData = await exec(sql)
    if(updateData.affectedRows){
        let scoreData = await getScore(stuId,testId)
        return scoreData
    }else{
        return false
    }
   
}
module.exports = {
    getScore,
    getTest,
    getTestList,
    getTestPage,
    postAnswer,
    getTestState
}