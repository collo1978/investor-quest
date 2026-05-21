/** Lap timings for quest generation pipeline logs. */
export class QuestPipelineTimer {
  private readonly t0 = Date.now();
  private readonly laps = new Map<string, number>();

  mark(name: string): void {
    this.laps.set(name, Date.now() - this.t0);
  }

  elapsedMs(name: string): number | undefined {
    return this.laps.get(name);
  }

  deltaMs(from: string, to: string): number | undefined {
    const a = this.laps.get(from);
    const b = this.laps.get(to);
    if (a == null || b == null) return undefined;
    return b - a;
  }

  summary(): Record<string, number> {
    const out: Record<string, number> = { totalMs: Date.now() - this.t0 };
    for (const [k, v] of this.laps) out[k] = v;
    return out;
  }
}
