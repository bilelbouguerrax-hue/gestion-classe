import fs from 'fs';
import path from 'path';

function replaceInFile(filePath) {
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    content = content.replace(/Coll.*?Pilote.*?Les.*?Oliviers/g, 'Lycée Kalaat El Andalous');
    content = content.replace(/Collège Pilote Les Oliviers/g, 'Lycée Kalaat El Andalous');
    content = content.replace(/Les Oliviers/g, 'Kalaat El Andalous');
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Successfully updated:', filePath);
  }
}

replaceInFile('server/data/database.json');
const backupsDir = 'server/data/backups';
if (fs.existsSync(backupsDir)) {
  fs.readdirSync(backupsDir).forEach(f => replaceInFile(path.join(backupsDir, f)));
}
