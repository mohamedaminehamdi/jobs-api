const express = require('express');
const router = express.Router();

const validate = require('../middleware/validate');
const schemas = require('../validators/jobs');
const { getAllJobs, getJob, createJob, updateJob, deleteJob } = require('../controllers/jobs');

router.route('/').get(getAllJobs).post(validate(schemas.create), createJob);
router.route('/:id').get(getJob).patch(validate(schemas.update), updateJob).delete(deleteJob);

module.exports = router;
