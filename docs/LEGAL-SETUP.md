# Legal Documentation Setup Guide

This guide will help you customize the legal documents and company information for your Paperlyte deployment.

## 📋 Overview

Paperlyte includes template legal documents that need to be customized with your actual company information:

-  [Privacy Policy](./PRIVACY-POLICY.md) - Complete template
-  [Terms of Service](./TERMS-OF-SERVICE.md) - Complete template
- � [Legal Configuration](../src/constants/legal.ts) - Centralized config file

---

## ⚠️ Important: Before Production

**⚠️ WARNING: These are TEMPLATE documents. You MUST:**

1. **Consult with a lawyer** - Have an attorney review and customize these documents
2. **Update all placeholders** - Replace `[Company Name]`, `[Address]`, etc.
3. **Verify legal compliance** - Ensure compliance with your jurisdiction's laws
4. **Update regularly** - Review and update as your service evolves

**Failure to properly customize these documents may result in legal issues.**

---

## 1️⃣ Step 1: Update Legal Configuration

All company and legal information is centralized in one file for easy management.

### File: `src/constants/legal.ts`

Open this file and replace all placeholders marked with `[...]`:

### Company Information

````typescript
company: {
  name: 'Paperlyte',                    //  Already set
   legalName: '[Company Legal Name]',     // TODO: e.g., "Paperlyte Inc."
   email: 'hello@paperlyte.com',         // ✓ Update if needed
   supportEmail: 'support@paperlyte.com',// ✓ Update if needed
   privacyEmail: 'privacy@paperlyte.com',// ✓ Update if needed
   legalEmail: 'legal@paperlyte.com',    // ✓ Update if needed
   securityEmail: 'security@paperlyte.com', // ✓ Update if needed
   dpoEmail: 'dpo@paperlyte.com',        // ✓ Update if needed (GDPR)

- 📄 [Privacy Policy](./PRIVACY-POLICY.md) - Complete template
- 📄 [Terms of Service](./TERMS-OF-SERVICE.md) - Complete template
- 🛠️ [Legal Configuration](../src/constants/legal.ts) - Centralized config file

- [ ] Set `legalName` to your registered company name
- [ ] Verify all email addresses are active and monitored
- [ ] Set up email forwarding or aliases if needed

---

### Physical Address

```typescript
address: {
   street: '[Street Address]',  // TODO: e.g., "123 Main Street"
   city: '[City]',              // TODO: e.g., "San Francisco"
   state: '[State]',            // TODO: e.g., "CA"
   zip: '[ZIP]',                // TODO: e.g., "94102"
   country: '[Country]',        // TODO: e.g., "United States"
}
````

**Action Items:**

- [ ] Add your company's registered business address
- [ ] Ensure this matches your business registration

---

### Legal Document URLs

```typescript
documents: {
  privacy: 'https://github.com/shazzar00ni/paperlyte-v2/blob/main/docs/PRIVACY-POLICY.md',
  terms: 'https://github.com/shazzar00ni/paperlyte-v2/blob/main/docs/TERMS-OF-SERVICE.md',
   cookies: '#',      // TODO: Create cookie policy
   security: '#',     // TODO: Create security practices doc
   dmca: '#',         // TODO: Create DMCA policy (if applicable)
   accessibility: '#', // TODO: Create accessibility statement
}
```

**Action Items:**

- [ ] Update URLs to point to your hosted documents (not GitHub in production)
- [ ] Create additional policies as needed
- [ ] Consider hosting on your main domain (e.g., `https://paperlyte.com/legal/privacy`)

---

### Social Media & Contact

```typescript
social: {
  github: 'https://github.com/paperlyte/paperlyte',
  twitter: 'https://twitter.com/paperlyte',
  linkedin: 'https://linkedin.com/company/paperlyte',
   discord: '#', // TODO: Add if applicable
}
```

**Action Items:**

- [ ] Update with your actual social media profiles
- [ ] Remove platforms you don't use
- [ ] Add any additional platforms (Discord, Reddit, etc.)

---

### Legal Metadata

```typescript
metadata: {
   privacyLastUpdated: '2025-11-28',   // ✓ Set automatically
   termsLastUpdated: '2025-11-28',     // ✓ Set automatically
   termsVersion: '1.0',                // ✓ Update when you revise
   jurisdiction: '[State/Country]',    // TODO: e.g., "California, USA"
   governingLaw: '[State] law',        // TODO: e.g., "California law"
}
```

**Action Items:**

- [ ] Set jurisdiction to your company's location
- [ ] Confirm governing law with your attorney
- [ ] Update dates when you revise documents

---

## 2️⃣ Step 2: Customize Legal Documents

### Privacy Policy

File: `docs/PRIVACY-POLICY.md`

**Search and replace these placeholders:**

| Placeholder             | Replace With                 | Example                           |
| ----------------------- | ---------------------------- | --------------------------------- |
| `[Company Legal Name]`  | Your registered company name | "Paperlyte Inc."                  |
| `[Street Address]`      | Your business address        | "123 Main Street"                 |
| `[City, State, ZIP]`    | Your city, state, and ZIP    | "San Francisco, CA 94102"         |
| `[Country]`             | Your country                 | "United States"                   |
| `[Cloud provider name]` | Your hosting provider        | "AWS", "Google Cloud", etc.       |
| `[region]`              | Data center region           | "US East", "EU West", etc.        |
| `[primary region]`      | Your primary region          | "United States", "European Union" |

**Key sections to review:**

1. **Section 3: Data Storage & Security**

   - Update cloud provider details
   - Verify encryption standards
   - Confirm backup policies

2. **Section 4: Data Sharing**

   - List your actual service providers
   - Update the service provider table
   - Add or remove providers as needed

3. **Section 8: International Data Transfers**

   - Verify transfer mechanisms (SCCs, etc.)
   - Update if operating internationally

4. **Section 10: Contact Information**
   - Verify all contact information is correct
   - Add your DPO information (required for GDPR)

---

### Terms of Service

File: `docs/TERMS-OF-SERVICE.md`

**Search and replace these placeholders:**

| Placeholder            | Replace With                 | Example                   |
| ---------------------- | ---------------------------- | ------------------------- |
| `[State]`              | Your governing jurisdiction  | "California", "Delaware"  |
| `[State/Country]`      | Full jurisdiction            | "California, USA"         |
| `[Company Legal Name]` | Your registered company name | "Paperlyte Inc."          |
| `[Street Address]`     | Your business address        | "123 Main Street"         |
| `[City, State, ZIP]`   | Your city, state, and ZIP    | "San Francisco, CA 94102" |
| `[Country]`            | Your country                 | "United States"           |

**Key sections to review with your attorney:**

1. **Section 5: Payment & Subscriptions**

   - Verify pricing and refund policies match your business model
   - Update payment methods
   - Confirm tax handling

2. **Section 6: Service Availability**

   - Review SLA guarantees (99.9% uptime)
   - Update support response times
   - Adjust for your service tiers

3. **Section 9: Limitation of Liability**

   - **CRITICAL**: Have attorney review liability caps
   - Ensure compliance with local consumer protection laws

4. **Section 15: Dispute Resolution**

   - **CRITICAL**: Arbitration clauses vary by jurisdiction
   - Confirm class action waiver is enforceable in your region
   - Update arbitration provider (AAA vs. others)

5. **Section 16: Governing Law**
   - Set correct jurisdiction and governing law
   - Confirm with attorney

---

## 📋 Step 3: Verification Checklist

Step 3: Verification Checklist

Use this checklist to ensure everything is properly configured:

### Configuration File (`src/constants/legal.ts`)

- [ ] Company legal name updated
- [ ] All email addresses are valid and monitored
- [ ] Physical address is complete and accurate
- [ ] Document URLs point to production hosting
- [ ] Social media links are correct
- [ ] Jurisdiction and governing law are set
- [ ] No placeholders remain (check with `needsLegalReview()`)

### Privacy Policy (`docs/PRIVACY-POLICY.md`)

- [ ] Company name and address updated
- [ ] Cloud provider information is accurate
- [ ] Service provider table reflects actual providers
- [ ] Data retention policies match your practices
- [ ] Contact information is correct
- [ ] DPO information added (if EU users)
- [ ] Regional compliance sections reviewed (GDPR, CCPA, UK)

### Terms of Service (`docs/TERMS-OF-SERVICE.md`)

- [ ] Company name and address updated
- [ ] Governing law and jurisdiction set
- [ ] Pricing and refund policies accurate
- [ ] SLA guarantees match your capabilities
- [ ] Liability limitations reviewed by attorney
- [ ] Arbitration clause reviewed by attorney
- [ ] Service descriptions match what you offer

---

## ✅ Step 3: Verification Checklist

Use this checklist to ensure everything is properly configured:

### Configuration File (`src/constants/legal.ts`)

- [ ] Company legal name updated
- [ ] All email addresses are valid and monitored
- [ ] Physical address is complete and accurate
- [ ] Document URLs point to production hosting
- [ ] Social media links are correct
- [ ] Jurisdiction and governing law are set
- [ ] No placeholders remain (check with `needsLegalReview()`)

### Privacy Policy (`docs/PRIVACY-POLICY.md`)

- [ ] Company name and address updated
- [ ] Cloud provider information is accurate
- [ ] Service provider table reflects actual providers
- [ ] Data retention policies match your practices
- [ ] Contact information is correct
- [ ] DPO information added (if EU users)
- [ ] Regional compliance sections reviewed (GDPR, CCPA, UK)

### Terms of Service (`docs/TERMS-OF-SERVICE.md`)

- [ ] Company name and address updated
- [ ] Governing law and jurisdiction set
- [ ] Pricing and refund policies accurate
- [ ] SLA guarantees match your capabilities
- [ ] Liability limitations reviewed by attorney
- [ ] Arbitration clause reviewed by attorney
- [ ] Service descriptions match what you offer

---

## 🧪 Step 4: Testing

### Check for Placeholders

Run this in your browser console or add to your tests:

```typescript
import { needsLegalReview, getPlaceholderFields } from "@/constants/legal";

if (needsLegalReview()) {
  console.warn("Legal documents need review!");
  console.warn("Missing:", getPlaceholderFields());
}
```

### Verify Links

1. **Footer Links**: Check that Privacy Policy and Terms links work
2. **CTA Section**: Verify GitHub badge links correctly
3. **Social Media**: Test all social media links in footer

### Test in Production

Before launching:

- [ ] Legal document URLs are accessible
- [ ] Documents open in new tabs
- [ ] Mobile footer links work correctly
- [ ] Email addresses are clickable and correct

---

## 🔄 Step 5: Ongoing Maintenance

### When to Update

**Update your legal documents when:**

- You add new features or data collection
- You add/remove third-party services
- Privacy laws change (e.g., new state privacy laws)
- You expand to new jurisdictions
- Your business structure changes
- You receive legal advice to update

### How to Update

1. **Edit the documents** in `docs/`
2. **Update version numbers** in `src/constants/legal.ts`:
   ```typescript
   metadata: {
     privacyLastUpdated: '2025-12-15', // Update date
     termsVersion: '1.1',              // Increment version
   }
   ```
3. **Update version history** table in Terms of Service
4. **Notify users** (email, in-app notification)
5. **Archive old versions** for legal compliance

---

## 📧 Email Setup

### Required Email Addresses

Ensure these emails are set up and monitored:

| Email       | Purpose                        | Response Time               |
| ----------- | ------------------------------ | --------------------------- |
| `support@`  | General support                | 24-48 hours                 |
| `privacy@`  | Privacy requests (GDPR, CCPA)  | 30 days (legal requirement) |
| `legal@`    | Legal inquiries                | As needed                   |
| `security@` | Security vulnerability reports | 24 hours                    |
| `dpo@`      | Data Protection Officer (EU)   | 30 days (GDPR)              |

### Email Forwarding

If you don't want separate inboxes, set up forwarding:

- All → `hello@paperlyte.com` (with filters/labels)
- Or use email aliases in your email provider

---

## 📝 Legal Review Checklist

**Before production, have your attorney review:**

- [ ] **Privacy Policy** - Especially data handling practices
- [ ] **Terms of Service** - Especially liability and arbitration clauses
- [ ] **Cookie Policy** - If you use cookies
- [ ] **GDPR Compliance** - If you have EU users
- [ ] **CCPA Compliance** - If you have California users
- [ ] **Other Jurisdictions** - Based on your user base

**Attorney should verify:**

- [ ] Liability limitations are enforceable
- [ ] Arbitration clauses comply with local law
- [ ] Warranty disclaimers are adequate
- [ ] Intellectual property protections are strong
- [ ] Termination procedures are fair and legal
- [ ] Payment terms comply with consumer protection laws

---

## 🌍 International Considerations

International Considerations

### European Union (GDPR)

If you have EU users:

- [ ] Appoint a Data Protection Officer (DPO)
- [ ] Implement Standard Contractual Clauses (SCCs) for data transfers
- [ ] Provide data subject access request (DSAR) process
- [ ] Ensure lawful basis for processing (consent, contract, etc.)
- [ ] Implement "privacy by design"

### California (CCPA/CPRA)

If you have California users:

- [ ] Provide "Do Not Sell My Personal Information" link (if applicable)
- [ ] Honor opt-out requests within 15 days
- [ ] Provide data access and deletion rights
- [ ] Update privacy policy with CCPA-specific disclosures

### United Kingdom

Similar to GDPR:

- [ ] Comply with UK GDPR
- [ ] Register with ICO if required
- [ ] Appoint UK representative if not UK-based

---

## 📚 Additional Resources

## ❓ FAQ

## ❓ FAQ

### Do I really need a lawyer?

**Yes.** While these templates provide a good starting point, legal documents should be reviewed by an attorney licensed in your jurisdiction. Laws vary significantly by location and business type.

### Can I use these templates as-is?

**No.** These are templates with placeholders. You must:

1. Replace all placeholders
2. Customize for your specific business practices
3. Have an attorney review
4. Update regularly

### What if I'm just testing/developing?

For development and testing:

- Replace placeholders with dummy data
- Add a banner: "Development Version - Not for Production"
- Don't collect real user data without proper legal coverage

### How often should I review these documents?

**At least annually**, or whenever:

- You make significant service changes
- New privacy laws are enacted
- You expand to new regions
- Your attorney advises an update

### What about other policies?

You may also need:

- Cookie Policy (if using cookies)
- DMCA Policy (if users can upload content)
- Acceptable Use Policy (more detailed version)
- Security Practices document
- Accessibility Statement (ADA compliance)

Templates for these are noted as TODO in the legal config.

---

## 💬 Need Help?

If you have questions about this setup:

1. **Legal Questions**: Consult with an attorney
2. **Technical Questions**: Open an issue on GitHub
3. **Privacy Questions**: Contact privacy@paperlyte.com

---

**Remember: These documents protect both you and your users. Take the time to do them right!**

---

_Last Updated: November 28, 2025_
