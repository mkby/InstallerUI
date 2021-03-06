#!/usr/bin/python

import time
import sys
import os
import random

txt = '''
[2017-04-10 16:18:00,437 INFO]:  install Start
[2017-04-10 16:18:03,142 INFO]: Script [traf_license.py] ran successfully!
[2017-04-10 16:18:03,815 INFO]: Host [eason-2]: Script [traf_check.py]: 
[2017-04-10 16:18:03,816 INFO]: Host [eason-2]: Script [traf_check.py] ran successfully!
[2017-04-10 16:18:03,855 INFO]: Host [eason-1]: Script [traf_check.py]: 
[2017-04-10 16:18:03,856 INFO]: Host [eason-1]: Script [traf_check.py] ran successfully!
[2017-04-10 16:18:07,190 INFO]: Script [copy_files.py] ran successfully!
[2017-04-10 16:18:10,367 INFO]: Host [eason-1]: Script [traf_user.py]: Setup trafodion user successfully!

[2017-04-10 16:18:10,367 INFO]: Host [eason-1]: Script [traf_user.py] ran successfully!
[2017-04-10 16:18:10,441 INFO]: Host [eason-2]: Script [traf_user.py]: Setup trafodion user successfully!

[2017-04-10 16:18:10,442 INFO]: Host [eason-2]: Script [traf_user.py] ran successfully!
[2017-04-10 16:19:00,014 INFO]: Host [eason-1]: Script [traf_dep.py]: Package apr had already been installed
Package apr-util had already been installed
Package expect had already been installed
Package gzip had already been installed
Installing gnuplot ...
Package libiodbc-devel had already been installed
Package lzo had already been installed
Package lzop had already been installed
Package pdsh had already been installed
Package perl-DBD-SQLite had already been installed
Package perl-Params-Validate had already been installed
Package perl-Time-HiRes had already been installed
Package protobuf had already been installed
Package sqlite had already been installed
Package snappy had already been installed
Package unixODBC-devel had already been installed
Package unzip had already been installed

[2017-04-10 16:19:00,015 INFO]: Host [eason-1]: Script [traf_dep.py] ran successfully!
[2017-04-10 16:20:19,454 INFO]: Host [eason-2]: Script [traf_dep.py]: Package apr had already been installed
Package apr-util had already been installed
Package expect had already been installed
Package gzip had already been installed
Installing gnuplot ...
Package libiodbc-devel had already been installed
Package lzo had already been installed
Package lzop had already been installed
Package pdsh had already been installed
Package perl-DBD-SQLite had already been installed
Package perl-Params-Validate had already been installed
Package perl-Time-HiRes had already been installed
Package protobuf had already been installed
Package sqlite had already been installed
Package snappy had already been installed
Package unixODBC-devel had already been installed
Package unzip had already been installed

[2017-04-10 16:20:19,455 INFO]: Host [eason-2]: Script [traf_dep.py] ran successfully!
[2017-04-10 16:20:31,089 INFO]: Host [eason-1]: Script [traf_package.py]: Trafodion package extracted successfully!

[2017-04-10 16:20:31,090 INFO]: Host [eason-1]: Script [traf_package.py] ran successfully!
[2017-04-10 16:20:31,854 INFO]: Host [eason-2]: Script [traf_package.py]: Trafodion package extracted successfully!

[2017-04-10 16:20:31,854 INFO]: Host [eason-2]: Script [traf_package.py] ran successfully!
[2017-04-10 16:20:35,898 INFO]: Host [eason-1]: Script [traf_setup.py]: 
[2017-04-10 16:20:35,899 INFO]: Host [eason-1]: Script [traf_setup.py] ran successfully!
[2017-04-10 16:20:35,971 INFO]: Host [eason-2]: Script [traf_setup.py]: 
[2017-04-10 16:20:35,971 INFO]: Host [eason-2]: Script [traf_setup.py] ran successfully!
[2017-04-10 16:20:37,880 INFO]: Host [eason-2]: Script [dcs_setup.py]: 
[2017-04-10 16:20:37,880 INFO]: Host [eason-2]: Script [dcs_setup.py] ran successfully!
[2017-04-10 16:20:37,883 INFO]: Host [eason-1]: Script [dcs_setup.py]: 
[2017-04-10 16:20:37,883 INFO]: Host [eason-1]: Script [dcs_setup.py] ran successfully!
[2017-04-10 16:23:54,364 INFO]: Script [hadoop_mods.py] ran successfully!
[2017-04-10 16:24:12,999 INFO]: Host [eason-1]: Script [hdfs_cmds.py]: 
[2017-04-10 16:24:13,000 INFO]: Host [eason-1]: Script [hdfs_cmds.py] ran successfully!
[2017-04-10 16:24:41,819 INFO]: Host [eason-1]: Script [traf_sqconfig.py]: sqconfig generated successfully!
sqgen ran successfully!

[2017-04-10 16:24:41,820 INFO]: Host [eason-1]: Script [traf_sqconfig.py] ran successfully!
[2017-04-10 16:24:46,613 INFO]: Host [eason-2]: Script [dbmgr_setup.py]: 
[2017-04-10 16:24:46,613 INFO]: Host [eason-2]: Script [dbmgr_setup.py] ran successfully!
[2017-04-10 16:25:10,247 INFO]: Host [eason-1]: Script [dbmgr_setup.py]: 
[2017-04-10 16:25:10,248 INFO]: Host [eason-1]: Script [dbmgr_setup.py] ran successfully!
[2017-04-10 16:28:10,514 INFO]: Host [eason-1]: Script [traf_start.py]: Starting trafodion
Initialize trafodion
Start trafodion successfully.

[2017-04-10 16:28:10,515 INFO]: Host [eason-1]: Script [traf_start.py] ran successfully!
[2017-04-10 16:18:00,437 INFO]:  install End
'''

path = os.path.dirname(os.path.abspath(__file__))
t = time.time()
logfile = sys.argv[1]
for line in txt.split('\n'):
    os.system('echo %s >> %s' % (line, logfile))
    time.sleep(0.3)

#print 'finish1!'
if random.randint(1,2) % 2:
    sys.stderr.write('get error')
    exit(1)
else:
    exit(0)
