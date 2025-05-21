import express from 'express';
import {getStudents , createStudent} from '../controllers/studentControllers.js';
const router = express.Router();

router.route('/')
  .get(getStudents)
  .post(createStudent);

export default router;