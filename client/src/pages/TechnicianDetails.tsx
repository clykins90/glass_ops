import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { technicianApi, workOrderApi } from '../services/api';
import { Profile } from '../types/profile';
import { WorkOrder } from '../types/workOrder';
import ConfirmationDialog from '../components/ConfirmationDialog';
import { Button } from '@/components/ui/button';
import { useTechnicianProfiles } from '../context/TechnicianContext';
import { Calendar } from 'lucide-react';
import React, { useState } from 'react';

const TechnicianDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { deleteProfile } = useTechnicianProfiles();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Fetch technician profile details
  const { 
    data: profile,
    isLoading, 
    error 
  } = useQuery<Profile>({
    queryKey: ['technician', id],
    queryFn: () => technicianApi.getById(id!),
    enabled: !!id,
  });

  // Fetch technician's work orders
  const { 
    data: workOrders, 
    isLoading: isLoadingWorkOrders 
  } = useQuery<WorkOrder[]>({
    queryKey: ['technician-workorders', id],
    queryFn: async () => {
      if (!id) return [];
      const allWorkOrders = await workOrderApi.getAll();
      return allWorkOrders.filter(order => order.technicianId === id);
    },
    enabled: !!id,
  });

  // Delete profile mutation using context function
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteProfile(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['technicians'] });
      navigate('/technicians');
    },
    onError: (error) => {
      console.error("Error deleting profile:", error);
      setIsDeleteDialogOpen(false);
    }
  });

  const handleDelete = () => {
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (id) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center">Loading technician profile details...</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-red-500">Error loading profile: {(error as Error).message}</div>;
  }

  if (!profile) {
    return <div className="p-8 text-center text-red-500">Technician profile not found</div>;
  }

  return (
    <div className="p-4 md:p-8">
      <div className="md:flex md:items-center md:justify-between mb-6">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            {profile.firstName} {profile.lastName}
          </h2>
          <div className="mt-1 flex flex-col sm:mt-0 sm:flex-row sm:flex-wrap sm:space-x-6">
            {profile.phone && (
              <div className="mt-2 flex items-center text-sm text-gray-500">
                <svg className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" /></svg>
                {profile.phone}
              </div>
            )}
            {profile.email && (
              <div className="mt-2 flex items-center text-sm text-gray-500">
                <svg className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" /><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" /></svg>
                {profile.email}
              </div>
            )}
          </div>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4 space-x-3">
          <Button 
            variant="outline"
            onClick={() => navigate(`/technicians/${id}/schedule`)}
          >
            <Calendar className="h-4 w-4 mr-2" />
            Manage Schedule
          </Button>
          <Button 
            variant="outline"
            onClick={() => navigate(`/technicians/${id}/edit`)}
          >
            Edit Profile
          </Button>
          <Button 
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteMutation.isLoading}
          >
            {deleteMutation.isLoading ? 'Deleting...' : 'Delete Profile'}
          </Button>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Profile Information</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">Details associated with this profile.</p>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
          <dl className="sm:divide-y sm:divide-gray-200">
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Full name</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {profile.firstName} {profile.lastName}
              </dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Phone number</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{profile.phone || 'N/A'}</dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Email address</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{profile.email || 'N/A'}</dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Role</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 capitalize">{profile.role}</dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Assigned Work Orders</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Work orders currently assigned to {profile.firstName} {profile.lastName}.
          </p>
        </div>
        <div className="border-t border-gray-200">
          {isLoadingWorkOrders ? (
            <div className="p-4 text-center text-gray-500">Loading work orders...</div>
          ) : workOrders && workOrders.length > 0 ? (
            <ul role="list" className="divide-y divide-gray-200">
              {workOrders.map((order) => (
                <li key={order.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50 cursor-pointer" onClick={() => navigate(`/workorders/${order.id}`)}>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-indigo-600 truncate">WO #{order.id} - {order.serviceType}</p>
                    <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${ order.status === 'completed' ? 'bg-green-100 text-green-800' : order.status === 'cancelled' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
                      {order.status}
                    </p>
                  </div>
                  <div className="mt-2 sm:flex sm:justify-between">
                    <div className="sm:flex">
                      <p className="flex items-center text-sm text-gray-500">
                        <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" /></svg>
                        {order.scheduledDate ? new Date(order.scheduledDate).toLocaleDateString() : 'Not Scheduled'}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-4 text-center text-gray-500">No work orders assigned.</div>
          )}
        </div>
      </div>

      <ConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onCancel={() => setIsDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Technician Profile"
        message={`Are you sure you want to delete the profile for ${profile?.firstName} ${profile?.lastName}? This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        isLoading={deleteMutation.isLoading}
      />
    </div>
  );
};

export default TechnicianDetails; 