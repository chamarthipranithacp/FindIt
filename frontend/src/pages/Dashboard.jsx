import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/authContext';
import { 
  LogOut, Shield, Award, Search, AlertCircle, PlusCircle, CheckCircle, 
  MapPin, Calendar, Tag, User, Users, FileText, Check, X, RefreshCw, BarChart2,
  QrCode, CheckSquare, Clock, Bell, Upload, Trash2, Eye, Filter, ArrowRight,
  Sparkles, Layers, Image as ImageIcon, CheckCircle2, XCircle, ChevronDown, Phone, Info
} from 'lucide-react';
import ThemeSelector from '../components/ThemeSelector';

const CATEGORIES = [
  'Water Bottle',
  'ID Card',
  'Mobile',
  'Laptop',
  'Wallet',
  'Keys',
  'Accessories',
  'Books',
  'Apparel',
  'Other'
];

const EXAMPLE_SEARCH_PRESETS = [
  'Water Bottle',
  'ID Card',
  'Mobile',
  'Laptop',
  'Wallet',
  'Keys'
];

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview'); // overview, report-lost, report-found, claims, admin-panel, security-panel
  const [adminSubTab, setAdminSubTab] = useState('claims'); // claims, lost-list, found-list, analytics
  const [showSuccessToast, setShowSuccessToast] = useState('');
  
  const [lostItems, setLostItems] = useState([]);
  const [foundItems, setFoundItems] = useState([]);
  const [claims, setClaims] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);

  // Form states with multi-image preview & direct contact phone support
  const [lostForm, setLostForm] = useState({ name: '', category: 'General', brand: '', color: '', description: '', location: '', date: '', phone: '' });
  const [lostFiles, setLostFiles] = useState([]);
  const [lostPreviews, setLostPreviews] = useState([]);

  const [foundForm, setFoundForm] = useState({ finder_name: user?.name || '', name: '', category: 'General', brand: '', color: '', description: '', location: '', date: '', phone: '' });
  const [foundFiles, setFoundFiles] = useState([]);
  const [foundPreviews, setFoundPreviews] = useState([]);

  // Claim modal & Founder modal state
  const [claimModalOpen, setClaimModalOpen] = useState(false);
  const [claimTargetItem, setClaimTargetItem] = useState(null);
  const [claimOwnershipDetails, setClaimOwnershipDetails] = useState('');
  const [claimProofFiles, setClaimProofFiles] = useState([]);
  const [claimProofPreviews, setClaimProofPreviews] = useState([]);
  const [claimSubmitting, setClaimSubmitting] = useState(false);
  const [founderModalItem, setFounderModalItem] = useState(null);
  const [detailModalItem, setDetailModalItem] = useState(null);
  const [reportCopyItem, setReportCopyItem] = useState(null);
  const [deliveryModalClaim, setDeliveryModalClaim] = useState(null);
  const [deliveryNoteInput, setDeliveryNoteInput] = useState('');
  const [claimDetailModal, setClaimDetailModal] = useState(null);

  // QR Ticket Modal & Security verification
  const [qrModalClaim, setQrModalClaim] = useState(null);
  const [qrInput, setQrInput] = useState('');
  const [scanResult, setScanResult] = useState(null);

  // Search/Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [searchCategory, setSearchCategory] = useState('All');
  const [searchStatus, setSearchStatus] = useState('All');
  const [searchLocation, setSearchLocation] = useState('');
  const [searchDate, setSearchDate] = useState('');

  const triggerToast = (msg) => {
    setShowSuccessToast(msg);
    setTimeout(() => setShowSuccessToast(''), 4500);
  };

  const fetchData = async () => {
    try {
      const resLost = await axios.get('/api/items/lost/');
      setLostItems(resLost.data);
    } catch (e) {
      console.error("Error fetching lost items:", e);
    }

    try {
      const resFound = await axios.get('/api/items/found/');
      setFoundItems(resFound.data);
    } catch (e) {
      console.error("Error fetching found items:", e);
    }

    try {
      const resClaims = await axios.get('/api/items/claims/');
      setClaims(resClaims.data);
    } catch (e) {
      console.error("Error fetching claims:", e);
    }

    fetchNotifications();
  };

  const fetchNotifications = async () => {
    try {
      const res = await axios.get('/api/items/notifications/');
      setNotifications(res.data);
    } catch (e) {
      console.error("Error fetching notifications:", e);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const markNotificationRead = async (id) => {
    try {
      await axios.post(`/api/items/notifications/${id}/read/`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (e) {
      console.error(e);
    }
  };

  // Multiple File Select Handlers
  const handleLostFilesChange = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setLostFiles(prev => [...prev, ...files]);

    const newPreviews = files.map(file => URL.createObjectURL(file));
    setLostPreviews(prev => [...prev, ...newPreviews]);
  };

  const removeLostFile = (index) => {
    setLostFiles(prev => prev.filter((_, i) => i !== index));
    setLostPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleFoundFilesChange = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setFoundFiles(prev => [...prev, ...files]);

    const newPreviews = files.map(file => URL.createObjectURL(file));
    setFoundPreviews(prev => [...prev, ...newPreviews]);
  };

  const removeFoundFile = (index) => {
    setFoundFiles(prev => prev.filter((_, i) => i !== index));
    setFoundPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleClaimFilesChange = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setClaimProofFiles(prev => [...prev, ...files]);

    const newPreviews = files.map(file => URL.createObjectURL(file));
    setClaimProofPreviews(prev => [...prev, ...newPreviews]);
  };

  const removeClaimFile = (index) => {
    setClaimProofFiles(prev => prev.filter((_, i) => i !== index));
    setClaimProofPreviews(prev => prev.filter((_, i) => i !== index));
  };

  // Form Submission Handlers
  const handleLostSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('name', lostForm.name || lostForm.category || 'Lost Item');
      formData.append('category', lostForm.category || 'General Item');
      formData.append('brand', lostForm.brand || 'N/A');
      formData.append('color', lostForm.color || 'N/A');
      formData.append('description', lostForm.description || 'Lost item reported missing');
      formData.append('location', lostForm.location || 'Campus Premises');
      formData.append('date', lostForm.date || new Date().toISOString().split('T')[0]);
      formData.append('phone', lostForm.phone || '');
      
      lostFiles.forEach(file => {
        formData.append('images', file);
      });

      const res = await axios.post('/api/items/lost/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      await fetchData();
      setLostForm({ name: '', category: 'General', brand: '', color: '', description: '', location: '', date: '', phone: '' });
      setLostFiles([]);
      setLostPreviews([]);
      setReportCopyItem(res.data);
      setActiveTab('my-lost-reports');
      triggerToast('Lost item report registered! View your saved report copy below.');
    } catch (err) {
      console.error(err);
      triggerToast('Error filing report: ' + (err.response?.data?.error || 'Server error'));
    }
  };

  const handleFoundSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('finder_name', foundForm.finder_name || user?.name || 'Campus Founder');
      formData.append('name', foundForm.name || foundForm.category || 'Found Item');
      formData.append('category', foundForm.category || 'General Item');
      formData.append('brand', foundForm.brand || 'N/A');
      formData.append('color', foundForm.color || 'N/A');
      formData.append('description', foundForm.description || `Found item reported by ${foundForm.finder_name || 'Founder'}`);
      formData.append('location', foundForm.location || 'Campus Premises');
      formData.append('date', foundForm.date || new Date().toISOString().split('T')[0]);
      formData.append('phone', foundForm.phone || '');

      foundFiles.forEach(file => {
        formData.append('images', file);
      });

      await axios.post('/api/items/found/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      fetchData();
      setFoundForm({ finder_name: user?.name || '', name: '', category: 'Water Bottle', brand: '', color: '', description: '', location: '', date: '', phone: '' });
      setFoundFiles([]);
      setFoundPreviews([]);
      setActiveTab('overview');
      triggerToast('Found item reported and added to Ecosystem Catalog!');
    } catch (err) {
      console.error(err);
      triggerToast('Error filing found report: ' + (err.response?.data?.error || 'Server error'));
    }
  };

  // Open Claim Modal
  const openClaimModal = (item) => {
    setClaimTargetItem(item);
    setClaimOwnershipDetails('');
    setClaimProofFiles([]);
    setClaimProofPreviews([]);
    setClaimModalOpen(true);
  };

  const handleClaimSubmit = async (e) => {
    e.preventDefault();
    if (!claimTargetItem || !claimOwnershipDetails) return;
    setClaimSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('itemId', claimTargetItem.id);
      formData.append('ownershipDetails', claimOwnershipDetails);
      formData.append('proof', claimOwnershipDetails);

      claimProofFiles.forEach(file => {
        formData.append('proof_images', file);
      });

      await axios.post('/api/items/claim/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setClaimSubmitting(false);
      setClaimModalOpen(false);
      fetchData();
      triggerToast('Claim request submitted successfully! Admin will verify your proof.');
    } catch (err) {
      setClaimSubmitting(false);
      console.error(err);
      triggerToast('Claim submission error: ' + (err.response?.data?.error || 'Server error'));
    }
  };

  // Admin Actions
  const handleApproveClaim = async (claimId) => {
    try {
      await axios.post(`/api/items/claims/${claimId}/approve/`);
      fetchData();
      triggerToast('Claim approved successfully!');
    } catch (err) {
      triggerToast('Approval failed: ' + (err.response?.data?.error || 'Server error'));
    }
  };

  const handleRejectClaim = async (claimId) => {
    try {
      await axios.post(`/api/items/claims/${claimId}/reject/`);
      fetchData();
      triggerToast('Claim request rejected.');
    } catch (err) {
      triggerToast('Rejection failed: ' + (err.response?.data?.error || 'Server error'));
    }
  };

  const handleDeleteLostItem = async (itemId) => {
    if (!window.confirm("Are you sure you want to remove this lost item report?")) return;
    try {
      await axios.delete(`/api/items/lost/${itemId}/`);
      fetchData();
      if (detailModalItem?.id === itemId || detailModalItem?._id === itemId) setDetailModalItem(null);
      if (reportCopyItem?.id === itemId || reportCopyItem?._id === itemId) setReportCopyItem(null);
      triggerToast('Lost item report removed successfully.');
    } catch (err) {
      triggerToast('Delete failed: ' + (err.response?.data?.error || 'Server error'));
    }
  };

  const handleDeleteFoundItem = async (itemId) => {
    if (!window.confirm("Are you sure you want to remove this found item report?")) return;
    try {
      await axios.delete(`/api/items/found/${itemId}/`);
      fetchData();
      if (detailModalItem?.id === itemId || detailModalItem?._id === itemId) setDetailModalItem(null);
      triggerToast('Found item report removed successfully.');
    } catch (err) {
      triggerToast('Delete failed: ' + (err.response?.data?.error || 'Server error'));
    }
  };

  // Security Verification
  const handleSecurityScan = async (e) => {
    e.preventDefault();
    if (!qrInput) return;
    try {
      const res = await axios.post('/api/items/claims/verify-qr/', { claimId: qrInput.trim() });
      setScanResult(res.data);
    } catch (err) {
      setScanResult({
        success: false,
        message: err.response?.data?.message || err.response?.data?.error || 'Invalid Claim ID ticket.'
      });
    }
  };

  const handleConfirmHandover = async (claimId, message) => {
    try {
      await axios.post('/api/items/claims/handover/', { 
        claimId, 
        deliveryMessage: message || deliveryNoteInput || 'Item was delivered to owner properly.' 
      });
      setScanResult(null);
      setQrInput('');
      setDeliveryModalClaim(null);
      fetchData();
      triggerToast('Delivery confirmed! Recorded message that item was delivered to owner properly.');
    } catch (err) {
      triggerToast('Handover error: ' + (err.response?.data?.error || 'Server error'));
    }
  };

  // Filter Catalog Items
  const filterItem = (item) => {
    const title = (item.name || item.category || '').toLowerCase();
    const desc = (item.description || '').toLowerCase();
    const loc = (item.location || '').toLowerCase();
    const cat = (item.category || '').toLowerCase();
    const query = searchQuery.toLowerCase();

    const matchesQuery = !query || title.includes(query) || desc.includes(query) || loc.includes(query) || cat.includes(query);
    const matchesCategory = searchCategory === 'All' || item.category === searchCategory;
    const matchesStatus = searchStatus === 'All' ? (item.status !== 'Returned' && item.status !== 'Claimed') : item.status === searchStatus;
    const matchesLocation = !searchLocation || loc.includes(searchLocation.toLowerCase());
    const matchesDate = !searchDate || (item.date && item.date.startsWith(searchDate));

    return matchesQuery && matchesCategory && matchesStatus && matchesLocation && matchesDate;
  };

  const filteredLost = lostItems.filter(filterItem);
  const filteredFound = foundItems.filter(filterItem);

  const myLostItems = lostItems.filter(i => {
    const uEmail = (user?.email || user?.Email || '').toLowerCase();
    const uName = (user?.name || user?.Name || '').toLowerCase();
    const uId = str(user?.id || user?._id || user?.UserId || '').toLowerCase();

    const itemEmail = (i.reported_by_email || '').toLowerCase();
    const itemName = (i.reported_by_name || '').toLowerCase();
    const itemId = str(i.reported_by_id || '').toLowerCase();

    if (!uEmail && !uName && !uId) return true;

    return (uEmail && itemEmail === uEmail) || 
           (uName && itemName === uName) || 
           (uId && itemId === uId) ||
           (!itemEmail && !itemName);
  });

  const unreadNotifCount = notifications.filter(n => !n.read).length;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', width: '100%', position: 'relative' }}>
      
      {/* Toast Notification Alert */}
      {showSuccessToast && (
        <div className="glass-panel floating-element" style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          zIndex: 999,
          background: 'var(--bg-secondary)',
          borderLeft: '4px solid var(--primary)',
          padding: '1rem 1.5rem',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-lg)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.8rem'
        }}>
          <Sparkles size={20} style={{ color: 'var(--primary)' }} />
          <span style={{ fontWeight: '600', fontSize: '0.9rem' }}>{showSuccessToast}</span>
        </div>
      )}

      {/* Dashboard Header Bar */}
      <header className="glass-panel floating-element" style={{
        margin: '1.5rem auto 0 auto',
        width: '92%',
        maxWidth: '1400px',
        borderRadius: 'var(--radius-md)',
        padding: '1rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 50
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{
            background: 'linear-gradient(135deg, var(--primary), var(--accent-purple))',
            padding: '0.45rem',
            borderRadius: 'var(--radius-sm)'
          }}>
            <Shield size={22} style={{ color: '#fff' }} />
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: '800', margin: 0, letterSpacing: '-0.5px' }}>
            FINDIT<span className="gradient-text">+</span>
          </h2>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
          
          {/* User Profile Overview */}
          <div style={{ textAlign: 'right' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <span style={{ fontWeight: '600', fontSize: '0.95rem' }}>{user?.name || 'User'}</span>
              <span style={{
                background: 'rgba(59, 130, 246, 0.15)',
                color: 'var(--primary)',
                fontSize: '0.75rem',
                fontWeight: '700',
                padding: '0.2rem 0.6rem',
                borderRadius: '50px',
                border: '1px solid rgba(59, 130, 246, 0.3)'
              }}>
                {user?.role || 'Student'}
              </span>
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.3rem', justifyContent: 'flex-end', marginTop: '0.1rem' }}>
              <Award size={14} style={{ color: 'var(--accent-warning)' }} />
              <span>Trust Score: <strong style={{ color: 'var(--text-primary)' }}>{user?.trust_score ?? 100}</strong></span>
            </div>
          </div>

          {/* Notifications Bell Dropdown Button */}
          <div style={{ position: 'relative' }}>
            <button 
              onClick={() => setShowNotifDropdown(!showNotifDropdown)}
              type="button"
              className="btn btn-secondary"
              style={{ position: 'relative', padding: '0.55rem', borderRadius: '50%' }}>
              <Bell size={18} />
              {unreadNotifCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  background: 'var(--accent-purple)',
                  color: '#fff',
                  fontSize: '0.65rem',
                  fontWeight: '800',
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {unreadNotifCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown Modal */}
            {showNotifDropdown && (
              <div className="glass-panel" style={{
                position: 'absolute',
                top: '2.8rem',
                right: '0',
                width: '340px',
                background: 'var(--bg-secondary)',
                borderRadius: 'var(--radius-md)',
                padding: '1rem',
                boxShadow: '0 15px 40px rgba(0,0,0,0.3)',
                zIndex: 100
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--glass-border)' }}>
                  <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: '700' }}>Notifications ({notifications.length})</h4>
                  <button onClick={() => setShowNotifDropdown(false)} type="button" className="btn btn-secondary" style={{ padding: '0.2rem 0.4rem', fontSize: '0.75rem' }}>Close</button>
                </div>

                <div style={{ maxHeight: '300px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  {notifications.length === 0 ? (
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center', padding: '1rem 0' }}>No notifications yet.</p>
                  ) : (
                    notifications.map(n => (
                      <div key={n.id} style={{
                        padding: '0.7rem',
                        borderRadius: 'var(--radius-sm)',
                        background: n.read ? 'transparent' : 'rgba(59, 130, 246, 0.08)',
                        border: '1px solid var(--glass-border)',
                        textAlign: 'left'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <span style={{ fontWeight: '700', fontSize: '0.85rem', color: 'var(--primary)' }}>{n.title}</span>
                          {!n.read && (
                            <button onClick={() => markNotificationRead(n.id)} type="button" style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.7rem' }}>
                              Read
                            </button>
                          )}
                        </div>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0.3rem 0 0 0', lineHeight: '1.3' }}>{n.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <ThemeSelector align="right" />

          <button onClick={logout} type="button" className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <main className="container" style={{ flex: '1', display: 'flex', gap: '1.5rem', padding: '1.5rem 0' }}>
        
        {/* Navigation Sidebar */}
        <aside className="glass-panel floating-card" style={{ width: '270px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', height: 'fit-content' }}>
          <h4 style={{ textTransform: 'uppercase', fontSize: '0.75rem', color: 'var(--text-muted)', letterSpacing: '1px', paddingLeft: '0.5rem', marginBottom: '0.5rem' }}>Ecosystem Menu</h4>
          
          <button 
            onClick={() => setActiveTab('overview')} 
            type="button"
            className={`btn ${activeTab === 'overview' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ justifyContent: 'flex-start', padding: '0.75rem 1rem', width: '100%', fontSize: '0.9rem' }}>
            <Search size={18} />
            <span>Search & Catalog</span>
          </button>

          <button 
            onClick={() => setActiveTab('report-lost')} 
            type="button"
            className={`btn ${activeTab === 'report-lost' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ justifyContent: 'flex-start', padding: '0.75rem 1rem', width: '100%', fontSize: '0.9rem' }}>
            <PlusCircle size={18} />
            <span>Report Lost Item</span>
          </button>

          <button 
            onClick={() => setActiveTab('report-found')} 
            type="button"
            className={`btn ${activeTab === 'report-found' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ justifyContent: 'flex-start', padding: '0.75rem 1rem', width: '100%', fontSize: '0.9rem' }}>
            <CheckSquare size={18} />
            <span>Report Found Item</span>
          </button>

          <button 
            onClick={() => setActiveTab('claims')} 
            type="button"
            className={`btn ${activeTab === 'claims' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ justifyContent: 'flex-start', padding: '0.75rem 1rem', width: '100%', fontSize: '0.9rem' }}>
            <FileText size={18} />
            <span>My Claim Requests</span>
          </button>

          <button 
            onClick={() => setActiveTab('my-lost-reports')} 
            type="button"
            className={`btn ${activeTab === 'my-lost-reports' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ justifyContent: 'flex-start', padding: '0.75rem 1rem', width: '100%', fontSize: '0.9rem' }}>
            <AlertCircle size={18} />
            <span>My Reported Lost Items</span>
          </button>

          {user?.role === 'Administrator' && (
            <button 
              onClick={() => setActiveTab('admin-panel')} 
              type="button"
              className={`btn ${activeTab === 'admin-panel' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ justifyContent: 'flex-start', padding: '0.75rem 1rem', width: '100%', fontSize: '0.9rem' }}>
              <BarChart2 size={18} />
              <span>Admin Control Panel</span>
            </button>
          )}

          {(user?.role === 'Administrator' || user?.role === 'Security') && (
            <div style={{ marginTop: '2rem', paddingTop: '1.2rem', borderTop: '1px solid var(--glass-border)' }}>
              <h4 style={{ textTransform: 'uppercase', fontSize: '0.75rem', color: 'var(--text-muted)', letterSpacing: '1px', paddingLeft: '0.5rem', marginBottom: '0.5rem' }}>Demo Preset Views</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                <button onClick={() => setActiveTab('report-lost')} type="button" className="btn btn-secondary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}>Lost Form</button>
                <button onClick={() => setActiveTab('report-found')} type="button" className="btn btn-secondary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}>Found Form</button>
                <button onClick={() => setActiveTab('admin-panel')} type="button" className="btn btn-secondary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}>Admin Control</button>
              </div>
            </div>
          )}
        </aside>

        {/* Dynamic Workspace Container */}
        <section style={{ flex: '1', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* TAB 1: Search & Ecosystem Catalog */}
          {activeTab === 'overview' && (
            <div className="fade-in-el" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              {/* Stat Overview Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                
                {/* Active Lost Reports Card */}
                <div 
                  onClick={() => {
                    setActiveTab('overview');
                    setSearchStatus('Lost');
                    setTimeout(() => {
                      document.getElementById('lost-items-section')?.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                  }}
                  className="glass-panel floating-card" 
                  style={{ padding: '1.25rem', textAlign: 'left', cursor: 'pointer', transition: 'all 0.2s ease' }}
                  title="Click to view latest active lost items">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '600' }}>Active Lost Reports</span>
                    <ArrowRight size={16} style={{ color: 'var(--accent-purple)', opacity: 0.8 }} />
                  </div>
                  <h3 style={{ fontSize: '1.8rem', fontWeight: '700', marginTop: '0.3rem', marginBottom: '0.2rem', color: 'var(--accent-purple)' }}>
                    {lostItems.length} Items
                  </h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Click to view latest lost items →</span>
                </div>

                {/* Unclaimed Found Items Card */}
                <div 
                  onClick={() => {
                    setActiveTab('overview');
                    setSearchStatus('Available');
                    setTimeout(() => {
                      document.getElementById('found-items-section')?.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                  }}
                  className="glass-panel floating-card delay-1" 
                  style={{ padding: '1.25rem', textAlign: 'left', cursor: 'pointer', transition: 'all 0.2s ease' }}
                  title="Click to view unclaimed found items">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '600' }}>Unclaimed Found Items</span>
                    <ArrowRight size={16} style={{ color: 'var(--accent-cyan)', opacity: 0.8 }} />
                  </div>
                  <h3 style={{ fontSize: '1.8rem', fontWeight: '700', marginTop: '0.3rem', marginBottom: '0.2rem', color: 'var(--accent-cyan)' }}>
                    {foundItems.length} Items
                  </h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Click to view unclaimed catalog →</span>
                </div>

                {/* Claims in Processing Card */}
                <div 
                  onClick={() => setActiveTab('claims')}
                  className="glass-panel floating-card delay-2" 
                  style={{ padding: '1.25rem', textAlign: 'left', cursor: 'pointer', transition: 'all 0.2s ease' }}
                  title="Click to view claims in processing">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '600' }}>Claims in Processing</span>
                    <ArrowRight size={16} style={{ color: 'var(--primary)', opacity: 0.8 }} />
                  </div>
                  <h3 style={{ fontSize: '1.8rem', fontWeight: '700', marginTop: '0.3rem', marginBottom: '0.2rem', color: 'var(--primary)' }}>
                    {claims.length} Claims
                  </h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Click to view claim requests →</span>
                </div>

                {/* Resolved / Returned Card */}
                <div 
                  onClick={() => {
                    setActiveTab('overview');
                    setSearchStatus('Returned');
                    setTimeout(() => {
                      document.getElementById('found-items-section')?.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                  }}
                  className="glass-panel floating-card delay-3" 
                  style={{ padding: '1.25rem', textAlign: 'left', cursor: 'pointer', transition: 'all 0.2s ease' }}
                  title="Click to view resolved items">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '600' }}>Resolved / Returned</span>
                    <ArrowRight size={16} style={{ color: 'var(--accent-success)', opacity: 0.8 }} />
                  </div>
                  <h3 style={{ fontSize: '1.8rem', fontWeight: '700', marginTop: '0.3rem', marginBottom: '0.2rem', color: 'var(--accent-success)' }}>
                    {foundItems.filter(i => i.status === 'Returned').length + claims.filter(c => c.status === 'Returned').length} Handled
                  </h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Click to view resolved items →</span>
                </div>

              </div>

              {/* Advanced Search & Multi-Filter Bar */}
              <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', textAlign: 'left' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Filter size={18} style={{ color: 'var(--primary)' }} />
                  <h3 style={{ fontSize: '1.1rem', fontWeight: '700', margin: 0 }}>Filter & Search Catalog</h3>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.8rem' }}>
                  
                  {/* Search Query Input */}
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Search Keyword</label>
                    <div style={{ position: 'relative' }}>
                      <Search size={16} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                      <input 
                        type="text" 
                        placeholder="Water Bottle, ID Card, Laptop..." 
                        className="form-input" 
                        style={{ paddingLeft: '2.2rem' }}
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Category Dropdown */}
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Category</label>
                    <select 
                      className="form-input" 
                      value={searchCategory} 
                      onChange={e => setSearchCategory(e.target.value)}>
                      <option value="All">All Categories</option>
                      {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                  </div>

                  {/* Status Dropdown */}
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Status</label>
                    <select 
                      className="form-input" 
                      value={searchStatus} 
                      onChange={e => setSearchStatus(e.target.value)}>
                      <option value="All">All Statuses</option>
                      <option value="Lost">Lost</option>
                      <option value="Available">Available (Found)</option>
                      <option value="Claimed">Claimed</option>
                      <option value="Returned">Returned</option>
                    </select>
                  </div>

                  {/* Location Search */}
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Location</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Library, Lab 3" 
                      className="form-input"
                      value={searchLocation}
                      onChange={e => setSearchLocation(e.target.value)}
                    />
                  </div>

                  {/* Date Search */}
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Date</label>
                    <input 
                      type="date" 
                      className="form-input"
                      value={searchDate}
                      onChange={e => setSearchDate(e.target.value)}
                    />
                  </div>

                </div>

                {/* Example Quick Presets */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap', marginTop: '0.4rem' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: '600' }}>Examples:</span>
                  {EXAMPLE_SEARCH_PRESETS.map(preset => (
                    <button 
                      key={preset}
                      type="button"
                      onClick={() => { setSearchQuery(preset); setSearchCategory(preset); }}
                      className="btn btn-secondary"
                      style={{ padding: '0.2rem 0.6rem', fontSize: '0.75rem', borderRadius: '50px' }}>
                      {preset}
                    </button>
                  ))}
                  {(searchQuery || searchCategory !== 'All' || searchStatus !== 'All' || searchLocation || searchDate) && (
                    <button 
                      type="button"
                      onClick={() => { setSearchQuery(''); setSearchCategory('All'); setSearchStatus('All'); setSearchLocation(''); setSearchDate(''); }}
                      className="btn btn-secondary"
                      style={{ padding: '0.2rem 0.6rem', fontSize: '0.75rem', color: 'var(--accent-error)' }}>
                      Reset Filters
                    </button>
                  )}
                </div>
              </div>

              {/* LOST ITEMS CATALOG GRID */}
              <div id="lost-items-section" className="glass-panel" style={{ padding: '1.5rem', textAlign: 'left', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: '700', margin: 0 }}>
                    Reported Lost Items ({filteredLost.length})
                  </h3>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Items reported missing by students</span>
                </div>

                {filteredLost.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', padding: '2rem 0', textAlign: 'center' }}>
                    No reported lost items matching current filters.
                  </p>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.2rem' }}>
                    {filteredLost.map((item, idx) => (
                      <div 
                        key={item.id || item._id || idx} 
                        className="glass-panel" 
                        onClick={() => setDetailModalItem(item)}
                        style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.8rem', cursor: 'pointer', transition: 'transform 0.2s ease' }}>
                        
                        <div style={{
                          height: '140px',
                          borderRadius: 'var(--radius-sm)',
                          overflow: 'hidden',
                          background: 'rgba(0,0,0,0.2)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          position: 'relative'
                        }}>
                          {(item.images && item.images.length > 0) ? (
                            <img src={item.images[0]} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : item.image_url ? (
                            <img src={item.image_url} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: 'var(--text-muted)' }}>
                              <AlertCircle size={32} style={{ color: 'var(--accent-purple)' }} />
                              <span style={{ fontSize: '0.75rem', marginTop: '0.3rem' }}>Missing Photo</span>
                            </div>
                          )}

                          <span style={{
                            position: 'absolute',
                            top: '0.5rem',
                            right: '0.5rem',
                            background: 'var(--accent-purple)',
                            color: '#fff',
                            fontSize: '0.7rem',
                            fontWeight: '700',
                            padding: '0.2rem 0.5rem',
                            borderRadius: '50px'
                          }}>
                            {item.status || 'Lost'}
                          </span>
                        </div>

                        <div>
                          <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: '700' }}>{item.name || item.category}</h4>
                          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.3rem', lineHeight: '1.4' }}>{item.description}</p>
                        </div>

                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <Tag size={14} style={{ color: 'var(--primary)' }} />
                            <span>Category: {item.category}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <MapPin size={14} style={{ color: 'var(--accent-cyan)' }} />
                            <span>Location Lost: {item.location}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <Calendar size={14} style={{ color: 'var(--accent-purple)' }} />
                            <span>Date Lost: {item.date}</span>
                          </div>
                          {item.contact_phone && (
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              background: 'rgba(59, 130, 246, 0.1)',
                              border: '1px solid rgba(59, 130, 246, 0.3)',
                              borderRadius: 'var(--radius-sm)',
                              padding: '0.35rem 0.6rem',
                              marginTop: '0.2rem'
                            }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--primary)', fontSize: '0.8rem', fontWeight: '700' }}>
                                <Phone size={14} />
                                <span>{item.contact_phone}</span>
                              </div>
                              <a 
                                href={`tel:${item.contact_phone}`} 
                                onClick={e => e.stopPropagation()}
                                className="btn btn-secondary"
                                style={{
                                  padding: '0.2rem 0.5rem',
                                  fontSize: '0.75rem',
                                  fontWeight: '700',
                                  borderColor: 'var(--primary)',
                                  color: 'var(--primary)',
                                  textDecoration: 'none'
                                }}>
                                Direct Call
                              </a>
                            </div>
                          )}
                        </div>

                        {/* View Item Details & I Found This Item Buttons */}
                        <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.3rem' }}>
                          <button 
                            type="button" 
                            onClick={e => {
                              e.stopPropagation();
                              setFoundForm(prev => ({
                                ...prev,
                                name: item.name || item.category || '',
                                category: item.category || 'General',
                                location: item.location || ''
                              }));
                              setActiveTab('report-found');
                              triggerToast(`Reporting found item matching '${item.name || item.category}'!`);
                            }}
                            className="btn btn-primary pulse-glow" 
                            style={{ flex: 1, fontSize: '0.78rem', padding: '0.45rem', background: 'var(--accent-purple)' }}>
                            <CheckSquare size={14} />
                            <span>I Found This! 🙋‍♂️</span>
                          </button>

                          <button 
                            type="button" 
                            onClick={e => { e.stopPropagation(); setDetailModalItem(item); }}
                            className="btn btn-secondary" 
                            style={{ fontSize: '0.78rem', padding: '0.45rem' }}>
                            <Info size={14} />
                            <span>Details</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* FOUND ITEMS CATALOG GRID */}
              <div id="found-items-section" className="glass-panel" style={{ padding: '1.5rem', textAlign: 'left' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: '700', margin: 0 }}>
                    Found Items Catalog ({filteredFound.length})
                  </h3>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Items turned in by campus community</span>
                </div>

                {filteredFound.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', padding: '2rem 0', textAlign: 'center' }}>
                    No found items matching current search filters.
                  </p>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.2rem' }}>
                    {filteredFound.map((item, idx) => (
                      <div 
                        key={item.id || item._id || idx} 
                        className="glass-panel" 
                        onClick={() => setDetailModalItem(item)}
                        style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.8rem', cursor: 'pointer', transition: 'transform 0.2s ease' }}>
                        
                        {/* Image Gallery Preview */}
                        <div style={{
                          height: '160px',
                          borderRadius: 'var(--radius-sm)',
                          overflow: 'hidden',
                          background: 'rgba(0,0,0,0.2)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          position: 'relative'
                        }}>
                          {(item.images && item.images.length > 0) ? (
                            <img src={item.images[0]} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : item.image_url ? (
                            <img src={item.image_url} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: 'var(--text-muted)' }}>
                              <ImageIcon size={32} />
                              <span style={{ fontSize: '0.75rem', marginTop: '0.3rem' }}>No Photo Provided</span>
                            </div>
                          )}

                          <span style={{
                            position: 'absolute',
                            top: '0.5rem',
                            right: '0.5rem',
                            background: item.status === 'Returned' ? 'var(--accent-success)' : 'var(--primary)',
                            color: '#fff',
                            fontSize: '0.7rem',
                            fontWeight: '700',
                            padding: '0.2rem 0.5rem',
                            borderRadius: '50px'
                          }}>
                            {item.status || 'Available'}
                          </span>
                        </div>

                        <div>
                          <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: '700' }}>{item.name || item.category}</h4>
                          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.3rem', lineHeight: '1.4' }}>{item.description}</p>
                        </div>

                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <User size={14} style={{ color: 'var(--primary)' }} />
                            <span>Founder / Finder: <strong style={{ color: 'var(--text-primary)' }}>{item.reported_by_name || 'Campus Founder'}</strong></span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <MapPin size={14} style={{ color: 'var(--accent-purple)' }} />
                            <span>Location Found: {item.location}</span>
                          </div>
                          {item.contact_phone && (
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              background: 'rgba(16, 185, 129, 0.1)',
                              border: '1px solid rgba(16, 185, 129, 0.3)',
                              borderRadius: 'var(--radius-sm)',
                              padding: '0.35rem 0.6rem',
                              marginTop: '0.2rem'
                            }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-success)', fontSize: '0.8rem', fontWeight: '700' }}>
                                <Phone size={14} />
                                <span>{item.contact_phone}</span>
                              </div>
                              <a 
                                href={`tel:${item.contact_phone}`} 
                                className="btn btn-secondary"
                                style={{
                                  padding: '0.2rem 0.5rem',
                                  fontSize: '0.75rem',
                                  fontWeight: '700',
                                  borderColor: 'var(--accent-success)',
                                  color: 'var(--accent-success)',
                                  textDecoration: 'none'
                                }}>
                                Direct Call
                              </a>
                            </div>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.4rem' }}>
                          <button 
                            onClick={() => setFounderModalItem(item)}
                            type="button" 
                            className="btn btn-secondary"
                            style={{ flex: 1, padding: '0.55rem', fontSize: '0.8rem' }}>
                            <User size={14} />
                            <span>Founder Details</span>
                          </button>
                          {item.status !== 'Returned' && (
                            <button 
                              onClick={() => openClaimModal(item)}
                              type="button" 
                              className="btn btn-primary"
                              style={{ flex: 1.2, padding: '0.55rem', fontSize: '0.85rem' }}>
                              <CheckCircle size={16} />
                              <span>Claim Item</span>
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB 2: Report Lost Item */}
          {activeTab === 'report-lost' && (
            <div className="glass-panel fade-in-el" style={{ padding: '2rem', textAlign: 'left', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.5rem' }}>
                <PlusCircle size={24} style={{ color: 'var(--primary)' }} />
                <div>
                  <h3 style={{ fontSize: '1.4rem', fontWeight: '800', margin: 0 }}>Report Lost Belonging</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>File a report to search campus ecosystem and alert community</p>
                </div>
              </div>

              <form onSubmit={handleLostSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Item Name *</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="e.g. Blue HydroFlask, HP Laptop..." 
                      className="form-input" 
                      value={lostForm.name} 
                      onChange={e => setLostForm({ ...lostForm, name: e.target.value })} 
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Category *</label>
                    <select 
                      className="form-input" 
                      value={lostForm.category} 
                      onChange={e => setLostForm({ ...lostForm, category: e.target.value })}>
                      {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Location Lost *</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="e.g. Central Library 2nd Floor, Canteen" 
                      className="form-input" 
                      value={lostForm.location} 
                      onChange={e => setLostForm({ ...lostForm, location: e.target.value })} 
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Date Lost *</label>
                    <input 
                      type="date" 
                      required 
                      className="form-input" 
                      value={lostForm.date} 
                      onChange={e => setLostForm({ ...lostForm, date: e.target.value })} 
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Contact Phone Number *</label>
                    <input 
                      type="tel" 
                      required
                      placeholder="e.g. +91 9876543210" 
                      className="form-input" 
                      value={lostForm.phone} 
                      onChange={e => setLostForm({ ...lostForm, phone: e.target.value })} 
                    />
                  </div>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Item Description & Distinctive Features *</label>
                  <textarea 
                    rows={3} 
                    required 
                    placeholder="Describe color, brand, stickers, scratches, or unique marks..." 
                    className="form-input" 
                    value={lostForm.description} 
                    onChange={e => setLostForm({ ...lostForm, description: e.target.value })} 
                  />
                </div>

                {/* Multi-Image File Upload with Live Preview */}
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Upload Item Photos (Multiple Photos Allowed)</label>
                  <input 
                    type="file" 
                    multiple 
                    accept="image/*" 
                    onChange={handleLostFilesChange}
                    className="form-input" 
                    style={{ padding: '0.6rem' }}
                  />

                  {lostPreviews.length > 0 && (
                    <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', marginTop: '0.8rem' }}>
                      {lostPreviews.map((src, i) => (
                        <div key={i} style={{ position: 'relative', width: '80px', height: '80px', borderRadius: 'var(--radius-sm)', overflow: 'hidden', border: '1px solid var(--glass-border)' }}>
                          <img src={src} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          <button 
                            type="button" 
                            onClick={() => removeLostFile(i)} 
                            style={{ position: 'absolute', top: '2px', right: '2px', background: 'rgba(0,0,0,0.7)', border: 'none', color: '#fff', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <button type="submit" className="btn btn-primary pulse-glow" style={{ padding: '0.9rem', marginTop: '0.5rem' }}>
                  <PlusCircle size={18} />
                  <span>Submit Lost Item Report</span>
                </button>
              </form>
            </div>
          )}

          {/* TAB 3: Report Found Item */}
          {activeTab === 'report-found' && (
            <div className="glass-panel fade-in-el" style={{ padding: '2rem', textAlign: 'left', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.5rem' }}>
                <CheckSquare size={24} style={{ color: 'var(--accent-cyan)' }} />
                <div>
                  <h3 style={{ fontSize: '1.4rem', fontWeight: '800', margin: 0 }}>Report Found Item</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>Help reunite a belonging with its owner by cataloging what you found</p>
                </div>
              </div>

              <form onSubmit={handleFoundSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Founder Name *</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="Founder / Finder full name..." 
                      className="form-input" 
                      value={foundForm.finder_name} 
                      onChange={e => setFoundForm({ ...foundForm, finder_name: e.target.value })} 
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Founder Contact Phone *</label>
                    <input 
                      type="tel" 
                      required
                      placeholder="e.g. +91 9876543210" 
                      className="form-input" 
                      value={foundForm.phone} 
                      onChange={e => setFoundForm({ ...foundForm, phone: e.target.value })} 
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Item Name *</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="e.g. Student ID Card, HydroFlask..." 
                      className="form-input" 
                      value={foundForm.name} 
                      onChange={e => setFoundForm({ ...foundForm, name: e.target.value })} 
                    />
                  </div>
                </div>

                {/* Photo Upload with Live Preview */}
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Upload Item Image / Photos *</label>
                  <input 
                    type="file" 
                    multiple 
                    accept="image/*" 
                    required={foundFiles.length === 0}
                    onChange={handleFoundFilesChange}
                    className="form-input" 
                    style={{ padding: '0.6rem' }}
                  />

                  {foundPreviews.length > 0 && (
                    <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', marginTop: '0.8rem' }}>
                      {foundPreviews.map((src, i) => (
                        <div key={i} style={{ position: 'relative', width: '90px', height: '90px', borderRadius: 'var(--radius-sm)', overflow: 'hidden', border: '1px solid var(--glass-border)' }}>
                          <img src={src} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          <button 
                            type="button" 
                            onClick={() => removeFoundFile(i)} 
                            style={{ position: 'absolute', top: '2px', right: '2px', background: 'rgba(0,0,0,0.7)', border: 'none', color: '#fff', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <button type="submit" className="btn btn-primary pulse-glow" style={{ padding: '0.9rem', marginTop: '0.5rem' }}>
                  <CheckSquare size={18} />
                  <span>Submit Found Item Report & Alert Owner</span>
                </button>
              </form>
            </div>
          )}

          {/* TAB 4: My Claim Requests */}
          {activeTab === 'claims' && (
            <div className="glass-panel fade-in-el" style={{ padding: '1.5rem', textAlign: 'left' }}>
              <h3 style={{ fontSize: '1.3rem', fontWeight: '800', marginBottom: '1rem' }}>My Claim Requests ({claims.length})</h3>

              {claims.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', padding: '2rem 0', textAlign: 'center' }}>
                  You have not submitted any claim requests yet. Browse the catalog to claim a found item!
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {claims.map(c => (
                    <div key={c.id} className="glass-panel" onClick={() => setQrModalClaim(c)} style={{ padding: '1rem 1.2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                          <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: '700' }}>{c.item_name || c.item_description}</h4>
                          <span style={{
                            background: 'rgba(16, 185, 129, 0.15)',
                            color: 'var(--accent-success)',
                            fontSize: '0.75rem',
                            fontWeight: '700',
                            padding: '0.2rem 0.6rem',
                            borderRadius: '50px'
                          }}>
                            Direct Contact Active
                          </span>
                        </div>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.4rem' }}>
                          <strong>Founder:</strong> {c.founder_name || 'Campus Founder'} {c.founder_phone ? `| Phone: ${c.founder_phone}` : ''}
                        </p>
                      </div>

                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {c.founder_phone && (
                          <a 
                            href={`tel:${c.founder_phone}`}
                            className="btn btn-primary pulse-glow"
                            style={{ padding: '0.5rem 0.9rem', fontSize: '0.8rem', background: 'var(--accent-success)', textDecoration: 'none' }}>
                            <Phone size={16} />
                            <span>Call Founder</span>
                          </a>
                        )}
                        <button 
                          onClick={() => setQrModalClaim(c)}
                          type="button" 
                          className="btn btn-secondary" 
                          style={{ padding: '0.5rem 0.9rem', fontSize: '0.8rem' }}>
                          <CheckCircle size={16} />
                          <span>View Ticket</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB: My Reported Lost Items */}
          {activeTab === 'my-lost-reports' && (
            <div className="glass-panel fade-in-el" style={{ padding: '1.5rem', textAlign: 'left' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: '800', margin: 0 }}>My Reported Lost Items</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0.2rem 0 0 0' }}>
                    Official digital copy records of items you reported missing on campus
                  </p>
                </div>
                <button onClick={() => setActiveTab('report-lost')} type="button" className="btn btn-primary">
                  <PlusCircle size={16} />
                  <span>Report New Lost Item</span>
                </button>
              </div>

              {myLostItems.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', padding: '2rem 0', textAlign: 'center' }}>
                  You have not submitted any lost item reports yet.
                </p>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.2rem' }}>
                  {myLostItems.map((item, idx) => (
                    <div key={item.id || item._id || idx} className="glass-panel" style={{ padding: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.8rem', border: '1px solid var(--glass-border)' }}>
                      
                      {/* Header Badge & Ref ID */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--primary)', letterSpacing: '0.5px' }}>
                          #FINDIT-L-{str(item.id || item._id).slice(-6).toUpperCase()}
                        </span>
                        <span style={{
                          background: item.status === 'Returned' ? 'var(--accent-success)' : 'var(--accent-purple)',
                          color: '#fff', fontSize: '0.7rem', fontWeight: '700', padding: '0.2rem 0.6rem', borderRadius: '50px'
                        }}>
                          {item.status || 'Active Lost'}
                        </span>
                      </div>

                      {/* Photo Preview if available */}
                      {(item.images?.length > 0 || item.image_url) && (
                        <div style={{ height: '140px', borderRadius: 'var(--radius-sm)', overflow: 'hidden', background: '#000' }}>
                          <img src={item.images?.[0] || item.image_url} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                        </div>
                      )}

                      <div>
                        <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '800' }}>{item.name || item.category}</h4>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.3rem', lineHeight: '1.4' }}>{item.description}</p>
                      </div>

                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                        <div>📍 Location Lost: <strong>{item.location}</strong></div>
                        <div>📅 Date Lost: <strong>{item.date}</strong></div>
                        {item.contact_phone && <div>📞 Contact Phone: <strong>{item.contact_phone}</strong></div>}
                      </div>

                      {/* Action Buttons */}
                      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.4rem' }}>
                        <button 
                          onClick={() => setReportCopyItem(item)}
                          type="button" 
                          className="btn btn-primary pulse-glow"
                          style={{ flex: 1, padding: '0.55rem', fontSize: '0.8rem' }}>
                          <Upload size={14} />
                          <span>View / Print Copy</span>
                        </button>
                        <button 
                          onClick={() => handleDeleteLostItem(item.id || item._id)}
                          type="button" 
                          className="btn btn-secondary"
                          style={{ padding: '0.55rem 0.8rem', fontSize: '0.8rem', color: 'var(--accent-error)', borderColor: 'rgba(239, 68, 68, 0.3)' }}>
                          <Trash2 size={14} />
                          <span>Remove</span>
                        </button>
                      </div>

                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: Admin Control Panel */}
          {activeTab === 'admin-panel' && user?.role === 'Administrator' && (
            <div className="fade-in-el" style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              
              <div className="glass-panel" style={{ padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ textAlign: 'left' }}>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: '800', margin: 0 }}>Admin Master Control Center</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>Master overview of all Lost Items, Found Items, Claims, and System Analytics</p>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button 
                    onClick={() => setAdminSubTab('claims')} 
                    type="button" 
                    className={`btn ${adminSubTab === 'claims' ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
                    Claims ({claims.length})
                  </button>
                  <button 
                    onClick={() => setAdminSubTab('lost-list')} 
                    type="button" 
                    className={`btn ${adminSubTab === 'lost-list' ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
                    Lost Reports ({lostItems.length})
                  </button>
                  <button 
                    onClick={() => setAdminSubTab('found-list')} 
                    type="button" 
                    className={`btn ${adminSubTab === 'found-list' ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
                    Found Catalog ({foundItems.length})
                  </button>
                </div>
              </div>

              {/* ADMIN SUB-TAB 1: Claims Moderation */}
              {adminSubTab === 'claims' && (
                <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'left' }}>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '1rem' }}>Pending Claim Verification Requests</h4>

                  {claims.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', padding: '1rem 0' }}>No claim requests pending.</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {claims.map((c, idx) => (
                        <div 
                          key={c.id || c._id || idx} 
                          className="glass-panel" 
                          onClick={() => setClaimDetailModal(c)}
                          style={{ padding: '1rem 1.2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', cursor: 'pointer', transition: 'transform 0.2s ease' }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                              <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: '700' }}>{c.item_name || c.item_description}</h4>
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Claimant: {c.claimant_name} ({c.claimant_email})</span>
                            </div>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.3rem' }}>
                              <strong>Submitted Proof Details:</strong> {c.ownership_details || c.proof}
                            </p>

                            {/* Proof Image Gallery */}
                            {(c.proof_images && c.proof_images.length > 0) && (
                              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.6rem' }}>
                                {c.proof_images.map((imgUrl, i) => (
                                  <img key={i} src={imgUrl} alt="proof" style={{ width: '60px', height: '60px', borderRadius: 'var(--radius-sm)', objectFit: 'cover', border: '1px solid var(--glass-border)' }} />
                                ))}
                              </div>
                            )}
                          </div>

                          {c.status === 'Pending Approval' ? (
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              <button 
                                onClick={() => handleApproveClaim(c.id)} 
                                type="button" 
                                className="btn btn-primary"
                                style={{ padding: '0.5rem 0.8rem', fontSize: '0.8rem', background: 'var(--accent-success)' }}>
                                <Check size={16} />
                                <span>Approve</span>
                              </button>
                              <button 
                                onClick={() => handleRejectClaim(c.id)} 
                                type="button" 
                                className="btn btn-secondary"
                                style={{ padding: '0.5rem 0.8rem', fontSize: '0.8rem', color: 'var(--accent-error)' }}>
                                <X size={16} />
                                <span>Reject</span>
                              </button>
                            </div>
                          ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.4rem' }}>
                              <span style={{ fontWeight: '700', fontSize: '0.85rem', color: c.status === 'Returned' ? 'var(--accent-cyan)' : 'var(--accent-success)' }}>
                                {c.delivered_status || c.status}
                              </span>
                              {c.delivery_message && (
                                <div style={{ fontSize: '0.75rem', color: 'var(--accent-success)', fontStyle: 'italic', textAlign: 'right' }}>
                                  "{c.delivery_message}"
                                </div>
                              )}
                              {c.status !== 'Returned' && (
                                <button 
                                  onClick={() => {
                                    setDeliveryModalClaim(c);
                                    setDeliveryNoteInput(`Item '${c.item_name || 'belonging'}' was delivered to owner ${c.claimant_name} properly.`);
                                  }}
                                  type="button" 
                                  className="btn btn-primary pulse-glow"
                                  style={{ padding: '0.45rem 0.8rem', fontSize: '0.75rem', background: 'var(--accent-success)' }}>
                                  <CheckCircle size={14} />
                                  <span>Confirm Delivered to Owner</span>
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ADMIN SUB-TAB 2: Lost Items Control & Fake Removal */}
              {adminSubTab === 'lost-list' && (
                <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'left' }}>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '1rem' }}>Manage Lost Items (Remove Fake Reports)</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                    {lostItems.map(item => (
                      <div key={item.id} className="glass-panel" style={{ padding: '0.8rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <strong style={{ fontSize: '0.95rem' }}>{item.name || item.category}</strong>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: '0.8rem' }}>
                            Reported by: {item.reported_by_name} ({item.location}, {item.date})
                          </span>
                        </div>
                        <button 
                          onClick={() => handleDeleteLostItem(item.id)} 
                          type="button" 
                          className="btn btn-secondary"
                          style={{ padding: '0.35rem 0.7rem', fontSize: '0.75rem', color: 'var(--accent-error)' }}>
                          <Trash2 size={14} />
                          <span>Remove Report</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ADMIN SUB-TAB 3: Found Items Control & Fake Removal */}
              {adminSubTab === 'found-list' && (
                <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'left' }}>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '1rem' }}>Manage Found Items (Remove Fake Reports)</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                    {foundItems.map(item => (
                      <div key={item.id} className="glass-panel" style={{ padding: '0.8rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <strong style={{ fontSize: '0.95rem' }}>{item.name || item.category}</strong>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: '0.8rem' }}>
                            Found at: {item.location} ({item.date}) | Status: {item.status}
                          </span>
                        </div>
                        <button 
                          onClick={() => handleDeleteFoundItem(item.id)} 
                          type="button" 
                          className="btn btn-secondary"
                          style={{ padding: '0.35rem 0.7rem', fontSize: '0.75rem', color: 'var(--accent-error)' }}>
                          <Trash2 size={14} />
                          <span>Remove Report</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}



        </section>
      </main>

      {/* CLAIM REQUEST SUBMISSION MODAL */}
      {claimModalOpen && claimTargetItem && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.65)',
          backdropFilter: 'blur(10px)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem'
        }}>
          <div className="glass-panel floating-card" style={{
            maxWidth: '550px',
            width: '100%',
            background: 'var(--bg-secondary)',
            borderRadius: 'var(--radius-lg)',
            padding: '2rem',
            textAlign: 'left'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '800' }}>Submit Claim for Item</h3>
              <button onClick={() => setClaimModalOpen(false)} type="button" style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.2rem' }}>
              Item: <strong style={{ color: 'var(--primary)' }}>{claimTargetItem.name || claimTargetItem.category}</strong> (Found at {claimTargetItem.location})
            </p>

            <form onSubmit={handleClaimSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Ownership Details & Distinctive Marks *</label>
                <textarea 
                  rows={3} 
                  required
                  placeholder="Describe secret marks, stickers, serial numbers, wallpaper, or unique features..."
                  className="form-input"
                  value={claimOwnershipDetails}
                  onChange={e => setClaimOwnershipDetails(e.target.value)}
                />
              </div>

              {/* Proof Document / ID Card Multi-file Upload */}
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Upload Proof (ID Card, Purchase Bill, or Photo Proof)</label>
                <input 
                  type="file" 
                  multiple
                  accept="image/*"
                  onChange={handleClaimFilesChange}
                  className="form-input"
                  style={{ padding: '0.6rem' }}
                />

                {claimProofPreviews.length > 0 && (
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.6rem', flexWrap: 'wrap' }}>
                    {claimProofPreviews.map((src, i) => (
                      <div key={i} style={{ position: 'relative', width: '65px', height: '65px', borderRadius: 'var(--radius-sm)', overflow: 'hidden', border: '1px solid var(--glass-border)' }}>
                        <img src={src} alt="proof preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <button type="button" onClick={() => removeClaimFile(i)} style={{ position: 'absolute', top: '1px', right: '1px', background: 'rgba(0,0,0,0.7)', color: '#fff', border: 'none', borderRadius: '50%', width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                          <X size={10} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '0.8rem', marginTop: '0.5rem' }}>
                <button type="submit" disabled={claimSubmitting} className="btn btn-primary pulse-glow" style={{ flex: 1, padding: '0.8rem' }}>
                  {claimSubmitting ? 'Submitting...' : 'Submit Claim Verification'}
                </button>
                <button onClick={() => setClaimModalOpen(false)} type="button" className="btn btn-secondary" style={{ padding: '0.8rem 1.2rem' }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* APPROVED CLAIM TICKET MODAL */}
      {qrModalClaim && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(10px)',
          zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
        }}>
          <div className="glass-panel floating-card" style={{
            maxWidth: '460px', width: '100%', background: 'var(--bg-secondary)',
            borderRadius: 'var(--radius-lg)', padding: '2rem', textAlign: 'center'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '800' }}>Claim Verification Ticket</h3>
              <button onClick={() => setQrModalClaim(null)} type="button" style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{
              background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)',
              padding: '1.5rem', borderRadius: 'var(--radius-md)', margin: '1rem 0', display: 'flex',
              flexDirection: 'column', alignItems: 'center', gap: '0.6rem'
            }}>
              <CheckCircle2 size={56} style={{ color: 'var(--accent-success)' }} />
              <div style={{ color: 'var(--accent-success)', fontWeight: '800', fontSize: '1.1rem' }}>
                APPROVED FOR ITEM PICKUP
              </div>
              <div style={{
                background: 'var(--bg-tertiary)', padding: '0.4rem 0.8rem', borderRadius: 'var(--radius-sm)',
                fontWeight: '700', fontSize: '0.9rem', color: 'var(--primary)', letterSpacing: '1px', border: '1px solid var(--glass-border)'
              }}>
                TICKET ID: #FINDIT-V-{str(qrModalClaim.id || qrModalClaim._id).slice(-6).toUpperCase()}
              </div>
            </div>

            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.5', textAlign: 'left', marginBottom: '1.2rem' }}>
              <div><strong>Item:</strong> {qrModalClaim.item_name || qrModalClaim.item_description}</div>
              <div><strong>Ownership Details:</strong> {qrModalClaim.ownership_details || qrModalClaim.proof}</div>
            </div>

            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: '1.4', marginBottom: '1.2rem' }}>
              Your ownership details have been verified and approved. Present this Ticket ID to Security / Admin when collecting your item.
            </p>

            <button onClick={() => setQrModalClaim(null)} type="button" className="btn btn-primary" style={{ width: '100%', padding: '0.8rem' }}>
              Done / Close Ticket
            </button>
          </div>
        </div>
      )}

      {/* FOUNDER DETAILS MODAL */}
      {founderModalItem && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(10px)',
          zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
        }}>
          <div className="glass-panel floating-card" style={{
            maxWidth: '440px', width: '100%', background: 'var(--bg-secondary)',
            borderRadius: 'var(--radius-lg)', padding: '2rem', textAlign: 'center'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '800' }}>Founder Contact Details</h3>
              <button onClick={() => setFounderModalItem(null)} type="button" style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            {/* Item Image Preview */}
            {(founderModalItem.images?.length > 0 || founderModalItem.image_url) && (
              <div style={{ height: '160px', borderRadius: 'var(--radius-md)', overflow: 'hidden', marginBottom: '1.2rem', border: '1px solid var(--glass-border)' }}>
                <img src={founderModalItem.images?.[0] || founderModalItem.image_url} alt="found item" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            )}

            <div style={{
              background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)',
              padding: '1.2rem', borderRadius: 'var(--radius-md)', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '0.9rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
                <User size={20} style={{ color: 'var(--primary)' }} />
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>FOUNDER / FINDER NAME</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                    {founderModalItem.reported_by_name || 'Campus Founder'}
                  </div>
                </div>
              </div>

              {founderModalItem.contact_phone && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
                  <Phone size={20} style={{ color: 'var(--accent-success)' }} />
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>CONTACT PHONE NUMBER</div>
                    <div style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--accent-success)' }}>
                      {founderModalItem.contact_phone}
                    </div>
                  </div>
                </div>
              )}

              {founderModalItem.reported_by_email && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
                  <FileText size={20} style={{ color: 'var(--accent-cyan)' }} />
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>EMAIL ADDRESS</div>
                    <div style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-secondary)' }}>
                      {founderModalItem.reported_by_email}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '0.8rem', marginTop: '1.2rem' }}>
              {founderModalItem.contact_phone && (
                <a 
                  href={`tel:${founderModalItem.contact_phone}`} 
                  className="btn btn-primary pulse-glow" 
                  style={{ flex: 1, padding: '0.8rem', textDecoration: 'none', background: 'var(--accent-success)' }}>
                  <Phone size={16} />
                  <span>Call Founder</span>
                </a>
              )}
              <button onClick={() => setFounderModalItem(null)} type="button" className="btn btn-secondary" style={{ padding: '0.8rem 1.2rem' }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FULL ITEM DETAILS MODAL */}
      {detailModalItem && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(12px)',
          zIndex: 1050, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
        }}>
          <div className="glass-panel floating-card fade-in-el" style={{
            maxWidth: '560px', width: '100%', maxHeight: '90vh', overflowY: 'auto',
            background: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)', padding: '2rem', textAlign: 'left'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: '800' }}>
                  {detailModalItem.name || detailModalItem.category}
                </h3>
                <span style={{
                  background: detailModalItem.status === 'Lost' ? 'var(--accent-purple)' : 'var(--primary)',
                  color: '#fff', fontSize: '0.75rem', fontWeight: '700', padding: '0.2rem 0.6rem', borderRadius: '50px'
                }}>
                  {detailModalItem.status || 'Active'}
                </span>
              </div>
              <button onClick={() => setDetailModalItem(null)} type="button" style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={22} />
              </button>
            </div>

            {/* Main Image Display */}
            {(detailModalItem.images?.length > 0 || detailModalItem.image_url) ? (
              <div style={{ height: '240px', borderRadius: 'var(--radius-md)', overflow: 'hidden', marginBottom: '1.2rem', border: '1px solid var(--glass-border)', background: '#000' }}>
                <img 
                  src={detailModalItem.images?.[0] || detailModalItem.image_url} 
                  alt={detailModalItem.name} 
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
                />
              </div>
            ) : (
              <div style={{ height: '120px', borderRadius: 'var(--radius-md)', background: 'rgba(0,0,0,0.2)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', marginBottom: '1.2rem' }}>
                <ImageIcon size={36} />
                <span style={{ fontSize: '0.8rem', marginTop: '0.4rem' }}>No Image Photo Uploaded</span>
              </div>
            )}

            {/* Details Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem', marginBottom: '1.2rem' }}>
              <div className="glass-panel" style={{ padding: '0.8rem 1rem' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>CATEGORY</div>
                <div style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--text-primary)' }}>{detailModalItem.category}</div>
              </div>

              <div className="glass-panel" style={{ padding: '0.8rem 1rem' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>LOCATION</div>
                <div style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--text-primary)' }}>{detailModalItem.location}</div>
              </div>

              <div className="glass-panel" style={{ padding: '0.8rem 1rem' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>DATE REPORTED</div>
                <div style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--text-primary)' }}>{detailModalItem.date}</div>
              </div>

              <div className="glass-panel" style={{ padding: '0.8rem 1rem' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>REPORTER / FINDER</div>
                <div style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--text-primary)' }}>{detailModalItem.reported_by_name || 'Campus Member'}</div>
              </div>
            </div>

            {/* Full Description Box */}
            <div style={{ marginBottom: '1.2rem' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Full Item Description</div>
              <div className="glass-panel" style={{ padding: '1rem', fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                {detailModalItem.description || 'No detailed description provided.'}
              </div>
            </div>

            {/* Direct Contact Phone Box */}
            {detailModalItem.contact_phone && (
              <div style={{
                background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.3)',
                borderRadius: 'var(--radius-md)', padding: '0.9rem 1.2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem'
              }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>DIRECT CONTACT PHONE</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--accent-success)' }}>{detailModalItem.contact_phone}</div>
                </div>
                <a 
                  href={`tel:${detailModalItem.contact_phone}`} 
                  onClick={e => e.stopPropagation()}
                  className="btn btn-primary pulse-glow" 
                  style={{ padding: '0.5rem 1rem', background: 'var(--accent-success)', textDecoration: 'none' }}>
                  <Phone size={16} />
                  <span>Call Directly</span>
                </a>
              </div>
            )}

            {/* Action Footer */}
            <div style={{ display: 'flex', gap: '0.8rem', marginTop: '1.2rem' }}>
              {detailModalItem.status === 'Lost' && (
                <button 
                  onClick={() => {
                    setFoundForm(prev => ({
                      ...prev,
                      name: detailModalItem.name || detailModalItem.category || '',
                      category: detailModalItem.category || 'General',
                      location: detailModalItem.location || ''
                    }));
                    setDetailModalItem(null);
                    setActiveTab('report-found');
                    triggerToast(`Reporting found item matching '${detailModalItem.name || detailModalItem.category}'!`);
                  }} 
                  type="button" 
                  className="btn btn-primary pulse-glow" 
                  style={{ flex: 1, padding: '0.8rem', background: 'var(--accent-purple)' }}>
                  <CheckSquare size={18} />
                  <span>I Found This Item! 🙋‍♂️</span>
                </button>
              )}

              {detailModalItem.status !== 'Lost' && detailModalItem.status !== 'Returned' && (
                <button 
                  onClick={() => { setDetailModalItem(null); openClaimModal(detailModalItem); }} 
                  type="button" 
                  className="btn btn-primary" 
                  style={{ flex: 1, padding: '0.8rem' }}>
                  <CheckCircle size={18} />
                  <span>Claim This Item</span>
                </button>
              )}
              <button onClick={() => setDetailModalItem(null)} type="button" className="btn btn-secondary" style={{ padding: '0.8rem 1.5rem' }}>
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* OFFICIAL LOST ITEM REPORT COPY MODAL */}
      {reportCopyItem && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.78)', backdropFilter: 'blur(12px)',
          zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
        }}>
          <div className="glass-panel floating-card fade-in-el" style={{
            maxWidth: '580px', width: '100%', maxHeight: '90vh', overflowY: 'auto',
            background: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)', padding: '2rem', textAlign: 'left',
            border: '2px solid var(--primary)'
          }}>
            
            {/* Printable Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px dashed var(--glass-border)', paddingBottom: '1rem', marginBottom: '1.2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Shield size={28} style={{ color: 'var(--primary)' }} />
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '800', letterSpacing: '-0.5px' }}>
                    FINDIT<span className="gradient-text">+</span> OFFICIAL REPORT COPY
                  </h3>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Campus Lost Item Registry & Digital Verification</div>
                </div>
              </div>
              <button onClick={() => setReportCopyItem(null)} type="button" style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={22} />
              </button>
            </div>

            {/* Official Badge & Report ID */}
            <div style={{
              background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)',
              borderRadius: 'var(--radius-md)', padding: '0.8rem 1.2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem'
            }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '700' }}>REPORT REFERENCE ID</div>
                <div style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--primary)', letterSpacing: '1px' }}>
                  #FINDIT-L-{str(reportCopyItem.id || reportCopyItem._id).slice(-6).toUpperCase()}
                </div>
              </div>
              <div style={{ background: 'var(--accent-purple)', color: '#fff', fontSize: '0.75rem', fontWeight: '800', padding: '0.3rem 0.8rem', borderRadius: '50px' }}>
                OFFICIAL FILED COPY
              </div>
            </div>

            {/* Item Image Preview */}
            {(reportCopyItem.images?.length > 0 || reportCopyItem.image_url) && (
              <div style={{ height: '200px', borderRadius: 'var(--radius-md)', overflow: 'hidden', marginBottom: '1.2rem', border: '1px solid var(--glass-border)', background: '#000' }}>
                <img src={reportCopyItem.images?.[0] || reportCopyItem.image_url} alt={reportCopyItem.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              </div>
            )}

            {/* Report Fields Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem', marginBottom: '1.2rem' }}>
              <div className="glass-panel" style={{ padding: '0.8rem 1rem' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ITEM NAME</div>
                <div style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--text-primary)' }}>{reportCopyItem.name || reportCopyItem.category}</div>
              </div>

              <div className="glass-panel" style={{ padding: '0.8rem 1rem' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>CATEGORY</div>
                <div style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--text-primary)' }}>{reportCopyItem.category}</div>
              </div>

              <div className="glass-panel" style={{ padding: '0.8rem 1rem' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>LOCATION LOST</div>
                <div style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--text-primary)' }}>{reportCopyItem.location}</div>
              </div>

              <div className="glass-panel" style={{ padding: '0.8rem 1rem' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>DATE LOST</div>
                <div style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--text-primary)' }}>{reportCopyItem.date}</div>
              </div>

              <div className="glass-panel" style={{ padding: '0.8rem 1rem' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>REPORTER NAME</div>
                <div style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--text-primary)' }}>{reportCopyItem.reported_by_name || user?.name}</div>
              </div>

              <div className="glass-panel" style={{ padding: '0.8rem 1rem' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>CONTACT PHONE</div>
                <div style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--accent-success)' }}>{reportCopyItem.contact_phone || 'Not provided'}</div>
              </div>
            </div>

            {/* Description */}
            <div style={{ marginBottom: '1.2rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Item Description</div>
              <div className="glass-panel" style={{ padding: '0.9rem', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                {reportCopyItem.description}
              </div>
            </div>

            {/* Action Footer */}
            <div style={{ display: 'flex', gap: '0.8rem', marginTop: '1.5rem' }}>
              <button 
                onClick={() => window.print()} 
                type="button" 
                className="btn btn-primary pulse-glow" 
                style={{ flex: 1, padding: '0.8rem' }}>
                <Upload size={18} />
                <span>Print / Download Report Copy</span>
              </button>
              <button 
                onClick={() => { setReportCopyItem(null); setActiveTab('overview'); }} 
                type="button" 
                className="btn btn-secondary" 
                style={{ padding: '0.8rem 1.5rem' }}>
                Done / View Catalog
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADMIN DELIVERY CONFIRMATION MODAL */}
      {deliveryModalClaim && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.78)', backdropFilter: 'blur(12px)',
          zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
        }}>
          <div className="glass-panel floating-card fade-in-el" style={{
            maxWidth: '520px', width: '100%',
            background: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)', padding: '2rem', textAlign: 'left'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '800' }}>
                Record Item Delivery Confirmation
              </h3>
              <button onClick={() => setDeliveryModalClaim(null)} type="button" style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={22} />
              </button>
            </div>

            <div className="glass-panel" style={{ padding: '1rem', marginBottom: '1.2rem' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>CLAIM / ITEM</div>
              <div style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-primary)' }}>{deliveryModalClaim.item_name}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.3rem' }}>
                Recipient Owner: <strong>{deliveryModalClaim.claimant_name}</strong> ({deliveryModalClaim.claimant_email})
              </div>
            </div>

            <div style={{ marginBottom: '1.2rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '0.4rem', color: 'var(--text-primary)' }}>
                Admin Handover Delivery Message *
              </label>
              <textarea
                rows={3}
                value={deliveryNoteInput}
                onChange={e => setDeliveryNoteInput(e.target.value)}
                placeholder="e.g. Item was delivered to the owner properly in person."
                className="input-field"
                style={{ width: '100%', resize: 'none' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.8rem' }}>
              <button
                onClick={() => handleConfirmHandover(deliveryModalClaim.id || deliveryModalClaim._id, deliveryNoteInput)}
                type="button"
                className="btn btn-primary pulse-glow"
                style={{ flex: 1, padding: '0.8rem', background: 'var(--accent-success)' }}>
                <CheckCircle size={18} />
                <span>Confirm Delivered to Owner</span>
              </button>
              <button
                onClick={() => setDeliveryModalClaim(null)}
                type="button"
                className="btn btn-secondary"
                style={{ padding: '0.8rem 1.2rem' }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CLAIM & HANDOVER DETAILS MODAL */}
      {claimDetailModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.78)', backdropFilter: 'blur(12px)',
          zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
        }}>
          <div className="glass-panel floating-card fade-in-el" style={{
            maxWidth: '560px', width: '100%', maxHeight: '90vh', overflowY: 'auto',
            background: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)', padding: '2rem', textAlign: 'left',
            border: '1px solid var(--glass-border)'
          }}>
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: '800' }}>
                  {claimDetailModal.item_name || 'Item Claim Request'}
                </h3>
                <span style={{
                  background: claimDetailModal.status === 'Returned' ? 'var(--accent-cyan)' : claimDetailModal.status === 'Approved' ? 'var(--accent-success)' : 'var(--primary)',
                  color: '#fff', fontSize: '0.75rem', fontWeight: '700', padding: '0.2rem 0.6rem', borderRadius: '50px'
                }}>
                  {claimDetailModal.delivered_status || claimDetailModal.status || 'Approved'}
                </span>
              </div>
              <button onClick={() => setClaimDetailModal(null)} type="button" style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={22} />
              </button>
            </div>

            {/* Proof Photo Gallery Preview if uploaded */}
            {(claimDetailModal.proof_images && claimDetailModal.proof_images.length > 0) && (
              <div style={{ height: '200px', borderRadius: 'var(--radius-md)', overflow: 'hidden', marginBottom: '1.2rem', border: '1px solid var(--glass-border)', background: '#000' }}>
                <img src={claimDetailModal.proof_images[0]} alt="proof" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              </div>
            )}

            {/* Claim Details Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem', marginBottom: '1.2rem' }}>
              
              {/* Claimant Info */}
              <div className="glass-panel" style={{ padding: '0.9rem' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '700' }}>CLAIMANT / OWNER</div>
                <div style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--text-primary)', marginTop: '0.2rem' }}>
                  {claimDetailModal.claimant_name || 'Student'}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{claimDetailModal.claimant_email}</div>
              </div>

              {/* Founder Info */}
              <div className="glass-panel" style={{ padding: '0.9rem' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '700' }}>FOUNDER / FINDER</div>
                <div style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--primary)', marginTop: '0.2rem' }}>
                  {claimDetailModal.founder_name || 'Campus Founder'}
                </div>
                {claimDetailModal.founder_phone && (
                  <div style={{ fontSize: '0.8rem', color: 'var(--accent-success)', fontWeight: '700' }}>
                    📞 {claimDetailModal.founder_phone}
                  </div>
                )}
              </div>

            </div>

            {/* Submitted Proof Details Box */}
            <div style={{ marginBottom: '1.2rem' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '0.4rem', textTransform: 'uppercase' }}>
                Submitted Ownership Verification Proof
              </div>
              <div className="glass-panel" style={{ padding: '1rem', fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                {claimDetailModal.ownership_details || claimDetailModal.proof || 'Ownership verification details provided.'}
              </div>
            </div>

            {/* Admin Delivery Note Box (If Available) */}
            {claimDetailModal.delivery_message && (
              <div style={{
                background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.3)',
                borderRadius: 'var(--radius-md)', padding: '1rem', marginBottom: '1.2rem'
              }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--accent-success)', fontWeight: '800', letterSpacing: '0.5px' }}>
                  ADMIN DELIVERY HANDOVER NOTE
                </div>
                <div style={{ fontSize: '0.95rem', fontWeight: '600', color: 'var(--text-primary)', marginTop: '0.3rem', fontStyle: 'italic' }}>
                  "{claimDetailModal.delivery_message}"
                </div>
                {claimDetailModal.delivered_at && (
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
                    Handed over: {new Date(claimDetailModal.delivered_at).toLocaleString()}
                  </div>
                )}
              </div>
            )}

            {/* Direct Call Actions */}
            <div style={{ display: 'flex', gap: '0.8rem', marginTop: '1.2rem' }}>
              {claimDetailModal.founder_phone && (
                <a
                  href={`tel:${claimDetailModal.founder_phone}`}
                  className="btn btn-primary pulse-glow"
                  style={{ flex: 1, padding: '0.8rem', background: 'var(--accent-success)', textDecoration: 'none' }}>
                  <Phone size={16} />
                  <span>Call Founder Directly</span>
                </a>
              )}
              <button onClick={() => setClaimDetailModal(null)} type="button" className="btn btn-secondary" style={{ padding: '0.8rem 1.5rem' }}>
                Close Details
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

// Helper string formatter for mongo id
function str(val) {
  return String(val || '');
}

export default Dashboard;
