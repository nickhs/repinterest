class Config(object):
    DEBUG = False
    SECRET_KEY = "dsadasdnasnllnasknslakdladnslkadnskldnalkdnsaldnskakaslnkndkanksldnkaddsanklkansdknldasnkl"
    HOST = "0.0.0.0"
    PORT = 5000


class DevelopmentConfig(Config):
    REDIS_HOST = "localhost"
    REDIS_PORT = 6379
    DB = 0
    DEBUG = True
    PORT = 8085


class ProductionConfig(Config):
    DEBUG = False
