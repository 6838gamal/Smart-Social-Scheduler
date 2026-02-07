import type { SVGProps } from 'react';

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M15 6.2c0-1.3-1-2.2-2.2-2.2S10.6 5 10.6 6.2c0 .8.4 1.5 1.1 1.8" />
      <path d="M15.8 7.8c0-1-.8-1.8-1.8-1.8-1 0-1.8.8-1.8 1.8" />
      <path d="M17 12c0-1.7-1.3-3-3-3s-3 1.3-3 3c0 .8.3 1.5.8 2" />
      <path d="M18.8 14.8c0-1.5-1.2-2.8-2.8-2.8-1.5 0-2.8 1.3-2.8 2.8" />
      <path d="M18 20c0-1.1-.9-2-2-2s-2 .9-2 2" />
      <path d="m11.9 13.8 2.8 2.9" />
      <path d="m14 10.5 2.5 2.5" />
      <path d="m13.2 6.9 1.9 1.9" />
      <path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  );
}

export function WhatsApp(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M16.75 13.96c.25.13.43.2.5.28.08.08.16.18.22.33.06.15.08.33.02.51-.06.18-.33.36-.67.51-.34.15-1.02.21-1.52.08-.5-.13-1.04-.31-1.58-.55-.54-.24-1-.55-1.42-.91-.42-.36-.78-.78-1.08-1.26-.3-.48-.46-.98-.46-1.5s.13-1 .39-1.35c.26-.35.58-.58.93-.7.35-.12.68-.1.95.04.27.14.48.39.6.66.12.27.15.58.09.86-.06.28-.21.53-.41.72-.2.19-.36.33-.46.43s-.18.18-.13.26c.05.08.25.39.6.73.35.34.73.65 1.15.89.42.24.77.35.97.35.2.0.43-.05.6-.13zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
    </svg>
  );
}

export function Telegram(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M9.78 18.65l.28-4.23-7.68-2.42c.46-1.88 2.2-3.26 4.1-3.26 1.1 0 2.1.48 2.8 1.25L18.4 4.9c.7-.6 1.6-1 2.6-1 .3 0 .6.05.9.14L9.78 18.65zM18 20c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z" />
    </svg>
  );
}

export function Notion(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm2.5 15.5h-1.25V14.5h-2.5v3H9.5V8.5h3.75c1.24 0 2.25 1.01 2.25 2.25v2.25c0 .8-.45 1.5-1.12 1.87L14.5 17.5zm-1.25-5.25h-2.5V9.5h2.5v2.75z" />
    </svg>
  );
}

export function Mail(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
    </svg>
  );
}
