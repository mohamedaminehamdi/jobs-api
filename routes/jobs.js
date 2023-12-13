const express = require('express');
const router = express.Router();

const blockDemoUser = require('../middleware/demo-user');
const validate = require('../middleware/validate');
const schemas = require('../validators/jobs');
const {
  getAllJobs,
  getJob,
  createJob,
  updateJob,
  deleteJob,
  showStats,
  exportJobs,
} = require('../controllers/jobs');

router
  .route('/')
  .get(validate(schemas.list, 'query'), getAllJobs)
  .post(blockDemoUser, validate(schemas.create), createJob);
router.get('/stats', showStats);
router.get('/export', validate(schemas.list, 'query'), exportJobs);
router
  .route('/:id')
  .all(validate(schemas.params, 'params'))
  .get(getJob)
  .patch(blockDemoUser, validate(schemas.update), updateJob)
  .delete(blockDemoUser, deleteJob);

module.exports = router;
