from fabric.api import run, local, cd, env

env.hosts = ['nickhs.com']
env.use_ssh_config = True


def prepare_deploy():
    local('git push')
    print "Pushed changes to github"


def deploy():
    with cd('/srv/repinterest'):
        run('git pull')
        run("supervisorctl restart repinterest")


def g():
    prepare_deploy()
    deploy()
