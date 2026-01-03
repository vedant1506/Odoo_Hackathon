const express = require('express');
const { 
  getEmployees,
  getEmployeeByEmployeeId,
  getProfile, 
  updateProfile,
  adminUpdateEmployee,
  updateEmployeeSalaryByEmployeeId,
  changePassword,
  deleteUser,
  uploadProfilePicture,
  uploadDocument,
  deleteDocument
} = require('../controllers/userController');
const { auth, adminOnly, hrOrAdmin } = require('../middleware/auth');

const router = express.Router();

router.get('/employees', auth, getEmployees);
router.get('/employees/:employeeId', auth, getEmployeeByEmployeeId);
router.put('/employees/:employeeId/salary', auth, hrOrAdmin, updateEmployeeSalaryByEmployeeId);
router.get('/profile', auth, getProfile);
router.put('/profile', auth, updateProfile);
router.put('/employee/:employeeId', auth, adminOnly, adminUpdateEmployee);
router.put('/change-password', auth, changePassword);
router.post('/upload-profile-picture', auth, uploadProfilePicture);
router.post('/upload-document', auth, uploadDocument);
router.delete('/delete-document/:documentId', auth, deleteDocument);
router.delete('/:id', auth, adminOnly, deleteUser);

module.exports = router;
