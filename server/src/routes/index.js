import { Router } from 'express';
import authRoutes from './authRoutes.js';
import contactRoutes from './contactRoutes.js';
import companyRoutes from './companyRoutes.js';
import dealRoutes from './dealRoutes.js';
import taskRoutes from './taskRoutes.js';
import noteRoutes from './noteRoutes.js';
import dashboardRoutes from './dashboardRoutes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/contacts', contactRoutes);
router.use('/companies', companyRoutes);
router.use('/deals', dealRoutes);
router.use('/tasks', taskRoutes);
router.use('/notes', noteRoutes);
router.use('/dashboard', dashboardRoutes);

export default router;
