# WhatsApp Cloud API — Complete Integration Reference for Gifta

> **Purpose**: This document is the single source of truth for implementing WhatsApp messaging into the Gifta application. It is written for an AI coding agent and contains every technical detail needed to build a production-ready WhatsApp integration using Meta's official Cloud API.
>
> **Last updated**: February 2026
> **API Base URL**: `https://graph.facebook.com/v23.0`
> **Official SDK**: `whatsapp` (npm) — [github.com/WhatsApp/WhatsApp-Nodejs-SDK](https://github.com/WhatsApp/WhatsApp-Nodejs-SDK)

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Prerequisites & Account Setup](#2-prerequisites--account-setup)
3. [Authentication & Access Tokens](#3-authentication--access-tokens)
4. [Core Concepts & Terminology](#4-core-concepts--terminology)
5. [Sending Messages — API Reference](#5-sending-messages--api-reference)
   - 5.1 [Text Messages](#51-text-messages)
   - 5.2 [Template Messages](#52-template-messages)
   - 5.3 [Media Messages (Image, Video, Audio, Document)](#53-media-messages)
   - 5.4 [Interactive Messages (Buttons & Lists)](#54-interactive-messages)
   - 5.5 [Location Messages](#55-location-messages)
   - 5.6 [Contact Messages](#56-contact-messages)
   - 5.7 [Reaction Messages](#57-reaction-messages)
   - 5.8 [Reply / Context Messages](#58-reply--context-messages)
6. [Receiving Messages — Webhooks](#6-receiving-messages--webhooks)
   - 6.1 [Webhook Verification (GET)](#61-webhook-verification-get)
   - 6.2 [Event Notifications (POST)](#62-event-notifications-post)
   - 6.3 [Webhook Payload Structure](#63-webhook-payload-structure)
   - 6.4 [Message Status Updates](#64-message-status-updates)
7. [Media Management](#7-media-management)
8. [Message Templates](#8-message-templates)
9. [Pricing Model (July 2025+)](#9-pricing-model-july-2025)
10. [Rate Limits & Messaging Tiers](#10-rate-limits--messaging-tiers)
11. [Error Handling](#11-error-handling)
12. [Node.js Implementation Guide](#12-nodejs-implementation-guide)
13. [Gifta-Specific Integration Patterns](#13-gifta-specific-integration-patterns)
14. [Security & Compliance](#14-security--compliance)
15. [Environment Variables Reference](#15-environment-variables-reference)

---

## 1. Architecture Overview

The WhatsApp Cloud API is hosted by Meta and accessed via the Graph API. The integration model is:

```
┌─────────────┐       HTTPS POST        ┌──────────────────┐
│  Gifta App   │ ─────────────────────► │  Graph API        │
│  (Backend)   │   Send messages         │  graph.facebook   │
│              │ ◄───────────────────── │  .com/v23.0       │
│              │   JSON responses        └──────────────────┘
│              │                                  │
│              │       HTTPS POST                 │
│              │ ◄─────────────────────────────────┘
│  /webhook    │   Inbound messages & status updates
└─────────────┘
```

**Key architectural facts:**
- All API calls go to `https://graph.facebook.com/v23.0/{PHONE_NUMBER_ID}/messages`
- Inbound messages arrive via webhooks — you must expose a public HTTPS endpoint
- Media can be sent via URL link or by uploading to Meta's servers first (returns a media ID)
- Template messages are the ONLY way to initiate a conversation outside the 24-hour customer service window
- Free-form messages (text, media, interactive) can only be sent within the 24-hour window after a user messages you

---

## 2. Prerequisites & Account Setup

### Required accounts and assets:

| Asset | How to obtain |
|-------|--------------|
| **Facebook Account** | Personal Facebook account for the developer |
| **Meta Business Account** | Create at [business.facebook.com](https://business.facebook.com) |
| **Meta Developer App** | Create at [developers.facebook.com](https://developers.facebook.com) → My Apps → Create App → choose "Business" type |
| **WhatsApp Business Account (WABA)** | Created automatically when you add WhatsApp product to your app |
| **Business Phone Number** | A phone number not linked to any existing WhatsApp account. Must be able to receive SMS or voice call for verification |
| **Business Verification** | Business Settings → Security Center → Start Verification. Required for production messaging at scale |

### Setup steps (in order):

1. Go to [developers.facebook.com](https://developers.facebook.com) → My Apps → Create App
2. Select **"Business"** as the app type
3. In your app dashboard, click **Add Product** → select **WhatsApp**
4. Open WhatsApp → **Getting Started** page. This provides:
   - A temporary access token (expires every 24 hours)
   - A test phone number with Phone Number ID
   - WhatsApp Business Account ID
5. Add up to 5 test recipient numbers (for development)
6. Send a test message using the provided curl command
7. **For production**: Add your own business phone number via WhatsApp Manager or the Dev Console at `https://developers.facebook.com/apps/<APP_ID>/whatsapp-business/wa-dev-console`
8. Complete **Business Verification** to unlock production sending limits
9. Choose a **display name** that includes your actual business name (e.g., "Gifta by [Company]")
10. Wait for display name approval before registering
11. Download the base64-encoded certificate from WhatsApp Manager
12. Register the number via the Graph API `/register` endpoint

### Register a phone number via API:

```bash
curl -X POST \
  'https://graph.facebook.com/v23.0/{PHONE_NUMBER_ID}/register' \
  -H 'Authorization: Bearer {ACCESS_TOKEN}' \
  -H 'Content-Type: application/json' \
  -d '{
    "messaging_product": "whatsapp",
    "pin": "YOUR_6_DIGIT_PIN"
  }'
```

> **Important**: Enable Two-Step Verification in Security Center first to create your 6-digit PIN.

---

## 3. Authentication & Access Tokens

### Token types:

| Token Type | Lifespan | Use Case |
|-----------|----------|----------|
| **Temporary Access Token** | 24 hours | Testing only. Found on WhatsApp Getting Started page |
| **System User Access Token** | Never expires | **Production use.** Generated via Business Manager |

### Generating a permanent (System User) access token:

1. Go to Business Settings → Users → System Users
2. Create a system user (Admin role)
3. Add assets: assign the WhatsApp Business Account to this system user
4. Generate a token with permissions:
   - `whatsapp_business_messaging` — send/receive messages
   - `whatsapp_business_management` — manage templates, phone numbers, business profile
5. Store the token securely (environment variable, secrets manager — NEVER in code)

### All API requests must include the header:

```
Authorization: Bearer {ACCESS_TOKEN}
Content-Type: application/json
```

---

## 4. Core Concepts & Terminology

| Term | Definition |
|------|-----------|
| **WABA** | WhatsApp Business Account — the top-level container |
| **Phone Number ID** | Unique ID for your registered WhatsApp business number. Used in all API endpoint paths. NOT the phone number itself |
| **WhatsApp ID (wa_id)** | The customer's identifier. Usually matches their phone number (E.164 format without `+`). This is what you send messages TO |
| **Display Phone Number** | The actual phone number shown to users (e.g., `+1234567890`) |
| **Customer Service Window (CSW)** | A 24-hour window that opens when a customer messages you. Within this window, you can send free-form messages at no cost |
| **Free Entry Point (FEP)** | A 72-hour window triggered when a user clicks a Click-to-WhatsApp Ad or Facebook Page CTA. You must reply within 24h to activate it |
| **Template Message** | Pre-approved message formats. REQUIRED to initiate conversations outside the 24-hour CSW |
| **Message ID (wamid)** | Unique identifier for each message, returned in send responses and webhook payloads. Format: `wamid.HBgL...` |
| **E.164 Format** | International phone number format: `+{country_code}{number}` (e.g., `+27821234567` for South Africa). The `+` prefix is optional when sending but never present in webhook responses |

---

## 5. Sending Messages — API Reference

### Base endpoint:

```
POST https://graph.facebook.com/v23.0/{PHONE_NUMBER_ID}/messages
```

### Common request headers:

```
Authorization: Bearer {ACCESS_TOKEN}
Content-Type: application/json
```

### Common response (success):

```json
{
  "messaging_product": "whatsapp",
  "contacts": [
    {
      "input": "27821234567",
      "wa_id": "27821234567"
    }
  ],
  "messages": [
    {
      "id": "wamid.HBgLMjc4MjEyMzQ1NjcVAgASGBQzRUIwQjBGOTBBREU1QTgzQkRFQwA="
    }
  ]
}
```

---

### 5.1 Text Messages

Can only be sent within the 24-hour customer service window.

```json
{
  "messaging_product": "whatsapp",
  "recipient_type": "individual",
  "to": "27821234567",
  "type": "text",
  "text": {
    "preview_url": true,
    "body": "Hello from Gifta! 🎁 Your gift pool has been created."
  }
}
```

**Constraints:**
- `body`: max **4,096 characters**
- `preview_url`: set `true` to render link previews (URL must be in the body text)
- Supports WhatsApp formatting: `*bold*`, `_italic_`, `~strikethrough~`, `` ```monospace``` ``

---

### 5.2 Template Messages

**The only message type that can be sent outside the 24-hour window.** Templates must be pre-created and approved by Meta before use.

#### Basic template (no parameters):

```json
{
  "messaging_product": "whatsapp",
  "to": "27821234567",
  "type": "template",
  "template": {
    "name": "hello_world",
    "language": {
      "code": "en_US"
    }
  }
}
```

#### Template with parameters:

```json
{
  "messaging_product": "whatsapp",
  "to": "27821234567",
  "type": "template",
  "template": {
    "name": "gift_pool_invitation",
    "language": {
      "code": "en_US"
    },
    "components": [
      {
        "type": "header",
        "parameters": [
          {
            "type": "image",
            "image": {
              "link": "https://gifta.app/images/birthday-cake.jpg"
            }
          }
        ]
      },
      {
        "type": "body",
        "parameters": [
          {
            "type": "text",
            "text": "Sarah"
          },
          {
            "type": "text",
            "text": "John's Birthday Gift"
          },
          {
            "type": "text",
            "text": "R500"
          }
        ]
      },
      {
        "type": "button",
        "sub_type": "url",
        "index": "0",
        "parameters": [
          {
            "type": "text",
            "text": "pool-abc123"
          }
        ]
      }
    ]
  }
}
```

#### Template with Quick Reply buttons:

```json
{
  "messaging_product": "whatsapp",
  "to": "27821234567",
  "type": "template",
  "template": {
    "name": "contribution_reminder",
    "language": { "code": "en_US" },
    "components": [
      {
        "type": "body",
        "parameters": [
          { "type": "text", "text": "Sarah's Birthday Pool" },
          { "type": "text", "text": "R250" }
        ]
      },
      {
        "type": "button",
        "sub_type": "quick_reply",
        "index": "0",
        "parameters": [
          { "type": "payload", "payload": "CONTRIBUTE_NOW" }
        ]
      },
      {
        "type": "button",
        "sub_type": "quick_reply",
        "index": "1",
        "parameters": [
          { "type": "payload", "payload": "REMIND_LATER" }
        ]
      }
    ]
  }
}
```

**Template categories (determines pricing):**
- `MARKETING` — Promotions, offers, awareness campaigns
- `UTILITY` — Transaction confirmations, order updates, account alerts (FREE within CSW)
- `AUTHENTICATION` — OTPs, verification codes, login confirmations

**Template constraints:**
- Template name: lowercase alphanumeric + underscores only
- Body: max **1,024 characters**
- Header text: max **60 characters**
- Footer text: max **60 characters** (no variables allowed)
- Quick reply buttons: max **3**, each button text max **20 characters**
- CTA buttons: max **2**, each button text max **20 characters**
- Deleted template names cannot be reused for **30 days**
- Each template must be submitted per language

---

### 5.3 Media Messages

Can be sent within the 24-hour CSW. Media can be referenced by URL (`link`) or by uploaded media ID (`id`).

#### Image:

```json
{
  "messaging_product": "whatsapp",
  "to": "27821234567",
  "type": "image",
  "image": {
    "link": "https://gifta.app/images/pool-summary.png",
    "caption": "Here's your gift pool summary! 🎁"
  }
}
```

#### Video:

```json
{
  "messaging_product": "whatsapp",
  "to": "27821234567",
  "type": "video",
  "video": {
    "link": "https://gifta.app/videos/how-to-contribute.mp4",
    "caption": "Watch how to contribute to a gift pool"
  }
}
```

#### Document:

```json
{
  "messaging_product": "whatsapp",
  "to": "27821234567",
  "type": "document",
  "document": {
    "link": "https://gifta.app/receipts/pool-abc123.pdf",
    "filename": "GiftPool_Receipt.pdf",
    "caption": "Your contribution receipt"
  }
}
```

#### Audio:

```json
{
  "messaging_product": "whatsapp",
  "to": "27821234567",
  "type": "audio",
  "audio": {
    "id": "UPLOADED_AUDIO_MEDIA_ID"
  }
}
```

#### Supported media formats and size limits:

| Type | Formats | Max Size | Caption Support |
|------|---------|----------|----------------|
| **Image** | JPEG, PNG (8-bit, RGB/RGBA) | **5 MB** | ✅ Yes (max 1,024 chars) |
| **Video** | MP4, 3GP (H.264 video codec, AAC audio codec) | **16 MB** | ✅ Yes (max 1,024 chars) |
| **Audio** | AAC, MP3, MP4, AMR, OGG (OPUS codec only) | **16 MB** | ❌ No |
| **Document** | PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT | **100 MB** | ✅ Yes (max 1,024 chars) |
| **Sticker** | WebP (static), WebP (animated) | **100 KB** (static), **500 KB** (animated) | ❌ No |

---

### 5.4 Interactive Messages

Can only be sent within the 24-hour CSW. Do NOT require template approval.

#### Reply Buttons (max 3 buttons):

```json
{
  "messaging_product": "whatsapp",
  "to": "27821234567",
  "type": "interactive",
  "interactive": {
    "type": "button",
    "header": {
      "type": "text",
      "text": "Gift Pool Created! 🎁"
    },
    "body": {
      "text": "Sarah's Birthday Pool is ready. Target: R1,000. Would you like to share it with friends?"
    },
    "footer": {
      "text": "Powered by Gifta"
    },
    "action": {
      "buttons": [
        {
          "type": "reply",
          "reply": {
            "id": "SHARE_POOL",
            "title": "Share Now"
          }
        },
        {
          "type": "reply",
          "reply": {
            "id": "VIEW_POOL",
            "title": "View Details"
          }
        },
        {
          "type": "reply",
          "reply": {
            "id": "EDIT_POOL",
            "title": "Edit Pool"
          }
        }
      ]
    }
  }
}
```

#### List Message (max 10 rows per section, max 10 sections):

```json
{
  "messaging_product": "whatsapp",
  "to": "27821234567",
  "type": "interactive",
  "interactive": {
    "type": "list",
    "header": {
      "type": "text",
      "text": "Choose a Gift Amount"
    },
    "body": {
      "text": "Select how much you'd like to contribute to Sarah's birthday pool."
    },
    "footer": {
      "text": "Tap a button to select"
    },
    "action": {
      "button": "View Options",
      "sections": [
        {
          "title": "Suggested Amounts",
          "rows": [
            {
              "id": "AMOUNT_100",
              "title": "R100",
              "description": "A thoughtful contribution"
            },
            {
              "id": "AMOUNT_250",
              "title": "R250",
              "description": "A generous contribution"
            },
            {
              "id": "AMOUNT_500",
              "title": "R500",
              "description": "A premium contribution"
            }
          ]
        },
        {
          "title": "Other",
          "rows": [
            {
              "id": "CUSTOM_AMOUNT",
              "title": "Custom Amount",
              "description": "Enter your own amount"
            }
          ]
        }
      ]
    }
  }
}
```

#### CTA URL Button:

```json
{
  "messaging_product": "whatsapp",
  "to": "27821234567",
  "type": "interactive",
  "interactive": {
    "type": "cta_url",
    "header": {
      "type": "text",
      "text": "Ready to Contribute?"
    },
    "body": {
      "text": "Tap the button below to contribute to Sarah's gift pool securely."
    },
    "footer": {
      "text": "Secure payment via Gifta"
    },
    "action": {
      "name": "cta_url",
      "parameters": {
        "display_text": "Contribute Now",
        "url": "https://gifta.app/pool/abc123/contribute"
      }
    }
  }
}
```

**Interactive message constraints:**
- Header text: max **60 characters**
- Body text: max **1,024 characters**
- Footer text: max **60 characters**
- Reply button title: max **20 characters**
- Reply button ID: max **256 characters** (must be unique)
- List button text: max **20 characters**
- List row title: max **24 characters**
- List row description: max **72 characters**
- List row ID: max **200 characters**
- Max **3** reply buttons OR **1** list with up to **10 sections × 10 rows**
- Header can be `text`, `image`, `video`, or `document` for button type. Only `text` for list type

---

### 5.5 Location Messages

```json
{
  "messaging_product": "whatsapp",
  "to": "27821234567",
  "type": "location",
  "location": {
    "longitude": 18.4241,
    "latitude": -33.9249,
    "name": "Gift Shop - V&A Waterfront",
    "address": "V&A Waterfront, Cape Town, 8001"
  }
}
```

---

### 5.6 Contact Messages

```json
{
  "messaging_product": "whatsapp",
  "to": "27821234567",
  "type": "contacts",
  "contacts": [
    {
      "name": {
        "formatted_name": "Gifta Support",
        "first_name": "Gifta",
        "last_name": "Support"
      },
      "phones": [
        {
          "phone": "+27821234567",
          "type": "WORK"
        }
      ],
      "emails": [
        {
          "email": "support@gifta.app",
          "type": "WORK"
        }
      ],
      "urls": [
        {
          "url": "https://gifta.app",
          "type": "WORK"
        }
      ]
    }
  ]
}
```

---

### 5.7 Reaction Messages

```json
{
  "messaging_product": "whatsapp",
  "to": "27821234567",
  "type": "reaction",
  "reaction": {
    "message_id": "wamid.HBgLMjc4MjEyMzQ1NjcVAgASGBQ...",
    "emoji": "🎉"
  }
}
```

To remove a reaction, send an empty emoji string (`""`).

---

### 5.8 Reply / Context Messages

To reply to a specific message (shows a quote bubble), add `context` to any message payload:

```json
{
  "messaging_product": "whatsapp",
  "to": "27821234567",
  "type": "text",
  "context": {
    "message_id": "wamid.HBgLMjc4MjEyMzQ1NjcVAgASGBQ..."
  },
  "text": {
    "body": "Thanks for your contribution! 🎉"
  }
}
```

**Constraints:** Only messages less than **30 days old** can be quoted.

---

## 6. Receiving Messages — Webhooks

### 6.1 Webhook Verification (GET)

When you configure your webhook URL in the Meta App Dashboard, Meta sends a `GET` request to verify your endpoint.

**Your endpoint must:**
1. Read the query parameters
2. Verify the `hub.verify_token` matches your configured token
3. Respond with `hub.challenge` value (as plain text) with HTTP 200

```javascript
// Express.js webhook verification handler
app.get('/webhook/whatsapp', (req, res) => {
  const VERIFY_TOKEN = process.env.WEBHOOK_VERIFY_TOKEN;

  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('Webhook verified successfully');
    return res.status(200).send(challenge);
  }

  return res.sendStatus(403);
});
```

---

### 6.2 Event Notifications (POST)

After verification, Meta sends `POST` requests to your webhook for all subscribed events.

**Critical implementation requirements:**
- Respond with HTTP **200** within **20 seconds** or Meta will retry
- If delivery fails, Meta retries with decreasing frequency over **7 days**
- Process messages asynchronously — acknowledge the webhook immediately, then process
- Validate the payload using your app secret (see [Security](#14-security--compliance))

```javascript
app.post('/webhook/whatsapp', (req, res) => {
  // ALWAYS respond 200 immediately
  res.sendStatus(200);

  const body = req.body;

  if (body.object !== 'whatsapp_business_account') return;

  // Process asynchronously
  processWebhookEvent(body).catch(err => {
    console.error('Webhook processing error:', err);
  });
});

async function processWebhookEvent(body) {
  for (const entry of body.entry) {
    for (const change of entry.changes) {
      const value = change.value;

      // Handle incoming messages
      if (value.messages) {
        for (const message of value.messages) {
          await handleIncomingMessage(message, value.metadata);
        }
      }

      // Handle status updates
      if (value.statuses) {
        for (const status of value.statuses) {
          await handleStatusUpdate(status);
        }
      }
    }
  }
}
```

---

### 6.3 Webhook Payload Structure

#### Incoming text message:

```json
{
  "object": "whatsapp_business_account",
  "entry": [
    {
      "id": "WABA_ID",
      "changes": [
        {
          "value": {
            "messaging_product": "whatsapp",
            "metadata": {
              "display_phone_number": "27821234567",
              "phone_number_id": "PHONE_NUMBER_ID"
            },
            "contacts": [
              {
                "profile": {
                  "name": "Customer Name"
                },
                "wa_id": "27829876543"
              }
            ],
            "messages": [
              {
                "from": "27829876543",
                "id": "wamid.HBgLMjc4Mjk4NzY1NDMVAgASGBQ...",
                "timestamp": "1706745600",
                "type": "text",
                "text": {
                  "body": "I want to create a gift pool"
                }
              }
            ]
          },
          "field": "messages"
        }
      ]
    }
  ]
}
```

#### Incoming button reply:

```json
{
  "messages": [
    {
      "from": "27829876543",
      "id": "wamid.HBgL...",
      "timestamp": "1706745700",
      "type": "interactive",
      "interactive": {
        "type": "button_reply",
        "button_reply": {
          "id": "CONTRIBUTE_NOW",
          "title": "Contribute Now"
        }
      }
    }
  ]
}
```

#### Incoming list reply:

```json
{
  "messages": [
    {
      "from": "27829876543",
      "id": "wamid.HBgL...",
      "timestamp": "1706745800",
      "type": "interactive",
      "interactive": {
        "type": "list_reply",
        "list_reply": {
          "id": "AMOUNT_250",
          "title": "R250",
          "description": "A generous contribution"
        }
      }
    }
  ]
}
```

#### Incoming image message:

```json
{
  "messages": [
    {
      "from": "27829876543",
      "id": "wamid.HBgL...",
      "timestamp": "1706745900",
      "type": "image",
      "image": {
        "mime_type": "image/jpeg",
        "sha256": "abc123...",
        "id": "MEDIA_ID",
        "caption": "Here's the gift idea"
      }
    }
  ]
}
```

#### Template button callback (quick reply):

```json
{
  "messages": [
    {
      "from": "27829876543",
      "id": "wamid.HBgL...",
      "timestamp": "1706746000",
      "type": "button",
      "button": {
        "text": "Contribute Now",
        "payload": "CONTRIBUTE_NOW"
      }
    }
  ]
}
```

> **Important**: Template quick reply callbacks arrive as `type: "button"` (not `type: "interactive"`). Standard interactive button replies arrive as `type: "interactive"` with `interactive.type: "button_reply"`.

---

### 6.4 Message Status Updates

Status updates are delivered to your webhook for messages YOU sent.

```json
{
  "statuses": [
    {
      "id": "wamid.HBgLMjc4MjEyMzQ1NjcVAgASGBQ...",
      "status": "delivered",
      "timestamp": "1706745650",
      "recipient_id": "27829876543"
    }
  ]
}
```

**Status progression:** `sent` → `delivered` → `read` → (optionally `failed`)

| Status | Meaning |
|--------|---------|
| `sent` | Message accepted by WhatsApp servers |
| `delivered` | Message delivered to recipient's device |
| `read` | Recipient opened/read the message |
| `failed` | Delivery failed. Check `errors` array for details |

---

## 7. Media Management

### Upload media:

```bash
curl -X POST \
  'https://graph.facebook.com/v23.0/{PHONE_NUMBER_ID}/media' \
  -H 'Authorization: Bearer {ACCESS_TOKEN}' \
  -F 'file=@"/path/to/image.jpg"' \
  -F 'type="image/jpeg"' \
  -F 'messaging_product="whatsapp"'
```

**Response:**
```json
{
  "id": "MEDIA_ID"
}
```

### Retrieve media URL:

```bash
curl -X GET \
  'https://graph.facebook.com/v23.0/{MEDIA_ID}' \
  -H 'Authorization: Bearer {ACCESS_TOKEN}'
```

**Response:**
```json
{
  "url": "https://lookaside.fbsbx.com/whatsapp_business/...",
  "mime_type": "image/jpeg",
  "sha256": "abc123...",
  "file_size": 123456,
  "id": "MEDIA_ID",
  "messaging_product": "whatsapp"
}
```

> **Important**: The returned `url` is temporary and valid for **5 minutes** only. Download it immediately. Media is stored on Meta's servers for **30 days**.

### Download media (from webhook):

When you receive a media message via webhook, you get a `media_id`. To download:

1. GET the media URL using the media ID (as above)
2. GET the actual file from the returned URL with the Bearer token

```javascript
async function downloadMedia(mediaId) {
  // Step 1: Get media URL
  const metaRes = await fetch(
    `https://graph.facebook.com/v23.0/${mediaId}`,
    { headers: { Authorization: `Bearer ${ACCESS_TOKEN}` } }
  );
  const { url } = await metaRes.json();

  // Step 2: Download the file
  const fileRes = await fetch(url, {
    headers: { Authorization: `Bearer ${ACCESS_TOKEN}` }
  });
  return fileRes.buffer();
}
```

### Delete media:

```bash
curl -X DELETE \
  'https://graph.facebook.com/v23.0/{MEDIA_ID}' \
  -H 'Authorization: Bearer {ACCESS_TOKEN}'
```

---

## 8. Message Templates

### Creating templates:

Templates are created either via the **WhatsApp Manager UI** (Business Manager → WhatsApp → Message Templates) or via the **Business Management API**.

#### Create template via API:

```bash
curl -X POST \
  'https://graph.facebook.com/v23.0/{WABA_ID}/message_templates' \
  -H 'Authorization: Bearer {ACCESS_TOKEN}' \
  -H 'Content-Type: application/json' \
  -d '{
    "name": "gift_pool_invite",
    "language": "en_US",
    "category": "UTILITY",
    "components": [
      {
        "type": "HEADER",
        "format": "IMAGE"
      },
      {
        "type": "BODY",
        "text": "Hi {{1}}! You've been invited to contribute to {{2}}. Target amount: {{3}}. Tap below to contribute!",
        "example": {
          "body_text": [["Sarah", "John's Birthday Gift", "R500"]]
        }
      },
      {
        "type": "FOOTER",
        "text": "Powered by Gifta"
      },
      {
        "type": "BUTTONS",
        "buttons": [
          {
            "type": "URL",
            "text": "Contribute Now",
            "url": "https://gifta.app/pool/{{1}}",
            "example": ["abc123"]
          }
        ]
      }
    ]
  }'
```

### Template approval:
- Templates are reviewed by Meta (usually within minutes to hours)
- Status: `PENDING` → `APPROVED` or `REJECTED`
- Rejected templates include a rejection reason
- Keep templates clear, non-deceptive, and correctly categorized

### Recommended Gifta templates:

| Template Name | Category | Purpose |
|--------------|----------|---------|
| `gift_pool_invitation` | UTILITY | Invite someone to contribute to a pool |
| `contribution_confirmation` | UTILITY | Confirm a contribution was received |
| `pool_target_reached` | UTILITY | Notify that a pool has reached its target |
| `contribution_reminder` | MARKETING | Remind someone about a pending contribution |
| `pool_created_notification` | UTILITY | Notify the recipient that a pool was created for them |
| `welcome_message` | MARKETING | First-time user welcome |
| `payment_receipt` | UTILITY | Send payment confirmation |
| `otp_verification` | AUTHENTICATION | Verify phone number with OTP |

---

## 9. Pricing Model (July 2025+)

As of July 1, 2025, WhatsApp uses **per-message pricing** (replacing the previous conversation-based model).

### How it works:

- **Each delivered template message is billed individually**
- **Service messages (free-form replies within 24-hour CSW) are FREE**
- **Utility templates sent within an active CSW are FREE**
- Pricing varies by **message category** and **recipient country code**

### Categories and approximate rates:

| Category | Approximate Rate (USD) | Billable When |
|---------|----------------------|---------------|
| **Marketing** | $0.025 – $0.14 per message | Always when delivered |
| **Utility** | $0.004 – $0.05 per message | Only outside the 24-hour CSW |
| **Authentication** | $0.004 – $0.05 per message | Always when delivered |
| **Service** | **FREE** | Free-form messages within 24-hour CSW |

### Cost optimization strategies for Gifta:

1. **Leverage the CSW**: When a user messages you, utility templates sent within that 24-hour window are free
2. **Use free entry points**: Click-to-WhatsApp Ads give you a 72-hour free window
3. **Categorize correctly**: Use UTILITY for transactional messages (confirmations, updates). Mis-categorized templates get reclassified as Marketing (most expensive)
4. **Volume tiers**: High-volume utility and authentication messages qualify for up to 20% discount
5. **Service window strategy**: Prompt users to initiate conversations, then respond with utility templates for free

> **Note**: Check the latest Meta rate cards for South Africa and your target markets at [business.whatsapp.com/products/platform-pricing](https://business.whatsapp.com/products/platform-pricing)

---

## 10. Rate Limits & Messaging Tiers

### API rate limits:

| Limit Type | Value |
|-----------|-------|
| Messages API (Cloud API) | **80 messages/second** per phone number |
| Media upload | **100 uploads/hour** per phone number |
| Template creation | **100 templates per hour** per WABA |
| Business Management API | **200 calls/hour** |

### Messaging tiers (business-initiated):

New accounts start at the lowest tier. Tiers increase based on volume and quality.

| Tier | Daily Business-Initiated Limit |
|------|-------------------------------|
| **Tier 1** (Unverified) | 250 unique users/day |
| **Tier 1** (Verified) | 1,000 unique users/day |
| **Tier 2** | 10,000 unique users/day |
| **Tier 3** | 100,000 unique users/day |
| **Tier 4** | Unlimited |

**Tier advancement rules:**
- Business must be verified
- Phone number quality rating must be "Medium" or higher
- You must reach the daily limit of your current tier within a 7-day window
- Tier increases happen automatically

**Quality rating:**
- Based on user feedback (blocks, reports)
- Ratings: `GREEN` (High), `YELLOW` (Medium), `RED` (Low)
- Low quality can cause tier decreases or template pausing
- Marketing templates have per-user frequency limits imposed by Meta

---

## 11. Error Handling

### Error response structure:

```json
{
  "error": {
    "message": "(#131030) Recipient phone number not in allowed list",
    "type": "OAuthException",
    "code": 131030,
    "error_data": {
      "messaging_product": "whatsapp",
      "details": "Recipient phone number not in allowed list..."
    },
    "error_subcode": 2494010,
    "fbtrace_id": "A1B2C3D4E5"
  }
}
```

### Critical error codes:

| Code | Meaning | Action |
|------|---------|--------|
| **0** | AuthException — Token expired/invalid | Regenerate access token |
| **1** | API Unknown Error | Retry with exponential backoff |
| **2** | Service temporarily unavailable | Wait and retry |
| **3** | Permissions error | Check app permissions |
| **4** | Rate limit hit | Implement backoff; reduce request frequency |
| **100** | Invalid parameter | Validate request payload |
| **131000** | Something went wrong (generic) | Retry; if persistent, check app config |
| **131005** | Access denied — permissions | Verify `whatsapp_business_messaging` permission |
| **131009** | Parameter missing or invalid | Check required fields in payload |
| **131026** | Message undeliverable | Recipient may have blocked you or number is invalid |
| **131030** | Recipient not in allowed list | (Test mode only) Add number to test recipients |
| **131047** | Re-engagement message — more than 24h | Use a template message instead |
| **131051** | Message type unsupported | Check message type compatibility |
| **132000** | Template parameter count mismatch | Match parameters to template variables |
| **132012** | Template not found | Check template name and language code |
| **133010** | Phone number not registered | Register the phone number first |
| **135000** | Generic send failure | Retry with backoff |
| **368** | Temporarily blocked for policy violations | Review messaging practices |

### Recommended error handling strategy:

```javascript
async function sendWhatsAppMessage(payload, retries = 3) {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const response = await fetch(
        `https://graph.facebook.com/v23.0/${PHONE_NUMBER_ID}/messages`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${ACCESS_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (data.error) {
        const { code } = data.error;

        // Non-retryable errors
        if ([100, 131026, 131030, 131047, 132000, 132012].includes(code)) {
          throw new WhatsAppError(data.error);
        }

        // Retryable errors
        if ([1, 2, 4, 131000, 135000].includes(code)) {
          const delay = Math.pow(2, attempt) * 1000;
          await new Promise(r => setTimeout(r, delay));
          continue;
        }

        throw new WhatsAppError(data.error);
      }

      return data;
    } catch (err) {
      if (attempt === retries - 1) throw err;
    }
  }
}
```

---

## 12. Node.js Implementation Guide

### Option A: Direct API calls (recommended for full control)

#### Project setup:

```bash
npm init -y
npm install express dotenv node-fetch@2 crypto
```

#### Complete WhatsApp service module:

```javascript
// services/whatsapp.js
const fetch = require('node-fetch');

const GRAPH_API_URL = process.env.GRAPH_API_URL || 'https://graph.facebook.com/v23.0';
const PHONE_NUMBER_ID = process.env.WA_PHONE_NUMBER_ID;
const ACCESS_TOKEN = process.env.WA_ACCESS_TOKEN;

const MESSAGES_URL = `${GRAPH_API_URL}/${PHONE_NUMBER_ID}/messages`;
const MEDIA_URL = `${GRAPH_API_URL}/${PHONE_NUMBER_ID}/media`;

const headers = {
  'Authorization': `Bearer ${ACCESS_TOKEN}`,
  'Content-Type': 'application/json',
};

// ── Send functions ──────────────────────────────────────

async function sendText(to, body, previewUrl = false) {
  return sendMessage({
    messaging_product: 'whatsapp',
    to,
    type: 'text',
    text: { body, preview_url: previewUrl },
  });
}

async function sendTemplate(to, templateName, languageCode, components = []) {
  return sendMessage({
    messaging_product: 'whatsapp',
    to,
    type: 'template',
    template: {
      name: templateName,
      language: { code: languageCode },
      components,
    },
  });
}

async function sendImage(to, imageUrl, caption = '') {
  return sendMessage({
    messaging_product: 'whatsapp',
    to,
    type: 'image',
    image: { link: imageUrl, caption },
  });
}

async function sendDocument(to, documentUrl, filename, caption = '') {
  return sendMessage({
    messaging_product: 'whatsapp',
    to,
    type: 'document',
    document: { link: documentUrl, filename, caption },
  });
}

async function sendInteractiveButtons(to, body, buttons, header = null, footer = null) {
  const interactive = {
    type: 'button',
    body: { text: body },
    action: {
      buttons: buttons.map(btn => ({
        type: 'reply',
        reply: { id: btn.id, title: btn.title },
      })),
    },
  };
  if (header) interactive.header = { type: 'text', text: header };
  if (footer) interactive.footer = { text: footer };

  return sendMessage({
    messaging_product: 'whatsapp',
    to,
    type: 'interactive',
    interactive,
  });
}

async function sendInteractiveList(to, body, buttonText, sections, header = null, footer = null) {
  const interactive = {
    type: 'list',
    body: { text: body },
    action: { button: buttonText, sections },
  };
  if (header) interactive.header = { type: 'text', text: header };
  if (footer) interactive.footer = { text: footer };

  return sendMessage({
    messaging_product: 'whatsapp',
    to,
    type: 'interactive',
    interactive,
  });
}

async function sendCtaUrl(to, body, displayText, url, header = null, footer = null) {
  const interactive = {
    type: 'cta_url',
    body: { text: body },
    action: {
      name: 'cta_url',
      parameters: { display_text: displayText, url },
    },
  };
  if (header) interactive.header = { type: 'text', text: header };
  if (footer) interactive.footer = { text: footer };

  return sendMessage({
    messaging_product: 'whatsapp',
    to,
    type: 'interactive',
    interactive,
  });
}

async function markAsRead(messageId) {
  return sendMessage({
    messaging_product: 'whatsapp',
    status: 'read',
    message_id: messageId,
  });
}

// ── Core send function with retry logic ──────────────────

async function sendMessage(payload, retries = 3) {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const response = await fetch(MESSAGES_URL, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.error) {
        const code = data.error.code;
        const nonRetryable = [100, 131026, 131030, 131047, 132000, 132012, 133010];
        if (nonRetryable.includes(code) || attempt === retries - 1) {
          throw new Error(`WhatsApp API Error ${code}: ${data.error.message}`);
        }
        await new Promise(r => setTimeout(r, Math.pow(2, attempt) * 1000));
        continue;
      }

      return data;
    } catch (err) {
      if (attempt === retries - 1) throw err;
    }
  }
}

// ── Media functions ──────────────────────────────────────

async function uploadMedia(filePath, mimeType) {
  const FormData = require('form-data');
  const fs = require('fs');
  const form = new FormData();
  form.append('file', fs.createReadStream(filePath));
  form.append('type', mimeType);
  form.append('messaging_product', 'whatsapp');

  const response = await fetch(MEDIA_URL, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${ACCESS_TOKEN}` },
    body: form,
  });
  return response.json();
}

async function getMediaUrl(mediaId) {
  const response = await fetch(`${GRAPH_API_URL}/${mediaId}`, {
    headers: { 'Authorization': `Bearer ${ACCESS_TOKEN}` },
  });
  return response.json();
}

module.exports = {
  sendText,
  sendTemplate,
  sendImage,
  sendDocument,
  sendInteractiveButtons,
  sendInteractiveList,
  sendCtaUrl,
  markAsRead,
  uploadMedia,
  getMediaUrl,
};
```

#### Webhook handler:

```javascript
// routes/webhook.js
const express = require('express');
const crypto = require('crypto');
const router = express.Router();

const VERIFY_TOKEN = process.env.WA_WEBHOOK_VERIFY_TOKEN;
const APP_SECRET = process.env.META_APP_SECRET;

// Verification endpoint (GET)
router.get('/', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    return res.status(200).send(challenge);
  }
  return res.sendStatus(403);
});

// Event notification endpoint (POST)
router.post('/', validateSignature, (req, res) => {
  // Acknowledge immediately
  res.sendStatus(200);

  const body = req.body;
  if (body.object !== 'whatsapp_business_account') return;

  for (const entry of body.entry) {
    for (const change of entry.changes) {
      const value = change.value;
      const phoneNumberId = value.metadata?.phone_number_id;

      // Incoming messages
      if (value.messages) {
        for (const msg of value.messages) {
          handleMessage(msg, value.contacts?.[0], phoneNumberId);
        }
      }

      // Status updates
      if (value.statuses) {
        for (const status of value.statuses) {
          handleStatus(status);
        }
      }
    }
  }
});

// Signature validation middleware
function validateSignature(req, res, next) {
  if (!APP_SECRET) return next(); // Skip in dev

  const signature = req.headers['x-hub-signature-256'];
  if (!signature) return res.sendStatus(401);

  const expectedSig = 'sha256=' + crypto
    .createHmac('sha256', APP_SECRET)
    .update(req.rawBody || JSON.stringify(req.body))
    .digest('hex');

  if (signature !== expectedSig) return res.sendStatus(401);
  next();
}

// Message router
async function handleMessage(msg, contact, phoneNumberId) {
  const from = msg.from;
  const name = contact?.profile?.name || 'Unknown';
  const msgId = msg.id;

  console.log(`Message from ${name} (${from}): type=${msg.type}`);

  switch (msg.type) {
    case 'text':
      await handleTextMessage(from, msg.text.body, msgId);
      break;
    case 'interactive':
      if (msg.interactive.type === 'button_reply') {
        await handleButtonReply(from, msg.interactive.button_reply, msgId);
      } else if (msg.interactive.type === 'list_reply') {
        await handleListReply(from, msg.interactive.list_reply, msgId);
      }
      break;
    case 'button':
      // Template quick reply callback
      await handleTemplateButton(from, msg.button, msgId);
      break;
    case 'image':
    case 'video':
    case 'audio':
    case 'document':
      await handleMediaMessage(from, msg.type, msg[msg.type], msgId);
      break;
    case 'location':
      await handleLocationMessage(from, msg.location, msgId);
      break;
    default:
      console.log(`Unhandled message type: ${msg.type}`);
  }
}

function handleStatus(status) {
  console.log(`Message ${status.id}: ${status.status} at ${status.timestamp}`);
  // Update message status in database
}

// Implement these based on Gifta business logic
async function handleTextMessage(from, text, msgId) { /* ... */ }
async function handleButtonReply(from, reply, msgId) { /* ... */ }
async function handleListReply(from, reply, msgId) { /* ... */ }
async function handleTemplateButton(from, button, msgId) { /* ... */ }
async function handleMediaMessage(from, type, media, msgId) { /* ... */ }
async function handleLocationMessage(from, location, msgId) { /* ... */ }

module.exports = router;
```

#### Express server setup:

```javascript
// server.js
require('dotenv').config();
const express = require('express');
const webhookRouter = require('./routes/webhook');

const app = express();

// IMPORTANT: Raw body needed for signature validation
app.use(express.json({
  verify: (req, res, buf) => { req.rawBody = buf; }
}));

app.use('/webhook/whatsapp', webhookRouter);

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`WhatsApp webhook server running on port ${PORT}`);
});
```

### Option B: Official Meta Node.js SDK

```bash
npm install whatsapp
```

```javascript
// Using the official SDK
import WhatsApp from 'whatsapp';

const wa = new WhatsApp(Number(process.env.WA_PHONE_NUMBER_ID));

// Send text
await wa.messages.text({ body: 'Hello from Gifta!' }, recipientNumber);

// Send template
await wa.messages.template(
  {
    name: 'gift_pool_invite',
    language: { code: 'en_US' },
    components: [
      {
        type: 'body',
        parameters: [
          { type: 'text', text: 'Sarah' },
          { type: 'text', text: "John's Birthday" },
          { type: 'text', text: 'R500' },
        ],
      },
    ],
  },
  recipientNumber
);

// Send image
await wa.messages.image(
  { link: 'https://gifta.app/image.jpg', caption: 'Gift pool summary' },
  recipientNumber
);

// Start webhook listener
wa.webhooks.start((statusCode, headers, body, resp, err) => {
  if (resp) {
    resp.writeHead(200, { 'Content-Type': 'text/plain' });
    resp.end();
  }
  if (body) processWebhookPayload(body);
  if (err) console.error(err);
});
```

**SDK environment variables (.env):**

```env
WA_PHONE_NUMBER_ID=1234567890
WA_BUSINESS_ACCOUNT_ID=0987654321
CLOUD_API_ACCESS_TOKEN=your_system_user_token
CLOUD_API_VERSION=v23.0
M4D_APP_ID=your_app_id
M4D_APP_SECRET=your_app_secret
WEBHOOK_ENDPOINT=webhook
WEBHOOK_VERIFICATION_TOKEN=your_custom_verify_token
LISTENER_PORT=3000
```

---

## 13. Gifta-Specific Integration Patterns

### Use case: Gift Pool Invitation Flow

```
1. User creates a gift pool in Gifta
2. Gifta sends TEMPLATE message to each invitee (outside 24h window)
   → template: gift_pool_invitation (UTILITY)
   → params: invitee name, pool name, target amount, CTA URL
3. Invitee taps "Contribute Now" → opens Gifta web app
4. After contributing, Gifta sends TEMPLATE confirmation (UTILITY)
   → template: contribution_confirmation
5. When pool reaches target, send TEMPLATE notification (UTILITY)
   → template: pool_target_reached
```

### Use case: Conversational Bot (within 24h window)

```
1. User sends "Hi" to Gifta WhatsApp number
   → CSW opens (24 hours of free messaging)
2. Gifta replies with interactive buttons:
   "What would you like to do?"
   [Create Pool] [My Pools] [Help]
3. User taps "Create Pool"
4. Gifta sends list message for occasion type
5. User selects "Birthday"
6. Gifta asks for recipient name (text)
7. User types "Sarah"
8. Gifta asks for target amount (list or text)
   ... and so on
```

### Use case: Contribution Reminders

```
1. Pool creator requests reminders
2. Gifta checks if invitee has messaged within 24h
   → YES: Send free interactive message with CTA
   → NO: Send MARKETING template (paid per message)
3. Track delivery status via webhook status updates
4. If status = "read" but no action → schedule follow-up
```

### Current Gifta runtime status (post-Phase B5)

- Reminder dispatch persists **per-channel send state** (`email_sent_at`, `whatsapp_sent_at`) so email is not re-sent when WhatsApp retry fails.
- Reminder retries use bounded backoff via `attempt_count`, `next_attempt_at`, and 48-hour terminal expiry policy.
- WhatsApp reminder dispatch is runtime-gated behind `UX_V2_ENABLE_WHATSAPP_REMINDER_DISPATCH`.
- Webhook endpoint implemented at `/api/webhooks/whatsapp`:
  - `GET`: Meta verification (`hub.verify_token`)
  - `POST`: `X-Hub-Signature-256` validation + inbound/status ingestion
- Failed WhatsApp delivery statuses can requeue reminder WhatsApp channel retries (without duplicating already-sent email).

### Tracking CSW state:

```javascript
// Database schema suggestion for tracking customer service windows
{
  user_phone: "27829876543",       // wa_id
  last_inbound_at: "2026-02-08T10:00:00Z",  // timestamp of last user message
  csw_expires_at: "2026-02-09T10:00:00Z",   // 24h after last_inbound_at
  is_csw_active: true,             // computed: now < csw_expires_at
}

// Before sending a message, check:
function canSendFreeForm(userPhone) {
  const user = await db.findUser(userPhone);
  return user && new Date() < new Date(user.csw_expires_at);
}

// Route message type accordingly:
if (canSendFreeForm(phone)) {
  await whatsapp.sendText(phone, message);        // Free
} else {
  await whatsapp.sendTemplate(phone, template...); // Paid
}
```

---

## 14. Security & Compliance

### Webhook signature validation:

Every webhook POST from Meta includes an `X-Hub-Signature-256` header containing an HMAC SHA-256 signature of the payload using your app secret. **Always validate this in production.**

```javascript
const crypto = require('crypto');

function isValidSignature(rawBody, signature, appSecret) {
  const expected = 'sha256=' + crypto
    .createHmac('sha256', appSecret)
    .update(rawBody)
    .digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expected)
  );
}
```

### Opt-in requirements:

WhatsApp requires **explicit user opt-in** before you send business-initiated messages. You must:

1. Clearly inform users they will receive WhatsApp messages
2. Obtain opt-in via your app's sign-up flow, settings page, or other consent mechanism
3. Honour opt-out requests immediately (e.g., user types "STOP")
4. Maintain opt-in records

### SSL/TLS requirements:

- Webhook endpoint MUST use HTTPS with a valid TLS/SSL certificate
- Self-signed certificates are **NOT supported**
- Use services like Let's Encrypt, or deploy behind a reverse proxy (nginx, Cloudflare)

### Token security:

- NEVER expose access tokens in client-side code
- Store tokens in environment variables or a secrets manager
- Rotate tokens if compromised
- Use System User tokens (not personal tokens) for production

### Data handling:

- Media URLs from Meta are temporary (5 min). Download and store in your own infrastructure if needed
- End-to-end encryption is handled by WhatsApp — your API calls use TLS in transit
- Comply with POPIA (South Africa) and GDPR (if serving EU users) for storing user data

---

## 15. Environment Variables Reference

```env
# ── WhatsApp Cloud API ──────────────────────────────────
WA_PHONE_NUMBER_ID=123456789012345         # Your business phone number ID
WA_BUSINESS_ACCOUNT_ID=987654321098765     # Your WABA ID
WA_ACCESS_TOKEN=EAAGm0PX4ZCpsBA...        # System User access token (permanent)
WA_API_VERSION=v23.0                       # Graph API version
WA_API_BASE_URL=https://graph.facebook.com # Graph API base URL

# ── Meta App ────────────────────────────────────────────
META_APP_ID=1234567890                     # Your Meta app ID
META_APP_SECRET=abcdef1234567890           # Your Meta app secret (for webhook validation)

# ── Webhook ─────────────────────────────────────────────
WA_WEBHOOK_VERIFY_TOKEN=your_custom_verify_token_string  # Must match what you enter in Meta dashboard
WA_WEBHOOK_PORT=3000                       # Port for webhook listener
WA_WEBHOOK_PATH=/webhook/whatsapp          # URL path for webhook endpoint

# ── Optional ────────────────────────────────────────────
WA_TEST_RECIPIENT=27821234567              # Test phone number for development
WA_MAX_RETRIES=3                           # API call retry count
WA_RETRY_DELAY_MS=1000                     # Base retry delay (exponential backoff)

# ── Gifta compatibility aliases (legacy; avoid for new setup) ───────────
WHATSAPP_BUSINESS_API_URL=
WHATSAPP_BUSINESS_API_TOKEN=
WHATSAPP_PHONE_NUMBER_ID=
WHATSAPP_TEMPLATE_LANGUAGE=en_US
```

---

## Quick Reference — Message Type Decision Tree

```
Need to send a message to user?
│
├─ Has user messaged us in the last 24 hours?
│   ├─ YES → Customer Service Window is OPEN
│   │   ├─ Send any message type for FREE:
│   │   │   text, image, video, document, audio,
│   │   │   interactive (buttons/list), location, contact
│   │   └─ Utility templates are also FREE in this window
│   │
│   └─ NO → Customer Service Window is CLOSED
│       └─ You MUST use a pre-approved TEMPLATE message
│           ├─ UTILITY → Transactional (confirmations, updates)
│           ├─ AUTHENTICATION → OTPs, verification
│           └─ MARKETING → Promotions, reminders, re-engagement
│               (Each delivered template is billed per-message)
│
└─ Receiving a message from user?
    └─ Webhook POST → Parse, respond within 24h window
```

---

## Appendix A — curl Quick Reference

```bash
# Send text message
curl -X POST 'https://graph.facebook.com/v23.0/PHONE_NUMBER_ID/messages' \
  -H 'Authorization: Bearer ACCESS_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{"messaging_product":"whatsapp","to":"27821234567","type":"text","text":{"body":"Hello!"}}'

# Send template
curl -X POST 'https://graph.facebook.com/v23.0/PHONE_NUMBER_ID/messages' \
  -H 'Authorization: Bearer ACCESS_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{"messaging_product":"whatsapp","to":"27821234567","type":"template","template":{"name":"hello_world","language":{"code":"en_US"}}}'

# Upload media
curl -X POST 'https://graph.facebook.com/v23.0/PHONE_NUMBER_ID/media' \
  -H 'Authorization: Bearer ACCESS_TOKEN' \
  -F 'file=@/path/to/file.pdf' \
  -F 'type=application/pdf' \
  -F 'messaging_product=whatsapp'

# Mark message as read
curl -X POST 'https://graph.facebook.com/v23.0/PHONE_NUMBER_ID/messages' \
  -H 'Authorization: Bearer ACCESS_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{"messaging_product":"whatsapp","status":"read","message_id":"wamid.HBgL..."}'
```

---

## Appendix B — Webhook Event Types

Subscribe to these events in your Meta App Dashboard → WhatsApp → Configuration:

| Event | Description |
|-------|-------------|
| `messages` | Inbound messages (text, media, interactive replies, location, contacts) |
| `message_template_status_update` | Template approval/rejection notifications |
| `message_template_quality_update` | Template quality rating changes |
| `phone_number_quality_update` | Phone number quality rating changes |
| `phone_number_name_update` | Display name approval status changes |
| `account_update` | WABA account changes |
| `account_review_update` | Business verification status changes |
| `security` | Security-related events (e.g., two-step verification changes) |

---

*This document provides everything needed to implement a complete WhatsApp integration for Gifta. For the latest API changes, refer to the official Meta documentation at [developers.facebook.com/docs/whatsapp/cloud-api](https://developers.facebook.com/docs/whatsapp/cloud-api) and the Developer Hub at [business.whatsapp.com/developers/developer-hub](https://business.whatsapp.com/developers/developer-hub).*
