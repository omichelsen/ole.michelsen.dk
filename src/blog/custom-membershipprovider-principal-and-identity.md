---
title: Custom MembershipProvider, Principal and Identity
description: Implementing a custom MembershipProvider, IPrincipal and IIdentity. How to cache the objects accross page requests and access the objects through a wrapper.
date: 2011-07-01
# tags: [".net", "c#", "security"]
---

Recently I ported a large website from ASP.NET Web Forms to the shining new ASP.NET MVC 3. During this process I also decided to implement “proper” MembershipProvider-based security instead of a simpler, custom HTTP module we were running.

As I started implementing my custom MembershipProvider, I became a bit confused, however, about the sheer number of classes you have to implement/override. I ended up spending quite a lot of time searching for help, so here I will attempt to give a “shortcut” overview of the structure of the MembershipProvider model and lessons learned.

<!-- more-->

![Overview of the data flow of the MembershipProvider model](/images/blog/custom-membershipprovider-principal-and-identity/MembershipProvider-Drawing-Pencil.jpg)

## Creating the backend MembershipProvider-stuff

### MembershipProvider

The MembershipProvider handles all CRUD operations you can do with your collection of users. It’s an interface between ASP.NET and your database, and you’ll have to implement the functions you want to use. But remember, if you don’t want to use a function like `UnlockUser(string)`, then just skip it and save yourself some time! It will only be called if _you_ do it from the code.

You can also extend your MembershipProvider with special features such as: `DeleteRange(object[] keys)` etc.

