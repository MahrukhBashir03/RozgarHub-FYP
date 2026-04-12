"use client";
import { useEffect, useRef, useState } from "react";

// ── Internal map renderer (reused for small + fullscreen) ─────
function LeafletMapRenderer({ lat, lng, height, onLocationSelect, showWorkerLocation, workerId, employerId, showLiveWorkerLocation, liveWorkerId }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const jobMarkerRef = useRef(null);
  const workerMarkerRef = useRef(null);
  const liveWorkerMarkerRef = useRef(null);
  const watchIdRef = useRef(null);
  const [workerLocation, setWorkerLocation] = useState(null);
  const [workerAddress, setWorkerAddress] = useState(null);
  const [eta, setEta] = useState(null);

  // Calculate distance between two points (haversine formula)
  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distance in km
  };

  // Calculate ETA (assuming average speed of 30 km/h)
  const calculateETA = (distance) => {
    const speed = 30; // km/h
    const timeHours = distance / speed;
    const timeMinutes = Math.round(timeHours * 60);
    if (timeMinutes < 1) return "Arriving now";
    if (timeMinutes < 60) return `~${timeMinutes} min`;
    const hours = Math.floor(timeMinutes / 60);
    const mins = timeMinutes % 60;
    return `~${hours}h ${mins}m`;
  };

  // Reverse geocode to get address from coordinates
  const getAddressFromCoords = async (lat, lng) => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
      const data = await response.json();
      if (data && data.display_name) {
        // Extract street name and area
        const address = data.address || {};
        const road = address.road || address.pedestrian || address.path || address.footway;
        const suburb = address.suburb || address.neighbourhood || address.residential;
        const city = address.city || address.town || address.village;
        
        if (road) {
          return `${road}${suburb ? `, ${suburb}` : ''}${city ? `, ${city}` : ''}`;
        } else {
          // Fallback to display_name but shorten it
          return data.display_name.split(',')[0] + (data.display_name.split(',')[1] ? ', ' + data.display_name.split(',')[1] : '');
        }
      }
      return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    } catch (error) {
      console.warn('Geocoding failed:', error);
      return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    }
  };

  useEffect(() => {
    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css"; link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    console.log("🗺️ LeafletMapRenderer initializing | showLiveWorkerLocation:", showLiveWorkerLocation, "liveWorkerId:", liveWorkerId);

    const initMap = () => {
      if (!mapRef.current || mapInstanceRef.current) return;
      const L = window.L;
      const center = lat && lng ? [lat, lng] : [31.5204, 74.3587];

      const map = L.map(mapRef.current, {
        center, zoom: lat && lng ? 15 : 12,
        zoomControl: true, attributionControl: false,
      });
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19 }).addTo(map);
      mapInstanceRef.current = map;

      // Job pin (blue)
      if (lat && lng) {
        const jobIcon = L.divIcon({
          html: `<div style="display:flex;flex-direction:column;align-items:center;filter:drop-shadow(0 3px 6px rgba(59,130,246,0.5))"><div style="background:#3b82f6;width:18px;height:18px;border-radius:50%;border:3px solid #fff;box-shadow:0 2px 8px rgba(59,130,246,0.6)"></div><div style="width:2px;height:10px;background:#3b82f6;margin-top:-1px"></div></div>`,
          className: "", iconSize: [18, 30], iconAnchor: [9, 30],
        });
        jobMarkerRef.current = L.marker([lat, lng], { icon: jobIcon }).addTo(map).bindPopup("<b>📍 Job Location</b>");
      }

      // Employer click-to-pin
      if (onLocationSelect) {
        const hint = L.control({ position: "topright" });
        hint.onAdd = () => {
          const d = L.DomUtil.create("div");
          d.innerHTML = `<div style="background:#fff;padding:6px 10px;border-radius:8px;font-size:11px;font-weight:700;color:#3b82f6;box-shadow:0 2px 8px rgba(0,0,0,0.15);border:1.5px solid #bfdbfe;white-space:nowrap">📌 Click to set job location</div>`;
          return d;
        };
        hint.addTo(map);

        map.on("click", (e) => {
          const { lat: cLat, lng: cLng } = e.latlng;
          if (jobMarkerRef.current) { jobMarkerRef.current.remove(); jobMarkerRef.current = null; }
          const pinIcon = L.divIcon({
            html: `<div style="display:flex;flex-direction:column;align-items:center;filter:drop-shadow(0 3px 6px rgba(239,68,68,0.5))"><div style="background:#ef4444;width:20px;height:20px;border-radius:50%;border:3px solid #fff;box-shadow:0 2px 10px rgba(239,68,68,0.7)"></div><div style="width:2px;height:12px;background:#ef4444;margin-top:-1px"></div></div>`,
            className: "", iconSize: [20, 34], iconAnchor: [10, 34],
          });
          jobMarkerRef.current = L.marker([cLat, cLng], { icon: pinIcon }).addTo(map).bindPopup("<b>📍 Job site pinned</b>").openPopup();
          onLocationSelect({ lat: cLat, lng: cLng });
        });
      }

      // Live worker location
      if (showLiveWorkerLocation && workerLocation) {
        const liveWorkerIcon = L.divIcon({
          html: `<div style="position:relative;width:32px;height:32px"><div style="position:absolute;inset:0;background:rgba(34,197,94,0.25);border-radius:50%;animation:gps-pulse 2s ease-out infinite"></div><div style="position:absolute;inset:0;background:rgba(34,197,94,0.15);border-radius:50%;animation:gps-pulse 2s ease-out 0.6s infinite"></div><div style="position:absolute;inset:6px;background:#22c55e;border-radius:50%;border:3px solid #fff;box-shadow:0 2px 10px rgba(34,197,94,0.8)"></div></div>`,
          className: "", iconSize: [32, 32], iconAnchor: [16, 16],
        });
        liveWorkerMarkerRef.current = L.marker([workerLocation.lat, workerLocation.lng], { icon: liveWorkerIcon }).addTo(map).bindPopup(`<b>🟢 Worker Location</b><br/><small>${workerAddress || 'Getting address...'}</small><br/>${eta ? `ETA: ${eta}` : ''}`);
        if (lat && lng) map.fitBounds([[workerLocation.lat, workerLocation.lng], [lat, lng]], { padding: [50, 50] });
      }

      // Worker live GPS
      if (showWorkerLocation && navigator.geolocation) {
        const workerIcon = L.divIcon({
          html: `<div style="position:relative;width:28px;height:28px"><div style="position:absolute;inset:0;background:rgba(34,197,94,0.25);border-radius:50%;animation:gps-pulse 2s ease-out infinite"></div><div style="position:absolute;inset:0;background:rgba(34,197,94,0.15);border-radius:50%;animation:gps-pulse 2s ease-out 0.6s infinite"></div><div style="position:absolute;inset:6px;background:#22c55e;border-radius:50%;border:2.5px solid #fff;box-shadow:0 2px 10px rgba(34,197,94,0.8)"></div></div>`,
          className: "", iconSize: [28, 28], iconAnchor: [14, 14],
        });
        // Note: GPS broadcast is now handled by JobTracker component with watchPosition
        // This map just displays the marker when location updates come via socket
      }

      // Live worker location listener
      if (showLiveWorkerLocation && window._rozgarSocket) {
        const handleLocationUpdate = async (data) => {
          console.log("🗺️ JobMap received worker_location_update:", data);
          if (data.workerId === liveWorkerId) {
            console.log("✅ JobMap: Worker ID matched, updating marker");
            setWorkerLocation({ lat: data.lat, lng: data.lng });
            if (lat && lng) {
              const distance = calculateDistance(data.lat, data.lng, lat, lng);
              console.log(`📐 JobMap: Distance = ${distance.toFixed(2)}km`);
              setEta(calculateETA(distance));
            }
            // Get address for the location
            const address = await getAddressFromCoords(data.lat, data.lng);
            console.log(`🏘️ JobMap: Address = ${address}`);
            setWorkerAddress(address);
          } else {
            console.log(`❌ JobMap: Worker ID mismatch. Expected: ${liveWorkerId}, Got: ${data.workerId}`);
          }
        };
        console.log("🎧 JobMap: Attaching worker_location_update listener | liveWorkerId:", liveWorkerId);
        window._rozgarSocket.on("worker_location_update", handleLocationUpdate);
        // Store for cleanup
        window._rozgarSocket._liveWorkerHandler = handleLocationUpdate;
      }
    };

    if (window.L) { initMap(); }
    else if (!document.getElementById("leaflet-js")) {
      const s = document.createElement("script");
      s.id = "leaflet-js"; s.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      s.onload = initMap; document.head.appendChild(s);
    } else {
      const check = setInterval(() => { if (window.L) { clearInterval(check); initMap(); } }, 100);
    }

    return () => {
      if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        jobMarkerRef.current = null;
        workerMarkerRef.current = null;
        liveWorkerMarkerRef.current = null;
      }
      if (window._rozgarSocket && window._rozgarSocket._liveWorkerHandler) {
        window._rozgarSocket.off("worker_location_update", window._rozgarSocket._liveWorkerHandler);
        delete window._rozgarSocket._liveWorkerHandler;
      }
    };
  }, [lat, lng]);

  // Update live worker marker when location changes
  useEffect(() => {
    if (!mapInstanceRef.current || !showLiveWorkerLocation || !workerLocation) return;
    if (liveWorkerMarkerRef.current) {
      liveWorkerMarkerRef.current.setLatLng([workerLocation.lat, workerLocation.lng]);
      liveWorkerMarkerRef.current.setPopupContent(`<b>🟢 Worker Location</b><br/><small>${workerAddress || 'Getting address...'}</small><br/>${eta ? `ETA: ${eta}` : ''}`);
    } else {
      // Add marker if not exists
      const liveWorkerIcon = L.divIcon({
        html: `<div style="position:relative;width:32px;height:32px"><div style="position:absolute;inset:0;background:rgba(34,197,94,0.25);border-radius:50%;animation:gps-pulse 2s ease-out infinite"></div><div style="position:absolute;inset:0;background:rgba(34,197,94,0.15);border-radius:50%;animation:gps-pulse 2s ease-out 0.6s infinite"></div><div style="position:absolute;inset:6px;background:#22c55e;border-radius:50%;border:3px solid #fff;box-shadow:0 2px 10px rgba(34,197,94,0.8)"></div></div>`,
        className: "", iconSize: [32, 32], iconAnchor: [16, 16],
      });
      liveWorkerMarkerRef.current = L.marker([workerLocation.lat, workerLocation.lng], { icon: liveWorkerIcon }).addTo(mapInstanceRef.current).bindPopup(`<b>🟢 Worker Location</b><br/><small>${workerAddress || 'Getting address...'}</small><br/>${eta ? `ETA: ${eta}` : ''}`);
      if (lat && lng) mapInstanceRef.current.fitBounds([[workerLocation.lat, workerLocation.lng], [lat, lng]], { padding: [50, 50] });
    }
  }, [workerLocation, eta, lat, lng, showLiveWorkerLocation, workerAddress]);

  return <div ref={mapRef} style={{ height: height || "100%", width: "100%" }} />;
}

