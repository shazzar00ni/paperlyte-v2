# Email Auto-Responder Templates

This directory contains email auto-responder templates for various legal and support email addresses.

## Available Templates

### 1. Privacy Auto-Responder

**File**: `privacy-auto-responder.txt`
**Email**: `privacy@paperlyte.com`
**Use**: Privacy requests (GDPR, CCPA, and other jurisdictions)
**Response Time**: GDPR: 30 days (Article 12); CCPA: 45 days (may be extended by 45 days with notice). Clearly indicate which law applies to your request; check local law for other jurisdictions.

### 2. Security Auto-Responder

**File**: `security-auto-responder.txt`
**Email**: `security@paperlyte.com`
**Use**: Security vulnerability reports
**Response Time**: 24 hours (recommended)

### 3. Support Auto-Responder

**File**: `support-auto-responder.txt`
**Email**: `support@paperlyte.com`
**Use**: General support requests
**Response Time**: 24-48 hours

### 4. DPO Auto-Responder

**File**: `dpo-auto-responder.txt`
**Email**: `dpo@paperlyte.com`
**Use**: Data Protection Officer inquiries (EU)
**Response Time**: GDPR: 30 days (Article 12)

### 5. Legal Auto-Responder

**File**: `legal-auto-responder.txt`
**Email**: `legal@paperlyte.com`
**Use**: Legal inquiries, contracts, compliance
**Response Time**: 30 days (recommended)

---

## Template Variables

All templates use placeholder variables that should be replaced by your email system:

| Variable                 | Description                    | Example                        |
| ------------------------ | ------------------------------ | ------------------------------ |
| `{{TICKET_ID}}`          | Unique ticket/reference number | `PRIV-2025-001`                |
| `{{SENDER_NAME}}`        | Name of the sender             | `John Doe`                     |
| `{{DATE_RECEIVED}}`      | Date/time received             | `November 28, 2025 at 3:45 PM` |
| `{{REQUEST_TYPE}}`       | Type of request                | `Data Access Request`          |
| `{{SEVERITY}}`           | Security issue severity        | `Medium`                       |
| `{{PRIORITY}}`           | Support priority               | `Normal`                       |
| `{{INQUIRY_TYPE}}`       | DPO inquiry type               | `DSAR`                         |
| `{{BOUNTY_INFO}}`        | Bug bounty program info        | `We offer rewards...`          |
| `{{COMPANY_ADDRESS}}`    | Physical address               | `123 Main St...`               |
| `{{DPO_NAME}}`           | DPO name                       | `Jane Smith`                   |
| `{{RESPONSE_TIME_CCPA}}` | Example response time (CCPA)   | `45 days`                      |

---

## Setup Instructions

### Option 1: Google Workspace

1. Go to Gmail Settings → Advanced → Templates
2. Enable templates
3. Create new template for each email address
4. Copy template content
5. Replace variables with actual values or use Apps Script

#### Using Apps Script for Auto-Variables:

```javascript
function autoResponder(e) {
  var message = e.message;
  var ticketId = "PRIV-" + new Date().getTime();
  var template = "Your template here with {{TICKET_ID}}";
  template = template.replace("{{TICKET_ID}}", ticketId);
  template = template.replace("{{DATE_RECEIVED}}", new Date().toString());
  // Send auto-response
  message.reply(template);
}
```

### Option 2: Microsoft 365

1. Go to Outlook → File → Automatic Replies
2. Set up rules for each email address
3. Create response template
4. Use Quick Parts for variable replacement

### Option 3: Email Service Providers

#### Help Scout

1. Go to Manage → Saved Replies
2. Create saved reply for each template
3. Use `{{ticket.id}}` syntax for variables

#### Zendesk

1. Go to Admin → Triggers
2. Create trigger for each email type
3. Use `{{ticket.id}}` for ticket number

#### Freshdesk

1. Go to Admin → Email Notifications
2. Create auto-response for each email
3. Use placeholders: `{{ticket.id}}`, `{{contact.name}}`

---

## Customization Checklist

Before using these templates, customize:

- [ ] Update company name (Paperlyte → Your company)
- [ ] Update URLs (paperlyte.com → your domain)
- [ ] Update email addresses
- [ ] Update physical address in DPO template
- [ ] Add DPO name in DPO template
- [ ] Add bug bounty program details (if applicable)
- [ ] Update response times to match your SLA
- [ ] Add links to your help center/docs
- [ ] Add status page URL
- [ ] Verify all links work
- [ ] Test templates before enabling

---

## Testing

### Test Each Template:

1. Send test email to each address
2. Verify auto-responder is sent
3. Check all variables are replaced
4. Verify formatting is correct
5. Test links in email
6. Check on mobile devices
7. Verify deliverability (not in spam)

### Test Deliverability:

- Send to Gmail, Outlook, Yahoo
- Check spam folders
- Verify SPF, DKIM, DMARC are configured
- Use mail-tester.com to check score

---

## Compliance Notes

### Privacy Requests (GDPR/CCPA)

- **Must** respond within 30 days (GDPR Article 12); CCPA: 45 days (may be extended by 45 days with notice); check local law for other jurisdictions
- **Must** verify identity before providing data
- **Must** log all requests for compliance
- **Should** use secure methods for data transfer

### Security Reports

- **Should** respond within 24 hours
- **Should** have escalation process for critical issues
- **Consider** bug bounty program
- **Must** not ignore reports

### Data Protection Officer (GDPR)

- **Required** if you process data of EU residents at scale
- **Must** be independent and have expertise
- **Must** be contactable by supervisory authorities
- **Must** respond within 30 days (GDPR Article 12)

---

## Email Monitoring

### Response Time SLAs

| Email     | Target Response              | Legal Requirement                         | Escalation       |
| --------- | ---------------------------- | ----------------------------------------- | ---------------- |
| privacy@  | GDPR: 30 days; CCPA: 45 days | ✅ Yes (see jurisdiction)                 | 7 days overdue   |
| dpo@      | 30 days (GDPR)               | ✅ Yes (GDPR)                             | 7 days overdue   |
| security@ | 24 hours                     | ❌ No (best practice)                     | 48 hours overdue |
| support@  | 24-48 hours                  | ❌ No                                     | 72 hours overdue |
| legal@    | As needed                    | ❌ No                                     | 7 days overdue   |
|           |                              | _Check local law for other jurisdictions_ |                  |

### Monitoring Checklist

- [ ] Set up email forwarding/monitoring
- [ ] Configure auto-responders
- [ ] Set up ticketing system
- [ ] Create logging spreadsheet
- [ ] Set up alerts for overdue responses
- [ ] Assign team members to each inbox
- [ ] Create escalation procedures
- [ ] Document response processes

---

## Additional Resources

- [GDPR Article 12 - Transparent information](https://gdpr-info.eu/art-12-gdpr/)
- [CCPA Consumer Rights](https://oag.ca.gov/privacy/ccpa)
- [Google Workspace Auto-Responses](https://support.google.com/a/answer/1279147)
- [Microsoft 365 Automatic Replies](https://support.microsoft.com/en-us/office/send-automatic-out-of-office-replies-from-outlook-9742f476-5348-4f9f-997f-5e208513bd67)

---

## Support

For questions about these templates:

- See [LEGAL-SETUP.md](../../docs/LEGAL-SETUP.md)
- For ongoing questions or template updates, see [LEGAL-SETUP.md](../../docs/LEGAL-SETUP.md) or contact your support channel.
- Contact your legal advisor

---

**Last Updated**: November 28, 2025
