import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '../ui/alert';
import { format } from 'date-fns';

interface TimeOffEntry {
  id?: string;
  start_datetime: string;
  end_datetime: string;
  reason?: string;
}

interface TimeOffFormProps {
  technicianId: string;
  initialData?: TimeOffEntry;
  onSubmit: (data: TimeOffEntry) => void;
  onCancel: () => void;
  isLoading?: boolean;
  error?: string | null;
}

const TimeOffForm: React.FC<TimeOffFormProps> = ({
  technicianId,
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
  error = null,
}) => {
  // Get tomorrow and a week from now for default values if no initial data
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(9, 0, 0, 0);
  
  const nextWeek = new Date(tomorrow);
  nextWeek.setDate(nextWeek.getDate() + 7);
  
  const formatDateTimeForInput = (date: Date): string => {
    return format(date, "yyyy-MM-dd'T'HH:mm");
  };

  const [timeOffData, setTimeOffData] = useState<TimeOffEntry>(
    initialData || {
      start_datetime: formatDateTimeForInput(tomorrow),
      end_datetime: formatDateTimeForInput(nextWeek),
      reason: '',
    }
  );
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTimeOffData(prev => ({ ...prev, [name]: value }));
    setValidationError(null);
  };

  const validateForm = (): boolean => {
    // Reset validation error
    setValidationError(null);
    
    const startDate = new Date(timeOffData.start_datetime);
    const endDate = new Date(timeOffData.end_datetime);
    
    // Check if dates are valid
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      setValidationError('Please enter valid dates and times');
      return false;
    }
    
    // Check if end date is after start date
    if (startDate >= endDate) {
      setValidationError('End date/time must be after start date/time');
      return false;
    }
    
    // Check if start date is in the future
    const now = new Date();
    if (startDate < now) {
      setValidationError('Start date/time must be in the future');
      return false;
    }
    
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    onSubmit(timeOffData);
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>
          {initialData ? 'Edit Time Off' : 'Request Time Off'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="start_datetime">Start Date & Time</Label>
            <Input
              id="start_datetime"
              name="start_datetime"
              type="datetime-local"
              value={timeOffData.start_datetime}
              onChange={handleChange}
              required
              disabled={isLoading}
              className="w-full"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="end_datetime">End Date & Time</Label>
            <Input
              id="end_datetime"
              name="end_datetime"
              type="datetime-local"
              value={timeOffData.end_datetime}
              onChange={handleChange}
              required
              disabled={isLoading}
              className="w-full"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="reason">Reason (Optional)</Label>
            <Textarea
              id="reason"
              name="reason"
              value={timeOffData.reason || ''}
              onChange={handleChange}
              disabled={isLoading}
              placeholder="Vacation, sick leave, appointment, etc."
              className="min-h-[100px]"
            />
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
              {isLoading ? 'Saving...' : (initialData ? 'Update Time Off' : 'Request Time Off')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default TimeOffForm; 