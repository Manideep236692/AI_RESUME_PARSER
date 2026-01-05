export const formatDate = (dateString) => {
  if (!dateString) return 'Date not available';
  
  try {
    // Handle different date formats
    let date;
    if (typeof dateString === 'string') {
      // Try parsing as ISO string first
      date = new Date(dateString);
      
      // If invalid, try other formats
      if (isNaN(date.getTime())) {
        // Try parsing as timestamp
        const timestamp = parseInt(dateString);
        if (!isNaN(timestamp)) {
          date = new Date(timestamp);
        }
      }
    } else if (dateString instanceof Date) {
      date = dateString;
    } else {
      return 'Date not available';
    }
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return 'Date not available';
    }
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Date not available';
  }
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
