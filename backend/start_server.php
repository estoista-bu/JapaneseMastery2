<?php
// Set memory limit to 1GB
ini_set('memory_limit', '1G');

// Start Laravel server
$command = 'php artisan serve --host=0.0.0.0 --port=8000';
echo "Starting Laravel server with 1GB memory limit...\n";
echo "Command: $command\n\n";

// Execute the command
passthru($command);
?>

