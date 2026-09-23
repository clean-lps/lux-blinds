import type { NextConfig } from 'next';
const config: NextConfig = {
  poweredByHeader: false,
  // Windows reports 22 logical CPUs here, which makes Next spawn 21 static
  // generation workers. That exhausts the available memory and crashes a
  // native worker during `next build`; two workers are sufficient and stable.
  experimental: { cpus: 2 },
};
export default config;
