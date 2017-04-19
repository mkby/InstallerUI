#!/usr/bin/env python

import os
import time
import json
from api import *
from flask import request,send_from_directory
import time

############## views ###############
@app.route('/')
def main_page():
    return flask.render_template('index.html')

@app.route('/installPage')
def installPage():
    return flask.render_template('install.html')

@app.route('/example')
def example():
    return flask.render_template('example.html')

# return task list
@app.route('/tasks')
def get_tasks():
    tasks = get_all_install_tasks()
    #return flask.jsonify(tasks), 200
    return json.dumps(tasks), 200

# return task status
@app.route('/tasks/<int:task_id>')
def get_task_by_id(task_id):
    task = get_install_task(task_id)
    if not task:
        flask.abort(404)
    return flask.jsonify(task), 200

# re-run specific install
# if previous task not finished, reject
@app.route('/tasks/<int:task_id>', methods=['PUT'])
def run_install_by_id(task_id):
    ec = perform_install(task_id)
    if ec == EC_PID_EXIST:
        return MSG[EC_PID_EXIST], 400
    if ec == EC_NO_TASK:
        return MSG[EC_NO_TASK], 400
    else:
        return 'success', 201

@app.route('/install', methods=['POST'])
def run_install():
    config_file = flask.request.data
    # need to check if there's error in execute
    th = perform_new_install(config_file)
    dic = {'id': th.id, 'pid': th.pid}
    if th.rc == EC_NO_FILE:
        return MSG[EC_NO_FILE], 400
    else:
        return flask.jsonify(dic), 201

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
            return MSG[EC_NO_FILE], 400
        else:
            pro_file.close()
        fileList.append(properties)
    #print(fileList)
    jsonStr = json.dumps(fileList)
    return jsonStr

#@app.route('/newConfig',methods=['POST','GET'])
@app.route('/newConfig',methods=['POST'])
def newConfig():
    i = flask.request.form.to_dict()
    i["createTime"]=time.strftime('%Y-%m-%d %H:%M:%S',time.localtime(time.time()))+""
    os.chdir(CONFIG_PATH)
    for key in ['traf_start','dcs_ha','offline_mode','ldap_security']:
        if key in i and i.get(key)=="on":
            i[key]="Y"
        else:
            i[key]="N"

    with open(i.get('configureFileName')+'.properties', 'w') as f:
        for key in i.keys():
            f.write(key+"="+i.get(key)+"\n")

    return 'success', 201

# run discover, return node info as string
@app.route('/discover',methods=['POST','GET'])
def run_discover():
    hosts = flask.request.data()
    result = perform_discover(hosts)

    return flask.jsonify(result), 201

@app.route('/queryCheckList',methods=['POST','GET'])
def checkServer():

    l=[{"hostName":"eason-1","ext_interface": "eth0", "python_ver": "2.6.6", "home_dir": "", "pidmax": "65535", "mem_free": "1.4 GB", "cpu_model": "Intel Xeon E312xx (Sandy Bridge)", "cpu_cores": 2, "hadoop_authentication": "simple", "firewall_status": "Stopped", "hive": "OK", "default_java": "/usr/lib/jvm/java-1.8.0-openjdk.x86_64", "linux": "centos-6.7", "rootdisk_free": "20G", "hadoop_security_group_mapping": "SHELL", "traf_status": "Running", "arch": "x86_64", "hbase": "1.2", "mem_total": "7.7 GB"}, {"hostName":"eason-2","ext_interface": "eth0", "python_ver": "2.6.6", "home_dir": "", "pidmax": "65535", "mem_free": "1.3 GB", "cpu_model": "Intel Xeon E312xx (Sandy Bridge)", "cpu_cores": 4, "hadoop_authentication": "simple", "firewall_status": "Stopped", "hive": "OK", "default_java": "/usr/lib/jvm/java-1.8.0-openjdk.x86_64", "linux": "centos-6.7", "rootdisk_free": "14G", "hadoop_security_group_mapping": "SHELL", "traf_status": "Running", "arch": "x86_64", "hbase": "1.2", "mem_total": "7.7 GB"}]
    jsonStr=json.dumps(l)
    return jsonStr


@app.route('/delConfig',methods=['POST'])
def delConfig():
    i = request.form.to_dict()
    fileName=CONFIG_PATH+'/'+i["configureFileName"]+'.properties'
    os.remove(fileName)
    l={"status":"success"}
    jsonStr=json.dumps(l)
    return jsonStr

@app.route('/queryLog',methods=['GET'])
def queryLog():
    logPath = request.args.get('logPath')
    try:
	f=open(logPath,'r')
	strs=f.read()
	l={"log":strs}
	jsonStr = json.dumps(l)
    except:
	l={"log":"read log failed"}
    finally:
	f.close()
    return jsonStr
