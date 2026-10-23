# syntax=docker/dockerfile:1

FROM nginx:stable-alpine

ENV NGINX_ENTRYPOINT_LOCAL_RESOLVERS=1

RUN rm /etc/nginx/conf.d/default.conf \
    && chown nginx:nginx /etc/nginx/conf.d

COPY nginx/nginx.conf /etc/nginx/nginx.conf
COPY nginx/default.conf.template /etc/nginx/templates/default.conf.template
COPY public/ /usr/share/nginx/html/
RUN rm -f /usr/share/nginx/html/tests.html /usr/share/nginx/html/tests.js

USER nginx
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s CMD wget -q -O /dev/null http://127.0.0.1:8080/healthz || exit 1
