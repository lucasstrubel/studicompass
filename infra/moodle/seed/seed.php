<?php
// Fills the sandbox with the example courses of Niklas' current semester.
// All people, dates and contents are invented; the course idnumber is the moduleId of the app.

define('CLI_SCRIPT', true);
require('/var/www/html/config.php');
require_once($CFG->libdir . '/testing/generator/lib.php');
require_once($CFG->libdir . '/completionlib.php');
require_once($CFG->dirroot . '/course/lib.php');
require_once($CFG->dirroot . '/mod/forum/lib.php');

\core\session\manager::set_user(get_admin());
$generator = new testing_data_generator();
$system = context_system::instance();
$zone = new DateTimeZone('Europe/Berlin');

function at(string $local): int {
    global $zone;
    return (new DateTime($local, $zone))->getTimestamp();
}

function draft_file(string $filename, string $content): int {
    global $USER;
    $draftid = file_get_unused_draft_itemid();
    get_file_storage()->create_file_from_string([
        'contextid' => context_user::instance($USER->id)->id,
        'component' => 'user',
        'filearea' => 'draft',
        'itemid' => $draftid,
        'filepath' => '/',
        'filename' => $filename,
    ], $content);
    return $draftid;
}

// --- Web services -----------------------------------------------------------------------------
set_config('enablewebservices', 1);
set_config('webserviceprotocols', 'rest');
set_config('enablemobilewebservice', 1);
set_config('enablecompletion', 1);
$service = $DB->get_record('external_services', ['shortname' => 'moodle_mobile_app'], '*', MUST_EXIST);
$DB->set_field('external_services', 'enabled', 1, ['id' => $service->id]);
$userrole = $DB->get_record('role', ['shortname' => 'user'], '*', MUST_EXIST);
assign_capability('webservice/rest:use', CAP_ALLOW, $userrole->id, $system->id, true);
assign_capability('moodle/webservice:createtoken', CAP_ALLOW, $userrole->id, $system->id, true);

// --- People -----------------------------------------------------------------------------------
$password = getenv('SEED_USER_PASSWORD');
$niklas = $generator->create_user([
    'username' => 'niklas',
    'password' => $password,
    'firstname' => 'Niklas',
    'lastname' => 'Brandt',
    'email' => 'niklas.brandt@stud.hochschule.example',
    'idnumber' => '3012458',
    'timezone' => 'Europe/Berlin',
]);
$teacher = $generator->create_user([
    'username' => 'dozentin',
    'password' => $password,
    'firstname' => 'Jana',
    'lastname' => 'Hartwig',
    'email' => 'jana.hartwig@hochschule.example',
    'timezone' => 'Europe/Berlin',
]);

$token = \core_external\util::generate_token(EXTERNAL_TOKEN_PERMANENT, $service, $niklas->id, $system);
$DB->set_field('external_tokens', 'token', getenv('SEED_STUDENT_TOKEN'), ['token' => $token]);

// --- Courses ----------------------------------------------------------------------------------
// sheets: [label, count, completed by Niklas]; the first sheet is due on $firstdue, then weekly.
$courses = [
    [
        'idnumber' => 'm-pr2', 'shortname' => 'PR2-WS26', 'fullname' => 'Programmierung 2',
        'sheets' => ['Übungsblatt', 12, 5], 'firstdue' => '2026-10-25 23:59',
        'files' => [
            ['Vorlesung 01: Vererbung und Polymorphie', 'pr2-vorlesung-01.txt'],
            ['Vorlesung 02: Generics und Collections', 'pr2-vorlesung-02.txt'],
        ],
        'news' => ['Klausurtermin Programmierung 2', 'Die Klausur findet am 08.02.2027 um 09:00 Uhr statt. Abmeldungen sind bis 26.01.2027 im POS möglich.'],
    ],
    [
        'idnumber' => 'm-dm', 'shortname' => 'DM-WS26', 'fullname' => 'Datenmanagement',
        'sheets' => ['Übungsblatt', 12, 11], 'firstdue' => '2026-10-25 23:59',
        'files' => [
            ['Skript Datenmanagement', 'dm-skript.txt'],
            ['Probeklausur', 'dm-probeklausur.txt'],
        ],
        'news' => ['Probeklausur verfügbar', 'Die Probeklausur steht im Abschnitt Klausurvorbereitung bereit.'],
    ],
    [
        'idnumber' => 'm-web', 'shortname' => 'WEB-WS26', 'fullname' => 'Webbasierte Systeme',
        'sheets' => ['Pflichtübung', 1, 1], 'firstdue' => '2026-12-20 23:59',
        'files' => [['Folien HTTP und REST', 'web-folien-http.txt']],
        'news' => ['Feedback zur Pflichtübung', 'Das Feedback zur Pflichtübung ist online.'],
    ],
    [
        'idnumber' => 'm-bwl2', 'shortname' => 'BWL2-WS26', 'fullname' => 'Betriebswirtschaftslehre 2',
        'sheets' => ['Übung', 10, 9], 'firstdue' => '2026-11-01 23:59',
        'files' => [['Foliensatz Kostenrechnung', 'bwl2-kostenrechnung.txt']],
        'news' => null,
    ],
    [
        'idnumber' => 'm-wi3', 'shortname' => 'WI3-WS26', 'fullname' => 'Wirtschaftsinformatik 3',
        'sheets' => ['Pflichtübung', 6, 4], 'firstdue' => '2026-11-15 23:59', 'intervaldays' => 19,
        'files' => [['Foliensatz Geschäftsprozesse', 'wi3-geschaeftsprozesse.txt']],
        'news' => ['Pflichtübung 5', 'Pflichtübung 5 ist bis 31.01.2027 abzugeben.'],
    ],
];

