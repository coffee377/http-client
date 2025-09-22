import { SafeAny } from "@/types";

/**
 * Safely assert whether the given value is an ArrayBuffer.
 * In some execution environments ArrayBuffer is not defined.
 */
export function isArrayBuffer(value: SafeAny): value is ArrayBuffer {
  return typeof ArrayBuffer !== "undefined" && value instanceof ArrayBuffer;
}

/**
 * Safely assert whether the given value is a Blob.
 * In some execution environments Blob is not defined.
 */
export function isBlob(value: SafeAny): value is Blob {
  return typeof Blob !== "undefined" && value instanceof Blob;
}

/**
 * Safely assert whether the given value is a FormData instance.
 * In some execution environments FormData is not defined.
 */
export function isFormData(value: SafeAny): value is FormData {
  return typeof FormData !== "undefined" && value instanceof FormData;
}
