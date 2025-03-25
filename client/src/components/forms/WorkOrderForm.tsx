import React, { useState } from 'react';
import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { customerApi, vehicleApi, technicianApi } from '../../services/api';
import { WorkOrder } from '../../types/workOrder';

interface WorkOrderFormProps {
  initialData?: Partial<WorkOrder>;
  onSubmit: (data: Partial<WorkOrder>) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

const WorkOrderForm: React.FC<WorkOrderFormProps> = ({
  initialData = {},
  onSubmit,
  onCancel,
  isSubmitting,
}) => {
  // Form state
  const [formData, setFormData] = useState<Partial<WorkOrder>>({
    customerId: initialData.customerId || 0,
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
  });

  // Fetch customers for dropdown
  const { data: customers = [] } = useQuery({
    queryKey: ['customers'],
    queryFn: customerApi.getAll,
    refetchOnMount: true,
    staleTime: 0,
  });

  // Fetch vehicles for selected customer
  const { data: customerVehicles = [] } = useQuery({
    queryKey: ['customerVehicles', formData.customerId],
    queryFn: () => customerApi.getVehicles(formData.customerId as number),
    enabled: !!formData.customerId && formData.customerId > 0,
  });

  // Fetch technicians for dropdown
  const { data: technicians = [] } = useQuery({
    queryKey: ['technicians'],
    queryFn: technicianApi.getAll,
  });

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else if (name === 'price') {
      setFormData((prev) => ({ ...prev, [name]: value ? parseFloat(value) : undefined }));
    } else if (name === 'customerId' || name === 'vehicleId' || name === 'technicianId') {
      setFormData((prev) => ({ ...prev, [name]: value ? parseInt(value, 10) : undefined }));
      
      // Reset vehicleId when customer changes
      if (name === 'customerId') {
        setFormData((prev) => ({ ...prev, vehicleId: undefined }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Customer and Vehicle Section */}
      <div className="bg-white shadow sm:rounded-md">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900">Customer and Vehicle</h3>
          <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            {/* Customer Selection */}
            <div className="sm:col-span-3">
              <label htmlFor="customerId" className="block text-sm font-medium text-gray-700">
                Customer <span className="text-red-500">*</span>
              </label>
              <div className="mt-1">
                <select
                  id="customerId"
                  name="customerId"
                  value={formData.customerId || ''}
                  onChange={handleChange}
                  required
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                  <option value="">Select a customer</option>
                  {customers.map((customer: any) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.firstName} {customer.lastName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Vehicle Selection */}
            <div className="sm:col-span-3">
              <label htmlFor="vehicleId" className="block text-sm font-medium text-gray-700">
                Vehicle
              </label>
              <div className="mt-1">
                <select
                  id="vehicleId"
                  name="vehicleId"
                  value={formData.vehicleId || ''}
                  onChange={handleChange}
                  disabled={!formData.customerId || customerVehicles.length === 0}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                  <option value="">Select a vehicle</option>
                  {customerVehicles.map((vehicle: any) => (
                    <option key={vehicle.id} value={vehicle.id}>
                      {vehicle.year} {vehicle.make} {vehicle.model} {vehicle.color ? `(${vehicle.color})` : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Service Details Section */}
      <div className="bg-white shadow sm:rounded-md">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900">Service Details</h3>
          <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            {/* Service Type */}
            <div className="sm:col-span-3">
              <label htmlFor="serviceType" className="block text-sm font-medium text-gray-700">
                Service Type <span className="text-red-500">*</span>
              </label>
              <div className="mt-1">
                <select
                  id="serviceType"
                  name="serviceType"
                  value={formData.serviceType}
                  onChange={handleChange}
                  required
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                  <option value="">Select service type</option>
                  <option value="replacement">Replacement</option>
                  <option value="repair">Repair</option>
                </select>
              </div>
            </div>

            {/* Glass Location */}
            <div className="sm:col-span-3">
              <label htmlFor="glassLocation" className="block text-sm font-medium text-gray-700">
                Glass Location <span className="text-red-500">*</span>
              </label>
              <div className="mt-1">
                <select
                  id="glassLocation"
                  name="glassLocation"
                  value={formData.glassLocation}
                  onChange={handleChange}
                  required
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                  <option value="">Select glass location</option>
                  <option value="windshield">Windshield</option>
                  <option value="rear window">Rear Window</option>
                  <option value="driver front">Driver Front Window</option>
                  <option value="driver rear">Driver Rear Window</option>
                  <option value="passenger front">Passenger Front Window</option>
                  <option value="passenger rear">Passenger Rear Window</option>
                  <option value="sunroof">Sunroof</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            {/* Materials Required */}
            <div className="sm:col-span-6">
              <label htmlFor="materialsRequired" className="block text-sm font-medium text-gray-700">
                Materials Required
              </label>
              <div className="mt-1">
                <textarea
                  id="materialsRequired"
                  name="materialsRequired"
                  rows={3}
                  value={formData.materialsRequired || ''}
                  onChange={handleChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="List materials required for this service"
                />
              </div>
            </div>

            {/* Materials Used */}
            <div className="sm:col-span-6">
              <label htmlFor="materialsUsed" className="block text-sm font-medium text-gray-700">
                Materials Used
              </label>
              <div className="mt-1">
                <textarea
                  id="materialsUsed"
                  name="materialsUsed"
                  rows={3}
                  value={formData.materialsUsed || ''}
                  onChange={handleChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="List materials actually used during service"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scheduling Section */}
      <div className="bg-white shadow sm:rounded-md">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900">Scheduling</h3>
          <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            {/* Status */}
            <div className="sm:col-span-2">
              <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                Status <span className="text-red-500">*</span>
              </label>
              <div className="mt-1">
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  required
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                  <option value="scheduled">Scheduled</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            {/* Scheduled Date */}
            <div className="sm:col-span-2">
              <label htmlFor="scheduledDate" className="block text-sm font-medium text-gray-700">
                Scheduled Date
              </label>
              <div className="mt-1">
                <input
                  type="date"
                  id="scheduledDate"
                  name="scheduledDate"
                  value={formData.scheduledDate instanceof Date 
                    ? formData.scheduledDate.toISOString().split('T')[0] 
                    : formData.scheduledDate || ''}
                  onChange={handleChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
            </div>

            {/* Completed Date */}
            <div className="sm:col-span-2">
              <label htmlFor="completedDate" className="block text-sm font-medium text-gray-700">
                Completed Date
              </label>
              <div className="mt-1">
                <input
                  type="date"
                  id="completedDate"
                  name="completedDate"
                  value={formData.completedDate instanceof Date 
                    ? formData.completedDate.toISOString().split('T')[0] 
                    : formData.completedDate || ''}
                  onChange={handleChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
            </div>

            {/* Technician */}
            <div className="sm:col-span-3">
              <label htmlFor="technicianId" className="block text-sm font-medium text-gray-700">
                Technician
              </label>
              <div className="mt-1">
                <select
                  id="technicianId"
                  name="technicianId"
                  value={formData.technicianId || ''}
                  onChange={handleChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                  <option value="">Select a technician</option>
                  {technicians.map((technician: any) => (
                    <option key={technician.id} value={technician.id}>
                      {technician.firstName} {technician.lastName}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Section */}
      <div className="bg-white shadow sm:rounded-md">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900">Payment Details</h3>
          <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            {/* Price */}
            <div className="sm:col-span-2">
              <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                Price
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">$</span>
                </div>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price || ''}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  className="block w-full pl-7 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="0.00"
                />
              </div>
            </div>

            {/* Payment Type */}
            <div className="sm:col-span-2">
              <label htmlFor="paymentType" className="block text-sm font-medium text-gray-700">
                Payment Type
              </label>
              <div className="mt-1">
                <select
                  id="paymentType"
                  name="paymentType"
                  value={formData.paymentType || ''}
                  onChange={handleChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                  <option value="">Select payment type</option>
                  <option value="cash">Cash</option>
                  <option value="credit">Credit Card</option>
                  <option value="check">Check</option>
                  <option value="insurance">Insurance</option>
                  <option value="warranty">Warranty</option>
                </select>
              </div>
            </div>

            {/* Payment Status */}
            <div className="sm:col-span-2">
              <label htmlFor="paymentStatus" className="block text-sm font-medium text-gray-700">
                Payment Status
              </label>
              <div className="mt-1">
                <select
                  id="paymentStatus"
                  name="paymentStatus"
                  value={formData.paymentStatus || ''}
                  onChange={handleChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                  <option value="">Select payment status</option>
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="partially paid">Partially Paid</option>
                </select>
              </div>
            </div>

            {/* Insurance Claim */}
            <div className="sm:col-span-6">
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="insuranceClaim"
                    name="insuranceClaim"
                    type="checkbox"
                    checked={formData.insuranceClaim}
                    onChange={(e) => setFormData({ ...formData, insuranceClaim: e.target.checked })}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="insuranceClaim" className="font-medium text-gray-700">
                    Insurance Claim
                  </label>
                  <p className="text-gray-500">Check if this work order is covered by insurance</p>
                </div>
              </div>
            </div>

            {/* Insurance Information */}
            {formData.insuranceClaim && (
              <div className="sm:col-span-6">
                <label htmlFor="insuranceInfo" className="block text-sm font-medium text-gray-700">
                  Insurance Information
                </label>
                <div className="mt-1">
                  <textarea
                    id="insuranceInfo"
                    name="insuranceInfo"
                    rows={3}
                    value={formData.insuranceInfo || ''}
                    onChange={handleChange}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    placeholder="Policy number, insurance company, etc."
                  />
                </div>
              </div>
            )}

            {/* Warranty Information */}
            <div className="sm:col-span-6">
              <label htmlFor="warrantyInfo" className="block text-sm font-medium text-gray-700">
                Warranty Information
              </label>
              <div className="mt-1">
                <textarea
                  id="warrantyInfo"
                  name="warrantyInfo"
                  rows={3}
                  value={formData.warrantyInfo || ''}
                  onChange={handleChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="Warranty details if applicable"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Notes Section */}
      <div className="bg-white shadow sm:rounded-md">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900">Notes</h3>
          <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            <div className="sm:col-span-6">
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                Notes
              </label>
              <div className="mt-1">
                <textarea
                  id="notes"
                  name="notes"
                  rows={4}
                  value={formData.notes || ''}
                  onChange={handleChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="Additional notes about this work order"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {isSubmitting ? 'Saving...' : initialData.id ? 'Update Work Order' : 'Create Work Order'}
        </button>
      </div>
    </form>
  );
};

export default WorkOrderForm; 