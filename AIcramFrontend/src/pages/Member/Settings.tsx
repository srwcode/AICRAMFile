import React, { useState, useRef, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Upload, X, Loader2, User, Mail, Phone, Lock } from 'lucide-react';
import config from '../../config';

interface UserFormData {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  image_id: string;
}

interface PasswordData {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

interface FileUploadResponse {
  file_id: string;
  cloud_url: string;
}

const UserSettings = () => {
  const [userID, setUserID] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  const [formData, setFormData] = useState<UserFormData>({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    phone: '',
    image_id: '',
  });

  const [passwordData, setPasswordData] = useState<PasswordData>({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [passwordErrors, setPasswordErrors] = useState<{ [key: string]: string }>({});
  
  const inputClass = "w-full text-white bg-gray-900 border border-gray-700 px-3 py-2 rounded-md focus:outline-none focus:ring-0 focus:ring-white focus:border-gray-400 transition duration-150";
  
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    const phoneRegex = /^\+?[0-9]{3,}$/;

    if (!formData.phone) newErrors.phone = 'Phone number is required';
    else if (!phoneRegex.test(formData.phone)) {
      newErrors.phone = 'Invalid phone number format';
    }

    if (!formData.first_name) newErrors.first_name = 'First name is required';
    else if (formData.first_name.length < 2 || formData.first_name.length > 100) {
      newErrors.first_name = 'First name must be 2-100 characters';
    }

    if (!formData.last_name) newErrors.last_name = 'Last name is required';
    else if (formData.last_name.length < 2 || formData.last_name.length > 100) {
      newErrors.last_name = 'Last name must be 2-100 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePasswordForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!passwordData.current_password) newErrors.current_password = 'Current password is required';

    if (!passwordData.new_password) newErrors.new_password = 'New password is required';
    else if (passwordData.new_password.length < 6) {
      newErrors.new_password = 'Password must be at least 6 characters';
    }

    if (!passwordData.confirm_password) newErrors.confirm_password = 'Please confirm your new password';
    else if (passwordData.new_password !== passwordData.confirm_password) {
      newErrors.confirm_password = 'Passwords do not match';
    }

    setPasswordErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${config.API_URL}/upload`, {
        method: 'POST',
        headers: {
          'token': token || '',
        },
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');

      const data: FileUploadResponse = await response.json();
      setFormData(prev => ({ ...prev, image_id: data.file_id }));
      setImageUrl(data.cloud_url);
    } catch (err) {
      toast.error('Failed to upload image');
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteImage = async () => {
    setImageUrl('');
    setFormData(prev => ({ ...prev, image_id: '' }));
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleClickUpload = () => {
    fileInputRef.current?.click();
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${config.API_URL}/auth/data`, {
          headers: {
            'Content-Type': 'application/json',
            'token': token || ''
          }
        });
        if (!response.ok) throw new Error('Failed to fetch user');
        const data = await response.json();
        
        setFormData({
          username: data.username,
          email: data.email,
          first_name: data.first_name,
          last_name: data.last_name,
          phone: data.phone,
          image_id: data.image_id || '',
        });

        setUserID(data.user_id);

        if (data.image_id) {
          const fileResponse = await fetch(`${config.API_URL}/files/${data.image_id}`, {
            headers: {
              'token': token || ''
            }
          });
          if (fileResponse.ok) {
            const fileData = await fileResponse.json();
            setImageUrl(fileData.cloud_url);
          }
        }

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load user');
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [userID]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    const dataToSubmit = {
      ...formData
    };

    try {
      const token = localStorage.getItem("token");
  
      const response = await fetch(`${config.API_URL}/users/${userID}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "token": token || "",
        },
        body: JSON.stringify(dataToSubmit),
      });
  
      const responseData = await response.json();

      if (!response.ok) {
        if (responseData.error === 'email_error') {
          setErrors(prev => ({ ...prev, email: 'Email already exists' }));
        } else {
          throw new Error(responseData.error || 'Failed to update user');
        }
        return;
      }
  
      toast.success('Profile updated successfully');
    } catch (err) {
      console.error("Update error:", err);
      setError(err instanceof Error ? err.message : "Failed to update user");
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validatePasswordForm()) return;

    try {
      const token = localStorage.getItem("token");
  
      const response = await fetch(`${config.API_URL}/users/${userID}/password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "token": token || "",
        },
        body: JSON.stringify({
          current_password: passwordData.current_password,
          new_password: passwordData.new_password
        }),
      });
  
      const responseData = await response.json();

      if (!response.ok) {
        if (responseData.error === 'invalid_password') {
          setPasswordErrors(prev => ({ ...prev, current_password: 'Current password is incorrect' }));
        } else {
          throw new Error(responseData.error || 'Failed to update password');
        }
        return;
      }
  
      toast.success('Password updated successfully');
      setPasswordData({
        current_password: '',
        new_password: '',
        confirm_password: ''
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update password");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-900">
        <Loader2 className="w-10 h-10 animate-spin text-white" />
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-700 bg-gray-800 shadow-lg">
      <div className="border-b border-gray-700 px-6 py-4 lg:px-8 lg:py-6">
        <h1 className="text-2xl font-bold text-white">
          Account Settings
        </h1>
      </div>

      {error && <div className="mx-6 lg:mx-8 mt-6 mb-0 bg-red-900/20 border border-red-500 text-red-400 p-4 rounded-lg">{error}</div>}

      <div className="flex border-b border-gray-700">
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center px-6 py-4 font-medium text-sm transition-colors ${
            activeTab === 'profile' 
              ? 'text-white border-b-2 border-white' 
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <User className="w-4 h-4 mr-2" />
          Profile Information
        </button>
        <button
          onClick={() => setActiveTab('password')}
          className={`flex items-center px-6 py-4 font-medium text-sm transition-colors ${
            activeTab === 'password' 
              ? 'text-white border-b-2 border-white' 
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Lock className="w-4 h-4 mr-2" />
          Password
        </button>
      </div>

      {activeTab === 'profile' && (
        <div className="p-6 lg:p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="flex flex-col md:flex-row gap-8">
              <div className="w-full md:w-1/3">
                <div>
                  <label className="block text-gray-300 mb-2 text-sm">Profile Image</label>
                  <div
                    className={`relative border-2 border-dashed rounded-lg transition-all cursor-pointer h-[230px] flex items-center justify-center
                      ${isDragging 
                        ? 'border-gray-400 bg-gray-800' 
                        : 'border-gray-700 hover:border-gray-400 hover:bg-gray-800 bg-gray-900'
                      }`}
                    onClick={handleClickUpload}
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileInput}
                      accept="image/*"
                      className="hidden"
                    />
                    
                    {uploading ? (
                      <div className="text-center space-y-3">
                        <Loader2 className="w-12 h-12 mx-auto animate-spin text-white" />
                        <p className="text-white font-medium">Uploading...</p>
                      </div>
                    ) : imageUrl ? (
                      <div className="space-y-4">
                        <div className="relative w-32 h-32 mx-auto">
                          <img 
                            src={imageUrl} 
                            alt="Profile" 
                            className="w-full h-full rounded-full object-cover border-2 border-gray-700"
                          />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteImage();
                            }}
                            className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-md"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-xs text-gray-400 text-center">Click to change image</p>
                      </div>
                    ) : (
                      <div className="text-center">
                        <div className="flex items-center justify-center">
                          <Upload className="w-10 h-10 text-white opacity-70" />
                        </div>
                        <div className="mt-4">
                          <p className="text-gray-300 font-medium">Drop file here</p>
                          <p className="text-sm text-gray-400 mt-1.5">or click to browse</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="w-full md:w-2/3 space-y-6">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="w-full md:w-1/2">
                    <label className="block text-gray-300 mb-2 text-sm">Username</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-gray-500" />
                      </div>
                      <input
                        type="text"
                        value={formData.username}
                        className="w-full bg-gray-900 border border-gray-700 rounded-md py-2 pl-10 pr-3 text-gray-400 focus:outline-none focus:ring-0 focus:ring-gray-400 focus:border-gray-500 cursor-not-allowed"
                        readOnly
                      />
                    </div>
                  </div>
                  
                  <div className="w-full md:w-1/2">
                    <label className="block text-gray-300 mb-2 text-sm">Email <span className="text-red-400">*</span></label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-500" />
                      </div>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                        className={inputClass + " pl-10"}
                      />
                    </div>
                    {errors.email && <p className="text-red-400 text-xs mt-1.5">{errors.email}</p>}
                  </div>
                </div>

                <div className="flex flex-col md:flex-row gap-6">
                  <div className="w-full md:w-1/2">
                    <label className="block text-gray-300 mb-2 text-sm">First Name <span className="text-red-400">*</span></label>
                    <input
                      type="text"
                      value={formData.first_name}
                      onChange={e => setFormData({ ...formData, first_name: e.target.value })}
                      className={inputClass}
                    />
                    {errors.first_name && <p className="text-red-400 text-xs mt-1.5">{errors.first_name}</p>}
                  </div>
                  
                  <div className="w-full md:w-1/2">
                    <label className="block text-gray-300 mb-2 text-sm">Last Name <span className="text-red-400">*</span></label>
                    <input
                      type="text"
                      value={formData.last_name}
                      onChange={e => setFormData({ ...formData, last_name: e.target.value })}
                      className={inputClass}
                    />
                    {errors.last_name && <p className="text-red-400 text-xs mt-1.5">{errors.last_name}</p>}
                  </div>
                </div>

                <div className="flex flex-col md:flex-row gap-6">
                  <div className="w-full md:w-1/2">
                    <label className="block text-gray-300 mb-2 text-sm">Phone <span className="text-red-400">*</span></label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Phone className="h-5 w-5 text-gray-500" />
                      </div>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                        className={inputClass + " pl-10"}
                      />
                    </div>
                    {errors.phone && <p className="text-red-400 text-xs mt-1.5">{errors.phone}</p>}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                className="bg-white hover:bg-gray-300 text-gray-900 px-6 py-2.5 rounded-md transition-all duration-200 font-medium"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      )}

      {activeTab === 'password' && (
        <div className="p-6 lg:p-8">
          <form onSubmit={handlePasswordSubmit} className="space-y-6">
            <div>
              <label className="block text-gray-300 mb-2 text-sm">Current Password <span className="text-red-400">*</span></label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  type="password"
                  value={passwordData.current_password}
                  onChange={e => setPasswordData({ ...passwordData, current_password: e.target.value })}
                  className={inputClass + " pl-10"}
                  placeholder="Enter your current password"
                />
              </div>
              {passwordErrors.current_password && <p className="text-red-400 text-xs mt-1.5">{passwordErrors.current_password}</p>}
            </div>
            
            <div>
              <label className="block text-gray-300 mb-2 text-sm">New Password <span className="text-red-400">*</span></label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  type="password"
                  value={passwordData.new_password}
                  onChange={e => setPasswordData({ ...passwordData, new_password: e.target.value })}
                  className={inputClass + " pl-10"}
                  placeholder="Enter your new password"
                />
              </div>
              {passwordErrors.new_password && <p className="text-red-400 text-xs mt-1.5">{passwordErrors.new_password}</p>}
            </div>
            
            <div>
              <label className="block text-gray-300 mb-2 text-sm">Confirm New Password <span className="text-red-400">*</span></label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  type="password"
                  value={passwordData.confirm_password}
                  onChange={e => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                  className={inputClass + " pl-10"}
                  placeholder="Confirm your new password"
                />
              </div>
              {passwordErrors.confirm_password && <p className="text-red-400 text-xs mt-1.5">{passwordErrors.confirm_password}</p>}
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                className="bg-white hover:bg-gray-300 text-gray-900 px-6 py-2.5 rounded-md transition-all duration-200 font-medium"
              >
                Update Password
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default UserSettings;