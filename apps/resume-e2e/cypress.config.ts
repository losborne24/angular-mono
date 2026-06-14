import { nxE2EPreset } from '@nx/cypress/plugins/cypress-preset';
import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    ...nxE2EPreset(__filename, {
      cypressDir: 'src',
      webServerCommands: {
        default: 'yarn nx run resume:serve-static',
        production: 'yarn nx run resume:serve-static',
      },
      ciWebServerCommand: 'yarn nx run resume:serve-static',
      ciBaseUrl: 'http://localhost:4201',
    }),
    baseUrl: 'http://localhost:4201',
  },
});
