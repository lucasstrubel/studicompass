import { ZodError } from "zod";
import {
  BridgeFailure,
  readChannel,
  type BridgeCredentials,
  type BridgeOptions,
} from "@/services/bridge/client";
import type { PosData, PosService } from "@/services/types";
import { PosError } from "./errors";
import { mapTranscript } from "./mapping";
import { transcript } from "./schemas";

export interface PosServiceOptions extends BridgeOptions {
  /** Programme and modules of the module handbook, which the portal does not deliver. */
  base: () => Promise<PosData>;
}

/** Reads the record of achievements through the bridge and checks it before it reaches the mapping. */
export async function loadPos(
  credentials: BridgeCredentials,
  options: PosServiceOptions,
): Promise<PosData> {
  try {
    const [payload, base] = await Promise.all([
      readChannel("pos", credentials, options),
      options.base(),
    ]);
    return mapTranscript(transcript.parse(payload), base);
  } catch (error) {
    if (error instanceof BridgeFailure)
      throw new PosError(error.kind, { cause: error.cause });
    if (error instanceof ZodError)
      throw new PosError("unexpected", { cause: error });
    throw error;
  }
}

/**
 * Data mode "Eigenes POS": logs in once to check the credentials and returns the service for that
 * account. The data of this first login answers the first load, so connecting costs one login.
 */
export async function connectPos(
  credentials: BridgeCredentials,
  options: PosServiceOptions,
): Promise<{ service: PosService }> {
  let first: Promise<PosData> | null = Promise.resolve(
    await loadPos(credentials, options),
  );
  return {
    service: {
      load() {
        const ready = first;
        first = null;
        return ready ?? loadPos(credentials, options);
      },
    },
  };
}
