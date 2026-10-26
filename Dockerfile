FROM nginx:1.25-alpine3.18

# Copy in whole directory, then remove files we don't want to serve
COPY . /usr/share/nginx/html
RUN rm /usr/share/nginx/html/default.conf

# Then put individual files in the right place
COPY default.conf /etc/nginx/conf.d/default.conf

EXPOSE 80 443

# ENTRYPOINT /bin/ash
