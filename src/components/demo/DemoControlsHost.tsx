"use client";



import { useCallback, useMemo, useState } from "react";

import { useRouter } from "next/navigation";



import { useGame } from "@/components/GameProvider";

import { useDemoStory } from "@/components/demo/DemoStoryProvider";

import { DemoControlsPanel } from "@/components/demo/DemoControlsPanel";

import {

  buildDemoGameState,

  DEMO_PROFILE_INVESTOR,

  DEMO_PROFILE_NEW_USER,

  getDemoProfileMeta,

  type DemoProfileId

} from "@/lib/demo/demoProfiles";

import { launchProductionDemo } from "@/lib/demo/launchProductionDemo";

import { deactivateDemoStory } from "@/lib/demo/demoStoryMode";

import { summarizeDemoProgress } from "@/lib/demo/demoProgressSummary";

import {

  clearDemoSessionFlags,

  setActiveDemoProfileLabel

} from "@/lib/demo/demoSessionReset";

import { clearPersistedSnapshots } from "@/engine/progression/persistence";



/** Admin dashboard card — same actions, no floating chrome. */

export function DemoControlsAdminCard() {

  const router = useRouter();

  const { raw, actions } = useGame();

  const demoStory = useDemoStory();

  const [busy, setBusy] = useState(false);

  const summary = useMemo(() => summarizeDemoProgress(raw), [raw]);



  const applyProfile = useCallback(

    async (profileId: DemoProfileId) => {

      if (busy) return;



      if (profileId === DEMO_PROFILE_NEW_USER) {

        setBusy(true);

        try {

          launchProductionDemo(router, actions);

        } finally {

          setBusy(false);

        }

        return;

      }



      const meta = getDemoProfileMeta(profileId);

      setBusy(true);

      try {

        demoStory.exit();

        deactivateDemoStory();

        clearDemoSessionFlags();

        clearPersistedSnapshots();

        setActiveDemoProfileLabel(meta.id);

        actions.replaceGameState(buildDemoGameState(profileId));

        router.prefetch(meta.startRoute);

        router.replace(meta.startRoute);

      } finally {

        setBusy(false);

      }

    },

    [actions, busy, demoStory, router]

  );



  if (!isDemoControlsEnabled()) {

    return (

      <p className="text-sm text-ink-2">

        Demo controls are disabled. Set{" "}

        <code className="text-ink-1">NEXT_PUBLIC_DEMO_CONTROLS=true</code> or run a

        non-production build.

      </p>

    );

  }



  return (

    <DemoControlsPanel

      summary={summary}

      busy={busy}

      demoStoryActive={demoStory.active}

      demoStoryStep={demoStory.active ? demoStory.step : null}

      onApplyProfile={applyProfile}

      variant="admin"

    />

  );

}


