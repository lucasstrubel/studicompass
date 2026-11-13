#!/usr/bin/env bash
# Installs Moodle on first start and fills it with the example courses. Safe to run again.
set -euo pipefail

cd /var/www/html

if [ ! -f /var/www/moodledata/.installed ]; then
  echo "[studicompass] installing Moodle"
  php admin/cli/install_database.php \
    --agree-license \
    --lang=en \
    --fullname="Hochschul-Sandbox (StudiCompass)" \
    --shortname="Sandbox" \
    --adminuser=admin \
    --adminpass="${MOODLE_ADMIN_PASSWORD}" \
    --adminemail=admin@hochschule.example
  touch /var/www/moodledata/.installed
fi

if [ ! -f /var/www/moodledata/.seeded ]; then
  echo "[studicompass] seeding example courses"
  php /opt/studicompass/seed/seed.php
  touch /var/www/moodledata/.seeded
fi

echo "[studicompass] ready at ${MOODLE_WWWROOT}"
