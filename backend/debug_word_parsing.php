<?php

$filePath = '../data/n5-words.ts';
$content = file_get_contents($filePath);

// Extract the words array from the TS file
if (preg_match('/export const n5Words:.*?= \[(.*?)\];/s', $content, $matches)) {
    $wordsSection = $matches[1];
    
    // Parse the words using regex
    preg_match_all('/\{[^}]+\}/', $wordsSection, $wordMatches);
    
    if (!empty($wordMatches[0])) {
        $wordString = $wordMatches[0][0];
        echo "First word string:\n";
        echo $wordString . "\n\n";
        
        // Test regex patterns
        preg_match('/id:\s*"([^"]+)"/', $wordString, $idMatch);
        preg_match('/japanese:\s*"([^"]+)"/', $wordString, $japaneseMatch);
        preg_match('/reading:\s*"([^"]+)"/', $wordString, $readingMatch);
        preg_match('/meaning:\s*"([^"]+)"/', $wordString, $meaningMatch);
        
        echo "Regex results:\n";
        echo "ID: " . ($idMatch ? $idMatch[1] : 'NOT FOUND') . "\n";
        echo "Japanese: " . ($japaneseMatch ? $japaneseMatch[1] : 'NOT FOUND') . "\n";
        echo "Reading: " . ($readingMatch ? $readingMatch[1] : 'NOT FOUND') . "\n";
        echo "Meaning: " . ($meaningMatch ? $meaningMatch[1] : 'NOT FOUND') . "\n";
        
        // Try different regex patterns for meaning
        echo "\nTrying different meaning patterns:\n";
        preg_match('/meaning:\s*"([^"]+)"/', $wordString, $meaningMatch2);
        echo "Pattern 1: " . ($meaningMatch2 ? $meaningMatch2[1] : 'NOT FOUND') . "\n";
        
        preg_match('/meaning:\s*"([^"]*?)"/', $wordString, $meaningMatch3);
        echo "Pattern 2: " . ($meaningMatch3 ? $meaningMatch3[1] : 'NOT FOUND') . "\n";
        
        preg_match('/meaning:\s*"([^"]*?)"/s', $wordString, $meaningMatch4);
        echo "Pattern 3: " . ($meaningMatch4 ? $meaningMatch4[1] : 'NOT FOUND') . "\n";
    }
}

