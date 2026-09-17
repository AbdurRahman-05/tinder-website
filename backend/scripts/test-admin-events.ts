import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function test() {
  const users = await prisma.user.findMany({ select: { email: true, role: true } });
  console.log('Database users:', users);

  const testUser = users.find(u => u.role === 'SUPER_ADMIN' || u.role === 'ADMIN');
  console.log('Testing with admin user:', testUser?.email);

  // Try login with AdminPass123! or Admin@123456
  for (const pass of ['AdminPass123!', 'Admin@123456', 'Password123!']) {
    const loginRes = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testUser?.email, password: pass }),
    });
    const loginData: any = await loginRes.json();
    if (loginData.success) {
      console.log(`Login SUCCESS with password: ${pass}`);
      const token = loginData.data.accessToken;

      const eventsRes = await fetch('http://localhost:5000/api/admin/events', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const eventsData: any = await eventsRes.json();
      console.log('Admin events API success:', eventsData.success);
      console.log('Admin events stats:', eventsData.data?.stats);
      console.log('Admin events list count:', eventsData.data?.events?.length);
      console.log('Sample event:', eventsData.data?.events?.[0]?.title);

      const dashRes = await fetch('http://localhost:5000/api/admin/dashboard', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const dashData: any = await dashRes.json();
      console.log('Dashboard totalEvents:', dashData.data?.kpi?.totalEvents, 'activeEvents:', dashData.data?.kpi?.activeEvents);
      break;
    }
  }
}

test().catch(console.error).finally(() => prisma.$disconnect());

