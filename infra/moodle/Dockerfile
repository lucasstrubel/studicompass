FROM moodlehq/moodle-php-apache:8.3

ARG MOODLE_BRANCH=MOODLE_405_STABLE

RUN curl -fsSL "https://github.com/moodle/moodle/archive/refs/heads/${MOODLE_BRANCH}.tar.gz" \
    | tar -xz --strip-components=1 -C /var/www/html

COPY config.php /var/www/html/config.php
COPY seed/ /opt/studicompass/seed/
COPY install.sh /opt/studicompass/install.sh
COPY entrypoint-hook.sh /docker-entrypoint.d/20-studicompass.sh

RUN chown -R www-data:www-data /var/www/html /opt/studicompass \
    && chmod +x /opt/studicompass/install.sh
