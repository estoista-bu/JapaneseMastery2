<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\DB;

echo "Words table constraints:\n";
$constraints = DB::select("SHOW INDEX FROM words WHERE Key_name LIKE '%unique%';");

foreach($constraints as $c) {
    echo $c->Key_name . ' - ' . $c->Column_name . "\n";
}

echo "\nAll indexes on words table:\n";
$allIndexes = DB::select("SHOW INDEX FROM words;");

foreach($allIndexes as $index) {
    echo $index->Key_name . ' - ' . $index->Column_name . "\n";
}

