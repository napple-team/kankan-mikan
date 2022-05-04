// Based on https://github.com/hiterm/web-ext-react-template
// Copyright (c) 2021 htlsne

import * as chokidar from 'chokidar';
import { build, BuildOptions } from 'esbuild';
import { promises as fs } from 'fs';
import path from 'path';
import vuePlugin from 'esbuild-plugin-vue3';

const watchFlag = process.argv.includes('--watch');
const devFlag = process.argv.includes('--dev');
const chromeFlag = process.argv.includes('--chrome');
const firefoxFlag = process.argv.includes('--firefox');

type Browser = 'firefox' | 'chrome';

const watchOption = (targetBrowser: Browser): BuildOptions['watch'] =>
  watchFlag
    ? {
        onRebuild: (error, result) => {
          if (error)
            console.error(`watch build failed for ${targetBrowser}: `, error);
          else
            console.log(`watch build succeeded for ${targetBrowser}:`, result);
        },
      }
    : false;

const distDir = (targetBrowser: Browser) => {
  switch (targetBrowser) {
    case 'firefox':
      return 'dist-firefox';
    case 'chrome':
      return 'dist-chrome';
  }
};

const distPath = (relPath: string, targetBrowser: Browser) =>
  path.join(distDir(targetBrowser), relPath);

const makeManifestFile = async (targetBrowser: Browser) => {
  const baseManifestJson = JSON.parse(
    await fs.readFile('manifest.json', 'utf8')
  );
  if (targetBrowser === 'firefox') {
    const firefoxJson = JSON.parse(await fs.readFile('firefox.json', 'utf8'));
    const manifestJson = { ...baseManifestJson, ...firefoxJson };
    fs.writeFile(
      distPath('manifest.json', targetBrowser),
      JSON.stringify(manifestJson, null, 1)
    );
  } else if (targetBrowser === 'chrome') {
    const chromeJson = JSON.parse(await fs.readFile('chrome.json', 'utf8'));
    const manifestJson = { ...baseManifestJson, ...chromeJson };
    fs.writeFile(
      distPath('manifest.json', targetBrowser),
      JSON.stringify(manifestJson, null, 1)
    );
  } else {
    fs.copyFile('manifest.json', distPath('manifest.json', targetBrowser));
  }
};

const buildExtension = async (targetBrowser: Browser) => {
  await fs.mkdir(distPath('option', targetBrowser), { recursive: true });
  await fs.mkdir(distPath('icons', targetBrowser), { recursive: true });

  if (targetBrowser === 'firefox') {
    await fs.mkdir(distPath('background', targetBrowser), { recursive: true });
    build({
      entryPoints: ['src/background/index.ts'],
      bundle: true,
      outdir: distPath('background', targetBrowser),
      watch: watchOption(targetBrowser),
      sourcemap: devFlag ? 'inline' : false,
    });
  } else if (targetBrowser === 'chrome') {
    await fs.mkdir(distPath('service_worker', targetBrowser), { recursive: true });
    build({
      entryPoints: ['src/service_worker/index.ts'],
      bundle: true,
      outdir: distPath('service_worker', targetBrowser),
      watch: watchOption(targetBrowser),
      sourcemap: devFlag ? 'inline' : false,
    });
  }

  // build tsx by esbuild
  build({
    entryPoints: ['src/option/index.ts'],
    bundle: true,
    outdir: distPath('option', targetBrowser),
    watch: watchOption(targetBrowser),
    plugins: [vuePlugin()],
    // loader: {'.png': 'file'},
    sourcemap: devFlag ? 'inline' : false,
  });

  // copy static files
  if (watchFlag) {
    chokidar.watch('src/option/index.html').on('all', (event, path) => {
      console.log(event, path);
      fs.copyFile(path, distPath('option/index.html', targetBrowser));
    });
    chokidar
      .watch(['manifest.json', 'firefox.json'])
      .on('all', (event, path) => {
        console.log(event, path);
        makeManifestFile(targetBrowser);
      });
    chokidar.watch('src/icons/*').on('all', (event, filepath) => {
      console.log(event, filepath);
      fs.copyFile(
        filepath,
        distPath(path.join('icons', path.basename(filepath)), targetBrowser)
      );
    });
  } else {
    fs.copyFile(
      'src/option/index.html',
      distPath('option/index.html', targetBrowser)
    );
    makeManifestFile(targetBrowser);
    fs.cp('src/icons', distPath('icons', targetBrowser), { recursive: true });
  }
};

if (firefoxFlag) {
  buildExtension('firefox');
}
if (chromeFlag) {
  buildExtension('chrome');
}
