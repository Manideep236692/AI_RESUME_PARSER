export const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const formatSalary = (min, max) => {
  if (!min && !max) return 'Not specified';
  if (!max) return `$${min.toLocaleString()}+`;
  return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
};

export const truncateText = (text, maxLength) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

export const getInitials = (firstName, lastName) => {
  const first = firstName ? firstName.charAt(0).toUpperCase() : '';
  const last = lastName ? lastName.charAt(0).toUpperCase() : '';
  return first + last || 'U';
};

export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePassword = (password) => {
  return password.length >= 6;
};

export const getFileExtension = (filename) => {
  return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
};

export const isValidFileType = (filename, allowedTypes = ['pdf', 'doc', 'docx']) => {
  const ext = getFileExtension(filename).toLowerCase();
  return allowedTypes.includes(ext);
};
