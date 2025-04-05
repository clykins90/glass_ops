import { Request, Response } from 'express';
import { scheduleService } from '../services/scheduleService';

/**
 * Get a technician's schedule
 * @route GET /api/technicians/:id/schedule
 */
export const getTechnicianSchedule = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const companyId = (req as any).user.company_id;

    try {
      const schedules = await scheduleService.getTechnicianSchedule(id, companyId);
      res.json(schedules);
    } catch (error: any) {
      if (error.message === 'Technician not found or access denied') {
        return res.status(404).json({ error: error.message });
      }
      throw error;
    }
  } catch (error: any) {
    console.error('Error fetching technician schedule:', error);
    res.status(500).json({
      error: 'Failed to fetch technician schedule',
      details: error.message
    });
  }
};

/**
 * Add a schedule entry for a technician
 * @route POST /api/technicians/:id/schedule
 */
export const addScheduleEntry = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { day_of_week, start_time, end_time } = req.body;
    const companyId = (req as any).user.company_id;

    // Validate input
    if (day_of_week === undefined || start_time === undefined || end_time === undefined) {
      return res.status(400).json({ error: 'day_of_week, start_time, and end_time are required fields' });
    }

    try {
      const newSchedule = await scheduleService.addScheduleEntry(id, companyId, {
        day_of_week,
        start_time,
        end_time
      });
      res.status(201).json(newSchedule);
    } catch (error: any) {
      if (error.message === 'Technician not found or access denied') {
        return res.status(404).json({ error: error.message });
      }
      if (error.message === 'day_of_week must be between 0 (Sunday) and 6 (Saturday)') {
        return res.status(400).json({ error: error.message });
      }
      if (error.message === 'end_time must be after start_time') {
        return res.status(400).json({ error: error.message });
      }
      if (error.message === 'The new schedule overlaps with existing schedules') {
        return res.status(409).json({ error: error.message });
      }
      throw error;
    }
  } catch (error: any) {
    console.error('Error adding schedule entry:', error);
    res.status(500).json({
      error: 'Failed to add schedule entry',
      details: error.message
    });
  }
};

/**
 * Update a schedule entry
 * @route PUT /api/technicians/:id/schedule/:scheduleId
 */
export const updateScheduleEntry = async (req: Request, res: Response) => {
  try {
    const { id, scheduleId } = req.params;
    const { day_of_week, start_time, end_time } = req.body;
    const companyId = (req as any).user.company_id;

    // Validate input
    if (day_of_week === undefined && start_time === undefined && end_time === undefined) {
      return res.status(400).json({ error: 'At least one field (day_of_week, start_time, or end_time) is required' });
    }

    try {
      const updatedSchedule = await scheduleService.updateScheduleEntry(scheduleId, id, companyId, {
        day_of_week,
        start_time,
        end_time
      });
      res.json(updatedSchedule);
    } catch (error: any) {
      if (error.message === 'Schedule entry not found or access denied') {
        return res.status(404).json({ error: error.message });
      }
      if (error.message === 'day_of_week must be between 0 (Sunday) and 6 (Saturday)') {
        return res.status(400).json({ error: error.message });
      }
      if (error.message === 'end_time must be after start_time') {
        return res.status(400).json({ error: error.message });
      }
      if (error.message === 'The updated schedule overlaps with existing schedules') {
        return res.status(409).json({ error: error.message });
      }
      throw error;
    }
  } catch (error: any) {
    console.error('Error updating schedule entry:', error);
    res.status(500).json({
      error: 'Failed to update schedule entry',
      details: error.message
    });
  }
};

/**
 * Delete a schedule entry
 * @route DELETE /api/technicians/:id/schedule/:scheduleId
 */
export const deleteScheduleEntry = async (req: Request, res: Response) => {
  try {
    const { id, scheduleId } = req.params;
    const companyId = (req as any).user.company_id;

    try {
      await scheduleService.deleteScheduleEntry(scheduleId, id, companyId);
      res.status(204).send();
    } catch (error: any) {
      if (error.message === 'Schedule entry not found or access denied') {
        return res.status(404).json({ error: error.message });
      }
      throw error;
    }
  } catch (error: any) {
    console.error('Error deleting schedule entry:', error);
    res.status(500).json({
      error: 'Failed to delete schedule entry',
      details: error.message
    });
  }
}; 