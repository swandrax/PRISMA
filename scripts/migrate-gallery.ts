// c:\Users\user\Desktop\prisma\scripts\migrate-gallery.ts
import fs from 'fs';
import path from 'path';

function slugify(filename: string): string {
    return filename
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-') // Replace spaces with -
        .replace(/[^a-z0-9.-]/g, '') // Remove all non-word chars except alphanumeric, dot, and hyphen
        .replace(/-+/g, '-'); // Replace multiple - with single -
}

const galleryDir = path.join(process.cwd(), 'public', 'gallery');

if (!fs.existsSync(galleryDir)) {
    console.log(`Directory ${galleryDir} does not exist. Skipping migration.`);
    process.exit(0);
}

const files = fs.readdirSync(galleryDir);
let renamedCount = 0;

for (const file of files) {
    const sluggedName = slugify(file);
    if (file !== sluggedName) {
        const oldPath = path.join(galleryDir, file);
        const newPath = path.join(galleryDir, sluggedName);
        
        fs.renameSync(oldPath, newPath);
        console.log(`Renamed: "${file}" -> "${sluggedName}"`);
        renamedCount++;
    }
}

console.log(`\nGallery migration complete. Renamed ${renamedCount} files.`);
// Note: If you have existing records in Supabase 'galeri' table pointing to the old URLs, 
// you will need to update them manually via SQL or a similar data script.
