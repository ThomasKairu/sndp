import sharp from 'sharp';
import { readdirSync, statSync, mkdirSync, existsSync } from 'fs';
import { join, extname, basename } from 'path';

const PUBLIC_DIR = './public';
const OPTIMIZED_DIR = './public/optimized';

// Image extensions to process
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png'];

// Quality settings
const JPEG_QUALITY = 80;
const WEBP_QUALITY = 80;
const MAX_WIDTH = 1920; // Max width for images

async function optimizeImage(inputPath, outputDir) {
    const filename = basename(inputPath);
    const ext = extname(inputPath).toLowerCase();
    const nameWithoutExt = basename(inputPath, ext);

    try {
        const image = sharp(inputPath);
        const metadata = await image.metadata();

        // Calculate new dimensions (maintain aspect ratio)
        let width = metadata.width;
        let height = metadata.height;

        if (width > MAX_WIDTH) {
            height = Math.round((MAX_WIDTH / width) * height);
            width = MAX_WIDTH;
        }

        // Create optimized JPEG/PNG
        const optimizedPath = join(outputDir, filename);
        if (ext === '.png') {
            await sharp(inputPath)
                .resize(width, height)
                .png({ quality: JPEG_QUALITY, compressionLevel: 9 })
                .toFile(optimizedPath);
        } else {
            await sharp(inputPath)
                .resize(width, height)
                .jpeg({ quality: JPEG_QUALITY, progressive: true })
                .toFile(optimizedPath);
        }

        // Create WebP version
        const webpPath = join(outputDir, `${nameWithoutExt}.webp`);
        await sharp(inputPath)
            .resize(width, height)
            .webp({ quality: WEBP_QUALITY })
            .toFile(webpPath);

        // Get file sizes for comparison
        const originalSize = statSync(inputPath).size;
        const optimizedSize = statSync(optimizedPath).size;
        const webpSize = statSync(webpPath).size;

        const savedPercent = Math.round((1 - optimizedSize / originalSize) * 100);
        const webpSavedPercent = Math.round((1 - webpSize / originalSize) * 100);

        console.log(`✓ ${filename}`);
        console.log(`  Original: ${(originalSize / 1024 / 1024).toFixed(2)} MB`);
        console.log(`  Optimized: ${(optimizedSize / 1024).toFixed(0)} KB (${savedPercent}% smaller)`);
        console.log(`  WebP: ${(webpSize / 1024).toFixed(0)} KB (${webpSavedPercent}% smaller)`);
        console.log('');

    } catch (error) {
        console.error(`✗ Error processing ${filename}:`, error.message);
    }
}

async function main() {
    console.log('🖼️  Image Optimization Script\n');
    console.log('================================\n');

    // Create optimized directory if it doesn't exist
    if (!existsSync(OPTIMIZED_DIR)) {
        mkdirSync(OPTIMIZED_DIR, { recursive: true });
    }

    // Get all images in public directory
    const files = readdirSync(PUBLIC_DIR);
    const imageFiles = files.filter(file => {
        const ext = extname(file).toLowerCase();
        const filePath = join(PUBLIC_DIR, file);
        return IMAGE_EXTENSIONS.includes(ext) && statSync(filePath).isFile();
    });

    console.log(`Found ${imageFiles.length} images to optimize\n`);

    for (const file of imageFiles) {
        const inputPath = join(PUBLIC_DIR, file);
        await optimizeImage(inputPath, OPTIMIZED_DIR);
    }

    console.log('================================');
    console.log('✅ Optimization complete!');
    console.log(`\nOptimized images saved to: ${OPTIMIZED_DIR}`);
    console.log('\nNext steps:');
    console.log('1. Replace original images with optimized versions');
    console.log('2. Update code to use .webp format where possible');
}

main().catch(console.error);
