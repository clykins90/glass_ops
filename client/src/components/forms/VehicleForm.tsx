import React, { useState } from 'react';
import { Vehicle } from '../../types/vehicle';
import { vehicleApi } from '../../services/api';
import { useNavigate } from 'react-router-dom';

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
      customerId: customerId || 0,
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
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    // Handle number inputs
    if (type === 'number') {
      setFormData((prev) => ({ ...prev, [name]: parseInt(value, 10) || 0 }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
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
    
    if (!formData.year || formData.year < 1900 || formData.year > new Date().getFullYear() + 1) {
      newErrors.year = 'Please enter a valid year';
    }
    
    // VIN validation (basic format check)
    if (formData.vinNumber && formData.vinNumber.length !== 17) {
      newErrors.vinNumber = 'VIN should be 17 characters';
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
    
    try {
      let vehicle;
      
      if (isEditing && initialData?.id) {
        vehicle = await vehicleApi.update(initialData.id, formData);
      } else {
        vehicle = await vehicleApi.create(formData);
      }
      
      if (onSuccess) {
        onSuccess(vehicle);
      } else {
        // Navigate to the vehicle detail page or back to the customer detail page
        if (customerId) {
          navigate(`/customers/${customerId}`);
        } else {
          navigate(`/vehicles/${vehicle.id}`);
        }
      }
    } catch (error) {
      console.error('Error saving vehicle:', error);
      setErrors((prev) => ({
        ...prev,
        form: 'Failed to save vehicle. Please try again.',
      }));
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Generate year options for the dropdown
  const currentYear = new Date().getFullYear();
  const yearOptions = [];
  for (let year = currentYear + 1; year >= 1980; year--) {
    yearOptions.push(year);
  }
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errors.form && (
        <div className="bg-red-50 p-4 rounded-md border border-red-200">
          <p className="text-red-700">{errors.form}</p>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Vehicle Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Vehicle Information</h3>
          
          <div>
            <label htmlFor="make" className="block text-sm font-medium text-gray-700">
              Make *
            </label>
            <input
              type="text"
              id="make"
              name="make"
              value={formData.make || ''}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md border ${
                errors.make ? 'border-red-300' : 'border-gray-300'
              } shadow-sm p-2 focus:border-blue-500 focus:ring-blue-500`}
            />
            {errors.make && (
              <p className="mt-1 text-sm text-red-600">{errors.make}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="model" className="block text-sm font-medium text-gray-700">
              Model *
            </label>
            <input
              type="text"
              id="model"
              name="model"
              value={formData.model || ''}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md border ${
                errors.model ? 'border-red-300' : 'border-gray-300'
              } shadow-sm p-2 focus:border-blue-500 focus:ring-blue-500`}
            />
            {errors.model && (
              <p className="mt-1 text-sm text-red-600">{errors.model}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="year" className="block text-sm font-medium text-gray-700">
              Year *
            </label>
            <select
              id="year"
              name="year"
              value={formData.year || currentYear}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md border ${
                errors.year ? 'border-red-300' : 'border-gray-300'
              } shadow-sm p-2 focus:border-blue-500 focus:ring-blue-500`}
            >
              {yearOptions.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
            {errors.year && (
              <p className="mt-1 text-sm text-red-600">{errors.year}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="color" className="block text-sm font-medium text-gray-700">
              Color
            </label>
            <input
              type="text"
              id="color"
              name="color"
              value={formData.color || ''}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm p-2 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>
        
        {/* Additional Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Additional Information</h3>
          
          <div>
            <label htmlFor="vinNumber" className="block text-sm font-medium text-gray-700">
              VIN Number
            </label>
            <input
              type="text"
              id="vinNumber"
              name="vinNumber"
              value={formData.vinNumber || ''}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md border ${
                errors.vinNumber ? 'border-red-300' : 'border-gray-300'
              } shadow-sm p-2 focus:border-blue-500 focus:ring-blue-500`}
            />
            {errors.vinNumber && (
              <p className="mt-1 text-sm text-red-600">{errors.vinNumber}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="licensePlate" className="block text-sm font-medium text-gray-700">
              License Plate
            </label>
            <input
              type="text"
              id="licensePlate"
              name="licensePlate"
              value={formData.licensePlate || ''}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm p-2 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label htmlFor="glassType" className="block text-sm font-medium text-gray-700">
              Glass Type
            </label>
            <select
              id="glassType"
              name="glassType"
              value={formData.glassType || ''}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm p-2 focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Select Glass Type</option>
              <option value="Laminated">Laminated</option>
              <option value="Tempered">Tempered</option>
              <option value="Acoustic">Acoustic</option>
              <option value="OEM">OEM</option>
              <option value="Aftermarket">Aftermarket</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
              Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={3}
              value={formData.notes || ''}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm p-2 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>
      
      <div className="flex justify-end space-x-3 pt-5">
        <button
          type="button"
          onClick={onCancel || (() => navigate(-1))}
          className="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : isEditing ? 'Update Vehicle' : 'Add Vehicle'}
        </button>
      </div>
    </form>
  );
};

export default VehicleForm; 