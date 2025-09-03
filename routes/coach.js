const express = require('express');
const router = express.Router();
const {upload,handleMulterError } = require('../middleware/multer');
const {
  getAllCoaches,
  getCoachById,
  createCoach,
  updateCoach,
  deleteCoach
} = require('../controllers/coach');

router.get('/', getAllCoaches);
router.get('/:id', getCoachById);
router.post('/', upload.single('photo'),handleMulterError, createCoach); 
router.put('/:id', upload.single('photo'),handleMulterError, updateCoach);
router.delete('/:id', deleteCoach);

module.exports = router;