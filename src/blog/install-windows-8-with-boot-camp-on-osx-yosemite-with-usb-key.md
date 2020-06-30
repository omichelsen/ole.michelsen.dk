---
title: Install Windows 8 with Boot Camp on Yosemite with USB key
description: How to install Windows 8 or 8.1 on MacOS X Yosemite with Boot Camp and a bootable USB key.
date: 2015-06-24
dateModified: 2017-01-07
tags:
  - blog
  - archive
# tags: ["macos", "windows"]
---

Intel Macs have always been able to run Windows in parallel, and it's is even officially supported by Apple by the grace of Boot Camp, which makes a partition and boot disc for you with the necessary drivers.

If you have an older Mac (2010-2012), you might have some trouble using Boot Camp in MacOS X Yosemite. For some reason Apple does not allow Macs with a SuperDrive to make a bootable USB stick with Windows from an image. Since the optical SuperDrive in my Mac recently quit on me (and because USB is much better), this has lead me around the murky corners of message boards in search for a solution, which I now share with you here.

<!-- more-->

Of course beware that this is not an offical Apple support guide. Use at your own discretion and do backups etc.

__Update 2017-01-07__: Added instructions how to disable SIP on macOS El Capitan and later.

## Make a bootable USB flash drive

First you need a USB flash drive of __8 GB__ or more. Then you need to start Boot Camp Assistant:

![Boot Camp Assistant should give you the option to create a Windows install USB flash drive from an ISO image, by presenting you with the option “Create a Windows 7 or later version install disk”.](/images/blog/install-windows-8-with-boot-camp-on-osx-yosemite-with-usb-key/boot-camp-assistant.png)

The first menu point should be “Create a Windows 7 or later version install disk”. If your screen _doesn't_ look like this, you have to do some ninja stuff. To convince Boot Camp Assistant that you are grown enough to use ISO images, follow these steps:

1. Go to Applications > Utilities > Boot Camp Assistant and right click to Show Package Contents
2. Add Read & Write access to Administrators on the folder `Contents` and the file `Info.plist`
3. Edit the file `Info.plist` with Xcode
4. Delete the `Pre` part from the key `USBBootSupportedModels` and add your Mac model

![Add your computer model to the approved list of USB boot supported models.](/images/blog/install-windows-8-with-boot-camp-on-osx-yosemite-with-usb-key/info-plist.png)

To see your model version open  > About This Mac > System Report > Model Identifier e.g. "MacBookPro6,2".

![Look up the 'Model Identifier' entry in System Report to find your Mac model version.](/images/blog/install-windows-8-with-boot-camp-on-osx-yosemite-with-usb-key/system-report.png)

Finally you have to codesign Boot Camp Assistant or it will crash on run. Open the terminal and run this command:

```bash
sudo codesign -fs - /Applications/Utilities/Boot\ Camp\ Assistant.app
```

You might be asked to download a developer tool from Apple. After installation open a new Terminal window and run the command again.

Start Boot Camp Assistant again, and it should look like the screenshot. Now just go through the steps, point it to your Windows installation ISO, and create a bootable flash drive.

<!--
(source 1) http://apple.stackexchange.com/questions/168808/install-windows-7-with-bootcamp-on-os-x-yosemite-with-usb-key
(source 2) http://forums.atomicmpc.com.au/index.php/topic/51873-enable-create-a-windows-usb-install-disk-in-bootcamp-assistant-for-mountain-lion/
-->

## Installing Windows

Restart your Mac and hold down the ⌥ (option) key. You should see some boot options. Select "EFI Boot" and you should boot into the Windows installation.

When you have entered the license key and clicked "next" a half dozen times, you are presented with a list of partitions, one of them being your newly created Boot Camp (usually partition 4).
If selecting this as install target works for you: great! Take it home. If this _doesn't_ work, and you get a GPT disk error, read on …

### Can't use Boot Camp partition

You have come all this way, only to be met by this pesky error message:

> Windows cannot be installed to this disk. The selected disk has an MBR partition table. On EFI systems, Windows can only be installed GPT disks.

But don't worry, there is a fix:

1. Remove any Boot Camp partitions, restoring the partition table to one big Apple partitition
2. Use Disk Utility in OS X to create empty space of the size you want the Windows partitition to be (don't create a partition)
3. Restart the Mac to the USB drive
4. Using the Windows Advanced partition options, create a new partition in the empty space
5. Proceed with installation onto the new partition
6. Windows 8 installs!

It seems that Boot Camp will mess up the partition table, but as long as you create the new partition yourself, all is well in the world.

<!--
(source) https://discussions.apple.com/thread/5474614?start=15
-->

## Final tip: fan control

If you have installed an SSD in your old Mac, the heat sensors in the harddrive will no longer be what the system expects, and thus the fans are spinning at max to protect the hardware. Because it's nice to retain your hearing, you can install the wonderful [Macs Fan Control](http://www.crystalidea.com/macs-fan-control) app and set the system to watch for another sensor, e.g. the S.M.A.R.T one in your SSD.

## macOS El Capitan and Sierra

El Capitan added a new security feature called System Integrity Protection (SIP), that protects files from being modified, even by a root account. To modify `Info.plist` you will have to disable SIP using the following steps:

1. Reboot your Mac into Recovery Mode by restarting your computer and holding down <kbd>CMD</kbd>+<kbd>R</kbd> until the Apple logo appears on your screen.
1. Click Utilities > Terminal.
1. In the Terminal window, type in `csrutil disable` and press Enter.
1. Restart your Mac.

You can reenable SIP by repeating these steps and running `csrutil enable` in the Terminal instead.