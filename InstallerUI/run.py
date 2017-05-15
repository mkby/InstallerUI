#!/usr/bin/env python

import sys
import api, view

try:
    port = sys.argv[1]
except IndexError:
    port = 5000

try:
    api.run_cmd('rm -rf %s/logs/*' % api.INSTALLER_PATH)
    api.app.run(host='0.0.0.0', port=int(port))
    exit(0)
except:
    exit(1)


