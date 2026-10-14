// Kept deliberately UI-ready so the app remains useful during local/offline backend work.
const ago = (minutes) => new Date(Date.now() - minutes * 60_000).toISOString();

export const sampleCategories = [
  { value: 'veterinary-practice', label: 'Veterinary practice' },
  { value: 'clinical-cases', label: 'Clinical cases' },
  { value: 'surgery-anaesthesia', label: 'Surgery & anaesthesia' },
  { value: 'emergency-care', label: 'Emergency care' },
  { value: 'diagnostics', label: 'Diagnostics' },
  { value: 'wildlife-exotics', label: 'Wildlife & exotics' },
];

export const sampleVideos = [
  {
    id: 'sample-dog-check', title: 'A calm first check-up for a rescue puppy',
    description: 'Three small handling steps that help an anxious puppy feel safe at the clinic.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-little-dog-playing-with-a-ball-on-the-grass-2216-large.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1558788353-f76d92427f16?auto=format&fit=crop&w=900&q=80', durationSeconds: 34,
    category: 'Veterinary practice', caseType: 'Clinical perspectives', state: 'Kerala', animalType: 'Dog', specialty: 'Small Animal Medicine', hashtags: ['puppycare', 'lowstresshandling'],
    viewCount: 1240, likeCount: 186, commentCount: 18, liked: false, saved: true, createdAt: ago(48),
    creator: { id: 'sample-priya', name: 'Dr. Priya Nair', specialization: 'Small Animal Medicine', following: false, avatarUrl: 'https://i.pravatar.cc/120?img=47' },
  },
  {
    id: 'sample-cat-exam', title: 'Making a feline exam less stressful',
    description: 'Use a towel, quiet voice and short pauses to make a routine cat examination kinder.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-orange-cat-playing-with-a-ball-17775-large.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?auto=format&fit=crop&w=900&q=80', durationSeconds: 41,
    category: 'Clinical cases', caseType: 'Clinical cases', state: 'Maharashtra', animalType: 'Cat', specialty: 'Feline Medicine', hashtags: ['catcare', 'felinefriendly'],
    viewCount: 987, likeCount: 141, commentCount: 12, liked: true, saved: false, createdAt: ago(190),
    creator: { id: 'sample-arjun', name: 'Dr. Arjun Mehta', specialization: 'Veterinary Surgery', following: true, avatarUrl: 'https://i.pravatar.cc/120?img=12' },
  },
  {
    id: 'sample-horse-hoof', title: 'Quick daily hoof check for horses',
    description: 'What to look for before and after a ride: heat, stones, cracks and an uneven gait.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-horse-running-in-a-field-34532-large.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?auto=format&fit=crop&w=900&q=80', durationSeconds: 29,
    category: 'Diagnostics', caseType: 'Procedures', state: 'Rajasthan', animalType: 'Horse', specialty: 'Equine Medicine', hashtags: ['equinecare', 'hoofhealth'],
    viewCount: 765, likeCount: 92, commentCount: 7, liked: false, saved: false, createdAt: ago(360),
    creator: { id: 'sample-vikram', name: 'Dr. Vikram Singh', specialization: 'Equine Medicine', following: false, avatarUrl: 'https://i.pravatar.cc/120?img=68' },
  },
  {
    id: 'sample-rabbit-surgery', title: 'Preparing a rabbit for a minor procedure',
    description: 'A calm pre-procedure checklist for rabbit patients, from temperature support to gentle monitoring.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-little-dog-playing-with-a-ball-on-the-grass-2216-large.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?auto=format&fit=crop&w=900&q=80', durationSeconds: 37,
    category: 'Surgery & anaesthesia', caseType: 'Clinical cases', state: 'Tamil Nadu', animalType: 'Rabbit', specialty: 'Veterinary Surgery', hashtags: ['vetsurgery', 'rabbitcare'],
    viewCount: 652, likeCount: 83, commentCount: 9, liked: false, saved: false, createdAt: ago(510),
    creator: { id: 'sample-isha', name: 'Dr. Isha Menon', specialization: 'Veterinary Surgery', following: true, avatarUrl: 'https://i.pravatar.cc/120?img=45' },
  },
];

