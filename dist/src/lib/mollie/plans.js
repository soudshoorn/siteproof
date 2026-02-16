"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PLANS = void 0;
exports.getPlanLimits = getPlanLimits;
exports.canAddWebsite = canAddWebsite;
exports.getMaxPagesPerScan = getMaxPagesPerScan;
exports.hasFeature = hasFeature;
exports.getPlanPrice = getPlanPrice;
exports.PLANS = {
    FREE: {
        name: "Gratis",
        price: 0,
        maxWebsites: 1,
        maxPagesPerScan: 5,
        scanFrequency: "MONTHLY",
        features: {
            emailAlerts: false,
            pdfExport: false,
            eaaStatement: false,
            trendAnalysis: false,
            prioritySupport: false,
            apiAccess: false,
            whiteLabel: false,
            maxTeamMembers: 1,
        },
    },
    STARTER: {
        name: "Starter",
        monthlyPrice: 4900,
        yearlyPrice: 40800,
        maxWebsites: 3,
        maxPagesPerScan: 100,
        scanFrequency: "WEEKLY",
        features: {
            emailAlerts: true,
            pdfExport: true,
            eaaStatement: true,
            trendAnalysis: true,
            prioritySupport: false,
            apiAccess: false,
            whiteLabel: false,
            maxTeamMembers: 2,
        },
    },
    PROFESSIONAL: {
        name: "Professional",
        monthlyPrice: 14900,
        yearlyPrice: 124200,
        maxWebsites: 10,
        maxPagesPerScan: 500,
        scanFrequency: "DAILY",
        features: {
            emailAlerts: true,
            pdfExport: true,
            eaaStatement: true,
            trendAnalysis: true,
            prioritySupport: true,
            apiAccess: false,
            whiteLabel: true,
            maxTeamMembers: 5,
        },
    },
    BUREAU: {
        name: "Bureau",
        monthlyPrice: 29900,
        yearlyPrice: 249200,
        maxWebsites: 50,
        maxPagesPerScan: 500,
        scanFrequency: "DAILY",
        features: {
            emailAlerts: true,
            pdfExport: true,
            eaaStatement: true,
            trendAnalysis: true,
            prioritySupport: true,
            apiAccess: true,
            whiteLabel: true,
            maxTeamMembers: 999,
        },
    },
};
function getPlanLimits(planType) {
    return exports.PLANS[planType];
}
function canAddWebsite(planType, currentWebsiteCount) {
    return currentWebsiteCount < exports.PLANS[planType].maxWebsites;
}
function getMaxPagesPerScan(planType) {
    return exports.PLANS[planType].maxPagesPerScan;
}
function hasFeature(planType, feature) {
    return exports.PLANS[planType].features[feature];
}
/**
 * Get the price for a plan in a given interval.
 * Returns 0 for the FREE plan.
 */
function getPlanPrice(planType, interval) {
    const plan = exports.PLANS[planType];
    if (!("monthlyPrice" in plan))
        return 0;
    return interval === "yearly" ? plan.yearlyPrice : plan.monthlyPrice;
}
