Running scripts on your computer is great. Running them automatically is even greater.

<!-- more-->

## Disable mail alerts

So after you've set up your scripts and everything is honky dory, you might notice that the Terminal suddenly have started sending you e-mails.

    <insert illustration>

If being pen pals with your Terminal isn't your thing, you can disable this behaviour by inserting this line at the very top of your crontab file:

    MAILTO=""

Presto. Now your jobs will run silent.
