# Chatbot Authentication & Session Management Setup

## Overview

This document outlines the implementation of the chatbot authentication system with support for:
- **Guest users**: Anonymous users with temporary sessions (24-hour expiry)
- **Registered users**: Authenticated users with permanent sessions
- **Session linking**: Guest sessions are automatically linked to user accounts upon login/registration

## Architecture

### 1. Authentication Flow

```
Guest User → Anonymous ID (UUID) → Temporary Session (24h)
     ↓
Login/Register → Link Session → Permanent Session
```

### 2. Database Schema

#### `chatbot_sessions` table
- `id`: UUID (Primary Key)
- `customer_id`: UUID (Foreign Key to auth.users, nullable)
- `agent_id`: UUID (Foreign Key, nullable)
- `status`: text (e.g., 'active', 'closed')
- `created_at`: timestamptz
- `closed_at`: timestamptz (nullable)
- `anonymous_id`: UUID (for guest users, nullable)

#### `chatbot_messages` table
- `id`: UUID (Primary Key)
- `session_id`: UUID (Foreign Key to chatbot_sessions)
- `sender_id`: UUID (nullable)
- `message`: text
- `is_bot`: boolean
- `created_at`: timestamptz

## Setup Instructions

### 1. Database Setup

Run the following SQL in Supabase SQL Editor:

```sql
-- Run supabase-rls-policies.sql
-- This will create RLS policies, indexes, and helper functions
```

### 2. Environment Variables

Ensure your `.env.local` has:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 3. Supabase Configuration

#### Enable Realtime
1. Go to Supabase Dashboard → Database → Replication
2. Enable Realtime for:
   - `chatbot_sessions`
   - `chatbot_messages`

#### Set up Cron Job (Optional)
For automatic guest session cleanup, you can set up a cron job:

```sql
-- Create a cron job to run cleanup every hour
SELECT cron.schedule(
  'cleanup-guest-sessions',
  '0 * * * *', -- Every hour
  'SELECT net.http_post(
    url:=''https://your-project.supabase.co/functions/v1/cleanup-guest-sessions'',
    headers:=''{"Authorization": "Bearer ' || current_setting(''app.settings.service_role_key'') || '"}''::jsonb
  ) as request_id;'
);
```

### 4. API Endpoints

#### Session Management
- `POST /api/chat/sessions` - Create/get session with anonymous ID
- `GET /api/chat/sessions` - Get sessions for user/guest
- `POST /api/chat/link-session` - Link guest session to user account

#### Message Management
- `GET /api/chat/messages` - Get messages (with auth check)
- `POST /api/chat/messages` - Send message (with auth check)

#### Cleanup
- `POST /api/chat/cleanup-guest-sessions` - Manual cleanup
- `POST /functions/v1/cleanup-guest-sessions` - Edge function cleanup

## Security Features

### 1. Row Level Security (RLS)

#### Admin Access
- Can see/edit all sessions and messages
- Requires `role: 'admin'` in user metadata

#### User Access
- Can only see/edit their own sessions (`customer_id = auth.uid()`)
- Sessions are automatically linked upon login

#### Guest Access
- Can only see/edit sessions with their `anonymous_id`
- Anonymous ID is passed via JWT claim `anon_id`

### 2. Session Validation

All API endpoints validate:
- Session ownership (user vs guest)
- Session existence
- Access permissions

### 3. Automatic Session Linking

When a guest user logs in:
1. `AuthContext` detects login event
2. Calls `/api/chat/link-session` with `anonymousId`
3. All guest sessions are linked to the user account
4. `anonymous_id` is cleared from sessions

## Usage Examples

### Frontend Integration

```typescript
import { useAuth } from '@/context/AuthContext';

function Chatbot() {
  const { user, anonymousId, isGuest } = useAuth();
  
  // Create session
  const createSession = async () => {
    const { data } = await axios.post('/api/chat/sessions', {
      anonymousId: anonymousId
    });
    return data.session;
  };
  
  // Send message
  const sendMessage = async (message: string, sessionId: string) => {
    const { data } = await axios.post('/api/chat/messages', {
      message,
      isBot: false,
      anonymousId: isGuest ? anonymousId : undefined,
      customerId: user?.id
    }, {
      params: { sessionId }
    });
    return data.message;
  };
}
```

### Backend API Usage

```typescript
// Create session for guest
const { data: session } = await supabase
  .from('chatbot_sessions')
  .insert({
    status: 'active',
    anonymous_id: anonymousId
  })
  .select()
  .single();

// Link guest session to user
const { data: updatedSessions } = await supabase
  .from('chatbot_sessions')
  .update({ 
    customer_id: userId,
    anonymous_id: null
  })
  .eq('anonymous_id', anonymousId)
  .select();
```

## Testing

### 1. Guest User Flow
1. Open chatbot without login
2. Send message → Session created with `anonymous_id`
3. Check database for session with `anonymous_id`
4. Verify RLS policies allow access

### 2. User Login Flow
1. Start as guest user
2. Send some messages
3. Login/register
4. Verify sessions are linked to user account
5. Continue chatting → Messages appear in same session

### 3. Security Testing
1. Try accessing other user's sessions
2. Verify RLS policies block access
3. Test admin access with proper role

## Troubleshooting

### Common Issues

1. **RLS Policy Errors**
   - Check if policies are properly created
   - Verify JWT claims include `anon_id` for guests
   - Ensure admin role is set in user metadata

2. **Session Linking Fails**
   - Check if `anonymousId` is properly passed
   - Verify user authentication status
   - Check API endpoint logs

3. **Realtime Not Working**
   - Ensure Realtime is enabled for tables
   - Check RLS policies allow SELECT
   - Verify subscription setup in frontend

### Debug Queries

```sql
-- Check RLS status
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('chatbot_sessions', 'chatbot_messages');

-- List all policies
SELECT schemaname, tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('chatbot_sessions', 'chatbot_messages');

-- Check session data
SELECT id, customer_id, anonymous_id, status, created_at 
FROM chatbot_sessions 
ORDER BY created_at DESC 
LIMIT 10;
```

## Performance Considerations

1. **Indexes**: All foreign keys and frequently queried columns are indexed
2. **Cleanup**: Guest sessions are automatically cleaned up after 24 hours
3. **Realtime**: Optimized for real-time message delivery
4. **RLS**: Policies are designed for efficient query execution

## Future Enhancements

1. **Session Analytics**: Track session duration, message count, etc.
2. **Multi-device Support**: Allow users to have multiple active sessions
3. **Session Archiving**: Archive old sessions instead of deleting
4. **Advanced Cleanup**: Configurable cleanup intervals and retention policies
