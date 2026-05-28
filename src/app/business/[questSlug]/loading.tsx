/**
 * Route transition shell — keep minimal; quest client renders immediately when hydrated.
 */
export default function BusinessQuestLoading() {
  return (
    <main
      className="pointer-events-none min-h-[12rem] bg-bg-0"
      aria-busy="true"
      aria-label="Loading quest"
    />
  );
}
