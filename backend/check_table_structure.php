<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\DB;

echo "Words table structure:\n";
$columns = DB::select("DESCRIBE words;");

foreach($columns as $column) {
    echo $column->Field . ' - ' . $column->Type . "\n";
}

