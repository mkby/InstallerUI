#!/usr/bin/env python

import os
import json
from api import *

############## views ###############
@app.route('/')
def main_page():
    return flask.render_template('index.html')

@app.route('/installPage')
def installPage():
    return flask.render_template('install.html')

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

@app.route('/newConfig',methods=['POST','GET'])
def newConfig():
    i = request.form.to_dict()
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

    return 'success'

# run discover, return node info as string
@app.route('/discover',methods=['POST','GET'])
def run_discover():
    hosts = request.data()
    result = perform_discover(hosts)

    return flask.jsonify(result), 201