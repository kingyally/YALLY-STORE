/**
 * Bootstrap: runs once at app start.
 * Ensures the super admin account exists in localStorage.
 */

const USERS_KEY = 'yallybet_users';
const ADMINS_KEY = 'yallybet_admins';

const SUPER_ADMIN = {
  email: 'seif83470@gmail.com',
  password: 'matikiti',
  name: 'Ally Seif',
  phone: '0655779081',
};

export function bootstrapSuperAdmin() {
  try {
    // ── 1. Ensure user account exists ──────────────────────
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    let user = users.find((u: any) => u.email.toLowerCase() === SUPER_ADMIN.email);

    if (!user) {
      user = {
        id: `u_superadmin_${Date.now()}`,
        name: SUPER_ADMIN.name,
        email: SUPER_ADMIN.email,
        phone: SUPER_ADMIN.phone,
        created_at: new Date().toISOString(),
      };
      users.unshift(user); // put super admin first
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
    }

    // Always make sure password is correct
    localStorage.setItem(`yallybet_pw_${user.id}`, SUPER_ADMIN.password);

    // ── 2. Ensure admin entry exists with ALL permissions ──
    const admins = JSON.parse(localStorage.getItem(ADMINS_KEY) || '[]');
    const existingAdmin = admins.find((a: any) => a.email.toLowerCase() === SUPER_ADMIN.email);

    if (!existingAdmin) {
      admins.unshift({
        id: `admin_superadmin_${Date.now()}`,
        email: SUPER_ADMIN.email,
        role: 'super_admin',
        permissions: ['requests', 'tipsters', 'history', 'settings', 'users', 'banners', 'packages', 'admins'],
        added_by: 'system',
        created_at: new Date().toISOString(),
      });
      localStorage.setItem(ADMINS_KEY, JSON.stringify(admins));
    } else if (existingAdmin.role !== 'super_admin') {
      // Upgrade permissions if already exists but incomplete
      existingAdmin.role = 'super_admin';
      existingAdmin.permissions = ['requests', 'tipsters', 'history', 'settings', 'users', 'banners', 'packages', 'admins'];
      localStorage.setItem(ADMINS_KEY, JSON.stringify(admins));
    }
  } catch (e) {
    console.error('Bootstrap error:', e);
  }
}
