# Supabase Realtime Setup for Chatbot

## การตั้งค่า Supabase Realtime

### 1. เปิดใช้งาน Realtime ใน Supabase Dashboard

1. เข้าไปที่ [Supabase Dashboard](https://supabase.com/dashboard)
2. เลือกโปรเจคของคุณ
3. ไปที่ **Database** > **Replication**
4. เปิดใช้งาน **Realtime** สำหรับตาราง:
   - `chatbot_messages`
   - `chatbot_sessions`

### 2. ตั้งค่า Row Level Security (RLS)

```sql
-- Enable RLS for chatbot_messages
ALTER TABLE chatbot_messages ENABLE ROW LEVEL SECURITY;

-- Allow public read access for realtime
CREATE POLICY "Allow public read for realtime" ON chatbot_messages
FOR SELECT USING (true);

-- Allow public insert for realtime
CREATE POLICY "Allow public insert for realtime" ON chatbot_messages
FOR INSERT WITH CHECK (true);
```

### 3. ทดสอบการทำงาน

1. เปิด browser console
2. เปิด chatbot และส่งข้อความ
3. ดู console logs:
   - "Setting up Realtime subscription for session: [session_id]"
   - "Realtime subscription status: SUBSCRIBED"
   - "New message received via Realtime: [payload]"

### 4. ฟีเจอร์ที่ใช้งานได้

- ✅ **Real-time Message Updates**: ข้อความใหม่ปรากฏทันที
- ✅ **Bot Responses**: Bot ตอบกลับแบบ real-time
- ✅ **Multi-tab Sync**: ข้อความ sync กันทุก tab
- ✅ **Auto-cleanup**: Subscription ถูกปิดอัตโนมัติเมื่อ component unmount

### 5. การ Debug

```javascript
// เปิด browser console เพื่อดู logs
console.log('Realtime subscription status:', status);
console.log('New message received via Realtime:', payload);
```

### 6. Bot Response Commands

ลองพิมพ์ข้อความเหล่านี้เพื่อทดสอบ bot:

- "สวัสดี" → "สวัสดีครับ! ยินดีต้อนรับสู่โรงแรม Neatly ครับ"
- "ห้อง" → ข้อมูลเกี่ยวกับห้องพัก
- "ราคา" → ข้อมูลราคา
- "จอง" → ข้อมูลการจอง
- ข้อความอื่นๆ → ข้อมูลติดต่อ

## Troubleshooting

### ปัญหา: ไม่เห็นข้อความ bot
- ตรวจสอบว่า Realtime เปิดใช้งานใน Supabase Dashboard
- ตรวจสอบ console logs สำหรับ error messages
- ตรวจสอบ RLS policies

### ปัญหา: Subscription ไม่ทำงาน
- ตรวจสอบ network connection
- ตรวจสอบ Supabase API keys
- ตรวจสอบ browser console สำหรับ error messages