// ── Main JobMap export ─────────────────────────────────────────
export default function JobMap({
  lat,
  lng,
  height = 220,
  label = "Job Location",
  onLocationSelect = null,
  showWorkerLocation = false,
  workerId = null,
  employerId = null,
  showLiveWorkerLocation = false,
  liveWorkerId = null,
}) {
  const [fullscreen, setFullscreen] = useState(false);

  const openInGoogleMaps = () => {
    if (!lat || !lng) return;
    window.open(`https://www.google.com/maps?q=${lat},${lng}&z=16`, "_blank");
  };

  // Expand/collapse icon SVG
  const ExpandIcon = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
    </svg>
  );

  const ExternalIcon = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
      <polyline points="15 3 21 3 21 9"/>
      <line x1="10" y1="14" x2="21" y2="3"/>
    </svg>
  );

  return (
    <>
      <style>{`
        @keyframes gps-pulse { 0%{transform:scale(1);opacity:0.7} 100%{transform:scale(3);opacity:0} }
        @keyframes mapFadeIn { from{opacity:0;transform:scale(0.97)} to{opacity:1;transform:scale(1)} }
        .mapbtn:hover { opacity: 0.8 !important; }
      `}</style>

      {/* ── Small inline map ── */}
      <div style={{ borderRadius: 12, overflow: "hidden", border: "1.5px solid #e2e8f0" }}>

        {/* Header */}
        <div style={{ background: "#f8fafc", padding: "8px 12px", borderBottom: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span>📍</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#475569" }}>{label}</span>
            {showWorkerLocation && (
              <span style={{ display: "flex", alignItems: "center", gap: 4, marginLeft: 4 }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#22c55e", display: "inline-block", animation: "gps-pulse 2s infinite" }} />
                <span style={{ fontSize: 10, fontWeight: 800, color: "#16a34a" }}>LIVE</span>
              </span>
            )}
            {showLiveWorkerLocation && (
              <span style={{ display: "flex", alignItems: "center", gap: 4, marginLeft: 4 }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#22c55e", display: "inline-block", animation: "gps-pulse 2s infinite" }} />
                <span style={{ fontSize: 10, fontWeight: 800, color: "#16a34a" }}>WORKER LIVE</span>
              </span>
            )}
          </div>

          {/* Buttons — only show if we have coordinates */}
          {lat && lng && (
            <div style={{ display: "flex", gap: 6 }}>

              {/* Expand button */}
              <button
                className="mapbtn"
                onClick={() => setFullscreen(true)}
                style={{
                  display: "flex", alignItems: "center", gap: 5,
                  padding: "4px 10px", borderRadius: 7,
                  border: "1.5px solid #e2e8f0", background: "#fff",
                  color: "#475569", fontSize: 11, fontWeight: 700,
                  cursor: "pointer", transition: "opacity 0.15s",
                }}>
                <ExpandIcon /> Expand
              </button>

              {/* Google Maps button */}
              <button
                className="mapbtn"
                onClick={openInGoogleMaps}
                style={{
                  display: "flex", alignItems: "center", gap: 5,
                  padding: "4px 10px", borderRadius: 7,
                  border: "1.5px solid #bfdbfe", background: "#eff6ff",
                  color: "#3b82f6", fontSize: 11, fontWeight: 700,
                  cursor: "pointer", transition: "opacity 0.15s",
                }}>
                <ExternalIcon /> Google Maps
              </button>
            </div>
          )}
        </div>

        <LeafletMapRenderer
          lat={lat} lng={lng} height={height}
          onLocationSelect={onLocationSelect}
          showWorkerLocation={showWorkerLocation}
          workerId={workerId} employerId={employerId}
          showLiveWorkerLocation={showLiveWorkerLocation}
          liveWorkerId={liveWorkerId}
        />
      </div>

      {/* ── Fullscreen modal ── */}
      {fullscreen && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 99999,
          background: "rgba(0,0,0,0.9)",
          display: "flex", flexDirection: "column",
          animation: "mapFadeIn 0.2s ease",
        }}>
          {/* Top bar */}
          <div style={{
            background: "#0f172a", padding: "13px 20px", flexShrink: 0,
            display: "flex", alignItems: "center", justifyContent: "space-between",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 16 }}>📍</span>
              <span style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>{label}</span>
              {showWorkerLocation && (
                <span style={{ display: "flex", alignItems: "center", gap: 5, background: "rgba(34,197,94,0.15)", padding: "3px 10px", borderRadius: 20, border: "1px solid rgba(34,197,94,0.3)" }}>
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#22c55e", display: "inline-block" }} />
                  <span style={{ fontSize: 11, fontWeight: 800, color: "#22c55e" }}>LIVE TRACKING</span>
                </span>
              )}
              {showLiveWorkerLocation && (
                <span style={{ display: "flex", alignItems: "center", gap: 5, background: "rgba(34,197,94,0.15)", padding: "3px 10px", borderRadius: 20, border: "1px solid rgba(34,197,94,0.3)" }}>
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#22c55e", display: "inline-block", animation: "gps-pulse 2s infinite" }} />
                  <span style={{ fontSize: 11, fontWeight: 800, color: "#22c55e" }}>WORKER LIVE</span>
                </span>
              )}
              {lat && lng && (
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginLeft: 4 }}>
                  {lat.toFixed(5)}, {lng.toFixed(5)}
                </span>
              )}
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {lat && lng && (
                <button
                  onClick={openInGoogleMaps}
                  style={{
                    display: "flex", alignItems: "center", gap: 6,
                    padding: "8px 16px", borderRadius: 9, border: "none",
                    background: "#3b82f6", color: "#fff",
                    fontSize: 13, fontWeight: 700, cursor: "pointer",
                  }}>
                  <ExternalIcon /> Open in Google Maps
                </button>
              )}
              <button
                onClick={() => setFullscreen(false)}
                style={{
                  width: 36, height: 36, borderRadius: 9, border: "none",
                  background: "rgba(255,255,255,0.1)", color: "#fff",
                  cursor: "pointer", fontSize: 20, fontWeight: 700,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                ×
              </button>
            </div>
          </div>

          {/* Fullscreen map — fills all space */}
          <div style={{ flex: 1, position: "relative" }}>
            <LeafletMapRenderer
              lat={lat} lng={lng}
              height="100%"
              onLocationSelect={onLocationSelect}
              showWorkerLocation={showWorkerLocation}
              workerId={workerId} employerId={employerId}
              showLiveWorkerLocation={showLiveWorkerLocation}
              liveWorkerId={liveWorkerId}
            />
          </div>

          {/* Bottom bar */}
          <div style={{
            background: "#0f172a", padding: "10px 20px", flexShrink: 0,
            display: "flex", alignItems: "center", justifyContent: "space-between",
            borderTop: "1px solid rgba(255,255,255,0.08)",
          }}>
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>
              {onLocationSelect
                ? "📌 Click anywhere on the map to update the pin location"
                : "Use scroll to zoom · Drag to pan"}
            </span>
            <button
              onClick={() => setFullscreen(false)}
              style={{
                padding: "7px 18px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.15)",
                background: "transparent", color: "rgba(255,255,255,0.6)",
                fontSize: 12, fontWeight: 600, cursor: "pointer",
              }}>
              ✕ Close Fullscreen
            </button>
          </div>
        </div>
      )}
    </>
  );
}
