const xss = require('xss')
const {
    exec
} = require('../db/mysql')

const getList = async (authorId, keyword) => {
    let sql = `select * from paper where 1=1 `
    if (authorId) {
        sql += `and authorId='${authorId}' `
    }
    if (keyword) {
        sql += `and paperName like '%${keyword}%' `
    }
    sql += `order by createtime desc;`

    //返回取出的resolve的值
    return await exec(sql)
}

const getPaper = async (paperId) => {
    let sql = `SELECT * from questions where FIND_IN_SET(queId,(SELECT questionIdarr FROM paper WHERE paperId=${paperId}))`
    let queData = await exec(sql);
    sql = `select questionIdarr from paper where paperId=${paperId}`
    let questionIdarr = await exec(sql)
    // console.log(questionIdarr[0].questionIdarr, 'questionIdarr')
    return {
        queData: queData,
        questionIdarr: questionIdarr[0].questionIdarr
    }
}

const deletePaper = async (paperId, authorId) => {
    let sql = `delete from paper WHERE paperId=${paperId}`
    let deleteData = await exec(sql);
    sql = `delete from test WHERE paperId=${paperId}`
    let deleteTest = await exec(sql);

    let resData = await getList(authorId)
    return {
        resData: resData,
        deleteData: deleteData,
        deleteTest:deleteTest
    }
}

const createPaper = async (paperData = {}) => {
    //paperData 包括title content 属性 
    const paperName = xss(paperData.paperName)
    const questionIdarr = xss(paperData.questionIdarr)
    const authorId = paperData.authorId
    const createtime = Date.now()

    let sql = `insert into paper (paperName,createtime,authorId) 
    values ('${paperName}','${createtime}','${authorId}')`

    const insertData = await exec(sql)
    sql = `select * from paper where paperId=${insertData.insertId}`
    const resPaper = await exec(sql)
    return {
        resPaper: resPaper
    }
}

const updatePaper = async (postData = {}) => {
    //paperData 包括title content 属性 
    const questionIdarr = postData.questionIdarr.split(',').filter(function (x) {
        return x != ''
    })
    const paperId = postData.paperId

    let sql = `select questionIdarr from paper where paperId=${paperId}`
    let hasQue = (await exec(sql))[0].questionIdarr
    // console.log(hasQue,'hasque')
    if (hasQue) {
        hasQue = (hasQue.split(',')).filter(function (x) {
            return x != ''
        })
    } else {
        hasQue = []
    }
    // console.log(hasQue, 'hasQue')

    for (let i = 0; i < questionIdarr.length; i++) {
        if (questionIdarr[i] && hasQue.indexOf(questionIdarr[i]) == -1) {
            hasQue.push(questionIdarr[i])
        }
    }
    if (hasQue.length) {
        hasQue = hasQue.join(',') + ','
    }
    // console.log(hasQue, 'newQue')
    sql = `update paper set questionIdarr ='${hasQue}' where paperId=${paperId}`
    const updateData = await exec(sql)
    const paperData = await getPaper(paperId)
    return {
        questionIdarr: hasQue,
        paperData: paperData.queData,
        paperId: paperId,
        updateData: updateData
    }
}

const deletePaperQue = async (postData = {}) => {
    //paperData 包括title content 属性 
    let questionIdarr = postData.questionIdarr.split(',').filter(function (x) {
        return x != ''
    })
    const paperId = postData.paperId
    if (questionIdarr.length) {
        questionIdarr = questionIdarr.join(',') + ','

    }
    sql = `update paper set questionIdarr ='${questionIdarr}' where paperId=${paperId}`
    const updateData = await exec(sql)
    sql = `SELECT * from questions where FIND_IN_SET(queId,(SELECT questionIdarr FROM paper WHERE paperId=${paperId}))`

    // sql = `select * from paper where paperId=${paperId}`
    const paperData = await exec(sql)
    return {
        questionIdarr: questionIdarr,
        paperData: paperData,
        updateData: updateData,
        paperId: paperId
    }
}

