import { isDemoStoryModeActive } from "@/lib/demo/demoStoryMode";
import { isSchoolsDemoStoryModeActive } from "@/lib/schools/schoolsDemoStoryMode";

/** True when any scripted presenter demo is running (bank or Schools). */
export function isIsolatedDemoStoryModeActive(): boolean {
  return isDemoStoryModeActive() || isSchoolsDemoStoryModeActive();
}
