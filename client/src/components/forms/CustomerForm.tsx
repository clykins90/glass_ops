import React, { useState } from 'react';
import { Customer } from '../../types/customer';
import { customerApi } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Checkbox } from '../ui/checkbox';
import { Button } from '../ui/button';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { AlertCircle } from 'lucide-react';

interface CustomerFormProps {
  initialData?: Customer;
  onSuccess?: (customer: Customer) => void;
  onCancel?: () => void;
}

const CustomerForm: React.FC<CustomerFormProps> = ({
  initialData,
  onSuccess,
  onCancel,
}) => {
  const isEditing = !!initialData;
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState<Partial<Customer>>(
    initialData || {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      isLead: false,
      notes: '',
      source: '',
    }
  );
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    // No need to check type for Checkbox, handled by onCheckedChange
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

  // Specific handler for checkbox
  const handleCheckboxChange = (checked: boolean | 'indeterminate') => {
    setFormData((prev) => ({ ...prev, isLead: !!checked }));
  };
  
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.firstName?.trim()) {
      newErrors.firstName = 'First name is required';
    }
    
    if (!formData.lastName?.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    
    if (!formData.phone?.trim()) {
      newErrors.phone = 'Phone number is required';
    }
    
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }
    
    setIsSubmitting(true);
    
    // Prepare data, ensuring ID is handled correctly for update
    const dataToSave: Partial<Customer> = {
      ...formData,
      // Ensure isLead is a boolean (it should be from handleCheckboxChange)
      isLead: !!formData.isLead, 
    };

    try {
      let customer: Customer;
      
      if (isEditing && initialData?.id) {
        // Ensure ID is a number for update
        const customerId = typeof initialData.id === 'string' ? parseInt(initialData.id, 10) : initialData.id;
        if (isNaN(customerId)) {
          throw new Error("Invalid Customer ID for update.");
        }
        customer = await customerApi.update(customerId, dataToSave) as Customer;
      } else {
        // Remove ID if present before creating
        const { id, ...createData } = dataToSave;
        customer = await customerApi.create(createData) as Customer;
      }
      
      if (onSuccess) {
        onSuccess(customer);
      } else {
        // Default navigation if no onSuccess provided
        navigate(`/customers/${customer.id}`);
      }
    } catch (error) {
      console.error('Error saving customer:', error);
      setErrors((prev) => ({
        ...prev,
        form: error instanceof Error ? error.message : 'Failed to save customer. Please try again.', // Show specific error
      }));
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errors.form && (
        // Use Alert component with destructive variant
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{errors.form}</AlertDescription>
        </Alert>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4"> {/* Adjusted gaps */} 
        {/* Personal Information */}
        <div className="space-y-4 md:col-span-1"> {/* Ensure column span */} 
          <h3 className="text-lg font-medium text-foreground">Personal Information</h3>
          
          <div className="space-y-1">
            <Label htmlFor="firstName">First Name *</Label>
            <Input
              id="firstName"
              name="firstName"
              value={formData.firstName || ''}
              onChange={handleChange}
              className={errors.firstName ? 'border-destructive' : ''} // Add error class
            />
            {errors.firstName && (
              <p className="text-sm text-destructive">{errors.firstName}</p>
            )}
          </div>
          
          <div className="space-y-1">
            <Label htmlFor="lastName">Last Name *</Label>
            <Input
              id="lastName"
              name="lastName"
              value={formData.lastName || ''}
              onChange={handleChange}
              className={errors.lastName ? 'border-destructive' : ''}
            />
            {errors.lastName && (
              <p className="text-sm text-destructive">{errors.lastName}</p>
            )}
          </div>
          
          <div className="space-y-1">
            <Label htmlFor="email">Email</Label>
            <Input
              type="email"
              id="email"
              name="email"
              value={formData.email || ''}
              onChange={handleChange}
              className={errors.email ? 'border-destructive' : ''}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email}</p>
            )}
          </div>
          
          <div className="space-y-1">
            <Label htmlFor="phone">Phone *</Label>
            <Input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone || ''}
              onChange={handleChange}
              className={errors.phone ? 'border-destructive' : ''}
            />
            {errors.phone && (
              <p className="text-sm text-destructive">{errors.phone}</p>
            )}
          </div>
        </div>
        
        {/* Address Information */}
        <div className="space-y-4 md:col-span-1"> {/* Ensure column span */} 
          <h3 className="text-lg font-medium text-foreground">Address Information</h3>
          
          <div className="space-y-1">
            <Label htmlFor="address">Street Address</Label>
            <Input
              id="address"
              name="address"
              value={formData.address || ''}
              onChange={handleChange}
            />
          </div>
          
          <div className="space-y-1">
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              name="city"
              value={formData.city || ''}
              onChange={handleChange}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                name="state"
                value={formData.state || ''}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="zipCode">Zip Code</Label>
              <Input
                id="zipCode"
                name="zipCode"
                value={formData.zipCode || ''}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        {/* Other Information - Spanning full width below */} 
        <div className="md:col-span-2 space-y-4">
           <h3 className="text-lg font-medium text-foreground">Other Information</h3>

           <div className="space-y-1">
            <Label htmlFor="source">Source</Label>
            <Input
              id="source"
              name="source"
              placeholder="e.g., Google, Referral, Walk-in"
              value={formData.source || ''}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              name="notes"
              placeholder="Any relevant notes about the customer..."
              value={formData.notes || ''}
              onChange={handleChange}
              rows={4}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox 
              id="isLead"
              name="isLead"
              checked={!!formData.isLead}
              onCheckedChange={handleCheckboxChange}
            />
            <Label htmlFor="isLead" className="font-medium">Mark as Lead</Label>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3 pt-6">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel || (() => navigate(-1))} // Use navigate(-1) as fallback
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : (isEditing ? 'Update Customer' : 'Add Customer')}
        </Button>
      </div>
    </form>
  );
};

export default CustomerForm; 