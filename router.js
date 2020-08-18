const handler = require('./handler');

const Router = require('koa-router');

const router = new Router();

router.get('/book/filter', handler.filter);

router.get('/book/isAvailable', handler.isAvailable);

router.put('/book/placeOrder', handler.placeOrder);

router.post('/book', handler.addBook);


router.post('/user', handler.addUser);

router.delete('/user', handler.deleteUser);

router.get('/user/isPrime', handler.isPrime);


module.exports = router;