/** Survives React Strict Mode remounts within the same browser tab. */
let sessionTouched = false;

export function markGameSessionTouched(): void {
  sessionTouched = true;
}

export function wasGameSessionTouched(): boolean {
  return sessionTouched;
}
