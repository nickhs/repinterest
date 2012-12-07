from tornado.wsgi import WSGIContainer
from tornado.httpserver import HTTPServer
from tornado.ioloop import IOLoop
from app import main

http_server = HTTPServer(WSGIContainer(main))
http_server.listen(main.app.config['PORT'])
IOLoop.instance().start()
