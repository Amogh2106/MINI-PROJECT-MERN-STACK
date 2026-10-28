import { Router } from 'express';
import * as companyController from '../controllers/companyController.js';
import { protect } from '../middleware/authMiddleware.js';
import { checkOwnership } from '../middleware/roleMiddleware.js';
import { validate } from '../middleware/validateMiddleware.js';
import Company from '../models/Company.js';
import {
  createCompanySchema,
  updateCompanySchema,
  getCompaniesQuerySchema,
} from '../validators/companyValidator.js';

const router = Router();

router.use(protect);

router
  .route('/')
  .get(validate(getCompaniesQuerySchema), companyController.getCompanies)
  .post(validate(createCompanySchema), companyController.createCompany);

router
  .route('/:id')
  .get(companyController.getCompanyById)
  .put(checkOwnership(Company), validate(updateCompanySchema), companyController.updateCompany)
  .delete(checkOwnership(Company), companyController.deleteCompany);

export default router;
