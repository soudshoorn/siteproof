"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resend = void 0;
exports.sendEmail = sendEmail;
const resend_1 = require("resend");
exports.resend = new resend_1.Resend(process.env.RESEND_API_KEY);
const EMAIL_FROM = process.env.EMAIL_FROM || "SiteProof <noreply@siteproof.nl>";
async function sendEmail({ to, subject, html, }) {
    return exports.resend.emails.send({
        from: EMAIL_FROM,
        to,
        subject,
        html,
    });
}
