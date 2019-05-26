import store from '@/store/'

export const SuiteService = {
  getSuites() {
    // https://github.com/kinow/cylc-cassettes/tree/master/cassettes/five/suite.yaml
    const suites = [
        {
          "id": "kinow/five",
          "name": "five",
          "host": "kinow-VirtualBox",
          "owner": "kinow",
          "port": 43027
        }
      ]
    ;
    return store.dispatch('suites/setSuites', suites);
  },
  getSuiteTasks() {
    // https://github.com/kinow/cylc-cassettes/tree/master/cassettes/five/tasks-?.yaml
    const tasks = [
      [],
      [],
      {
        "data": {
          "workflows": [{
            "id": "kinow/five",
            "owner": "kinow",
            "name": "five",
            "host": "ranma",
            "port": 43006,
            "tasks": [{
              "id": "kinow/five/prep",
              "name": "prep",
              "meta": {"title": "", "description": "", "URL": ""},
              "meanElapsedTime": 0.0,
              "namespace": ["root", "prep"],
              "proxies": [{"id": "kinow/five/20130808T0000Z/prep"}]
            }, {
              "id": "kinow/five/foo",
              "name": "foo",
              "meta": {"title": "", "description": "", "URL": ""},
              "meanElapsedTime": 0.0,
              "namespace": ["root", "foo"],
              "proxies": [{"id": "kinow/five/20130808T0000Z/foo"}]
            }, {
              "id": "kinow/five/bar",
              "name": "bar",
              "meta": {"title": "", "description": "", "URL": ""},
              "meanElapsedTime": 0.0,
              "namespace": ["root", "bar"],
              "proxies": [{"id": "kinow/five/20130808T0000Z/bar"}]
            }]
          }]
        }
      },
      {
        "data": {
          "workflows": [{
            "id": "kinow/five",
            "owner": "kinow",
            "name": "five",
            "host": "ranma",
            "port": 43006,
            "tasks": [{
              "id": "kinow/five/prep",
              "name": "prep",
              "meta": {"title": "", "description": "", "URL": ""},
              "meanElapsedTime": 1.0,
              "namespace": ["root", "prep"],
              "proxies": []
            }, {
              "id": "kinow/five/foo",
              "name": "foo",
              "meta": {"title": "", "description": "", "URL": ""},
              "meanElapsedTime": 1.0,
              "namespace": ["root", "foo"],
              "proxies": [{"id": "kinow/five/20130808T0000Z/foo"}, {"id": "kinow/five/20130808T1200Z/foo"}]
            }, {
              "id": "kinow/five/bar",
              "name": "bar",
              "meta": {"title": "", "description": "", "URL": ""},
              "meanElapsedTime": 0.0,
              "namespace": ["root", "bar"],
              "proxies": [{"id": "kinow/five/20130808T0000Z/bar"}]
            }]
          }]
        }
      },
      {
        "data": {
          "workflows": [{
            "id": "kinow/five",
            "owner": "kinow",
            "name": "five",
            "host": "ranma",
            "port": 43006,
            "tasks": [{
              "id": "kinow/five/prep",
              "name": "prep",
              "meta": {"title": "", "description": "", "URL": ""},
              "meanElapsedTime": 1.0,
              "namespace": ["root", "prep"],
              "proxies": []
            }, {
              "id": "kinow/five/foo",
              "name": "foo",
              "meta": {"title": "", "description": "", "URL": ""},
              "meanElapsedTime": 1.0,
              "namespace": ["root", "foo"],
              "proxies": [{"id": "kinow/five/20130808T1200Z/foo"}, {"id": "kinow/five/20130809T0000Z/foo"}, {"id": "kinow/five/20130809T1200Z/foo"}]
            }, {
              "id": "kinow/five/bar",
              "name": "bar",
              "meta": {"title": "", "description": "", "URL": ""},
              "meanElapsedTime": 1.0,
              "namespace": ["root", "bar"],
              "proxies": [{"id": "kinow/five/20130808T1200Z/bar"}, {"id": "kinow/five/20130809T0000Z/bar"}]
            }]
          }]
        }
      },
      {
        "data": {
          "workflows": [{
            "id": "kinow/five",
            "owner": "kinow",
            "name": "five",
            "host": "ranma",
            "port": 43006,
            "tasks": [{
              "id": "kinow/five/prep",
              "name": "prep",
              "meta": {"title": "", "description": "", "URL": ""},
              "meanElapsedTime": 1.0,
              "namespace": ["root", "prep"],
              "proxies": []
            }, {
              "id": "kinow/five/foo",
              "name": "foo",
              "meta": {"title": "", "description": "", "URL": ""},
              "meanElapsedTime": 1.0,
              "namespace": ["root", "foo"],
              "proxies": [{"id": "kinow/five/20130810T1200Z/foo"}, {"id": "kinow/five/20130809T1200Z/foo"}, {"id": "kinow/five/20130810T0000Z/foo"}]
            }, {
              "id": "kinow/five/bar",
              "name": "bar",
              "meta": {"title": "", "description": "", "URL": ""},
              "meanElapsedTime": 1.0,
              "namespace": ["root", "bar"],
              "proxies": [{"id": "kinow/five/20130810T0000Z/bar"}, {"id": "kinow/five/20130809T1200Z/bar"}]
            }]
          }]
        }
      },
      {
        "data": {
          "workflows": [{
            "id": "kinow/five",
            "owner": "kinow",
            "name": "five",
            "host": "ranma",
            "port": 43006,
            "tasks": [{
              "id": "kinow/five/prep",
              "name": "prep",
              "meta": {"title": "", "description": "", "URL": ""},
              "meanElapsedTime": 1.0,
              "namespace": ["root", "prep"],
              "proxies": []
            }, {
              "id": "kinow/five/foo",
              "name": "foo",
              "meta": {"title": "", "description": "", "URL": ""},
              "meanElapsedTime": 1.0,
              "namespace": ["root", "foo"],
              "proxies": [{"id": "kinow/five/20130810T1200Z/foo"}, {"id": "kinow/five/20130811T0000Z/foo"}]
            }, {
              "id": "kinow/five/bar",
              "name": "bar",
              "meta": {"title": "", "description": "", "URL": ""},
              "meanElapsedTime": 1.0,
              "namespace": ["root", "bar"],
              "proxies": [{"id": "kinow/five/20130810T1200Z/bar"}]
            }]
          }]
        }
      },
      {
        "data": {
          "workflows": [{
            "id": "kinow/five",
            "owner": "kinow",
            "name": "five",
            "host": "ranma",
            "port": 43006,
            "tasks": [{
              "id": "kinow/five/prep",
              "name": "prep",
              "meta": {"title": "", "description": "", "URL": ""},
              "meanElapsedTime": 1.0,
              "namespace": ["root", "prep"],
              "proxies": []
            }, {
              "id": "kinow/five/foo",
              "name": "foo",
              "meta": {"title": "", "description": "", "URL": ""},
              "meanElapsedTime": 1.0,
              "namespace": ["root", "foo"],
              "proxies": [{"id": "kinow/five/20130811T0000Z/foo"}, {"id": "kinow/five/20130811T1200Z/foo"}, {"id": "kinow/five/20130812T0000Z/foo"}]
            }, {
              "id": "kinow/five/bar",
              "name": "bar",
              "meta": {"title": "", "description": "", "URL": ""},
              "meanElapsedTime": 1.0,
              "namespace": ["root", "bar"],
              "proxies": [{"id": "kinow/five/20130811T0000Z/bar"}, {"id": "kinow/five/20130811T1200Z/bar"}]
            }]
          }]
        }
      },
      {
        "data": {
          "workflows": [{
            "id": "kinow/five",
            "owner": "kinow",
            "name": "five",
            "host": "ranma",
            "port": 43006,
            "tasks": [{
              "id": "kinow/five/prep",
              "name": "prep",
              "meta": {"title": "", "description": "", "URL": ""},
              "meanElapsedTime": 1.0,
              "namespace": ["root", "prep"],
              "proxies": []
            }, {
              "id": "kinow/five/foo",
              "name": "foo",
              "meta": {"title": "", "description": "", "URL": ""},
              "meanElapsedTime": 1.0,
              "namespace": ["root", "foo"],
              "proxies": [{"id": "kinow/five/20130812T1200Z/foo"}, {"id": "kinow/five/20130812T0000Z/foo"}]
            }, {
              "id": "kinow/five/bar",
              "name": "bar",
              "meta": {"title": "", "description": "", "URL": ""},
              "meanElapsedTime": 1.0,
              "namespace": ["root", "bar"],
              "proxies": [{"id": "kinow/five/20130812T1200Z/bar"}, {"id": "kinow/five/20130812T0000Z/bar"}]
            }]
          }]
        }
      }
    ];
    return store.dispatch('suites/setTasks', tasks);
  }
};
