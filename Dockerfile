FROM nginx:1.25-alpine3.18

COPY . /usr/share/nginx/html
RUN rm /usr/share/nginx/html/default.conf
COPY ./default.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

# ENTRYPOINT /bin/ash