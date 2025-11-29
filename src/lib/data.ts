import type { ImagePlaceholder } from './placeholder-images';
import { PlaceHolderImages } from './placeholder-images';

const getImage = (id: string) => PlaceHolderImages.find(img => img.id === id) as ImagePlaceholder;

export const user = {
  name: 'Gamal',
  avatar: getImage('user-avatar-gamal'),
};

export const performance = {
  engagementRate: {
    value: '12.5%',
    change: '+2.1%',
    changeType: 'increase' as const,
  },
  followers: {
    total: 18450,
    change: 283,
    changeType: 'increase' as const,
  },
  topPost: {
    image: getImage('top-post'),
    metrics: {
      likes: '1.2k',
      comments: '89',
      reach: '25.6k',
    },
  },
};

export const upcomingPosts = [
  { id: 1, platform: 'Telegram', content: 'Excited to share a new case study tomorrow!', time: 'Tomorrow, 9:00 AM' },
  { id: 2, platform: 'X', content: 'Quick poll: What feature should we build next?', time: 'Oct 28, 4:30 PM' },
  { id: 3, platform: 'X', content: 'Weekly Q&A session is live in 30 minutes.', time: 'Oct 29, 8:00 PM' },
];

export const aiInsights = [
  'AI Suggests posting tomorrow at 8:30 PM for higher reach.',
  'Your followers interact 2× more with photo-based posts.',
];

export const recentInteractions = [
  { id: 1, type: 'comment', user: { name: 'Alex Doe', avatar: getImage('user-avatar-1') }, content: 'This is absolutely brilliant! Can\'t wait to try it out.', time: '2m ago', platform: 'X' },
  { id: 2, type: 'dm', user: { name: 'Samantha Bee', avatar: getImage('user-avatar-2') }, content: 'Hey, had a question about the pricing...', time: '15m ago', platform: 'Telegram' },
  { id: 3, type: 'mention', user: { name: 'TechCrunch', avatar: getImage('user-avatar-3') }, content: 'Great to see @solostreamapp pushing the boundaries of social media automation...', time: '1h ago', platform: 'X' },
];

export const systemHealth = {
  telegram: { status: 'ok', label: 'Telegram' },
  x: { status: 'warning', label: 'X', message: 'Needs refresh' },
};

export const inboxMessages = [
    { id: 1, user: { name: 'Alex Doe', avatar: getImage('user-avatar-1') }, content: 'This is absolutely brilliant! Can\'t wait to try it out.', timestamp: '2 hours ago', platform: 'X', type: 'comment', read: false },
    { id: 2, user: { name: 'Samantha Bee', avatar: getImage('user-avatar-2') }, content: 'Hey, had a question about the pricing. Is there a plan for startups?', timestamp: 'Yesterday', platform: 'Telegram', type: 'dm', read: false },
    { id: 3, user: { name: 'TechCrunch', avatar: getImage('user-avatar-3') }, content: 'Great to see @solostreamapp pushing the boundaries of social media automation. We\'d love to feature you.', timestamp: '2 days ago', platform: 'X', type: 'mention', read: true },
    { id: 4, user: { name: 'Jane Smith', avatar: getImage('user-avatar-gamal')}, content: 'Just wanted to say thank you! This tool has saved me so much time.', timestamp: '2 days ago', platform: 'Telegram', type: 'dm', read: true },
];

export const contentLibraryItems = [
    { id: 'cl1', type: 'post', title: 'Motivational Monday Kickstart', date: '2023-10-16', stats: { likes: 842, reach: '15.2k' }, image: getImage('library-1'), tags: ['Motivational', 'Campaign'] },
    { id: 'cl2', type: 'draft', title: 'Upcoming Feature Sneak Peek', date: '2023-10-20', image: getImage('library-2'), tags: ['Educational'] },
    { id: 'cl3', type: 'template', title: 'Weekly Roundup Template', date: '2023-09-01', tags: ['Template'] },
    { id: 'cl4', type: 'post', title: 'The Power of Consistent Branding', date: '2023-10-09', stats: { likes: 1102, reach: '22.1k' }, image: getImage('library-3'), tags: ['Educational', 'Personal'] },
    { id: 'cl5', type: 'media', title: 'Brand Logo Files', date: '2023-01-01', image: getImage('library-4'), tags: ['Asset'] },
    { id: 'cl6', type: 'post', title: 'Behind the scenes of our latest project', date: '2023-09-28', stats: { likes: 950, reach: '18.9k' }, image: getImage('library-5'), tags: ['Personal'] },
    { id: 'cl7', type: 'draft', title: 'New pricing plans announcement', date: '2023-10-22', image: getImage('library-6'), tags: ['Campaign'] },
];

export const analyticsData = {
    engagementPerDay: [
        { date: 'Sun', engagement: 280 },
        { date: 'Mon', engagement: 450 },
        { date: 'Tue', engagement: 400 },
        { date: 'Wed', engagement: 620 },
        { date: 'Thu', engagement: 580 },
        { date: 'Fri', engagement: 750 },
        { date: 'Sat', engagement: 820 },
    ],
    contentTypePerformance: [
        { type: 'Image', engagement: 45, fill: 'var(--color-chart-2)' },
        { type: 'Video', engagement: 25, fill: 'var(--color-chart-1)' },
        { type: 'Text', engagement: 15, fill: 'var(--color-chart-3)' },
        { type: 'Link', engagement: 15, fill: 'var(--color-chart-4)' },
    ],
    followerGrowth: [
        { date: 'Jan', followers: 12000 },
        { date: 'Feb', followers: 12500 },
        { date: 'Mar', followers: 13200 },
        { date: 'Apr', followers: 14000 },
        { date: 'May', followers: 15100 },
        { date: 'Jun', followers: 16000 },
        { date: 'Jul', followers: 16800 },
        { date: 'Aug', followers: 17500 },
        { date: 'Sep', followers: 18450 },
    ],
};
