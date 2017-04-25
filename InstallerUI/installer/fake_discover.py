#!/usr/bin/python

import time
import sys
import os
import random

txt = '''
[2017-04-25 09:55:23,335 INFO]:  ***** discover Start *****
[2017-04-25 09:55:30,487 INFO]: Host [eason-1]: Script [traf_discover.py]: {"ext_interface": "eth0", "python_ver": "2.6.6", "home_dir": "", "pidmax": "65535", "mem_free": "1.0 GB", "cpu_model": "Intel Xeon E312xx (Sandy Bridge)", "cpu_cores": 2, "hadoop_authentication": "simple", "firewall_status": "Stopped", "hive": "OK", "default_java": "/usr/lib/jvm/java-1.8.0-openjdk.x86_64", "linux": "centos-6.7", "rootdisk_free": "19G", "hadoop_security_group_mapping": "SHELL", "traf_status": "Running", "arch": "x86_64", "hbase": "1.2", "mem_total": "7.7 GB"}

[2017-04-25 09:55:30,488 INFO]: Host [eason-1]: Script [traf_discover.py] ran successfully!
[2017-04-25 09:55:31,034 INFO]: Host [eason-2]: Script [traf_discover.py]: {"ext_interface": "eth0", "python_ver": "2.6.6", "home_dir": "", "pidmax": "65535", "mem_free": "0.3 GB", "cpu_model": "Intel Xeon E312xx (Sandy Bridge)", "cpu_cores": 4, "hadoop_authentication": "simple", "firewall_status": "Stopped", "hive": "OK", "default_java": "/usr/lib/jvm/java-1.8.0-openjdk.x86_64", "linux": "centos-6.7", "rootdisk_free": "12G", "hadoop_security_group_mapping": "SHELL", "traf_status": "Running", "arch": "x86_64", "hbase": "1.2", "mem_total": "7.7 GB"}

[2017-04-25 09:55:31,035 INFO]: Host [eason-2]: Script [traf_discover.py] ran successfully!
[2017-04-25 09:55:32,335 INFO]:  ***** discover End *****
'''
path = os.path.dirname(os.path.abspath(__file__))
t = time.time()
os.system('rm -rf %s/logs/discover*.log' % path)
for line in txt.split('\n'):
    os.system('echo %s >> %s/logs/discover_%s.log' % (line, path, t))
    time.sleep(0.2)

#print 'finish1!'
if random.randint(1,2) % 2:
    sys.stderr.write('get error')
    exit(1)
else:
    print '[{"ext_interface": "eth0", "hbase": "1.2", "python_ver": "2.6.6", "traf_status": "Running", "mem_free": "1.0 GB", "hostname": "eason-1", "home_dir": "", "cpu_cores": 2, "cpu_model": "Intel Xeon E312xx (Sandy Bridge)", "firewall_status": "Stopped", "hive": "OK", "default_java": "/usr/lib/jvm/java-1.8.0-openjdk.x86_64", "linux": "centos-6.7", "rootdisk_free": "19G", "hadoop_security_group_mapping": "SHELL", "hadoop_authentication": "simple", "arch": "x86_64", "pidmax": "65535", "mem_total": "7.7 GB"}, {"ext_interface": "eth0", "hbase": "1.2", "python_ver": "2.6.6", "traf_status": "Running", "mem_free": "0.3 GB", "hostname": "eason-2", "home_dir": "", "cpu_cores": 4, "cpu_model": "Intel Xeon E312xx (Sandy Bridge)", "firewall_status": "Stopped", "hive": "OK", "default_java": "/usr/lib/jvm/java-1.8.0-openjdk.x86_64", "linux": "centos-6.7", "rootdisk_free": "12G", "hadoop_security_group_mapping": "SHELL", "hadoop_authentication": "simple", "arch": "x86_64", "pidmax": "65535", "mem_total": "7.7 GB"}]'
    exit(0)
