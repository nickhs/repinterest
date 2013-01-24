from flask import Flask, render_template, jsonify
import requests
import redis
import pickle
import settings
import os

WHITELIST = ['jpg', 'png', 'gif', 'jpeg']

app = Flask(__name__)

if os.environ.get('ENV') == 'PROD':
    app.config.from_object(settings.ProductionConfig)
else:
    app.config.from_object(settings.DevelopmentConfig)

print app.config

cache = redis.StrictRedis(host=app.config['REDIS_HOST'],
                          port=app.config['REDIS_PORT'],
                          db=app.config['DB'])

global reddit_list


@app.route('/')
def main():
    return render_template('index.html', sc=None)


@app.route('/d')
def subreddit_list():
    return jsonify({'data': reddit_list})


@app.route('/r/<subreddit>')
def data(subreddit):
    data = cache.get(subreddit)

    if data is not None:
        print "Cache hit"
        return jsonify({"data": pickle.loads(data)})

    url = "http://reddit.com/r/%s.json" % subreddit
    resp = requests.get(url)
    print "Cache miss"

    if resp.ok:
        items = resp.json['data']['children']
        clean = []

        for item in items:
            url = item['data']['url']

            for w in WHITELIST:
                if w in url:
                    break
            else:
                if 'imgur.com' in url and '/a/' in url:
                    continue
                elif 'imgur.com' in url:
                    tid = url.split('/')[-1]
                    url = "http://i.imgur.com/%s.jpg" % tid
                else:
                    continue

            if subreddit == 'pics' and item['data']['over_18']:
                continue

            clean.append({
                'id': item['data']['id'],
                'url': url,
                'link': item['data']['permalink'],
                'author': item['data']['author'],
                'title': item['data']['title']
            })

    cache.setex(subreddit, 600, pickle.dumps(clean))
    return jsonify({"data": clean})


@app.route('/<path:sc>')
def shortcut(sc):
    return render_template('index.html', sc=sc)

if __name__ == '__main__':
    f = open(app.config['REDDIT_LIST'])
    data = f.read()
    global reddit_list
    reddit_list = data.split('\n')[:-1]

    app.run(host=app.config['HOST'], port=app.config['PORT'])
