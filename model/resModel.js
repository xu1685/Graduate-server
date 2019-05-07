class BaseModel {
    constructor(data,message) {
        if (typeof data === 'string'){
            this.message = data
            data = null
            message = null
        }//兼容可以传一个参数的情况
        if(data){
            this.data = data
        }
        if(message){
            this.message = message
        }
    }
}

class SuccessModel extends BaseModel {
    constructor(data,message) {
        super(data,message)
        this.errno = 0
    }
}

class ErrorModel extends BaseModel{
    constructor(data,message){
        super(data,message)
        this.errno = -1
    }
}

module.exports = {
    SuccessModel,
    ErrorModel
}