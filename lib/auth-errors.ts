export function isUnauthenticatedError(error: unknown) {
  return error instanceof Error && error.message === "Unauthenticated"
}
