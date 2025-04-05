import { Request, Response } from 'express';
import { availabilityService } from '../services/availabilityService';

// Define the interfaces for our data
interface TechProfile {
  id: string;
  full_name?: string;
}

interface TechSchedule {
  technician_id: string;
  start_time: string;
  end_time: string;
  profiles: {
    id: string;
    full_name?: string;
  }; // Profiles is an object, not an array
}

/**
 * Get available technicians for a given date and time range
 * @route GET /api/availability
 */
export const getAvailableTechnicians = async (req: Request, res: Response) => {
  try {
    const { date, time, duration = '60' } = req.query;
    const companyId = (req as any).user.company_id;

    // Validate input
    if (!date || !time) {
      return res.status(400).json({ error: 'date and time parameters are required' });
    }

    // Parse duration to number
    const durationMinutes = parseInt(duration as string, 10);
    if (isNaN(durationMinutes) || durationMinutes <= 0) {
      return res.status(400).json({ error: 'duration must be a positive number' });
    }

    try {
      const availableTechs = await availabilityService.getAvailableTechnicians(
        companyId,
        date as string,
        time as string,
        durationMinutes
      );
      
      res.json(availableTechs);
    } catch (error: any) {
      if (error.message.includes('Invalid date format')) {
        return res.status(400).json({ error: error.message });
      }
      if (error.message.includes('Invalid time format')) {
        return res.status(400).json({ error: error.message });
      }
      throw error;
    }
  } catch (error: any) {
    console.error('Error finding available technicians:', error);
    res.status(500).json({
      error: 'Failed to find available technicians',
      details: error.message
    });
  }
};

/**
 * Check if a specific technician is available during a time period
 * @route GET /api/technicians/:id/availability
 */
export const checkTechnicianAvailability = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { start, end } = req.query;
    const companyId = (req as any).user.company_id;

    // Validate input
    if (!start || !end) {
      return res.status(400).json({ error: 'start and end parameters are required (format: YYYY-MM-DDTHH:MM:SS)' });
    }

    try {
      const availabilityResult = await availabilityService.checkTechnicianAvailability(
        id,
        companyId,
        start as string,
        end as string
      );
      
      res.json(availabilityResult);
    } catch (error: any) {
      if (error.message === 'Technician not found or access denied') {
        return res.status(404).json({ error: error.message });
      }
      if (error.message.includes('Invalid date format')) {
        return res.status(400).json({ error: error.message });
      }
      if (error.message === 'End date must be after start date') {
        return res.status(400).json({ error: error.message });
      }
      throw error;
    }
  } catch (error: any) {
    console.error('Error checking technician availability:', error);
    res.status(500).json({
      error: 'Failed to check technician availability',
      details: error.message
    });
  }
};

/**
 * Find the next available time slot for a technician
 * @route GET /api/technicians/:id/next-available
 */
export const findNextAvailableSlot = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { start_date, duration = '60', days_to_search = '7' } = req.query;
    const companyId = (req as any).user.company_id;

    // Validate input
    if (!start_date) {
      return res.status(400).json({ error: 'start_date parameter is required (format: YYYY-MM-DD)' });
    }

    // Parse parameters
    const durationMinutes = parseInt(duration as string, 10);
    if (isNaN(durationMinutes) || durationMinutes <= 0) {
      return res.status(400).json({ error: 'duration must be a positive number' });
    }

    const daysToSearch = parseInt(days_to_search as string, 10);
    if (isNaN(daysToSearch) || daysToSearch <= 0 || daysToSearch > 30) {
      return res.status(400).json({ error: 'days_to_search must be a positive number and not exceed 30' });
    }

    try {
      const nextSlot = await availabilityService.findNextAvailableSlot(
        id,
        companyId,
        start_date as string,
        durationMinutes,
        daysToSearch
      );
      
      // Return not found if no slot available
      if (!nextSlot) {
        return res.status(404).json({ 
          error: 'No available time slots found',
          searchParams: {
            start_date,
            duration: durationMinutes,
            days_searched: daysToSearch
          }
        });
      }
      
      res.json(nextSlot);
    } catch (error: any) {
      if (error.message === 'Technician not found or access denied') {
        return res.status(404).json({ error: error.message });
      }
      if (error.message.includes('Invalid date format')) {
        return res.status(400).json({ error: error.message });
      }
      throw error;
    }
  } catch (error: any) {
    console.error('Error finding next available slot:', error);
    res.status(500).json({
      error: 'Failed to find next available slot',
      details: error.message
    });
  }
};

/**
 * Helper function to add minutes to a time string (HH:MM)
 */
function addMinutesToTime(timeString: string, minutes: number): string {
  const [hours, mins] = timeString.split(':').map(Number);
  let totalMinutes = hours * 60 + mins + minutes;
  
  const newHours = Math.floor(totalMinutes / 60) % 24;
  const newMinutes = totalMinutes % 60;
  
  return `${newHours.toString().padStart(2, '0')}:${newMinutes.toString().padStart(2, '0')}`;
} 