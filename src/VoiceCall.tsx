import { useRef, useState } from "react";
import type { Client } from "africastalking-client";
import { fetchCapabilityToken } from "./lib/backend";

type CallStatus = "idle" | "connecting" | "ready" | "calling" | "in-call" | "error";

export function VoiceCall() {
  const [status, setStatus] = useState<CallStatus>("idle");
  const [destination, setDestination] = useState("");
  const [error, setError] = useState<string | null>(null);
  const clientRef = useRef<Client | null>(null);

  async function connect() {
    setStatus("connecting");
    setError(null);

    try {
      const clientName = `browser-${Math.random().toString(36).slice(2, 8)}`;
      const { token } = await fetchCapabilityToken(clientName);

      // Browser-only SDK — imported dynamically so it never touches SSR/build-time code paths.
      const { default: Africastalking } = await import("africastalking-client");
      const client = new Africastalking.Client(token);
      clientRef.current = client;

      client.on("ready", () => {
        console.log("[voice] ready");
        setStatus("ready");
      });
      client.on("notready", (payload) => {
        console.log("[voice] notready", payload);
        setStatus("error");
      });
      client.on("calling", (payload) => {
        console.log("[voice] calling", payload);
        setStatus("calling");
      });
      client.on("callaccepted", (payload) => {
        console.log("[voice] callaccepted", payload);
        setStatus("in-call");
      });
      client.on("hangup", (payload) => {
        console.log("[voice] hangup", payload);
        setStatus("ready");
      });
      client.on("offline", (payload) => {
        console.log("[voice] offline", payload);
        setStatus("idle");
      });
      client.on("closed", (payload) => {
        console.log("[voice] closed", payload);
        setStatus("idle");
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to connect");
      setStatus("error");
    }
  }

  function placeCall() {
    if (!clientRef.current || !destination) return;
    console.log("[voice] calling", destination);
    try {
      clientRef.current.call(destination);
    } catch (err) {
      console.error("[voice] call() threw", err);
      setError(err instanceof Error ? err.message : "call() threw an error");
    }
  }

  function endCall() {
    clientRef.current?.hangup();
  }

  return (
    <section>
      <h1>Africa's Talking WebRTC demo</h1>
      <p>Status: {status}</p>
      {error && <p style={{ color: "red" }}>{error}</p>}

      {status === "idle" && <button onClick={connect}>Connect</button>}

      {(status === "ready" || status === "calling" || status === "in-call") && (
        <div>
          <input
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder="+2547XXXXXXXX"
            disabled={status !== "ready"}
          />
          <button onClick={placeCall} disabled={status !== "ready" || !destination}>
            Call
          </button>
          <button onClick={endCall} disabled={status !== "in-call" && status !== "calling"}>
            Hang up
          </button>
        </div>
      )}
    </section>
  );
}
