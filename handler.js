const Book = require('./schema/bookSchema')
const User = require('./schema/userSchema')

const db = require('./db');
const cred = require('./credential')
const fs = require('fs')
const AWS = require('aws-sdk');


async function filter(ctx){

    var resp = ctx.query;

    if(resp.authorName && resp.category){
        await mixFilter(ctx);
    }
    else if(resp.authorName){
        await basicFilter("authorName-index" , resp.authorName, ctx);
    }
    else if(resp.category){
        await basicFilter("category-index" , resp.category, ctx);
    }
    else{
        await basicFilter("bookName-index" , resp.bookName, ctx);
    }
}


async function basicFilter(ind, param, ctx){

    var promise = db.basicFilter(ind, param)

    await promise.then(
        result  => {
            if(result == ''){
                console.log('No such data');
                ctx.body = "No such data";
            }
            else{
                console.log(result);
                ctx.body = result;
            }
        }
    ).catch(err =>{
        console.log(err);
        ctx.body = 'Something went wrong';
    }) 
}

async function mixFilter(ctx){

    var authorName = ctx.query.authorName;
    var category = ctx.query.category;

    var promise = db.mixFilter(authorName, category)

        await promise.then(
            result  => {
                if(result == ''){
                    console.log('No such data');
                    ctx.body = "No such data";
                }
                else{
                    console.log(result);
                    ctx.body = result;
                }
            }
        ).catch(err =>{
            console.log(err);
            ctx.body = 'Something went wrong';
        }) 
}

async function isAvailable(ctx){

    var authorName = ctx.query.authorName;
    var bookName = ctx.query.bookName;
    
    var promise = db.isAvailable(authorName, bookName);

    await promise.then(
        result => {
            console.log(result);
            if(result == ''){
                console.log('No such data');
                ctx.body = "No such data";
            }
            else{
                if(result[0].bookCount == 0){
                    console.log('Book is not available');
                    ctx.body = "Book is not available";
                 }
                 else{
                    console.log('Book is available');
                    ctx.body = "Book is available";
                 }
            }
        }
    ).catch(err =>{
        console.log(err);
        ctx.body = 'Something went wrong';
    }) 
}


async function isPrime(ctx){

    var userId = ctx.query.userId;
    
    var promise = db.isPrime(userId);

    await promise.then(
        result => {
            console.log(result);
            if(result == ''){
                console.log('No such data');
                ctx.body = "No such data";
            }
            else{
                if(result[0].isPrimeMember == false){
                    console.log('User is not Prime');
                    ctx.body = "User is not Prime";
                 }
                 else{
                    console.log('User is Prime');
                    ctx.body = "User is Prime";
                 }
            }
        }
    ).catch(err =>{
        console.log(err);
        ctx.body = 'Something went wrong';
    }) 
}


async function updateBookCount(ctx){

    var bookName = ctx.request.body.bookName;
    var authorName = ctx.request.body.authorName;

    var promise1 = db.updateBookCount(authorName, bookName);

    await promise1.then(
        async (result) => {

            if(result == ''){
                console.log(result);
                ctx.body = 'No such data';
            }
            else{
                var count = result[0].bookCount;
                var id = result[0].bookId;
                if(count>0){
                    count--;
                    await db.decreaseBookCount(id, count).then(
                        result => {
                            console.log(result);
                            ctx.body = result;
                        }
                    ).catch(err =>{
                        ctx.body = 'error'+ err;
                    })
                }
                else{
                    var msg= "Can't Update Book Count because it is 0";
                    console.log(msg);
                    ctx.body = msg;
                }
    
            }
        }
    ).catch(err =>{
        console.log(err);
        ctx.body = 'Something went wrong';
    }) 
}

async function validateBook(ctx){

    var bookid = ctx.query.bookId;

    var promise = db.validateBook(bookid);

        var p = await promise.then(
            res => {
            if(res == null){
                console.log('No such Book');
                ctx.body = 'No such Book';
                return (false);
            }
            else{
                return(true);
            }
        }
        )
        return p;
}

async function validateUser(ctx){

    var userid = ctx.query.userId;

    var promise = db.validateUser(userid);

        var p = await promise.then(
            res => {
            if(res == null){
                console.log('No such User');
                // ctx.body = 'No such User';
                return(false);
            }
            else{
                return(true);
            }
        }
        )
        return p;
}

async function placeOrder(ctx){

    var validateuser = await validateUser(ctx);
    var validatebook = await validateBook(ctx);
    
    if(validateuser &&  validatebook){
        await validatedPlaceOrder(ctx);
    }
    else{
        if(!validateuser && !validatebook){
            ctx.body = 'No such User and Book';    
        }
        else if(! validateuser){
            ctx.body = 'No such User';
        }
        else{
            ctx.body = 'No such Book';
        }
    }
}

async function validatedPlaceOrder(ctx){

    var userid = ctx.query.userId;
    var bookid = ctx.query.bookId;

    var promise = db.validatedPlaceOrder(bookid, userid);

    await promise.then(
        result  => {
            ctx.body=result; 
            console.log(result);
        }
        
    ).catch(err =>
    {
        console.log(err);
        ctx.body = 'Something went wrong';
    })
}


async function addBook(ctx){

    var book = ctx.request.body;
    var bookUrl = await uploadPic(ctx);

    var promise = db.addBook(book, bookUrl);

    await promise.then(
        result => {
            console.log(result);
            ctx.body = result;
        }
    ).catch(err =>{
        console.log(err);
        ctx.body = err;
    }) 
}


async function addUser(ctx){

    var user = ctx.request.body;

    var promise = db.addUser(user);

    await promise.then(
        result => {
            console.log(result);
            ctx.body = result;
        }
    ).catch(err =>{
        console.log(err);
        ctx.body = err;
    }) 
}

async function deleteUser(ctx){

    console.log(ctx.query);
    var userId = ctx.query.userId;

    var promise = db.deleteUser(userId);

        await promise.then(
            result  => {
                console.log(result);
                ctx.body = result;
            }
        ).catch(err =>{
            console.log(err);
            ctx.body = 'Something went wrong';
        }) 
}


async function uploadPic(ctx)
{   
        const uploadResponse = await upload(ctx);
        //ctx.body = uploadResponse.resultUrl1
        return uploadResponse.resultUrl1;
}


const upload = (details) => {
    try{
        return new Promise((resolve, reject) => {
            const s3 =  new AWS.S3({
                accessKeyId: cred.AWS_ID,
                secretAccessKey: cred.AWS_SECRET
            })
            const path = details.request.files.image.path
            const name = details.request.files.image.name
       
            const body = fs.createReadStream(path)
            const key =  details.request.files.image.name
            const type = details.request.files.image.type
            const resultUrl = "https://imagepractice1.s3.ap-south-1.amazonaws.com/"+name;

            const params = {
                Bucket: cred.AWS_BUCKET_NAME,
                Key:key,
                Body: body,
                ContentType: type,
                ACL: "public-read"
            }
      
          
    
            s3.putObject(params, (err, data) => {
                if (err) {
                    reject(err)
                } else if (data) {
                    resolve({
                    success: true,
                    uploadUrl: "https://s3.console.aws.amazon.com/s3/buckets/imagepractice1/?region=ap-south-1&tab=overview",
                    message: 'File uploaded successfully',
                    resultUrl1: resultUrl
                    })
                }
            })
        })
       
    }
    catch(e)
    {
        return e;
    }
}


module.exports = {

    addBook,
    addUser,
    deleteUser,

    updateBookCount,
 
    isAvailable,
    isPrime,

    uploadPic,

    placeOrder,
    filter
}

