const Koa = require('koa');
const koaBody = require('koa-body');

const app = new Koa();
const router = require('./router');

app.use(require('koa-body')());
app.use(koaBody({ multipart: true, json: true }));
app.use(router.allowedMethods());
app.use(router.routes());

app.listen(3000,() => console.log("Server started.."));