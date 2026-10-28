import { Router } from 'express';
import * as contactController from '../controllers/contactController.js';
import { protect } from '../middleware/authMiddleware.js';
import { checkOwnership } from '../middleware/roleMiddleware.js';
import { validate } from '../middleware/validateMiddleware.js';
import Contact from '../models/Contact.js';
import {
  createContactSchema,
  updateContactSchema,
  getContactsQuerySchema,
} from '../validators/contactValidator.js';

const router = Router();

router.use(protect);

router
  .route('/')
  .get(validate(getContactsQuerySchema), contactController.getContacts)
  .post(validate(createContactSchema), contactController.createContact);

router
  .route('/:id')
  .get(contactController.getContactById)
  .put(checkOwnership(Contact), validate(updateContactSchema), contactController.updateContact)
  .delete(checkOwnership(Contact), contactController.deleteContact);

export default router;
