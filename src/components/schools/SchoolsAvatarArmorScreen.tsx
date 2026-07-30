"use client";

import type { CSSProperties } from "react";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { NeonButton } from "@/components/NeonButton";
import { SchoolsAvatarPortraitCard } from "@/components/schools/SchoolsAvatarPortraitCard";
import {
  getArmorCardCrop,
  SCHOOLS_ARMOR_IMAGE_SRC
} from "@/lib/schools/schoolsArmorCardZones";
import {
  SCHOOLS_ARMOR_TYPES,
  type SchoolsArmor,
  type SchoolsArmorId
} from "@/lib/schools/schoolsIdentities";
import { readSchoolsArmor, saveSchoolsArmor } from "@/lib/schools/schoolsIdentityStorage";
import { SCHOOLS_AVATARS, type SchoolsAvatarId } from "@/lib/schools/avatars";
import { readSchoolsAvatar, saveSchoolsAvatar } from "@/lib/schools/schoolsAvatarStorage";
import { playSchoolsIdentityTalkSound } from "@/lib/schools/schoolsIdentityTalkSound";

const GOLD = "#F5C547";
const LEAVE_TRANSITION_MS = 380;

export type SchoolsAvatarArmorScreenProps = {
  onContinue: (avatarId: SchoolsAvatarId, armorId: SchoolsArmorId) => void;
};

