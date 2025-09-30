# Chatbot Flow Update - Intent Classification System

## การปรับปรุง Flow ของ Chatbot

### Flow ใหม่ (จากขั้นตอนที่ 3 เป็นต้นไป)

1. **Strict Match (FAQ + Alias)** - เหมือนเดิม
2. **Vector Match (FAQ + Alias)** - เหมือนเดิม  
3. **Gemini Classify Intent** - ใหม่! 🆕
4. **Handle Intent** - ใหม่! 🆕
5. **Post-processing** - ปรับปรุงแล้ว ✅

---

## ขั้นตอนที่ 3: Gemini Classify Intent

ถ้า vector ยังไม่เจอ → ส่งคำถามให้ Gemini classify intent

### API: `/api/chat/intent-classification`

**Categories:**
- `faq` - คำถาม FAQ ทั่วไป
- `rooms` - คำถามเกี่ยวกับห้องพัก
- `promo_codes` - คำถามเกี่ยวกับโปรโมชั่น
- `other` - คำถามอื่นๆ

**Prompt:**
```
You are an intent classification assistant.
Categories: faq, rooms, promo_codes, other.
Answer only with the category name.
User question: "${userQuestion}"
```

---

## ขั้นตอนที่ 4: Handle Intent

### 4.1 FAQ (ยังไม่เจอใน strict/vector)
- **Fallback:** ให้ Gemini ตอบโดยใช้ FAQ context ทั้งหมด
- ดึง FAQ ทั้งหมดจาก database เป็น context
- ส่งให้ Gemini สร้างคำตอบ

### 4.2 Rooms
- **SQL Generation:** ส่ง schema + userQuestion ให้ Gemini เขียน SQL
- **SQL Execution:** Execute SQL → ได้ผลลัพธ์
- **Response Generation:** เอาผลลัพธ์ + userQuestion → feed ให้ Gemini ตอบ

**Schema:**
```sql
rooms(id, room_type, price, promotion_price, currency, guests, is_active, room_size, amenities, bed_type, view_type, description, images)
```

**Example Prompt (SQL Generation):**
```
You are a SQL assistant.
Convert the user's question into a SQL query.
Use ONLY the following schema:
rooms(id, room_type, price, promotion_price, currency, guests, is_active, room_size, amenities, bed_type, view_type, description, images)
User question: "${userQuestion}"
Return only the SQL query.
```

**Example Prompt (Response Generation):**
```
User Question: "${userQuestion}"
Context from database:
${JSON.stringify(result)}
Answer only based on the context.
```

### 4.3 Promo Codes
- เหมือนกับ rooms แต่ใช้ schema `promo_codes`

**Schema:**
```sql
promo_codes(id, code, discount_percent, discount_amount, expires_at, is_active, usage_limit, used_count, description)
```

**Example SQL ที่ Gemini อาจสร้าง:**
```sql
SELECT code, discount_percent, expires_at
FROM promo_codes
WHERE expires_at > NOW();
```

### 4.4 Other
- ใช้ context หรือ fallback

---

## ขั้นตอนที่ 5: Post-processing (ปรับปรุงแล้ว)

**เดิม:** ถ้า Gemini ตอบไม่อิง context → ตัดทิ้ง แล้วแทนด้วย "ไม่พบข้อมูล"

**ใหม่:** ถ้า Gemini ตอบไม่อิง context → ใช้ fallback message จาก context table

---

## การติดตั้ง

### 1. รัน SQL Scripts

```bash
# ใน Supabase SQL Editor
# 1. รัน setup-context-table.sql
# 2. รัน setup-rooms-promo-tables.sql
```

### 2. ไฟล์ใหม่ที่เพิ่มเข้ามา

- `src/pages/api/chat/intent-classification.ts` - Intent classification API
- `src/pages/api/chat/handle-intent.ts` - Intent handling API  
- `src/pages/api/chat/contexts.ts` - Context management API
- `setup-context-table.sql` - Context table setup
- `setup-rooms-promo-tables.sql` - Rooms & promo codes tables

### 3. ไฟล์ที่อัพเดต

- `src/pages/api/chat/bot-response.ts` - ใช้ intent classification แทนการโยนเข้า Gemini โดยตรง

---

## การทดสอบ

### 1. ทดสอบ Intent Classification

```bash
curl -X POST http://localhost:3000/api/chat/intent-classification \
  -H "Content-Type: application/json" \
  -d '{"userQuestion": "มีห้องแบบไหนบ้าง"}'
```

**Expected Response:**
```json
{
  "intent": "rooms",
  "originalResponse": "rooms"
}
```

### 2. ทดสอบ Handle Intent

```bash
curl -X POST http://localhost:3000/api/chat/handle-intent \
  -H "Content-Type: application/json" \
  -d '{
    "intent": "rooms",
    "userQuestion": "มีห้องแบบไหนบ้าง"
  }'
```

### 3. ทดสอบผ่าน Chatbot

ลองพิมพ์ข้อความเหล่านี้:

- **FAQ:** "สวัสดี", "ติดต่อยังไง"
- **Rooms:** "มีห้องแบบไหนบ้าง", "ราคาห้องเท่าไหร่", "ห้องแบบไหนมี jacuzzi"
- **Promo Codes:** "มีโปรโมชั่นอะไรบ้าง", "โค้ดส่วนลดยังไง"
- **Other:** "แนะนำร้านอาหารใกล้ๆ"

---

## ข้อดีของระบบใหม่

1. **Intent Classification** - เข้าใจความต้องการของผู้ใช้ได้ดีขึ้น
2. **SQL Generation** - สามารถตอบคำถามเกี่ยวกับข้อมูลใน database ได้อย่างแม่นยำ
3. **Context Management** - จัดการ fallback message ได้ดีขึ้น
4. **Modular Design** - แยกส่วนการทำงานชัดเจน ง่ายต่อการดูแล

---

## การ Debug

### ดู Logs ใน Console

```
🎯 INTENT CLASSIFICATION for: [คำถาม]
🎯 CLASSIFIED INTENT: [intent]
🎯 HANDLING INTENT: [intent]
📚 FAQ FALLBACK - Getting all FAQ context...
🏨 ROOMS INTENT - Generating SQL...
🎟️ PROMO CODES INTENT - Generating SQL...
🤷 OTHER INTENT - Using general context...
```

### ตรวจสอบ Database

```sql
-- ตรวจสอบ contexts
SELECT * FROM chatbot_contexts;

-- ตรวจสอบ rooms
SELECT * FROM rooms WHERE is_active = true;

-- ตรวจสอบ promo codes
SELECT * FROM promo_codes WHERE is_active = true AND expires_at > NOW();
```
