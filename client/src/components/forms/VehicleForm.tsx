import React, { useState } from 'react';
import { Vehicle } from '../../types/vehicle';
import { vehicleApi } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { AlertCircle } from 'lucide-react';

interface VehicleFormProps {
  initialData?: Vehicle;
  customerId?: number;
  onSuccess?: (vehicle: Vehicle) => void;
  onCancel?: () => void;
}

const VehicleForm: React.FC<VehicleFormProps> = ({
  initialData,
  customerId,
  onSuccess,
  onCancel,
}) => {
  const isEditing = !!initialData;
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState<Partial<Vehicle>>(
    initialData || {
      customerId: customerId,
      make: '',
      model: '',
      year: new Date().getFullYear(),
      color: '',
      vinNumber: '',
      licensePlate: '',
      glassType: '',
      notes: '',
    }
  );
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when field is edited
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Specific handler for Select component (Year)
  const handleYearChange = (value: string) => {
    const yearNum = parseInt(value, 10);
    setFormData((prev) => ({ ...prev, year: isNaN(yearNum) ? undefined : yearNum }));
     if (errors.year) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.year;
        return newErrors;
      });
    }
  };
  
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.make?.trim()) {
      newErrors.make = 'Make is required';
    }
    if (!formData.model?.trim()) {
      newErrors.model = 'Model is required';
    }
    if (!formData.year || formData.year < 1900 || formData.year > new Date().getFullYear() + 2) { // Allow next year + 1
      newErrors.year = 'Please enter a valid year';
    }
    if (formData.vinNumber && formData.vinNumber.length !== 17) {
      newErrors.vinNumber = 'VIN must be 17 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    
    setIsSubmitting(true);

    // Prepare data
    const dataToSave: Partial<Vehicle> = { ...formData }; 

    try {
      let savedVehicle: Vehicle;
      
      if (isEditing && initialData?.id) {
        const vehicleId = typeof initialData.id === 'string' ? parseInt(initialData.id, 10) : initialData.id;
        if (!vehicleId || isNaN(vehicleId)) {
           throw new Error("Invalid Vehicle ID for update.");
        }

        // Ensure customerId is number | undefined before creating updateData
        let customerIdNum: number | undefined = undefined;
        if (dataToSave.customerId !== undefined) {
            customerIdNum = typeof dataToSave.customerId === 'string' 
                              ? parseInt(dataToSave.customerId, 10) 
                              : dataToSave.customerId;
            if (isNaN(customerIdNum)) {
                // Handle potential NaN - maybe throw error or set to undefined
                console.warn('Invalid customer ID found during update, removing.');
                customerIdNum = undefined; 
            }
        }

        // Create update payload, explicitly setting typed customerId
        const updateData: Partial<Vehicle> = {
          ...dataToSave,
          id: undefined, // Ensure id is not sent in update payload
          customerId: customerIdNum, // Use the cleaned number | undefined
        };

        // Remove any keys with undefined values to avoid sending them
        Object.keys(updateData).forEach(key => {
          if (updateData[key as keyof Partial<Vehicle>] === undefined) {
            delete updateData[key as keyof Partial<Vehicle>];
          }
        });

        savedVehicle = await vehicleApi.update(vehicleId, updateData) as Vehicle;
      } else {
        // Ensure customerId is present and a number for creation
        let customerIdNum: number | undefined = customerId; // Use prop first
        if (dataToSave.customerId !== undefined) { // Check form data too
             customerIdNum = typeof dataToSave.customerId === 'string' 
                              ? parseInt(dataToSave.customerId, 10) 
                              : dataToSave.customerId;
        }

        if (customerIdNum === undefined || isNaN(customerIdNum)) {
            throw new Error("Customer ID is required and must be a valid number to create a vehicle.");
        }

        const createData: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'> = {
           make: dataToSave.make || '', // Ensure required fields are present
           model: dataToSave.model || '',
           year: dataToSave.year || new Date().getFullYear(),
           customerId: customerIdNum,
           color: dataToSave.color,
           vinNumber: dataToSave.vinNumber,
           licensePlate: dataToSave.licensePlate,
           glassType: dataToSave.glassType,
           notes: dataToSave.notes,
        };

        savedVehicle = await vehicleApi.create(createData) as Vehicle; 
      }
      
      if (onSuccess) {
        onSuccess(savedVehicle);
      } else {
        // Default navigation
        navigate(`/vehicles/${savedVehicle.id}`);
      }
    } catch (error) {
      console.error('Error saving vehicle:', error);
      setErrors((prev) => ({
        ...prev,
        form: error instanceof Error ? error.message : 'Failed to save vehicle. Please try again.',
      }));
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Generate year options
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 50 }, (_, i) => currentYear + 1 - i); // ~50 years back + next year
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errors.form && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{errors.form}</AlertDescription>
        </Alert>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
        {/* Vehicle Information */} 
        <div className="space-y-4 md:col-span-1">
          <h3 className="text-lg font-medium text-foreground">Vehicle Information</h3>
          
          <div className="space-y-1">
            <Label htmlFor="make">Make *</Label>
            <Input
              id="make"
              name="make"
              value={formData.make || ''}
              onChange={handleChange}
              className={errors.make ? 'border-destructive' : ''}
            />
            {errors.make && <p className="text-sm text-destructive">{errors.make}</p>}
          </div>
          
          <div className="space-y-1">
            <Label htmlFor="model">Model *</Label>
            <Input
              id="model"
              name="model"
              value={formData.model || ''}
              onChange={handleChange}
              className={errors.model ? 'border-destructive' : ''}
            />
            {errors.model && <p className="text-sm text-destructive">{errors.model}</p>}
          </div>
          
          <div className="space-y-1">
            <Label htmlFor="year">Year *</Label>
            {/* Use Select component for Year */} 
            <Select 
              name="year"
              value={formData.year?.toString() ?? ''} 
              onValueChange={handleYearChange}
            >
              <SelectTrigger className={errors.year ? 'border-destructive' : ''}>
                <SelectValue placeholder="Select year" />
              </SelectTrigger>
              <SelectContent>
                {yearOptions.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.year && <p className="text-sm text-destructive">{errors.year}</p>}
          </div>
          
          <div className="space-y-1">
            <Label htmlFor="color">Color</Label>
            <Input
              id="color"
              name="color"
              value={formData.color || ''}
              onChange={handleChange}
            />
          </div>
        </div>
        
        {/* Additional Information */}
        <div className="space-y-4 md:col-span-1">
          <h3 className="text-lg font-medium text-foreground">Additional Information</h3>
          
          <div className="space-y-1">
            <Label htmlFor="vinNumber">VIN Number</Label>
            <Input
              id="vinNumber"
              name="vinNumber"
              value={formData.vinNumber || ''}
              onChange={handleChange}
              maxLength={17} // Add maxLength for VIN
              className={errors.vinNumber ? 'border-destructive' : ''}
            />
            {errors.vinNumber && <p className="text-sm text-destructive">{errors.vinNumber}</p>}
          </div>
          
          <div className="space-y-1">
            <Label htmlFor="licensePlate">License Plate</Label>
            <Input
              id="licensePlate"
              name="licensePlate"
              value={formData.licensePlate || ''}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="glassType">Glass Type</Label>
            <Input
              id="glassType"
              name="glassType"
              placeholder="e.g., Windshield, Driver Side Window"
              value={formData.glassType || ''}
              onChange={handleChange}
            />
          </div>

        </div>

        {/* Notes - Spanning full width */}
        <div className="md:col-span-2 space-y-1">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            name="notes"
            placeholder="Any relevant notes about the vehicle..."
            value={formData.notes || ''}
            onChange={handleChange}
            rows={4}
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3 pt-6">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel || (() => navigate(-1))}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : (isEditing ? 'Update Vehicle' : 'Add Vehicle')}
        </Button>
      </div>
    </form>
  );
};

export default VehicleForm; 