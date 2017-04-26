#!/usr/bin/env python

from InstallerUI import api, view

api.run_cmd('rm -rf %s/logs/*' % api.INSTALLER_PATH)
api.app.run(host='0.0.0.0', debug=True)