const dispatch = async (testData = {}) => {
    //paperData 包括title content 属性 
    const classId = testData.classId
    const testName = testData.testName
    const paperId = testData.paperId
    const teacherId = testData.authorId
    let sql = `insert into test (testName,paperId,classId,authorId) 
    values ('${testName}',${paperId},${classId},${teacherId}) `
    let newTest = await exec(sql)
    const testId = newTest.insertId

    sql = `select * from class where classId=${classId}`
    let classData = await exec(sql)
    // console.log(classData,'classdata')
    if(!classData[0]){
        return {
            errno:1,
            msg:'result is undefined'
        }
    }
    let stuIdarr = classData[0].students.split(',').filter((val) => {
        return val != ''
    })

    let dispacthData
    for (let i = 0; i < stuIdarr.length; i++) {
        sql = `select testIdarr from stutest where stuId=${stuIdarr[i]} `
        let data = (await exec(sql))[0]
        console.log(data,'data')
        if (data == undefined) {
            let sql = `select realname from users where id=${stuIdarr[i]}`
            let stuName = (await exec(sql))[0]
            sql = `insert into stutest (stuId,teacherId,stuName,classId) 
        values (${stuId},${teacherId},'${stuName}',${classId})`;
            data = (await exec(sql))[0]
        }

        let testIdarr = String(data.testIdarr)
        if(testIdarr == 'null'){
            testIdarr = ''
        }
        testIdarr += `${testId},`
        sql = `update stutest set testIdarr='${testIdarr}' where stuId=${stuIdarr[i]}`
        dispacthData = (await exec(sql)).affectedRows ? 1:0
    }

    if (dispacthData > 0) {
        return {
            errno:0,
            msg:'dispacthData success'
        }
    }
    return {
        errno:-1,
        msg:'dispacthData is 0'
    }

}
const allTags = async (reqData = {}) => {
    let {
        keyword
    } = reqData
    let sql = `select * from tags where 1=1`
    if (keyword) {
        sql += `and tags like '%${keyword}%' `
    }
    let allTags = await exec(sql)

    // // 整理对应tag的问题数目和删除没有对应问题的tags
    // for (let i = 0; i < allTags.length; i++) {
    //     sql = `SELECT * FROM questions WHERE tags like '%${allTags[i].tagName}%' `
    //     let relatedQue = await exec(sql)
    //     console.log(allTags[i].tagName, relatedQue.length, 'relatedQue')
    //     if (relatedQue.length == 0) {
    //         sql = `DELETE FROM tags WHERE tagName='${allTags[i].tagName}'`
    //         let deleteTag = await exec(sql)
    //     }
    //     // 删除部分已经在deleteQue更新
    //      else {
    //         sql = `update tags set relatedCount=${relatedQue.length} where tagName='${allTags[i].tagName}'`
    //         let updateTag = await exec(sql)         
    //     }
    //     // 在createQue中已经更新
    // }
    // console.log(allTags, 'alltags')
    return allTags
}

const allQue = async (reqData = {}) => {
    let {
        authorId,
        keyword,
        paperId
    } = reqData
    let sql = `select * from questions where 1=1 `
    // if (authorId) {
    //     sql += `and authorId='${authorId}' `
    // }
    if (keyword) {
        for (let i = 0; i < keyword.length; i++) {
            if (keyword[i]) {
                sql += `and tags like '%${keyword[i]}%' `
            }
        }
    }
    sql += `order by queId desc;`
    let all = await exec(sql)
    return all

    //将所有的tag都获取到tags table里
    // sql = 'select tags from questions'
    // let tags = await exec(sql)
    // console.log('tags',tags)
    // for(let i=0;i<tags.length;i++){
    //     if(tags[i].tags){
    //         let tagsArr = tags[i].tags.split(',').filter(function (x) {
    //     return x != ''
    // })
    //         for(let j=0;j<tagsArr.length;j++){
    //             sql = `insert ignore into tags (tagName) values('${tagsArr[j]}')`
    //             let tag = await exec(sql)
    //             console.log('tag',tag)
    //         }
    //         console.log(tagsArr,'tagsarr')
    //     }
    // }
    //返回取出的resolve的值
}

const createQue = async (queData = {}) => {
    const content = xss(queData.content)
    let tags = xss(queData.tags)
    const optionA = xss(queData.optionA)
    const optionB = xss(queData.optionB)
    const optionC = xss(queData.optionC)
    const optionD = xss(queData.optionD)
    const answer = xss(queData.answer)
    const authorId = queData.authorId

    tags = tags.replace("，", ",")

    let sql = `insert into questions (content,tags,answer,optionA,optionB,optionC,optionD,authorId) 
    values ('${content}','${tags}','${answer}','${optionA}','${optionB}','${optionC}','${optionD}','${authorId}')`
    const insertData = await exec(sql)
    // console.log('insert', insertData)
    let updateTag
    //新建题目则将其tags记录入tags table
    if (tags) {
        let tagsArr = tags.split(',').filter(function (x) {
            return x != ''
        })
        for (let j = 0; j < tagsArr.length; j++) {
            if (tagsArr[j]) {
                sql = `insert ignore into tags (tagName) values('${tagsArr[j]}')`
                let tag = await exec(sql)
                console.log('addtag', tag)
                if (tag.affectedRows) {
                    console.log('新的')
                    sql = `update tags set relatedCount=1 where tagName='${tagsArr[j]}'`
                    updateTag = await exec(sql)
                } else {
                    console.log('重复')
                    sql = `update tags set relatedCount=relatedCount+1 where tagName='${tagsArr[j]}'`
                    updateTag = await exec(sql)
                }
            }
        }
    }

    let all = await allQue()
    return {
        queId: insertData.insertId,
        all: all
    }
}