export function SchoolsAvatarArmorScreen({
  onContinue
}: SchoolsAvatarArmorScreenProps) {
  const [avatarId, setAvatarId] = useState<SchoolsAvatarId | null>(null);
  const [armorId, setArmorId] = useState<SchoolsArmorId | null>(null);
  const [leaving, setLeaving] = useState(false);
  const [pathViewIndex, setPathViewIndex] = useState(0);
  const [pathSlideDir, setPathSlideDir] = useState(1);

  const selectedAvatar = avatarId
    ? SCHOOLS_AVATARS.find((a) => a.id === avatarId)
    : null;
  const selectedArmor = armorId
    ? SCHOOLS_ARMOR_TYPES.find((a) => a.id === armorId)
    : null;
  const canContinue = selectedAvatar != null && selectedArmor != null;
  const pathUnlocked = selectedAvatar != null;
  const focusedArmor = SCHOOLS_ARMOR_TYPES[pathViewIndex] ?? SCHOOLS_ARMOR_TYPES[0];
  const focusedArmorCrop = getArmorCardCrop(focusedArmor.id);
  const canGoPrevPath = pathViewIndex > 0;
  const canGoNextPath = pathViewIndex < SCHOOLS_ARMOR_TYPES.length - 1;

  useEffect(() => {
    const storedAvatar = readSchoolsAvatar();
    if (storedAvatar) setAvatarId(storedAvatar.id);
    const storedArmor = readSchoolsArmor();
    if (storedArmor) {
      setArmorId(storedArmor.id);
      const idx = SCHOOLS_ARMOR_TYPES.findIndex((a) => a.id === storedArmor.id);
      if (idx >= 0) setPathViewIndex(idx);
    }
  }, []);

  const goToPathIndex = (next: number) => {
    if (!pathUnlocked || leaving) return;
    const clamped = Math.max(0, Math.min(SCHOOLS_ARMOR_TYPES.length - 1, next));
    if (clamped === pathViewIndex) return;
    setPathSlideDir(clamped > pathViewIndex ? 1 : -1);
    setPathViewIndex(clamped);
  };

  const handleSelectAvatar = (id: SchoolsAvatarId) => {
    if (leaving || id === avatarId) return;
    const avatar = SCHOOLS_AVATARS.find((a) => a.id === id);
    if (!avatar) return;

    setAvatarId(id);
    saveSchoolsAvatar(id);
    playSchoolsIdentityTalkSound({
      seed: avatar.id,
      text: avatar.greeting,
      gender: avatar.gender
    });
  };

  const handleSelectArmor = (armor: SchoolsArmor) => {
    if (!pathUnlocked || leaving) return;
    setArmorId(armor.id);
    saveSchoolsArmor(armor.id);
    playSchoolsIdentityTalkSound({ seed: armor.id, text: armor.greeting });
  };

  const handleContinue = () => {
    if (!avatarId || !armorId || leaving) return;
    setLeaving(true);
    window.setTimeout(() => {
      onContinue(avatarId, armorId);
    }, LEAVE_TRANSITION_MS);
  };

  return (
    <motion.main
      className="iq-schools-choose-identity relative flex h-[100dvh] w-full flex-col items-center overflow-hidden bg-[#030208] px-4 py-5 sm:px-5 sm:py-6 md:px-10"
      role="application"
      aria-label="Assign your investigator"
      initial={{ opacity: 0 }}
      animate={
        leaving
          ? { opacity: 0, scale: 0.97, filter: "blur(6px)" }
          : { opacity: 1, scale: 1, filter: "blur(0px)" }
      }
      transition={{ duration: LEAVE_TRANSITION_MS / 1000, ease: [0.4, 0, 1, 1] }}
      style={{ pointerEvents: leaving ? "none" : "auto" }}
    >
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(245,197,71,0.12),transparent_55%),radial-gradient(ellipse_60%_40%_at_100%_100%,rgba(139,92,246,0.1),transparent_50%)]"
      />
      <div aria-hidden className="pointer-events-none fixed inset-0 iq-schools-armor-vault-bg" />
      <div aria-hidden className="pointer-events-none fixed inset-0 iq-schools-armor-circuit-bg" />
      <div aria-hidden className="pointer-events-none fixed inset-0 iq-schools-armor-spotlight-bg" />

      <header className="relative z-[1] mb-3 text-center sm:mb-4">
        <h1
          className="font-[var(--font-grotesk)] text-[clamp(1.65rem,5vw,3rem)] font-black uppercase leading-[0.98] tracking-[0.06em] md:text-5xl"
          style={{
            background: `linear-gradient(180deg, #fff8e1, ${GOLD})`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent"
          }}
        >
          Assign your investigator
        </h1>
        <p className="mt-2 text-sm font-semibold uppercase tracking-[0.2em] text-amber-100/70">
          Choose the case lead, then assign their path.
        </p>
      </header>

      <div className="iq-schools-identity-board relative z-[1] grid w-full max-w-6xl flex-1 gap-4 overflow-visible lg:grid-cols-[1.35fr_1fr] lg:items-stretch">
        <section className="iq-schools-identity-panel iq-schools-avatar-pick-shell">
          <div className="iq-schools-step-kicker">
            <span>01</span>
            Case lead
          </div>
          <h2 className="iq-schools-identity-panel-title">Select investigator</h2>

          <motion.div
            layout
            className="iq-schools-avatar-selection-panel iq-schools-investigator-card mb-4 flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left sm:gap-4 sm:px-4"
          >
            {selectedAvatar ? (
              <>
                <motion.div
                  key={selectedAvatar.id}
                  initial={{ opacity: 0, scale: 0.88, rotate: -2 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 420, damping: 28 }}
                  className="shrink-0"
                >
                  <SchoolsAvatarPortraitCard
                    avatarId={selectedAvatar.id}
                    accent={selectedAvatar.accent}
                    width={78}
                    selected
                  />
                </motion.div>
                <div className="min-w-0">
                  <motion.p
                    key={`${selectedAvatar.id}-name`}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="font-[var(--font-grotesk)] text-lg font-black uppercase text-amber-50"
                  >
                    {selectedAvatar.name}
                  </motion.p>
                  <motion.p
                    key={`${selectedAvatar.id}-tagline`}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 }}
                    className="mt-0.5 text-sm font-semibold text-violet-100/76"
                  >
                    {selectedAvatar.tagline}
                  </motion.p>
                  <motion.div
                    key={`${selectedAvatar.id}-status`}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.08 }}
                    className="iq-schools-investigator-status"
                  >
                    <span>Investigator assigned</span>
                    Awaiting path
                  </motion.div>
                </div>
              </>
            ) : (
              <div className="min-h-[5.6rem] w-full content-center text-center">
                <p className="font-[var(--font-grotesk)] text-sm font-black uppercase tracking-[0.16em] text-amber-100/82">
                  Pick your investigator
                </p>
                <p className="mt-1 text-xs font-semibold text-violet-100/58">
                  Path selection unlocks after assignment.
                </p>
              </div>
            )}
          </motion.div>

          <div className="iq-schools-avatar-pick-grid mx-auto grid w-full justify-items-center gap-3 sm:gap-3.5">
            {SCHOOLS_AVATARS.map((avatar, index) => (
              <motion.button
                key={avatar.id}
                type="button"
                aria-label={avatar.name}
                aria-pressed={avatarId === avatar.id}
                onClick={() => handleSelectAvatar(avatar.id)}
                className={[
                  "iq-schools-avatar-row-btn rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-200 focus-visible:ring-offset-2 focus-visible:ring-offset-black",
                  avatarId === avatar.id ? "iq-schools-avatar-row-btn--selected" : ""
                ].join(" ")}
                initial={{ opacity: 0, y: 14, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{
                  delay: 0.03 * index,
                  type: "spring",
                  stiffness: 360,
                  damping: 28
                }}
                whileHover={leaving ? undefined : { y: -4, scale: 1.02 }}
                whileTap={leaving ? undefined : { scale: 0.97 }}
              >
                <SchoolsAvatarPortraitCard
                  avatarId={avatar.id}
                  accent={avatar.accent}
                  width="100%"
                  selected={avatarId === avatar.id}
                />
                <span className="iq-schools-avatar-row-name">{avatar.name}</span>
              </motion.button>
            ))}
          </div>
        </section>

        <section
          className={[
            "iq-schools-identity-panel iq-schools-path-panel",
            pathUnlocked ? "iq-schools-path-panel--unlocked" : "iq-schools-path-panel--locked"
          ].join(" ")}
          aria-disabled={!pathUnlocked}
        >
          <div className="iq-schools-path-header">
            <div>
              <div className="iq-schools-step-kicker">
                <span>02</span>
                Assignment
              </div>
              <h2 className="iq-schools-identity-panel-title">Assign path</h2>
            </div>
          </div>

          <motion.div
            className="iq-schools-path-carousel"
            animate={pathUnlocked ? { opacity: 1, y: 0 } : { opacity: 0.54, y: 8 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
          >
            <button
              type="button"
              aria-label="Previous path"
              onClick={() => goToPathIndex(pathViewIndex - 1)}
              disabled={!pathUnlocked || !canGoPrevPath || leaving}
              className="iq-schools-path-carousel__nav iq-schools-path-carousel__nav--prev"
            >
              <svg viewBox="0 0 24 24" aria-hidden className="h-5 w-5">
                <path
                  d="M15 5l-7 7 7 7"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            <div className="iq-schools-path-carousel__stage">
              <AnimatePresence mode="wait" initial={false} custom={pathSlideDir}>
                <motion.button
                  key={focusedArmor.id}
                  type="button"
                  aria-label={focusedArmor.title}
                  aria-pressed={armorId === focusedArmor.id}
                  aria-disabled={!pathUnlocked}
                  disabled={!pathUnlocked}
                  onClick={() => handleSelectArmor(focusedArmor)}
                  className={[
                    "iq-schools-path-dossier iq-schools-path-dossier--carousel",
                    armorId === focusedArmor.id ? "iq-schools-path-dossier--selected" : "",
                    pathUnlocked ? "" : "iq-schools-path-dossier--locked"
                  ].join(" ")}
                  style={{ "--iq-path-accent": focusedArmor.accent } as CSSProperties}
                  custom={pathSlideDir}
                  initial={{ opacity: 0, x: pathSlideDir * 48, scale: 0.96 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: pathSlideDir * -48, scale: 0.96 }}
                  transition={{ duration: 0.26, ease: "easeOut" }}
                  whileHover={pathUnlocked && !leaving ? { y: -4, scale: 1.012 } : undefined}
                  whileTap={pathUnlocked && !leaving ? { scale: 0.985 } : undefined}
                >
                  <span
                    className="iq-schools-path-dossier__art"
                    aria-hidden
                    style={{
                      backgroundImage: `url(${SCHOOLS_ARMOR_IMAGE_SRC})`,
                      backgroundSize: `${focusedArmorCrop.backgroundSizePct.x}% ${focusedArmorCrop.backgroundSizePct.y}%`,
                      backgroundPosition: `${focusedArmorCrop.backgroundPositionPct.x}% ${focusedArmorCrop.backgroundPositionPct.y}%`
                    }}
                  />
                  <span className="iq-schools-path-dossier__overlay">
                    <span className="iq-schools-path-dossier__title">{focusedArmor.shortTitle}</span>
                    <span className="iq-schools-path-dossier__status">
                      {armorId === focusedArmor.id
                        ? "Assigned"
                        : pathUnlocked
                          ? `Case 0${pathViewIndex + 1}`
                          : "Locked"}
                    </span>
                  </span>
                </motion.button>
              </AnimatePresence>
            </div>

            <button
              type="button"
              aria-label="Next path"
              onClick={() => goToPathIndex(pathViewIndex + 1)}
              disabled={!pathUnlocked || !canGoNextPath || leaving}
              className="iq-schools-path-carousel__nav iq-schools-path-carousel__nav--next"
            >
              <svg viewBox="0 0 24 24" aria-hidden className="h-5 w-5">
                <path
                  d="M9 5l7 7-7 7"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </motion.div>

          <div className="iq-schools-path-carousel__dots" role="tablist" aria-label="Path options">
            {SCHOOLS_ARMOR_TYPES.map((armor, i) => (
              <button
                key={armor.id}
                type="button"
                role="tab"
                aria-selected={i === pathViewIndex}
                aria-label={`Preview ${armor.title}`}
                disabled={!pathUnlocked}
                onClick={() => goToPathIndex(i)}
                className={[
                  "iq-schools-path-carousel__dot",
                  i === pathViewIndex ? "iq-schools-path-carousel__dot--active" : ""
                ].join(" ")}
              />
            ))}
          </div>
        </section>
      </div>

      <footer className="relative z-[1] mt-2 flex w-full max-w-6xl flex-col items-center gap-2 pb-[max(0.2rem,env(safe-area-inset-bottom))]">
        <p className="iq-schools-armor-caption text-center text-xs font-semibold text-amber-50/72">
          {selectedAvatar && selectedArmor ? (
            <>
              <span className="font-semibold uppercase tracking-[0.14em] text-amber-100/80">
                {selectedAvatar.name} ready
              </span>{" "}
              - {selectedArmor.shortTitle} path selected.
            </>
          ) : selectedAvatar ? (
            <>
              <span className="font-semibold uppercase tracking-[0.14em] text-amber-100/80">
                {selectedAvatar.name} selected
              </span>{" "}
              - now pick your path.
            </>
          ) : (
            <>
              <span className="font-semibold uppercase tracking-[0.14em] text-amber-100/80">
                Case file pending
              </span>{" "}
              - choose a face to unlock path selection.
            </>
          )}
        </p>
        <motion.div
          animate={
            canContinue && !leaving
              ? { y: [0, -2, 0], scale: [1, 1.018, 1] }
              : { y: 0, scale: 1 }
          }
          transition={
            canContinue && !leaving
              ? { duration: 2.4, repeat: Infinity, ease: "easeInOut" }
              : { duration: 0.2 }
          }
        >
          <NeonButton
            type="button"
            aria-label="Continue to onboarding"
            aria-disabled={!canContinue}
            disabled={!canContinue || leaving}
            className={[
              "iq-schools-armor-continue-btn min-w-[13rem] px-8 py-3 text-sm font-black uppercase tracking-[0.28em]",
              canContinue ? "iq-schools-armor-continue-btn--armed" : ""
            ].join(" ")}
            onClick={handleContinue}
          >
            Continue
          </NeonButton>
        </motion.div>
      </footer>
    </motion.main>
  );
}
