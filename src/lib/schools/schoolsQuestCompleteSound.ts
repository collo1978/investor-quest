/**
 * Quest-complete celebration chime — reuses mission-brief victory tones.
 */
import { playMissionBriefComplete, primeMissionBriefAudio } from "@/lib/schools/missionBriefTypewriterSound";

export function primeSchoolsQuestCompleteAudio(): void {
  primeMissionBriefAudio();
}

export function playSchoolsQuestCompleteSound(): void {
  primeMissionBriefAudio();
  playMissionBriefComplete();
}
