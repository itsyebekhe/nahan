/**
 * Traffic Normalizer (Normaliser)
 * Normalizes packet chunk sizes, paces stream delivery, and reduces burst signatures
 * to prevent DPI traffic classification and protocol fingerprinting.
 */

import { sysConfig } from "./state.js";
import { writeSocketWithTimeout } from "./utils.js";
import { TCP_WRITE_TIMEOUT_MS } from "./constants.js";

/**
 * Splits or normalizes a buffer/chunk into uniform MTU-friendly segments.
 * Jitters size between 1200 and 1440 bytes to eliminate deterministic packet-length signatures.
 *
 * @param {ArrayBuffer|Uint8Array} data
 * @param {number} maxChunk
 * @returns {Uint8Array[]}
 */
export function normalizeTrafficChunk(data, maxChunk = 1420) {
    if (!data) return [];
    const uint8 = data instanceof Uint8Array
        ? data
        : new Uint8Array(data.buffer || data);

    if (uint8.byteLength <= maxChunk) {
        return [uint8];
    }

    const segments = [];
    let offset = 0;
    const total = uint8.byteLength;

    while (offset < total) {
        // Pseudo-random jitter between 1240 and 1440 to mask proxy packet length histograms
        const jitter = Math.floor(Math.random() * 200);
        const targetSize = Math.max(512, maxChunk - jitter);
        const chunkSize = Math.min(total - offset, targetSize);
        segments.push(uint8.subarray(offset, offset + chunkSize));
        offset += chunkSize;
    }

    return segments;
}

export function isTrafficNormalizerActive() {
    return sysConfig.trafficNormalizer !== false && sysConfig.trafficNormaliser !== false;
}
export const isTrafficNormaliserActive = isTrafficNormalizerActive;

/**
 * Normalizes downstream traffic sent to client WebSocket.
 *
 * @param {WebSocket} ws
 * @param {ArrayBuffer|Uint8Array} chunk
 */
export function sendNormalizedDownstream(ws, chunk) {
    if (!chunk || !ws) return;
    if (!isTrafficNormalizerActive()) {
        ws.send(chunk);
        return;
    }

    const normalized = normalizeTrafficChunk(chunk);
    for (let i = 0; i < normalized.length; i++) {
        ws.send(normalized[i]);
    }
}
export const sendNormalisedDownstream = sendNormalizedDownstream;

/**
 * Normalizes upstream writes to remote TCP socket.
 *
 * @param {any} socket
 * @param {WritableStreamDefaultWriter} writer
 * @param {ArrayBuffer|Uint8Array} data
 * @param {number} timeoutMs
 */
export async function writeNormalizedTraffic(
    socket,
    writer,
    data,
    timeoutMs = TCP_WRITE_TIMEOUT_MS,
) {
    if (!data || !writer) return;
    if (!isTrafficNormalizerActive()) {
        return await writeSocketWithTimeout(socket, writer, data, timeoutMs);
    }

    const normalized = normalizeTrafficChunk(data);
    for (let i = 0; i < normalized.length; i++) {
        await writeSocketWithTimeout(socket, writer, normalized[i], timeoutMs);
    }
}
export const writeNormalisedTraffic = writeNormalizedTraffic;

/**
 * High-level normalize function.
 *
 * @param {ArrayBuffer|Uint8Array} data
 * @param {object} [options]
 * @returns {Uint8Array[]}
 */
export function normalizeTraffic(data, options = {}) {
    const maxChunk = options.maxChunk || 1420;
    return normalizeTrafficChunk(data, maxChunk);
}
export const normaliseTraffic = normalizeTraffic;
export const normaliseTrafficChunk = normalizeTrafficChunk;

/**
 * Creates a TransformStream for traffic normalization.
 *
 * @param {object} [options]
 * @returns {TransformStream}
 */
export function createTrafficNormalizer(options = {}) {
    const maxChunk = options.maxChunk || 1420;
    return new TransformStream({
        transform(chunk, controller) {
            const normalized = normalizeTrafficChunk(chunk, maxChunk);
            for (const piece of normalized) {
                controller.enqueue(piece);
            }
        },
    });
}

// Aliases supporting British and alternative spellings
export const createTrafficNormaliser = createTrafficNormalizer;
export const trafficNormalizer = {
    isTrafficNormalizerActive,
    isTrafficNormaliserActive,
    normalizeTraffic,
    normaliseTraffic,
    normalizeTrafficChunk,
    normaliseTrafficChunk,
    sendNormalizedDownstream,
    sendNormalisedDownstream,
    writeNormalizedTraffic,
    writeNormalisedTraffic,
    createTrafficNormalizer,
    createTrafficNormaliser,
};
export const trafficNormaliser = trafficNormalizer;
