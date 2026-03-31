import { Hono } from 'hono';
import { authMiddleware } from '../middleware/auth';
import { generateId, getTimestamp } from '../db';
import type { Env } from '../types';

const channels = new Hono<{ Bindings: Env }>();

// All channel routes require authentication
channels.use('*', authMiddleware);

// ─── Types ────────────────────────────────────────────────────────────────────

interface Channel {
  id: string;
  name: string;
  type: 'direct' | 'group';
  created_by: string;
  created_at: string;
  updated_at: string;
}

interface ChannelMember {
  id: string;
  channel_id: string;
  user_id: string;
  role: 'admin' | 'member';
  joined_at: string;
}

interface Message {
  id: string;
  channel_id: string;
  sender_id: string;
  sender_name: string;
  content: string;
  created_at: string;
  updated_at: string | null;
}

// In-memory storage (would be D1 in production)
const channelsStore: Channel[] = [
  { id: 'ch_general', name: 'General', type: 'group', created_by: 'system', created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z' },
  { id: 'ch_support', name: 'Support', type: 'group', created_by: 'system', created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z' },
  { id: 'ch_sales', name: 'Sales', type: 'group', created_by: 'system', created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z' },
];

const messagesStore: Message[] = [
  { id: 'msg_1', channel_id: 'ch_general', sender_id: 'user_1', sender_name: 'John Doe', content: 'Welcome to the General channel!', created_at: '2026-03-07T03:00:00Z', updated_at: null },
  { id: 'msg_2', channel_id: 'ch_general', sender_id: 'user_2', sender_name: 'Jane Smith', content: 'Thanks! Happy to be here.', created_at: '2026-03-07T03:05:00Z', updated_at: null },
  { id: 'msg_3', channel_id: 'ch_general', sender_id: 'user_1', sender_name: 'John Doe', content: 'Let me know if you need any help.', created_at: '2026-03-07T03:10:00Z', updated_at: null },
  { id: 'msg_4', channel_id: 'ch_support', sender_id: 'user_3', sender_name: 'Bob Wilson', content: 'Has anyone seen the new dashboard?', created_at: '2026-03-07T03:15:00Z', updated_at: null },
  { id: 'msg_5', channel_id: 'ch_sales', sender_id: 'user_2', sender_name: 'Jane Smith', content: 'Great progress on Q1 numbers!', created_at: '2026-03-07T03:20:00Z', updated_at: null },
];

// ─── Channel Routes ─────────────────────────────────────────────────────────

/**
 * GET /api/channels - List all channels
 */
channels.get('/', (c) => {
  return c.json({ channels: channelsStore });
});

/**
 * GET /api/channels/:id - Get a specific channel
 */
channels.get('/:id', (c) => {
  const id = c.req.param('id');
  const channel = channelsStore.find(ch => ch.id === id);
  
  if (!channel) {
    return c.json({ error: 'Channel not found' }, 404);
  }
  
  return c.json({ channel });
});

/**
 * POST /api/channels - Create a new channel
 */
channels.post('/', async (c) => {
  const body = await c.req.json();
  const user = c.get('user');
  
  if (!body.name) {
    return c.json({ error: 'Channel name is required' }, 400);
  }
  
  const newChannel: Channel = {
    id: generateId('ch'),
    name: body.name,
    type: body.type || 'group',
    created_by: user.userId,
    created_at: getTimestamp(),
    updated_at: getTimestamp(),
  };
  
  channelsStore.push(newChannel);
  
  return c.json({ channel: newChannel }, 201);
});

// ─── Message Routes ─────────────────────────────────────────────────────────

/**
 * GET /api/channels/:id/messages - Get messages for a channel
 * Query params: limit, before (timestamp for pagination)
 */
channels.get('/:id/messages', (c) => {
  const channelId = c.req.param('id');
  const limit = parseInt(c.req.query('limit') || '50');
  const before = c.req.query('before');
  
  // Check if channel exists
  const channel = channelsStore.find(ch => ch.id === channelId);
  if (!channel) {
    return c.json({ error: 'Channel not found' }, 404);
  }
  
  // Filter messages for this channel
  let messages = messagesStore.filter(m => m.channel_id === channelId);
  
  // Filter by before timestamp if provided
  if (before) {
    messages = messages.filter(m => m.created_at < before);
  }
  
  // Sort by created_at descending (newest first)
  messages.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  
  // Apply limit
  messages = messages.slice(0, limit);
  
  return c.json({ messages, channel });
});

/**
 * POST /api/channels/:id/messages - Send a message to a channel
 */
channels.post('/:id/messages', async (c) => {
  const channelId = c.req.param('id');
  const body = await c.req.json();
  const user = c.get('user');
  
  // Check if channel exists
  const channel = channelsStore.find(ch => ch.id === channelId);
  if (!channel) {
    return c.json({ error: 'Channel not found' }, 404);
  }
  
  if (!body.content || body.content.trim().length === 0) {
    return c.json({ error: 'Message content is required' }, 400);
  }
  
  const newMessage: Message = {
    id: generateId('msg'),
    channel_id: channelId,
    sender_id: user.userId,
    sender_name: user.email, // Using email as display name
    content: body.content,
    created_at: getTimestamp(),
    updated_at: null,
  };
  
  messagesStore.push(newMessage);
  
  return c.json({ message: newMessage }, 201);
});

export default channels;
