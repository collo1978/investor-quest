import type { BusinessIslandPlaceTheme } from "@/lib/business/businessIslandStoryLocations";

type Props = {
  theme: BusinessIslandPlaceTheme;
  className?: string;
};

/**
 * Distinct district landmark under each pin — game-level architecture, not generic offices.
 */
export function BusinessIslandPlaceBuilding({ theme, className }: Props) {
  const base = className ?? "iq-business-island-place-building";

  switch (theme) {
    case "headquarters":
      return (
        <span className={`${base} ${base}--hq`} aria-hidden>
          <span className={`${base}__wing ${base}__wing--l`} />
          <span className={`${base}__tower`} />
          <span className={`${base}__wing ${base}__wing--r`} />
          <span className={`${base}__brand`}>N</span>
          <span className={`${base}__glow`} />
        </span>
      );
    case "products-hall":
      return (
        <span className={`${base} ${base}--hall`} aria-hidden>
          <span className={`${base}__roof`} />
          <span className={`${base}__show`} />
          <span className={`${base}__podium`} />
          <span className={`${base}__podium ${base}__podium--b`} />
        </span>
      );
    case "division-hub":
      return (
        <span className={`${base} ${base}--hub`} aria-hidden>
          <span className={`${base}__core`} />
          <span className={`${base}__spoke`} />
          <span className={`${base}__spoke ${base}__spoke--b`} />
          <span className={`${base}__spoke ${base}__spoke--c`} />
          <span className={`${base}__dash`} />
        </span>
      );
    case "history-trail":
      return (
        <span className={`${base} ${base}--trail`} aria-hidden>
          <span className={`${base}__obelisk`} />
          <span className={`${base}__obelisk ${base}__obelisk--b`} />
          <span className={`${base}__obelisk ${base}__obelisk--c`} />
          <span className={`${base}__path`} />
        </span>
      );
    case "manufacturing":
      return (
        <span className={`${base} ${base}--fab`} aria-hidden>
          <span className={`${base}__plant`} />
          <span className={`${base}__stack`} />
          <span className={`${base}__stack ${base}__stack--b`} />
          <span className={`${base}__wafer`} />
        </span>
      );
    case "competitive-arena":
      return (
        <span className={`${base} ${base}--arena`} aria-hidden>
          <span className={`${base}__barrier ${base}__barrier--outer`} />
          <span className={`${base}__barrier`} />
          <span className={`${base}__bowl`} />
          <span className={`${base}__flag`} />
        </span>
      );
    default:
      return <span className={base} aria-hidden />;
  }
}
