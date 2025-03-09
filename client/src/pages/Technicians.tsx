import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { technicianApi } from '../services/api';
import { Technician } from '../types/technician';
import ConfirmationDialog from '../components/ConfirmationDialog';

const Technicians = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [technicianToDelete, setTechnicianToDelete] = useState<Technician | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Fetch technicians
  const { data: technicians, isLoading, error } = useQuery<Technician[]>({
    queryKey: ['technicians'],
    queryFn: technicianApi.getAll,
  });

  // Delete technician mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => technicianApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['technicians'] });
      setIsDeleteDialogOpen(false);
      setTechnicianToDelete(null);
    },
  });

  const handleDeleteClick = (technician: Technician) => {
    setTechnicianToDelete(technician);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (technicianToDelete) {
      deleteMutation.mutate(technicianToDelete.id);
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center">Loading technicians...</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-red-500">Error loading technicians: {(error as Error).message}</div>;
  }

  return (
    <div>
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Technicians</h1>
          <p className="mt-2 text-sm text-gray-700">
            A list of all technicians in your account.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
            onClick={() => navigate('/technicians/add')}
          >
            Add technician
          </button>
        </div>
      </div>
      
      <div className="mt-8 flex flex-col">
        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
          {technicians && technicians.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Name</th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Phone</th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Email</th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Skills</th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
                  <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {technicians.map((technician) => (
                  <tr key={technician.id}>
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                      {technician.firstName} {technician.lastName}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{technician.phone}</td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{technician.email || 'N/A'}</td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      <div className="flex flex-wrap gap-1">
                        {technician.skills.map((skill, index) => (
                          <span key={index} className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        technician.active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {technician.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                      <button
                        type="button"
                        className="text-indigo-600 hover:text-indigo-900 mr-2"
                        onClick={() => navigate(`/technicians/${technician.id}`)}
                      >
                        View
                      </button>
                      <button
                        type="button"
                        className="text-indigo-600 hover:text-indigo-900 mr-2"
                        onClick={() => navigate(`/technicians/${technician.id}/edit`)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="text-red-600 hover:text-red-900"
                        onClick={() => handleDeleteClick(technician)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-8 text-center text-gray-500">
              <p>No technicians found. Add your first technician to get started.</p>
            </div>
          )}
        </div>
      </div>

      <ConfirmationDialog
        isOpen={isDeleteDialogOpen}
        title="Delete Technician"
        message={`Are you sure you want to delete ${technicianToDelete?.firstName} ${technicianToDelete?.lastName}? This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={confirmDelete}
        onCancel={() => setIsDeleteDialogOpen(false)}
        isLoading={deleteMutation.isLoading}
      />
    </div>
  );
};

export default Technicians; 