# Sourced by the image's entrypoint before Apache starts.
chown www-data:www-data /var/www/moodledata
runuser -u www-data -- bash /opt/studicompass/install.sh
