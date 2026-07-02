"use client";

import { SchoolsBusinessHubCodedScene } from "@/components/schools/SchoolsBusinessHubCodedScene";
import { BUSINESS_SCENE_STYLE } from "@/app/business/businessQuestMapPositions";

/** Blue ocean + island art while game state hydrates — avoids a blank hub flash. */
export function SchoolsBusinessHubHydrationScene() {
  return (
    <div
      className="business-hub-scene-root flex min-h-0 w-full flex-1 flex-col"
      data-business-quest-hub
      aria-busy="true"
      aria-label="Loading Business Island"
    >
      <div className="business-hub-scene-scroll business-hub-scene-scroll--schools-island-focus flex min-h-0 w-full flex-1 flex-col">
        <div className="business-hub-scene-frame relative mx-auto flex w-full min-h-0 flex-1 flex-col">
          <div className="business-hub-scene-shell iq-schools-business-hub-scene-shell iq-schools-business-hub-scene-shell--island-focus iq-schools-business-hub-scene-shell--hub-preview iq-schools-business-hub-scene-shell--zoom-arrival relative flex min-h-0 flex-1 flex-col overflow-hidden">
            <div
              className="business-hub-scene-stage relative flex min-h-0 flex-1 flex-col"
              style={BUSINESS_SCENE_STYLE}
              data-business-scene
            >
              <div className="business-hub-scene-art-wrap pointer-events-none absolute inset-0 overflow-hidden">
                <div className="iq-schools-business-hub-scene-settle h-full w-full">
                  <SchoolsBusinessHubCodedScene />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
