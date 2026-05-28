// c:\Users\user\Desktop\prisma\src\lib\utils\slugify.ts

export function slugify(filename: string): string {
    return filename
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-') // Replace spaces with -
        .replace(/[^a-z0-9.-]/g, '') // Remove all non-word chars except alphanumeric, dot, and hyphen
        .replace(/-+/g, '-'); // Replace multiple - with single -
}
