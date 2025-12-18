import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IReport extends Document {
    location: {
        type: 'Point';
        coordinates: number[]; // [lng, lat]
    };
    issueType: 'pothole' | 'garbage' | 'light' | 'safety' | 'water' | 'traffic' | 'noise';
    description?: string;
    imageUrl?: string;
    severity: number;
    timestamp: Date;
    status: 'new' | 'clustered';
    clusterId?: mongoose.Types.ObjectId;
}

const ReportSchema: Schema = new Schema({
    location: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number], required: true }
    },
    issueType: {
        type: String,
        enum: ['pothole', 'garbage', 'light', 'safety', 'water', 'traffic', 'noise'],
        required: true
    },
    description: String,
    imageUrl: String,
    severity: { type: Number, min: 1, max: 5, required: true },
    timestamp: { type: Date, default: Date.now },
    status: { type: String, enum: ['new', 'clustered'], default: 'new' },
    clusterId: { type: Schema.Types.ObjectId, ref: 'Cluster' }
});

// IMPORTANT: Geospatial Index
ReportSchema.index({ location: '2dsphere' });

const Report: Model<IReport> = mongoose.models.Report || mongoose.model<IReport>('Report', ReportSchema);

export default Report;
