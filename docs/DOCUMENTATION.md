# OPD Token Allocation Engine – Implementation & Future Scope

This document explains **what has been implemented** in the OPD Token Allocation Engine and **what can be extended or improved** in the future. It is written to clearly demonstrate backend thinking, design decisions, and awareness of real-world constraints.

---

## 1. What Has Been Implemented

### 1.1 Backend Architecture

The project is built using a layered backend architecture:

- **Routes** – Define API endpoints
- **Controllers** – Handle request/response logic
- **Services** – Contain core business logic (allocation engine)
- **Models** – Define MongoDB schemas using Mongoose
- **Middleware** – Centralized error handling

This separation ensures clean code, easy testing, and scalability.

---

### 1.2 Core Entities

#### Doctor

- Represents a medical practitioner
- Can have multiple OPD slots
- Created and managed via APIs

#### Slot

- Represents a fixed OPD time window
- Enforces a **hard capacity limit**
- Maintains two queues:
  - `activeTokens`
  - `waitingTokens`

#### Token

- Represents a patient’s appointment
- Contains:
  - Source (ONLINE, WALKIN, FOLLOWUP, PAID, EMERGENCY)
  - Priority
  - Status (ACTIVE, WAITING, CANCELLED, NO_SHOW, COMPLETED)

---

### 1.3 Priority-Based Token Allocation Engine

A core allocation service handles token assignment using the following rules:

- Slot capacity is strictly enforced
- Tokens are assigned priorities based on source
- If a slot is full:
  - Higher-priority tokens can preempt lower-priority tokens
  - Preempted tokens move to the waiting list

- Waiting list promotion follows:
  - Higher priority first
  - Earlier arrival in case of tie

This logic simulates real hospital OPD behavior.

---

### 1.4 Dynamic Reallocation Handling

The system dynamically adjusts token allocation when conditions change:

#### Cancellation Handling

- If an **ACTIVE** token is cancelled:
  - Slot capacity is freed
  - Highest-priority waiting token is promoted

- If a **WAITING** token is cancelled:
  - Token is simply removed
  - No promotion occurs

#### No-Show Handling

- Only ACTIVE tokens trigger promotion
- Prevents slot over-allocation
- Ensures correctness under edge cases

These checks were added after identifying and fixing promotion-related bugs during testing.

---

### 1.5 Inspection & Testing APIs

To enable full system testing without manual database access, several GET APIs were implemented:

- Fetch all doctors
- Fetch slots by doctor
- Fetch a single slot with active & waiting tokens
- Fetch all tokens system-wide

These APIs make the backend observable and easy to debug.

---

### 1.6 API Testing & Simulation

- All APIs are tested using **Postman**
- A Postman collection is included in the project
- Complete OPD-day scenarios were simulated, including:
  - Slot filling
  - Priority preemption
  - Emergency insertion
  - Cancellation
  - No-show handling

---

## 2. What Can Be Improved / Extended

### 2.1 Slot Uniqueness Enforcement

Currently, the system allows multiple slots for the same doctor in the same time window. In a production system:

- Only **one slot per doctor per time window** should be allowed
- This can be enforced via validation during slot creation

This was intentionally kept flexible during development to simplify testing.

---

### 2.2 Concurrency Control

In high-traffic environments:

- Simultaneous token requests may cause race conditions
- Redis-based locks or database transactions can be introduced

---

### 2.3 Metrics & Analytics

Additional metrics can be tracked:

- Average waiting time per slot
- Slot utilization percentage
- Number of preemptions per day

These metrics can help hospital administrators optimize OPD scheduling.

---

### 2.4 Automated No-Show Detection

Currently, no-show marking is manual.

Improvements:

- Cron jobs to detect no-shows after a configurable time window
- Automatic status updates

---

### 2.5 Role-Based Access & Security

Future enhancements may include:

- Authentication (JWT)
- Role-based access (Admin, OPD Desk, Doctor)
- API rate limiting

---

### 2.6 Frontend Dashboard

A lightweight frontend can be added to:

- Visualize slot occupancy
- Monitor waiting lists
- Insert emergency tokens

---

### 2.7 Intelligent Follow-Up & Alternative Slot Recommendation

The system can be extended to improve patient experience through smarter scheduling:

- If a patient fails to get a token in a preferred slot, the system can **recommend alternative available slots** for the same or another day.
- Patients who have previously visited (follow-up patients) can be automatically tagged as **FOLLOWUP** for their next visit.
- FOLLOWUP patients can be given **higher priority** compared to new ONLINE or WALK-IN patients.
- Historical visit data can be used to:
  - Identify repeat patients
  - Automatically assign follow-up priority
  - Reduce waiting time for returning patients

This enhancement would make the system more patient-centric while still preserving fairness and slot capacity constraints.

---

## 3. Summary

This project goes beyond basic CRUD operations and focuses on:

- Real-world prioritization
- Dynamic reallocation logic
- Correct handling of edge cases
- Clean backend architecture

It demonstrates strong backend engineering fundamentals suitable for a **Backend Intern** role and provides a solid foundation for future enhancements.
