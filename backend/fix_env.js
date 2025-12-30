import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.join(__dirname, '.env');

try {
  let content = fs.readFileSync(envPath, 'utf8');
  
  if (content.includes('5173CLOUDINARY_CLOUD_NAME')) {
    console.log('Found corrupted line. Fixing...');
    const fixedContent = content.replace(
      '5173CLOUDINARY_CLOUD_NAME', 
      '5173\nCLOUDINARY_CLOUD_NAME'
    );
    
    fs.writeFileSync(envPath, fixedContent);
    console.log('.env file fixed successfully.');
  } else {
    // Regex for "Any non-whitespace character followed immediately by CLOUDINARY_"
    const regex = /([^\s])(CLOUDINARY_)/g;
    if (regex.test(content)) {
        const fixedContent = content.replace(regex, '$1\n$2');
        fs.writeFileSync(envPath, fixedContent);
        console.log('.env file fixed using regex.');
    } else {
        console.log('No corruption detected or pattern mismatch.');
    }
  }
} catch (error) {
  console.error('Error fixing .env:', error);
}
