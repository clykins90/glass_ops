import React from 'react';

const Technicians = () => {
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
          >
            Add technician
          </button>
        </div>
      </div>
      
      <div className="mt-8 flex flex-col">
        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
          <div className="p-8 text-center text-gray-500">
            <p>Technicians functionality coming soon</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Technicians; 