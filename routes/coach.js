const express = require('express');
const router = express.Router();
const upload = require('../middleware/multer');
const {
  getAllCoaches,
  getCoachById,
  createCoach,
  updateCoach,
  deleteCoach
} = require('../controllers/coach');

router.get('/', getAllCoaches);
router.get('/:id', getCoachById);
router.post('/', upload.single('photo'), createCoach); 
router.put('/:id', upload.single('photo'), updateCoach);
router.delete('/:id', deleteCoach);

module.exports = router;