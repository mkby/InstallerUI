#!/usr/bin/env python

import os
import json
import sys
import time
import re
import glob
import threading
import subprocess
import flask

app = flask.Flask(__name__)

task_handlers = [] # global list to save task handlers
count = 0 # global counter

########## constants #############
CONFIG_PATH = app.root_path + '/properties'
INSTALLER_PATH = app.root_path + '/installer'

TYPE_INSTALL = 'Install'
TYPE_DISCOVER = 'Discover'

# task return code
RC_INIT = -1
RC_OK = 0
RC_ERROR = 1

# internal return code and msg
SUCCESS      = 1000
EC_PID_EXIST = 1001
EC_NO_FILE   = 1002
EC_NO_TASK   = 1003
EC_INT_ERR   = 1004

MSG = {SUCCESS: 'Success',
       EC_PID_EXIST: 'Previous task is still running',
       EC_NO_FILE: 'File not found',
       EC_NO_TASK: 'Task id not found',
       EC_INT_ERR: 'Internal error'}

STAT_IN_PROGRESS = 'IN_PROGRESS'
STAT_SUCCESS = 'SUCCESS'
STAT_ERROR = 'ERROR'
STAT_UNKNOWN = 'UNKNOWN'

STAGES = [' End',
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
          ' Start']

########### APIs ###############
class TaskHandler(object):
    def __init__(self):
        self.id = 0       # task id
        self.pid = 0      # task running pid
        self.process = 0  # task progress
        self.status = ''  # task return status
        self.logFile = '' # log file location
        self.stdout = ''
        self.stderr = ''  # task error msg
        self.type = ''    # install or discover
        self.startTime = ''
        self.configFileName = ''

    def run(self):
            self.rc = -1
#        if not os.path.exists(self.configFilePath) or not os.path.exists(self.workPath):
#            self.rc = EC_NO_FILE
#        else:
            if self.type == TYPE_INSTALL:
                cmd = '%s/db_install.py --config-file %s --log-file %s --silent' % (INSTALLER_PATH, self.configFilePath, self.logFile)
#                cmd = '%s/fake_install.py' % self.workPath
            elif self.type == TYPE_DISCOVER:
                cmd = '%s/fake_discover.py' % INSTALLER_PATH
                #cmd = '%s/discovery.py -j --config-file %s' % (self.workPath, self.configFilePath)
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

def get_handler_by_id(task_id):
    task_handler = None
    for th in task_handlers:
        if th.id == task_id:
            task_handler = th
    return task_handler

def get_taskdic_by_handler(task_handler):
    status = get_status(task_handler)
    process = get_process(task_handler)
    if status == STAT_ERROR:
        process = 100
    return {'id':        task_handler.id,
            'logfile':   task_handler.logFile,
            'name':      task_handler.configFileName,
            'starttime': task_handler.startTime,
            'type':      task_handler.type,
            'status':    status,
            'process':   process,
            'stdout':    task_handler.stdout,
            'stderr':    task_handler.stderr}

def get_task(task_id):
    task_handler = get_handler_by_id(task_id)
    if not task_handler:
        return {}
    else:
        return get_taskdic_by_handler(task_handler)

# get all running install tasks
def get_all_tasks():
    tasks = []
    for task_handler in task_handlers:
        tasks.append(get_taskdic_by_handler(task_handler))
    return tasks

def get_process(task_handler):
    try:
        with open(task_handler.logFile, 'r') as f:
            logdata = f.read()
    except IOError:
        logdata = ''

    # first process in the list is the latest
    for process in STAGES:
        if process in logdata:
            return int(float(100)/float(len(STAGES))*(len(STAGES)-STAGES.index(process)))


def get_status(task_handler):
    if task_handler.rc == RC_INIT and is_process_exist(task_handler.pid):
        return STAT_IN_PROGRESS
    elif task_handler.rc == RC_ERROR  and not is_process_exist(task_handler.pid):
        return STAT_ERROR
    elif task_handler.rc == RC_OK and not is_process_exist(task_handler.pid):
        return STAT_SUCCESS
    else:
        return STAT_UNKNOWN

def get_current_time():
    return time.strftime('%Y-%m-%d %H:%M:%S')

def perform_by_id(task_id):
    """ re-run install/discover on specific task id """
    task_handler = get_handler_by_id(task_id)

    if task_handler:
        if is_process_exist(task_handler.pid):
            return EC_PID_EXIST
        thread = threading.Thread(target=task_handler.run)
        thread.start()
        thread.join(0.1) # async

        return task_handler.rc
    else:
        return EC_NO_TASK

def perform(task_type, config_file):
    global count
    # create new task handler here
    task_handler = TaskHandler()

    count += 1
    task_handler.id = count
    task_handler.type = task_type
    task_handler.configFileName = config_file
    task_handler.configFilePath = '%s/%s.properties' % (CONFIG_PATH, config_file)
    task_handler.startTime = get_current_time()
    task_handler.logFile = '%s/logs/%s_task%s_%s.log' % (INSTALLER_PATH, task_handler.type, count, time.strftime('%y%m%d_%H%M'))

    # perform task
    thread = threading.Thread(target=task_handler.run)
    thread.start()
    thread.join(0.1) # async

    task_handlers.append(task_handler)

    return task_handler

def perform_new_install(config_file):
    return perform(TYPE_INSTALL, config_file)

def perform_new_discover(config_file):
    return perform(TYPE_DISCOVER, config_file)

def get_log(log_file):
    try:
        with open(log_file, 'r') as f:
            strs = f.read()
            dic = {'log' : strs}
        return dic
    except IOError:
        return EC_NO_FILE

def get_configs():
    configs = []
    if not os.path.exists(CONFIG_PATH):
        os.mkdir(CONFIG_PATH)

    files = os.listdir(CONFIG_PATH)
    for fl in files:
        try:
            with open(CONFIG_PATH+"/"+fl, 'r') as f:
                properties = {}
                for line in f:
                    if line.find('=') > 0:
                        strs = line.replace('\n', '').split('=')
                        properties[strs[0]] = strs[1]
        except IOError:
            return EC_NO_FILE
        configs.append(properties)
    return configs

def del_config(conf):
    try:
        config_file = '%s/%s.properties' % (CONFIG_PATH, conf['configFileName'])
        os.remove(config_file)
        return SUCCESS
    except:
        return EC_INT_ERR

def save_config(conf):
    try:
        config_file = '%s/%s.properties' % (CONFIG_PATH, conf['configFileName'])

        conf['createTime'] = get_current_time()
        for key in ['traf_start','dcs_ha','offline_mode','ldap_security']:
            if conf.has_key(key) and conf[key] == 'on':
                conf[key] = 'Y'
            else:
                conf[key] = 'N'
        with open(config_file, 'w') as f:
            f.write('[dbconfigs]\n')
            for key in conf.keys():
                if conf[key]:
                    f.write(key + '=' + conf[key] + '\n')
        return SUCCESS
    except:
        return EC_INT_ERR
