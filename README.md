# Repinterest

A weekend project, placing reddit content in the quintessential Pinterest layout.

Been done like 20 times before, as original as sliced bread..

Up at: [rp.nickhs.com](http://rp.nickhs.com)

Built on:
 - Flask
 - Redis
 - Backbone
 - jQuery

# Deployment

1) Install Redis

    sudo apt-get install redis-server
    # or whatever is platform specific for you

2) Install python requirements

    sudo pip install -r requirements.txt
    # or use a virtualenv

3)

    python main.py

## For nick

NB: If you're nick and looking back at this, you
have a fabfile. Just do `fab g` to deploy.

# TODO

* Fix CSS on displaying large images so they fit on the screen.
* Infinite scroll
