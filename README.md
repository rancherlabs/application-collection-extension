# SUSE Application Collection

![SUSE Application Collection](/assets/SUSE_ApplicationCollection_pos-green-horizontal.svg)

This extension will help you installing, managing and uninstalling workloads from [SUSE Application Collection](https://apps.rancher.io).

This project is composed of:

* The [ui](./ui): a [React](https://es.react.dev/) app that handles the main user interation.
* A [backend](./backend): an [express](https://expressjs.com/) server that extends the features of the frontend.

## Get started

In this section you will learn how to start playing with the extension.

### Docker Desktop

To install the extension:

1. Open Docker Desktop.
1. From the Docker Desktop dashboard, select the *Extensions* tab. The Extensions Marketplace opens on the *Browse* tab.
1. Browse for "SUSE Application Collection".
1. Select *Install*.

From here, you can select *Open* to access the extension. The extension also appears in the left-hand menu and in the *Manage* tab.

If this doesn't work, or the extension doesn't show up in the browser, you can also try running:

```sh
docker extension install rancher/application-collection-extension
```

Useful additional links:

* [Working with marketplace extensions](https://docs.docker.com/extensions/marketplace/)
* [Working with non-marketplace extensions](https://docs.docker.com/extensions/non-marketplace/)

### Rancher Desktop

To install the extension:

1. Open Rancher Desktop.
1. From the Rancher Desktop dashboard, select the *Extensions* tab. The Extensions Catalog opens on the *Catalog* tab.
1. Search for "SUSE Application Collection".
1. Select *Install*.

Once installed, the extension will appear in the left-hand menu and in the *Installed* tab.

If this doesn't work, or the extension doesn't show up in the browser, you can also try running:

```sh
rdctl extension install rancher/application-collection-extension
```

Useful additional links:

* [Rancher Desktop extensions](https://docs.rancherdesktop.io/ui/extensions/)
* [Installing and uninstalling Rancher Desktop extensions](https://docs.rancherdesktop.io/how-to-guides/installing-uninstalling-extensions)

## Debug with Docker Desktop

Docker Desktop lets you locally build, update and debug running extensions with nice features like hot reloading and Chrome development tools.

If you work with Docker Desktop, these are the main guidelines you should follow to build and debug any extension:

* [How to build a Docker extension](https://docs.docker.com/extensions/extensions-sdk/quickstart/#step-two-build-the-extension)
* [Test and debug](https://docs.docker.com/extensions/extensions-sdk/dev/test-debug/)

## Debug with Rancher Desktop

Rancher Desktop also lets you build, update and debug running extensions with the development tools of any browser.
 However, note that here there's no support for hot reloading yet.

If you work with Rancher Desktop, these are the key guidelines to build and debug any extension:

* [Installing and uninstalling Rancher Desktop Extensions](https://docs.rancherdesktop.io/how-to-guides/installing-uninstalling-extensions)
* [Remote debugging an extension](https://github.com/rancher-sandbox/rancher-desktop/#remote-debugging-an-extension)
