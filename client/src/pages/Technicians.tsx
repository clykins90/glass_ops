import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Profile } from '../types/profile';
import { useTechnicianProfiles } from '../context/TechnicianContext';
import ConfirmationDialog from '../components/ConfirmationDialog';
import { Button } from '@/components/ui/button';

const Technicians = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { technicianProfiles, isLoading, error, deleteProfile } = useTechnicianProfiles();
  const [profileToDelete, setProfileToDelete] = useState<Profile | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteProfile(id),
    onSuccess: () => {
      setIsDeleteDialogOpen(false);
      setProfileToDelete(null);
    },
    onError: (error) => {
       console.error("Error deleting profile:", error);
       setIsDeleteDialogOpen(false);
       setProfileToDelete(null);
    }
  });

  const handleDeleteClick = (profile: Profile) => {
    setProfileToDelete(profile);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (profileToDelete) {
      deleteMutation.mutate(profileToDelete.id);
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center">Loading technician profiles...</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-red-500">Error loading technician profiles: {(error as Error).message}</div>;
  }

  return (
    <div className="p-4 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Technicians</h1>
        <Button onClick={() => navigate('/technicians/add')}>
          Add Technician
        </Button>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul role="list" className="divide-y divide-gray-200">
          {technicianProfiles.map((profile) => (
            <li key={profile.id}>
              <div className="px-4 py-4 sm:px-6 flex items-center justify-between">
                <div className="flex items-center">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-indigo-600 truncate cursor-pointer" onClick={() => navigate(`/technicians/${profile.id}`)}>
                      {profile.firstName} {profile.lastName}
                    </p>
                    <p className="mt-1 flex items-center text-sm text-gray-500">
                      <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                      </svg>
                      <span className="truncate">{profile.email || 'No Email'}</span>
                    </p>
                  </div>
                </div>
                <div className="ml-4 flex-shrink-0 flex space-x-2">
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/technicians/${profile.id}/edit`)}
                  >
                    Edit
                  </Button>
                  <Button 
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteClick(profile)}
                    disabled={deleteMutation.isLoading && profileToDelete?.id === profile.id}
                  >
                    {deleteMutation.isLoading && profileToDelete?.id === profile.id ? 'Deleting...' : 'Delete'}
                  </Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {technicianProfiles.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No technicians found.
        </div>
      )}

      <ConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onCancel={() => setIsDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Technician Profile"
        message={`Are you sure you want to delete the profile for ${profileToDelete?.firstName} ${profileToDelete?.lastName}? This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        isLoading={deleteMutation.isLoading}
      />
    </div>
  );
};

export default Technicians; 