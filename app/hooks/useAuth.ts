'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getStoredUser, isAuthenticated } from '@/app/services/auth';
import type { User, Role } from '@/app/types';

/**
 * 认证 Hook
 * 用于获取当前用户信息和检查认证状态
 */
export function useAuth(requiredRole?: Role['name']) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      if (!isAuthenticated()) {
        // 未登录，跳转到登录页
        router.push('/auth/login');
        return;
      }

      const currentUser = getStoredUser();
      if (!currentUser) {
        router.push('/auth/login');
        return;
      }

      // 检查角色权限
      const userRole = currentUser.role?.name?.toUpperCase();
      const required = requiredRole?.toUpperCase();

      if (required && userRole !== required) {
        // 角色不匹配，跳转到首页或显示无权限页面
        console.warn(`角色不匹配: 需要 ${required}, 当前用户是 ${userRole}`);
        router.push('/');
        return;
      }

      setUser(currentUser);
      setLoading(false);
    };

    checkAuth();
  }, [router, requiredRole]);

  return { user, loading };
}

/**
 * 商户权限 Hook
 */
export function useMerchantAuth() {
  return useAuth('merchant');
}

/**
 * 管理员权限 Hook
 */
export function useAdminAuth() {
  return useAuth('admin');
}
