Intel Macs have always been able to run Windows in parallel, and it's is even officially supported by Apple by the grace of Boot Camp, which makes a partition and boot disc for you with the necessary drivers.

If you have an older Mac, you might have some trouble using Boot Camp in the newer versions of MacOS, Yosemite and onwards. For some reason Apple has crippled Boot Camp to now allow making a bootable USB stick with Windows from an image. Since the optical SuperDrive in my Mac recently quit on me (and because USB is much better), this has lead me around the murky corners of message boards in search for a solution, which I now share with you all here.

<!-- more-->

Of course be aware that this is not an offical Apple support guide. Use at your own discretion and do backups etc, etc.

## Make a bootable USB stick

First you need a USB stick of __8 GB__ or more. Then you need to start Boot Camp Assistant:

<!-- Insert image -->

The first menu point should be "Create  a Windows 7 or later version install disk". If your screen _doesn't_ look like this, you have to do some ninja stuff. To convince Boot Camp Assistant that you are grown enough to use ISO images, follow these steps:

- Go to Applications > Utilities > Boot Camp Assistant and right click to Show Package Contents
- Edit the file `Info.plist` with XCode
  - Under the key `USBBootSupportedModels` add your Mac model. You can find the model name in System Report (the first part of "Boot ROM Version") e.g. "MBP81".

(source)[http://forums.atomicmpc.com.au/index.php/topic/51873-enable-create-a-windows-usb-install-disk-in-bootcamp-assistant-for-mountain-lion/]

## Can't use Boot Camp partition

Now you have come all this way, but it might not be over just yet, if you are met by this pesky error message:

> Windows cannot be installed to this disk. The selected disk has an MBR partition table. On EFI systems, Windows can only be installed GPT disks.

1. Use Bootcamp to create EFI-bootable USB drive with the Windows ISO file.
2. Uninstall any previous installations of Bootcamp, restoring the partition table to one big Apple partitition.
3. Use Disk Utility in OS X to create empty space of the size I want my Windows partitition to be.
4. Reboot the machine to the USB drive.
5. Using the Windows Advanced partition options, create a new partition in the empty space. Windows will also create a small (128 MB or so) partition alongside it.
6. Format the new partition using the Windows Advanced partition options.
7. Proceed with installation onto that NTFS partition as before.
8. Windows 8 installs!
9. After installation, run the setup.exe inside the Bootcamp folder on the USB drive. This will install all the necessary device drivers.

(source)[https://discussions.apple.com/thread/5474614?start=15]

## Final tip: fan control

If you have installed an SSD in your old Mac, the heat sensors in the harddrive will no longer be what the system expects, and thus the fans are spinning at max to protect the hardware. Because it's nice to retain your hearing, you can install the wonderful [Macs Fan Control](https://www.dropbox.com/s/zdc40r7zch4mq4m/Screenshot%202015-06-24%2009.47.07.png?dl=0) app and set system to watch for another sensor, e.g. the S.M.A.R.T one in your SSD.
