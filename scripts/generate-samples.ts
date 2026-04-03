import fs from 'node:fs';
import path from 'node:path';
import { runAudit } from '../src/auditors/index.js';
import { renderHTML } from '../src/reporter/html.js';
import { generateDemoData } from '../src/demo/data.js';

async function generate() {
  console.log('Generating sample bad report...');
  const badData = generateDemoData(); // Demo data is mostly 'bad' by design
  const badReport = await runAudit(badData, { skip: [], only: [] });
  const badHtml = renderHTML(badReport);
  fs.writeFileSync(path.join(process.cwd(), 'docs/samples/sample-bad.html'), badHtml);

  console.log('Generating sample good report...');
  const goodData = { ...badData };
  // Modify goodData to bypass critical rules
  // Fix localization
  goodData.versionLocalizations = goodData.versionLocalizations.map((loc) => ({
    ...loc,
    attributes: {
      ...loc.attributes,
      description: 'This is a beautifully long proper description over 100 characters to make sure we do not trigger any short description warnings. It explains all features perfectly.',
      keywords: 'good,keywords,here',
    }
  }));
  // Missing privacy policy
  goodData.appInfoLocalizations = goodData.appInfoLocalizations.map((loc) => ({
    ...loc,
    attributes: {
      ...loc.attributes,
      privacyPolicyUrl: 'https://apple.com/privacy',
    }
  }));
  // Missing reviewer info
  goodData.reviewDetail = {
    type: 'appStoreReviewDetails',
    id: 'rev-001',
    attributes: {
      contactFirstName: 'John',
      contactLastName: 'Doe',
      contactEmail: 'review@apple.com',
      contactPhone: '+1-555-555-5555',
      demoAccountRequired: false,
      demoAccountName: null,
      demoAccountPassword: null,
      notes: 'No special notes',
    }
  };

  const goodReport = await runAudit(goodData, { skip: [], only: [] });
  const goodHtml = renderHTML(goodReport);
  fs.writeFileSync(path.join(process.cwd(), 'docs/samples/sample-good.html'), goodHtml);

  console.log('Done!');
}

generate().catch(console.error);
