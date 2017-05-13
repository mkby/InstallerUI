#!/usr/bin/env python

import sys
import api, view

port = sys.argv[1]
try:
    api.run_cmd('rm -rf %s/logs/*' % api.INSTALLER_PATH)
    api.app.run(host='0.0.0.0', port=int(port))
    exit(0)
except:
    exit(1)


