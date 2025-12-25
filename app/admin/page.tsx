'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';
import {
  collection,
  query,
  getDocs,
  deleteDoc,
  doc,
  orderBy,
  updateDoc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  Users,
  Scissors,
  MessageSquare,
  Heart,
  TrendingUp,
  Trash2,
  Shield,
  CheckCircle,
  XCircle,
  Edit,
  Eye,
  MoreVertical,
  Plus,
  ChevronDown,
  ChevronUp,
  Download,
  RefreshCw,
  Star,
} from 'lucide-react';
import { AppUser, FashionStyle, Feedback } from '@/types';
import StyleUploadForm from '@/components/StyleUploadForm';
import toast from 'react-hot-toast';
import { formatDate } from '@/utils/dateFormatter';
import Avatar from '@/components/Avatar';

// Modal Component
const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = "Delete", confirmColor = "red" }: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  confirmColor?: string;
}) => {
  if (!isOpen) return null;

  const colorClasses = {
    red: 'bg-red-600 hover:bg-red-700',
    blue: 'bg-blue-600 hover:bg-blue-700',
    green: 'bg-green-600 hover:bg-green-700',
    yellow: 'bg-yellow-600 hover:bg-yellow-700',
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose}></div>
        
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
        
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className={`mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full ${
                confirmColor === 'red' ? 'bg-red-100' :
                confirmColor === 'blue' ? 'bg-blue-100' :
                confirmColor === 'green' ? 'bg-green-100' : 'bg-yellow-100'
              } sm:mx-0 sm:h-10 sm:w-10`}>
                <Trash2 className={`h-6 w-6 ${
                  confirmColor === 'red' ? 'text-red-600' :
                  confirmColor === 'blue' ? 'text-blue-600' :
                  confirmColor === 'green' ? 'text-green-600' : 'text-yellow-600'
                }`} />
              </div>
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  {title}
                </h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    {message}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              onClick={onConfirm}
              className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white ${colorClasses[confirmColor]} focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm`}
            >
              {confirmText}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// UserActionsDropdown - Fixed version
const UserActionsDropdown = ({ user, onPromote, onDemote, onDelete }: {
  user: AppUser;
  onPromote: () => void;
  onDemote: () => void;
  onDelete: () => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <MoreVertical className="w-5 h-5" />
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-50 border border-gray-200">
          {user.role === 'user' ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onPromote();
                setIsOpen(false);
              }}
              className="w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-100 flex items-center gap-2 hover:text-purple-600 transition-colors"
            >
              <Shield className="w-4 h-4" />
              Make Admin
            </button>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDemote();
                setIsOpen(false);
              }}
              className="w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-100 flex items-center gap-2 hover:text-blue-600 transition-colors"
            >
              <Users className="w-4 h-4" />
              Make User
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
              setIsOpen(false);
            }}
            className="w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Delete User
          </button>
        </div>
      )}
    </div>
  );
};

// StyleActionsDropdown - Fixed version
const StyleActionsDropdown = ({ style, onEdit, onDelete, onView }: {
  style: FashionStyle;
  onEdit: () => void;
  onDelete: () => void;
  onView: () => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <MoreVertical className="w-5 h-5" />
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-[-64] w-48 bg-white rounded-lg shadow-lg z-50 border border-gray-200">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onView();
              setIsOpen(false);
            }}
            className="w-full text-sm text-left px-4 py-1.5 text-gray-700 hover:bg-gray-100 flex items-center gap-2 hover:text-blue-600 transition-colors"
          >
            <Eye className="w-3 h-3" />
            View Style
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
              setIsOpen(false);
            }}
            className="w-full text-sm text-left px-4 py-1.5 text-gray-700 hover:bg-gray-100 flex items-center gap-2 hover:text-green-600 transition-colors"
          >
            <Edit className="w-3 h-3" />
            Edit Style
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
              setIsOpen(false);
            }}
            className="w-full text-sm text-left px-4 py-1.5 text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
          >
            <Trash2 className="w-3 h-3" />
            Delete Style
          </button>
        </div>
      )}
    </div>
  );
};

// Edit Style Modal
const EditStyleModal = ({ isOpen, onClose, style, onSave }: {
  isOpen: boolean;
  onClose: () => void;
  style: FashionStyle;
  onSave: (updatedStyle: Partial<FashionStyle>) => Promise<void>;
}) => {
  const [formData, setFormData] = useState({
    title: style.title,
    description: style.description,
    category: style.category,
    deliveryTime: style.deliveryTime || '',
    priceWithFabrics: style.priceWithFabrics?.toString() || '',
    priceWithoutFabrics: style.priceWithoutFabrics?.toString() || '',
    tags: style.tags?.join(', ') || '',
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      await onSave({
        title: formData.title,
        description: formData.description,
        category: formData.category as any,
        deliveryTime: formData.deliveryTime,
       priceWithFabrics: formData.priceWithFabrics,
       priceWithoutFabrics: formData.priceWithoutFabrics,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        updatedAt: new Date(),
      });
      onClose();
    } catch (error) {
      console.error('Error saving style:', error);
      toast.error('Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose}></div>
        
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
        
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Edit Style: {style.title}
                </h3>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Title
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Category
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({...formData, category: e.target.value as any})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      >
                        <option value="casual">Casual</option>
                        <option value="official">Official</option>
                        <option value="traditional">Traditional</option>
                        <option value="party">Party</option>
                        <option value="native">Native</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Delivery Time
                      </label>
                      <input
                        type="text"
                        value={formData.deliveryTime}
                        onChange={(e) => setFormData({...formData, deliveryTime: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        placeholder="e.g., 7-14 days"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Min Price (₦)
                      </label>
                      <input
                        type="number"
                        value={formData.priceWithFabrics}
                        onChange={(e) => setFormData({...formData, priceWithFabrics: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Max Price (₦)
                      </label>
                      <input
                        type="number"
                        value={formData.priceWithoutFabrics}
                        onChange={(e) => setFormData({...formData, priceWithoutFabrics: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tags (comma separated)
                    </label>
                    <input
                      type="text"
                      value={formData.tags}
                      onChange={(e) => setFormData({...formData, tags: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="e.g., suit, wedding, formal"
                    />
                  </div>
                </form>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={saving}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  
  // State management
  const [analytics, setAnalytics] = useState<any>(null);
  const [users, setUsers] = useState<AppUser[]>([]);
  const [styles, setStyles] = useState<FashionStyle[]>([]);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [activeTab, setActiveTab] = useState<'analytics' | 'users' | 'styles' | 'feedback'>('analytics');
  const [loading, setLoading] = useState(true);
  const [showUploadForm, setShowUploadForm] = useState(false);
  
  // Modal states
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    type: 'user' | 'style' | 'feedback';
    id: string;
    title: string;
    message: string;
  } | null>(null);
  
  const [editModal, setEditModal] = useState<{
    isOpen: boolean;
    style: FashionStyle | null;
  }>({ isOpen: false, style: null });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    if (user && user.role !== 'admin') {
      toast.error('Access denied. Admin privileges required.');
      router.push('/');
      return;
    }

    if (user?.role === 'admin') {
      fetchAllData();
    }
  }, [user, authLoading, router]);

  const fetchAllData = async () => {
    try {
      const [usersSnap, stylesSnap, feedbacksSnap] = await Promise.all([
        getDocs(query(collection(db, 'users'), orderBy('createdAt', 'desc'))),
        getDocs(query(collection(db, 'styles'), orderBy('createdAt', 'desc'))),
        getDocs(query(collection(db, 'feedbacks'), orderBy('createdAt', 'desc'))),
      ]);

      const usersData = usersSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      })) as AppUser[];

      const stylesData = stylesSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
        likes: Array.isArray(doc.data().likes) ? doc.data().likes : [],
      })) as FashionStyle[];

      const feedbacksData = feedbacksSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      })) as Feedback[];

      // Calculate analytics
      const totalLikes = stylesData.reduce((sum, style) => sum + style.likes.length, 0);
      const pendingFeedback = feedbacksData.filter(fb => !fb.approved).length;

      setAnalytics({
        totalUsers: usersData.length,
        totalStyles: stylesData.length,
        totalFeedback: feedbacksData.length,
        totalLikes,
        pendingFeedback,
        recentSignups: usersData.slice(0, 5),
        popularStyles: [...stylesData]
          .sort((a, b) => b.likes.length - a.likes.length)
          .slice(0, 5),
      });

      setUsers(usersData);
      setStyles(stylesData);
      setFeedbacks(feedbacksData);
    } catch (error) {
      console.error('Error fetching admin data:', error);
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  // User Management
  const handlePromoteToAdmin = async (userId: string, userName: string) => {
    try {
      await updateDoc(doc(db, 'users', userId), {
        role: 'admin',
      });
      setUsers(users.map(user => 
        user.id === userId ? { ...user, role: 'admin' } : user
      ));
      toast.success(`${userName} promoted to admin`);
    } catch (error) {
      console.error('Error promoting user:', error);
      toast.error('Failed to promote user');
    }
  };

  const handleDemoteToUser = async (userId: string, userName: string) => {
    try {
      await updateDoc(doc(db, 'users', userId), {
        role: 'user',
      });
      setUsers(users.map(user => 
        user.id === userId ? { ...user, role: 'user' } : user
      ));
      toast.success(`${userName} demoted to user`);
    } catch (error) {
      console.error('Error demoting user:', error);
      toast.error('Failed to demote user');
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    try {
      await deleteDoc(doc(db, 'users', userId));
      setUsers(users.filter(user => user.id !== userId));
      toast.success(`User ${userName} deleted`);
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
    }
  };

  // Style Management
  const handleEditStyle = (style: FashionStyle) => {
    setEditModal({ isOpen: true, style });
  };

  const handleSaveStyle = async (updatedData: Partial<FashionStyle>) => {
    if (!editModal.style) return;
    
    try {
      await updateDoc(doc(db, 'styles', editModal.style.id), updatedData);
      setStyles(styles.map(style => 
        style.id === editModal.style?.id 
          ? { ...style, ...updatedData } 
          : style
      ));
      toast.success('Style updated successfully');
      setEditModal({ isOpen: false, style: null });
    } catch (error) {
      console.error('Error updating style:', error);
      toast.error('Failed to update style');
    }
  };

  const handleDeleteStyle = async (styleId: string, styleTitle: string) => {
    try {
      await deleteDoc(doc(db, 'styles', styleId));
      setStyles(styles.filter(style => style.id !== styleId));
      toast.success(`Style "${styleTitle}" deleted`);
    } catch (error) {
      console.error('Error deleting style:', error);
      toast.error('Failed to delete style');
    }
  };

  // Feedback Management
  const handleToggleApproval = async (feedback: Feedback) => {
    try {
      await updateDoc(doc(db, 'feedbacks', feedback.id), {
        approved: !feedback.approved,
      });
      setFeedbacks(feedbacks.map(fb => 
        fb.id === feedback.id ? { ...fb, approved: !fb.approved } : fb
      ));
      toast.success(`Feedback ${feedback.approved ? 'unapproved' : 'approved'}`);
    } catch (error) {
      console.error('Error updating feedback:', error);
      toast.error('Failed to update feedback');
    }
  };

  const handleDeleteFeedback = async (feedbackId: string) => {
    try {
      await deleteDoc(doc(db, 'feedbacks', feedbackId));
      setFeedbacks(feedbacks.filter(fb => fb.id !== feedbackId));
      toast.success('Feedback deleted');
    } catch (error) {
      console.error('Error deleting feedback:', error);
      toast.error('Failed to delete feedback');
    }
  };

  // Modal handlers
  const openDeleteModal = (type: 'user' | 'style' | 'feedback', id: string, title: string, message: string) => {
    setDeleteModal({ isOpen: true, type, id, title, message });
  };

  const confirmDelete = async () => {
    if (!deleteModal) return;
    
    try {
      switch (deleteModal.type) {
        case 'user':
          const userToDelete = users.find(u => u.id === deleteModal.id);
          if (userToDelete) {
            await handleDeleteUser(userToDelete.id, userToDelete.name);
          }
          break;
        case 'style':
          const styleToDelete = styles.find(s => s.id === deleteModal.id);
          if (styleToDelete) {
            await handleDeleteStyle(styleToDelete.id, styleToDelete.title);
          }
          break;
        case 'feedback':
          await handleDeleteFeedback(deleteModal.id);
          break;
      }
      setDeleteModal(null);
    } catch (error) {
      console.error('Error in delete operation:', error);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-600">Loading dashboard...</p>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="bg-white rounded-2xl p-8 max-w-md text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-2xl mb-6">
            <Shield className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-6">
            You need admin privileges to access this page.
          </p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600 mt-1">Manage your tailoring business</p>
            </div>
            <div className="mt-4 sm:mt-0 flex items-center gap-3">
              <button
                onClick={fetchAllData}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                <span className="hidden sm:inline">Refresh</span>
              </button>
              <div className="px-4 py-2 bg-blue-100 text-blue-800 rounded-lg font-medium">
                Admin
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Tabs */}
      <div className="lg:hidden border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <select
            value={activeTab}
            onChange={(e) => setActiveTab(e.target.value as any)}
            className="w-full py-3 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="analytics">Analytics</option>
            <option value="users">Users</option>
            <option value="styles">Styles</option>
            <option value="feedback">Feedback</option>
          </select>
        </div>
      </div>

      {/* Desktop Tabs */}
      <div className="hidden lg:block bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex space-x-8">
            {[
              { id: 'analytics', label: 'Analytics', icon: TrendingUp },
              { id: 'users', label: 'Users', icon: Users },
              { id: 'styles', label: 'Styles', icon: Scissors },
              { id: 'feedback', label: 'Feedback', icon: MessageSquare },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`
                  flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm
                  ${activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Analytics Tab */}
        {activeTab === 'analytics' && analytics && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="p-2 sm:p-3 bg-blue-100 rounded-lg">
                    <Users className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600">Total Users</p>
                    <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">{analytics.totalUsers}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="p-2 sm:p-3 bg-green-100 rounded-lg">
                    <Scissors className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600">Total Styles</p>
                    <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">{analytics.totalStyles}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="p-2 sm:p-3 bg-yellow-100 rounded-lg">
                    <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600">Total Feedback</p>
                    <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">{analytics.totalFeedback}</p>
                    {analytics.pendingFeedback > 0 && (
                      <p className="text-xs text-yellow-600 mt-1">
                        {analytics.pendingFeedback} pending
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="p-2 sm:p-3 bg-red-100 rounded-lg">
                    <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600">Total Likes</p>
                    <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">{analytics.totalLikes}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Signups - Mobile Card View */}
            <div className="lg:hidden">
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Signups</h2>
                <div className="space-y-4">
                  {analytics.recentSignups.map((user: AppUser) => (
                    <div key={user.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Avatar src={user.photoURL} alt={user.name} size="sm" />
                        <div>
                          <p className="font-medium text-gray-900">{user.name}</p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-1 rounded-full text-xs ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
                          {user.role}
                        </span>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatDate(user.createdAt, 'short')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Signups - Desktop Table View */}
            <div className="hidden lg:block bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Signups</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {analytics.recentSignups.map((user: AppUser) => (
                      <tr key={user.id}>
                        <td className="px-4 py-3">
                          <div className="flex items-center">
                            <Avatar src={user.photoURL} alt={user.name} size="sm" className="mr-3" />
                            <span className="font-medium text-gray-900">{user.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">{user.email}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {formatDate(user.createdAt, 'short')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">All Users ({users.length})</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-4 sm:px-6 py-4">
                        <div className="flex items-center">
                          <Avatar src={user.photoURL} alt={user.name} size="sm" className="mr-3" />
                          <div>
                            <div className="font-medium text-gray-900">{user.name}</div>
                            <div className="text-sm text-gray-500 truncate max-w-[150px] sm:max-w-none">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4">
                        <span className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-4 sm:px-6 py-4 text-sm text-gray-500">
                        {formatDate(user.createdAt, 'short')}
                      </td>
                      <td className="px-4 sm:px-6 py-4">
                        <UserActionsDropdown
                          user={user}
                          onPromote={() => handlePromoteToAdmin(user.id, user.name)}
                          onDemote={() => handleDemoteToUser(user.id, user.name)}
                          onDelete={() => openDeleteModal(
                            'user',
                            user.id,
                            'Delete User',
                            `Are you sure you want to delete ${user.name}? This action cannot be undone.`
                          )}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Styles Tab */}
        {activeTab === 'styles' && (
          <div className="space-y-6">
            {/* Add New Style Button */}
            <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm">
              <button
                onClick={() => setShowUploadForm(!showUploadForm)}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 sm:px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                {showUploadForm ? 'Hide Upload Form' : 'Add New Style'}
                {showUploadForm ? (
                  <ChevronUp className="w-5 h-5" />
                ) : (
                  <ChevronDown className="w-5 h-5" />
                )}
              </button>
              
              {/* Collapsible Upload Form */}
              {showUploadForm && (
                <div className="mt-6 animate-fadeIn">
                  <StyleUploadForm onUploadComplete={fetchAllData} />
                </div>
              )}
            </div>

            {/* Styles Grid - Mobile View */}
            <div className="lg:hidden space-y-4">
              {styles.map((style) => (
                <div key={style.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                  <div className="flex items-start gap-4">
                    <div className="relative w-12 h-12 flex-shrink-0">
                      <img
                        src={style.imageUrl}
                        alt={style.title}
                        className="object-cover rounded-lg"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-gray-900 truncate">{style.title}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                              {style.category}
                            </span>
                            <span className="flex items-center gap-1 text-sm text-gray-500">
                              <Heart className="w-3 h-3" />
                              {style.likes?.length || 0}
                            </span>
                          </div>
                        </div>
                        <StyleActionsDropdown
                          style={style}
                          onEdit={() => handleEditStyle(style)}
                          onDelete={() => openDeleteModal(
                            'style',
                            style.id,
                            'Delete Style',
                            `Are you sure you want to delete "${style.title}"? This action cannot be undone.`
                          )}
                          onView={() => window.open(`/styles/${style.id}`, '_blank')}
                        />
                      </div>
                      <p className="text-sm text-gray-600 mt-2 line-clamp-2">{style.description}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        Added: {formatDate(style.createdAt, 'short')}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Styles Table - Desktop View */}
            <div className="hidden lg:block bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Uploaded Styles ({styles.length})</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Style</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Likes</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Uploaded</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {styles.map((style) => (
                      <tr key={style.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="relative w-16 h-20 flex-shrink-0">
                              <img
                                src={style.imageUrl}
                                alt={style.title}
                                className="object-cover rounded-lg h-20 w-20"
                                sizes="64px"
                              />
                            </div>
                            <div className="ml-4">
                              <div className="font-medium text-gray-900">{style.title}</div>
                              <div className="text-sm text-gray-500 line-clamp-2 max-w-md">{style.description}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                            {style.category}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1 text-gray-900">
                            <Heart className="w-4 h-4 text-red-400" />
                            {style.likes?.length || 0}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {formatDate(style.createdAt, 'short')}
                        </td>
                        <td className="px-6 py-4">
                          <StyleActionsDropdown
                            style={style}
                            onEdit={() => handleEditStyle(style)}
                            onDelete={() => openDeleteModal(
                              'style',
                              style.id,
                              'Delete Style',
                              `Are you sure you want to delete "${style.title}"? This action cannot be undone.`
                            )}
                            onView={() => window.open(`/styles/${style.id}`, '_blank')}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Feedback Tab */}
        {activeTab === 'feedback' && (
          <div className="space-y-4">
            {feedbacks.map((feedback) => (
              <div key={feedback.id} className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="flex items-start gap-3 sm:gap-4">
                    <Avatar src={feedback.userPhoto} alt={feedback.userName} size="lg" />
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <h3 className="font-semibold text-gray-900">{feedback.userName}</h3>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < feedback.rating
                                  ? 'text-yellow-400 fill-current'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          feedback.approved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {feedback.approved ? 'Approved' : 'Pending'}
                        </span>
                      </div>
                      <p className="text-gray-700 mb-3">{feedback.comment}</p>
                      <p className="text-sm text-gray-500">
                        {formatDate(feedback.createdAt, 'short')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleToggleApproval(feedback)}
                      className={`flex-1 sm:flex-none flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-sm ${
                        feedback.approved
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                      }`}
                    >
                      {feedback.approved ? (
                        <>
                          <XCircle className="w-4 h-4" />
                          <span>Unapprove</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          <span>Approve</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => openDeleteModal(
                        'feedback',
                        feedback.id,
                        'Delete Feedback',
                        'Are you sure you want to delete this feedback? This action cannot be undone.'
                      )}
                      className="flex-1 sm:flex-none flex items-center gap-2 px-3 sm:px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 text-sm"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {deleteModal && (
        <ConfirmModal
          isOpen={deleteModal.isOpen}
          onClose={() => setDeleteModal(null)}
          onConfirm={confirmDelete}
          title={deleteModal.title}
          message={deleteModal.message}
          confirmText="Delete"
          confirmColor="red"
        />
      )}

      {editModal.style && (
        <EditStyleModal
          isOpen={editModal.isOpen}
          onClose={() => setEditModal({ isOpen: false, style: null })}
          style={editModal.style}
          onSave={handleSaveStyle}
        />
      )}
    </div>
  );
}