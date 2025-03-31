import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Profile } from '../../types/profile';
import { Input, Button, Label } from '../ui';

interface TechnicianFormProps {
  initialData?: Profile;
  onSubmit: (data: Omit<Profile, 'id' | 'createdAt' | 'updatedAt' | 'company_id' | 'role'>) => void;
  isLoading?: boolean;
}

const TechnicianForm: React.FC<TechnicianFormProps> = ({
  initialData,
  onSubmit,
  isLoading = false,
}) => {
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState<Omit<Profile, 'id' | 'createdAt' | 'updatedAt' | 'company_id' | 'role'>>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });

  useEffect(() => {
    if (initialData) {
      const { id, createdAt, updatedAt, company_id, role, ...editableData } = initialData;
      setProfileData(editableData);
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(profileData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-lg shadow">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name</Label>
          <Input 
            id="firstName"
            name="firstName"
            value={profileData.firstName}
            onChange={handleChange}
            required 
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name</Label>
          <Input 
            id="lastName"
            name="lastName"
            value={profileData.lastName}
            onChange={handleChange}
            required 
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <Input 
            id="email"
            name="email"
            type="email"
            value={profileData.email || ''}
            onChange={handleChange}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <Input 
            id="phone"
            name="phone"
            value={profileData.phone || ''}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        <Button 
          type="button" 
          variant="outline"
          onClick={() => navigate(-1)}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : (initialData ? 'Update Technician' : 'Add Technician')}
        </Button>
      </div>
    </form>
  );
};

export default TechnicianForm; 