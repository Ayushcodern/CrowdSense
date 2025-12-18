import dbConnect from './db';
import Report, { IReport } from '@/models/Report';
import Cluster, { ICluster } from '@/models/Cluster';

const CLUSTER_RADIUS_METERS = 50;
const WEIGHT_COUNT = 20; // Increased from 10 to make "more reports" have higher impact
const WEIGHT_SEVERITY = 20;

export async function processReport(reportData: Partial<IReport>) {
    await dbConnect();

    // 1. Create and Save the Raw Report
    const report = await Report.create(reportData);

    // 2. Search for existing nearby clusters
    // We want clusters of the same IssueType, that are NOT resolved
    const nearbyClusters = await Cluster.find({
        location: {
            $near: {
                $geometry: {
                    type: 'Point',
                    coordinates: report.location.coordinates
                },
                $maxDistance: CLUSTER_RADIUS_METERS
            }
        },
        issueType: report.issueType,
        status: { $ne: 'resolved' }
    }).limit(1);

    let cluster;

    if (nearbyClusters.length > 0) {
        // === MERGE INTO EXISTING CLUSTER ===
        cluster = nearbyClusters[0];

        // Update Fields
        cluster.reportIds.push(report._id as any);
        cluster.reportCount += 1;
        cluster.totalSeverityScore += report.severity;
        cluster.averageSeverity = cluster.totalSeverityScore / cluster.reportCount;
        cluster.lastActivity = new Date();

        // Recalculate Priority
        cluster.priorityScore = (cluster.reportCount * WEIGHT_COUNT) + (cluster.averageSeverity * WEIGHT_SEVERITY);

        // Optional: Drift Cluster center slightly towards new report (Simple weighted average could work, but sticking to simple for now)
        // We keep original centroid to prevent cluster Walking.

        await cluster.save();

        // Update Report with reference
        report.clusterId = cluster._id as any;
        report.status = 'clustered';
        await report.save();

    } else {
        // === CREATE NEW CLUSTER ===
        const priorityScore = (1 * WEIGHT_COUNT) + (report.severity * WEIGHT_SEVERITY);

        cluster = await Cluster.create({
            location: report.location,
            issueType: report.issueType,
            title: `${capitalize(report.issueType)} Issue`,
            reportCount: 1,
            totalSeverityScore: report.severity,
            averageSeverity: report.severity,
            priorityScore: priorityScore,
            status: 'reported',
            reportIds: [report._id],
            lastActivity: new Date()
        });

        report.clusterId = cluster._id as any;
        report.status = 'clustered';
        await report.save();
    }

    return { report, cluster };
}

function capitalize(s: string) {
    return s.charAt(0).toUpperCase() + s.slice(1);
}
