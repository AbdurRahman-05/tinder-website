import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const sampleEvents = [
  {
    title: 'Pride Neon Glow Party & DJ Night 🪩',
    description: 'Celebrate pride with neon lights, great music, live drag shows, and unforgettable energy! Open to all LGBTQ+ individuals and allies.',
    category: 'Party',
    date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // in 3 days
    time: '8:00 PM - Late',
    location: 'Velvet Lounge & Terrace, Downtown',
    imageUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1200&q=80',
    whatsapp: '+14155552671',
    instagram: 'velvetpride_night',
    googleFormUrl: 'https://docs.google.com/forms/d/e/1FAIpQLSc_EXAMPLE1/viewform',
    creatorName: 'PRISM Nightlife Collective',
    isFeatured: true,
  },
  {
    title: 'Queer Coffee & Book Social ☕📖',
    description: 'A cozy, low-pressure afternoon meetup to chat books, queer literature, and connect with wonderful community souls over artisanal coffee.',
    category: 'Meetup',
    date: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000), // in 6 days
    time: '3:00 PM - 6:00 PM',
    location: 'Artisan Corner Roastery, High Street',
    imageUrl: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1200&q=80',
    whatsapp: '+14155559823',
    instagram: 'queercoffeemeets',
    googleFormUrl: 'https://docs.google.com/forms/d/e/1FAIpQLSc_EXAMPLE2/viewform',
    creatorName: 'Alex Rivers',
    isFeatured: false,
  },
  {
    title: 'Sunset Nature Hike & Picnic 🌄🧺',
    description: 'Hit the scenic trails for an easy sunset hike followed by a shared sunset picnic. Bring a blanket and your favorite snacks!',
    category: 'Outing',
    date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // in 10 days
    time: '4:30 PM - 8:00 PM',
    location: 'Ridge Trailhead & Hilltop Lookout',
    imageUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
    whatsapp: '+14155554312',
    instagram: 'rainbowhikers',
    googleFormUrl: 'https://docs.google.com/forms/d/e/1FAIpQLSc_EXAMPLE3/viewform',
    creatorName: 'Jordan & Sam',
    isFeatured: false,
  },
  {
    title: 'Creative Art & Clay Workshop 🎨✨',
    description: 'Explore queer self-expression through ceramic pottery and acrylic painting. All materials provided, no prior experience needed!',
    category: 'Workshop',
    date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // in 14 days
    time: '11:00 AM - 2:00 PM',
    location: 'Studio Bloom Community Loft',
    imageUrl: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=1200&q=80',
    whatsapp: '+14155557766',
    instagram: 'studiobloom_art',
    googleFormUrl: 'https://docs.google.com/forms/d/e/1FAIpQLSc_EXAMPLE4/viewform',
    creatorName: 'Studio Bloom Collective',
    isFeatured: true,
  },
];

async function seed() {
  console.log('Seeding initial community events...');
  for (const ev of sampleEvents) {
    await prisma.event.create({
      data: ev,
    });
  }
  console.log('Events successfully seeded!');
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
