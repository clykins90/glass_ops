import { Request, Response } from 'express';
import { scheduleService } from '../services/scheduleService';

/**
 * Get a technician's time off entries
 * @route GET /api/technicians/:id/time-off
 */
export const getTechnicianTimeOff = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { start_date, end_date } = req.query;
    const companyId = (req as any).user.company_id;

    const dateRange = {
      start_date: start_date as string | undefined,
      end_date: end_date as string | undefined
    };

    try {
      const timeOffEntries = await scheduleService.getTechnicianTimeOff(id, companyId, dateRange);
      res.json(timeOffEntries);
    } catch (error: any) {
      if (error.message === 'Technician not found or access denied') {
        return res.status(404).json({ error: error.message });
      }
      throw error;
    }
  } catch (error: any) {
    console.error('Error fetching technician time off:', error);
    res.status(500).json({
      error: 'Failed to fetch technician time off',
      details: error.message
    });
  }
};

/**
 * Add a time off entry for a technician
 * @route POST /api/technicians/:id/time-off
 */
export const addTimeOffEntry = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { start_datetime, end_datetime, reason } = req.body;
    const companyId = (req as any).user.company_id;

    // Validate input
    if (!start_datetime || !end_datetime) {
      return res.status(400).json({ error: 'start_datetime and end_datetime are required fields' });
    }

    try {
      const newTimeOff = await scheduleService.addTimeOffEntry(id, companyId, {
        start_datetime,
        end_datetime,
        reason
      });
      res.status(201).json(newTimeOff);
    } catch (error: any) {
      if (error.message === 'Technician not found or access denied') {
        return res.status(404).json({ error: error.message });
      }
      if (error.message.includes('Invalid date format')) {
        return res.status(400).json({ error: error.message });
      }
      if (error.message === 'end_datetime must be after start_datetime') {
        return res.status(400).json({ error: error.message });
      }
      if (error.message === 'The new time off period overlaps with existing time off') {
        return res.status(409).json({ error: error.message });
      }
      throw error;
    }
  } catch (error: any) {
    console.error('Error adding time off entry:', error);
    res.status(500).json({
      error: 'Failed to add time off entry',
      details: error.message
    });
  }
};

/**
 * Update a time off entry
 * @route PUT /api/technicians/:id/time-off/:timeOffId
 */
export const updateTimeOffEntry = async (req: Request, res: Response) => {
  try {
    const { id, timeOffId } = req.params;
    const { start_datetime, end_datetime, reason } = req.body;
    const companyId = (req as any).user.company_id;

    // Validate input - at least one field must be provided
    if (start_datetime === undefined && end_datetime === undefined && reason === undefined) {
      return res.status(400).json({ error: 'At least one field (start_datetime, end_datetime, or reason) is required' });
    }

    try {
      const updatedTimeOff = await scheduleService.updateTimeOffEntry(timeOffId, id, companyId, {
        start_datetime,
        end_datetime,
        reason
      });
      res.json(updatedTimeOff);
    } catch (error: any) {
      if (error.message === 'Time off entry not found or access denied') {
        return res.status(404).json({ error: error.message });
      }
      if (error.message.includes('Invalid date format')) {
        return res.status(400).json({ error: error.message });
      }
      if (error.message === 'end_datetime must be after start_datetime') {
        return res.status(400).json({ error: error.message });
      }
      if (error.message === 'The updated time off period overlaps with existing time off') {
        return res.status(409).json({ error: error.message });
      }
      throw error;
    }
  } catch (error: any) {
    console.error('Error updating time off entry:', error);
    res.status(500).json({
      error: 'Failed to update time off entry',
      details: error.message
    });
  }
};

/**
 * Delete a time off entry
 * @route DELETE /api/technicians/:id/time-off/:timeOffId
 */
export const deleteTimeOffEntry = async (req: Request, res: Response) => {
  try {
    const { id, timeOffId } = req.params;
    const companyId = (req as any).user.company_id;

    try {
      await scheduleService.deleteTimeOffEntry(timeOffId, id, companyId);
      res.status(204).send();
    } catch (error: any) {
      if (error.message === 'Time off entry not found or access denied') {
        return res.status(404).json({ error: error.message });
      }
      throw error;
    }
  } catch (error: any) {
    console.error('Error deleting time off entry:', error);
    res.status(500).json({
      error: 'Failed to delete time off entry',
      details: error.message
    });
  }
}; 