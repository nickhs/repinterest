FROM alpine

RUN apk update
RUN apk add alpine-sdk
RUN apk add redis
RUN apk add python
RUN apk add python-dev
RUN apk add py-pip

RUN mkdir -p /var/run/
RUN mkdir -p /srv/repinterest/

COPY ops/redis.conf /srv/redis.conf

COPY ./requirements.txt /srv/repinterest/requirements.txt
RUN pip install -r /srv/repinterest/requirements.txt

COPY ./reddits.txt /srv/repinterest/
COPY static /srv/repinterest/static
COPY templates /srv/repinterest/templates
COPY settings.py /srv/repinterest/
COPY main.py /srv/repinterest/

EXPOSE 80
WORKDIR /srv/repinterest

# eww
CMD sh -c "redis-server /srv/redis.conf; ENV=prod gunicorn main:app -w 2 -b 0.0.0.0:80 --access-logfile - --error-logfile -"
