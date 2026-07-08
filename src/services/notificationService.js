import api from './api';

// Retrieve recent in-app notifications for the logged-in user
const getNotifications = async () => {
  const response = await api.get('/notifications');
  return response.data;
};

// Mark a single notification as read
const markAsRead = async (id) => {
  const response = await api.put(`/notifications/${id}/read`);
  return response.data;
};

// Mark all unread notifications as read
const markAllAsRead = async () => {
  const response = await api.put('/notifications/read-all');
  return response.data;
};

const notificationService = {
  getNotifications,
  markAsRead,
  markAllAsRead
};

export default notificationService;
