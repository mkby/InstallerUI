#!/usr/bin/env python

import os
import time
import json
from api import *
import time

############## views ###############
@app.route('/')
def mainPage():
    return flask.render_template('index.html')

@app.route('/installPage')
def installPage():
    return flask.render_template('install.html')

# return task list
@app.route('/tasks')
def getTasks():
    tasks = get_all_install_tasks()
    #return flask.jsonify(tasks), 200
    return json.dumps(tasks, indent=2), 200

# return task status
@app.route('/tasks/<int:task_id>')
def getTaskById(task_id):
    task = get_install_task(task_id)
    if not task:
        flask.abort(404)
    return flask.jsonify(task), 200

# re-run specific install
# if previous task not finished, reject
@app.route('/tasks/<int:task_id>', methods=['PUT'])
def runInstallById(task_id):
    ec = perform_by_id(task_id)
    if ec == EC_PID_EXIST:
        return MSG[EC_PID_EXIST], 400
    if ec == EC_NO_TASK:
        return MSG[EC_NO_TASK], 400
    else:
        return MSG[SUCCESS], 201

@app.route('/install', methods=['POST'])
def runInstall():
    config_file = flask.request.data
    # need to check if there's error in execute
    th = perform_new_install(config_file)
    dic = {'id': th.id, 'pid': th.pid}
    if th.rc == EC_NO_FILE:
        return MSG[EC_NO_FILE], 400
    else:
        return flask.jsonify(dic), 201

# run discover, return node info as string
@app.route('/discover',methods=['POST'])
def runDiscover():
    config_file = flask.request.data

    th = perform_new_discover(config_file)
    dic = {'id': th.id, 'pid': th.pid}
    if th.rc == EC_NO_FILE:
        return MSG[EC_NO_FILE], 400
    else:
        return flask.jsonify(dic), 201

@app.route('/newConfig',methods=['POST'])
def newConfig():
    conf = flask.request.form.to_dict()
    rc = save_config(conf)
    if rc == SUCCESS:
        return MSG[SUCCESS], 201
    else:
        return MSG[EC_INT_ERR], 400

@app.route('/queryConfig',methods=['GET'])
def queryConfig():
    arr = get_configs()
    if arr == EC_NO_FILE:
        return MSG[EC_INT_ERR], 400
    else:
        return json.dumps(arr, indent=2), 200

@app.route('/delConfig',methods=['POST'])
def delConfig():
    conf = flask.request.form.to_dict()
    rc = del_config(conf)
    if rc == SUCCESS:
        return MSG[SUCCESS], 201
    else:
        return MSG[EC_INT_ERR], 400

@app.route('/queryLog',methods=['GET'])
def queryLog():
    logPath = flask.request.args.get('logPath')
    dic = get_log(logPath)
    if dic == EC_NO_FILE:
        return MSG[EC_NO_FILE], 400
    else:
        return flask.jsonify(dic), 200

@app.route('/queryCheckList',methods=['POST','GET'])
def checkServer():

    l=[{"hostName":"eason-1","ext_interface": "eth0", "python_ver": "2.6.6", "home_dir": "", "pidmax": "65535", "mem_free": "1.4 GB", "cpu_model": "Intel Xeon E312xx (Sandy Bridge)", "cpu_cores": 2, "hadoop_authentication": "simple", "firewall_status": "Stopped", "hive": "OK", "default_java": "/usr/lib/jvm/java-1.8.0-openjdk.x86_64", "linux": "centos-6.7", "rootdisk_free": "20G", "hadoop_security_group_mapping": "SHELL", "traf_status": "Running", "arch": "x86_64", "hbase": "1.2", "mem_total": "7.7 GB"}, {"hostName":"eason-2","ext_interface": "eth0", "python_ver": "2.6.6", "home_dir": "", "pidmax": "65535", "mem_free": "1.3 GB", "cpu_model": "Intel Xeon E312xx (Sandy Bridge)", "cpu_cores": 4, "hadoop_authentication": "simple", "firewall_status": "Stopped", "hive": "OK", "default_java": "/usr/lib/jvm/java-1.8.0-openjdk.x86_64", "linux": "centos-6.7", "rootdisk_free": "14G", "hadoop_security_group_mapping": "SHELL", "traf_status": "Running", "arch": "x86_64", "hbase": "1.2", "mem_total": "7.7 GB"}]
    jsonStr=json.dumps(l)
    return jsonStr
