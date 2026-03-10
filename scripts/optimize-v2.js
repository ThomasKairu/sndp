import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const INPUT_DIR = path.resolve(__dirname, '../public/v2');
const OUTPUT_DIR = path.resolve(__dirname, '../public/v2/optimized');

const WIDTHS = [320, 640, 768, 1024, 1280, 1920];

async function optimizeImages() {
  try {
    // Ensure output directory exists
    await fs.mkdir(OUTPUT_DIR, { recursive: true });

    const files = await fs.readdir(INPUT_DIR);
    const imageFiles = files.filter(file => 
      /\.(webp|jpg|jpeg|png)$/i.test(file) && 
      !file.includes('-') // Avoid re-optimizing already processed files if any
    );

    console.log(`Found ${imageFiles.length} images to optimize.`);

    for (const file of imageFiles) {
      const inputPath = path.join(INPUT_DIR, file);
      const filename = path.parse(file).name;

      console.log(`Optimizing ${file}...`);

      for (const width of WIDTHS) {
        const outputFilename = `${filename}-${width}w.webp`;
        const outputPath = path.join(OUTPUT_DIR, outputFilename);

        // Check if original is smaller than target width
        const metadata = await sharp(inputPath).metadata();
        if (metadata.width && metadata.width >= width) {
          await sharp(inputPath)
            .resize(width)
            .webp({ quality: 80 })
            .toFile(outputPath);
        } else if (metadata.width) {
           // If original is smaller, just convert to webp at original size
           await sharp(inputPath)
            .webp({ quality: 80 })
            .toFile(outputPath);
        }
      }

      // Also create a default webp (original size but optimized)
      await sharp(inputPath)
        .webp({ quality: 80 })
        .toFile(path.join(OUTPUT_DIR, `${filename}.webp`));
    }

    console.log('Optimization complete!');
  } catch (error) {
    console.error('Error optimizing images:', error);
  }
}

optimizeImages();
