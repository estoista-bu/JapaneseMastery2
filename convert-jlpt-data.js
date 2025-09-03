#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔄 Converting JLPT word files to JSON format...\n');

// Function to convert a TypeScript file to JSON
function convertTsToJson(filePath, outputPath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Extract the array from the TypeScript file
        // Look for patterns like: export const n5Words: VocabularyWord[] = [ ... ]
        const match = content.match(/export\s+const\s+\w+:\s*\w+\[\]\s*=\s*(\[[\s\S]*\]);/);
        
        if (!match) {
            console.log(`❌ Could not parse array from ${filePath}`);
            return false;
        }
        
        // Parse the array
        const wordsArray = eval(match[1]);
        
        // Transform the data to match our database schema
        const transformedWords = wordsArray.map(word => ({
            japanese: word.japanese || '',
            reading: word.reading || '',
            english: word.meaning || word.english || '',
            jlpt_level: word.jlpt || getJlptLevelFromFilename(filePath),
            part_of_speech: word.part_of_speech || word.type || '',
            example_sentence: word.example_sentence || word.sentence || null
        }));
        
        // Write to JSON file
        fs.writeFileSync(outputPath, JSON.stringify(transformedWords, null, 2));
        
        console.log(`✅ Converted ${filePath} -> ${outputPath} (${transformedWords.length} words)`);
        return true;
        
    } catch (error) {
        console.log(`❌ Error converting ${filePath}: ${error.message}`);
        return false;
    }
}

// Function to extract JLPT level from filename
function getJlptLevelFromFilename(filePath) {
    const filename = path.basename(filePath);
    if (filename.includes('n5')) return 'N5';
    if (filename.includes('n4')) return 'N4';
    if (filename.includes('n3')) return 'N3';
    if (filename.includes('n2')) return 'N2';
    if (filename.includes('n1')) return 'N1';
    return null;
}

// Convert all JLPT word files
const filesToConvert = [
    'data/n5-words.ts',
    'data/n4-words.ts',
    'data/n3-words.ts',
    'data/n2-words.ts',
    'data/n1-words.ts'
];

let successCount = 0;
let totalWords = 0;

filesToConvert.forEach(filePath => {
    if (fs.existsSync(filePath)) {
        const outputPath = filePath.replace('.ts', '.json');
        const success = convertTsToJson(filePath, outputPath);
        if (success) {
            successCount++;
            const content = fs.readFileSync(outputPath, 'utf8');
            const words = JSON.parse(content);
            totalWords += words.length;
        }
    } else {
        console.log(`⚠️  File not found: ${filePath}`);
    }
});

console.log(`\n🎉 Conversion complete!`);
console.log(`✅ Successfully converted ${successCount} files`);
console.log(`📊 Total words: ${totalWords}`);

console.log(`\n📝 To import the words into the database, run:`);
console.log(`   php artisan jlpt:import data/n5-words.json --deck=jlpt-n5`);
console.log(`   php artisan jlpt:import data/n4-words.json --deck=jlpt-n4`);
console.log(`   php artisan jlpt:import data/n3-words.json --deck=jlpt-n3`);
console.log(`   php artisan jlpt:import data/n2-words.json --deck=jlpt-n2`);
console.log(`   php artisan jlpt:import data/n1-words.json --deck=jlpt-n1`); 