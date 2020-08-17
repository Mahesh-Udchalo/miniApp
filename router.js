const handler = require('./handler');

const Router = require('koa-router');

const router = new Router();

router.get('/getBookByCategory/:category', handler.getBookByCategory);

router.get('/getBookByName/:bookName', handler.getBookByName);

router.get('/getBookByAuthorName/:authorName', handler.getBookByAuthorName);

router.get('/getBookFilterByAuthorName_Category/:authorName/:category', handler.getBookFilterByAuthorName_Category);

router.get('/updateBookCount/:bookName/:authorName', handler.updateBookCount);

router.get('/isAvailable/:authorName/:bookName', handler.isAvailable);

router.post('/uploadPic', handler.uploadPic);

router.post('/addBook', handler.addBook);

router.post('/addUser', handler.addUser);

router.get('/deleteUser/:userId', handler.deleteUser);

router.get('/placeOrder/:userId/:bookId', handler.placeOrder);

router.get('/isPrime/:userId', handler.isPrime);

module.exports = router;