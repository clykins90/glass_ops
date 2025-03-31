import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Profile } from '../../types/profile';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Label } from '../ui/label';

interface TechnicianFormProps {
  initialData?: Profile;
  onSubmit: (data: Omit<Profile, 'id' | 'createdAt' | 'updatedAt' | 'company_id' | 'role'>) => void;
  isLoading?: boolean;
  error?: string | null;
}

const TechnicianForm: React.FC<TechnicianFormProps> = ({
  initialData,
  onSubmit,
  isLoading = false,
  error = null,
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
      const { firstName = '', lastName = '', email = '', phone = '' } = initialData;
      setProfileData({ firstName, lastName, email: email || '', phone: phone || '' });
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileData.firstName || !profileData.lastName) {
        console.error("First and Last name are required");
        return; 
    }
    onSubmit(profileData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1">
        <Label htmlFor="firstName">First Name *</Label>
        <Input 
          id="firstName"
          name="firstName"
          value={profileData.firstName}
          onChange={handleChange}
          required 
          disabled={isLoading}
        />
      </div>
      <div className="space-y-1">
        <Label htmlFor="lastName">Last Name *</Label>
        <Input 
          id="lastName"
          name="lastName"
          value={profileData.lastName}
          onChange={handleChange}
          required 
          disabled={isLoading}
        />
      </div>
      <div className="space-y-1">
        <Label htmlFor="email">Email Address</Label>
        <Input 
          id="email"
          name="email"
          type="email"
          value={profileData.email || ''}
          onChange={handleChange}
          disabled={isLoading}
        />
      </div>
      <div className="space-y-1">
        <Label htmlFor="phone">Phone Number</Label>
        <Input 
          id="phone"
          name="phone"
          type="tel"
          value={profileData.phone || ''}
          onChange={handleChange}
          disabled={isLoading}
        />
      </div>

      {error && (
          <p className="text-sm text-destructive text-center">{error}</p>
      )}

      <div className="flex justify-end space-x-3 pt-4">
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