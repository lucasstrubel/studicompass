<?php
// Plays the lecturer: adds a new file to a course so that the change shows up in StudiCompass.
// Usage: php add-upload.php <moduleId> "<title>"

define('CLI_SCRIPT', true);
require('/var/www/html/config.php');
require_once($CFG->libdir . '/filelib.php');
require_once($CFG->libdir . '/testing/generator/lib.php');

[$moduleid, $title] = [$argv[1] ?? 'm-pr2', $argv[2] ?? 'Vorlesung 03: Ausnahmen und Ein-/Ausgabe'];
$course = $DB->get_record('course', ['idnumber' => $moduleid], '*', MUST_EXIST);
$teacher = $DB->get_record('user', ['username' => 'dozentin'], '*', MUST_EXIST);
\core\session\manager::set_user($teacher);

$draftid = file_get_unused_draft_itemid();
get_file_storage()->create_file_from_string([
    'contextid' => context_user::instance($teacher->id)->id,
    'component' => 'user',
    'filearea' => 'draft',
    'itemid' => $draftid,
    'filepath' => '/',
    'filename' => preg_replace('/[^a-z0-9]+/', '-', core_text::strtolower($title)) . '.txt',
], $title . "\n\nBeispieldatei der Hochschul-Sandbox.");

$resource = (new testing_data_generator())->create_module('resource', [
    'course' => $course->id,
    'section' => 1,
    'name' => $title,
    'files' => $draftid,
]);
rebuild_course_cache($course->id, true);
mtrace("added \"{$title}\" to {$moduleid} (cmid {$resource->cmid})");
