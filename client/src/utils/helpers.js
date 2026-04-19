export const formatDate = (dateStr) => {
  if (!dateStr) return 'Never';
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });
};

export const getErrorMessage = (err) => {
  if (err?.response?.data?.errors?.length) {
    return err.response.data.errors.map((e) => e.message).join(', ');
  }
  return err?.response?.data?.message || err?.message || 'Something went wrong';
};

export const getAvatarUrl = (avatarUrl, name = '') => {
  if (avatarUrl) return avatarUrl.startsWith('http') ? avatarUrl : `${import.meta.env.VITE_API_URL || ''}${avatarUrl}`;
  const initials = name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=4f46e5&color=fff&size=128`;
};

export const getRoleBadgeColor = (role) => {
  const map = { admin: '#dc2626', moderator: '#d97706', user: '#16a34a' };
  return map[role] || '#6b7280';
};
