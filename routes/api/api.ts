import express from 'express';
import { authorize_user, get_logout_user, post_login_user, post_refresh_token, } from '@controllers/authController';
import { get_get_user, post_create_user } from '@controllers/userController';
import { get_verification_code, put_reset_password } from '@controllers/passwordController'
import passport from 'passport';
import { CustomIRouter } from '@interfaces/routes.interface';
import * as savingsGroup from '@controllers/savingsGroupController';

const router: CustomIRouter = express.Router();

router.get('/', (req, res) => { res.json({ msg: 'Not yet implemented!!!' }) });

// Authentication Routes

router.get('/auth/logout', get_logout_user);

router.post('/auth/login', post_login_user);

router.post('/auth/refresh_token', post_refresh_token);

// User Routes

router.get('/user/userinfo', passport.authenticate('jwt', { session: false }), authorize_user, get_get_user);

router.post('/user/register', post_create_user);

// Password reset routes

router.get('/user/verification_code', get_verification_code);

router.put('/user/reset_password', put_reset_password);

// Savings Group Routes

router.get('/savings_group/all', savingsGroup.get_get_all_savings_group);

router.get('/savings_group/search', savingsGroup.get_search_savings_group);

router.get('/savings_group/:id', savingsGroup.get_get_savings_group_by_id);

router.get('/savings_group/:id/members', savingsGroup.get_get_all_savings_group_members);

router.post('/savings_group/create', savingsGroup.post_create_savings_group);

router.put('/savings_group/:id/add_member', savingsGroup.put_add_savings_group_member);

router.put('/savings_group/:id/remove_member', savingsGroup.put_remove_savings_group_member);

router.delete('/savings_group/:id/delete_savings_group', savingsGroup.delete_delete_savings_group);

router.post('/send_group_invitation', savingsGroup.post_send_group_invitation);

export default router;