export const sampleStories = sampleVideos.map((video, index) => ({
  id: `story-${video.id}`, name: video.creator.name.replace('Dr. ', '').split(' ')[0], creator: video.creator,
  image: video.thumbnailUrl, title: index === 0 ? 'Gentle puppy check-up' : index === 1 ? 'Feline friendly care' : 'Morning hoof check',
  text: video.description,
}));

export const suggestedPeople = [
  ...sampleVideos.map((video) => ({ ...video.creator, city: video.creator.id === 'sample-priya' ? 'Kochi' : video.creator.id === 'sample-arjun' ? 'Mumbai' : 'Jaipur', about: `Helping animals through thoughtful ${video.creator.specialization.toLowerCase()}.` })),
  { id: 'sample-isha', name: 'Dr. Isha Menon', specialization: 'Veterinary Dermatology', city: 'Chennai', about: 'Skin, coat and allergy care for companion animals.', avatarUrl: 'https://i.pravatar.cc/120?img=45', following: false },
];

export const sampleConversations = [
  { id: 'sample-conv-priya', participant: sampleVideos[0].creator, preview: 'The puppy is eating well today. Thank you!', lastMessageAt: ago(16), unreadCount: 1, pinned: true, archived: false },
  { id: 'sample-conv-arjun', participant: sampleVideos[1].creator, preview: 'I have shared the follow-up notes.', lastMessageAt: ago(150), unreadCount: 0, pinned: false, archived: false },
];

export const sampleMessages = {
  'sample-conv-priya': [
    { id: 'sample-msg-1', conversationId: 'sample-conv-priya', text: 'How is Milo settling in after the visit?', senderId: 'sample-priya', mine: false, createdAt: ago(70), attachments: [], reactions: [] },
    { id: 'sample-msg-2', conversationId: 'sample-conv-priya', text: 'Much better. He is eating well today — thank you!', senderId: 'me', mine: true, createdAt: ago(16), attachments: [], reactions: [{ emoji: '❤️', count: 1, reactedByMe: true }] },
  ],
  'sample-conv-arjun': [
    { id: 'sample-msg-3', conversationId: 'sample-conv-arjun', text: 'I have shared the follow-up notes for the cat case.', senderId: 'sample-arjun', mine: false, createdAt: ago(150), attachments: [], reactions: [] },
  ],
};

export const sampleMe = { id: 'me', name: 'Dr. Ananya Rao', specialization: 'Veterinarian', avatarUrl: 'https://i.pravatar.cc/120?img=32' };

export const sampleSearch = {
  people: sampleVideos.map((v) => v.creator),
  videos: sampleVideos.map(({ id, title, thumbnailUrl, creator, category, viewCount, createdAt }) => ({ id, title, thumbnailUrl, creator, category, viewCount, createdAt })),
  posts: [{ id: 'sample-post-1', title: 'Helping pets stay calm during Diwali', preview: 'Simple clinic and home routines that reduce noise-related anxiety in dogs and cats.', author: sampleVideos[0].creator, category: 'Pet care', createdAt: ago(280) }],
  cases: [{ id: 'sample-case-1', title: 'Limping Labrador: a practical first assessment', preview: 'A short case discussion on history taking, gait assessment and when to image.', author: sampleVideos[1].creator, specialty: 'Small Animal Medicine', animalType: 'Dog', category: 'Clinical tips', createdAt: ago(420) }],
  communities: [{ id: 'sample-community-1', name: 'Companion Animal Care', description: 'A community for kind, evidence-led dog and cat care.', memberCount: 1280, avatarUrl: 'https://images.unsplash.com/photo-1450778869180-41d0601e046e?auto=format&fit=crop&w=200&q=80' }],
};
