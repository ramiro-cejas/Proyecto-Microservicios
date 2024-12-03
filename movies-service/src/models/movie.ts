import mongoose, { Document, Schema } from 'mongoose';

export interface IMovie extends Document {
  adult: boolean;
  backdrop_path: string;
  genre_ids: number[];
  id: number;
  original_language: string;
  original_title: string;
  overview: string;
  popularity: number;
  poster_path: string;
  release_date: string;
  title: string;
  video: boolean;
  vote_average: number;
  vote_count: number;
  createdAt: Date;
  updatedAt: Date;
}

const MovieSchema = new mongoose.Schema({
  adult: { type: Boolean, required: true },
  backdrop_path: { type: String, required: false },
  genre_ids: { type: [Number], required: false },
  id: { type: Number, required: true, unique: true },
  original_language: { type: String, required: true },
  original_title: { type: String, required: true },
  overview: { type: String, required: false },
  popularity: { type: Number, required: false },
  poster_path: { type: String, required: false },
  release_date: { type: String, required: false },
  title: { type: String, required: true },
  video: { type: Boolean, required: true },
  vote_average: { type: Number, required: false },
  vote_count: { type: Number, required: false },
}, {
  timestamps: true,
});

export default mongoose.model<IMovie>('Movie', MovieSchema);