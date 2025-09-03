<?php

$filePath = '../data/n5-words.ts';
$content = file_get_contents($filePath);

echo "File content preview:\n";
echo substr($content, 0, 200) . "\n\n";

echo "Looking for pattern: export const n5Words = [...\n";
if (preg_match('/export const n5Words = \[(.*?)\];/s', $content, $matches)) {
    echo "Pattern found!\n";
    echo "Words section preview: " . substr($matches[1], 0, 200) . "\n";
} else {
    echo "Pattern not found\n";
    
    // Try different patterns
    echo "Trying alternative patterns:\n";
    
    if (preg_match('/export const \w+Words = \[(.*?)\];/s', $content, $matches)) {
        echo "Generic pattern found!\n";
    } else {
        echo "Generic pattern not found\n";
    }
    
    if (preg_match('/n5Words = \[(.*?)\];/s', $content, $matches)) {
        echo "Simple pattern found!\n";
    } else {
        echo "Simple pattern not found\n";
    }
}

