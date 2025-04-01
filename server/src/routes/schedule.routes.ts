import express from 'express';
import { 
  getTechnicianSchedule, 
  addScheduleEntry, 
  updateScheduleEntry, 
  deleteScheduleEntry 
} from '../controllers/schedule.controller';
import { 
  getTechnicianTimeOff,
  addTimeOffEntry,
  updateTimeOffEntry,
  deleteTimeOffEntry
} from '../controllers/timeOff.controller';
import { 
  getAvailableTechnicians,
  checkTechnicianAvailability,
  findNextAvailableSlot
} from '../controllers/availability.controller';
import { expandIdsMiddleware, shortenIdsMiddleware } from '../middleware/idMapping';

const router = express.Router();

// Authentication is already applied in the main router
// No need to add it again: router.use(authMiddleware);

// Apply ID mapping middleware to all routes
router.use(expandIdsMiddleware);
router.use(shortenIdsMiddleware());

// Schedule management routes
router.get('/technicians/:id/schedule', getTechnicianSchedule);
router.post('/technicians/:id/schedule', addScheduleEntry);
router.put('/technicians/:id/schedule/:scheduleId', updateScheduleEntry);
router.delete('/technicians/:id/schedule/:scheduleId', deleteScheduleEntry);

// Time off management routes
router.get('/technicians/:id/time-off', getTechnicianTimeOff);
router.post('/technicians/:id/time-off', addTimeOffEntry);
router.put('/technicians/:id/time-off/:timeOffId', updateTimeOffEntry);
router.delete('/technicians/:id/time-off/:timeOffId', deleteTimeOffEntry);

// Availability checking routes
router.get('/availability', getAvailableTechnicians);
router.get('/technicians/:id/availability', checkTechnicianAvailability);
router.get('/technicians/:id/next-available', findNextAvailableSlot);

export default router; 