const deleteQue = async (reqData = {}) => {
    let deleteArr = reqData.deleteArr.split(',').filter(function (x) {
        return x != ''
    })
    let sql = ``;

    //判断是否删除相关题目的tags
    let deleteCount = 0;
    let affectTags = 0;
    let deleteTags = 0
    for (let i = 0; i < deleteArr.length; i++) {
        sql = `select tags from questions where queId=${deleteArr[i]}`
        let tagArr = (await exec(sql))[0].tags.split(',').filter(function (x) {
            return x != ''
        })
        for (let j = 0; j < tagArr.length; j++) {
            sql = `update tags set relatedCount=relatedCount-1 where tagName='${tagArr[j]}'`
            affectTags = await exec(sql)
            if (affectTags.affectedRows) {
                sql = `select * from tags where tagName='${tagArr[j]}' `
                let tag = await exec(sql)
                //当relatedcount为0时，删除该tag，并返回删除的tag总数deleteTag
                if (tag[0].relatedCount < 1) {
                    sql = `DELETE FROM tags WHERE tagName='${tagArr[j]}'`
                    deleteTags += (await exec(sql)).affectedRows
                    console.log(deleteTags, 'deleteTag')
                }
            }
        }
        sql = `DELETE FROM questions WHERE queId=${deleteArr[i]}`
        deleteCount += (await exec(sql)).affectedRows
    }
    let all = await allQue()
    return {
        deleteCount: deleteCount,
        deleteTags: deleteTags,
        all: all
    }
}


const updateQue = async (queData = {}) => {
    //id为更新题目的id
    const queId = queData.queId
    const content = xss(queData.content)
    let tags = xss(queData.tags)
    const optionA = xss(queData.optionA)
    const optionB = xss(queData.optionB)
    const optionC = xss(queData.optionC)
    const optionD = xss(queData.optionD)
    const answer = xss(queData.answer)
    const authorId = queData.authorId
    const paperId = queData.paperId
    const isAllQue = queData.isAllQue

    tags = tags.replace("，", ",")

    let sql = `update questions set 
     content='${content}',
     tags='${tags}', 
     optionA='${optionA}', 
     optionB='${optionB}', 
     optionC='${optionC}', 
     optionD='${optionD}', 
     answer='${answer}', 
     authorId='${authorId}' where queId=${queId}`
    const updateData = await exec(sql)

    //更新题目则将其tags记录入tags table
    if (tags) {
        let tagsArr = tags.split(',').filter(function (x) {
            return x != ''
        })
        for (let j = 0; j < tagsArr.length; j++) {
            if (tagsArr[j]) {
                sql = `insert ignore into tags (tagName) values('${tagsArr[j]}')`
                let tag = await exec(sql)
                // console.log('tag', tag)
            }
        }
    }
    let all, questionIdarr
    if (isAllQue) {
        all = await allQue()
    } else {
        let paperData = await getPaper(paperId)
        all = paperData.queData
        questionIdarr = paperData.questionIdarr
    }
    return {
        updateData: updateData.affectedRows,
        all: all,
        questionIdarr: questionIdarr,
        queId: queId
    }
}

const testList = async (authorId, keyword) => {
    let sql = `SELECT a.testId, a.paperId,a.classId,a.authorId,a.average,a.testName,b.paperName,c.className FROM test a left JOIN paper b ON a.paperId = b.paperId left join class c on a.classId=c.classId`
    if (authorId) {
        sql += ` where a.authorId='${authorId}' `
    }

    // if (keyword) {
    //     sql += `and paperName like '%${keyword}%' `
    // }
    // sql += `order by createtime desc;`
    //返回取出的resolve的值
    let data = await exec(sql)
    // console.log('testdata',data)
    return data
}

const classList = async (authorId) => {
    let sql = `select * from class where teacherId=${authorId} `

    //返回取出的resolve的值
    return await exec(sql)
}

const classDetail = async (authorId, classId) => {
    let sql = `select * from class where teacherId=${authorId} and classId=${classId} `
    let classData = await exec(sql)
    sql = `select * from stutest where classId=${classId}`
    let studentData = await exec(sql)
    return {
        classData: classData[0],
        studentData: studentData
    }
}

const scoreList = async (teacherId, testId) => {
    let sql = `select * from stutest where teacherId=${teacherId} and testIdarr  like '%${testId}%' `
    return await exec(sql)
}


const getPaperId = async (testId) => {
    let sql = `SELECT * from test where testId=${testId}`
    let testData = (await exec(sql))[0]
    console.log('testData', testData)
    let paperId = testData.paperId;
    return paperId
}

// const delBlog = async (id,authorId) => {
//     const sql = `delete from blogs where id=${id} and authorId='${authorId}'`
//     const deleteData = await exec(sql)
//     if(deleteData.affectedRows > 0){
//         return true
//     }
//     return false
// }

module.exports = {
    getList,
    getPaperId,
    getPaper,
    deletePaper,
    createPaper,
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
    classDetail
    // updateBlog,
    // delBlog
}