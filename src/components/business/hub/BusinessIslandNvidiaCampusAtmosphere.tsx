/**
 * Decorative NVIDIA campus plate over the Prodigy grass island.
 * Uses the dark hub-and-spoke campus art; keeps FX quiet so districts read clearly.
 */
export function BusinessIslandNvidiaCampusAtmosphere() {
  return (
    <div className="iq-nvidia-campus" aria-hidden>
      <img
        className="iq-nvidia-campus__plate"
        src="/images/business-island/nvidia-campus-plate.png"
        alt=""
        draggable={false}
      />
      <span className="iq-nvidia-campus__plate-mask" />
      <span className="iq-nvidia-campus__vignette" />
    </div>
  );
}
