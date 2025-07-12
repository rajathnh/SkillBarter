const express = require('express');
const router = express.Router();
const {
  authenticateUser,
  // authorizePermissions, // Not needed here, but good to have for admin
} = require('../middleware/authentication');

const {
  getMyProfile,
  updateMyProfile,
  addMySkill,
  removeMySkill,
} = require('../controllers/profileController');

// All routes in this file are protected and require a logged-in user
router.use(authenticateUser);

router.route('/me').get(getMyProfile).patch(updateMyProfile);

router.route('/me/skills').post(addMySkill);
router.route('/me/skills/:skillId').delete(removeMySkill);

module.exports = router;