# Paperlyte AI Policy

**Version:** 1.1
**Last Updated:** 2026-05-13
**Status:** Draft — pending policy approval (see Policy Approval section)

---

## Version History

| Version | Date       | Author(s)        | Summary of Changes                                                                 |
|---------|------------|------------------|------------------------------------------------------------------------------------|
| 1.0     | 2026-05-13 | Paperlyte Team   | Initial draft. Sent to relevant stakeholders for review before wider release.      |
| 1.1     | 2026-05-13 | Paperlyte Team   | Added definitions for "Substantially AI-Generated"; clarified LLM examples as illustrative; added work account provisioning (3.9.1); added third-party approval timelines and appeal process; clarified Tier 1 AI developer tool requirements; made training section concrete; added graduated enforcement framework; minor style fixes. |

---

## Policy Approval

| Name                   | Role                  | Date       | Signature |
|------------------------|-----------------------|------------|-----------|
| _[Insert Name]_        | Chief Technology Officer | _[Date]_ |           |
| _[Insert Name]_        | Head of Operations    | _[Date]_   |           |
| _[Insert Name]_        | Legal Counsel         | _[Date]_   |           |

---

## AI Officer Foreword

At Paperlyte, our core promise is simple: **your thoughts, unchained.** We built a product that gets out of your way — and we hold ourselves to that same standard when it comes to AI.

AI tools can meaningfully accelerate how we work: helping our team write clearer documentation, analyse market trends, improve code quality, and respond faster to our users. But AI also introduces real risks — to data privacy, to intellectual property, to the quality of our output, and to the trust our users place in us.

Paperlyte is a privacy-first product. Our users choose us precisely because we respect their data. That obligation doesn't stop at our product — it extends to every tool and workflow we adopt internally. When we use AI, we must hold it to the same standard we hold ourselves.

This policy is not about limiting your creativity or slowing you down. It's about making sure that as we move fast, we move responsibly. If you discover an AI tool that would genuinely help the team, we want to hear about it — submit a Third-Party AI Approval request and let's evaluate it together.

Questions or concerns? Reach out to the AI Officer at **ai-policy@paperlyte.com**.

---

## Table of Contents

