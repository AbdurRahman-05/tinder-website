import { Router } from 'express';
import {
  getDashboardStats,
  getAdminProfiles,
  createAdminProfile,
  toggleVerifyProfile,
  toggleFeatureProfile,
  toggleBlockProfile,
  deleteProfileByAdmin,
  getAdminReports,
  updateReportStatus,
  getAdminUsers,
  updateUserStatus,
  updateUserRole,
  getAuditLogs,
} from '../controllers/admin.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireAdmin, requireModerator, requireSuperAdmin } from '../middleware/rbac.middleware';

const router = Router();

// Protect all admin routes with authentication
router.use(authenticate);

// Analytics & Dashboard
router.get('/dashboard', requireModerator, getDashboardStats);
router.get('/analytics', requireModerator, getDashboardStats);

// Profile Moderation
router.get('/profiles', requireModerator, getAdminProfiles);
router.post('/profiles', requireAdmin, createAdminProfile);
router.post('/profiles/:id/verify', requireModerator, toggleVerifyProfile);
router.post('/profiles/:id/feature', requireAdmin, toggleFeatureProfile);
router.post('/profiles/:id/block', requireModerator, toggleBlockProfile);
router.delete('/profiles/:id', requireAdmin, deleteProfileByAdmin);

// Reports Triage
router.get('/reports', requireModerator, getAdminReports);
router.put('/reports/:id', requireModerator, updateReportStatus);

// User Management
router.get('/users', requireAdmin, getAdminUsers);
router.put('/users/:id/status', requireAdmin, updateUserStatus);
router.put('/users/:id/role', requireSuperAdmin, updateUserRole);

// Audit Logging
router.get('/audit-logs', requireAdmin, getAuditLogs);

export default router;
