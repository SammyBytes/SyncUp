/**
 * A simple Result type to represent success or failure of operations.
 */
type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };
/**
 * Creates a successful Result or an error Result.
 * @param value - The successful value.
 * @param error - The error value.
 * @returns A Result representing the success or failure of the operation.
 */
const Ok = <T>(value: T): Result<T, never> => ({ ok: true, value });
/**
 * Creates an error Result.
 * @param error - The error value.
 * @returns A Result representing the failure of the operation.
 */
const Err = <E>(error: E): Result<never, E> => ({ ok: false, error });

export { Ok, Err };
export type { Result };
