"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateScore = calculateScore;
exports.calculateOverallScore = calculateOverallScore;
exports.mapAxeSeverity = mapAxeSeverity;
const SEVERITY_WEIGHTS = {
    CRITICAL: 10,
    SERIOUS: 5,
    MODERATE: 2,
    MINOR: 0.5,
};
function calculateScore(issues) {
    const deductions = issues.reduce((total, issue) => total + SEVERITY_WEIGHTS[issue.severity], 0);
    return Math.max(0, Math.min(100, 100 - deductions));
}
function calculateOverallScore(pageScores) {
    if (pageScores.length === 0)
        return 100;
    const totalWeight = pageScores.reduce((sum, p) => sum + Math.max(1, p.issueCount), 0);
    const weightedSum = pageScores.reduce((sum, p) => sum + p.score * Math.max(1, p.issueCount), 0);
    return Math.round((weightedSum / totalWeight) * 10) / 10;
}
function mapAxeSeverity(impact) {
    switch (impact) {
        case "critical":
            return "CRITICAL";
        case "serious":
            return "SERIOUS";
        case "moderate":
            return "MODERATE";
        case "minor":
        default:
            return "MINOR";
    }
}