$assigngenerator = $generator->get_plugin_generator('mod_assign');
$forumgenerator = $generator->get_plugin_generator('mod_forum');

foreach ($courses as $spec) {
    $course = $generator->create_course([
        'idnumber' => $spec['idnumber'],
        'shortname' => $spec['shortname'],
        'fullname' => $spec['fullname'],
        'summary' => 'Beispielkurs der Hochschul-Sandbox. Alle Inhalte sind erfunden.',
        'format' => 'topics',
        'numsections' => 3,
        'startdate' => at('2026-10-01 00:00'),
        'enddate' => at('2027-02-28 23:59'),
        'enablecompletion' => 1,
    ]);
    course_update_section($course, $DB->get_record('course_sections', ['course' => $course->id, 'section' => 1]), ['name' => 'Vorlesung']);
    course_update_section($course, $DB->get_record('course_sections', ['course' => $course->id, 'section' => 2]), ['name' => 'Übungen']);
    course_update_section($course, $DB->get_record('course_sections', ['course' => $course->id, 'section' => 3]), ['name' => 'Klausurvorbereitung']);

    $generator->enrol_user($niklas->id, $course->id, 'student');
    $generator->enrol_user($teacher->id, $course->id, 'editingteacher');

    foreach ($spec['files'] as [$name, $filename]) {
        $generator->create_module('resource', [
            'course' => $course->id,
            'section' => str_contains($name, 'Probeklausur') ? 3 : 1,
            'name' => $name,
            'files' => draft_file($filename, $name . "\n\nBeispieldatei der Hochschul-Sandbox."),
        ]);
    }

    [$label, $count, $done] = $spec['sheets'];
    $first = at($spec['firstdue']);
    $interval = ($spec['intervaldays'] ?? 7) * DAYSECS;
    $completion = new completion_info($course);
    for ($i = 1; $i <= $count; $i++) {
        $due = $count === 6 && $i === 5 ? at('2027-01-31 23:59') : $first + ($i - 1) * $interval;
        $assign = $assigngenerator->create_instance([
            'course' => $course->id,
            'section' => 2,
            'name' => $count === 1 ? $label : sprintf('%s %d', $label, $i),
            'intro' => 'Abgabe als Datei oder Text. Bestanden zählt als Teil der Prüfungsvorleistung.',
            'allowsubmissionsfromdate' => $due - 14 * DAYSECS,
            'duedate' => $due,
            'grade' => 10,
            'assignsubmission_onlinetext_enabled' => 1,
            'assignsubmission_file_enabled' => 1,
            'submissiondrafts' => 0,
            'completion' => COMPLETION_TRACKING_AUTOMATIC,
            'completionsubmit' => 1,
        ]);
        if ($i <= $done) {
            $cm = get_coursemodule_from_instance('assign', $assign->id, $course->id, false, MUST_EXIST);
            $assigngenerator->create_submission([
                'userid' => $niklas->id,
                'cmid' => $cm->id,
                'onlinetext' => 'Lösung zu ' . $assign->name,
            ]);
            $completion->update_state($cm, COMPLETION_COMPLETE, $niklas->id, true);
        }
    }

    if ($spec['news']) {
        $forum = forum_get_course_forum($course->id, 'news');
        $forumgenerator->create_discussion([
            'course' => $course->id,
            'forum' => $forum->id,
            'userid' => $teacher->id,
            'name' => $spec['news'][0],
            'message' => $spec['news'][1],
        ]);
    }

    rebuild_course_cache($course->id, true);
    mtrace('seeded ' . $spec['idnumber']);
}

purge_all_caches();
mtrace('seed complete');