You can see a [sample implementation on MSDN](https://msdn.microsoft.com/en-us/library/6tc47t75.aspx), as well as a description of each of the [required members](https://msdn.microsoft.com/en-us/library/f1kyba5e.aspx).

### MembershipUser

This is the data class your MembershipProvider passes around, so you just need to piggyback any data you might need to transfer to/from your database. You can either create a couple of new properties, or just add a reference to your LINQ2SQL classes if you need to pass along an entire user record. Again, you don’t need to fill out the standard properties like “LastLockedOutDate” if you don’t call them in your code.

Here’s the [MSDN sample code](https://msdn.microsoft.com/en-us/library/ms366730.aspx).

### RoleProvider

Lastly you can also [create your own RoleProvider](https://www.codeproject.com/Articles/13032/Custom-MembershipProvider-and-RoleProvider-Impleme). This is only needed if you actually wish to use roles. If you are doing something very simple like: “is user admin or not?”, I would probably skip it and just add a bool field on the MembershipUser. But implementing it is not all that complicated, you just have to support roles as weakly typed strings like “Admin”, “Trusted” etc.

## Creating the “front end” stuff

The following classes represents the context and data of a logged in user. They are created and populated by all the backend stuff we just did. A little bit of “plumbing” is needed here, as you will have to map the fields in MembershipUser to the similar IIdentity. We are definitely not DRY.

### IPrincipal

IPrincipal represents the security context of your (authenticated) user and tells you if the user is authenticated or in a given role. `IsInRole(r)` is also called in use with PrincipalPermission attributes:

```csharp
[PrincipalPermission(SecurityAction.Demand, Role = "Administrators")]
static void DoAdminStuff()
{
    ...
}
```

If you wish to add new [home-built security attributes](https://msdn.microsoft.com/en-us/library/sw480ze8%28v=VS.100%29.aspx), this is where they should be implemented. If you don’t need roles, you don’t even need to implement this class, just use GenericPrincipal and stuff your custom Identity in there.

### IIdentity

The IIdentity holds information _about_ the user. As my MVC book (J. McCracken: Test Drive ASP.NET MVC) phrases it: _“The IIdentity is who you are. Your IPrincipal is what you have access to…”_. Here you should store the account information like first name, country, language etc. Some of this perhaps overlaps the intended use of Profiles, but if you want to skip the implementation and abstraction of yet _another_ class, you can probably justify putting it here.

### Profile

I’ve skipped using it: this interface is for settings that the user can manipulate (and I don’t allow my users to customize much). Examples could be selection of web site color, number of pages to display in a product list etc. The properties are actually coded into the web.config file?! I don’t know why, and I don’t think I care for it. But you do get the properties strongly typed and serialized. In a case of [LMGTFY](https://lmgtfy.com/), here’s [an article about custom Profiles](https://weblogs.asp.net/jgalloway/archive/2008/01/19/writing-a-custom-asp-net-profile-class.aspx).

## Actually using the MembershipProvider model

Drop a few lines into your web.config, and your website will load your new MembershipProvider as default, and then you can start using it:

```xml
<membership defaultProvider="CustomMembershipProvider">
    <providers>
    <clear/>
    <add name="CustomMembershipProvider" type="MyMembershipProvider"
        connectionStringName="ApplicationServices"
        applicationName="/" />
    </providers>
</membership>
```

### Signing in a user

Just make a form and run `Membership.ValidateUser(username, password)` which will call your new default MembershipProvider. If validation was successful call `FormsAuthentication.SetAuthCookie(username, remember)` and redirect to some happy place. Now your user is logged in, but then what happens on subsequent page loads?

### Application_AuthenticateRequest

The Application_AuthenticateRequest event in global.asax is hit every time your user is fetching something from your website, be that a web page or an image file. The system automatically reads the auth cookie, and validates that it can be decrypted and isn’t expired. This will then set `Request.IsAuthenticated` to true, and create a generic IPrincipal and IIdentity with the username stored in the cookie.

Now we can replace them with our own IPrincipal and IIdentity! [In global.asax we overwrite the generic objects](https://smehrozalam.wordpress.com/2009/01/01/using-customprincipal-with-forms-authentication-in-aspnet/), with our own versions that contains our extra data:

```csharp
protected void Application_AuthenticateRequest(object sender, EventArgs e)
{
    if (Request.IsAuthenticated)
    {
        string username = HttpContext.Current.User.Identity.Name;
        var identity = new MyIdentity(username, true);
        var principal = new MyPrincipal(identity, identity.Roles);
        HttpContext.Current.User = principal;
    }
}
```

In my implementation, the constructor in MyIdentity populates the object with data from the database by calling `Membership.GetUser(u)`. You just have to remember, that this is called for _each_ request – if you have 1 page with 10 images, it will get called 1+10 times! This is quite a lot of calls to your database. To remedy this you basically have two options:

1. Store the data in the cookie (not very secure, but perhaps ok for very small, non-sensitive values)
2. Cache the database object on your server between requests

If you want to cache the data, you might think that Session is the place for this. Wrong. You do not have access to the Session, so your only choice is HttpContext.Cache. This is global for all requests, so make sure you choose a key that is unique to each user:

```csharp
HttpContext.Current.Cache.Insert(
    uniqueCacheKey, userObject, null, DateTime.Now.AddMinutes(2),
    Cache.NoSlidingExpiration);
```

This will cache the user data for 2 min before updating it from the server again. Though if you lock out/delete the user, the server will not know for that period, so you have to consider the security implications.

_TIP:_ You can also completely skip setting your custom Principal and Identity whenever the requested file is not an ASP.NET file, as static files don’t have use for the extra user data.

### Reading our user data in a page

Now (finally) you have a user object with some important data you wish to access. This is done through User and User.Identity within the HttpContext of your pages. They have to be typecast every time, so I suggest you create a simple wrapper like this:

```csharp
public static class UserContext
{
    public static MyPrincipal User { return (MyPrincipal)User; }
    public static MyIdentity Identity { return (MyIdentity)User.Identity; }
}
```

I use this class for other user related functions, such as `GetIP()` etc. so it’s nice to have anyway.

## References

Below is a list of recommended resources for more detailed explanations and examples of each of the above mentioned interfaces and classes.

* Very thorough walkthrough: [ASP.NET Membership, Roles and Profile – 18 part series](http://www.4guysfromrolla.com/articles/120705-1.aspx)
* Documentation that IsAuthenticated = !Name.isEmpty (bottom of page): [MSDN, GenericIdentity Class](https://msdn.microsoft.com/en-us/library/system.security.principal.genericidentity.aspx)

And just to prove I’m not the only one who’s a bit confused over this ;-):

* [Stack Overflow: IIdentity or IPrincipal](https://stackoverflow.com/questions/1064271/asp-net-mvc-set-custom-iidentity-or-iprincipal)
* [Stack Overflow: Solving [Serializable()]](https://stackoverflow.com/questions/1884030/implementing-a-custom-identity-and-iprincipal-in-mvc)
* [Using custom attributes with IIdentity](https://stackoverflow.com/questions/3426558/accessing-custom-principal-within-a-custom-actionfilterattribute)
