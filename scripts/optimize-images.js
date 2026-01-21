import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const OPTIMIZED_DIR = path.join(PUBLIC_DIR, 'optimized');

// Image configurations
const SIZES = [320, 640, 768, 1024, 1280, 1920];
const QUALITY = 82; // Good balance between quality and file size

// Images that need optimization (from Lighthouse report)
const PRIORITY_IMAGES = [
    'carousel1.webp',
    'carousel2.webp',
    'carousel3.webp',
    'carousel4.webp',
    'carousel5.webp',
    'carousel6.webp',
    'carousel7.webp',
    'Sagana Makutano Plots.webp',
    'Prime half Acre in Kiharu.webp',
    "1 Acre at Mang'u.webp"
];

async function ensureDir(dir) {
    try {
        await fs.access(dir);
    } catch {
        await fs.mkdir(dir, { recursive: true });
    }
}

async function getImageDimensions(imagePath) {
    const metadata = await sharp(imagePath).metadata();
    return { width: metadata.width, height: metadata.height };
}

async function optimizeImage(imageName) {
    const inputPath = path.join(PUBLIC_DIR, imageName);
    const outputDir = path.join(OPTIMIZED_DIR, path.dirname(imageName));

    try {
        // Check if file exists
        await fs.access(inputPath);
    } catch {
        console.log(`⚠️  Skipping ${imageName} (not found)`);
        return;
    }

    await ensureDir(outputDir);

    const { width: originalWidth, height: originalHeight } = await getImageDimensions(inputPath);
    const baseName = path.basename(imageName, path.extname(imageName));

    console.log(`🖼️  Processing ${imageName} (${originalWidth}x${originalHeight})`);

    // Generate responsive sizes
    for (const size of SIZES) {
        if (size > originalWidth) continue; // Don't upscale

        const outputPath = path.join(outputDir, `${baseName}-${size}w.webp`);
        const aspectRatio = originalHeight / originalWidth;
        const targetHeight = Math.round(size * aspectRatio);

        await sharp(inputPath)
            .resize(size, targetHeight, {
                fit: 'cover',
                position: 'center'
            })
            .webp({ quality: QUALITY, effort: 6 })
            .toFile(outputPath);

        const stats = await fs.stat(outputPath);
        console.log(`   ✓ ${size}w (${Math.round(stats.size / 1024)}KB)`);
    }

    // Also create an optimized version at original size
    const optimizedOriginalPath = path.join(outputDir, `${baseName}.webp`);
    await sharp(inputPath)
        .webp({ quality: QUALITY, effort: 6 })
        .toFile(optimizedOriginalPath);

    const originalStats = await fs.stat(inputPath);
    const optimizedStats = await fs.stat(optimizedOriginalPath);
    const savings = ((originalStats.size - optimizedStats.size) / originalStats.size * 100).toFixed(1);

    console.log(`   ✓ Original optimized: ${Math.round(optimizedStats.size / 1024)}KB (${savings}% reduction)\n`);
}

async function main() {
    console.log('🚀 Starting image optimization...\n');

    await ensureDir(OPTIMIZED_DIR);

    for (const imageName of PRIORITY_IMAGES) {
        await optimizeImage(imageName);
    }

    console.log('✅ Image optimization complete!');
    console.log(`📁 Optimized images saved to: ${OPTIMIZED_DIR}`);
    console.log('\n💡 Next steps:');
    console.log('   1. Review optimized images');
    console.log('   2. Replace original images with optimized versions');
    console.log('   3. Update image references to use srcset for responsive images');
}

main().catch(console.error);
