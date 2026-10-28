import { Router } from 'express';
import * as dealController from '../controllers/dealController.js';
import { protect } from '../middleware/authMiddleware.js';
import { checkOwnership } from '../middleware/roleMiddleware.js';
import { validate } from '../middleware/validateMiddleware.js';
import Deal from '../models/Deal.js';
import {
  createDealSchema,
  updateDealSchema,
  updateDealStageSchema,
  getDealsQuerySchema,
} from '../validators/dealValidator.js';

const router = Router();

router.use(protect);

router
  .route('/')
  .get(validate(getDealsQuerySchema), dealController.getDeals)
  .post(validate(createDealSchema), dealController.createDeal);

router
  .route('/:id')
  .get(dealController.getDealById)
  .put(checkOwnership(Deal), validate(updateDealSchema), dealController.updateDeal)
  .delete(checkOwnership(Deal), dealController.deleteDeal);

router.patch(
  '/:id/stage',
  checkOwnership(Deal),
  validate(updateDealStageSchema),
  dealController.updateDealStage
);

export default router;