1. [Purpose](#1-purpose)
2. [Scope](#2-scope)
3. [Policy](#3-policy)
4. [Implementation and Monitoring](#4-implementation-and-monitoring)
5. [Enforcement](#5-enforcement)
6. [Policy Review](#6-policy-review)
7. [Effective Date](#7-effective-date)
- [Appendix A — Applicable Laws and Regulations](#appendix-a--applicable-laws-and-regulations)
- [Appendix B — Transparency Disclosure Scenarios](#appendix-b--transparency-disclosure-scenarios)
- [Appendix C — Approved AI Tools](#appendix-c--approved-ai-tools)

---

## 1. Purpose

This AI Policy establishes guidelines and best practices for the responsible and ethical use of Artificial Intelligence (AI) within Paperlyte. It ensures that all personnel use AI systems in a manner that:

- Aligns with Paperlyte's core values of privacy, simplicity, and user trust
- Adheres to applicable legal and regulatory standards
- Protects the confidentiality of our intellectual property, user data, and partner information
- Promotes the safety and well-being of our users, team, and broader stakeholders

Paperlyte's product is **private by design** and **local-first**. This policy ensures our internal practices reflect the same principles we build into our software.

---

## 2. Scope

### 2.1 Applicability

This Policy applies to all employees, officers, directors, contractors, consultants, temporary staff, interns, volunteers, and any other personnel ("Personnel") affiliated with Paperlyte, including any subsidiaries, affiliates, and joint ventures.

### 2.2 AI Systems Covered

This Policy governs the use, development, procurement, and management of all Artificial Intelligence ("AI") systems at Paperlyte, including but not limited to:

- **Large Language Models (LLMs):** AI models that understand and generate human-like text — e.g. GPT-4, Claude (Anthropic), Gemini, among others — used for writing assistance, code generation, summarisation, or analysis.
- **Machine Learning Models:** Algorithms that enable computers to perform tasks without explicit instructions, relying on patterns and inference — including any models used in product features or internal data analysis.
- **AI-Powered Developer Tools:** Code completion and review tools such as GitHub Copilot, Cursor, or similar IDEs and editor plugins. When used with Tier 1 data (see Section 3.10), only enterprise or self-hosted instances with contractually guaranteed no-training configurations are acceptable — see Appendix C for approved configurations and required contractual proof.
- **AI Plugins and Extensions:** Software extensions incorporating AI capabilities within productivity tools (e.g. Notion AI, Grammarly, Google Workspace AI features).
- **Autonomous Systems:** AI-driven systems capable of performing tasks without direct human oversight.
- **Third-Party AI Services:** Any AI technology or platform provided by an external vendor or service provider.

### 2.3 Definitions

| Term | Definition |
|------|-----------|
| **Artificial Intelligence (AI)** | A branch of computer science enabling machines to perform tasks that normally require human intelligence, such as language understanding, code generation, image recognition, and decision-making. |
| **Personnel** | Any individual employed by, under contract with, or otherwise representing Paperlyte in any capacity. |
| **Confidential Information** | Any non-public information pertaining to Paperlyte's business operations, strategies, users, source code, architecture, financials, or any other sensitive data — including information covered by an NDA. |
| **PII (Personally Identifiable Information)** | Any data that could directly or indirectly identify a specific individual, including names, email addresses, device identifiers, and usage patterns. |
| **AI Officer** | The designated person responsible for overseeing AI policy implementation and compliance at Paperlyte. |
| **Substantially AI-Generated** | Content where AI tools produced more than 50% of the final output by volume, or where AI determined the core structure, argument, or message — even if the result was subsequently edited by a human. When uncertain, Personnel should apply this definition conservatively or escalate to their manager. |

---

## 3. Policy

### 3.1 Responsible AI Use

All Personnel must use AI systems responsibly and ethically. This means:

- Using AI to augment your work, not to bypass quality standards or accountability
- Never using AI to generate content designed to deceive, harm, or manipulate others
- Not using AI to automate decisions that could materially affect individuals without appropriate human oversight
- Reviewing and taking responsibility for any AI-generated output before it is used, shared, or published

Refer to Paperlyte's Code of Conduct for definitions of prohibited conduct and malicious activity.

### 3.2 Compliance with Laws and Regulations

Personnel must comply with all applicable laws and regulations when using AI systems. This includes:

- Adhering to data protection and privacy legislation (see [Appendix A](#appendix-a--applicable-laws-and-regulations))
- Ensuring transparency in AI-assisted decisions where legally required
- Maintaining rigorous security protocols to prevent unauthorised access or misuse of AI systems
- Reporting any suspected non-compliant AI activity to the AI Officer

### 3.3 Transparency and Accountability

Personnel must be transparent about AI's role in their work. Specifically:

**Disclose AI use to stakeholders when:**
- Communicating with users, customers, or partners where AI materially shaped the content
- AI was used in any hiring, performance, or evaluation process
- AI-generated analysis or predictions inform a significant business or product decision
- Content is published externally (blog posts, press releases, documentation) and was substantially AI-generated
- AI-generated images or media are used in marketing or product materials

See [Appendix B](#appendix-b--transparency-disclosure-scenarios) for detailed examples.

Personnel are responsible for outcomes generated by AI systems and must be prepared to explain and justify the use of AI outputs if challenged. Any concerns about AI system usage or outputs must be raised immediately with your direct manager or the AI Officer.

### 3.4 Data Privacy and Security

Paperlyte's users trust us with their notes and personal information. This trust is our most valuable asset. When using AI:

- **Never input user data, user notes, or any PII into any AI system** — whether approved or unapproved — without explicit consent and appropriate data processing agreements
- Personal or sensitive data used for internal analysis must be fully anonymised before being passed to any AI tool
- AI must not be used to re-identify anonymised data
- All AI tool access must use work accounts managed by Paperlyte; personal accounts must not be used for work-related AI tasks (see Section 3.9.1 for provisioning)
- Adhere to Paperlyte's Data Handling Policy and Privacy Policy at all times

> **Important:** Our product's privacy guarantees (local-first architecture, end-to-end encrypted sync) mean users share sensitive personal information with us under specific expectations. Using that data with external AI services — even inadvertently — would constitute a serious breach of trust and potentially violate our terms of service and applicable law.

### 3.5 Intellectual Property Protection

Paperlyte's source code, product architecture, technical roadmap, and business strategy are core competitive assets. When using AI:

- Do not input proprietary source code into public or unapproved AI systems
- Do not share product roadmap details, unreleased feature designs, or competitive strategy with AI tools unless those tools are Tier 1 approved (see [Appendix C](#appendix-c--approved-ai-tools))
- Be aware that some AI tools use submitted content to train future models — check and configure data retention and training settings before use
- AI-generated code must be reviewed for licence compatibility before inclusion in Paperlyte's codebase; some AI tools may produce output derived from GPL-licensed training data

### 3.6 Bias and Fairness

Personnel must actively work to identify and mitigate biases in AI outputs. This includes:

- **Fairness:** Ensuring AI outputs treat all individuals equally without favouring or disadvantaging any group
- **Inclusivity:** Considering the diverse needs of all users when selecting or deploying AI
- **Non-Discrimination:** Ensuring AI is not used to make decisions — directly or indirectly — based on protected characteristics such as age, gender, race, disability, religion, or sexual orientation
- **Regular Review:** Continuously assessing AI systems used in product features or internal processes, and reporting bias concerns promptly to the AI Officer

Observed biases or unfair AI outputs should be reported to **ai-policy@paperlyte.com**.

### 3.7 Human Oversight

AI systems augment human decision-making; they do not replace it. Personnel must:

- Always apply their own judgement when interpreting and acting on AI-generated recommendations
- Review and edit all AI-generated written content, code, or analysis before it is used externally or in production
- Never deploy AI-generated code to production without a human code review
- Remain accountable for any final decision or output, regardless of AI involvement

### 3.8 Training and Education

Personnel who use AI systems must complete the following training before using those tools for work-related tasks:

- **Required course:** "Responsible AI Use at Paperlyte" — available on the company Learning Management System (LMS) at _[Intranet > Learning > AI Training]_. Estimated duration: 45 minutes. Completion is tracked automatically by the LMS.
- **Registration:** Self-enrol via the LMS. If you encounter access issues, contact _[Insert LMS admin contact / IT helpdesk]_.
- **Manager sign-off:** Managers must confirm completion in the LMS before granting access to Tier 1 or Tier 2 approved tools.

Paperlyte will additionally:

- Share updates on significant changes to AI technology, tool capabilities, or regulatory requirements
- Offer refresher sessions at least annually or when major policy changes occur

### 3.9 Third-Party AI Services

Before using any new third-party AI service for work-related tasks:

1. Complete the **Third-Party AI Service Approval Form** (available at _[Intranet > Policies > AI Tool Requests]_)
2. Submit the form to the AI Officer at ai-policy@paperlyte.com for evaluation
3. Await written approval before use — do not proceed with an unapproved tool even for a trial or one-off task
4. **Standard review timeline:** 5 business days. Urgent requests (submitted with a business justification) will be reviewed within 2 business days.
5. **If denied:** You may appeal to the AI Governance Group with additional justification by emailing ai-policy@paperlyte.com with the subject line "AI Tool Appeal — [Tool Name]".

When evaluating third-party AI services, Paperlyte will assess:

- Data retention and training policies
- Security certifications and compliance (SOC 2, ISO 27001, GDPR DPA availability)
- Alignment with Paperlyte's privacy-first values
- Contractual safeguards for confidential information

### 3.9.1 Work Account Provisioning for AI Tools

All approved AI tools must be accessed via work accounts managed by Paperlyte. Personal accounts must not be used for work-related AI tasks.

**To request a work account:**

1. Confirm the tool is approved in Appendix C before requesting access
2. Submit an account request via _[Intranet > IT > Software Access Requests]_ or by emailing _[IT helpdesk contact]_
3. Provide: your name, team, manager, the tool name, and intended use tier (Tier 1/2/3)
4. **Provisioning SLA:** 3 business days for standard requests; urgent requests (with manager approval) within 1 business day
5. Access will be disabled automatically when you leave the company or when the tool is no longer approved

**Exceptions — tools without organisational account support:**

If a Tier 3-approved tool does not support org accounts, contact the AI Officer to request a temporary exception. Exceptions must be re-approved every 90 days, and use is restricted to non-sensitive data only. No exceptions are permitted for Tier 1 or Tier 2 data.

### 3.10 Tiered Data Classification

All AI use is governed by the following data tiers. When in doubt, apply the higher-sensitivity tier.

| Tier | Description | Requirements |
|------|-------------|--------------|
| **Tier 1** | **Highly sensitive.** Includes: Paperlyte source code and architecture, unreleased product features, user PII or user-generated content, NDA-covered partner/customer information, employee private or confidential information, security credentials. | 1. Data must not be used to train any external AI model. AI-powered developer tools (e.g. GitHub Copilot, Cursor) may only be used with Tier 1 data if operating under an enterprise or self-hosted instance with a contractually guaranteed no-training configuration — see Appendix C for approved configurations and required contractual proof. 2. Data must not be retained by third-party vendors without explicit written consent from Paperlyte. 3. Data must be handled under Paperlyte's confidentiality agreements. 4. Only Tier 1-approved tools may be used. All lower-tier requirements also apply. |
| **Tier 2** | **Moderately sensitive.** Includes: Paperlyte product terminology, internal project names, non-public company communications, customer or partner names covered by NDA. | 1. Specific names, identifiers, and proprietary terminology must be anonymised or removed before input to any AI tool. 2. Such data must not be retained by third-party providers without prior consent. All lower-tier requirements also apply. |
| **Tier 3** | **Non-sensitive.** Includes: publicly available information, generic writing and editing tasks, research on publicly known topics, internal brainstorming involving no confidential data. | 1. AI tools must be approved through the Paperlyte tool adoption process before use. 2. Work and personal AI accounts must remain strictly separate. Work access is managed by Paperlyte and must be disabled when no longer needed. |

---

## 4. Implementation and Monitoring

### 4.1 AI Governance

An AI Governance Group, composed of representatives from Engineering, Product, Legal/Compliance, and Operations, is responsible for:

- Reviewing and approving new AI tools
- Monitoring adherence to this policy
- Advising on emerging AI risks and regulatory developments
- Seeking input from affected communities and stakeholders on significant AI use cases

### 4.2 AI Officer

The AI Officer (_[Insert Name]_) oversees implementation of this policy, provides guidance to Personnel, handles escalations, and ensures compliance with applicable laws and regulations. Contact: **ai-policy@paperlyte.com**

### 4.3 Periodic Reviews

The AI Officer and Governance Group will conduct quarterly reviews of AI system usage across the company to:

- Ensure adherence to this policy
- Evaluate newly approved and unapproved tools in use
- Identify emerging risks or compliance gaps
- Recommend policy updates

### 4.4 Incident Reporting

Personnel must report any of the following as soon as possible:

- Suspected violations of this policy
- Accidental exposure of confidential or personal data to an AI system
- Observed bias, unfair treatment, or harmful AI outputs
- Use of unapproved AI tools by any team member

**Reporting channels:**

- **Email:** ai-policy@paperlyte.com
- **Anonymous Reporting Form:** _[Intranet > Compliance > Anonymous Reporting]_ or contact the AI Officer at ai-policy@paperlyte.com
- **Direct escalation:** Your manager or the AI Officer

Reports will be treated confidentially and investigated promptly.

---

## 5. Enforcement

Violations of this policy are assessed according to severity. Severity determinations follow Paperlyte's investigatory procedures and applicable employment law.

| Tier | Examples | Consequence |
|------|---------|-------------|
| **Minor** | Inadvertent use of an unapproved tool for non-sensitive tasks; first-time policy deviation with no data exposure | Coaching conversation; mandatory remedial training; documented warning |
| **Moderate** | Repeated policy violations; using an unapproved tool with Tier 2 data; failure to disclose AI use where required; sharing Paperlyte-specific terminology with unapproved systems | Formal written warning; suspension of AI tool access; escalation to HR |
| **Severe** | Intentional or negligent exposure of user PII, Paperlyte source code, or Tier 1 data to an unauthorised AI system; using AI to circumvent security or access controls; deliberate misrepresentation of AI use | Termination of employment or contract; legal action; mandatory regulatory disclosure under applicable data protection law |

All violations will be investigated before consequences are applied. Personnel are encouraged to self-report inadvertent breaches promptly — self-reporting is a mitigating factor in severity determinations.

---

## 6. Policy Review

This policy will be reviewed at least annually, or sooner if:

- Significant AI technology developments occur that affect risk or usage patterns
- Applicable laws or regulations change
- A material incident highlights a gap in this policy

Changes will be communicated to all Personnel via email and updated on the company intranet. Personnel will be asked to acknowledge acceptance of updated versions.

---

## 7. Effective Date

This policy is effective as of **2026-05-13**.

---

## Appendix A — Applicable Laws and Regulations

The following laws and regulations are relevant to Paperlyte's AI usage. This list is not exhaustive — consult Legal for jurisdiction-specific guidance.

**Privacy and Data Protection:**

- **GDPR (EU) 2016/679:** Governs the collection, processing, and storage of personal data for EU/EEA users. Applies to Paperlyte's international user base.
- **UK GDPR / Data Protection Act 2018:** UK equivalent of GDPR following Brexit.
- **CCPA / CPRA (California, USA):** Provides California residents rights over their personal data.
- **Privacy Act 2020 (NZ):** Governs collection, use, and disclosure of personal information including that processed by AI systems.

**Intellectual Property:**

- **Copyright Act 1994 (NZ) / Copyright, Designs and Patents Act 1988 (UK) / US Copyright Act:** Covers intellectual property rights related to AI-generated content and the use of copyrighted material in AI training data.

**Non-Discrimination:**

- **Human Rights Act 1993 (NZ) / Equality Act 2010 (UK) / US Civil Rights Laws:** Ensure AI systems do not discriminate on protected grounds including race, gender, age, disability, and religion.

**Consumer Protection:**

- **Consumer Guarantees Act 1993 (NZ) / Consumer Rights Act 2015 (UK):** May apply to AI-powered product features offered to consumers.

**Security and Cybercrime:**

- **Computer Fraud and Abuse Act (USA) / Crimes Act 1961 (NZ):** Contains provisions relevant to unauthorised AI system access or data modification.

**Employment:**

- **Employment Relations Act 2000 (NZ) / relevant employment legislation in applicable jurisdictions:** Relevant where AI is used in employment decisions or workplace monitoring.

**Emerging AI-Specific Regulation:**

- **EU AI Act (2024):** Introduces risk-based requirements for AI systems deployed in the EU — including prohibitions on certain AI use cases and transparency obligations.

---

## Appendix B — Transparency Disclosure Scenarios

The following scenarios illustrate when Personnel are expected to disclose AI use to stakeholders:

**External Communications:**
- Informing a user or customer that an AI system was used to draft a response or analyse their query
- Disclosing that a blog post, announcement, or documentation article was substantially AI-generated

**Hiring and HR:**
- Telling job applicants that an AI tool was used in any part of the screening, assessment, or shortlisting process
- Notifying affected employees if AI tools are used in performance evaluation or workplace monitoring

**Product and Analytics:**
- Explaining to a business partner that AI was used in data analysis covered by a collaboration agreement
- Alerting stakeholders that AI-generated predictions or recommendations carry inherent uncertainty or model limitations

**Creative and Marketing:**
- Clarifying that imagery used in marketing materials was generated by an AI tool (e.g. Midjourney, DALL-E)
- Disclosing AI-generated video or audio content used in promotional materials

**Legal and Contractual:**
- Disclosing AI involvement wherever required by contract, NDA, or applicable regulation
- Notifying partners or clients when AI was used to process data covered by a data processing agreement

**Risk and Financial:**
- Alerting stakeholders to the risk of bias or error when AI-driven analysis informs a significant business or financial decision

---

## Appendix C — Approved AI Tools

The following tools are approved for use at Paperlyte, subject to the data tier requirements in Section 3.10. Tools not listed here are **not approved** — submit a Third-Party AI Service Approval Form before use.

**Tier 1 — Approved for Highly Sensitive Data**

| Tool | Context | Date Approved |
|------|---------|---------------|
| _[Insert Tool]_ | _[Insert Context]_ | _[Date]_ |

**Tier 2 — Approved for Moderately Sensitive Data (with anonymisation)**

| Tool | Context | Date Approved |
|------|---------|---------------|
| _[Insert Tool]_ | _[Insert Context]_ | _[Date]_ |

**Tier 3 — Approved for Non-Sensitive Data**

| Tool | Context | Date Approved |
|------|---------|---------------|
| _[Insert Tool]_ | _[Insert Context]_ | _[Date]_ |

> Note: This table is maintained by the AI Officer and updated as tools are approved or revoked. Always check the latest version at _[Intranet > Policies > AI Tools Approved List]_ before using a new tool. For access issues, contact the AI Officer at ai-policy@paperlyte.com or the IT helpdesk at _[Insert IT helpdesk contact]_.

---

*Questions about this policy? Contact the AI Officer at ai-policy@paperlyte.com*
