import { useState } from 'react';
import { useCreateUser, useUpdateUser } from '../hooks/useUsers';

const UserForm = ({ user, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });

  const createUserMutation = useCreateUser();
  const updateUserMutation = useUpdateUser();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (user) {
        // Update existing user
        await updateUserMutation.mutateAsync({
          id: user.id,
          userData: formData,
        });
      } else {
        // Create new user
        await createUserMutation.mutateAsync(formData);
      }
      setFormData({ name: '', email: '' });
      if (onSuccess) onSuccess();
    } catch (error) {
      alert('Failed to save user');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>{user ? 'Edit User' : 'Create New User'}</h2>
      <div>
        <label>
          Name:
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </label>
      </div>
      <div>
        <label>
          Email:
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </label>
      </div>
      <button type="submit" disabled={createUserMutation.isPending || updateUserMutation.isPending}>
        {createUserMutation.isPending || updateUserMutation.isPending
          ? 'Saving...'
          : user
          ? 'Update'
          : 'Create'}
      </button>
    </form>
  );
};

export default UserForm;


