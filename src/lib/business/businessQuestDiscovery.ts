/** Quest title revealed only after the player opens the quest. */
export function formatBusinessQuestRevealTitle(
  orderNumber: number,
  title: string
): string {
  return `Quest ${orderNumber}: ${title}`;
}

export function businessQuestDiscoveryAriaLabel(
  orderNumber: number,
  state: "locked" | "active" | "completed" | "available"
): string {
  switch (state) {
    case "locked":
      return `Quest ${orderNumber} locked`;
    case "completed":
      return `Quest ${orderNumber} complete`;
    case "active":
      return `Quest ${orderNumber} — current quest`;
    default:
      return `Quest ${orderNumber}`;
  }
}
