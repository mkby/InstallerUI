#!/usr/bin/env python

import os
import json
import sys
import re
import glob
import flask
import requests
import threading
import subprocess
from flask import request
import time
task_handlers = [] # global list to save task handlers
count = 0 # global counter
app = flask.Flask(__name__)

CONFIG_PATH=app.root_path+'/properties'
WORKER_PATH = app.root_path + '/worker'
INSTALLER_PATH = os.path.join(app.root_path, 'installer')
DISCOVER_BIN = os.path.join(app.root_path, 'discovery.py')

STAT_IN_PROGRESS = 'IN_PROGRESS'
STAT_SUCCESS = 'SUCCESS'
STAT_ERROR = 'ERROR'
STAT_UNKNOWN = 'UNKNOWN'

STAGES = ['install End',
          'traf_start',
          'dbmgr_setup',
          'traf_sqconfig',
          'hdfs_cmds',
          'apache_mods',
          'hadoop_mods',
          'dcs_setup',
          'traf_setup',
          'traf_package',
          'traf_dep',
          'traf_user',
          'copy_files',
          'traf_check',
          'traf_license',
          'install Start']

class TaskHandler(object):
    def __init__(self):
        self.id = 0
        self.pid = 0
        self.process = 0
        self.rc = -1
        self.status = ''
        self.logfile = ''

    def run(self, cmd):
        p = subprocess.Popen(cmd, stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE, shell=True)
        self.pid = p.pid
        self.stdout, self.stderr = p.communicate()
        self.rc = p.returncode

def run_cmd(cmd):
    """ check command return value and return stdout """
    p = subprocess.Popen(cmd, stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE, shell=True)
    stdout, stderr = p.communicate()
    return stdout

def is_process_exist(pid):
    return run_cmd("ps -ef|awk '{print $2}' |grep -o %s" % pid)

# get all running install tasks
def get_all_install_tasks():
    tasks = []
    for task_handler in task_handlers:
        process = get_install_process(task_handler)
        status = get_install_status(task_handler)
        task_dic = {'id': task_handler.id,
                    'process': process,
                    'status': status}
        tasks.append(task_dic)
    return tasks

def get_install_process(task_handler):
    try:
        with open(task_handler.logfile, 'r') as f:
            logdata = f.read()
    except IOError:
        logdata = ''

    # first process in the list is the latest
    for process in STAGES:
        if process in logdata:
            return int(float(100)/float(len(STAGES))*(len(STAGES)-STAGES.index(process)))

def get_install_status(task_handler):
    if task_handler.rc == -1 and is_process_exist(task_handler.pid):
        return STAT_IN_PROGRESS
    elif task_handler.rc == 1 and not is_process_exist(task_handler.pid):
        return STAT_ERROR
    elif task_handler.rc == 0 and not is_process_exist(task_handler.pid):
        return STAT_SUCCESS
    else:
        return STAT_UNKNOWN

def perform_install(config_file):
    global count
    # create new task handler here
    task_handler = TaskHandler()

    count += 1
    task_handler.path = '%s/%d' % (WORKER_PATH, count)
    task_handler.id = count

    # create work path for each install task
    run_cmd('cp -rf %s %s' % (INSTALLER_PATH, task_handler.path))

    # perform install from a new work path
    #cmd = '%s/db_install.py --config-file %s --silent' % (task_handler.path, config_file)
    cmd = '%s/fake_install.py' % task_handler.path
    thread = threading.Thread(target=task_handler.run, args=(cmd,))
    thread.start()
    thread.join(0.1) # async

    try:
        task_handler.logfile = glob.glob('%s/logs/install*.log' % task_handler.path)[0]
    except IndexError:
        task_handler.logfile = ''

    task_handlers.append(task_handler)
    return task_handler

def perform_discover(hosts):
    pass

############## views ###############
@app.route('/')
def main_page():
    return flask.render_template('index.html')

# return task status
@app.route('/tasks/<int:task_id>')
def get_task_by_id(task_id):
    tasks = get_all_install_tasks()
    task = [t for t in tasks if t['id'] == task_id]
    if not task:
        flask.abort(404)
    return flask.jsonify(task[0]), 200

