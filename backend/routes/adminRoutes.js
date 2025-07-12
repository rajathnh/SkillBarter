const express = require('express');
const router = express.Router();

const {
  authenticateUser,
  authorizePermissions,
} = require('../middleware/authentication');

const {
  getAllUsersForAdmin,
  toggleBanUser,
  getAllSwapsForAdmin,
  getAllSkillsForAdmin, // <-- IMPORT NEW CONTROLLER
  toggleSkillApproval,
} = require('../controllers/adminController');

// Chain the middleware: first check if user is logged in, then check if they are an ADMIN
router.use(authenticateUser, authorizePermissions('ADMIN'));

router.route('/users').get(getAllUsersForAdmin);
router.route('/users/:id/ban').patch(toggleBanUser);

router.route('/swaps').get(getAllSwapsForAdmin);

// --- START: ADDED SKILL MANAGEMENT ROUTES ---
router.route('/skills').get(getAllSkillsForAdmin);
router.route('/skills/:id/toggle-approval').patch(toggleSkillApproval);
// --- END: ADDED SKILL MANAGEMENT ROUTES ---

module.exports = router;