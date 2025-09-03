<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\UserProfile;
use Carbon\Carbon;

class UserProfileSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $jlptLevels = ['N5', 'N4', 'N3', 'N2', 'N1', 'None'];
        
        $studyReasons = [
            'I want to work in Japan',
            'I love Japanese culture and anime',
            'I plan to study abroad in Japan',
            'For business opportunities',
            'I enjoy learning new languages',
            'I want to understand Japanese media better',
            'For travel and communication',
            'I have Japanese friends/family',
            'For academic research',
            'Personal interest and challenge'
        ];

        $firstNames = [
            'John', 'Jane', 'Michael', 'Sarah', 'David', 'Emily', 'James', 'Jessica',
            'Robert', 'Amanda', 'William', 'Ashley', 'Richard', 'Stephanie', 'Joseph',
            'Nicole', 'Thomas', 'Elizabeth', 'Christopher', 'Helen', 'Charles', 'Deborah',
            'Daniel', 'Rachel', 'Matthew', 'Carolyn', 'Anthony', 'Janet', 'Mark', 'Catherine',
            'Donald', 'Maria', 'Steven', 'Heather', 'Paul', 'Diane', 'Andrew', 'Ruth',
            'Joshua', 'Julie', 'Kenneth', 'Joyce', 'Kevin', 'Virginia', 'Brian', 'Victoria',
            'George', 'Kelly', 'Timothy', 'Lauren', 'Ronald', 'Christine', 'Jason', 'Joan',
            'Edward', 'Evelyn', 'Jeffrey', 'Olivia', 'Ryan', 'Judith', 'Jacob', 'Megan',
            'Gary', 'Cheryl', 'Nicholas', 'Martha', 'Eric', 'Andrea', 'Jonathan', 'Frances',
            'Stephen', 'Hannah', 'Larry', 'Jacqueline', 'Justin', 'Ann', 'Scott', 'Gloria',
            'Brandon', 'Jean', 'Benjamin', 'Kathryn', 'Samuel', 'Alice', 'Gregory', 'Teresa',
            'Frank', 'Sara', 'Raymond', 'Janice', 'Alexander', 'Doris', 'Patrick', 'Julia',
            'Jack', 'Marie', 'Dennis', 'Madison', 'Jerry', 'Grace', 'Tyler', 'Judy',
            'Aaron', 'Theresa', 'Jose', 'Beverly', 'Adam', 'Denise', 'Nathan', 'Marilyn',
            'Henry', 'Amber', 'Douglas', 'Danielle', 'Zachary', 'Rose', 'Peter', 'Brittany',
            'Kyle', 'Diana', 'Walter', 'Natalie', 'Ethan', 'Sophia', 'Jeremy', 'Alexis',
            'Harold', 'Lori', 'Carl', 'Kayla', 'Keith', 'Jane', 'Roger', 'Alexandra',
            'Gerald', 'Sharon', 'Eugene', 'Michelle', 'Arthur', 'Carol', 'Terry', 'Paula',
            'Lawrence', 'Emma', 'Sean', 'Joan', 'Christian', 'Ashley', 'Ethan', 'Grace',
            'Andrew', 'Amanda', 'Nathan', 'Samantha', 'Mark', 'Doris', 'Donald', 'Stephanie'
        ];

        $lastNames = [
            'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
            'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson',
            'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson',
            'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker',
            'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores',
            'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell',
            'Carter', 'Roberts', 'Gomez', 'Phillips', 'Evans', 'Turner', 'Diaz', 'Parker',
            'Cruz', 'Edwards', 'Collins', 'Reyes', 'Stewart', 'Morris', 'Morales', 'Murphy',
            'Cook', 'Rogers', 'Gutierrez', 'Ortiz', 'Morgan', 'Cooper', 'Peterson', 'Bailey',
            'Reed', 'Kelly', 'Howard', 'Ramos', 'Kim', 'Cox', 'Ward', 'Richardson', 'Watson',
            'Brooks', 'Chavez', 'Wood', 'James', 'Bennett', 'Gray', 'Mendoza', 'Ruiz', 'Hughes',
            'Price', 'Alvarez', 'Castillo', 'Sanders', 'Patel', 'Myers', 'Long', 'Ross',
            'Foster', 'Jimenez', 'Powell', 'Jenkins', 'Perry', 'Russell', 'Sullivan', 'Bell',
            'Coleman', 'Butler', 'Henderson', 'Barnes', 'Gonzales', 'Fisher', 'Vasquez',
            'Simmons', 'Romero', 'Jordan', 'Patterson', 'Alexander', 'Hamilton', 'Graham',
            'Reynolds', 'Griffin', 'Wallace', 'Moreno', 'West', 'Cole', 'Hayes', 'Bryant',
            'Herrera', 'Gibson', 'Ellis', 'Tran', 'Medina', 'Aguilar', 'Stevens', 'Murray',
            'Ford', 'Castro', 'Marshall', 'Owens', 'Harrison', 'Fernandez', 'Mcdonald',
            'Woods', 'Washington', 'Kennedy', 'Wells', 'Vargas', 'Henry', 'Chen', 'Freeman',
            'Webb', 'Tucker', 'Guzman', 'Burns', 'Crawford', 'Olson', 'Simpson', 'Porter',
            'Hunter', 'Gordon', 'Mendez', 'Silva', 'Shaw', 'Snyder', 'Mason', 'Dixon',
            'Munoz', 'Hunt', 'Hicks', 'Holmes', 'Palmer', 'Wagner', 'Black', 'Robertson',
            'Boyd', 'Rose', 'Stone', 'Salazar', 'Fox', 'Warren', 'Mills', 'Meyer', 'Rice',
            'Schmidt', 'Garza', 'Daniels', 'Ferguson', 'Nichols', 'Stephens', 'Soto', 'Weaver',
            'Ryan', 'Gardner', 'Payne', 'Grant', 'Dunn', 'Kelley', 'Spencer', 'Hawkins',
            'Arnold', 'Pierce', 'Vazquez', 'Hansen', 'Peters', 'Santos', 'Hart', 'Bradley',
            'Knight', 'Elliott', 'Cunningham', 'Duncan', 'Armstrong', 'Hudson', 'Carroll',
            'Lane', 'Riley', 'Andrews', 'Alvarado', 'Ray', 'Delgado', 'Berry', 'Perkins',
            'Hoffman', 'Johnston', 'Matthews', 'Pena', 'Richards', 'Contreras', 'Willis',
            'Carpenter', 'Lawrence', 'Sandoval', 'Guerrero', 'George', 'Chapman', 'Rios',
            'Estrada', 'Ortega', 'Watkins', 'Greene', 'Nunez', 'Wheeler', 'Valdez', 'Harper',
            'Burke', 'Larson', 'Santiago', 'Maldonado', 'Morrison', 'Franklin', 'Carlson',
            'Austin', 'Dominguez', 'Carr', 'Lawson', 'Jacobs', 'Obrien', 'Lynch', 'Singh',
            'Vega', 'Bishop', 'Montgomery', 'Oliver', 'Jensen', 'Harvey', 'Williamson',
            'Gilbert', 'Dean', 'Sims', 'Espinoza', 'Howell', 'Li', 'Wong', 'Reid', 'Hanson',
            'Le', 'Mccoy', 'Garrett', 'Burton', 'Fuller', 'Castillo', 'Sutton', 'Johnston',
            'Meyer', 'Mcdaniel', 'Waters', 'Kirby', 'Kline', 'Ballard', 'Todd', 'Carr',
            'Schwartz', 'Steele', 'Ibarra', 'Orr', 'Leach', 'Combs', 'Petty', 'Hester',
            'Cantrell', 'Daugherty', 'Cherry', 'Bray', 'Davila', 'Rowland', 'Levine',
            'Madden', 'Spence', 'Good', 'Irwin', 'Werner', 'Krause', 'Petty', 'Mccullough',
            'Hester', 'Daugherty', 'Cherry', 'Bray', 'Davila', 'Rowland', 'Levine',
            'Madden', 'Spence', 'Good', 'Irwin', 'Werner', 'Krause', 'Petty', 'Mccullough'
        ];

        // Get all users that don't have profiles yet
        $users = User::whereDoesntHave('profile')->get();

        foreach ($users as $user) {
            // Generate random age between 16 and 65
            $age = rand(16, 65);
            
            // Generate random date of birth based on age
            $dateOfBirth = Carbon::now()->subYears($age)->subDays(rand(0, 365));
            
            // Split username into first and last name if possible
            $nameParts = explode(' ', $user->username);
            $firstName = $nameParts[0] ?? $firstNames[array_rand($firstNames)];
            $lastName = $nameParts[1] ?? $lastNames[array_rand($lastNames)];

            UserProfile::create([
                'user_id' => $user->id,
                'profile_picture' => null, // Will be handled by frontend
                'first_name' => $firstName,
                'last_name' => $lastName,
                'email' => $user->email,
                'age' => $age,
                'date_of_birth' => $dateOfBirth,
                'jlpt_level' => $jlptLevels[array_rand($jlptLevels)],
                'why_study_japanese' => $studyReasons[array_rand($studyReasons)],
            ]);
        }
    }
}
