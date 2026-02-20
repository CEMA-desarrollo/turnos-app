// Script to generate PWA icons from SVG using sharp
// Run: node scripts/generate-icons.js

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const SVG_PATH = path.join(__dirname, '../public/icon.svg');
const OUTPUT_DIR = path.join(__dirname, '../public/icons');

const SIZES = [72, 96, 128, 144, 152, 192, 384, 512];

// Apple splash screen sizes
const APPLE_SPLASH = [
    { width: 1170, height: 2532, name: 'splash-1170x2532' }, // iPhone 12/13 Pro
    { width: 1125, height: 2436, name: 'splash-1125x2436' }, // iPhone X/XS
    { width: 828, height: 1792, name: 'splash-828x1792' }, // iPhone XR
    { width: 750, height: 1334, name: 'splash-750x1334' }, // iPhone 8
];

async function generateIcons() {
    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    const svgBuffer = fs.readFileSync(SVG_PATH);

    // Generate square icons
    for (const size of SIZES) {
        const outputPath = path.join(OUTPUT_DIR, `icon-${size}x${size}.png`);
        await sharp(svgBuffer)
            .resize(size, size)
            .png()
            .toFile(outputPath);
        console.log(`✓ Generated ${size}x${size}`);
    }

    // Apple touch icon (180x180)
    await sharp(svgBuffer)
        .resize(180, 180)
        .png()
        .toFile(path.join(OUTPUT_DIR, 'apple-touch-icon.png'));
    console.log('✓ Generated apple-touch-icon (180x180)');

    // Favicon 32x32
    await sharp(svgBuffer)
        .resize(32, 32)
        .png()
        .toFile(path.join(OUTPUT_DIR, 'favicon-32x32.png'));
    console.log('✓ Generated favicon-32x32');

    // Favicon 16x16
    await sharp(svgBuffer)
        .resize(16, 16)
        .png()
        .toFile(path.join(OUTPUT_DIR, 'favicon-16x16.png'));
    console.log('✓ Generated favicon-16x16');

    // Simple screenshot placeholder (390x844 - iPhone)
    const screenshotBuffer = await sharp({
        create: {
            width: 390,
            height: 844,
            channels: 4,
            background: { r: 3, g: 7, b: 18, alpha: 1 },
        },
    })
        .png()
        .toBuffer();
    fs.writeFileSync(path.join(OUTPUT_DIR, 'screenshot-mobile.png'), screenshotBuffer);
    console.log('✓ Generated screenshot-mobile placeholder');

    console.log('\n✅ All icons generated successfully!');
}

generateIcons().catch(console.error);
