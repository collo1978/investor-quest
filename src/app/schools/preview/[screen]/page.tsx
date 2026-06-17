import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ screen: string }>;
};

/**
 * Fullscreen Schools preview router.
 *
 * Any Schools sidebar screen at `/schools/[screen]` can be previewed at
 * `/schools/preview/[screen]` without duplicating page implementations.
 *
 * App chrome removal is handled in `AppShell` for `/schools/preview/*`.
 */
export default async function SchoolsPreviewScreenPage({ params }: Props) {
  const { screen } = await params;
  if (!screen) return notFound();

  // NOTE: Keep this as a dynamic import so new screens automatically work
  // without adding more preview routes.
  try {
    const mod = await import(`@/app/schools/${screen}/page`);
    const Page = mod.default as React.ComponentType;
    return <Page />;
  } catch {
    return notFound();
  }
}

