const fs = require('fs');

const envFilePath = process.argv[2];
if (!envFilePath) {
  throw new Error('Usage: write-desktop-env.cjs <path-to-.env>');
}

const replacements = {
  AWS_REGION: process.env.ENV_AWS_REGION,
  AWS_CONTROL_API_URL: process.env.ENV_AWS_CONTROL_API_URL,
  AWS_CONTROL_API_KEY: process.env.ENV_AWS_CONTROL_API_KEY,
  AWS_SCHOOL_ID: process.env.ENV_AWS_SCHOOL_ID,
  AWS_UPDATES_BUCKET: process.env.ENV_AWS_UPDATES_BUCKET,
  AWS_SCHOOL_DATA_BUCKET: process.env.ENV_AWS_SCHOOL_DATA_BUCKET,
};

let content = fs.readFileSync(envFilePath, 'utf8');

for (const [key, value] of Object.entries(replacements)) {
  if (!value) continue;
  content = content.replace(new RegExp(`^${key}=.*$`, 'm'), `${key}=${value}`);
}

fs.writeFileSync(envFilePath, content);
