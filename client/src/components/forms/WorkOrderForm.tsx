import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { customerApi, technicianApi } from '../../services/api';
import { WorkOrder } from '../../types/workOrder';
import { Customer } from '../../types/customer';
import { Vehicle } from '../../types/vehicle';
import { Profile } from '../../types/profile';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Checkbox } from '../ui/checkbox';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

interface WorkOrderFormProps {
  initialData?: Partial<WorkOrder>;
  onSubmit: (data: Partial<WorkOrder>) => Promise<void | WorkOrder>;
  onCancel: () => void;
  isSubmitting: boolean;
}

const WorkOrderForm: React.FC<WorkOrderFormProps> = ({
  initialData = {},
  onSubmit,
  onCancel,
  isSubmitting,
}) => {
  const [formData, setFormData] = useState<Partial<WorkOrder>>({
    customerId: initialData.customerId || undefined,
    vehicleId: initialData.vehicleId || undefined,
    technicianId: initialData.technicianId || undefined,
    serviceType: initialData.serviceType || '',
    glassLocation: initialData.glassLocation || '',
    materialsRequired: initialData.materialsRequired || '',
    materialsUsed: initialData.materialsUsed || '',
    scheduledDate: initialData.scheduledDate ? new Date(initialData.scheduledDate).toISOString().split('T')[0] : '',
    completedDate: initialData.completedDate ? new Date(initialData.completedDate).toISOString().split('T')[0] : '',
    status: initialData.status || 'scheduled',
    price: initialData.price || undefined,
    paymentType: initialData.paymentType || '',
    paymentStatus: initialData.paymentStatus || '',
    insuranceClaim: initialData.insuranceClaim || false,
    insuranceInfo: initialData.insuranceInfo || '',
    warrantyInfo: initialData.warrantyInfo || '',
    notes: initialData.notes || '',
    estimated_duration_minutes: initialData.estimated_duration_minutes || 60,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: customers = [], isLoading: customersLoading } = useQuery<Customer[]>({
    queryKey: ['customers'],
    queryFn: customerApi.getAll,
  });

  const { data: customerVehicles = [], isLoading: vehiclesLoading } = useQuery<Vehicle[]>({
    queryKey: ['customerVehicles', formData.customerId],
    queryFn: () => customerApi.getVehicles(formData.customerId as number),
    enabled: !!formData.customerId && typeof formData.customerId === 'number' && formData.customerId > 0,
  });

  const { data: technicians = [], isLoading: techniciansLoading } = useQuery<Profile[]>({
    queryKey: ['technicianProfiles'],
    queryFn: technicianApi.getAll,
  });

  useEffect(() => {
    if (formData.customerId) {
      const currentVehicleExists = customerVehicles.some(v => v.id === formData.vehicleId);
      if (!currentVehicleExists && !vehiclesLoading) {
         setFormData((prev) => ({ ...prev, vehicleId: undefined }));
      }
    }
  }, [formData.customerId, customerVehicles, vehiclesLoading, formData.vehicleId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'price') {
        setFormData((prev) => ({ ...prev, [name]: value === '' ? undefined : parseFloat(value) }));
    } else if (name === 'estimated_duration_minutes') {
        setFormData((prev) => ({ ...prev, [name]: value === '' ? undefined : parseInt(value, 10) }));
    } else {
        setFormData((prev) => ({ ...prev, [name]: value }));
    }
    clearError(name);
  };

  const handleSelectChange = (name: keyof WorkOrder, value: string) => {
    let processedValue: string | number | undefined = value;
    
    // Handle the special "unassigned" value for technician
    if (name === 'technicianId' && value === 'unassigned') {
        processedValue = undefined;
    } else if (value === '') {
        // General handling for other empty string values if needed (though likely not)
         processedValue = undefined;
     } else if (name === 'customerId' || name === 'vehicleId' || name === 'technicianId') {
      // Parse numeric IDs (skip if it was already set to undefined for "unassigned")
      if (processedValue !== undefined) {
          processedValue = value ? parseInt(value, 10) : undefined;
      }
    } 

    setFormData((prev) => ({ ...prev, [name]: processedValue }));
    clearError(name);

    if (name === 'customerId') {
      setFormData((prev) => ({ ...prev, vehicleId: undefined }));
    }
  };

  const handleCheckboxChange = (name: keyof WorkOrder, checked: boolean | 'indeterminate') => {
    setFormData((prev) => ({ ...prev, [name]: !!checked }));
    clearError(name);
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    clearError(name);
  };

  const clearError = (fieldName: string) => {
    if (errors[fieldName]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.customerId) newErrors.customerId = 'Customer is required';
    if (!formData.serviceType) newErrors.serviceType = 'Service Type is required';
    if (!formData.glassLocation) newErrors.glassLocation = 'Glass Location is required';
    if (!formData.status) newErrors.status = 'Status is required';
    if (!formData.estimated_duration_minutes) newErrors.estimated_duration_minutes = 'Estimated Duration is required';
    else if (formData.estimated_duration_minutes < 1) newErrors.estimated_duration_minutes = 'Duration must be at least 1 minute';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    
    const dataToSubmit: Partial<WorkOrder> = {
        ...formData,
        customerId: formData.customerId ? Number(formData.customerId) : undefined,
        vehicleId: formData.vehicleId ? Number(formData.vehicleId) : undefined,
        technicianId: formData.technicianId,
        price: formData.price ? Number(formData.price) : undefined,
        estimated_duration_minutes: formData.estimated_duration_minutes ? Number(formData.estimated_duration_minutes) : 60,
    };

    if (isNaN(dataToSubmit.customerId as number)) dataToSubmit.customerId = undefined;
    if (isNaN(dataToSubmit.vehicleId as number)) dataToSubmit.vehicleId = undefined;
    if (isNaN(dataToSubmit.price as number)) dataToSubmit.price = undefined;
    if (isNaN(dataToSubmit.estimated_duration_minutes as number)) dataToSubmit.estimated_duration_minutes = 60;

    await onSubmit(dataToSubmit);
  };

  // Helper to format date value for input
  const formatDateForInput = (dateValue: string | Date | undefined): string => {
      if (!dateValue) return '';
      if (dateValue instanceof Date) {
          try {
              return dateValue.toISOString().split('T')[0];
          } catch (e) {
              return ''; // Handle invalid date object
          }
      }
      // Assume it's already a YYYY-MM-DD string if not a Date object
      return dateValue; 
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Customer and Vehicle</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="customerId">Customer *</Label>
              <Select 
                name="customerId"
                value={formData.customerId?.toString() || undefined} 
                onValueChange={(value) => handleSelectChange('customerId', value)}
                disabled={customersLoading}
              >
                <SelectTrigger className={errors.customerId ? 'border-destructive' : ''}>
                  <SelectValue placeholder="Select a customer" />
                </SelectTrigger>
                <SelectContent>
                  {customers
                    .filter(customer => customer.id != null && customer.id.toString() !== '')
                    .map((customer) => (
                      <SelectItem key={customer.id} value={customer.id.toString()}>
                        {customer.firstName} {customer.lastName}
                      </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.customerId && <p className="text-sm text-destructive">{errors.customerId}</p>}
            </div>

            <div className="space-y-1">
              <Label htmlFor="vehicleId">Vehicle</Label>
              <Select 
                name="vehicleId"
                value={formData.vehicleId?.toString() || undefined} 
                onValueChange={(value) => handleSelectChange('vehicleId', value)}
                disabled={!formData.customerId || vehiclesLoading || customerVehicles.length === 0}
              >
                <SelectTrigger className={errors.vehicleId ? 'border-destructive' : ''}>
                  <SelectValue placeholder={vehiclesLoading ? "Loading vehicles..." : "Select a vehicle"} />
                </SelectTrigger>
                <SelectContent>
                  {customerVehicles
                    .filter(vehicle => vehicle.id != null && vehicle.id.toString() !== '')
                    .map((vehicle) => (
                      <SelectItem key={vehicle.id} value={String(vehicle.id)}>
                        {vehicle.year} {vehicle.make} {vehicle.model} {vehicle.color ? `(${vehicle.color})` : ''}
                      </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.vehicleId && <p className="text-sm text-destructive">{errors.vehicleId}</p>}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Service Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="serviceType">Service Type *</Label>
              <Select 
                name="serviceType"
                value={formData.serviceType || undefined} 
                onValueChange={(value) => handleSelectChange('serviceType', value)}
              >
                <SelectTrigger className={errors.serviceType ? 'border-destructive' : ''}>
                  <SelectValue placeholder="Select service type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="replacement">Replacement</SelectItem>
                  <SelectItem value="repair">Repair</SelectItem>
                </SelectContent>
              </Select>
               {errors.serviceType && <p className="text-sm text-destructive">{errors.serviceType}</p>}
            </div>

            <div className="space-y-1">
              <Label htmlFor="glassLocation">Glass Location *</Label>
              <Select 
                name="glassLocation"
                value={formData.glassLocation || undefined}
                onValueChange={(value) => handleSelectChange('glassLocation', value)}
              >
                 <SelectTrigger className={errors.glassLocation ? 'border-destructive' : ''}>
                  <SelectValue placeholder="Select glass location" />
                </SelectTrigger>
                <SelectContent>
                    {/* <SelectItem value="test-location">Test Location</SelectItem> */}
                    <SelectItem value="windshield">Windshield</SelectItem>
                    <SelectItem value="rear window">Rear Window</SelectItem>
                    <SelectItem value="driver front">Driver Front Window</SelectItem>
                    <SelectItem value="driver rear">Driver Rear Window</SelectItem>
                    <SelectItem value="passenger front">Passenger Front Window</SelectItem>
                    <SelectItem value="passenger rear">Passenger Rear Window</SelectItem>
                    <SelectItem value="sunroof">Sunroof</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              {errors.glassLocation && <p className="text-sm text-destructive">{errors.glassLocation}</p>}
            </div>
          </div>

          <div className="space-y-1">
              <Label htmlFor="materialsRequired">Materials Required</Label>
              <Textarea
                id="materialsRequired"
                name="materialsRequired"
                rows={3}
                value={formData.materialsRequired || ''}
                onChange={handleChange}
                placeholder="List materials required for this service"
              />
          </div>
          
          <div className="space-y-1">
              <Label htmlFor="materialsUsed">Materials Used</Label>
              <Textarea
                id="materialsUsed"
                name="materialsUsed"
                rows={3}
                value={formData.materialsUsed || ''}
                onChange={handleChange}
                placeholder="List materials actually used during service"
              />
          </div>
        </CardContent>
      </Card>

      <Card>
         <CardHeader>
          <CardTitle>Scheduling & Status</CardTitle>
        </CardHeader>
         <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <Label htmlFor="status">Status *</Label>
              <Select 
                name="status"
                value={formData.status || undefined}
                onValueChange={(value) => handleSelectChange('status', value)}
              >
                 <SelectTrigger className={errors.status ? 'border-destructive' : ''}>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                    {/* <SelectItem value="test-status">Test Status</SelectItem> */}
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              {errors.status && <p className="text-sm text-destructive">{errors.status}</p>}
            </div>

            <div className="space-y-1">
              <Label htmlFor="scheduledDate">Scheduled Date</Label>
              <Input
                type="date"
                id="scheduledDate"
                name="scheduledDate"
                value={formatDateForInput(formData.scheduledDate)}
                onChange={handleDateChange}
                className={errors.scheduledDate ? 'border-destructive' : ''}
              />
              {errors.scheduledDate && <p className="text-sm text-destructive">{errors.scheduledDate}</p>}
            </div>

             <div className="space-y-1">
              <Label htmlFor="completedDate">Completed Date</Label>
              <Input
                type="date"
                id="completedDate"
                name="completedDate"
                value={formatDateForInput(formData.completedDate)}
                onChange={handleDateChange}
                className={errors.completedDate ? 'border-destructive' : ''}
              />
               {errors.completedDate && <p className="text-sm text-destructive">{errors.completedDate}</p>}
            </div>

             <div className="space-y-1">
              <Label htmlFor="estimated_duration_minutes">Estimated Duration (minutes) *</Label>
              <Input
                type="number"
                id="estimated_duration_minutes"
                name="estimated_duration_minutes"
                value={formData.estimated_duration_minutes?.toString() || '60'}
                onChange={handleChange}
                min="1"
                className={errors.estimated_duration_minutes ? 'border-destructive' : ''}
              />
              {errors.estimated_duration_minutes && (
                <p className="text-sm text-destructive">{errors.estimated_duration_minutes}</p>
              )}
            </div>

             <div className="space-y-1 md:col-span-3">
              <Label htmlFor="technicianId">Assigned Technician</Label>
              <Select 
                name="technicianId"
                value={formData.technicianId?.toString() || undefined} 
                onValueChange={(value) => handleSelectChange('technicianId', value)}
                disabled={techniciansLoading}
              >
                <SelectTrigger className={errors.technicianId ? 'border-destructive' : ''}>
                  <SelectValue placeholder={techniciansLoading ? "Loading technicians..." : "Assign a technician"} />
                </SelectTrigger>
                <SelectContent>
                    {/* Removed log */}
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                   {technicians
                    .filter(tech => tech.id != null && tech.id.toString() !== '')
                    .map((tech) => {
                        // Removed log
                        return (
                            <SelectItem key={tech.id} value={tech.id.toString()}>
                                {tech.full_name} {/* Use full_name */} 
                            </SelectItem>
                        );
                    })}
                </SelectContent>
              </Select>
               {errors.technicianId && <p className="text-sm text-destructive">{errors.technicianId}</p>}
            </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Billing</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
           <div className="space-y-1">
              <Label htmlFor="price">Price ($)</Label>
              <Input
                type="number"
                id="price"
                name="price"
                value={formData.price?.toString() || ''}
                onChange={handleChange}
                min="0"
                step="0.01"
                placeholder="Enter price"
                className={errors.price ? 'border-destructive' : ''}
              />
              {errors.price && <p className="text-sm text-destructive">{errors.price}</p>}
            </div>
           <div className="space-y-1">
              <Label htmlFor="paymentType">Payment Type</Label>
              <Select 
                name="paymentType"
                value={formData.paymentType || undefined}
                onValueChange={(value) => handleSelectChange('paymentType', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select payment type" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="credit">Credit Card</SelectItem>
                    <SelectItem value="check">Check</SelectItem>
                    <SelectItem value="insurance">Insurance</SelectItem>
                </SelectContent>
              </Select>
            </div>
             <div className="space-y-1">
              <Label htmlFor="paymentStatus">Payment Status</Label>
              <Select 
                name="paymentStatus"
                value={formData.paymentStatus || undefined}
                onValueChange={(value) => handleSelectChange('paymentStatus', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select payment status" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>
            </div>
             <div className="flex items-center space-x-2 md:col-span-3">
               <Checkbox 
                id="insuranceClaim"
                name="insuranceClaim"
                checked={!!formData.insuranceClaim}
                onCheckedChange={(checked) => handleCheckboxChange('insuranceClaim', checked)}
              />
              <Label htmlFor="insuranceClaim" className="font-medium">Insurance Claim?</Label>
            </div>
             {formData.insuranceClaim && (
              <div className="md:col-span-3 space-y-1">
                <Label htmlFor="insuranceInfo">Insurance Info</Label>
                <Textarea
                  id="insuranceInfo"
                  name="insuranceInfo"
                  rows={3}
                  value={formData.insuranceInfo || ''}
                  onChange={handleChange}
                  placeholder="Claim number, provider, deductible, etc."
                />
              </div>
            )}
        </CardContent>
      </Card>

      <Card>
         <CardHeader>
          <CardTitle>Other Information</CardTitle>
        </CardHeader>
         <CardContent className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="warrantyInfo">Warranty Info</Label>
              <Textarea
                id="warrantyInfo"
                name="warrantyInfo"
                rows={3}
                value={formData.warrantyInfo || ''}
                onChange={handleChange}
                placeholder="Details about warranty provided, if any..."
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="notes">Internal Notes</Label>
              <Textarea
                id="notes"
                name="notes"
                rows={4}
                value={formData.notes || ''}
                onChange={handleChange}
                placeholder="Any internal notes about this work order..."
              />
            </div>
        </CardContent>
      </Card>

      <div className="flex justify-end space-x-3 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : (initialData && initialData.id ? 'Update Work Order' : 'Create Work Order')}
        </Button>
      </div>

    </form>
  );
};

export default WorkOrderForm; 