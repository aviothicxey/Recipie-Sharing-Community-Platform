const express = require('express');
const requireAuth = require('../middleware/auth');
const {
    listCreators, toggleFollow, getChannel, getOwnChannel, createChannel, updateChannel, postMessage,
    listComments, createComment
    , listNotifications, markNotificationsRead
} = require('../controllers/community.controller');

const router = express.Router();

router.get('/creators', requireAuth, listCreators);
router.get('/notifications', requireAuth, listNotifications);
router.post('/notifications/read', requireAuth, markNotificationsRead);
router.post('/creators/:id/follow', requireAuth, toggleFollow);
router.post('/channels', requireAuth, createChannel);
router.get('/channels/me', requireAuth, getOwnChannel);
router.get('/channels/:creatorId', requireAuth, getChannel);
router.put('/channel', requireAuth, updateChannel);
router.post('/channels/:creatorId/messages', requireAuth, postMessage);
router.get('/recipes/:recipeId/comments', listComments);
router.post('/recipes/:recipeId/comments', requireAuth, createComment);

module.exports = router;
