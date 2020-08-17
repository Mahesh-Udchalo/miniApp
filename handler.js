const Book = require('./schema/bookSchema')
const User = require('./schema/userSchema')

const cred = require('./credential')
const fs = require('fs')
const AWS = require('aws-sdk');


async function getBookByCategory(ctx){

    var category = ctx.params.category;
    var promise = new Promise((resolve, reject) => {
        Book.Book.query(category)
            .usingIndex('category-index')
            .exec((error, res)=>{
            if(error){
                reject(error)
            } 
            if(res){
                const data=JSON.parse(JSON.stringify(res.Items))
                resolve(data)
            }
            resolve(null)
            })
        });

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
        ctx.body = 'Something went wrong';
    }) 
}


async function getBookByName(ctx){

    var bookName = ctx.params.bookName;
    var promise = new Promise((resolve, reject) => {
        Book.Book.query(bookName)
            .usingIndex('bookName-index')
            .exec((error, res)=>{
            if(error){
                reject(error)
            } 
            if(res){
                const data=JSON.parse(JSON.stringify(res.Items))
                resolve(data)
            }
            resolve(null)
            })
        })

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
        ctx.body = 'error'+ err;
    }) 
}


async function getBookByAuthorName(ctx){

    var authorName = ctx.params.authorName;
    var promise = new Promise((resolve, reject) => {
        Book.Book.query(authorName)
            .usingIndex('authorName-index')
            .exec((error, res)=>{
            if(error){
                reject(error)
            } 
            if(res){
                const data=JSON.parse(JSON.stringify(res.Items))
                resolve(data)
            }
            resolve(null)
            })
        })

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
        ctx.body = 'error'+ err;
    })     
}

async function getBookFilterByAuthorName_Category(ctx){

    var authorName = ctx.params.authorName;
    var category = ctx.params.category;

    var promise = new Promise((resolve, reject) => {
        Book.Book.query(authorName)
            .usingIndex('authorName-index')
            .filter('category').contains(category)
            .exec((error, res)=>{
            if(error){
                reject(error)
            } 
            if(res){
                const data=JSON.parse(JSON.stringify(res.Items))
                resolve(data)
            }
            resolve(null)
            })
        })

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
            ctx.body = 'error'+ err;
        }) 
}

async function isAvailable(ctx){

    var authorName = ctx.params.authorName;
    var bookName = ctx.params.bookName;
    
    var promise = new Promise((resolve, reject) => {
        Book.Book.query(authorName)
            .usingIndex('authorName-index')
            .filter('bookName').contains(bookName)
            .exec((error, res)=>{
            if(error){
                reject(error)
            } 
            if(res){
                const data=JSON.parse(JSON.stringify(res.Items))
                resolve(data)
            }
            resolve(null)
            })
        })

    await promise.then(
        result => {
            console.log(result);
             if(result[0].bookCount == 0){
                console.log('Book is not available');
                ctx.body = "Book is not available";
             }
             else{
                console.log('Book is available');
                ctx.body = "Book is available";
             }
        }
    ).catch(err =>{
        ctx.body = 'error'+ err;
    }) 
}


async function isPrime(ctx){

    var userId = ctx.params.userId;
    
    var promise = new Promise((resolve, reject) => {
        User.User.query(userId)
            .exec((error, res)=>{
            if(error){
                reject(error)
            } 
            if(res){
                const data=JSON.parse(JSON.stringify(res.Items))
                resolve(data)
            }
            resolve(null)
            })
        })

    await promise.then(
        result => {
            console.log(result);
             if(result[0].isPrimeMember == false){
                console.log('User is not Prime');
                ctx.body = "User is not Prime";
             }
             else{
                console.log('User is Prime');
                ctx.body = "User is Prime";
             }
        }
    ).catch(err =>{
        ctx.body = 'error'+ err;
    }) 
}


function decreaseBookCount(id, count){
    return new Promise((resolve, reject) => {
        Book.Book.update({bookId: id, bookCount: count }, 
        (err, res) => {
            if(err){
                reject(err);
            }
            if(res){
                var msg = "Updated BookName -> " + res.get('bookName')+" decremented count -> "+count+" from count -> "+(count+1);
                resolve(msg);
            }
            resolve(null);
          });
        })
}


