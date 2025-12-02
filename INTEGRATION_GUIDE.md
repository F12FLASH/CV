
# Integration Guide

This guide explains how to integrate external services with your portfolio admin panel.

## Email Integration (SMTP)

To enable email sending functionality:

1. **Install nodemailer**:
```bash
npm install nodemailer @types/nodemailer
```

2. **Update server/routes.ts** to use nodemailer:
```typescript
import nodemailer from 'nodemailer';

// In the /api/email/test endpoint:
const transporter = nodemailer.createTransport({
  host: smtpSettings.value.smtpHost,
  port: smtpSettings.value.smtpPort,
  secure: smtpSettings.value.smtpSecure,
  auth: {
    user: smtpSettings.value.smtpUser,
    pass: smtpSettings.value.smtpPassword,
  },
});

await transporter.sendMail({
  from: settings.value.emailFromAddress,
  to,
  subject,
  html: body,
});
```

## Cloud Storage (AWS S3, Cloudflare R2)

1. **Install AWS SDK**:
```bash
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```

2. **Configure in Settings**:
- Add cloud storage credentials in admin settings
- Update file upload to use S3 instead of local storage

## CDN Integration (Cloudflare)

1. **Add Cloudflare API**:
```bash
npm install cloudflare
```

2. **Configure**:
- Store API key in security settings
- Implement cache purge endpoints
- Add zone configuration

## Third-Party Integrations

### Stripe
```bash
npm install stripe
```

### SendGrid
```bash
npm install @sendgrid/mail
```

### Slack Notifications
```bash
npm install @slack/web-api
```

## Database Backup/Restore

For production database backups:

1. **PostgreSQL Backup**:
```bash
pg_dump $DATABASE_URL > backup.sql
```

2. **Automated Backups**:
- Use cron jobs or Replit scheduled tasks
- Store backups in cloud storage
- Implement rotation policy

## Logging Enhancement

For advanced logging:

1. **Install Winston**:
```bash
npm install winston winston-daily-rotate-file
```

2. **Configure**:
- File-based logs with rotation
- Remote logging (Logtail, Papertrail)
- Error tracking (Sentry)

## Security Notes

- Store all API keys and secrets in Replit Secrets
- Never commit credentials to version control
- Use environment variables for sensitive data
- Implement rate limiting for external API calls

## Testing

Test each integration individually:
- SMTP: Send test email
- Storage: Upload test file
- CDN: Purge cache
- Backup: Create and restore test backup
