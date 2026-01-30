import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'

import { Registration } from './models/Registration.js'
import { Counter } from './models/Counter.js'

const app = express()

const PORT = process.env.PORT || 3001
const MONGODB_URI = process.env.MONGODB_URI
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*'
const START_COUNT = Number(process.env.START_COUNT || 12478)

if (!MONGODB_URI) {
  console.error('Missing required env var: MONGODB_URI')
  process.exit(1)
}

// Middleware
app.use(
  cors({
    origin: CORS_ORIGIN === '*' ? true : CORS_ORIGIN.split(',').map((s) => s.trim()),
  }),
)
app.use(express.json({ limit: '32kb' }))

// DB connect
await mongoose.connect(MONGODB_URI, {
  serverSelectionTimeoutMS: 10000,
})

// Ensure counter exists (so count endpoint works even before first registration)
const COUNTER_NAME = 'waitlist'
await Counter.findOneAndUpdate(
  { name: COUNTER_NAME },
  { $setOnInsert: { value: START_COUNT } },
  { upsert: true, new: true },
)

app.get('/api/health', (req, res) => {
  res.json({ ok: true })
})

// Get registration count
app.get('/api/registrations/count', async (req, res) => {
  try {
    const counter = await Counter.findOne({ name: COUNTER_NAME }).lean()
    res.json({ count: counter?.value ?? START_COUNT })
  } catch (error) {
    console.error('Error reading count:', error)
    res.status(500).json({ error: 'Failed to get count' })
  }
})

// Register email
app.post('/api/registrations', async (req, res) => {
  try {
    const rawEmail = req.body?.email
    const email = typeof rawEmail === 'string' ? rawEmail.trim().toLowerCase() : ''
    const platform = req.body?.platform || 'web'

    // basic validation
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({ error: 'Valid email is required' })
    }

    // Validate platform
    if (!['android', 'ios', 'web'].includes(platform.toLowerCase())) {
      return res.status(400).json({ error: 'Invalid platform. Must be android, ios, or web' })
    }

    // Create registration (unique on email)
    await Registration.create({ email, platform: platform.toLowerCase() })

    // Increment counter atomically
    let counter = await Counter.findOneAndUpdate(
      { name: COUNTER_NAME },
      { $inc: { value: 1 } },
      { new: true },
    )

    // Fallback: if for some reason counter is missing, create it starting from START_COUNT + 1
    if (!counter) {
      counter = await Counter.findOneAndUpdate(
        { name: COUNTER_NAME },
        { $setOnInsert: { value: START_COUNT + 1 } },
        { upsert: true, new: true },
      )
    }

    return res.json({
      success: true,
      count: counter.value,
      message: 'Registration successful',
    })
  } catch (error) {
    // Duplicate email (unique index)
    if (error?.code === 11000) {
      return res.status(409).json({ error: 'Email already registered' })
    }
    console.error('Error registering email:', error)
    return res.status(500).json({ error: 'Failed to register email' })
  }
})

// Admin-ish stats (does NOT return emails)
app.get('/api/registrations', async (req, res) => {
  try {
    const [counter, totalEmails] = await Promise.all([
      Counter.findOne({ name: COUNTER_NAME }).lean(),
      Registration.countDocuments({}),
    ])

    res.json({
      count: counter?.value ?? START_COUNT,
      totalEmails,
    })
  } catch (error) {
    console.error('Error reading registrations:', error)
    res.status(500).json({ error: 'Failed to get registrations' })
  }
})

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
})

