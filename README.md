## Returns Dashboard

A full-stack returns management dashboard for Amazon India sellers to review and manage customer return requests, with automatic approval after 48 hours and complete decision visibility for Customer Support.

⸻

📌 Problem Statement

Amazon India wants a returns dashboard where sellers can approve or reject return requests with reasons.

If a seller does not respond within 48 hours, the return should be automatically approved.

All return decisions must be logged and visible to Customer Support.

⸻

🎯 Project Objective

The objective of this project is to build a reliable returns management system that allows sellers to efficiently handle customer return requests while ensuring that delayed requests are automatically approved and every decision remains traceable.

The system will provide:

* A dashboard for sellers to manage return requests.
* Approval and rejection functionality.
* Reasons for return decisions.
* Automatic approval after 48 hours without seller action.
* Decision and audit history.
* Customer Support visibility into return decisions.

⸻

## 📅 Sprint 1 — Day 1 Progress

The team completed the initial project setup and problem understanding activities.

### Completed

- Repository created under KalviumCommunity.
- Main branch protection configured.
- Kanban project board created with `TODO`, `IN PROGRESS`, and `DONE` columns.
- Day 1 standup completed.
- Problem statement analyzed.
- Users and user roles identified.

### Current Focus

The team is currently working on:

- Finalizing the return request workflow.
- Identifying open questions and business rules.
- Finalizing the Team Charter.
- Preparing the project documentation for the PRD phase.


👥 Users and Roles

Seller

The Seller is responsible for reviewing and deciding on customer return requests.

The Seller should be able to:

* View return requests.
* View return request details.
* Approve a return request.
* Reject a return request with a reason.
* View the current status of return requests.

Customer Support

Customer Support needs visibility into return decisions and their history.

Customer Support should be able to:

* View return requests.
* View the current return status.
* View decision history.
* See when a decision was made.
* See who made the decision.
* Identify whether a decision was made by a Seller or automatically by the System.

System

The System performs automated actions required by the business rules.

The System should:

* Track the 48-hour response window.
* Detect pending requests that exceed the 48-hour deadline.
* Automatically approve eligible requests.
* Record automatic approvals in the decision history.

⸻

🔄 Return Request Workflow

## Normal Seller Decision

Customer requests return
          ↓
Return request created
          ↓
Status = PENDING
          ↓
Seller reviews request
          ↓
     ┌────┴─────┐
     ↓          ↓
  APPROVE     REJECT
                ↓
        Reason provided
     └────┬─────┘
          ↓
    Decision recorded
          ↓
 Customer Support can
    view the history

## 48-Hour Auto-Approval

Return request created
          ↓
Status = PENDING
          ↓
Seller takes no action
          ↓
48-hour deadline reached
          ↓
System automatically approves
          ↓
Decision recorded
          ↓
Customer Support can
    view the history

⸻

📊 Return Statuses

The initial return lifecycle contains the following statuses:

Status	    Description
PENDING	    Return request is waiting for a Seller decision
APPROVED	Return request has been approved
REJECTED	Return request has been rejected

An approved request should also indicate whether the approval was made by:

* SELLER
* SYSTEM / AUTO_APPROVED

This distinction is important for auditability.

⸻

📝 Decision and Audit Logging

Every important decision related to a return should be recorded.

An audit record should allow Customer Support to understand:

* Which return was affected.
* What decision was made.
* Who or what made the decision.
* When the decision was made.
* The reason for the decision where applicable.

Example: Seller Decision

Return ID: RET-1001
Action: APPROVED
Decision Type: SELLER
Performed By: seller_123
Timestamp: 2026-08-14 14:30

Example: Automatic Decision

Return ID: RET-1002
Action: APPROVED
Decision Type: AUTO_APPROVED
Performed By: SYSTEM
Timestamp: 2026-08-16 10:00
Reason: Seller did not respond within 48 hours

⸻

⭐ Core Features

Seller Dashboard

* View pending return requests.
* View return details.
* Approve return requests.
* Reject return requests with a reason.
* View return status.
* View previously processed requests.

48-Hour Auto-Approval

* Record the return request creation time.
* Calculate or track the 48-hour response deadline.
* Detect requests that remain pending beyond the deadline.
* Automatically approve eligible requests.
* Record the automatic decision.

Customer Support Dashboard

* View return requests.
* View return status.
* View decision history.
* View decision timestamps.
* View the decision maker.
* Distinguish manual seller decisions from automatic decisions.

Audit Logging