# re-run specific install
# if previous task not finished, reject
@app.route('/tasks/<int:task_id>', methods=['PUT'])
def run_install_by_id():
    pass

# return task list
@app.route('/tasks')
def get_tasks():
    tasks = get_all_install_tasks()
    #return flask.jsonify(tasks), 200
    return json.dumps(tasks), 200

@app.route('/install', methods=['POST'])
def run_install():
    config_file = flask.request.data
    # need to check if there's error in execute
    th = perform_install(config_file)
    dic = {'id': th.id, 'pid':th.pid}
    return flask.jsonify(dic), 201


# run discover, return node info as string
@app.route('/discover')
def run_discover():
    return app.root_path


@app.route('/index')
def index():
    return flask.render_template('index.html')

@app.route('/installPage')
def installPage():
    return flask.render_template('install.html')

@app.route('/queryConfig',methods=['GET'])
def queryConfig():
    os.chdir(CONFIG_PATH)
    fileList=[]
    files = os.listdir(CONFIG_PATH)
    for fl in files:
        try:
            pro_file = open(CONFIG_PATH+"/"+fl, 'r')
            properties = {}
            for line in pro_file:
                if line.find('=') > 0:
                    strs = line.replace('\n', '').split('=')
                    properties[strs[0]] = strs[1]
        except Exception, e:
            raise e
        else:
            pro_file.close()
        fileList.append(properties)
    #print(fileList)
    jsonStr = json.dumps(fileList)
    return jsonStr


@app.route('/newConfig',methods=['POST','GET'])
def newConfig():
    i = request.form.to_dict()
    print(i)
    i["createTime"]=time.strftime('%Y-%m-%d %H:%M:%S',time.localtime(time.time()))+""
    os.chdir(CONFIG_PATH)
    for key in ['traf_start','dcs_ha','offline_mode','ldap_security']:
        if key in i and i.get(key)=="on":
            i[key]="Y"
        else:
            i[key]="N"
    with open(i.get('configureFileName')+'.properties', 'w') as f:
            f.write("[dbconfigs]")
            for key in i.keys():
                f.write(key+"="+i.get(key)+"\n")
    return 'success'


@app.route('/queryCheckList',methods=['POST','GET'])
def checkServer():

    l=[{"hostName":"eason-1","ext_interface": "eth0", "python_ver": "2.6.6", "home_dir": "", "pidmax": "65535", "mem_free": "1.4 GB", "cpu_model": "Intel Xeon E312xx (Sandy Bridge)", "cpu_cores": 2, "hadoop_authentication": "simple", "firewall_status": "Stopped", "hive": "OK", "default_java": "/usr/lib/jvm/java-1.8.0-openjdk.x86_64", "linux": "centos-6.7", "rootdisk_free": "20G", "hadoop_security_group_mapping": "SHELL", "traf_status": "Running", "arch": "x86_64", "hbase": "1.2", "mem_total": "7.7 GB"}, {"hostName":"eason-2","ext_interface": "eth0", "python_ver": "2.6.6", "home_dir": "", "pidmax": "65535", "mem_free": "1.3 GB", "cpu_model": "Intel Xeon E312xx (Sandy Bridge)", "cpu_cores": 4, "hadoop_authentication": "simple", "firewall_status": "Stopped", "hive": "OK", "default_java": "/usr/lib/jvm/java-1.8.0-openjdk.x86_64", "linux": "centos-6.7", "rootdisk_free": "14G", "hadoop_security_group_mapping": "SHELL", "traf_status": "Running", "arch": "x86_64", "hbase": "1.2", "mem_total": "7.7 GB"}]
    jsonStr=json.dumps(l)
    return jsonStr

@app.route('/delConfig',methods=['POST'])
def delConfig():
    i = request.form.to_dict();
    fileName=CONFIG_PATH+'/'+i["configureFileName"]+'.properties'
    os.remove(fileName)
    l={"status":"success"}
    jsonStr=json.dumps(l)
    return jsonStr


if __name__ == '__main__':
    run_cmd('rm -rf %s/*' % WORKER_PATH)
    #app.run(host='0.0.0.0')
    app.run(host='0.0.0.0', debug=True)
