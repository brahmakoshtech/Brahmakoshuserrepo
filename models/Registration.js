import mongoose from 'mongoose'

const registrationSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, index: true },
    platform: { type: String, enum: ['android', 'ios', 'web'], default: 'web' },
  },
  { timestamps: true },
)

export const Registration =
  mongoose.models.Registration || mongoose.model('Registration', registrationSchema)


