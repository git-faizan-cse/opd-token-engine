# OPD Token Allocation Engine

Backend Intern Assignment – OPD Token Allocation System  
**Tech Stack:** Node.js, Express, MongoDB (Mongoose)

---

## 1. Overview

This project implements a backend **OPD Token Allocation Engine** for hospitals.  
The system manages doctor time slots, allocates patient tokens from multiple sources, and dynamically reallocates tokens when real-world events such as cancellations, no-shows, or emergencies occur.

The focus of this project is **backend design, business logic, and real-world reasoning**, not just CRUD APIs.

---

## 2. Core Concepts

### 2.1 Doctor

- Represents a medical practitioner
- Doctors operate in fixed OPD time slots

### 2.2 Slot

- A fixed time window (e.g., 09:00–10:00)
- Each slot has a **hard capacity limit**
- Tokens are allocated within slots

### 2.3 Token

- Represents a patient’s position in a slot
- Each token has a **priority**, **source**, and **status**

---

## 3. Token Sources & Prioritization Logic

Priority is enforced using a numeric scale  
(**lower number = higher priority**):

| Source    | Priority |
| --------- | -------- |
| EMERGENCY | 1        |
| PAID      | 2        |
| FOLLOWUP  | 3        |
| ONLINE    | 4        |
| WALKIN    | 5        |

### Rules

- A slot **never exceeds its capacity**
- Higher-priority tokens can **preempt** lower-priority ones
- Preempted tokens are moved to the **waiting list**
- Waiting list promotion respects **priority first, then arrival time**

---

## 4. Token Lifecycle

1. Token created (initially `WAITING`)
2. Allocation attempt
3. Token becomes:
   - `ACTIVE` → allocated in slot
   - `WAITING` → slot full
4. Token may later become:
   - `CANCELLED`
   - `NO_SHOW`
   - `COMPLETED`

On cancellation or no-show:

- Slot capacity is freed
- Highest-priority waiting token is automatically promoted

---

## 5. API Design Summary

### Doctor APIs

- `POST /api/doctors` → Create doctor
- `GET /api/doctors` → Get all doctors

### Slot APIs

- `POST /api/slots` → Create slot for a doctor
- `GET /api/slots/doctor/:doctorId` → Get all slots for a doctor
- `GET /api/slots/:slotId` → Get slot details (active & waiting tokens)

### Token APIs

- `POST /api/tokens` → Create and allocate token
- `POST /api/tokens/:tokenId/cancel` → Cancel token
- `POST /api/tokens/:tokenId/no-show` → Mark token as no-show
- `GET /api/tokens` → Get all tokens (system-wide inspection)

---

## 6. Edge Cases Handled

- Slot full with lower-priority tokens
- Emergency insertion
- Multiple waiting tokens
- Cancellation of ACTIVE vs WAITING tokens
- No-show handling without over-allocation
- Duplicate cancellation prevention
- Invalid slot / doctor / token IDs

---

## 7. Failure Handling & Trade-offs

### Failure Handling

- MongoDB connection failure → application exits (fail fast)
- Invalid requests → proper 4xx responses
- Centralized error-handling middleware

### Trade-offs

- Strict priority may reduce fairness for walk-in patients
- Only one token preempted per insertion (simplicity)
- Slot uniqueness per time window not enforced yet (can be added)
- No distributed locking (can be extended using Redis)

---

## 8. One-Day OPD Simulation (3 Doctors)

### Doctors

- Dr A – General Medicine
- Dr B – Orthopedics
- Dr C – Pediatrics

Each doctor has a slot from **09:00–10:00** with capacity **2**.

### Timeline Simulation

**09:00**

- ONLINE tokens added
- Slots fill up

**09:10**

- Additional ONLINE tokens → WAITLISTED

**09:15**

- PAID token added → preempts ONLINE token

**09:25**

- EMERGENCY token added → preempts lowest priority

**09:40**

- ACTIVE token cancelled
- Highest-priority waiting token promoted

**09:50**

- Patient marked as no-show
- Waiting token promoted automatically

---

## 9. Why This Design Works

- Clean separation of concerns (routes, controllers, services)
- Business logic isolated in service layer
- Full system observability via GET APIs
- Easy to test using Postman
- Reflects real hospital OPD behavior
- Scalable and extendable

---

## 10. Future Improvements

- Enforce one slot per doctor per time window
- Redis-based slot locking for concurrency
- Metrics: average wait time, slot utilization
- Admin dashboard (React)
- Cron-based automatic no-show detection
- Intelligent follow-up & alternative slot recommendation

---

## 📁 Additional Documentation

Detailed design and implementation notes are available in the `docs/` folder, including:

- **Implementation & Future Scope Documentation**
  - Explains what has been implemented
  - Discusses design decisions and trade-offs
  - Lists possible future enhancements

- **Postman API Collection**
  - Ready-to-import collection for testing all APIs

    **Path:**
    `docs/OPD-Token-Allocation-Engine.postman_collection.json`

### How to Use

1.  Open Postman
2.  Click **Import**
3.  Select the JSON file
4.  Set environment variable:

---

## 11. Conclusion

This project demonstrates a **realistic backend system** that goes beyond CRUD operations.  
It showcases prioritization, dynamic reallocation, edge-case handling, and practical engineering trade-offs suitable for a **Backend Intern** role.

---

## 12. How to Run the Project

```bash
npm install
npm run dev
```
