import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICluster extends Document {
    location: {
        type: 'Point';
        coordinates: number[]; // [lng, lat]
    };
    issueType: string;
    title?: string;
    reportCount: number;
    totalSeverityScore: number;
    averageSeverity: number;
    priorityScore: number;
    status: 'reported' | 'acknowledged' | 'in-progress' | 'resolved';
    lastActivity: Date;
    reportIds: mongoose.Types.ObjectId[];
}

const ClusterSchema: Schema = new Schema({
    location: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number], required: true }
    },
    issueType: { type: String, required: true },
    title: String,
    reportCount: { type: Number, default: 1 },
    totalSeverityScore: { type: Number, default: 0 },
    averageSeverity: { type: Number, default: 0 },
    priorityScore: { type: Number, default: 0 },
    status: {
        type: String,
        enum: ['reported', 'acknowledged', 'in-progress', 'resolved'],
        default: 'reported'
    },
    lastActivity: { type: Date, default: Date.now },
    reportIds: [{ type: Schema.Types.ObjectId, ref: 'Report' }]
});

ClusterSchema.index({ location: '2dsphere' });
ClusterSchema.index({ priorityScore: -1 });

const Cluster: Model<ICluster> = mongoose.models.Cluster || mongoose.model<ICluster>('Cluster', ClusterSchema);

export default Cluster;