async function updateBookCount(ctx){

    var bookName = ctx.params.bookName;
    var authorName = ctx.params.authorName;

    var promise1 = new Promise((resolve, reject) => {
        Book.Book.query(authorName)
            .usingIndex('authorName-index')
            .filter('bookName').contains(bookName)
            .exec((err, res) => {
                if(err){
                    reject(err);
                }
                if(res){
                    data=JSON.parse(JSON.stringify(res.Items))
                    resolve(data);    
                }
                resolve(null);
          });
    })

    await promise1.then(
        async (result) => {
            var count = result[0].bookCount;
            var id = result[0].bookId;
            if(count>0){
                count--;
                await decreaseBookCount(id, count).then(
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
    ).catch(err =>{
        console.log(err);
    }) 
}


async function placeOrder(ctx){

    var userid = ctx.params.userId;
    var bookid = ctx.params.bookId;

    var promise = new Promise((resolve) => {
                 decreaseCount(bookid).then(
                    (data) =>{               
                        if(data==-1)
                        {                    
                            updateIssueBook(userid,bookid).then(data => resolve(data) )                
                        }
                        else{
                            resolve(data);
                        } 
                    })
                .catch(err =>
                {
                    {console.log(err)}                
                })
     })

    await promise.then(
        result  => {
            ctx.body=result; 
            console.log(result);
        }
        
    ).catch(err =>
    {
        ctx.body = 'error'+ err;
    })
}

function decreaseCount(bookid){

    return new Promise((resolve, reject) => {
             Book.Book.get(bookid,(err, res)=>{
                if(err){
                    reject(err)
                } 
                if(res){
                        let oldcount = res.get('bookCount');
                        if(oldcount >0 )
                        {
                         let newcount=oldcount-1;
                         updateCount(bookid,newcount).then(
                            data => console.log(data.get("bookId"))); 
                            resolve(-1);
                        }
                        else{
                            resolve("out of stock");
                        }
                      }
                resolve(null)
        })
     })
}


function updateCount(bookid,count){

    return new Promise((resolve, reject) => {
             Book.Book.update({'bookId': bookid,'bookCount': count},(err, res) =>{
                if(err){
                    reject(err)
                } 
                if(res){
                    resolve(res)
                      }
                resolve(null)
        })
     })
}

 function updateIssueBook(userid,bookid){

    return new Promise((resolve, reject) => {
             User.User.get(userid, (err, res)=>{
                if(err){
                    reject(err)
                } 
                if(res){
                        if(res.get('issuedBook') == undefined) 
                        {                 
                            let issuedBook=[bookid];                
                            updateuserbooks(userid,issuedBook).then(data => console.log(data))
                            resolve("created new array to append",bookid)
                        }
                        else{
                            let issuedbook = res.get('issuedBook')
                            let  issuedBook=[...issuedbook,bookid];  
                            updateuserbooks(userid,issuedBook).then(data => console.log(data))
                            resolve("array updated")
                        }                      
                      }
                resolve(null)
            })
     })
}

function updateuserbooks(userid,issuedBook){

    return new Promise((resolve, reject) => {
             User.User.update({"userId":userid,"issuedBook":issuedBook } ,(err, res)=>{
                if(err){
                    reject(err)
                } 
                if(res){
                        resolve(res)
                      }
                resolve(null)
        })
     })
}



async function addBook(ctx){

    var book = ctx.request.body;
    var bookUrl = await uploadPic(ctx);
    console.log(bookUrl);
    var promise = new Promise((resolve, reject) => {
    Book.Book.create(
        {
            bookId : book.bookId ,
            bookName : book.bookName , 
            authorName : book.authorName ,
            category : book.category ,
            bookPrice : book.bookPrice ,
            bookDescription : book.bookDescription ,
            bookCount : book.bookCount ,
            bookUrl : bookUrl 
        },
        (err, res) => {
            if(err){
                reject(err);
            }
            if(res){
                const data=JSON.parse(JSON.stringify(res));
                resolve(data);    
            }
            resolve(null);
        }
    );
    })

    await promise.then(
        result => {
            console.log(result);
            ctx.body = result;
        }
    ).catch(err =>{
        ctx.body = 'error'+ err;
    }) 
}


async function addUser(ctx){

    var user = ctx.request.body;

    var promise = new Promise((resolve, reject) => {
    User.User.create(
        {
            userId : user.userId ,
            userName : user.userName , 
            isPrimeMember : user.isPrimeMember ,
            walletAmount : user.walletAmount ,
            issuedBook : user.issuedBook 
        },
        (err, res) => {
            if(err){
                reject(err);
            }
            if(res){
                const data=JSON.parse(JSON.stringify(res));
                resolve(data);    
            }
            resolve(null);
        }
    );
    })

    await promise.then(
        result => {
            console.log(result);
            ctx.body = result;
        }
    ).catch(err =>{
        ctx.body = 'error'+ err;
    }) 
}

async function deleteUser(ctx){

    var userId = ctx.params.userId;

    var promise = new Promise((resolve, reject) => {
        User.User.destroy(userId, (err) => {
            if(err){
                reject(err);
            }
            else{
                msg = "User deleted";
                resolve(msg);
            }
          });
        })

        await promise.then(
            result  => {
                console.log(result);
                ctx.body = result;
            }
        ).catch(err =>{
            ctx.body = 'error'+ err;
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
    
    getBookByAuthorName,
    getBookByCategory,
    getBookByName,

    addBook,
    addUser,
    deleteUser,
    
    getBookFilterByAuthorName_Category,

    updateBookCount,
 
    isAvailable,
    isPrime,

    uploadPic,

    placeOrder
}

