#!/usr/bin/env python

import os
import json
import sys
import re
import glob
import requests
import threading
import flask
import subprocess

app = flask.Flask(__name__)

task_handlers = [] # global list to save task handlers
count = 0 # global counter

########## constants #############
CONFIG_PATH = app.root_path + '/properties'
WORK_PATH = app.root_path + '/worker'
INSTALLER_PATH = app.root_path + '/installer'
INSTALLER_BIN = INSTALLER_PATH + '/db_install.py'
DISCOVER_BIN = INSTALLER_PATH + '/discovery.py'

# install task return code
RC_INIT = -1
RC_OK = 0
RC_ERROR = 1

# internal error code
EC_PID_EXIST = 1001
EC_NO_FILE   = 1002
EC_NO_TASK   = 1003

MSG = {EC_PID_EXIST: 'Previous task is still running',
       EC_NO_FILE: 'Config file is not found',
       EC_NO_TASK: 'Task id is not found'}

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

########### APIs ###############
class TaskHandler(object):
    def __init__(self):
        self.id = 0
        self.pid = 0
        self.process = 0
        self.status = ''
        self.logFile = ''
        self.stdout = ''
        self.stderr = ''

    def run(self):
        cmd = '%s/fake_install.py' % self.workPath
        p = subprocess.Popen(cmd, stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE, shell=True)
        self.rc = -1
        self.pid = p.pid

        self.stdout, self.stderr = p.communicate()
        self.rc = p.returncode

#    def run(self):
#        if not os.path.exists(self.configFile) or not os.path.exists(self.workPath):
#            self.rc = EC_NO_FILE
#        else:
#            cmd = '%s/db_install.py --config-file %s --silent' % (self.workPath, self.configFile)
#            p = subprocess.Popen(cmd, stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE, shell=True)
#            self.pid = p.pid
#            self.stdout, self.stderr = p.communicate()
#            self.rc = p.returncode

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
    return {'id':      task_handler.id,
            'logfile': task_handler.logFile,
            'process': get_install_process(task_handler),
            'stderr':  task_handler.stderr,
            'status':  get_install_status(task_handler)}

def get_install_task(task_id):
    task_handler = get_handler_by_id(task_id)
    if not task_handler:
        return {}
    else:
        return get_taskdic_by_handler(task_handler)

# get all running install tasks
def get_all_install_tasks():
    tasks = []
    for task_handler in task_handlers:
        tasks.append(get_taskdic_by_handler(task_handler))
    return tasks

def get_install_process(task_handler):
    try:
        with open(task_handler.logFile, 'r') as f:
            logdata = f.read()
    except IOError:
        logdata = ''

    # first process in the list is the latest
    for process in STAGES:
        if process in logdata:
            return int(float(100)/float(len(STAGES))*(len(STAGES)-STAGES.index(process)))

def get_install_status(task_handler):
    if task_handler.rc == RC_INIT and is_process_exist(task_handler.pid):
        return STAT_IN_PROGRESS
    elif task_handler.rc == RC_ERROR  and not is_process_exist(task_handler.pid):
        return STAT_ERROR
    elif task_handler.rc == RC_OK and not is_process_exist(task_handler.pid):
        return STAT_SUCCESS
    else:
        return STAT_UNKNOWN

def perform_install(task_id):
    """ run install on specific task id """
    task_handler = get_handler_by_id(task_id)

    if task_handler:
        if is_process_exist(task_handler.pid):
            return EC_PID_EXIST
        thread = threading.Thread(target=task_handler.run)
        thread.start()
        thread.join(0.1) # async

        # log file name is different for each run, so glob it again
        try:
            task_handler.logFile = glob.glob('%s/logs/install*.log' % task_handler.workPath)[0]
        except IndexError:
            task_handler.logFile = ''

        return task_handler.rc
    else:
        return EC_NO_TASK

def perform_new_install(config_file):
    global count
    # create new task handler here
    task_handler = TaskHandler()

    count += 1
    task_handler.id = count
    task_handler.workPath = '%s/%d' % (WORK_PATH, count)
    task_handler.configFile = '%s/%s' % (CONFIG_PATH, config_file)

    # create work path for each install task
    run_cmd('cp -rf %s %s' % (INSTALLER_PATH, task_handler.workPath))

    # perform install from a new work path
    thread = threading.Thread(target=task_handler.run)
    thread.start()
    thread.join(0.1) # async

    try:
        task_handler.logFile = glob.glob('%s/logs/install*.log' % task_handler.workPath)[0]
    except IndexError:
        task_handler.logFile = ''

    task_handlers.append(task_handler)
    return task_handler

def perform_discover(hosts):
    return run_cmd('%s --hosts %s' % (DISCOVER_BIN, host_list))
