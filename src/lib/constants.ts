
import type { LucideIcon } from 'lucide-react';
import { LayoutDashboard, BrainCircuit, Settings, Users, BookOpen, BookCopy, Library } from 'lucide-react';
import type { UserRole } from '@/context/auth-context';

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  label?: string;
  disabled?: boolean;
  external?: boolean;
  items?: NavSubItem[];
  roles?: UserRole[]; // Added for role-based visibility
}

export interface NavSubItem {
  title: string;
  href: string;
  label?: string;
  disabled?: boolean;
  external?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'My Courses',
    href: '/my-courses',
    icon: BookCopy,
    roles: ['student'],
  },
  {
    title: 'Course Catalog',
    href: '/course-catalog',
    icon: Library,
    roles: ['student'],
  },
  {
    title: 'Resource Optimization',
    href: '/resource-optimization',
    icon: BrainCircuit,
    label: 'AI',
    roles: ['teacher'],
  },
  {
    title: 'Student Management',
    href: '/student-management',
    icon: Users,
    roles: ['teacher'],
  },
  {
    title: 'Course Management',
    href: '/course-management',
    icon: BookOpen,
    roles: ['teacher'],
  },
  {
    title: 'Settings',
    href: '/settings',
    icon: Settings,
    disabled: false,
  },
];
