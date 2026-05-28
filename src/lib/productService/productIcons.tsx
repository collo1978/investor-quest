import type { ReactNode, SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { className?: string };

function IconBase({
  children,
  className,
  ...props
}: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
      {...props}
    >
      {children}
    </svg>
  );
}

function IPhoneIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <rect x="7" y="2" width="10" height="20" rx="2.5" />
      <line x1="12" y1="19" x2="12" y2="19.01" strokeWidth="2" />
    </IconBase>
  );
}

function LaptopIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <rect x="3" y="5" width="18" height="12" rx="1.5" />
      <path d="M2 19h20" />
    </IconBase>
  );
}

function TabletIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <rect x="5" y="3" width="14" height="18" rx="2" />
      <line x1="12" y1="18" x2="12" y2="18.01" strokeWidth="2" />
    </IconBase>
  );
}

function WatchIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <rect x="7" y="6" width="10" height="12" rx="3" />
      <path d="M9 6V4M15 6V4M9 18v2M15 18v2" />
    </IconBase>
  );
}

function HeadphonesIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M4 14v-2a8 8 0 0 1 16 0v2" />
      <rect x="2" y="14" width="4" height="6" rx="1" />
      <rect x="18" y="14" width="4" height="6" rx="1" />
    </IconBase>
  );
}

function StoreIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M4 10h16l-1.5-6H5.5L4 10Z" />
      <path d="M6 10v10h12V10" />
    </IconBase>
  );
}

function CloudIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M7 18h10a4 4 0 0 0 .5-8 5.5 5.5 0 0 0-10.6-1.5A3.5 3.5 0 0 0 7 18Z" />
    </IconBase>
  );
}

function MusicIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M9 18V6l10-2v12" />
      <circle cx="7" cy="18" r="2.5" />
      <circle cx="17" cy="16" r="2.5" />
    </IconBase>
  );
}

function TvIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <rect x="2" y="6" width="20" height="13" rx="2" />
      <path d="M8 3l4 3 4-3" />
    </IconBase>
  );
}

function ShieldIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M12 3 5 6v6c0 4.5 3 7.5 7 9 4-1.5 7-4.5 7-9V6l-7-3Z" />
    </IconBase>
  );
}

function EcosystemIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <circle cx="12" cy="12" r="3" />
      <circle cx="5" cy="7" r="2" />
      <circle cx="19" cy="7" r="2" />
      <circle cx="5" cy="17" r="2" />
      <circle cx="19" cy="17" r="2" />
      <path d="M9.5 10.5 6.5 8.5M14.5 10.5l3-2M9.5 13.5l-3 2M14.5 13.5l3 2" />
    </IconBase>
  );
}

function DefaultIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <rect x="4" y="4" width="16" height="16" rx="3" />
      <path d="M8 12h8M12 8v8" />
    </IconBase>
  );
}

const ICON_BY_KEY: Record<string, (props: IconProps) => ReactNode> = {
  iphone: IPhoneIcon,
  mac: LaptopIcon,
  ipad: TabletIcon,
  wearables: WatchIcon,
  apple_watch: WatchIcon,
  airpods: HeadphonesIcon,
  app_store: StoreIcon,
  icloud: CloudIcon,
  apple_music: MusicIcon,
  apple_tv: TvIcon,
  applecare: ShieldIcon,
  ecosystem: EcosystemIcon,
  services: StoreIcon
};

export function ProductIcon({
  productKey,
  className
}: {
  productKey: string;
  className?: string;
}) {
  const Icon = ICON_BY_KEY[productKey] ?? DefaultIcon;
  return <Icon className={className} />;
}
