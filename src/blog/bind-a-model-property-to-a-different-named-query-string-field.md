---
title: Bind a model property to a different named query string field
description: How to bind a model property to a different named query string field with a custom alias attribute and model binder in MVC3.
date: 2012-03-21
# tags: [".net", "c#", "linq", "mvc"]
---

The ASP MVC model binder automatically maps a query string to an object model by matching each field to a property name. This is very handy, but things can quickly get quite verbose:

`http://domain/products?CategoryId=42&SortBy=Name&SortAscending=True`

Ideally I want to give my class properties an abbreviated alias for use in the query string. Thus, I should be able to use the following URI instead, and still have the input values mapped automatically to the model:

`http://domain/products?c=42&s=Name&asc=True`

Fortunately there is an elegant solution, which I must admit I’m blatantly writing up based on an [answer given on Stack Overflow](https://stackoverflow.com/questions/4316301/asp-net-mvc-2-bind-a-models-property-to-a-different-named-value#answer-4316327). My solution does however fix a bug to make multiple aliases on a single property work as intended.

<!-- more-->

So let’s get cracking. If you want to skip ahead, you can [download the project here](/files/QueryStringAlias.zip). We create a custom attribute which will hold the alias name:

```csharp
[AttributeUsage(AttributeTargets.Property, AllowMultiple = true)]
public class BindAliasAttribute : Attribute
{
    public BindAliasAttribute(string alias)
    {
        Alias = alias;
    }

    public string Alias { get; private set; }

    public override object TypeId
    {
        get { return Alias; }
    }

    internal sealed class AliasedPropertyDescriptor : PropertyDescriptor
    {
        public PropertyDescriptor Inner { get; private set; }

        public AliasedPropertyDescriptor(string alias, PropertyDescriptor inner)
            : base(alias, null)
        {
            Inner = inner;
        }

        public override bool CanResetValue(object component)
        {
            return Inner.CanResetValue(component);
        }

        public override Type ComponentType
        {
            get { return Inner.ComponentType; }
        }

        public override object GetValue(object component)
        {
            return Inner.GetValue(component);
        }

        public override bool IsReadOnly
        {
            get { return Inner.IsReadOnly; }
        }

        public override Type PropertyType
        {
            get { return Inner.PropertyType; }
        }

        public override void ResetValue(object component)
        {
            Inner.ResetValue(component);
        }

        public override void SetValue(object component, object value)
        {
            Inner.SetValue(component, value);
        }

        public override bool ShouldSerializeValue(object component)
        {
            return Inner.ShouldSerializeValue(component);
        }
    }
}
```

This was quite a mouthful, but most of it is straightforward boilerplate. By implementing a PropertyDescriptor, we can register the property with the alias name, but still use the default model binding, type validation etc.

We have marked our attribute with AllowMultiple, but by default the MemberDescriptor base class will see all BindAliasAttributes as being of identical type and [filter them as duplicates](http://social.msdn.microsoft.com/Forums/en-US/winforms/thread/e6bb4146-eb1a-4c1b-a5b1-f3528d8a7864/) (FilterAttributesIfNeeded). To avoid this we must implement the [TypeId property](http://msdn.microsoft.com/en-us/library/system.attribute.typeid.aspx), and make sure it returns a unique value for each attribute. The easiest is just to return the alias name.

Finally we have to handle our BindAliasAttribute using a custom model binder:

```csharp
public class AliasModelBinder : DefaultModelBinder
{
    protected override PropertyDescriptorCollection GetModelProperties(
        ControllerContext controllerContext,
        ModelBindingContext bindingContext
    )
    {
        var toReturn = base.GetModelProperties(controllerContext, bindingContext);

        var additional = new List();

        foreach (var p in
            this.GetTypeDescriptor(controllerContext, bindingContext)
            .GetProperties().Cast())
        {
            foreach (var attr in p.Attributes.OfType())
            {
                additional.Add(new BindAliasAttribute.AliasedPropertyDescriptor(attr.Alias, p));

                if (bindingContext.PropertyMetadata.ContainsKey(p.Name))
                    bindingContext.PropertyMetadata.Add(attr.Alias,
                            bindingContext.PropertyMetadata[p.Name]);
            }
        }

        return new PropertyDescriptorCollection
            (toReturn.Cast().Concat(additional).ToArray());
    }
}
```

Now we can create our new model and mark the properties with the BindAliasAttribute and make sure it’s handled by our custom model provider. You can register the AliasModelBinder directly on the model as shown here, or register it in Global.asax (shown in [attached project](/files/QueryStringAlias.zip)).

```csharp
[ModelBinder(typeof(AliasModelBinder))]
public class ExampleAliasModel
{
    [BindAlias("c")]
    public int CategoryId { get; set; }

    [BindAlias("s")]
    [BindAlias("sort")]
    public string SortBy { get; set; }

    [BindAlias("asc")]
    public bool SortAscending { get; set; }
}
```

And that’s it! We can now use either the alias or the real name for each property as we see fit. In the following example I have created a small form, which creates a query string using the alias names and displays the model after binding:

```csharp
public ActionResult Index(ExampleAliasModel model)
{
    return View(model);
}
```

![BindAliasAttribute Example](/images/blog/bind-a-model-property-to-a-different-named-query-string-field/BindAliasAttribute-Example.png)

Notice that this solution only works when binding. If you use the built-in templates like DisplayFor and EditorFor, MVC will output the normal property name and not the alias(es).
