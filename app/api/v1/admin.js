const Router = require('koa-router')

const {
    RegisterValidator,
    UserLoginValidator
} = require('../../validators/user')

const {AdminDao} = require('../../dao/admin');
const {Auth} = require('../../../middlewares/auth');
const {LoginManager} = require('../../service/login');

const {Resolve} = require('../../lib/helper');
const res = new Resolve();

const AUTH_ADMIN = 16;

const router = new Router({
    prefix: '/v1/admin'
})

// 管理员注册
router.post('/register', async (ctx) => {

    // 通过验证器校验参数是否通过
    const v = await new RegisterValidator().validate(ctx);

    // 创建管理员
    await AdminDao.createAdmin(v);

    // 返回结果
    ctx.response.status = 200;
    ctx.body = res.success('注册成功');
})

// 管理登录
router.post('/login', async (ctx) => {

    const v = await new UserLoginValidator().validate(ctx);

    let token = await LoginManager.adminLogin(v.get('body.account'), v.get('body.secret'));

    ctx.response.status = 200;
    ctx.body = {
        msg: '登录成功',
        token
    }
});

// 获取用户信息
router.get('/info', new Auth(AUTH_ADMIN).m, async (ctx) => {

    // 获取用户ID
    const id = ctx.auth.uid;

    // 查询用户信息
    let userInfo = await UserDao.getUserInfo(id);

    // 返回结果
    ctx.response.status = 200;
    ctx.body = res.json(userInfo)
})

module.exports = router