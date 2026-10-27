const express = require('express');
const requireAuth = require('../middleware/auth');
const { requireAdmin } = require('../middleware/auth');
const { listResource, updateResourceStatus, deleteResource } = require('../controllers/admin.controller');

const router = express.Router();
router.use(requireAuth, requireAdmin);
router.get('/:resource', listResource);
router.patch('/:resource/:id/status', updateResourceStatus);
router.delete('/:resource/:id', deleteResource);

module.exports = router;
