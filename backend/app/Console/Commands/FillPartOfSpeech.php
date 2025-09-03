<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class FillPartOfSpeech extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'words:fill-pos {--force : Force re-processing of all words}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Fill part_of_speech column using fugashi';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting part_of_speech backfill...');
        
        // Check if Python script exists
        $scriptPath = base_path('scripts/fill_part_of_speech.py');
        if (!file_exists($scriptPath)) {
            $this->error('Python script not found at: ' . $scriptPath);
            return 1;
        }
        
        // Check if fugashi is available
        $this->info('Checking fugashi availability...');
        $fugashiCheck = shell_exec('python -c "import fugashi; print(\"fugashi available\")" 2>&1');
        
        if (strpos($fugashiCheck, 'fugashi available') === false) {
            $this->error('fugashi not available. Please install: pip install fugashi unidic-lite');
            $this->info('This is much easier to install than MeCab on Windows!');
            return 1;
        }
        
        $this->info('✅ fugashi is available');
        
        // Run the Python script
        $this->info('Running Python script...');
        $command = "python " . escapeshellarg($scriptPath);
        
        $output = shell_exec($command . " 2>&1");
        
        if ($output === null) {
            $this->error('Failed to execute Python script');
            return 1;
        }
        
        // Display output
        $this->info($output);
        
        // Check if successful
        if (strpos($output, 'Completed!') !== false) {
            $this->info('✅ Part of speech backfill completed successfully!');
            return 0;
        } else {
            $this->error('❌ Part of speech backfill failed');
            return 1;
        }
    }
}
