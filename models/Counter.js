import mongoose from 'mongoose'

const counterSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, index: true },
    value: { type: Number, required: true },
  },
  { timestamps: true },
)

export const Counter = mongoose.models.Counter || mongoose.model('Counter', counterSchema)


