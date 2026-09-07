import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding PRISM database...');

  // 1. Seed Categories
  const lookingForTags = [
    { name: 'Friendship', slug: 'friendship', order: 1 },
    { name: 'Dating', slug: 'dating', order: 2 },
    { name: 'Relationship', slug: 'relationship', order: 3 },
    { name: 'Community', slug: 'community', order: 4 },
    { name: 'Networking', slug: 'networking', order: 5 },
    { name: 'Chatting', slug: 'chatting', order: 6 },
  ];

  for (const item of lookingForTags) {
    await prisma.category.upsert({
      where: { slug: item.slug },
      update: {},
      create: {
        name: item.name,
        slug: item.slug,
        type: 'LOOKING_FOR',
        order: item.order,
      },
    });
  }

  // 2. Hash default passwords
  const adminPasswordHash = await bcrypt.hash('AdminPass123!', 10);
  const modPasswordHash = await bcrypt.hash('ModPass123!', 10);
  const userPasswordHash = await bcrypt.hash('UserPass123!', 10);

  // 3. Create Super Admin User
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@prism.app' },
    update: {},
    create: {
      email: 'admin@prism.app',
      passwordHash: adminPasswordHash,
      role: 'SUPER_ADMIN',
      status: 'ACTIVE',
    },
  });

  // 4. Create Moderator User
  const modUser = await prisma.user.upsert({
    where: { email: 'moderator@prism.app' },
    update: {},
    create: {
      email: 'moderator@prism.app',
      passwordHash: modPasswordHash,
      role: 'MODERATOR',
      status: 'ACTIVE',
    },
  });

  // 5. Create Test Regular User
  const regularUser = await prisma.user.upsert({
    where: { email: 'alex@prism.app' },
    update: {},
    create: {
      email: 'alex@prism.app',
      passwordHash: userPasswordHash,
      role: 'USER',
      status: 'ACTIVE',
    },
  });

  // 6. Curated LGBTQ+ Diverse Profiles
  const demoProfiles = [
    {
      name: 'Alex Chen',
      userEmail: 'alex@prism.app',
      age: 24,
      birthYear: 2002,
      gender: 'Non-binary',
      pronouns: 'They/Them',
      lookingFor: ['Friendship', 'Dating', 'Community'],
      bio: 'Photographer & botanical coffee lover. Passionate about indie queer cinema, analog synth jams, and weekend thrift hunting.',
      location: 'Brooklyn, NY',
      whatsapp: '+19175550143',
      whatsappVisible: true,
      instagram: 'alexchen_lens',
      instagramVisible: true,
      isVerified: true,
      isFeatured: true,
      status: 'ACTIVE',
      photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80',
    },
    {
      name: 'Maya Rodriguez',
      age: 27,
      birthYear: 1999,
      gender: 'Trans woman',
      pronouns: 'She/Her',
      lookingFor: ['Relationship', 'Community'],
      bio: 'UI/UX designer building accessible digital spaces. Love Latin indie music, bouldering, and brewing matcha with friends.',
      location: 'Austin, TX',
      whatsapp: '+15125550192',
      whatsappVisible: true,
      instagram: 'maya_ux_craft',
      instagramVisible: true,
      isVerified: true,
      isFeatured: true,
      status: 'ACTIVE',
      photoUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&auto=format&fit=crop&q=80',
    },
    {
      name: 'Jordan Rivera',
      age: 29,
      birthYear: 1997,
      gender: 'Trans man',
      pronouns: 'He/Him',
      lookingFor: ['Friendship', 'Networking'],
      bio: 'Software engineer & queer rights organizer. When not coding, catch me running 10k routes with my rescue golden retriever.',
      location: 'Seattle, WA',
      whatsapp: '+12065550124',
      whatsappVisible: false,
      instagram: 'jordan_rivera_code',
      instagramVisible: true,
      isVerified: true,
      isFeatured: true,
      status: 'ACTIVE',
      photoUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=800&auto=format&fit=crop&q=80',
    },
    {
      name: 'Sam Taylor',
      age: 23,
      birthYear: 2003,
      gender: 'Genderfluid',
      pronouns: 'They/She',
      lookingFor: ['Dating', 'Chatting'],
      bio: 'Illustrator and zine creator. Exploring identity through ink and poetry. Big fan of sunset picnics and vinyl records.',
      location: 'San Francisco, CA',
      whatsapp: '+14155550187',
      whatsappVisible: true,
      instagram: 'samtaylor_arts',
      instagramVisible: true,
      isVerified: true,
      isFeatured: true,
      status: 'ACTIVE',
      photoUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&auto=format&fit=crop&q=80',
    },
    {
      name: 'Kai Tanaka',
      age: 31,
      birthYear: 1995,
      gender: 'Non-binary',
      pronouns: 'They/Them',
      lookingFor: ['Relationship', 'Friendship'],
      bio: 'Landscape architect obsessed with sustainable urban rooftop gardens and sourdough baking. Looking for deep conversations.',
      location: 'Toronto, Canada',
      whatsapp: '+14165550155',
      whatsappVisible: false,
      instagram: 'kai_greenery',
      instagramVisible: true,
      isVerified: true,
      isFeatured: true,
      status: 'ACTIVE',
      photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop&q=80',
    },
    {
      name: 'Elena Rostova',
      age: 26,
      birthYear: 2000,
      gender: 'Woman',
      pronouns: 'She/Her',
      lookingFor: ['Dating', 'Relationship'],
      bio: 'Classical cellist playing modern film scores. Searching for someone who appreciates live music, late night bookstore strolls, and art galleries.',
      location: 'Chicago, IL',
      whatsapp: '+13125550188',
      whatsappVisible: true,
      instagram: 'elena_cello_live',
      instagramVisible: true,
      isVerified: true,
      isFeatured: true,
      status: 'ACTIVE',
      photoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&auto=format&fit=crop&q=80',
    },
    {
      name: 'Riley Novak',
      age: 25,
      birthYear: 2001,
      gender: 'Agender',
      pronouns: 'They/Them',
      lookingFor: ['Friendship', 'Chatting', 'Community'],
      bio: 'Game dev & pixel artist. Always down to discuss sci-fi lore, board games, and cozy coffee spots.',
      location: 'Portland, OR',
      whatsapp: '+15035550133',
      whatsappVisible: false,
      instagram: 'riley_pixel',
      instagramVisible: false,
      isVerified: false,
      isFeatured: false,
      status: 'ACTIVE',
      photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&auto=format&fit=crop&q=80',
    },
    {
      name: 'Sasha Vance',
      age: 28,
      birthYear: 1998,
      gender: 'Genderqueer',
      pronouns: 'She/They',
      lookingFor: ['Networking', 'Community'],
      bio: 'Culinary arts instructor focusing on plant-based world cuisine. Lover of fermenting experiments, farmers markets, and ceramics.',
      location: 'Los Angeles, CA',
      whatsapp: '+12135550190',
      whatsappVisible: true,
      instagram: 'sashacooks_la',
      instagramVisible: true,
      isVerified: true,
      isFeatured: false,
      status: 'ACTIVE',
      photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&auto=format&fit=crop&q=80',
    },
    {
      name: 'Julian Hayes',
      age: 30,
      birthYear: 1996,
      gender: 'Man',
      pronouns: 'He/Him',
      lookingFor: ['Relationship', 'Dating'],
      bio: 'Psychotherapist and outdoor enthusiast. Big heart, curious mind, and happiest hiking alpine trails or reading under tall trees.',
      location: 'Denver, CO',
      whatsapp: '+13035550144',
      whatsappVisible: true,
      instagram: 'julian_outdoors',
      instagramVisible: true,
      isVerified: true,
      isFeatured: false,
      status: 'ACTIVE',
      photoUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&auto=format&fit=crop&q=80',
    },
    {
      name: 'Morgan Ellis',
      age: 22,
      birthYear: 2004,
      gender: 'Non-binary',
      pronouns: 'They/Them',
      lookingFor: ['Friendship', 'Community'],
      bio: 'College senior studying environmental justice. Thrifting enthusiast and amateur DJ experimenting with ambient house beats.',
      location: 'Montreal, Canada',
      whatsapp: '+15145550182',
      whatsappVisible: true,
      instagram: 'morgan_beats',
      instagramVisible: true,
      isVerified: false,
      isFeatured: false,
      status: 'ACTIVE',
      photoUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=800&auto=format&fit=crop&q=80',
    },
    {
      name: 'Peyton Reed',
      age: 33,
      birthYear: 1993,
      gender: 'Trans woman',
      pronouns: 'She/Her',
      lookingFor: ['Friendship', 'Networking', 'Relationship'],
      bio: 'Biotech researcher and queer book club founder. Love stargazing with my telescope and finding the best noodle spots in town.',
      location: 'Boston, MA',
      whatsapp: '+16175550129',
      whatsappVisible: true,
      instagram: 'peyton_science',
      instagramVisible: true,
      isVerified: true,
      isFeatured: false,
      status: 'ACTIVE',
      photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&auto=format&fit=crop&q=80',
    },
    {
      name: 'Casey Patel',
      age: 27,
      birthYear: 1999,
      gender: 'Non-binary',
      pronouns: 'They/He',
      lookingFor: ['Chatting', 'Dating'],
      bio: 'Product manager by day, stand-up comedy open mic host by night. Looking for someone who laughs at puns and likes bubble tea.',
      location: 'London, UK',
      whatsapp: '+447911123456',
      whatsappVisible: true,
      instagram: 'caseypatel_comedy',
      instagramVisible: true,
      isVerified: true,
      isFeatured: false,
      status: 'ACTIVE',
      photoUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=800&auto=format&fit=crop&q=80',
    },
    {
      name: 'Dakota Vance',
      age: 35,
      birthYear: 1991,
      gender: 'Trans man',
      pronouns: 'He/They',
      lookingFor: ['Community', 'Friendship'],
      bio: 'Carpentry craftsperson and vintage motorcycle restorer. Quiet energy, loyal friend, and lover of campfires.',
      location: 'Minneapolis, MN',
      whatsapp: '+16125550167',
      whatsappVisible: false,
      instagram: 'dakota_workshop',
      instagramVisible: false,
      isVerified: false,
      isFeatured: false,
      status: 'ACTIVE',
      photoUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=800&auto=format&fit=crop&q=80',
    },
    {
      name: 'Reese Adams',
      age: 24,
      birthYear: 2002,
      gender: 'Genderfluid',
      pronouns: 'Any Pronouns',
      lookingFor: ['Dating', 'Community'],
      bio: 'Costume designer and theatre nerd. Spreading queer joy and colorful aesthetics wherever I go. Let’s grab boba and talk musicals!',
      location: 'New York, NY',
      whatsapp: '+12125550119',
      whatsappVisible: true,
      instagram: 'reese_designs',
      instagramVisible: true,
      isVerified: true,
      isFeatured: false,
      status: 'ACTIVE',
      photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80',
    },
    {
      name: 'Quinn Avery',
      age: 29,
      birthYear: 1997,
      gender: 'Agender',
      pronouns: 'They/Them',
      lookingFor: ['Networking', 'Friendship'],
      bio: 'Cybersecurity analyst and mechanical keyboard builder. Always searching for the perfect matcha latte and great tech banter.',
      location: 'Berlin, Germany',
      whatsapp: '+491512345678',
      whatsappVisible: true,
      instagram: 'quinn_keys',
      instagramVisible: true,
      isVerified: true,
      isFeatured: false,
      status: 'ACTIVE',
      photoUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=800&auto=format&fit=crop&q=80',
    },
    {
      name: 'Rowan Miller',
      age: 21,
      birthYear: 2005,
      gender: 'Non-binary',
      pronouns: 'They/Them',
      lookingFor: ['Friendship', 'Chatting'],
      bio: 'Art history student & film enthusiast. Love French new wave, museum hopping on free Thursdays, and vegan baking.',
      location: 'Melbourne, Australia',
      whatsapp: '+61412345678',
      whatsappVisible: false,
      instagram: 'rowan_films',
      instagramVisible: true,
      isVerified: false,
      isFeatured: false,
      status: 'ACTIVE',
      photoUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&auto=format&fit=crop&q=80',
    },
    {
      name: 'Kendall Scott',
      age: 32,
      birthYear: 1994,
      gender: 'Woman',
      pronouns: 'She/Her',
      lookingFor: ['Relationship', 'Community'],
      bio: 'Veterinary surgeon with two cats and a rescue beagle. Passionate about animal welfare, weekend farmer markets, and acoustic indie pop.',
      location: 'San Diego, CA',
      whatsapp: '+16195550199',
      whatsappVisible: true,
      instagram: 'kendall_vetcare',
      instagramVisible: true,
      isVerified: true,
      isFeatured: false,
      status: 'ACTIVE',
      photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&auto=format&fit=crop&q=80',
    },
    {
      name: 'Logan Bennett',
      age: 28,
      birthYear: 1998,
      gender: 'Man',
      pronouns: 'He/Him',
      lookingFor: ['Friendship', 'Networking'],
      bio: 'Urban planner designing pedestrian-friendly streetscapes. Big bicyclist, coffee snob, and trivia night champion.',
      location: 'Philadelphia, PA',
      whatsapp: '+12155550183',
      whatsappVisible: false,
      instagram: 'logan_cities',
      instagramVisible: true,
      isVerified: true,
      isFeatured: false,
      status: 'ACTIVE',
      photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&auto=format&fit=crop&q=80',
    },
    {
      name: 'Finlay Ross',
      age: 26,
      birthYear: 2000,
      gender: 'Non-binary',
      pronouns: 'They/Them',
      lookingFor: ['Dating', 'Relationship'],
      bio: 'Ceramic artist creating handmade pottery for local cafes. Deeply appreciate slow mornings, record players, and kind humans.',
      location: 'Dublin, Ireland',
      whatsapp: '+353871234567',
      whatsappVisible: true,
      instagram: 'finlay_clay',
      instagramVisible: true,
      isVerified: true,
      isFeatured: false,
      status: 'ACTIVE',
      photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop&q=80',
    },
    {
      name: 'Tatum Hayes',
      age: 27,
      birthYear: 1999,
      gender: 'Other',
      customGender: 'Two-Spirit',
      pronouns: 'They/He',
      lookingFor: ['Community', 'Friendship'],
      bio: 'Indigenous community advocate and traditional textile artist. Honoring ancestral roots while building modern inclusive futures.',
      location: 'Vancouver, Canada',
      whatsapp: '+16045550149',
      whatsappVisible: true,
      instagram: 'tatum_textiles',
      instagramVisible: true,
      isVerified: true,
      isFeatured: false,
      status: 'ACTIVE',
      photoUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=800&auto=format&fit=crop&q=80',
    },
    {
      name: 'Spammy Bot Profile',
      age: 20,
      birthYear: 2006,
      gender: 'Other',
      pronouns: 'It/Its',
      lookingFor: ['Networking'],
      bio: 'Click here for free gift cards and discount links at sketchy-crypto-site dot com!',
      location: 'Nowhere',
      whatsapp: null,
      whatsappVisible: false,
      instagram: null,
      instagramVisible: false,
      isVerified: false,
      isFeatured: false,
      status: 'BLOCKED',
      photoUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=800&auto=format&fit=crop&q=80',
    },
  ];

  for (const item of demoProfiles) {
    let linkedUserId: string | null = null;
    if (item.userEmail) {
      const u = await prisma.user.findUnique({ where: { email: item.userEmail } });
      if (u) linkedUserId = u.id;
    }

    // Check if profile already exists by name
    const existing = await prisma.profile.findFirst({
      where: { name: item.name },
    });

    if (!existing) {
      const dob = new Date(`${item.birthYear}-05-15`);
      const p = await prisma.profile.create({
        data: {
          userId: linkedUserId,
          name: item.name,
          dateOfBirth: dob,
          age: item.age,
          gender: item.gender,
          customGender: (item as any).customGender || null,
          pronouns: item.pronouns,
          lookingFor: item.lookingFor,
          bio: item.bio,
          location: item.location,
          whatsapp: item.whatsapp,
          whatsappVisible: item.whatsappVisible,
          instagram: item.instagram,
          instagramVisible: item.instagramVisible,
          visibility: 'PUBLIC',
          status: item.status as any,
          isVerified: item.isVerified,
          isFeatured: item.isFeatured,
          createdByAdmin: !linkedUserId,
          photos: {
            create: {
              url: item.photoUrl,
              isPrimary: true,
            },
          },
        },
      });

      // If this was the blocked spam profile, add a sample report
      if (item.status === 'BLOCKED') {
        await prisma.report.create({
          data: {
            profileId: p.id,
            reason: 'SPAM',
            description: 'Advertised sketchy external link in bio',
            status: 'RESOLVED',
            resolutionNotes: 'Profile investigated and blocked by moderator.',
            resolvedByAdminId: adminUser.id,
          },
        });
      }
    }
  }

  // Create one pending report on an active profile for admin triage demonstration
  const reportTarget = await prisma.profile.findFirst({
    where: { name: 'Riley Novak' },
  });

  if (reportTarget) {
    const existingReport = await prisma.report.findFirst({
      where: { profileId: reportTarget.id, status: 'PENDING' },
    });

    if (!existingReport) {
      await prisma.report.create({
        data: {
          profileId: reportTarget.id,
          reporterUserId: regularUser.id,
          reason: 'INAPPROPRIATE_CONTENT',
          description: 'Testing report triage flow in admin panel.',
          status: 'PENDING',
        },
      });
    }
  }

  // Add initial Audit Log
  await prisma.adminAction.create({
    data: {
      adminId: adminUser.id,
      action: 'SYSTEM_SEED_INITIALIZED',
      targetType: 'SYSTEM',
      targetId: 'prism-init',
      metadata: { profilesCount: demoProfiles.length },
    },
  });

  console.log('Seeding completed successfully!');
  console.log('Admin Account: admin@prism.app / AdminPass123!');
  console.log('Moderator Account: moderator@prism.app / ModPass123!');
  console.log('User Account: alex@prism.app / UserPass123!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
