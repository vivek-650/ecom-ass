type ClassValue = string | number | false | null | undefined | Record<string, boolean>;

/** Minimal classnames merger — enough for this project without pulling in a dependency. */
export function cn(...values: ClassValue[]): string {
  const classes: string[] = [];
  for (const value of values) {
    if (!value) continue;
    if (typeof value === 'string' || typeof value === 'number') {
      classes.push(String(value));
    } else {
      for (const [key, active] of Object.entries(value)) {
        if (active) classes.push(key);
      }
    }
  }
  return classes.join(' ');
}
