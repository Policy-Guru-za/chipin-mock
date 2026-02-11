type DreamboardIconProps = {
  className?: string;
};

export function ChatBubbleIcon({ className }: DreamboardIconProps) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      className={className}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M20 11.5C20 16 16.2 19.5 11.5 19.5C10 19.5 8.6 19.1 7.4 18.5L4 20l1.2-3.2C4.4 15.3 4 13.5 4 11.5C4 7 7.8 3.5 12.5 3.5C17.2 3.5 20 7 20 11.5Z"
      />
    </svg>
  );
}

export function LockIcon({ className }: DreamboardIconProps) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      className={className}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M7 10V8a5 5 0 0 1 10 0v2M6.5 10h11a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1h-11a1 1 0 0 1-1-1v-8a1 1 0 0 1 1-1Z"
      />
      <circle cx="12" cy="15" r="1.3" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function UserSilhouetteIcon({ className }: DreamboardIconProps) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      className={className}
    >
      <circle cx="12" cy="8" r="3" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M5.5 19c1.3-3 3.4-4.5 6.5-4.5S17.2 16 18.5 19" />
    </svg>
  );
}

export function PlusIcon({ className }: DreamboardIconProps) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      className={className}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function CalendarIcon({ className }: DreamboardIconProps) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      className={className}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 3v3M17 3v3M4 8.5h16M6 5h12a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z" />
    </svg>
  );
}

export function MapPinIcon({ className }: DreamboardIconProps) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      className={className}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 21s6-5.2 6-10a6 6 0 1 0-12 0c0 4.8 6 10 6 10Z"
      />
      <circle cx="12" cy="11" r="2.2" />
    </svg>
  );
}
