FROM nginx:1.25-alpine3.18

COPY . /usr/share/nginx/html
RUN rm /usr/share/nginx/html/default.conf
COPY ./default.conf /etc/nginx/conf.d/default.conf
COPY tmiku.net.pem /etc/ssl/certs/tmiku.net.pem
COPY tmiku.net.key /etc/ssl/private/tmiku.net.key

EXPOSE 80 443

# ENTRYPOINT /bin/ash
