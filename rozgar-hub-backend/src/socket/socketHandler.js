module.exports = (io) => {
  const onlineWorkers = new Map();
  const activeRequests = new Map(); // requestId -> { employerId, confirmedWorkerId, status, fare }

  io.on("connection", (socket) => {
    console.log(`[Socket] Connected: ${socket.id}`);

    socket.on("join", (userId) => {
      socket.join(userId);
      console.log(`[Socket] ✅ User ${userId} joined their room (socket.id: ${socket.id})`);
      console.log(`[Socket] Rooms this socket is in:`, socket.rooms);
    });

    socket.on("worker_online", ({ workerId, name, skill }) => {
      socket.join("workers");
      onlineWorkers.set(socket.id, { workerId, name, skill });
      io.emit("workers_online_count", onlineWorkers.size);
    });

    socket.on("new_job_request", (data) => {
      const { requestId, employerId } = data;
      activeRequests.set(requestId, {
        employerId,
        fare: data.offeredPrice,
        status: "searching",
        confirmedWorkerId: null,
        acceptedWorkers: [], // track all workers who accepted
      });
      io.to("workers").emit("new_job_request", data);
    });

    // ── Worker ACCEPTS the job request ──────────────────────────
    socket.on("worker_job_accept", (data) => {
      const { requestId, employerId, workerId, workerName, workerRating, workerPhone, workerExperience } = data;
      console.log(`[Accept] ${workerName} accepted request ${requestId}`);
      const req = activeRequests.get(requestId);
      if (req) {
        req.status = "worker_accepted";
        if (!req.acceptedWorkers.includes(workerId)) {
          req.acceptedWorkers.push(workerId);
        }
      }
      // Only notify the employer
      io.to(employerId).emit("worker_job_accept", data);
    });

    // ── Worker DECLINES the job request ─────────────────────────
    socket.on("worker_job_decline", (data) => {
      const { requestId, workerId } = data;
      console.log(`[Decline] Worker ${workerId} declined request ${requestId}`);
      const req = activeRequests.get(requestId);
      if (req) {
        req.acceptedWorkers = (req.acceptedWorkers || []).filter((id) => id !== workerId);
      }
    });

    // ── Employer CONFIRMS a specific worker ──────────────────────
    socket.on("employer_confirm_worker", (data) => {
      const { requestId, workerId, employerName, finalPrice } = data;
      console.log(`[Confirmed] Employer confirmed worker ${workerId} for request ${requestId}`);

      const req = activeRequests.get(requestId);
      if (req) {
        req.status = "confirmed";
        req.confirmedWorkerId = workerId;
      }

      // ✅ Only tell the CONFIRMED worker: job is yours
      io.to(workerId).emit("employer_confirm_worker", { ...data, finalPrice });

      // ✅ Tell all OTHER workers who accepted: request is taken (not selected)
      if (req && req.acceptedWorkers) {
        req.acceptedWorkers.forEach((wid) => {
          if (wid !== workerId) {
            io.to(wid).emit("request_taken_not_selected", { requestId });
          }
        });
      }
    });

    // ── Employer DISMISSES a worker (without confirming anyone else) ─
    socket.on("employer_dismiss_worker", (data) => {
      const { workerId, requestId } = data;
      console.log(`[Dismissed] Employer dismissed worker ${workerId}`);
      const req = activeRequests.get(requestId);
      if (req) {
        req.acceptedWorkers = (req.acceptedWorkers || []).filter((id) => id !== workerId);
      }
      io.to(workerId).emit("employer_dismiss_worker", data);
    });

    // ── Worker sends a price COUNTER offer ───────────────────────
    socket.on("worker_offer", (data) => {
      const { requestId, employerId, workerId, workerName, price } = data;
      console.log(`[Offer] ${workerName} offered Rs. ${price} for ${requestId}`);
      const req = activeRequests.get(requestId);
      if (req) {
        req.status = "negotiating";
        if (!req.acceptedWorkers.includes(workerId)) {
          req.acceptedWorkers.push(workerId);
        }
      }
      io.to(employerId).emit("worker_offer", data);
    });

    // ── Employer accepts a worker's counter offer ────────────────
    socket.on("employer_accepted", (data) => {
      const { requestId, workerId } = data;
      const req = activeRequests.get(requestId);
      if (req) {
        req.status = "confirmed";
        req.confirmedWorkerId = workerId;
      }

      // Tell only the accepted worker
      io.to(workerId).emit("employer_accepted", data);

      // Tell other workers they were NOT selected
      if (req && req.acceptedWorkers) {
        req.acceptedWorkers.forEach((wid) => {
          if (wid !== workerId) {
            io.to(wid).emit("request_taken_not_selected", { requestId });
          }
        });
      }
    });

    socket.on("employer_rejected", (data) => {
      // Employer explicitly rejects one counter offer
      io.to(data.workerId).emit("employer_rejected", data);
      const req = activeRequests.get(data.requestId);
      if (req) {
        req.acceptedWorkers = (req.acceptedWorkers || []).filter((id) => id !== data.workerId);
      }
    });

    socket.on("employer_counter", (data) => {
      io.to(data.workerId).emit("employer_counter", data);
    });

    // ── Job Progress / Tracking events ──────────────────────────
    socket.on("worker_arrived", (data) => {
      const { requestId, employerId } = data;
      io.to(employerId).emit("worker_arrived", data);
      const req = activeRequests.get(requestId);
      if (req) req.status = "worker_arrived";
    });

    socket.on("job_started", (data) => {
      const { requestId, employerId, workerId } = data;
      io.to(employerId).emit("job_started", data);
      io.to(workerId).emit("job_started", data);
      const req = activeRequests.get(requestId);
      if (req) req.status = "in_progress";
    });

    socket.on("job_completed_by_worker", (data) => {
      const { requestId, employerId } = data;
      io.to(employerId).emit("job_completed_by_worker", data);
      const req = activeRequests.get(requestId);
      if (req) req.status = "pending_payment";
    });

    socket.on("payment_sent", (data) => {
      const { requestId, workerId } = data;
      io.to(workerId).emit("payment_sent", data);
      const req = activeRequests.get(requestId);
      if (req) req.status = "payment_sent";

      // Generate OTP for secure cash payment
      const otp = Math.floor(100000 + Math.random() * 900000);
      req.otp = otp;
      io.to(workerId).emit("payment_otp", { otp });
      io.to(req.employerId).emit("payment_otp", { otp });
    });

    socket.on("payment_confirmed", (data) => {
      const { requestId, employerId } = data;
      io.to(employerId).emit("payment_confirmed", data);
      const req = activeRequests.get(requestId);
      if (req) req.status = "completed";
      activeRequests.delete(requestId);
    });

    socket.on("employer_cancelled", (data) => {
      const req = activeRequests.get(data.requestId);
      if (req && req.confirmedWorkerId) {
        io.to(req.confirmedWorkerId).emit("job_cancelled", data);
      }
      activeRequests.delete(data.requestId);
      socket.broadcast.emit("employer_cancelled", data);
    });

    socket.on("worker_accepted", (data) => {
      io.to(data.employerId).emit("worker_accepted", data);
    });

    socket.on("worker_rejected_counter", (data) => {
      io.to(data.employerId).emit("worker_rejected_counter", data);
    });

    socket.on("employer_raised_fare", (data) => {
      const req = activeRequests.get(data.requestId);
      if (req) req.fare = data.newFare;
      socket.broadcast.emit("employer_raised_fare", data);
    });

    // ── Worker location updates for live tracking ───────────────
    socket.on("worker_location_update", (data) => {
      const { workerId, employerId, lat, lng, accuracy } = data;
      console.log(`[Worker Location] Received from worker ${workerId} for employer ${employerId} | ${lat}, ${lng}`);
      
      // Forward to the employer's room with live location
      if (employerId) {
        console.log(`[Worker Location] Sending to employer room: ${employerId}`);
        socket.to(employerId).emit("worker_location_update", {
          workerId: workerId,
          lat:      lat,
          lng:      lng,
        });
      } else {
        console.warn(`[Worker Location] ❌ employerId missing from data:`, data);
      }
    });

    // ── Chat messages ─────────────────────────────
    socket.on("send_message", (data) => {
      const { from, to, message, timestamp } = data;
      io.to(to).emit("receive_message", { from, message, timestamp });
    });

    // ── In-job chat (employer + worker) ──────────────────────────
    socket.on("job_chat_message", (data) => {
      // { requestId, from, fromName, text, time, toId }
      if (data.toId) {
        socket.to(data.toId).emit("job_chat_message", {
          requestId: data.requestId,
          from:      data.from,
          fromName:  data.fromName,
          text:      data.text,
          time:      data.time,
        });
      }
    });

    // ── NEW: OTP Cash Payment flow ──────────────────────────────
    socket.on("payment_otp_sent", (data) => {
      // { requestId, workerId, employerId, otp, amount }
      // In production: store OTP hash server-side, send via SMS to worker
      const req = activeRequests.get(data.requestId);
      if (req) {
        req.otp = data.otp;  // Store OTP for verification
      }
      if (data.workerId) {
        // Send OTP notification to worker (without otp in production)
        socket.to(data.workerId).emit("payment_otp_sent", {
          requestId: data.requestId,
          amount:    data.amount,
          // otp: data.otp   // ← REMOVE in production; send via SMS instead
        });
      }
      // Notify employer that OTP has been dispatched
      socket.emit("payment_otp_dispatched", { requestId: data.requestId });
    });

    socket.on("verify_payment_otp", (data) => {
      // { requestId, employerId, otp }
      const req = activeRequests.get(data.requestId);
      if (req && req.otp == data.otp) {
        // OTP is correct
        if (data.employerId) {
          socket.to(data.employerId).emit("payment_confirmed", { requestId: data.requestId });
        }
        socket.emit("payment_confirmed", { requestId: data.requestId });
        req.status = "completed";
        activeRequests.delete(data.requestId);
      } else {
        // Invalid OTP
        socket.emit("otp_invalid");
      }
    });

    // ── Confirm payment with OTP (legacy) ─────────────────
    socket.on("confirm_payment", (data) => {
      const { requestId, otp } = data;
      const req = activeRequests.get(requestId);
      if (req && req.otp == otp) {
        io.to(req.employerId).emit("payment_confirmed", data);
        activeRequests.delete(requestId);
      } else {
        // Invalid OTP, perhaps emit error
        socket.emit("otp_invalid");
      }
    });

    // ── Job rating (after completion) ───────────────────────────
    socket.on("job_rating", (data) => {
      // { requestId, rating, role }
      // TODO: save rating to DB
      console.log(`Rating for job ${data.requestId}: ${data.rating} (by ${data.role})`);
      const req = activeRequests.get(data.requestId);
      if (req) {
        req.rating = data.rating;
      }
    });

    socket.on("disconnect", () => {
      if (onlineWorkers.has(socket.id)) {
        const w = onlineWorkers.get(socket.id);
        onlineWorkers.delete(socket.id);
        console.log(`[Worker Offline] ${w.name}`);
        io.emit("workers_online_count", onlineWorkers.size);
      }
    });
  });
};