* Record return creation.
* Record approvals.
* Record rejections.
* Record automatic approvals.
* Store decision timestamps.
* Store decision reasons where applicable.

⸻

🔐 Role-Based Access

The application will use role-based access control.

Role	  Access
SELLER	  Manage return requests
SUPPORT	  View return requests and decision history

Final permissions will be confirmed during the PRD and System Design phases.

⸻

🏗️ Proposed Architecture

The application will follow the Sprint 1 full-stack architecture:

                    Browser
                       │
                       ▼
                  Next.js App
                       │
                       ▼
                Next.js API Routes
                       │
                       ▼
                    Prisma
                       │
                       ▼
                  PostgreSQL
                       │
                       ▼
              Application Data

The application will eventually be deployed using the required Sprint 1 cloud and CI/CD stack.

⸻

🛠️ Technology Stack

Technology	    Purpose
Next.js	        Full-stack web application framework
TypeScript	    Type-safe development
Prisma	        ORM and database access
PostgreSQL	    Relational database
GitHub	        Version control and collaboration
GitHub Actions	CI/CD automation
Docker	        Containerization
Google Cloud Platform (GCP)	Cloud deployment

⸻

📦 Project Scope

In Scope

* Seller return management.
* Return request approval.
* Return request rejection.
* Rejection/decision reasons.
* 48-hour automatic approval.
* Decision history.
* Audit logging.
* Customer Support visibility.
* Authentication.
* Role-based access.
* Database persistence.
* Testing.
* Deployment.

Out of Scope for Initial MVP

* Payment/refund processing.
* Delivery tracking.
* Product catalogue management.
* Customer shopping experience.
* Amazon production API integration.
* Advanced analytics.
* AI-based return decisions.

⸻

❓ Open Questions

The following requirements need to be clarified before finalizing the PRD and System Design:

1. Is a reason mandatory only for rejection, or also for approval?
2. Should Customer Support have read-only access or permission to modify decisions?
3. What should happen if a Seller attempts to act after the 48-hour deadline?
4. How should the system handle a Seller decision occurring at the exact time the 48-hour deadline is reached?
5. What exact information should Customer Support see in the decision history?
6. Should every state change be stored in an immutable audit history?
7. Should Sellers receive notifications when new return requests are created?
8. When exactly does the 48-hour timer begin?

These questions will be resolved during requirement analysis and mentor discussions.

⸻

📈 Development Status

### Day 1 — Setup & Understanding

- [x] Repository created
- [x] Team members added
- [x] Main branch protected
- [x] Kanban board created
- [x] Day 1 standup completed
- [x] Problem statement analyzed
- [x] Users and roles identified
- [ ] Return request workflow finalized
- [ ] Open questions finalized
- [ ] Team Charter completed

Phase 2 — Product Planning

* User stories
* Functional requirements
* Non-functional requirements
* Product Requirements Document (PRD)
* PRD mentor approval

Phase 3 — System Design

* Database schema
* API design
* Authentication design
* RBAC design
* 48-hour auto-approval design
* Audit logging design
* System Design mentor approval

Phase 4 — Implementation

* Authentication
* Seller dashboard
* Return request management
* Approve return
* Reject return with reason
* 48-hour auto-approval
* Audit logging
* Customer Support dashboard
* Testing

Phase 5 — Deployment

* Docker configuration
* GitHub Actions
* GCP deployment
* Production testing
* Final documentation
* Final demonstration

⸻

👨‍💻 Team

Member	    Initial Responsibility
Nilesh	    Project administration, GitHub and team coordination
Irtaza	    Product analysis and frontend planning
Harshavardhan	Technical investigation and backend planning

Team responsibilities may evolve as the project progresses.

⸻

📚 Documentation

Detailed project documentation will be added as Sprint 1 progresses.

Planned documentation:

docs/
├── PRD.md
├── SYSTEM_DESIGN.md
├── API.md
└── DATABASE.md

⸻

🚀 Development Workflow

The team will follow a feature-branch and Pull Request workflow.

main
  │
  ├── feature/...
  │
  ├── fix/...
  │
  └── docs/...
          ↓
       Pull Request
          ↓
        Review
          ↓
         Merge
          ↓
         main

Direct pushes to the protected main branch are not part of the normal development workflow.

⸻

📄 Project Information

Project: Returns Dashboard
Program: Kalvium — Simulated Work
Sprint: Sprint 1
Track: Full Stack
Repository: SW2627-Next-JS-Returns-Dashboard