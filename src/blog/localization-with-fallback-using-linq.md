---
title: Localization with fallback using LINQ
description: How to get localization in MVC with fallback using a single LINQ statement, translated texts will be selected if available or fallback to a default.
date: 2011-08-17
# tags: [".net", "c#", "l18i", "linq", "mvc"]
---

So you need to support multiple languages in your website, and you need the system to fallback to a default language if no translation is available. Fortunately LINQ is here to help and can do it all within a single SQL statement.

Since localization is a basic need for all international applications, I have made a simple structure, which can be applied in situations where an entity is required to have localizable values.

<!-- more-->

I have created a [sample project](#projectattachment) in ASP.NET MVC based on an example Article object. What you need is a two-table database layout for the “base” article entries and one table for the translations. I’ll go through the data structure and how the articles easily can be shown with LINQ handling localization.

## Data structure

The basic idea is to have the general settings in the primary Articles table, and the values that need translation in the ArticleTranslations table.

![Entity model of the Article database tables](/images/blog/localization-with-fallback-using-linq/Model.png "Database Entity Model")

## View model

Before we get the data, we need to structure it a bit for MVC. This view model class will contain the Article entry, as well as a Translation:

```csharp
public class ArticleViewModel
{
    public Article Article { get; set; }
    public ArticleTranslation Translation { get; set; }
}
```

## Controller

Now we want to display a list of Articles. Let’s say we want to display them in Danish, and if that is not available, we will display them in English. With LINQ we can achieve this with the following statement:

```csharp
public ActionResult Index()
{
    string languageSelected = "da",
            languageFallback = "en";

    var model = from a in Articles
                join t in Translations on
                    new { a.ArticleId, LanguageId = languageSelected } equals
                    new { t.ArticleId, t.LanguageId }
                    into LanguageSelected
                join t in Translations on
                    new { a.ArticleId, LanguageId = languageFallback } equals
                    new { t.ArticleId, t.LanguageId }
                    into LanguageFallback
                from selected in LanguageSelected.DefaultIfEmpty()
                from fallback in LanguageFallback.DefaultIfEmpty()
                orderby a.PubDate
                select new ArticleViewModel()
                {
                    Article = a,
                    Translation = selected ?? fallback,
                };

    return View(model.ToList());
}
```

If this seems complicated, don’t fret. What happens is that we select the base Articles, and then (in the native tongue of SQL) `LEFT JOIN` the ArticleTranslations table two times, for the primary and fallback language respectively. Then, finally, we can choose between these two translations using the `??` null-coalescing operator. If the translation “selected” is not available (null), then “fallback” is used. Nice and terse!

## View

To put it to the test, I’ve added test data for two articles, one with both an English and Danish translation, and one with only English. Let’s display it to check that we’ve gotten it right:

```csharp
@foreach (var m in Model)
{
    <article>
        <h2>@Html.DisplayFor(x => m.Translation.Title)</h2>
        <time pubdate="pubdate">@Html.DisplayFor(x => m.Article.PubDate)</time>
        <p>@Html.DisplayFor(x => m.Translation.Body)</p>
    </article>
}
```

And as expected we see our two Articles, the first with its Danish translation, and the second with the English fallback:

![Output of our Article view](/images/blog/localization-with-fallback-using-linq/Output.png)

But don’t take my word for it – try it out for yourself in the attached VS project. Happy coding! :-)

> <a name="projectattachment"></a>[Download VS project](/files/LinqResourceFallback.zip)
