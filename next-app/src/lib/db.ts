import mongoose, { Schema, Document, Model } from 'mongoose';
import fs from 'fs';
import path from 'path';

// Define Mongoose Types
export interface IEvidence {
  id: string;
  title: string;
  url: string;
  source_type: string;
  publisher: string;
  published_on: string;
  summary: string;
}

export interface IPromise {
  id: string;
  promise_text: string;
  category: string;
  impact_summary: string;
  status: 'done' | 'in_progress' | 'not_started' | 'misleading';
  confidence: 'high' | 'medium' | 'low';
  evidence: IEvidence[];
  target_date?: string;
  last_verified?: string;
}

export interface IConstituency extends Document {
  id: string;
  name: string;
  state: string;
  representative: string;
  party: string;
  term?: string;
  metrics: {
    promise_vs_execution: { score_pct: number; details?: string };
    work_vs_impact: { score_pct: number; details?: string };
  };
  promises: IPromise[];
}

const EvidenceSchema = new Schema<IEvidence>({
  id: String,
  title: String,
  url: String,
  source_type: String,
  publisher: String,
  published_on: String,
  summary: String,
});

const PromiseSchema = new Schema<IPromise>({
  id: { type: String, required: true },
  promise_text: { type: String, required: true },
  category: { type: String },
  impact_summary: { type: String },
  status: { type: String, required: true, enum: ['done', 'in_progress', 'not_started', 'misleading'] },
  confidence: { type: String, required: true, enum: ['high', 'medium', 'low'] },
  evidence: [EvidenceSchema],
  target_date: String,
  last_verified: String,
});

const ConstituencySchema = new Schema<IConstituency>({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  state: { type: String, required: true },
  representative: { type: String, required: true },
  party: { type: String, required: true },
  metrics: {
    promise_vs_execution: {
      score_pct: { type: Number, required: true },
      details: String
    },
    work_vs_impact: {
      score_pct: { type: Number, required: true },
      details: String
    }
  },
  promises: [PromiseSchema]
});

// Avoid Re-compiling Model
export const ConstituencyModel: Model<IConstituency> =
  mongoose.models.Constituency || mongoose.model<IConstituency>('Constituency', ConstituencySchema);

// Connection Cache
let cachedConnection: typeof mongoose | null = null;

async function connectToDatabase() {
  if (cachedConnection) return cachedConnection;
  const uri = process.env.MONGODB_URI;
  if (!uri) return null; // No URI, fallback to local file system

  try {
    cachedConnection = await mongoose.connect(uri, {
      bufferCommands: false,
    });

    // Auto-seed if database is empty
    try {
      const count = await ConstituencyModel.countDocuments();
      if (count === 0) {
        console.log('MongoDB connection successful but database is empty. Auto-seeding...');
        const localData = getLocalData();
        if (localData && localData.length > 0) {
          await ConstituencyModel.insertMany(localData);
          console.log(`Successfully seeded database with ${localData.length} constituencies.`);
        }
      }
    } catch (seedError) {
      console.error('Failed to auto-seed database:', seedError);
    }

    return cachedConnection;
  } catch (error) {
    console.error('Failed to connect to MongoDB, using local fallback:', error);
    return null;
  }
}

// Local File Database Fallback
const LOCAL_DATA_PATH = path.join(process.cwd(), 'src/data/app-ingest.v1.json');
const LOCAL_CORRECTIONS_PATH = path.join(process.cwd(), 'src/data/corrections.json');

function getLocalData() {
  try {
    const data = fs.readFileSync(LOCAL_DATA_PATH, 'utf-8');
    const parsed = JSON.parse(data);
    return parsed.constituencies || parsed;
  } catch (error) {
    console.error('Error reading local data:', error);
    return [];
  }
}

// API methods
export async function getConstituencies(): Promise<any[]> {
  const db = await connectToDatabase();
  if (db) {
    return await ConstituencyModel.find({}).lean();
  }
  return getLocalData();
}

export async function getConstituencyById(id: string): Promise<any | null> {
  const db = await connectToDatabase();
  if (db) {
    return await ConstituencyModel.findOne({ id }).lean();
  }
  const localData = getLocalData();
  return localData.find((c: any) => c.id === id) || null;
}

export async function addCorrection(constituencyId: string, data: any) {
  const db = await connectToDatabase();
  const correctionEntry = {
    constituencyId,
    ...data,
    timestamp: new Date().toISOString(),
  };

  if (db) {
    // If we have DB connection, write to a temporary Correction collection
    const CorrectionSchema = new Schema({
      constituencyId: String,
      promiseId: String,
      name: String,
      email: String,
      note: String,
      sourceUrl: String,
      fileName: String,
      timestamp: String,
    });
    const CorrectionModel = mongoose.models.Correction || mongoose.model('Correction', CorrectionSchema);
    await new CorrectionModel(correctionEntry).save();
    return { success: true, db: true };
  } else {
    // Write to a local JSON file in development mode
    try {
      let currentCorrections: any[] = [];
      if (fs.existsSync(LOCAL_CORRECTIONS_PATH)) {
        currentCorrections = JSON.parse(fs.readFileSync(LOCAL_CORRECTIONS_PATH, 'utf-8'));
      }
      currentCorrections.push(correctionEntry);
      fs.writeFileSync(LOCAL_CORRECTIONS_PATH, JSON.stringify(currentCorrections, null, 2), 'utf-8');
      return { success: true, local: true };
    } catch (e) {
      console.error('Failed to write local correction:', e);
      return { success: false, error: String(e) };
    }
  }
}
