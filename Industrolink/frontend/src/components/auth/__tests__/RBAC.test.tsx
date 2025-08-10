import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../../context/AuthContext';
import PermissionGuard from '../PermissionGuard';
import { hasPermission, hasAnyPermission, hasAllPermissions } from '../../../utils/permissions';
import { UserRole } from '../../../types/user';

// Mock user data
const mockStudent = {
  id: '1',
  email: 'student@test.com',
  name: 'Test Student',
  role: 'student' as UserRole
};

const mockLecturer = {
  id: '2',
  email: 'lecturer@test.com',
  name: 'Test Lecturer',
  role: 'lecturer' as UserRole
};

const mockAdmin = {
  id: '3',
  email: 'admin@test.com',
  name: 'Test Admin',
  role: 'admin' as UserRole
};

// Test wrapper component
const TestWrapper: React.FC<{ children: React.ReactNode; user?: any }> = ({ 
  children, 
  user = mockStudent 
}) => {
  return (
    <BrowserRouter>
      <AuthProvider>
        {children}
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('RBAC System Tests', () => {
  describe('Permission Utilities', () => {
    test('hasPermission should return correct boolean values', () => {
      // Student permissions
      expect(hasPermission('student', 'read:profile')).toBe(true);
      expect(hasPermission('student', 'read:submissions')).toBe(true);
      expect(hasPermission('student', 'grade:submissions')).toBe(false);
      expect(hasPermission('student', 'system:admin')).toBe(false);

      // Lecturer permissions
      expect(hasPermission('lecturer', 'read:profile')).toBe(true);
      expect(hasPermission('lecturer', 'grade:submissions')).toBe(true);
      expect(hasPermission('lecturer', 'manage:internships')).toBe(false);

      // Admin permissions
      expect(hasPermission('admin', 'system:admin')).toBe(true);
      expect(hasPermission('admin', 'grade:submissions')).toBe(true);
      expect(hasPermission('admin', 'delete:users')).toBe(true);
    });

    test('hasAnyPermission should return true if user has any of the permissions', () => {
      const permissions = ['read:submissions', 'grade:submissions', 'system:admin'];
      
      expect(hasAnyPermission('student', permissions)).toBe(true); // has read:submissions
      expect(hasAnyPermission('lecturer', permissions)).toBe(true); // has read:submissions and grade:submissions
      expect(hasAnyPermission('admin', permissions)).toBe(true); // has all
    });

    test('hasAllPermissions should return true only if user has all permissions', () => {
      const permissions = ['read:submissions', 'grade:submissions'];
      
      expect(hasAllPermissions('student', permissions)).toBe(false); // only has read:submissions
      expect(hasAllPermissions('lecturer', permissions)).toBe(true); // has both
      expect(hasAllPermissions('admin', permissions)).toBe(true); // has both
    });
  });

  describe('PermissionGuard Component', () => {
    test('should render children when user has permission', () => {
      render(
        <TestWrapper user={mockLecturer}>
          <PermissionGuard permission="grade:submissions">
            <div data-testid="grading-interface">Grading Interface</div>
          </PermissionGuard>
        </TestWrapper>
      );

      expect(screen.getByTestId('grading-interface')).toBeInTheDocument();
    });

    test('should not render children when user lacks permission', () => {
      render(
        <TestWrapper user={mockStudent}>
          <PermissionGuard permission="grade:submissions">
            <div data-testid="grading-interface">Grading Interface</div>
          </PermissionGuard>
        </TestWrapper>
      );

      expect(screen.queryByTestId('grading-interface')).not.toBeInTheDocument();
    });

    test('should render fallback when user lacks permission', () => {
      render(
        <TestWrapper user={mockStudent}>
          <PermissionGuard 
            permission="grade:submissions"
            fallback={<div data-testid="no-permission">No permission</div>}
          >
            <div data-testid="grading-interface">Grading Interface</div>
          </PermissionGuard>
        </TestWrapper>
      );

      expect(screen.getByTestId('no-permission')).toBeInTheDocument();
      expect(screen.queryByTestId('grading-interface')).not.toBeInTheDocument();
    });

    test('should work with multiple permissions (ANY)', () => {
      render(
        <TestWrapper user={mockStudent}>
          <PermissionGuard permissions={['read:submissions', 'grade:submissions']}>
            <div data-testid="submissions-interface">Submissions Interface</div>
          </PermissionGuard>
        </TestWrapper>
      );

      expect(screen.getByTestId('submissions-interface')).toBeInTheDocument();
    });

    test('should work with multiple permissions (ALL)', () => {
      render(
        <TestWrapper user={mockStudent}>
          <PermissionGuard 
            permissions={['read:submissions', 'grade:submissions']}
            requireAll={true}
          >
            <div data-testid="full-interface">Full Interface</div>
          </PermissionGuard>
        </TestWrapper>
      );

      expect(screen.queryByTestId('full-interface')).not.toBeInTheDocument();
    });
  });

  describe('Role-Based Access', () => {
    test('student should only see student-appropriate content', () => {
      render(
        <TestWrapper user={mockStudent}>
          <div>
            <PermissionGuard permission="read:submissions">
              <div data-testid="student-submissions">Student Submissions</div>
            </PermissionGuard>
            <PermissionGuard permission="grade:submissions">
              <div data-testid="grading-tool">Grading Tool</div>
            </PermissionGuard>
            <PermissionGuard permission="system:admin">
              <div data-testid="admin-panel">Admin Panel</div>
            </PermissionGuard>
          </div>
        </TestWrapper>
      );

      expect(screen.getByTestId('student-submissions')).toBeInTheDocument();
      expect(screen.queryByTestId('grading-tool')).not.toBeInTheDocument();
      expect(screen.queryByTestId('admin-panel')).not.toBeInTheDocument();
    });

    test('lecturer should see appropriate content', () => {
      render(
        <TestWrapper user={mockLecturer}>
          <div>
            <PermissionGuard permission="read:submissions">
              <div data-testid="lecturer-submissions">Lecturer Submissions</div>
            </PermissionGuard>
            <PermissionGuard permission="grade:submissions">
              <div data-testid="grading-tool">Grading Tool</div>
            </PermissionGuard>
            <PermissionGuard permission="system:admin">
              <div data-testid="admin-panel">Admin Panel</div>
            </PermissionGuard>
          </div>
        </TestWrapper>
      );

      expect(screen.getByTestId('lecturer-submissions')).toBeInTheDocument();
      expect(screen.getByTestId('grading-tool')).toBeInTheDocument();
      expect(screen.queryByTestId('admin-panel')).not.toBeInTheDocument();
    });

    test('admin should see all content', () => {
      render(
        <TestWrapper user={mockAdmin}>
          <div>
            <PermissionGuard permission="read:submissions">
              <div data-testid="admin-submissions">Admin Submissions</div>
            </PermissionGuard>
            <PermissionGuard permission="grade:submissions">
              <div data-testid="grading-tool">Grading Tool</div>
            </PermissionGuard>
            <PermissionGuard permission="system:admin">
              <div data-testid="admin-panel">Admin Panel</div>
            </PermissionGuard>
          </div>
        </TestWrapper>
      );

      expect(screen.getByTestId('admin-submissions')).toBeInTheDocument();
      expect(screen.getByTestId('grading-tool')).toBeInTheDocument();
      expect(screen.getByTestId('admin-panel')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    test('should handle undefined user gracefully', () => {
      render(
        <TestWrapper user={undefined}>
          <PermissionGuard permission="read:submissions">
            <div data-testid="content">Content</div>
          </PermissionGuard>
        </TestWrapper>
      );

      expect(screen.queryByTestId('content')).not.toBeInTheDocument();
    });

    test('should handle invalid permissions gracefully', () => {
      render(
        <TestWrapper user={mockStudent}>
          <PermissionGuard permission={'invalid:permission' as any}>
            <div data-testid="content">Content</div>
          </PermissionGuard>
        </TestWrapper>
      );

      expect(screen.queryByTestId('content')).not.toBeInTheDocument();
    });

    test('should handle empty permissions array', () => {
      render(
        <TestWrapper user={mockStudent}>
          <PermissionGuard permissions={[]}>
            <div data-testid="content">Content</div>
          </PermissionGuard>
        </TestWrapper>
      );

      expect(screen.getByTestId('content')).toBeInTheDocument();
    });
  });
}); 