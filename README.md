Red Hat IoT Precious Cargo Demo
================================
This is an example IoT demo showing a realtime updating dashboard of data streaming from an
IoT gateway device (based on Eclipse Kura) through the Eclipse Kapua.

It demonstrates realtime fleet telematics, package tracking, alerting, and a telemetry dashboard showing critical measurements of packages in transit,
including temperature, humidity, displacement, light levels, etc.

![Dashboard Screenshot](/../screenshots/screenshots/iot-dashboard.png?raw=true "Dashboard Screenshot")

Technologies used:

- [Eclipse Kapua](http://www.eclipse.org/kapua/)
- [AngularJS](http://angularjs.org)
- [Patternfly](http://patternfly.org)
- [JBoss Middleware](https://www.redhat.com/en/technologies/jboss-middleware) (EAP, JDG, and more to come)

Running on OpenShift
--------------------

The demo deploys as an Angular.js app running on a Node.js runtime, along with JBoss Data Grid and a Data Grid
proxy component that properly handles browser-based REST requests and relays to JBoss Data Grid via the Hotrod
protocol.

Eclipse Kapua is also deployed and acts as the IoT cloud management layer.

Follow these steps to build and run the demo:

1. Install and have access to an [OpenShift Container Platform](https://www.openshift.com/container-platform/) 3.4 or later or [OpenShift Origin](https://www.openshift.org/) 1.4 or later. You must be able to use the `oc` command line tool.

2. Clone this repo
```
git clone https://github.com/redhat-iot/summit2017
```

3. Issue the following commands to create a new OpenShift project and deploy the demo components:
```
oc new-project myproject
oc policy add-role-to-user view system:serviceaccount:$(oc project -q):default -n $(oc project -q)
oc process -f openshift-template.yaml | oc create -f -
```

You can monitor the build with `oc status` or watch the deployments using the OpenShift web console.

Once everything is up and running, you can access the demo using the URL of the `dashboard` route,
for example `http://dashboard-myproject.domain`

Options
-------
The template contains various optional parameters that can be specified when deploying the components:

```
oc process -f openshift-template.yaml OPTION1=value OPTION2=value | oc create -f -
```

* `MAVEN_MIRROR_URL` - To speed up Maven-based builds
* `GOOGLE_MAPS_API_KEY` - for your personal Google Maps API key
* `GIT_URI` and `GIT_REF` - overrides where source code is pulled (e.g. using your own personal fork)
* `IMAGE_VERSION` - Docker image tag to use when pulling Kapua (default `latest`)
* `DOCKER_ACCOUNT` - Name of docker account to use when pulling Kapua (default: `redhatiot`)

There are other options in the template that can be overridden if you know what you are doing!