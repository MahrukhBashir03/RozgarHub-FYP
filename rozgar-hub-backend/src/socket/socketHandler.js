module.exports = (io) => {
  const onlineWorkers = new Map();
  const activeRequests = new Map();

  io.on("connection", (socket) => {
    console.log(`[Socket] Connected: ${socket.id}`);

    socket.on("join", (userId) => {
      socket.join(userId);
      console.log(`[Socket] ✅ User ${userId} joined their room (socket.id: ${socket.id})`);
    });

    // ── Admin joins their own room for targeted events ────────────
    socket.on("join_admin", () => {
      socket.join("admins");
      console.log(`[Socket] 🛡️ Admin joined admin room (socket.id: ${socket.id})`);
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
        acceptedWorkers: [],
      });
      io.to("workers").emit("new_job_request", data);
    });

    socket.on("worker_job_accept", (data) => {
      const { requestId, employerId, workerId, workerName, workerRating, workerPhone, workerExperience } = data;
      console.log(`[Accept] ${workerName} accepted request ${requestId}`);
      const req = activeRequests.get(requestId);
      if (req) {
        req.status = "worker_accepted";
        if (!req.acceptedWorkers.includes(workerId)) req.acceptedWorkers.push(workerId);
      }
      io.to(employerId).emit("worker_job_accept", data);
    });

    socket.on("worker_job_decline", (data) => {
      const { requestId, workerId } = data;
      const req = activeRequests.get(requestId);
      if (req) req.acceptedWorkers = (req.acceptedWorkers || []).filter((id) => id !== workerId);
    });

    socket.on("employer_confirm_worker", (data) => {
      const { requestId, workerId, finalPrice } = data;
      const req = activeRequests.get(requestId);
      if (req) { req.status = "confirmed"; req.confirmedWorkerId = workerId; }
      io.to(workerId).emit("employer_confirm_worker", { ...data, finalPrice });
      if (req && req.acceptedWorkers) {
        req.acceptedWorkers.forEach((wid) => {
          if (wid !== workerId) io.to(wid).emit("request_taken_not_selected", { requestId });
        });
      }
    });

    socket.on("employer_dismiss_worker", (data) => {
      const { workerId, requestId } = data;
      const req = activeRequests.get(requestId);
      if (req) req.acceptedWorkers = (req.acceptedWorkers || []).filter((id) => id !== workerId);
      io.to(workerId).emit("employer_dismiss_worker", data);
    });

    socket.on("worker_offer", (data) => {
      const { requestId, employerId, workerId, workerName, price } = data;
      const req = activeRequests.get(requestId);
      if (req) {
        req.status = "negotiating";
        if (!req.acceptedWorkers.includes(workerId)) req.acceptedWorkers.push(workerId);
      }
      io.to(employerId).emit("worker_offer", data);
    });

    socket.on("employer_accepted", (data) => {
      const { requestId, workerId } = data;
      const req = activeRequests.get(requestId);
      if (req) { req.status = "confirmed"; req.confirmedWorkerId = workerId; }
      io.to(workerId).emit("employer_accepted", data);
      if (req && req.acceptedWorkers) {
        req.acceptedWorkers.forEach((wid) => {
          if (wid !== workerId) io.to(wid).emit("request_taken_not_selected", { requestId });
        });
      }
    });

    socket.on("employer_rejected", (data) => {
      io.to(data.workerId).emit("employer_rejected", data);
      const req = activeRequests.get(data.requestId);
      if (req) req.acceptedWorkers = (req.acceptedWorkers || []).filter((id) => id !== data.workerId);
    });

    socket.on("employer_counter", (data) => {
      io.to(data.workerId).emit("employer_counter", data);
    });

    socket.on("worker_arrived", (data) => {
      io.to(data.employerId).emit("worker_arrived", data);
      const req = activeRequests.get(data.requestId);
      if (req) req.status = "worker_arrived";
    });

    socket.on("job_started", (data) => {
      io.to(data.employerId).emit("job_started", data);
      io.to(data.workerId).emit("job_started", data);
      const req = activeRequests.get(data.requestId);
      if (req) req.status = "in_progress";
    });

    socket.on("job_completed_by_worker", (data) => {
      io.to(data.employerId).emit("job_completed_by_worker", data);
      const req = activeRequests.get(data.requestId);
      if (req) req.status = "pending_payment";
    });

    socket.on("payment_sent", (data) => {
      const { requestId, workerId } = data;
      io.to(workerId).emit("payment_sent", data);
      const req = activeRequests.get(requestId);
      if (req) {
        req.status = "payment_sent";
        const otp = Math.floor(100000 + Math.random() * 900000);
        req.otp = otp;
        io.to(workerId).emit("payment_otp", { otp });
        io.to(req.employerId).emit("payment_otp", { otp });
      }
    });

    socket.on("payment_confirmed", (data) => {
      io.to(data.employerId).emit("payment_confirmed", data);
      const req = activeRequests.get(data.requestId);
      if (req) req.status = "completed";
      activeRequests.delete(data.requestId);
    });

    socket.on("employer_cancelled", (data) => {
      const req = activeRequests.get(data.requestId);
      if (req && req.confirmedWorkerId) io.to(req.confirmedWorkerId).emit("job_cancelled", data);
      activeRequests.delete(data.requestId);
      socket.broadcast.emit("employer_cancelled", data);
    });

    socket.on("worker_accepted", (data) => {
      io.to(data.employerId).emit("worker_accepted", data);
    });

    socket.on("browse_job_applied", (data) => {
      if (data.employerId) io.to(String(data.employerId)).emit("browse_job_applied", data);
    });

    socket.on("browse_application_accepted", (data) => {
      if (data.workerId) io.to(data.workerId).emit("browse_application_accepted", data);
    });

    socket.on("worker_rejected_counter", (data) => {
      io.to(data.employerId).emit("worker_rejected_counter", data);
    });

    socket.on("employer_raised_fare", (data) => {
      const req = activeRequests.get(data.requestId);
      if (req) req.fare = data.newFare;
      socket.broadcast.emit("employer_raised_fare", data);
    });

    socket.on("worker_location_update", (data) => {
      const { workerId, employerId, lat, lng } = data;
      if (employerId) socket.to(employerId).emit("worker_location_update", { workerId, lat, lng });
    });

    socket.on("send_message", (data) => {
      io.to(data.to).emit("receive_message", { from: data.from, message: data.message, timestamp: data.timestamp });
    });

    socket.on("job_chat_message", (data) => {
      if (data.toId) socket.to(data.toId).emit("job_chat_message", {
        requestId: data.requestId, from: data.from, fromName: data.fromName, text: data.text, time: data.time,
      });
    });

    socket.on("payment_otp_sent", (data) => {
      const req = activeRequests.get(data.requestId);
      if (req) req.otp = data.otp;
      if (data.workerId) socket.to(data.workerId).emit("payment_otp_sent", { requestId: data.requestId, amount: data.amount });
      socket.emit("payment_otp_dispatched", { requestId: data.requestId });
    });

    socket.on("verify_payment_otp", (data) => {
      const req = activeRequests.get(data.requestId);
      if (req && req.otp == data.otp) {
        if (data.employerId) socket.to(data.employerId).emit("payment_confirmed", { requestId: data.requestId });
        socket.emit("payment_confirmed", { requestId: data.requestId });
        req.status = "completed";
        activeRequests.delete(data.requestId);
      } else {
        socket.emit("otp_invalid");
      }
    });

    socket.on("confirm_payment", (data) => {
      const req = activeRequests.get(data.requestId);
      if (req && req.otp == data.otp) {
        io.to(req.employerId).emit("payment_confirmed", data);
        activeRequests.delete(data.requestId);
      } else {
        socket.emit("otp_invalid");
      }
    });

    socket.on("job_rating", (data) => {
      const req = activeRequests.get(data.requestId);
      if (req) req.rating = data.rating;
    });

    // ── SOS Events ────────────────────────────────────────────────
    // Worker frontend emits "sos_trigger" → forward to all admins as "sos_triggered"
    socket.on("sos_trigger", (data) => {
      console.log(`[SOS] 🚨 Worker ${data.workerName} triggered SOS at ${data.lat}, ${data.lng}`);
      // Broadcast to admin room so admin dashboard updates in real time
      io.to("admins").emit("sos_triggered", {
        sosId:       data.sosId,
        workerId:    data.workerId,
        workerName:  data.workerName,
        workerPhone: data.workerPhone,
        lat:         data.lat,
        lng:         data.lng,
        address:     data.address || "",
        timestamp:   data.timestamp || new Date().toISOString(),
      });
    });

    // Worker cancels SOS → notify admins
    socket.on("sos_cancel", (data) => {
      console.log(`[SOS] ✅ Worker ${data.workerId} cancelled SOS ${data.sosId}`);
      io.to("admins").emit("sos_cancelled", { sosId: data.sosId, workerId: data.workerId });
    });

    // Live location update during active SOS → forward to admins
    socket.on("sos_location_update", (data) => {
      io.to("admins").emit("sos_location_update", data);
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