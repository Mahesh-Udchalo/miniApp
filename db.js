const Book = require('./schema/bookSchema')
const User = require('./schema/userSchema')

function basicFilter(ind, param){

    return new Promise((resolve, reject) => {
        Book.query(param)
            .usingIndex(ind)
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
}


function mixFilter(authorName, category){
    
    return new Promise((resolve, reject) => {
        Book.query(authorName)
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
}

function isAvailable(authorName, bookName){

    return new Promise((resolve, reject) => {
        Book.query(authorName)
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
}

function isPrime(userId){

    return new Promise((resolve, reject) => {
        User.query(userId)
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
}

function updateBookCount(authorName, bookName){
    
    return new Promise((resolve, reject) => {
        Book.query(authorName)
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
}


function decreaseBookCount(id, count){
    return new Promise((resolve, reject) => {
        Book.update({bookId: id, bookCount: count }, 
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

function validateBook(bookid){

    return new Promise((resolve, reject) => {
        Book.get(bookid,(err, res)=>{
            if(err){
                reject(err)
            } 
            if(res){
                data=JSON.parse(JSON.stringify(res));
                resolve(data);
            }
            resolve(null);
            })
        })

}

function validateUser(userid){

    return new Promise((resolve, reject) => {
        User.get(userid,(err, res)=>{
            if(err){
                reject(err)
            } 
            if(res){
                data=JSON.parse(JSON.stringify(res));
                resolve(data);
            }
            resolve(null);
            })
        })
}

function validatedPlaceOrder(bookid, userid){

    return new Promise( async (resolve) => {
        await decreaseCount(bookid).then(
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
            console.log(err)           
        })
})
}

function decreaseCount(bookid){

    return new Promise((resolve, reject) => {
            Book.get(bookid,(err, res)=>{
                if(err){
                    reject(err)
                } 
                if(res){
                        let oldcount = res.get('bookCount');
                        if(oldcount > 0 )
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
             Book.update({'bookId': bookid,'bookCount': count},(err, res) =>{
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
             User.get(userid, (err, res)=>{
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
             User.update({"userId":userid,"issuedBook":issuedBook } ,(err, res)=>{
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

function addBook(book, bookUrl){
    
    return new Promise((resolve, reject) => {
        Book.create(
            {
                bookId : book.bookId.trim() ,
                bookName : book.bookName.trim() , 
                authorName : book.authorName.trim() ,
                category : book.category.trim() ,
                bookPrice : book.bookPrice.trim() ,
                bookDescription : book.bookDescription.trim() ,
                bookCount : book.bookCount.trim() ,
                bookUrl : bookUrl.trim() 
            },
            (err, res) => {
                if(err){
                    const firstWord = err.details[0].message.split(" ")
                    console.log(firstWord[0])
                    reject(firstWord[0]+" should be valid !");      
                }
                if(res){
                    const data=JSON.parse(JSON.stringify(res));
                    resolve(data);    
                }
                resolve(null);
            }
        );
        })
}

function addUser(user){

    return new Promise((resolve, reject) => {
        User.create(
            {
                userId : user.userId.trim() ,
                userName : user.userName.trim() , 
                isPrimeMember : user.isPrimeMember ,
                walletAmount : user.walletAmount ,
                issuedBook : user.issuedBook 
            },
            (err, res) => {
                if(err){
                    let arr1 = err.details[0].message;
                    let arr2 = arr1.split('"') ;              
                    reject(arr2[1] +" is in incorrect form plz enter valid "+ arr2[1]);
                }
                if(res){
                    const data=JSON.parse(JSON.stringify(res));
                    resolve(data);    
                }
                resolve(null);
            }
        );
        })

}

function deleteUser(userId){

    return new Promise((resolve, reject) => {

        User.get(userId,(err, res) => {
           if(res){
                User.destroy(userId, (err) => {
                    if(err){
                    reject(err);
                    }
                    else{
                    msg = "User deleted";
                    resolve(msg);
                    }
                });
            }
            else if(err)
            {
                console.log(err)
                reject(err)
            }
            else
            {
                resolve("Userid is not available")
            }

    })
    })
}


module.exports = {

    basicFilter,
    mixFilter,
    isAvailable,
    isPrime,

    decreaseBookCount,
    updateBookCount,

    validateBook,
    validateUser,
    validatedPlaceOrder,

    addBook,
    addUser,
    deleteUser

}