import SchoolsPreviewMapPageClient from "../map/pageClient";

const PRODIGY_MAP_PATH = "/logos/desktop-map-prodigy.png";

export default function SchoolsPreviewMapProdigyPage() {
  return (
    <SchoolsPreviewMapPageClient
      desktopMapPath={PRODIGY_MAP_PATH}
      showBridgeFlows={false}
    />
  );
}
