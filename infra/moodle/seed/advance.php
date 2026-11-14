<?php
// Plays the lecturer once: a new file, a new announcement and a grade, so that StudiCompass has
// something to detect on its next sync. Safe to run again; it only acts the first time.

define('CLI_SCRIPT', true);
require('/var/www/html/config.php');
require_once($CFG->libdir . '/filelib.php');
require_once($CFG->libdir . '/testing/generator/lib.php');
require_once($CFG->dirroot . '/mod/forum/lib.php');
require_once($CFG->dirroot . '/mod/assign/locallib.php');

$marker = $CFG->dataroot . '/.advanced';
if (file_exists($marker)) {
    mtrace('already advanced');
    exit(0);
}

$teacher = $DB->get_record('user', ['username' => 'dozentin'], '*', MUST_EXIST);
$niklas = $DB->get_record('user', ['username' => 'niklas'], '*', MUST_EXIST);
\core\session\manager::set_user($teacher);
$generator = new testing_data_generator();

// 1. New lecture file in Programmierung 2.
$pr2 = $DB->get_record('course', ['idnumber' => 'm-pr2'], '*', MUST_EXIST);
$draftid = file_get_unused_draft_itemid();
get_file_storage()->create_file_from_string([
    'contextid' => context_user::instance($teacher->id)->id,
    'component' => 'user',
    'filearea' => 'draft',
    'itemid' => $draftid,
    'filepath' => '/',
    'filename' => 'pr2-vorlesung-03.txt',
], "Vorlesung 03: Ausnahmen und Ein-/Ausgabe\n\nBeispieldatei der Hochschul-Sandbox.");
$generator->create_module('resource', [
    'course' => $pr2->id,
    'section' => 1,
    'name' => 'Vorlesung 03: Ausnahmen und Ein-/Ausgabe',
    'files' => $draftid,
]);
rebuild_course_cache($pr2->id, true);

// 2. New announcement in Datenmanagement.
$dm = $DB->get_record('course', ['idnumber' => 'm-dm'], '*', MUST_EXIST);
$generator->get_plugin_generator('mod_forum')->create_discussion([
    'course' => $dm->id,
    'forum' => forum_get_course_forum($dm->id, 'news')->id,
    'userid' => $teacher->id,
    'name' => 'Zusatztermin zur Klausurvorbereitung',
    'message' => 'Am Donnerstag, 28.01.2027, 16 Uhr gibt es einen Zusatztermin in Raum A 108. Wir besprechen die Probeklausur.',
]);

// 3. Grade for the Pflichtübung in Webbasierte Systeme.
$web = $DB->get_record('course', ['idnumber' => 'm-web'], '*', MUST_EXIST);
$instance = $DB->get_record('assign', ['course' => $web->id], '*', MUST_EXIST);
$cm = get_coursemodule_from_instance('assign', $instance->id, $web->id, false, MUST_EXIST);
$assign = new assign(context_module::instance($cm->id), $cm, $web);
$grade = $assign->get_user_grade($niklas->id, true);
$grade->grade = 8.0;
$grade->grader = $teacher->id;
$assign->update_grade($grade);

touch($marker);
mtrace('advanced: new file (m-pr2), new announcement (m-dm), grade (m-web)');
