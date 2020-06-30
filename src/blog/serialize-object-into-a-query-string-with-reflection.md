---
title: Serialize object into a query string with Reflection
description: Serialize any object in C# to a query string with the .ToQueryString() extension method. Supports primitives, strings, arrays and collections.
date: 2012-09-13
# tags: [".net", "c#", "linq", "mvc"]
---

When you are coding modern web applications against websites and web services, you often have to serialize a lot of data and pass it off to some URI. This could be when calling up a product page with some preset settings for sorting, or requesting data from a web service such as Google Places.

So you have an object with all the request data that you need to transfer, but now you have to convert this into a query string. There are a lot of ways to do this, but often it becomes a rather manual task concatenating all the properties one by one. Wouldn’t it be easier if you could somehow automatically transform all the properties of your class into a query string?

The good news is, that by using C# reflection and extension methods, you can create a simple solution, which will be extremely easy to use and work well for most types of (POCO) classes.

<!-- more-->

## The Code

Let’s not beat around the bush, so I’ll serve the solution up front, and then I’ll step through and explain each section afterwards.

```csharp
public static class UrlHelpers
{
    public static string ToQueryString(this object request, string separator = ",")
    {
        if (request == null)
            throw new ArgumentNullException("request");

        // Get all properties on the object
        var properties = request.GetType().GetProperties()
            .Where(x => x.CanRead)
            .Where(x => x.GetValue(request, null) != null)
            .ToDictionary(x => x.Name, x => x.GetValue(request, null));

        // Get names for all IEnumerable properties (excl. string)
        var propertyNames = properties
            .Where(x => !(x.Value is string) && x.Value is IEnumerable)
            .Select(x => x.Key)
            .ToList();

        // Concat all IEnumerable properties into a comma separated string
        foreach (var key in propertyNames)
        {
            var valueType = properties[key].GetType();
            var valueElemType = valueType.IsGenericType
                                    ? valueType.GetGenericArguments()[0]
                                    : valueType.GetElementType();
            if (valueElemType.IsPrimitive || valueElemType == typeof (string))
            {
                var enumerable = properties[key] as IEnumerable;
                properties[key] = string.Join(separator, enumerable.Cast<object>());
            }
        }

        // Concat all key/value pairs into a string separated by ampersand
        return string.Join("&", properties
            .Select(x => string.Concat(
                Uri.EscapeDataString(x.Key), "=",
                Uri.EscapeDataString(x.Value.ToString()))));
    }
}
```

## What does it do?

This extension method allows us to call .ToQueryString() on all objects, and uses reflection to read the properties of that object, which are then serialized and encoded into a fully qualified query string, which we can append to any URI.

The following part looks for all object properties that have a publicly accessible getter, and where the value is not null.

```csharp
// Get all properties on the object
var properties = request.GetType().GetProperties()
    .Where(x => x.CanRead)
    .Where(x => x.GetValue(request, null) != null)
    .ToDictionary(x => x.Name, x => x.GetValue(request, null));
```

This works well for most simple types, like int, decimal, char and string, but arrays and collections needs special attention to be properly serialized. Therefore we pull out a list of all properties that implement the IEnumerable interface. This is both Array, List, Dictionary etc. but also string, which is actually a list of chars, and therefore needs to be excluded.

```csharp
// Get names for all IEnumerable properties (excl. string)
var propertyNames = properties
    .Where(x => !(x.Value is string) && x.Value is IEnumerable)
    .Select(x => x.Key)
    .ToList();
```

We want to convert the collections into a string, so we loop through the IEnumerable properties, and check if they contain primitives or strings (we won’t handle i.e. lists of classes). A bit of special care must be given when determining the contained type, whether we are dealing with an array or a generic collection, and then we concatenate all the values with a custom separator.

```csharp
// Concat all IEnumerable properties into a comma separated string
foreach (var key in propertyNames)
{
    var valueType = properties[key].GetType();
    var valueElemType = valueType.IsGenericType
                            ? valueType.GetGenericArguments()[0]
                            : valueType.GetElementType();
    if (valueElemType.IsPrimitive || valueElemType == typeof (string))
    {
        var enumerable = properties[key] as IEnumerable;
        properties[key] = string.Join(separator, enumerable.Cast<object>());
    }
}
```

Finally we can just concatenate all our property names and values, URI encode them and separate them by an ampersand into a query string. The following example shows how a simple class is successfully converted into a query string:

```csharp
var example = new
{
    Category = "Shoes",
    NumberOfItems = 20,
    Sizes = new[] { 40, 41, 42 }
};

string querystring = example.ToQueryString();
// Output: Category=Shoes&NumberOfItems=20&Sizes=40%2C41%2C42
```

The return value of .ToQueryString() can then be added to a URI, to form a request to an imaginary product page for a shoe shop:

> http://shoes4us.com/products?Category=Shoes&NumberOfItems=20&Sizes=40%2C41%2C42

Hopefully this has shown how powerful C# reflection can be. We can pull out a lot of information about anonymous objects and create a general extension method which can be used on all our classes without special interfaces or inheritance. Also it is very easy to extend this implementation to handle custom serialization of more complex class types, take into account special property attributes etc.

This implementation shown here only support classes with properties that are primitives, strings and collections of the former. Complex nested classes are not easily converted to the key/value format of a query string and are not supported.

You can find my [Visual Studio solution for .ToQueryString() on CodePlex](https://toquerystring.codeplex.com/) along with some small examples and unit tests. I look forward to your comments and suggestions – happy coding!
