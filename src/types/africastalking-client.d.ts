/**
 * africastalking-client ships no types (and is deprecated upstream, though
 * still the only implementation of AT's browser WebRTC signaling). This is
 * a minimal shape covering what's documented in its README.
 */
declare module "africastalking-client" {
  export type VoiceClientEvent =
    | "ready"
    | "notready"
    | "calling"
    | "incomingcall"
    | "callaccepted"
    | "hangup"
    | "offline"
    | "closed";

  export class Client {
    constructor(token: string);
    on(event: VoiceClientEvent, handler: (payload: unknown) => void, useCapture?: boolean): void;
    call(destination: string): void;
    answer(): void;
    hangup(): void;
    dtmf(digit: string): void;
    muteAudio(): void;
    unmuteAudio(): void;
    hold(): void;
    unhold(): void;
  }

  const Africastalking: { Client: typeof Client };
  export default Africastalking;
}
