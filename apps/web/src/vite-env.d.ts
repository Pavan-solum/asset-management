/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_USE_API?: string;
  readonly VITE_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module '@mui/icons-material/*' {
  import { SvgIconComponent } from '@mui/icons-material';
  const Icon: SvgIconComponent;
  export default Icon;
}
