import { useState } from 'react';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { 
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from '../ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '../ui/alert';

// Day of week options
const DAYS_OF_WEEK = [
  { value: '0', label: 'Sunday' },
  { value: '1', label: 'Monday' },
  { value: '2', label: 'Tuesday' },
  { value: '3', label: 'Wednesday' },
  { value: '4', label: 'Thursday' },
  { value: '5', label: 'Friday' },
  { value: '6', label: 'Saturday' },
];

// Time options in 30-minute intervals
const generateTimeOptions = () => {
  const options = [];
  for (let hour = 8; hour <= 18; hour++) {
    for (let minute of [0, 30]) {
      const formattedHour = hour.toString().padStart(2, '0');
      const formattedMinute = minute.toString().padStart(2, '0');
      const time = `${formattedHour}:${formattedMinute}`;
      const displayTime = new Date(`2000-01-01T${time}:00`).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
      options.push({ value: time, label: displayTime });
    }
  }
  return options;
};

const TIME_OPTIONS = generateTimeOptions();

interface ScheduleEntry {
  id?: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
}

interface TechnicianScheduleFormProps {
  technicianId: string;
  initialData?: ScheduleEntry;
  onSubmit: (data: ScheduleEntry) => void;
  onCancel: () => void;
  isLoading?: boolean;
  error?: string | null;
}

const TechnicianScheduleForm: React.FC<TechnicianScheduleFormProps> = ({
  technicianId,
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
  error = null,
}) => {
  const [scheduleData, setScheduleData] = useState<ScheduleEntry>(
    initialData || {
      day_of_week: 1, // Default to Monday
      start_time: '09:00', // Default to 9 AM
      end_time: '17:00', // Default to 5 PM
    }
  );
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleChange = (name: keyof ScheduleEntry, value: string) => {
    setScheduleData(prev => ({
      ...prev,
      [name]: name === 'day_of_week' ? parseInt(value, 10) : value,
    }));
    setValidationError(null);
  };

  const validateForm = (): boolean => {
    if (scheduleData.start_time >= scheduleData.end_time) {
      setValidationError('End time must be after start time');
      return false;
    }
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    onSubmit(scheduleData);
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>
          {initialData ? 'Edit Schedule Entry' : 'Add Schedule Entry'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="day_of_week">Day of Week</Label>
            <Select
              value={scheduleData.day_of_week.toString()}
              onValueChange={(value) => handleChange('day_of_week', value)}
              disabled={isLoading}
            >
              <SelectTrigger id="day_of_week">
                <SelectValue placeholder="Select day" />
              </SelectTrigger>
              <SelectContent>
                {DAYS_OF_WEEK.map((day) => (
                  <SelectItem key={day.value} value={day.value}>
                    {day.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label htmlFor="start_time">Start Time</Label>
            <Select
              value={scheduleData.start_time}
              onValueChange={(value) => handleChange('start_time', value)}
              disabled={isLoading}
            >
              <SelectTrigger id="start_time">
                <SelectValue placeholder="Select start time" />
              </SelectTrigger>
              <SelectContent>
                {TIME_OPTIONS.map((time) => (
                  <SelectItem key={time.value} value={time.value}>
                    {time.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label htmlFor="end_time">End Time</Label>
            <Select
              value={scheduleData.end_time}
              onValueChange={(value) => handleChange('end_time', value)}
              disabled={isLoading}
            >
              <SelectTrigger id="end_time">
                <SelectValue placeholder="Select end time" />
              </SelectTrigger>
              <SelectContent>
                {TIME_OPTIONS.map((time) => (
                  <SelectItem key={time.value} value={time.value}>
                    {time.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {(error || validationError) && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {validationError || error}
              </AlertDescription>
            </Alert>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <Button 
              type="button" 
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : (initialData ? 'Update Schedule' : 'Add Schedule')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default TechnicianScheduleForm; 